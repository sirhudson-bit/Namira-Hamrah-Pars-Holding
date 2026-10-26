# Continuation brief — Namira Holding website

**Read this first.** It records what is verified, how to run it, what is built, what is not, and
which decisions must not be reopened — so a fresh session can resume without re-deriving anything.

Companion doc: [README.md](./README.md) (setup, stack, routes, design rules).

---

## 1. What this project is

A Persian-first, fully RTL corporate website + content-management dashboard for **گروه بازرگانی
نامیرا همراه پارس**, with a Three.js (React Three Fiber) and Framer Motion layer. It is a **new,
standalone project** at `C:\Users\Pc\namira-holding` — deliberately separate from
`C:\Users\Pc\namira-next` (an unrelated WooCommerce analytics dashboard). Do not merge them.

Single Next.js 15 app: the public site under `src/app/(site)`, the admin CMS under `src/app/admin`.
Content lives in SQLite via Prisma; the admin edits it.

## 2. Verified state at handoff

Everything below was executed, not assumed.

| Check | Result |
|---|---|
| `npm run typecheck` | clean (0 errors) |
| `npm run lint` | clean (0 errors, 0 warnings) |
| `npm test` | **18 tests passing** (validation + Markdown) |
| `npm run build` | succeeds — 39 routes + middleware |
| `npm run verify` | **17/17 end-to-end checks passing** against `next start` |
| Public routes | all 31 checked return 200 (incl. `/icon.svg`) |
| `/admin/*` anonymous | 307 → `/admin/login` |
| `/api/admin/*` anonymous | 401 JSON |
| Browser verification (real Chrome via agent-browser) | 0 JS errors; 0 horizontal overflow at 390 / 820 / 1440 px; **0 axe accessibility violations** |
| WebGL | hero + Labs canvases render at every width; reduced-motion renders the fallback with **0 canvases** |
| Pinned gallery | live `translateX` 0 → **884px**, matching the computed range exactly |
| Web Vitals (home) | TTFB 34ms, FCP/LCP 84ms, **CLS 0** |
| Theme (dark editorial) | applied across all 40 routes; **0 axe violations** on 15 public pages |
| Layout sweep | 19 public pages × 3 widths (390/820/1440) = **0 overflow, 0 JS errors**; admin 10 pages also clean |
| Ambient background | `KineticGrid` mounted as the home page's whole-page background; pointer-warp verified by pixel measurement (**27.6 vs 13.4** brightness at pointer vs control) |
| Reduced motion | kinetic canvas paints one static frame (2156 px) and never starts its rAF loop; WebGL falls back (1 canvas) |
| Light / dark | toggle verified both ways; stored in `localStorage` and survives navigation; **0 axe violations in BOTH themes** |
| Runtime uploads | an asset written after the build now returns **200** via `/uploads/[...path]` (was 404); traversal → 404 |
| Pinned gallery fix | at progress 0 the track transform is `none` and the first card's right edge (1376) equals the heading's; travel exact (2324 − 1440 = 884) |
| Back-to-top | `opacity 0 / pointer-events none` at the top → visible after scrolling → smooth scroll lands at `scrollY 0` |
| Video modal | admin-configurable embed, portalled to `<body>` at `z-100`, two close buttons + Escape, page scroll locked and restored |
| `npm run verify` | **33/33** (adds: WebP on both upload paths, converted asset served as `image/webp`, logo height persisted + applied) |
| CMS images + banners + page builder (this pass) | media upload → WebP → served with `naturalWidth 1600`; media title/alt saved; a banner saved from `/admin/home` rendered on `/` with the image loading (1600×900); a "split" widget added in `/admin/layout` rendered on `/about`; group/store/job image fields saved and rendered; page image applied as the `/about` hero backdrop |
| Query dedup (measured) | `/business-groups/digital`: **4 queries** (Setting 1, group-by-slug 1, group list 1, store list 1). Uncached: 6 (Setting ×2, by-slug ×2) |
| Counter animation | animates via `textContent` (۸→۱۴, ۲→۴, ۱۶۲→۳۰۰+ observed) with no per-frame React renders |
| Orb scoped to the hero | opacity **1.00** with canvas mounted at y=0/600; **0.14** at y=1000; **0.00 with the canvas unmounted** from y=1100 to y=6000; remounts at y=0 |
| Fixed particle orb | `position: fixed`, identical box at scroll 0 / 1500 / 3000 (`left 32, top 98, 704×704`) — stationary while scrolling |
| Logo size | default **44px** in the header (was 36); admin form writes only `logo_height`; header applies `height:68px` when set |
| Shadows | card computed style now `rgba(0,0,0,0.35) 0 40px 80px -48px, …` (was `0 18px 40px -28px` at 0.55) |
| WebP | branding PNG → `logo-….webp`; media PNG → `….webp` served as `image/webp` |
| AI orb, first attempt | **wrong at full-screen**: a CSS composition scaled 4× left a 944px core with a **1px** ring stroke and a 42px glow — a flat pale disc clipped by the hero |
| Particle orb (current) | 3,200-point WebGL shell, fixed to the left of the viewport by request; canvas 704×704 at 1600px |
| (superseded) canvas orb | 800×800 canvas that docked into the hero on scroll — replaced by the fixed particle orb |
| Orb contrast (canvas pixels) | h1 **5.09:1** dark / **12.03:1** light; lead **7.31:1** / **6.27:1** after moving it to `ink-700` (was 4.21:1 / 3.14:1) |
| Admin orb preview | canvas draws at 176×176 in `/admin/home` |
| Post-change sweep | 15 pages × 4 widths = **0 overflow**; a11y = **0** in both themes; fresh-session console errors = **0** |
| Upload size limit | a 1.6 MB favicon POST returned **500** before, **200** after; a 3.7 MB file is blocked in-browser (message + disabled submit, **no request**) |
| Hero stat rail | each item's centre equals its value's centre (1234=1234, 945=945) |
| `/admin/home` | form populated, save → «بخش صفحه اصلی ذخیره شد.» → the public page reflects it (`HERO_UPDATED`) |
| Dark default | fresh visitor → `data-theme="dark"`, body `#0B0F0E`; OS preference ignored |
| Display width | container = **1280px at a 1600px viewport = exactly 80%** |
| Header stability | height constant at **119px** across the whole scroll threshold (was flipping 80↔96) |
| Content editor | toolbar (10 tools) + live preview on all 13 page editors; media picker opens with search + upload |
| Page CMS | editing `/about`'s eyebrow in the admin reached the **public** page on reload |
| Post-change sweep | 15 pages × 4 widths = **0 overflow**; fresh-session error check = **0 console errors** |
| UI standards pass | measured container, one 16px radius, no glass/glow, grids instead of a hidden horizontal scroller, nav at `xl` with short labels |
| Post-fix sweep | 12 pages × **4 widths** (1600/1280/820/390) = **0 overflow, 0 JS errors**; nav never wraps (single-line, constant 194px nav↔CTA gap) |

