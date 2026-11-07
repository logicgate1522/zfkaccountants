"""The production seed is a one-time import, not a recurring reset."""

import json
import tempfile
from pathlib import Path

from django.core.management import call_command
from django.conf import settings
from django.test import TestCase, override_settings

from .models import BlogPost, ComponentData, ContentPage, SiteSettings, TrackingScan
from .tracking_plan import get_plan


MANIFEST = {
    "version": 2,
    "settings": {
        "organization": {"name": "Example Accountants"},
        "seoDefaults": {"siteUrl": "http://localhost:3000", "locale": "en_GB"},
        "collections": {"services": {
            "label": "Service", "plural": "Services", "hostKind": "content",
            "indexPath": "services", "pathPrefix": "services", "pageType": "service",
        }},
    },
    "form": {"fields": [
        {"name": "email", "type": "email", "label": "Email"},
        {"name": "services", "type": "checkboxes", "label": "Services", "options": ["Monthly payroll"]},
    ]},
    "pageSeo": {"faqs": {"faqItems": [{"q": "How do I switch accountants?", "a": "Ask us."}]}},
    "blog": [{"slug": "guide", "title": "A guide", "status": "published", "content": {"sections": []}}],
    "pages": [{"path": "services/payroll", "title": "Monthly payroll", "page_type": "service",
               "sections": [{"section_type": "rich_text", "content": {"body": "Payroll."}}]}],
    "scan": {"pages": [
        {"path": "/", "ctas": [{"label": "Book now", "target": "/contact", "block": "home-hero"}]},
        {"path": "/contact", "forms": [{"name": "quote"}]},
    ]},
}


