#!/usr/bin/env node
/* =========================================
   Seed the CMS with this site's current content.

   npm run cms:seed            fill anything that is still empty
   npm run cms:seed -- --force overwrite settings, form and page SEO

   Needs a staff account:
   CMS_EMAIL=… CMS_PASSWORD=… npm run cms:seed
   (or put them in .env.local)

   - Site settings (organisation, SEO defaults, AI voice, sitemap paths)
   - Quote form definition   -> home/form-quote/  (server-side validation)
   - Page SEO for every route -> seo/<path>/
   - Built-in articles       -> blog/  (only when the CMS has no posts)
   - Service, legal and testimonials pages -> content/pages/ (src/data/pages)
   - --export-json writes the same defaults as a backend seed manifest; CI
     generates it before building the backend image, without admin credentials.
========================================= */

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const force = process.argv.includes("--force");
const exportJson = process.argv.includes("--export-json");

// Minimal .env.local / .env loader (no dependency).
for (const file of [".env.local", ".env"]) {
    const path = join(root, file);
    if (!existsSync(path)) continue;
    for (const line of readFileSync(path, "utf8").split("\n")) {
        const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
        if (match && process.env[match[1]] === undefined) {
            process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
        }
    }
}

// Mirrors STATIC_ROUTES in src/lib/site.js (plain node can't import "@/").
const STATIC_ROUTES = [{ path: "" }, { path: "about" }, { path: "services" }, { path: "resources" }, { path: "faqs" }, { path: "contact" }];

const API = `${(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/+$/, "")}/api`;
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");
const { CMS_EMAIL, CMS_PASSWORD } = process.env;

if (!exportJson && (!CMS_EMAIL || !CMS_PASSWORD)) {
    console.error("Set CMS_EMAIL and CMS_PASSWORD (a staff account) to seed the CMS.");
    process.exit(1);
}

let token = "";