The browser pass is reproducible with the `agent-browser` CLI (installed globally; invoke
`C:\Users\Pc\AppData\Roaming\npm\agent-browser.cmd` since its bin dir is not always on PATH).

The E2E script (`scripts/e2e.mjs`) drives a running `next start` and exercises the real server
actions over HTTP: login (wrong password rejected; correct password sets the cookie and
303-redirects), an authenticated dashboard request, the home page (RTL, no server-rendered
`<canvas>`, app icon present), contact-form persistence, server-side field validation, newsletter
opt-in, and the **branding upload round-trip** (file written under `/uploads/branding/`, setting
persisted, uploaded logo rendered in the header). It cleans up every row and file it creates.

## 3. What is built

- **Public site** (23 pages): the redesigned home (3D hero with scroll transform, marquee band,
  bento intro grid, pinned horizontal group gallery, asymmetric channel grid, full-bleed metrics
  band, value chain, darkest Labs band with WebGL, news tiles, CTA), about, 5 business groups with
  detail pages, 4 channels with detail pages, innovation, services, units, media hub (news/blog
  detail pages, gallery, videos), contact, careers, and 4 legal pages.
- **Design system:** dark editorial — four-step surface elevation (`#070A09` band → `#0B0F0E`
  canvas → `#121A18` panel → `#16211E` tile), 1px hairlines at 9% white, teal glow, oversized
  Persian display scale (`.display-1/2/3`, `.kicker` with accent rules), self-hosted Vazirmatn,
  RTL, visible focus rings, reduced-motion support, skip link, ARIA on nav/dialog.
