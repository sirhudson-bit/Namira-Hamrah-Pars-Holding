# هلدینگ نامیرا همراه پارس — Corporate Website + CMS

Persian-first, fully RTL corporate website for **گروه بازرگانی نامیرا همراه پارس**, with a real
content-management dashboard. Built on **Next.js 15 (App Router) + React 19 + TypeScript +
Prisma + SQLite**, with a **Three.js (React Three Fiber)** layer and **Framer Motion**.

The public site introduces the holding, its five business groups, its sales channels, its
innovation unit (نامیرا لبز), services, media and legal documents. Everything editable lives
in a database and is managed from `/admin`.

---

## Design direction

**Dark editorial.** A near-black canvas, raised panels, glass bands, oversized Persian display
type and a single teal accent — grounded in a study of leading holding-company sites (Tohshin
Partners, Novo Holdings, Prior Holdings, Vivium, Reyes Holdings) plus WebGL craft guidance from
Awwwards-tier builds.

- **Depth through elevation, not decoration.** Four surface steps — canvas `#0B0F0E`, panel
  `#121A18`, tile `#16211E`, band `#070A09` — separated by 1px hairlines at 9% white and a soft
  teal glow, with no drop shadows carrying the weight.
- **Editorial rhythm.** Full-bleed bands alternate with bento grids, hairline-divided stat rails,
  accent rules beside every kicker, and `۰۱ — …` index markers on feature sections.
- **Motion that reads as intentional.** Sections fade-and-rise on scroll, metrics count up, cards
  tilt in 3D toward the pointer, a pinned horizontal gallery is driven by vertical scroll, and the
  hero object recedes as you scroll.
- **WebGL that earns its place.** Two scenes only — the hero and the darkest Labs band — never
  full-page effects. See the performance rules below.

### Theme tokens

Token names describe **roles**, not lightness, so the whole site re-skins from
`tailwind.config.js` + `globals.css` without touching component markup:

| Token | Role | Dark value |
|---|---|---|
| `surface-50` | page canvas | `#0B0F0E` |
| `surface` | raised card | `#121A18` |
| `surface-100/200` | tiles, chips | `#16211E` / `#1B2A26` |
| `dark-900` | deepest full-bleed band | `#070A09` |
| `ink-900` / `700` / `500` | foreground text, strongest → muted | `#EAF2EF` / `#C3D4CE` / `#8CA39D` |
| `line-200` | hairline borders / dividers | `rgba(255,255,255,0.09)` |
| `accent` | readable teal for text, icons, kickers | `#7FB8AA` |
| `brand-*` | the logo teal, for solid fills | `#0F7C71` … |

`brand-700` is the primary fill (white text = 5.1:1); `accent` is the on-dark text tone. Solid
teal panels use `brand-800`, which keeps light text above 4.5:1.

### Component library (shadcn-ready)

The project follows the shadcn layout convention without running `shadcn init` (which would
overwrite `globals.css` and `tailwind.config.js` and destroy the theme above):

- **`components.json`** declares the paths — `components` → `@/components`, `ui` →
  `@/components/ui`, `utils` → `@/lib/utils` — mirroring the `@/*` → `./src/*` alias, so
  `npx shadcn@latest add <component>` drops files in the right place.
- **`src/components/ui/`** holds registry primitives; `site/`, `admin/`, `motion/` and `three/`
  hold product code. Keeping them apart means replacing a primitive never touches app markup.
- `cn()` (`clsx` + `tailwind-merge`) already lives at `@/lib/utils`.

### Ambient background

`src/components/ui/kinetic-grid.tsx` is a pointer-reactive canvas grid: it warps toward the
cursor, glows on approach and ripples on click. It is mounted as the **whole-page background of
the home page** (the page content sits in its `z-10` layer; transparent sections reveal it while
opaque panels punctuate it). Its `globalColor="brand"` theme maps it onto the palette — canvas
`#0B0F0E`, accent lines/nodes, accent-strong ripples — instead of the stock blue. The previous
static `grid-lines` texture on the home page was removed rather than layered, so the page carries
exactly one ambient effect. The canvas only runs while the tab is visible, and
`prefers-reduced-motion` paints a single static frame with no animation loop (see rules below).
The grid reads its colours from `--kg-*` CSS variables, so it re-skins with the theme.

