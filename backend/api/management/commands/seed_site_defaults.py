"""Install the frontend's baseline CMS content once, after migrations.

The JSON manifest is generated from frontend/scripts/seed-cms.mjs in CI before
building the backend image. A version marker in SiteSettings makes subsequent
releases no-ops, so an administrator may edit or remove seeded content later.
"""

import json
from copy import deepcopy
from pathlib import Path

from django.conf import settings
from django.contrib.contenttypes.models import ContentType
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils import timezone
from django.utils.dateparse import parse_datetime

from api.models import (
    BlogPost,
    ComponentData,
    ContentPage,
    DynamicSection,
    PageSEO,
    SectionMedia,
    SiteSettings,
    TrackingScan,
)
from api.site_facts import clean_scan, get_facts
from api.tracking_library import build_plan
from api.tracking_plan import get_plan, save_plan, validate


SEED_MARKER = "_deployment_seed_version"
DEFAULT_MANIFEST = Path(settings.BASE_DIR) / "api" / "site_seed.json"


def fill_missing(current, defaults):
    """Add absent keys; an explicit blank or empty list is an admin choice."""
    merged = deepcopy(current)
    for key, value in defaults.items():
        if key not in merged:
            merged[key] = deepcopy(value)
        elif isinstance(merged[key], dict) and isinstance(value, dict):
            merged[key] = fill_missing(merged[key], value)
    return merged


def _sync_fields(data, fields):
    if not isinstance(data, dict) or not data:
        return data, False
    if data.get("fields") == fields:
        return data, False
    return {**data, "fields": deepcopy(fields)}, True


class Command(BaseCommand):
    help = "Seed baseline CMS content and conversions once without overwriting admin edits."

    def add_arguments(self, parser):
        parser.add_argument("--manifest", type=Path, default=DEFAULT_MANIFEST)

    def _sync_form_fields(self, form):
        """Replace the quote form's field list (published and draft) with
        the manifest's. Other keys (button text, messages) stay as edited."""
        fields = form.get("fields")
        if not isinstance(fields, list):
            return
        row = ComponentData.objects.filter(name="form-quote").first()
        if row is None:
            return
        row.data, changed = _sync_fields(row.data, fields)
        row.draft_data, draft_changed = _sync_fields(row.draft_data, fields)
        if changed or draft_changed:
            row.save()
            self.stdout.write("Quote form fields synced from code.")

    def handle(self, *args, **options):
        path = options["manifest"]
        if not path.is_file():
            raise CommandError(f"Seed manifest missing: {path}")
        try:
            manifest = json.loads(path.read_text(encoding="utf-8"))
            version = int(manifest["version"])
            if version < 1 or not all(k in manifest for k in ("settings", "form", "pageSeo", "blog", "pages", "scan")):
                raise ValueError("incomplete seed manifest")
        except (OSError, ValueError, KeyError, TypeError) as exc:
            raise CommandError(f"Invalid seed manifest: {exc}") from exc

        with transaction.atomic():
            site, _ = SiteSettings.objects.select_for_update().get_or_create(pk=1, defaults={"data": {}})
            current = site.data or {}
            previous_version = int(current.get(SEED_MARKER) or 0)
            # A site that owns its form's fields in code says so in the
            # manifest; every release then makes the stored list match.
            if manifest.get("formFieldsFromCode"):
                self._sync_form_fields(manifest["form"])
            if previous_version >= version:
                self.stdout.write(f"CMS defaults already installed (version {version}); kept all existing data.")
                return
            had_plan = isinstance((current.get("analytics") or {}).get("plan"), dict)

            defaults = deepcopy(manifest["settings"])
            defaults.setdefault("seoDefaults", {})["siteUrl"] = settings.FRONTEND_URL.rstrip("/")
            site.data = fill_missing(current, defaults)
            site.data[SEED_MARKER] = version
            site.save()

            form, created = ComponentData.objects.get_or_create(
                name="form-quote", defaults={"data": manifest["form"]}
            )
            repaired_form = not created and not (form.data or {})
            if repaired_form:
                # An empty placeholder can be created by the CMS before the
                # first seed. Keep any non-empty administrator definition.
                form.data = deepcopy(manifest["form"])
                form.save()

            for path_name, data in manifest["pageSeo"].items():
                row, created = PageSEO.objects.get_or_create(path=path_name, defaults={"data": data})
                if not created:
                    filled = fill_missing(row.data or {}, data)
                    if filled != row.data:
                        row.data = filled
                        row.save()

            for entry in manifest["blog"]:
                date = parse_datetime(entry["published_at"]) if entry.get("published_at") else None
                BlogPost.objects.get_or_create(slug=entry["slug"], defaults={
                    "title": entry["title"], "excerpt": entry.get("excerpt") or "",
                    "author": entry.get("author") or "", "status": "published",
                    "published_at": date, "body_mode": "legacy", "content": entry.get("content") or {},
                })

            page_type = ContentType.objects.get_for_model(ContentPage)
            for entry in manifest["pages"]:
                page, created = ContentPage.objects.get_or_create(path=entry["path"], defaults={
                    "title": entry["title"], "page_type": entry.get("page_type") or "generic",
                    "status": "published", "body_mode": "dynamic",
                })
                if created:
                    for order, section in enumerate(entry.get("sections") or []):
                        row = DynamicSection.objects.create(
                            content_type=page_type, object_id=page.pk, order=order,
                            section_type=section["section_type"], content=section.get("content") or {},
                            status="published",
                        )
                        if section["section_type"] in ("hero", "image_text"):
                            heading = (section.get("content") or {}).get("heading") or page.title
                            SectionMedia.objects.create(
                                section=row, slot="image", required=False,
                                image_prompt=f"Photo for {heading}",
                            )
                seo = entry.get("seo") or {}
                PageSEO.objects.get_or_create(path=entry["path"], defaults={"data": {
                    "seoTitle": seo.get("title") or entry["title"],
                    "metaDescription": seo.get("description") or "", "canonicalSelf": True,
                }})

            TrackingScan.objects.get_or_create(pk=1, defaults={
                "data": clean_scan(manifest["scan"]), "scanned_at": timezone.now(), "source": "seed",
            })

            old_plan = get_plan()
            conversions = old_plan.get("conversions") or []
            repair_seeded_plan = (
                previous_version == 1 and repaired_form and had_plan
                and old_plan.get("status") == "approved" and old_plan.get("version") == 1
                and bool(conversions)
                and all(c.get("createdBy") == "library" and not c.get("locked") for c in conversions)
                and not any((c.get("trigger") or {}).get("event") == "generate_lead" for c in conversions)
            )
            if not had_plan or repair_seeded_plan:
                facts = get_facts()
                proposal = build_plan(facts)
                clean, report = validate(proposal, facts)
                if report["errors"] or report["dangling"] or not clean["conversions"]:
                    raise CommandError(f"Could not seed tracking plan: {report}")
                clean["status"] = "approved"
                clean["version"] = 2 if repair_seeded_plan else 1
                clean["facts"] = {"hash": facts["hash"], "at": timezone.now().isoformat()}
                save_plan(clean)

        self.stdout.write(self.style.SUCCESS(
            f"Seeded CMS defaults v{version}; tracking plan has {len(get_plan().get('conversions') or [])} conversions."
        ))