- **Motion layer** (`src/components/motion/`): `Reveal`/`Stagger`, `ScrollProgress`, animated
  `Counter`, `Tilt` (3D pointer tilt), `Marquee`, `Parallax`, `HorizontalScroll` (pinned,
  scroll-driven), `ScrollTransform`/`ScrollDrift` (hero), and an opacity-only page `template`.
- **3D layer** (`src/components/three/`): a WebGL hero (distorted icosahedron + rings + sparkles)
  and a Labs node-field, each behind a client-only gate with an in-view check, a reduced-motion /
  no-WebGL static fallback, and a capped DPR.
- **Cookie consent:** granular (necessary vs analytics), decline as easy as accept, re-openable
  from the footer, GA loaded only after consent.
- **Forms:** contact, job application (résumé upload), newsletter — server-validated, consent
  checkboxes, honeypot, rate limiting, DB persistence, works without JS.
- **Admin CMS:** session auth, dashboard, full CRUD for groups/stores/news/blog/careers, editor for
  the legal/about pages, forms inbox (messages, applications + status, subscribers) with CSV
  export, media library (upload, edit metadata, replace file, gallery flag), and settings —
  including the **logo + favicon upload** section.
- **Images everywhere:** every business group, store, news post, article, job opening and page can
  take a media-library image (`image` column + `ImageField`). News/article images are used on cards
  and at the top of the article; a page image overrides the global hero backdrop; the public
  `/media` gallery lists assets whose «نمایش در گالری» is on.
- **Home banners:** `HomeBanner` rows managed from `/admin/home` render as an accessible slider
  under the hero (image, title, subtitle, link, CTA, order, active). No rows = no section.
- **Page builder:** `/admin/layout` edits `PageBlock` rows per page. Ten widget types (heading,
  Markdown text, image, image+text, cards, stats, CTA, gallery, video, spacer) with add, edit,
  reorder, hide and delete; the public renderer lives in `components/site/page-builder.tsx` and is
  mounted below each page hero (including the home page and legal pages).
- **Branding:** uploaded logo used in header/footer/admin login; uploaded favicon overrides the
  bundled `/icon.svg` through the root metadata. Previous files are deleted on replace.
- **SEO:** per-page metadata, Open Graph (logo as image), `sitemap.xml`, `robots.txt`, `/admin`
  excluded from indexing.

## 4. What is NOT done — read before claiming completeness

1. **The WebGL scenes are now visually verified** — the hero (distorted icosahedron + rings +
   sparkles) and the Labs node-field both render in real Chrome at 390 / 820 / 1440 px, no console
   errors, with a static fallback when `prefers-reduced-motion` is set or WebGL is unavailable.
   *Still unverified:* frame rate on low-end/mobile hardware, and on Firefox/Safari — the pass ran
   on Chromium only.
2. **Content is representative, not the client's real data.** Registration number, national ID,
   address and phone numbers in `prisma/seed.ts` are plausible placeholders — replace them via
   `/admin/settings` before launch.
3. **No outbound email.** Forms persist to the database but notify nobody; submissions are read in
   `/admin/forms`. Adding notifications needs a mail provider and a `sendMail` call in
   `src/server/actions.ts`.
4. **No cover-image field on news/blog**, and **the media library is not wired into any editor** —
   cards use a shared placeholder SVG. There is no picker connecting an asset to a post.
5. **No image optimisation pipeline** — media/branding uploads are stored and served as-is.
6. **Newsletter is collection only** — no sending tool.
7. **Rate limiting is in-memory and per-instance** — fine for one node; use a CDN/WAF limiter in
   production.
8. **SQLite in development** — switch the Prisma datasource to PostgreSQL for production.
9. **`analytics_enabled` is informational** — GA loading depends on the stored `ga_id` and visitor
   consent, not on this toggle.