@override_settings(FRONTEND_URL="https://example.test")
class SiteSeedTests(TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        self.manifest = Path(self.directory.name) / "seed.json"
        self.manifest.write_text(json.dumps(MANIFEST), encoding="utf-8")

    def seed(self):
        call_command("seed_site_defaults", manifest=self.manifest, verbosity=0)

    def test_installs_persistent_defaults_and_approved_conversions(self):
        self.seed()
        site = SiteSettings.objects.get(pk=1).data
        self.assertEqual(site["seoDefaults"]["siteUrl"], "https://example.test")
        self.assertEqual(site["_deployment_seed_version"], 2)
        self.assertEqual(ComponentData.objects.get(name="form-quote").data, MANIFEST["form"])
        self.assertTrue(ContentPage.objects.get(path="services/payroll").sections.exists())
        self.assertTrue(TrackingScan.objects.filter(pk=1).exists())
        self.assertEqual(get_plan()["status"], "approved")
        self.assertIn("lead", {c["id"] for c in get_plan()["conversions"]})

    def test_second_release_keeps_admin_edits_and_deletions(self):
        self.seed()
        site = SiteSettings.objects.get(pk=1)
        site.data["organization"]["name"] = "Changed by admin"
        site.save()
        form = ComponentData.objects.get(name="form-quote")
        form.data = {"fields": [{"name": "custom", "type": "text"}]}
        form.save()
        BlogPost.objects.filter(slug="guide").delete()
        first_plan = get_plan()

        self.seed()

        self.assertEqual(SiteSettings.objects.get(pk=1).data["organization"]["name"], "Changed by admin")
        self.assertEqual(ComponentData.objects.get(name="form-quote").data, form.data)
        self.assertFalse(BlogPost.objects.filter(slug="guide").exists())
        self.assertEqual(get_plan(), first_plan)

    def test_existing_settings_are_filled_without_replacing_explicit_blank(self):
        SiteSettings.objects.create(pk=1, data={"organization": {"name": "Existing"}, "contact": {"email": ""}})
        self.seed()
        data = SiteSettings.objects.get(pk=1).data
        self.assertEqual(data["organization"]["name"], "Existing")
        self.assertEqual(data["contact"]["email"], "")
        self.assertEqual(data["seoDefaults"]["siteUrl"], "https://example.test")

    def test_empty_form_placeholder_is_filled_before_building_lead_conversions(self):
        ComponentData.objects.create(name="form-quote", data={})
        self.seed()
        self.assertEqual(ComponentData.objects.get(name="form-quote").data, MANIFEST["form"])
        self.assertTrue(any(c["trigger"]["event"] == "generate_lead" for c in get_plan()["conversions"]))

    def test_repairs_only_the_original_seeded_plan_after_empty_form_bug(self):
        self.seed()
        form = ComponentData.objects.get(name="form-quote")
        form.data = {}
        form.save()
        site = SiteSettings.objects.get(pk=1)
        site.data["_deployment_seed_version"] = 1
        old = site.data["analytics"]["plan"]
        old["conversions"] = [c for c in old["conversions"] if c["trigger"]["event"] != "generate_lead"]
        old["version"] = 1
        site.save()

        self.seed()

        self.assertEqual(SiteSettings.objects.get(pk=1).data["_deployment_seed_version"], 2)
        self.assertEqual(ComponentData.objects.get(name="form-quote").data, MANIFEST["form"])
        self.assertEqual(get_plan()["version"], 2)
        self.assertTrue(any(c["trigger"]["event"] == "generate_lead" for c in get_plan()["conversions"]))

    def test_code_owned_form_fields_are_synced_every_release(self):
        self.seed()
        row = ComponentData.objects.get(name="form-quote")
        row.data = {**row.data, "submitText": "Send", "fields": [{"name": "preferred_date", "type": "date", "required": True}]}
        row.draft_data = {"fields": [{"name": "old"}], "submitText": "Draft send"}
        row.save()

        # Without the flag a later release keeps the admin's form as it is.
        self.seed()
        self.assertEqual(ComponentData.objects.get(name="form-quote").data["fields"][0]["name"], "preferred_date")

        self.manifest.write_text(json.dumps({**MANIFEST, "formFieldsFromCode": True}), encoding="utf-8")
        self.seed()
        row = ComponentData.objects.get(name="form-quote")
        self.assertEqual(row.data["fields"], MANIFEST["form"]["fields"])
        self.assertEqual(row.draft_data["fields"], MANIFEST["form"]["fields"])
        # Only the field list is code-owned; the admin's other copy stays.
        self.assertEqual(row.data["submitText"], "Send")
        self.assertEqual(row.draft_data["submitText"], "Draft send")

    def test_code_owned_fields_validate_submissions(self):
        self.manifest.write_text(json.dumps({**MANIFEST, "formFieldsFromCode": True}), encoding="utf-8")
        self.seed()
        row = ComponentData.objects.get(name="form-quote")
        row.data = {**row.data, "fields": row.data["fields"] + [{"name": "preferred_date", "type": "date", "required": True}]}
        row.save()
        self.seed()
        response = self.client.post("/api/forms/quote/submit/", {"email": "a@example.com", "services": ["Monthly payroll"]}, content_type="application/json")
        self.assertEqual(response.status_code, 201, response.content)

    def test_full_export_installs_the_sites_baseline_plan(self):
        manifest = Path(settings.BASE_DIR) / "api" / "site_seed.json"
        if not manifest.is_file():
            self.skipTest("CI generates the full frontend seed manifest before running tests")
        ComponentData.objects.create(name="form-quote", data={}, draft_data={"fields": [{"name": "draft-only"}]}, status="draft")
        call_command("seed_site_defaults", manifest=manifest, verbosity=0)
        self.assertEqual(BlogPost.objects.count(), 6)
        self.assertEqual(ContentPage.objects.count(), 5)
        # Exactly the site's own form definition, whatever fields it has.
        exported = json.loads(manifest.read_text(encoding="utf-8"))["form"]
        self.assertEqual(ComponentData.objects.get(name="form-quote").data["fields"], exported["fields"])
        draft_fields = ComponentData.objects.get(name="form-quote").draft_data["fields"]
        if json.loads(manifest.read_text(encoding="utf-8")).get("formFieldsFromCode"):
            # The site owns its form fields in code, drafts included.
            self.assertEqual(draft_fields, exported["fields"])
        else:
            self.assertEqual(draft_fields[0]["name"], "draft-only")
        self.assertEqual(get_plan()["status"], "approved")
        self.assertEqual(len(get_plan()["conversions"]), 16)