### Theming (light & dark)

Both themes ship and the visitor switches with the header toggle (sun/moon). The initial value
comes from an inline script in the root layout, so there is no flash of the wrong theme.

- **How it works.** Every role token is a CSS variable (`--surface-50`, `--ink-900`, `--accent`,
  `--line-200`, …) declared for `[data-theme="dark"]` and `[data-theme="light"]`. Tailwind maps
  them with `rgb(var(--token) / <alpha-value>)`, so flipping `data-theme` on `<html>` re-skins the
  entire site — no per-component colour overrides.
- **Preference order.** Stored choice (`localStorage.namira_theme`) → system
  `prefers-color-scheme` → dark.
- **Bands stay dark in both themes.** The hero, metrics, Labs and footer set `.band`, which
  re-declares the ink/accent tokens for its subtree. That keeps the WebGL scenes and the
  white-on-dark typography correct in light mode without touching each element; the hero, which is
  *not* a band (the ambient grid shows through it), uses theme-aware `text-ink-900` instead.
- **The hero's orb is a fixed WebGL particle sphere.** A shell of 3,200 points (golden-spiral
  distribution) with crossing surface waves, a glowing pulse that sweeps pole-to-pole, and a gravity
  field the cursor warps. It is pinned to the left of the viewport and does **not** move on scroll.
  All motion is a continuous function of time, so the loop is seamless by construction.
  - It belongs to the hero and must not survive it: an rAF-throttled probe fades it over the last
    140px of the hero and then **unmounts the WebGL scene**, so it is never visible over the rest of
    the site (and stops costing GPU time the moment the hero is gone).
  - It is `pointer-events: none` (it must never intercept clicks on the content that scrolls past
    it), so it cannot receive canvas events. It tracks the cursor through a **window-level
    `pointermove` listener** instead: the canvas-relative position drives the warp, and the
    screen-relative position leans the shell toward the pointer.
  - Placed at `z-index: -1`: above the ambient grid canvas (-10) and below the hero's text.
  - Palettes follow the theme (additive light particles on dark; dark specks with normal blending on
    light, where additive would blow out to white).

### Layout, spacing and UI standards

The rules the interface is held to. Each one exists because breaking it produced a visibly
disorganised page:

- **Full-bleed sections, measured content.** Section backgrounds run edge to edge; the inner
  `.container` is **80% of the viewport, capped at 1800px** and centred (100% below 768px, where a
  percentage gutter would be too narrow). The cap only matters on ultra-wide monitors — at 1600px
  the container is exactly 1280px. (Tailwind's own `container` is disabled: it caps per breakpoint.)
- **Dark is the product default.** The pre-paint script ignores the OS preference on a first visit,
  so everyone lands on the dark palette; only an explicit choice stored in `localStorage` overrides
  it.
- **One vertical rhythm.** `.section` is `py-16 sm:py-20 lg:py-24` everywhere; grids use a 24px gap;
  cards use 24px padding. No section invents its own spacing.
- **One corner radius.** Every non-circular element is **16px** (all Tailwind radius steps are mapped
  to it). Pills and avatars stay fully round. A mixed 12/16/24/28 scale reads as inconsistent.
- **No glassmorphism, no decorative glows or per-card gradients.** Both fight the ambient grid and
  the text behind them. Depth comes from four surface steps plus a hairline.
- **Grids, not horizontal scrollers.** Content the visitor has to scroll sideways to discover (and
  that shows up cut in half) is hidden content. When a card count does not fill the grid rows
  evenly, the last row is centred rather than left with an empty cell.
- **The desktop nav only renders at `xl` (1280px+),** where it actually fits, using short labels
  (`نوآوری`, `گروهها`, `درباره`). Below that the hamburger menu takes over instead of wrapping the
  bar onto two lines.
- **Overlays never cover content.** The consent bar is a slim full-width strip; the video viewer is
  portalled and full-screen.
- **Text over the orb uses `ink-700`, not `ink-500`.** The muted tone measures 4.21:1 in dark and
  3.14:1 in light against the orb — below the 4.5:1 floor. The next ink step clears it in both
  (7.31:1 / 6.27:1). axe reports these nodes as *incomplete* rather than passing, because it cannot
  sample a canvas, so the contrast is measured directly from canvas pixels instead.
- **Shadows are soft and diffused.** Wide blur (40–120px), a generous negative spread and a low
  alpha, layered so the edge never reads as a hard line. Hard 1px-offset shadows fight the editorial
  surfaces.
- **The header logo height is a setting**, not a constant: `/admin/settings` → «لوگو و فاوآیکون» has
  a focused form (24–96px) that writes only `logo_height`. It is deliberately **not** part of the
  main settings form, which rewrites every key it knows — a partial post there would blank the rest.
  The built-in wordmark scales with it too (mark and type are derived from the same value).
- **Uploads are converted to WebP on the way in.** Raster images (PNG/JPEG, and animated GIF) are
  re-encoded at quality 82 and stored with a `.webp` extension; the served `content-type` follows.
  **SVG and ICO are preserved** — rasterising an SVG would lose its scalability and ICO is the
  favicon format. Conversion is best-effort: if a file cannot be decoded it is stored untouched
  rather than losing the upload.
- **Reveals are quiet** — 14px rise over 420ms. A long, large translate makes mid-scroll frames look
  broken.
- **The sticky header never changes height.** Its compact state animates colour and shadow only.
  Changing the height on scroll shifts the layout under the scroll position, which feeds back into
  the scroll threshold and makes the bar visibly judder.

`.container-prose` remains the one deliberate exception: legal and article bodies are capped at
`max-w-4xl` so Persian reading text keeps a sane measure.

### Admin panel

Modelled on the WordPress dashboard: quick actions, an "at a glance" count grid, recent content
activity, a site-health checklist and the contact/application inbox. The behaviours that matter:

- **Every top-level page is editable.** Each route has a `Page` row (listed under `/admin/pages`,
  grouped into main and legal). `PageHero` takes a `slug`, reads that row, and falls back to the
  page's built-in copy when the row is missing or unpublished — so a fresh install looks identical
  while an editor can still change every headline, eyebrow and body.
- **The content editor produces Markdown.** Toolbar (headings, bold/italic, lists, quote, link,
  code), live preview, word count, and an **image button wired to the media library**. The inserted
  `![alt](/uploads/…)` is rendered by the shared renderer, which accepts only root-relative or
  `http(s)` sources.
- **Edit forms are built from the record** (`fields(record)` per entity). A static field list is the
  bug that once made every edit form open blank and overwrite the row on save.
- **Light/dark toggle** in the admin top bar, sharing the site's theme provider.
- **`/admin/home` governs the hero widget.** Eyebrow, title, lead, both buttons, the stat lines
  (`value|label`, one per line) and an on/off switch for the animated sphere. The rail shows a live
  preview of the sphere and of the parsed stats, and saving revalidates the public home page.
- **Home banners are CRUD content.** `/admin/home` → «بنرهای صفحه اصلی» adds any number of slides
  (image, title, subtitle, link, CTA label, order, active). The public home renders them as an
  accessible slider with a pause control. With no banner, the section does not render.
- **Images are editable on every content type.** Business groups, stores, news, articles, job
  openings, pages (hero backdrop) and media all use the shared image field: a URL box plus the
  media-library picker and a live preview. Empty means the previous placeholder/icon layout.
- **The media library is editable.** Each asset can be renamed (title/alt), removed from the public
  gallery, or replaced with a new file. Replacing keeps the old file when stored content still
  references it, so embedded images never break silently.
- **`/admin/layout` is a page builder.** Pick a page, then add, reorder, hide or delete widgets:
  heading, Markdown text, image, image+text split, feature cards, stats, CTA, gallery, video and
  spacer. Widgets render below the page hero, ahead of the page's built-in content, and only the
  chosen page is affected.

## Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 15 App Router, React 19, TypeScript (strict) | Server components render the public pages. |
| Database | SQLite + Prisma 6 | Zero-config locally; the schema is portable to PostgreSQL. |
| 3D | `three` + `@react-three/fiber` + `@react-three/drei` | Client-only, lazy-loaded, with a static fallback. |
| Motion | `framer-motion` | Reveal/stagger, counters, tilt, parallax, pinned scroll. |
| Admin auth | Session row + HttpOnly cookie + bcrypt | Deleting the session row logs the user out immediately. |
| Styling | Tailwind CSS 3.4 + design tokens | Brand palette derived from the logo. |
| Font | Vazirmatn, self-hosted | `public/fonts` — no CDN, no third-party request. |
| Forms | Server Actions + `useActionState` | Work without JavaScript. |
| Markdown | Small dependency-free renderer | Escapes input first; safe for stored CMS content. |
| Tests | Vitest | Validation schemas + the Markdown renderer. |

## 3D and motion performance rules

These are not optional — they are what keeps the site fast and accessible:

1. **Three.js never runs on the server.** Scenes are imported through `next/dynamic` with
   `ssr: false` inside a small client wrapper (`src/components/three/*-3d.tsx`).
2. **Scenes mount only when in view** (`useInView`), so the canvas never blocks first paint.
3. **`prefers-reduced-motion` disables WebGL and all motion.** The wrappers render a static,
   on-brand CSS composition instead; `framer-motion` respects the same preference.
4. **No-WebGL devices get the same fallback** — a live context check decides.
5. **DPR is capped** (`dpr={[1, 1.75]}`) so a phone does not render at 3× and cook itself.
6. **No external HDR/asset fetches** — lighting is real lights plus drei helpers, so the scenes
   work fully offline.
7. **Page transitions animate opacity only.** A transform on the template would create a containing
   block and break the sticky/pinned sections.
8. **Component classes that set `color` live in `@layer components`.** A rule in the `utilities`
   layer is emitted *after* the utility classes, so it would beat `text-white` and make text
   invisible on dark sections. Keep `display-*`, `heading-*`, `kicker`, `glass` and `surface-dark` in
   `components`.
9. **One ambient background effect per page.** The home page runs exactly one — the kinetic grid.
   Do not layer a second texture over it; remove the old one when swapping the effect.
10. **The ambient canvas is gated too.** It paints only while the tab is visible
   (`visibilitychange`), and `prefers-reduced-motion` paints a single static frame without ever
   starting the `requestAnimationFrame` loop.
11. **Runtime uploads are served by a route, not by `public/`.** `next start` only serves public
   files that existed at build time, so anything uploaded later (logo, favicon, media) 404s from
   the static handler and the image silently never appears. `GET /uploads/[...path]` reads from
   disk instead, rejects traversal, and whitelists extensions.
12. **Uploads must fit `serverActions.bodySizeLimit`.** Server actions default to a **1 MB** body
   cap, so a larger file is rejected at the transport layer with a 500 *before* the action runs —
   the visitor sees an error and the page reloads, with no explanation. The limit is raised to 6 MB
   in `next.config.ts` to cover the 2 MB branding and 5 MB media limits actually advertised. Both
   uploaders also check the size in the browser first, so an oversized file gets a plain message
   instead of a dead request.
13. **Overlays are portalled to `<body>`.** The home page wraps its content in the ambient grid's
   `z-10` stacking context, which would cap any in-page modal below the sticky header. The video
   viewer (and anything similar) uses `createPortal` so it escapes that context.
14. **Every section reveals on scroll, from one place.** `RevealOnScroll` (mounted in the page
   template) tags top-level sections and fades them in via IntersectionObserver. The hidden state
   is applied by JS only, so content is present without JavaScript, and anything already in view on
   arrival is shown immediately rather than animating the first screen.
15. **The ambient canvas is `-z-10`, never `z-0`.** A positioned element with `z-index: 0` paints
   *above* the backgrounds of non-positioned blocks, so the grid bled through every opaque panel,
   the newsletter band and the footer — nothing looked like a solid surface. A negative index puts
   it behind all block backgrounds: opaque sections cover it, transparent ones reveal it. Its
   wrapper must therefore set no background of its own.

## React / Next.js performance rules

Audited against the Vercel React best-practices guide. What is enforced here:

- **Every server data reader is wrapped in `React.cache()`.** The same query is routinely asked for
  two or three times in one request — `generateMetadata` and the page body both load the record
  behind a `[slug]` route, and the root layout's metadata and the site layout both need settings.
  Measured on `/business-groups/digital` with Prisma query logging: **6 queries before, 4 after**
  (one Setting, one group by slug, one group list, one store list). Cache keys are primitive
  arguments only — an inline object would never hit.
- **`optimizePackageImports` for `lucide-react`.** Its entry file re-exports ~1,500 icons; Next
  rewrites the imports at build time. Keeps dev boot and cold starts fast without losing types to
  deep import paths.
- **Passive pointer listeners.** `mousemove`/`pointermove` handlers never call `preventDefault`, so
  they are registered with `{ passive: true }` — otherwise the browser waits on them before
  scrolling.
- **Only what a client component renders crosses the boundary.** `HeaderSettings` is a `Pick` of
  five fields; the full settings object used to be serialized into the RSC payload for the header.
- **Per-frame animation writes the DOM, not React state.** `Counter` sets `textContent` inside its
  rAF loop; state there would re-render the component ~96 times per counter, with several counters
  on screen at once.
- **Expensive formatters are module-level.** `Intl.DateTimeFormat` costs ~0.1–1ms to construct and
  is stateless, so the Jalali formatters are built once; digit conversion is a character loop
  instead of `String.replace` with a callback.

## Routes

**Public** — `/`, `/about`, `/business-groups`, `/business-groups/[slug]` (5 groups),
`/stores`, `/stores/[slug]` (4 channels), `/innovation`, `/services`, `/units`, `/media`,
`/media/news`, `/media/news/[slug]`, `/media/blog`, `/media/blog/[slug]`, `/contact`,
`/careers`, `/privacy`, `/terms`, `/cookie-policy`, `/refund-policy`, plus `/sitemap.xml`,
`/robots.txt` and `/icon.svg`.

**Admin** — `/admin/login`, `/admin/dashboard`, `/admin/home` (hero + banners), `/admin/pages`,
`/admin/layout` (page builder), `/admin/business-groups`, `/admin/stores`, `/admin/news`,
`/admin/blog`, `/admin/careers`, `/admin/forms`, `/admin/media` (upload, edit, replace),
`/admin/settings` (including the **logo + favicon upload** section).

**API** — `GET /api/admin/export?type=messages|applications` (CSV),
`GET /api/admin/resume/[id]` (auth-gated résumé download).

## Branding (logo & favicon)

In `/admin/settings`, the **«لوگو و فاوآیکون»** section uploads:

| Asset | Where it appears |
|---|---|
| Main logo | Site header, footer, admin login (the built-in SVG mark is the fallback) |
| Light logo | Reserved for dark surfaces (optional) |
| Favicon | Browser tab / bookmarks via the root metadata; falls back to `/icon.svg` |

Uploads are limited to PNG/SVG/WEBP/JPG/ICO and 2 MB (page backdrops 8 MB), are written to
`public/uploads/branding/`, replace the previous file (so nothing accumulates), and are read
back through `getSettings()`.

## Setup

Requires Node.js 20+ and npm.

```bash
npm install

cp .env.example .env
# set DATABASE_URL, APP_SECRET, NEXT_PUBLIC_SITE_URL

npx prisma db push     # create the SQLite database
npm run db:seed        # settings, admin user, groups, stores, news, legal pages…
npm run build
npm run start          # http://localhost:3000
```

Generate `APP_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Seeded admin login

| | |
|---|---|
| Email | `admin@namiragroup.ir` |
| Password | `NamiraAdmin!2026` |

Override with `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`. **Change this before deployment.**

## Commands

```bash
npm run dev          # development server
npm run build        # production build
npm run start        # production server
npm run typecheck    # tsc --noEmit
npm run lint         # eslint
npm test             # vitest run (18 tests)
npm run verify       # 17 end-to-end checks against a running server
npm run db:push      # sync schema to SQLite
npm run db:seed      # seed content
npm run db:studio    # browse the database
```

`npm run verify` drives a **running** server. Start one first:

```bash
npm run build && npm run start          # then, in another shell:
E2E_BASE=http://localhost:3000 npm run verify
```

It covers login (wrong password rejected; correct password sets the session cookie and
redirects), authenticated dashboard access, the home page (RTL, no server-rendered canvas,
app icon), contact-form persistence, server-side validation, newsletter opt-in, and the
**branding upload round-trip** (file persisted, logo rendered in the header). It cleans up
everything it creates.

## Privacy, consent and security

- **Cookie consent is real.** Nothing non-essential loads before opt-in. Google Analytics is
  injected only after analytics consent, live if given later. Choice stored under
  `namira_cookie_consent`, re-openable from the footer.
- **Google Maps is click-to-load** — no third-party cookie is dropped silently.
- **Forms carry consent checkboxes** linking to `/privacy` and `/terms`; the server rejects
  submissions without them.
- **Rate limiting** on login, contact, application and newsletter actions.
- **Security headers** in `next.config.ts`.
- **Uploads stay out of reach.** Résumés are written to `storage/uploads/jobs/`, outside
  `public/`, and streamed only through an auth-gated route. Branding and media go to
  `public/uploads/` (served publicly by design).

## Layout

```
prisma/
  schema.prisma      data model (SQLite)
  seed.ts            settings, admin, and all site content
public/
  fonts/             self-hosted Vazirmatn woff2
  images/            inline SVG placeholders
  uploads/           runtime uploads (branding, media) — gitignored
src/
  app/
    (site)/          public site (chrome, template transition, pages)
    admin/           login + (dashboard) shell
    api/admin/       CSV export, résumé download
    uploads/         serves runtime uploads (public/ alone is not enough)
    icon.svg         default favicon (overridden by an uploaded one)
  components/
    ui/              shadcn-registry primitives (kinetic-grid ambient background)
    theme/           light/dark provider, toggle and pre-paint boot script
    site/            header, footer, forms, cookie banner, map, video modal,
                     back-to-top, scroll reveal, social icons, UI helpers
    admin/           sidebar, topbar, fields, record form, branding uploader
    motion/          Reveal/Stagger, ScrollProgress, Counter, Tilt, Marquee,
                     Parallax, HorizontalScroll, ScrollTransform, template
    three/           hero + labs scenes and their client-only gates/fallbacks
  lib/               formatting, Markdown, consent, validation, rate limit, nav
  server/            db, auth, settings, content, actions (public + admin)
  middleware.ts      edge cookie guard for /admin
tests/               Vitest suites
scripts/
  e2e.mjs            end-to-end verification (npm run verify)
```

## WordPress-style content management

- **Pages** (`/admin/pages`): create, edit, duplicate, publish and delete pages. Every page has a
  rich Markdown body, hero copy/image, SEO fields and a layout of widgets; the body now renders on
  the public page (above the widget layout). Custom pages are served at `/<slug>`; the built-in
  routes keep their own slugs and URLs.
- **Menus** (`/admin/menus`): the header navigation and every footer column are database-backed.
  Add, rename, reorder, hide or delete items and nested dropdowns; the public header/footer update
  on the next request. The first visit seeds the old built-in navigation as editable rows.
- **Image focus** (`موقعیت نمایش تصویر`): every cover image — pages, banners, groups, stores, news,
  posts and jobs — and the image/split widgets has a selectable `object-position`.
- **Live editing**: signed-in admins see a «ویرایش زنده» bar on the public site. Turn it on and click
  a hero heading/eyebrow/lead or a widget title to edit in place; the change is saved through
  `/api/admin/live-edit` (session-checked, whitelisted text fields) and revalidated. Images and
  Markdown deliberately stay in the full admin editor.
- **All page elements** (`/admin/content`): services, organisational units, innovation projects,
  team members and timeline milestones now have create/edit/delete screens instead of being
  seed-only.

## Deployment

Target: Ubuntu VPS, Node 22, pm2 + nginx, SQLite on local disk. Scripts and the
full runbook live in [`deploy/`](./deploy/README.md).

```bash
bash deploy/bootstrap.sh     # first time on a fresh server
bash deploy/redeploy.sh      # every deploy after that
```

Run `npm run build` then `npm run start` behind a reverse proxy (a Node runtime is required).
Move `DATABASE_URL` to PostgreSQL for production by changing the Prisma datasource provider.
Serve over HTTPS and set `NEXT_PUBLIC_SITE_URL`.

See [CONTINUATION.md](./CONTINUATION.md) for the verified state, known gaps, and the decisions
not to relitigate.