10. **Single admin role.** `AdminUser.role` exists but nothing enforces a distinction yet.
11. **No automated browser test for the admin UI** beyond HTTP-level checks.

## 5. Environment traps — read before running anything

- **The workspace is `C:\Users\Pc\namira-holding`.**
- **`NODE_ENV=production` is set machine-wide.** Two consequences:
  - `npm install` silently **skips devDependencies**. Reinstall with
    `set NODE_ENV=development&& npm install --include=dev` if `@types/node`, `typescript`,
    `tailwindcss` etc. are missing. This has bitten once.
  - Use `next build && next start` for verification; `next dev` inherits production mode.
- **PowerShell blocks `npm.ps1`.** Run npm through `cmd`, or call `npx` directly.
- **`APP_SECRET` in `.env` is local-dev only.** Keep it out of version control in real deployments.
- **SQLite file is `prisma/dev.db`** (gitignored). Delete it and re-run
  `npm run db:push && npm run db:seed` for a clean slate.
- **Runtime uploads are gitignored** (`public/uploads/`, `storage/uploads/`). The branding/media
  folders are created on demand.
- **Kill the server when done.** `netstat -ano | findstr ":3210"` must show no `LISTENING`. On
  Windows the launcher and the server are separate processes.

## 6. Decisions already made — do not relitigate

- **Standalone project, separate from `namira-next`.** The user stated "this is new project".
- **The theme is dark editorial, and the brand teal was kept as the accent.** The user chose both
  explicitly when asked. Greenfield alternative directions were offered and rejected; do not drift
  back to the light theme, and do not drop teal.
- **Tokens are named by ROLE, not lightness.** `ink-*` is the foreground scale, `surface-*` the
  background family, `line-200` the hairline, `dark-900` the deepest band, `accent` the on-dark
  text tone. That is why a full re-skin needed almost no markup edits — change values in
  `tailwind.config.js` + `globals.css`, not class names.
- **Colour contrast is a hard constraint on the palette.** `brand-700` is the primary fill because
  white on `brand-600` is only 3.5:1; solid teal panels are `brand-800` so their light text clears
  4.5:1. `accent` (`#7FB8AA`) exists specifically because `brand-700` text is unreadable on the
  dark canvas. Verify with `agent-browser a11y`, not by eye.
- **Markdown content headings start at `h2`.** The page owns the `h1`, so `renderMarkdown` maps
  `#`/`##` → `h2` and `###` → `h3`; the old `level + 1` mapping skipped a level and tripped the axe
  `heading-order` rule on `/about` and the legal pages.
- **The project is shadcn-layout-ready but `shadcn init` must NOT be run.** `components.json` and
  `src/components/ui/` were added by hand so registry components land in the right place, because
  `shadcn init` would rewrite `globals.css` and `tailwind.config.js` and destroy the dark editorial
  theme. `ui/` is for registry primitives; `site/`, `admin/`, `motion/` and `three/` are product code.
- **Exactly one ambient background effect on the home page.** The `KineticGrid` canvas is the
  whole-page background and the previous static `grid-lines` texture was deleted, not layered. Its
  wrapper is `overflow-visible` — `overflow-hidden` on an ancestor would break the pinned gallery's
  `position: sticky`.
- **Third-party registry components are adapted to our tokens, not pasted verbatim.** `KineticGrid`
  gained a `brand` theme (canvas `#0B0F0E` + accent/nodes/ripples) instead of the stock blue, plus
  tab-visibility pausing and reduced-motion handling to match this project's stated rules.
- **Runtime uploads are served by `GET /uploads/[...path]`, not by `public/`.** Diagnosed, not
  guessed: the file was on disk and referenced correctly in the markup, but `next start` returned
  404 because it only serves public files present at build time. That single cause explained both
  "the logo doesn't update" and "the favicon doesn't update". `scripts/e2e.mjs` now asserts the
  uploaded asset's status is 200 so this cannot regress silently.
