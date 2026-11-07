# zfkaccountants

Marketing site for a UK accountancy practice (Next.js 15, React 19, Tailwind 4),
with content, SEO, blog, forms and redirects managed by the Django CMS in
`../backend`.

```bash
npm install
cp .env.example .env.local   # point NEXT_PUBLIC_API_URL at the CMS
npm run dev
```

The site works without the CMS running: every section falls back to its
built-in content and the blog falls back to `src/data/articles.js`.

## Running the CMS locally

```bash
cd ../backend
python3.12 -m venv venv && ./venv/bin/pip install -r requirements.txt
cp .env.example .env          # set SECRET_KEY (an empty value breaks requests)
./venv/bin/python manage.py migrate
./venv/bin/python manage.py createsuperuser
./venv/bin/python manage.py runserver 8000
```

macOS has no bare `python` command, and the CMS's packages are only installed
in `venv/`, so always use `./venv/bin/python …` — or run
`source venv/bin/activate` once per terminal, after which `python manage.py …`
works. Django 5.1 needs Python 3.10+ (`brew install python@3.12` if
`python3 --version` is older).

Then load the site's current content into it (safe to re-run; it only fills
what is empty, `-- --force` overwrites settings, form and page SEO):

```bash
CMS_EMAIL=you@example.com CMS_PASSWORD=… npm run cms:seed
```

Production runs `manage.py seed_site_defaults` automatically after migrations.
CI generates its manifest with `node scripts/seed-cms.mjs --export-json` from
the same source data, so production seeding needs no admin credentials.

## Editing content

Sign in at `/admin/login`, or use "Staff login" in the footer, which brings you
back to the page you were on. You need a staff account.

- **Click text and type.** With *Editing* on in the bar at the bottom, every
  piece of text has a dotted outline:
  - Enter ends a single-line field and Esc undoes it.
  - Hovering a list item shows ↑ ↓ ⧉ ✕, and each list ends with *+ Add*.
  - Images get *Replace image*; links get 🔗 for their URL.
  - Cmd/Ctrl-click follows a link while editing.
- **Edits are drafts.** They save automatically. Visitors see nothing until
  you click **Publish** in the bar (this page, or everything). *Discard*
  throws drafts away.
- **✦ AI assist** builds one prompt for the whole page as soon as it opens:
  - **Keyword coverage:** the % of sections using the page's keyword, with a
    ✓ chip per section. It updates live.
  - **Other SEO rules:** a ✓/✕ list of the page's key SEO checks.
  - Copy the prompt into ChatGPT, Claude or any other chat and paste the reply
    back. Every section updates as a draft.
- **SEO** opens on **✦ Ask AI**:
  - The audit prompt is already built, so copy it, paste the reply, and
    you're done.
  - Below it are the fields: title, description, keywords, social image,
    indexing and schema.
  - A score bar, 18 checks (each with its fix), Auto-fill for empty fields,
    and history round it out.
- **Articles and services are collections.**
  - On `/resources` the bar shows **＋ New article**, and on `/services`
    **＋ New service**. Type a title, then start from the template or write
    it with AI. Either way the new draft has exactly the same layout as the
    existing ones.
  - On an article or service page, **Article / Service settings** publishes
    it and changes its title, URL, excerpt, category or cover image. It can
    also rewrite it with AI (as drafts) or delete it.
  - Other pages keep their layout; you edit their copy.
- Each block's **All fields** pill has the full form, a per-block AI prompt,
  JSON copy/paste, and revision history. Edit tools only appear when you hover
  a block, and "–" on the bar tucks it into a corner.
- **Site tools** opens settings, images, the form inbox, blog, redirects and
  the sitemap without leaving the page. **Dashboard** (`/admin`) has the same
  tools full-screen, plus a page builder for rare one-off pages.

The brand voice, audience and house rules fed into every AI prompt live in
Site settings → `ai`, and the collections in Site settings → `collections` (both seeded by `npm run cms:seed`). The admin UI colours are the `--cms-*` variables at the top of `src/app/cms.css`.

## How it fits together

| Piece | Where |
|---|---|
| API client: session cookie + CSRF, uploads | `src/lib/api.js` |
| Cached server reads (ISR, `cms:*` tags) | `src/lib/cms.js` |
| Cache refresh webhook (called by the CMS, HMAC-signed) | `src/app/api/revalidate/route.js` |
| `generateMetadata()` from `seo/resolve/` | `src/lib/seo.js`, `src/components/seo/PageSeo.jsx` |
| Inline editing | `useCms(name, defaults)` → `E.Text/Image/Item/Add/Link` (`src/components/cms/useCms.jsx`, `inline.jsx`) |
| Admin bar, drafts, AI/SEO panels | `src/components/cms/` |
| Dashboard | `src/app/admin/`, `src/components/admin/` |
| CMS pages (renderer + inline section editing) | `src/components/dynamic/` |
| Quote form (definition `home/form-quote/`) | `src/components/contact/QuoteForm.jsx` |
| CMS redirects | `src/middleware.js` |
| Site name | `src/lib/brand.js` |

The CMS kit files are shared with `../backend/frontend-kit` (refresh it
with `python ../backend/frontend-kit/sync_kit.py .`). The rules for making
a section editable are in `../backend/FRONTEND_INTEGRATION_PROMPT.md` §3.
In short:
- move the copy into a module-level `defaults`
- call `const { data, E, editButton } = useCms("my-section", defaults, { label })`
- render every string as `<E.Text path="…" />`
- give lists `E.Item`/`E.Add`, images `E.Image`, and links `E.Link`
- add the name to the page's `<CmsSection names={[…]}>`

Checks:

```bash
npm run check:inline     # no hard-coded copy left in CMS components
npm run check:sections   # renderers match the backend's section types (CMS running)
```

End-to-end acceptance (production build + CMS running; see the script header):
`node ../backend/frontend-kit/acceptance/acceptance.mjs`.

Env: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SITE_URL`, `REVALIDATE_SECRET` (the
same value as the CMS `.env`; the CMS's `FRONTEND_REVALIDATE_URL` points at
this site's `/api/revalidate`).

Booking flow: after a successful submission the booking form
(`components/contact/QuoteForm.jsx`) sends the visitor to `/thank-you`
(noindex, not in the sitemap). Its "How did you hear about us?" answer is a
separate follow-up email through `sendFormEmail`; it never changes the stored
submission and is not a lead or conversion.