async function api(path, { method = "GET", body } = {}) {
    const res = await fetch(`${API}/${path}`, {
        method,
        headers: {
            ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
            ...(token ? { Authorization: `Token ${token}` } : {}),
        },
        body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await res.text();
    const data = text ? JSON.parse(text) : {};
    if (!res.ok) throw new Error(`${method} ${path} -> ${res.status} ${text.slice(0, 300)}`);
    return data;
}

const isEmpty = (value) => !value || (typeof value === "object" && Object.keys(value).length === 0);

function readJson(relative) {
    return JSON.parse(readFileSync(join(root, relative), "utf8"));
}

// data/articles.js is an ES module array literal; evaluate just the literal.
function readArticles() {
    const source = readFileSync(join(root, "src/data/articles.js"), "utf8");
    const literal = source.slice(source.indexOf("["), source.lastIndexOf("]") + 1);
    return Function(`"use strict"; return (${literal});`)();
}

const PAGE_SEO = {
    home: {
        seoTitle: "Online Accountants for VAT, Payroll & Tax",
        metaDescription:
            "Online UK accountants for quarterly VAT returns, monthly payroll, annual accounts and Self Assessment. 100% remote. Book a free consultation today.",
    },
    about: {
        seoTitle: "About Us | Online UK Accountants",
        metaDescription:
            "Meet ZFK Accountants: online UK accountants helping limited companies, sole traders, contractors and landlords with VAT, payroll, accounts and tax.",
    },
    services: {
        seoTitle: "Accounting Services: VAT, Payroll & Tax",
        metaDescription:
            "Quarterly VAT returns, monthly payroll, annual accounts, Corporation Tax and Self Assessment for UK businesses, delivered 100% online with tailored quotes.",
    },
    resources: {
        seoTitle: "Accounting Resources & UK Tax Guides",
        metaDescription:
            "Practical guides on VAT returns, payroll, annual accounts, Self Assessment and UK tax deadlines from the ZFK Accountants team.",
    },
    faqs: {
        seoTitle: "Accounting & Tax FAQs — Answers for UK Businesses",
        metaDescription:
            "Answers to common questions about VAT returns, payroll, annual accounts, Self Assessment, pricing and working online with ZFK Accountants.",
    },
    contact: {
        seoTitle: "Book a Free Accountant Consultation",
        metaDescription:
            "Book a free, no-obligation video consultation with ZFK Accountants. Choose a time that suits you and get a quote tailored to your business.",
    },
    // Articles (titles come from the post).
    "blog/vat-returns-made-simple": {
        metaDescription:
            "VAT returns explained for UK businesses: when to register for VAT, how returns and Making Tax Digital work, and the deadlines to keep in mind.",
    },
    "blog/annual-accounts-deadlines-2026": {
        metaDescription:
            "Plan your company's year-end with confidence: what annual accounts include, the key Corporation Tax deadlines and how to prepare step by step.",
    },
    "blog/self-assessment-tax-returns": {
        metaDescription:
            "Who needs to file a Self Assessment tax return, the key HMRC deadlines, allowable expenses to claim and practical tips to make your return simpler.",
    },
    "blog/payroll-guide-small-business": {
        metaDescription:
            "How payroll works for UK small businesses: registering as an employer, RTI submissions, paying PAYE on time and workplace pension duties explained.",
    },
    "blog/cloud-accounting-growth": {
        metaDescription:
            "How cloud accounting software saves time, improves accuracy and gives clearer insight into your figures, helping UK businesses plan and grow.",
    },
    "blog/uk-tax-dates-2026": {
        metaDescription:
            "A quick reference to the key UK tax dates for 2026: the filing and payment deadlines businesses and individuals need to plan around.",
    },
};

function parseDisplayDate(text) {
    const date = new Date(`${text} 09:00:00 UTC`);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

// Article categories — keep in sync with ARTICLE_CATEGORIES in src/lib/blog.js.
const ARTICLE_CATEGORIES = ["VAT", "Payroll", "Accounting", "Personal Tax", "Compliance", "Small Business", "Tax"];

// Collections: the only pages admins create from the site itself, each with
// ONE template so new entries look exactly like the existing ones.
const COLLECTIONS = {
    articles: {
        label: "Article",
        plural: "Articles",
        hostKind: "blog",
        indexPath: "resources",
        pathPrefix: "blog",
        pageType: "article",
        // The article hero comes from the entry fields below; the body is sections.
        sections: ["rich_text", "rich_text", "faq"],
        allowAdd: ["rich_text", "image_text", "faq", "cta"],
        fields: {
            excerpt: { label: "Excerpt (shown on article cards)", type: "textarea" },
            category: { label: "Category", options: ARTICLE_CATEGORIES },
            coverImage: { label: "Cover image", type: "image", category: "blog" },
            coverImageAlt: { label: "Cover image alt text" },
        },
        listingNote: "New articles appear on /resources and in “Latest insights” on the home page as soon as they are published.",
    },
    services: {
        label: "Service",
        plural: "Services",
        hostKind: "content",
        indexPath: "services",
        pathPrefix: "services",
        pageType: "service",
        // = every service page: hero (with "at a glance"), included, who it's
        // for, how it works, deadlines & records, FAQs, call to action.
        sections: ["hero", "features", "rich_text", "steps", "rich_text", "faq", "cta"],
        allowAdd: [],
        listingNote: "Service pages are linked from the home “Services” cards, the /services hero cards, the footer’s “Our Services” list and the booking page — add a card or link there (click it on the page) so visitors can find a new service.",
    },
};

function missingOnly(desired, current) {
    if (isEmpty(current)) return desired;
    if (!desired || typeof desired !== "object" || Array.isArray(desired)) return undefined;
    const out = {};
    for (const [key, value] of Object.entries(desired)) {
        const have = current?.[key];
        const need = value && typeof value === "object" && !Array.isArray(value) && have && typeof have === "object"
            ? missingOnly(value, have)
            : (have === undefined || have === null || have === "" || (Array.isArray(have) && !have.length) ? value : undefined);
        if (need !== undefined && !(typeof need === "object" && !Array.isArray(need) && !Object.keys(need).length)) out[key] = need;
    }
    return out;
}

async function seedSettings() {
    const current = exportJson ? {} : await api("settings/site/");
    const desired = {
        organization: {
            name: "ZFK Accountants",
            description:
                "Online UK accountants for quarterly VAT returns, monthly payroll, annual accounts and Self Assessment, working with clients across the UK.",
            areaServed: "United Kingdom",
            // Square logo for search engines (resolved against siteUrl).
            logo: "/images/brand/zfk-logo-stacked-navy.png",
            logoAlt: "ZFK Accountants logo",
        },
        // Remote, booking-led practice: no phone, address or email is published.
        // Enquiries come through the booking form and are emailed to
        // forms.notifyEmail (Settings → Form notifications) via FormSubmit.
        contact: { contactType: "customer service", availableLanguages: ["English"] },
        seoDefaults: {
            siteUrl: SITE_URL,
            titleTemplate: "%s | ZFK Accountants",
            defaultTitle: "ZFK Accountants | Online UK Accountants",
            defaultDescription:
                "Online UK accountants for quarterly VAT returns, monthly payroll, annual accounts and Self Assessment, delivered 100% remotely.",
            twitterCard: "summary_large_image",
            // Shown when a page has no social image of its own (1200×630).
            defaultOgImage: "/images/og-default.png",
            defaultOgImageAlt: "ZFK Accountants — online accountants for UK businesses",
            robots: { index: true, follow: true },
            themeColor: "#071224",
            locale: "en_GB",
        },
        schema: { organizationType: "AccountingService", enabled: true },
        // Tone and context injected into every AI prompt (page, section, SEO, keywords).
        ai: {
            brandVoice: "clear, warm, plain British English; confident but never salesy",
            audience: "UK sole traders, landlords, contractors, small employers and limited-company directors",
            location: "United Kingdom (fully remote, UK-wide)",
            pageKinds: { services: "Service page", blog: "Blog article", legal: "Legal page" },
            extraRules: [
                "Use British spelling (organisation, specialise, colour).",
                "Never promise specific tax savings or guaranteed outcomes.",
                "Refer to HMRC and Companies House by name where relevant.",
                "Services: quarterly VAT returns, monthly payroll, annual accounts & Corporation Tax, Self Assessment. Never offer other services.",
                "Prices depend on each business: never quote prices or say 'fixed fees'; point to a free consultation and tailored quote.",
                "The practice is 100% online: never mention an office, address or phone number; the call to action is booking a free consultation (/contact).",
            ],
        },
        // Static Next.js routes, so the CMS sitemap report lists them too.
        sitemap: { extraPaths: STATIC_ROUTES.map((route) => route.path || "/") },
        collections: COLLECTIONS,
    };
    if (exportJson) return desired;
    // Without --force only values that are still missing are written — at any
    // depth — so re-running never overwrites what an admin changed, but new
    // keys (e.g. a new seoDefaults field) still reach existing sites.
    const body = force ? desired : missingOnly(desired, current);
    if (!body || !Object.keys(body).length) return "kept (already set)";
    await api("settings/site/", { method: "PATCH", body });
    return `saved (${Object.keys(body).join(", ")})`;
}

async function seedForm() {
    const current = await api("home/form-quote/");
    if (!force && !isEmpty(current)) return "kept (already set)";
    await api("home/form-quote/", { method: "PUT", body: readJson("src/data/quote-form.json") });
    return "saved";
}

async function seedPageSeo() {
    const faqs = readJson("src/data/faqs.json");
    const faqItems = faqs.categories.flatMap((c) => c.questions.map(({ q, a }) => ({ q, a })));
    const exported = {};
    const results = [];

    for (const [path, data] of Object.entries(PAGE_SEO)) {
        const full = { ...data, canonicalSelf: true, robots: { index: true, follow: true }, sitemap: { include: true } };
        if (path === "faqs") Object.assign(full, { faqItems, schema: { builders: ["FAQPage"] } });
        if (exportJson) {
            exported[path] = full;
            continue;
        }
        const current = await api(`seo/${path}/`);
        // Without --force, only fill what's missing — never overwrite an admin's edit.
        const body = force ? full : missingOnly(full, current);
        if (!body || !Object.keys(body).length) {
            results.push(`${path}: kept`);
            continue;
        }
        await api(`seo/${path}/`, { method: "PATCH", body });
        results.push(`${path}: ${isEmpty(current) ? "saved" : `filled ${Object.keys(body).join("+")}`}`);
    }

    return exportJson ? exported : results.join(", ");
}

async function seedBlog() {
    const articles = readArticles();
    const entries = articles.map((article) => ({
        slug: article.slug,
        title: article.title,
        excerpt: article.description || "",
        author: article.author || "",
        status: "published",
        published_at: parseDisplayDate(article.date),
        body_mode: "legacy",
        content: {
            coverImage: article.image || "",
            coverImageAlt: article.title,
            category: article.category || "",
            readTime: article.read || "",
            date: article.date || "",
            goodToKnow: article.goodToKnow || "",
            sections: article.body || [],
        },
    }));
    if (exportJson) return entries;
    const existing = await api("blog/");
    if ((existing.count ?? existing.length ?? 0) > 0) return `kept (${existing.count ?? existing.length} posts already in the CMS)`;

    for (const entry of entries) {
        await api("blog/", {
            method: "POST",
            body: entry,
        });
    }
    return `imported ${articles.length} articles`;
}

async function seedPages() {
    const dir = join(root, "src/data/pages");
    const files = readdirSync(dir).filter((f) => f.endsWith(".json"));
    const pages = files.map((file) => JSON.parse(readFileSync(join(dir, file), "utf8")));
    if (exportJson) return pages;
    const results = [];

    for (const page of pages) {
        let exists = true;
        try {
            await api(`content/pages/${page.path}/`);
        } catch {
            exists = false;
        }

        if (exists && !force) {
            results.push(`${page.path}: kept`);
            continue;
        }
        if (exists) await api(`content/pages/${page.path}/`, { method: "DELETE" });

        await api("content/pages/", {
            method: "POST",
            body: { path: page.path, title: page.title, page_type: page.page_type, status: "draft", body_mode: "dynamic" },
        });
        await api(`content/${page.path}/sections/`, {
            method: "POST",
            body: {
                sections: page.sections.map((s, order) => ({
                    ...s,
                    order,
                    status: "published",
                    // Image slots are optional here: these pages publish without
                    // images, and an admin can add one later.
                    ...(s.section_type === "hero" || s.section_type === "image_text"
                        ? { media: [{ slot: "image", required: false, image_prompt: `Photo for “${s.content.heading}”` }] }
                        : {}),
                })),
            },
        });
        await api(`content/pages/${page.path}/`, { method: "PATCH", body: { status: "published" } });

        const seo = await api(`seo/${page.path}/`);
        if (force || isEmpty(seo)) {
            await api(`seo/${page.path}/`, {
                method: "PATCH",
                body: { seoTitle: page.seo.title, metaDescription: page.seo.description, canonicalSelf: true },
            });
        }
        results.push(`${page.path}: published`);
    }

    return results.join(", ");
}

async function main() {
    if (exportJson) {
        const form = readJson("src/data/quote-form.json");
        const manifest = {
            version: 2,
            settings: await seedSettings(),
            form,
            // The booking form's fields live in src/data/quote-form.json: every
            // release makes the CMS copy (which the server validates against) match.
            formFieldsFromCode: true,
            pageSeo: await seedPageSeo(),
            blog: await seedBlog(),
            pages: await seedPages(),
            // Enough of the rendered-site facts to establish the baseline plan.
            // Owners can rescan the live site later; the approved plan is never
            // replaced by subsequent deployments.
            scan: { pages: [
                { path: "/", ctas: [{ label: "Book a free consultation", target: "/contact", block: "home-hero" }] },
                { path: "/services", blocks: [{ name: "services-pricing", heading: "How pricing works" }] },
                { path: "/contact", forms: [{ name: "quote" }] },
                { path: "/faqs" },
            ] },
        };
        console.log(JSON.stringify(manifest));
        return;
    }
    console.log(`CMS: ${API}`);
    const login = await api("auth/login/", { method: "POST", body: { email: CMS_EMAIL, password: CMS_PASSWORD } });
    token = login.key;

    console.log(`Site settings ... ${await seedSettings()}`);
    console.log(`Quote form ...... ${await seedForm()}`);
    console.log(`Page SEO ........ ${await seedPageSeo()}`);
    console.log(`Blog ............ ${await seedBlog()}`);
    console.log(`Pages ........... ${await seedPages()}`);
    console.log("Done. Restart or wait up to an hour for cached pages, or save any section to refresh.");
}

main().catch((error) => {
    console.error(error.message);
    process.exit(1);
});