- **The theme is CSS-variable driven, and full-bleed bands stay dark in both themes.** Tailwind maps
  `rgb(var(--token) / <alpha-value>)`; `[data-theme]` on `<html>` swaps the whole palette. `.band`
  re-declares the ink/accent tokens for its subtree, so the WebGL scenes and white-on-dark type stay
  correct in light mode without editing every element. The hero is deliberately NOT a band (the
  ambient grid shows through it), so it uses theme-aware `text-ink-900`.
- **Tailwind's `container` is disabled**; a fluid `.container` in `globals.css` provides full-width
  layout with responsive gutters. `.container-prose` keeps a readable cap for legal text — the one
  deliberate exception to "full width".
- **The video overlay is portalled to `<body>`.** The home page's ambient grid establishes a `z-10`
  stacking context, which capped an in-page modal below the sticky header. Any future overlay must
  do the same.
- **Scroll reveal lives in the page template, not in every section.** One IntersectionObserver tags
  top-level sections; the hidden state is applied by JS only and in-view sections are shown at once,
  so there is no blank first screen and no content that depends on JavaScript.
- **The hero model is interactive by design** (idle spin + pointer parallax + drag with momentum +
  hover response) rather than a decorative loop, and its colours come from `--s3-*` variables.
- **`RATE_LIMIT_DISABLED=1` is a local-verification seam only.** The form/login limiters are
  in-memory, so repeated `npm run verify` runs throttled themselves and reported false failures
  (observed: 7 failures that were entirely the limiter working). Start the verification server with
  the flag; **never set it in production**. The limiters were confirmed working with it unset.
- **"Full width" means full-bleed sections with measured content, not an uncapped container.**
  A 1240px cap was reinstated after an honest UI review: at 1600px the uncapped version spread
  headings and paragraphs across the entire monitor, which is what read as disorganised. Section
  backgrounds still run edge to edge.
- **The pinned horizontal gallery is gone.** It hid cards off-screen (they appeared cut in half) and
  required sideways scrolling to discover content. Groups are now a normal grid whose last row is
  centred, so all five are visible at once. `components/motion/horizontal-scroll.tsx` was deleted
  rather than left unused. The scroll-driven 3D hero still provides the "layout transforms" moment.
- **One radius (16px) for all non-circular elements, no glassmorphism, no decorative glows.**
  Mixed radii and translucent blur panels were part of what made the UI read as inconsistent; depth
  now comes from the four surface steps plus hairlines.
- **The desktop nav renders only from `xl` upward, with short labels.** Measured: the full-label bar
  needed 946px in a 791px slot and wrapped onto two lines. Shortening three labels and reducing
  padding brought it to 711px, and gating at `xl` means it never competes for space. Verified: single
  line at 1600/1440/1280, hamburger below, constant 194px nav↔CTA gap.
- **The ambient canvas is `-z-10`, not `z-0`.** This was the single biggest remaining visual defect:
  a positioned element with `z-index: 0` paints above non-positioned block backgrounds, so the grid
  bled through every panel, the newsletter band and the footer — no surface looked solid, which is a
  large part of why the UI read as noisy. Now opaque sections cover it and only transparent ones
  (the hero and the plain sections) reveal it. The grid wrapper therefore carries **no background of
  its own**. If a section still shows the grid, the first thing to check is this stacking rule.
- **The edit forms were blank, and that was the reported "malfunctioning sections".** The entity
  pages built their forms from a module-level `const fields` (and a `fields(publishedAt)` factory
  with only a date default), so every record opened with empty inputs — and saving would have
  overwritten the row with blanks. Fixed by making the fields a `fields(record)` factory per entity.
  The E2E suite now asserts a seeded group's name and slug appear as input values, so this cannot
  regress silently.
- **Every top-level page is editable through the `Page` table, not bespoke forms.** `PageHero`
  gained a `slug` prop and reads the matching row, falling back to the page's built-in copy when the
  row is missing or unpublished — unpublishing a menu item therefore reverts to the default copy
  instead of blanking the hero. Seed mirrors the built-in strings, so a fresh install is unchanged.
- **The content editor is Markdown, not HTML/WYSIWYG.** It reuses the existing `renderMarkdown`
  pipeline (which now handles images), so there is no second rendering path and no dependency risk.
  Images are referenced by URL from the media library; the renderer only accepts root-relative or
  `http(s)` sources, never `javascript:`.
- **Width reversed to 80%.** The earlier 1240px cap was replaced on request: `.container` is now
  `width: 80%` capped at 1800px (100% below 768px). At 1600px that is exactly 1280px. Reading
  measure is still protected by `.container-prose` for legal/article bodies.
- **The sticky header must never change height on scroll.** It previously swapped `h-20`/`h-16` when
  crossing the scroll threshold; that shifts the document under the scroll position, which feeds back
  into the threshold and produces the visible judder. Height is now constant (119px) and only colour
  and shadow animate.
- **A harness lesson worth keeping:** `agent-browser`'s error buffer is not reliably reset by
  `errors --clear` inside a long-lived session, and this machine's middleware throws an unrelated
  `EvalError: Code generation from strings disallowed`. Both produced a phantom "45 pages with
  hydration errors" report; a **fresh session** showed `errors: []` and a client/server DOM diff that
  matched exactly. Before believing a console-error count, re-measure in a new session.
- **`Get-Content -Raw` in PowerShell 5.1 mangles UTF-8 (Persian) probe files.** Pass scripted
  browser JS inline through the base64 path instead of reading it from a file.
- **3D is lazy and gated, never inline.** `ssr: false` + in-view mount + reduced-motion/no-WebGL
  fallback + capped DPR. These rules are in the README and must not be relaxed "for a nicer look".
- **The reported favicon error was the server-action body cap, not the favicon code.** Server
  actions default to **1 MB**; branding advertises 2 MB and the media library 5 MB, so any larger
  file was rejected at the transport layer with a **500** before the action could validate — which
  is exactly "an error and the page refreshes", with no message. Reproduced with a 1.6 MB file
  (POST 500, no feedback), fixed by `experimental.serverActions.bodySizeLimit: "6mb"` and a
  browser-side size check in both uploaders. E2E now posts a >1 MB file and asserts it is not a 500.
- **The hero orb is a canvas, and that is the point — not a decoration choice.** The first version
  was a CSS composition (gradient core, `border` rings, `box-shadow` glow) moved and sized with
  `transform: scale()`. That is structurally wrong for an element that must appear at two wildly
  different sizes: at full-screen the scale factor was ~4, so the core became a 944px circle with a
  1px ring stroke and a 42px glow — every detail that made it read as a sphere vanished and it
  rendered as a flat, washed-out disc. The canvas expresses every measurement as a fraction of its
  box, so the orb is correct at 170px and at 1000px. **The wrapper is resized, never scaled** — a
  scaled bitmap would soften the shading.
- **The orb has a per-theme palette.** A dark teal sphere at 55–65% opacity over a white page washed
  out to pale grey and wrecked the text contrast; light mode now draws a pale pearlescent orb whose
  mid-tone keeps near-black copy at 6–12:1. `SphereCanvas` watches `data-theme` and repaints.
- **Contrast over a canvas must be measured from pixels, not trusted from axe.** axe reports those
  nodes as *incomplete* (it cannot sample an image), which looks like a clean pass if you only read
  the violation count. Sampling a grid across the headline box and compositing the orb over the page
  background showed the lead copy at **3.14:1** in light mode — a real failure the tool never
  reported. It now uses `ink-700` (6.27:1 / 7.31:1).
- **The orb is `position: fixed` but scoped to the hero, and those two facts fight.** Fixed means it
  survives the hero; the brief says it must exist only inside it. The resolution is a scroll probe
  on the hero's rect: fade over the last 140px of the hero, and **unmount `ParticleOrb` entirely**
  once the hero is off screen. Unmounting (not just hiding) matters — a `visibility: hidden` canvas
  is still "intersecting" to IntersectionObserver, so the WebGL loop would keep running for the whole
  page while invisible. Verified: canvas present at y=0/600/1000, count **0** from y=1100 to 6000.
- **The orb is fixed, and `pointer-events: none` is why it uses a window listener.** Pinning it to
  the left means it overlaps content that scrolls underneath, so it must never intercept clicks.
  That also means it cannot receive canvas hover events, so the cursor is tracked with a
  window-level `pointermove`: canvas-relative coordinates drive the gravity warp, screen-relative
  coordinates lean the shell. `z-index: -1` keeps it above the ambient grid (-10) but below section
  backgrounds, so opaque bands hide it instead of the orb washing over text.
- **The logo height is a dedicated form, not a field on the settings form.** `saveSettings` writes
  every key in `EDITABLE_SETTING_KEYS`; adding `logo_height` there meant any partial post (and every
  future form refactor) could blank unrelated settings. `saveLogoSize` writes exactly one key.
- **WebP conversion is best-effort and skips vectors/icons.** SVG is preserved (rasterising loses
  scalability) and ICO is preserved (it is the favicon format). If sharp cannot decode a file the
  original bytes are stored rather than failing the upload — an optimisation must not reject work.
  Note the suite's old 1×1 PNG fixture is rejected by libpng ("read error"); the E2E now generates a
  real PNG with sharp so a fixture problem cannot masquerade as a conversion bug.
- **Installing a runtime dependency here prunes devDependencies.** `NODE_ENV=production` is set
  machine-wide, so `npm install sharp` removed `@types/node`, `@types/react-dom` and `vitest`,
  breaking typecheck. Always follow a dependency install with
  `set NODE_ENV=development&& npm install --include=dev`, and if `prisma generate` hits EPERM on the
  query-engine DLL, stop the running server first (it holds the file).
- **A measurement server can outlive its usefulness and poison the next check.** For the query-count
  baseline I started a server with `Start-Process` (to capture stdout). It kept holding 3210; the
  next `next start` silently failed to bind, and a rebuild deleted the chunks that server's HTML
  pointed at. The browser then rendered *our* error boundary (`ChunkLoadError`), and axe reported
  exactly three violations per page — `document-title`, `landmark-one-main`, `region` — because an
  error page has no title and no `<main>`. That pattern means **you are measuring an error page, not
  a regression**. Always stop the measurement server and check the listening PID before re-measuring.
- **`/admin/home` is the hero widget's control room**, backed by `hero_*` setting keys (group
  `hero`) rather than a new table — the settings store is already key/value with a group column. It
  edits the copy, both buttons, the `value|label` stat lines and the sphere's on/off switch, with a
  live sphere + stats preview.
- **Both stat rails are centred per item** using `flex flex-col-reverse` so the number renders above
  the label while the DOM keeps the valid `dt`-then-`dd` order. The hero rail is its own bordered
  panel, so it reads as a distinct section rather than a divider on the hero copy.
- **Only one WebGL moment left: the Labs band.** The hero's scene was replaced by the CSS sphere;
  WebGL elsewhere is decoration at best and would cost performance, so the guidance stands that an
  effect must earn its place.
- **React Three Fiber + drei, not raw Three.js or GSAP.** The stack is React/Next; R3F is the
  idiomatic binding and drei supplies the ready-made helpers.
- **A component class that sets `color` must live in `@layer components`, never `utilities`.** Rules
  in the utilities layer are emitted *after* the utility classes themselves, so they win the
  cascade and `text-white` silently stops working on dark sections. `display-1/2/3`, `heading-1/2/3`,
  `kicker`, `glass` and `surface-dark` are all in `components` for exactly this reason. This bug
  once made the hero headline invisible (dark-on-dark); do not move them back.
- **The page `template` animates opacity only.** A transform there creates a containing block and
  breaks sticky/pinned sections.
- **The pinned horizontal gallery measures in pixels and accounts for RTL** (positive
  `translateX` in RTL), and degrades to a native horizontal scroller on small screens and for
  reduced motion — which is also what renders on the server, so there is no hydration jump.
- **Content-driven, not hard-coded.** Groups, stores, news, blog, careers and legal pages are DB
  rows editable from `/admin`.
- **Server Actions with progressive enhancement.** Forms work without JavaScript.
- **A tiny in-repo Markdown renderer** instead of a Markdown dependency (escapes input first).
- **Branding files live in `public/uploads/branding/`** and the previous file is deleted on
  replace. Favicon override goes through the root `generateMetadata`, falling back to `/icon.svg`.
- **Placeholder art, not stock photos.** Images are original inline SVGs, so nothing ships with an
  unclear licence.

## 7. Running and verifying

```cmd
cd C:\Users\Pc\namira-holding

npm run typecheck
npm run lint
npm test
npm run build

npx next start -p 3210        & rem then, in another shell:
set E2E_BASE=http://localhost:3210&& npm run verify
```

Development admin login: `admin@namiragroup.ir` / `NamiraAdmin!2026`.

### A recurring testing lesson

Two E2E failures in this project were **flaws in the test, not the app**, and both had the same
cause: a page can render **several `<form>` elements**, and a naive "first form / all `$ACTION`
hidden fields" extractor grabs the wrong one.

- First: `/contact` has the contact form *and* the newsletter band form — merging both meant the
  newsletter action ran.
- Second: `/admin/settings` renders the admin topbar's **logout** form before the page's own
  forms, so an upload test actually logged the session out (a 303).

The extractor now takes an optional predicate to select a form by content. If a form test fails
with an unexpected redirect, check which form the harness actually posted.

### Browser verification (real Chrome)

Run against `next start` at 1440×900, 820×1180 and 390×844. What was checked and found:

- **WebGL renders.** The hero canvas and the Labs node-field both mount and paint; the pinned
  gallery's `translateX` moves 0 → 884px (the computed range) as the page scrolls.
- **Reduced motion is honoured.** With `set media light reduced-motion` the canvas count is 0 and
  the static fallback renders. Mobile drops the pinned mode for a native horizontal scroller.
- **Layout is sound.** No horizontal overflow on any page at any of the three widths; gallery cards
  are uniform (420×437); no JS errors on any page.
- **Accessibility: 0 axe violations.** Two were found and fixed: the marquee's `text-ink-900/40`
  (contrast) and the unlabelled newsletter `<section>` (missing landmark). The remaining `incomplete`
  item is the hero text over the WebGL canvas, which axe cannot measure — contrast there is ~8:1.

Known cosmetic console output: one `THREE.Clock: This module has been deprecated` **warning** on
pages with WebGL. It comes from `@react-three/fiber` internals against three 0.186, not from this
codebase; it is harmless and would need a three downgrade to silence.

Useful commands (the CLI lives off PATH on this machine):

```powershell
$ab = 'C:\Users\Pc\AppData\Roaming\npm\agent-browser.cmd'
& $ab set viewport 1440 900
& $ab open http://localhost:3210/ ; & $ab screenshot shot.png
& $ab a11y ; & $ab vitals ; & $ab errors ; & $ab console
& $ab set media light reduced-motion      # verify the no-WebGL fallback
& $ab close --all
```

## 8. How to start the next session

Point a new session at this file, then name the work item. For example:

> Read `C:\Users\Pc\namira-holding\CONTINUATION.md`, then open the site in a real browser and
> confirm the hero and Labs WebGL scenes render at 60fps and fall back correctly with reduced
> motion enabled.

or

> Read `C:\Users\Pc\namira-holding\CONTINUATION.md`, then wire media-library selection into the
> news/blog cover-image field.

## 9. Design references used

- Holding-company style: Tohshin Partners (whitespace), Novo Holdings (structured authority),
  Prior Holdings (minimal), Vivium Holding (scroll-triggered), Reyes Holdings (scale of operations).
- WebGL craft: Awwwards-tier guidance — cap DPR, render only when visible, respect
  `prefers-reduced-motion`, ship a graceful fallback; choose particle fields / scroll-driven 3D
  over full-page spectacle.

## 10. Working style the user expects

- **Do not pause for clarification.** Proceed on best judgement and state the assumption afterwards.
- **No placeholder features.** No "coming soon", no button that does nothing. If something is not
  built, say so plainly (see §4).
- **Verify, then report honestly.** Drive the real endpoint. When a check fails, find out whether
  the app or the test is wrong (§7 has two examples of the latter).
- **Never overstate.** Known gaps are listed, not hidden.
