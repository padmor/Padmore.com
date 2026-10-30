# Padmore Yeb — Personal Developer Portfolio

A modular, light-mode-first personal portfolio built from the supplied 1536×1024 UI reference. The application uses semantic HTML, custom CSS, browser JavaScript through React client components, TypeScript, React and the Next.js App Router.

## Design source and fidelity notes

- `docs/visual-reference.jpg` is the supplied visual board, retained for side-by-side comparison.
- The design is reproduced as separate pages rather than trying to render the composite reference image as a single webpage.
- The supplied board contains example data and a portrait. The portrait crop in `public/images/portrait-reference-placeholder.webp` is a temporary reference placeholder, not an assertion that it is Padmore's actual photograph. Replace it with an approved personal portrait.
- The sample projects, tutorials, products, prices, members and dashboard values are illustrative. Replace them with accurate content before public launch.
- The page layouts follow the reference's white/soft-grey surfaces, deep navy type, electric-blue primary controls, violet/cyan accents, rounded cards, light borders and spacious typography.

## Technology

- HTML5 semantics
- Custom CSS design tokens and responsive styling
- JavaScript / TypeScript
- React
- Next.js App Router
- CSS-based icons and illustrations (no icon-pack dependency)

Pinned framework versions in `package.json`:

- Next.js 16.4.3
- React / React DOM 19.3.1
- TypeScript 6.0.3 (compatible conservative pin; update deliberately after checking framework support)

Next.js 16 requires Node.js 20.9 or newer. Node.js 22 LTS is recommended for local development.

## Run locally (Windows 11 / PowerShell)

1. Install Node.js 22 LTS if it is not already installed.
2. Extract this project folder.
3. Open the folder in VS Code. The first `npm install` will create a `package-lock.json` for your machine; commit it after installation succeeds.
4. Open Terminal → New Terminal.
5. Run:

```powershell
npm install
npm run dev
```

6. Open `http://localhost:3000` in your browser.

Production checks:

```powershell
npm run typecheck
npm run build
npm run start
```

## Development progression: HTML → CSS → JavaScript → TypeScript → React → Next.js

The `foundation/` directory preserves the intended learning sequence:

1. `foundation/01-html/index.html` — semantic HTML structure.
2. `foundation/02-css/` — design tokens and responsive CSS styling.
3. `foundation/03-javascript/` — browser-side validation and interaction without a framework.
4. The production application under `app/`, `components/`, `features/` and `lib/` then applies TypeScript, React and Next.js. HTML, CSS and JavaScript remain the browser foundation; React and Next.js organize and deliver the final application rather than replacing web standards.

## Route map

- `/` — homepage
- `/about` — personal profile
- `/projects` and `/projects/[slug]` — searchable portfolio and project details
- `/tutorials` and `/tutorials/[slug]` — learning hub and article pages
- `/store`, `/store/[slug]`, `/cart` — product catalogue and demo cart
- `/hosted-apps` — hosted application directory
- `/community` — community preview
- `/build-with-me` — collaboration opportunities and application form
- `/request-project` — client project intake form
- `/achievements` and `/updates` — milestones and development feed
- `/contact` — contact form and contact placeholders
- `/profile` — public profile preview
- `/signin` and `/signup` — authentication UI previews
- `/dashboard` — member dashboard preview
- `/admin` — admin dashboard preview

## Architecture

- `app/` — route-level Next.js pages, layouts, loading/error boundaries and metadata.
- `components/` — shared site shell, watch view, icon set, page intro, theme control and generic form feedback.
- `features/` — implemented feature boundaries for profile, projects, tutorials, store/cart, hosted apps, community, collaboration, client requests, contact, authentication preview, achievements, updates, admin preview and analytics cards. Each feature owns its components and relevant local state/validation.
- `lib/` — typed content models, illustrative data and shared helpers.
- `public/` — optimized static assets and image placeholders.
- `foundation/` — progressive HTML, CSS and JavaScript exercises.
- `docs/` — supplied visual reference, module map, architecture notes, design tokens and verification report.
- `tests/` — manual acceptance and responsive QA checklist.
- `tests/` — manual acceptance and responsive QA checklist.

The target architecture is a modular monolith. Feature modules should own their components, types, validation, services and tests; shared UI, authentication, storage and database access should be provided through explicit common interfaces.

## Functional status and important limits

Working in this front-end starter:

- Next.js page routing and shared navigation.
- Responsive navigation and compact bottom navigation.
- Light/dark theme preference stored locally.
- Project search, category and status filters.
- Tutorial search and category filtering.
- Project bookmarks stored locally in this browser.
- Add/remove products in a local demo cart.
- Client-side form validation and visible success/preview feedback.
- Loading skeleton, error and not-found screens.

Not connected yet (do not treat as production functionality):

- Supabase database, real authentication, sessions and Row Level Security.
- Secure project-request or collaboration form submission.
- Email newsletter delivery or notifications.
- Paystack / Flutterwave payment processing.
- Real download entitlements, license keys or protected source-code delivery.
- Real admin authorization, analytics or customer records.
- Actual hosted-app URLs, GitHub links, approved profile photo and final personal content.

Form submissions currently show a local preview confirmation only. No personal data is transmitted. Authentication pages are visual previews and do not store or send passwords. The admin page is explicitly marked as a preview and is not secured. The cart uses local storage only and does not process payments.

Before production, connect a backend and enforce server-side authorization, private form storage, payment verification/webhooks, private object storage and audit-friendly order records. Never unlock paid downloads based on a browser-side success state.

## Responsive and accessibility rules

- Fluid layouts and typography using CSS Grid, Flexbox, `clamp()`, and content-driven breakpoints.
- No dependency on device-name detection; foldables and split-screen layouts reflow according to viewport width.
- A compact watch-sized mode prioritizes short information and quick links. Long forms, checkout and admin workflows should be continued on a larger screen.
- Respect safe areas, keyboard focus, semantic landmarks and reduced motion.
- Breakpoints are content-driven; test at 160, 240, 320, 360, 430, 600, 768, 1024, 1366 and 1920 CSS pixels.

## Performance strategy

- Next.js route-level splitting and server-first rendering.
- Responsive image sizes and AVIF/WebP output via `next/image` configuration.
- No mandatory animation or icon libraries.
- Compression enabled at the Next.js server layer; enable Brotli at the CDN/hosting layer where supported.
- Static assets should use fingerprinted URLs and immutable caching after production deployment.
- Public content may use deliberate revalidation; authenticated pages, admin, orders and private submissions must never enter a shared public cache.
- Keep search and filtering scoped to loaded datasets; use indexed database queries and cursor pagination after connecting the backend.
- Performance budgets are targets, not verified results. Measure Core Web Vitals with real-user or lab tooling before claiming thresholds are met.

## Recommended next development tasks

1. Replace the temporary portrait and illustrative sample content with verified personal material.
2. Convert `features/` from an empty directory into separate project, tutorial, store, community, collaboration and enquiry modules.
3. Add automated tests and inspect each route at the agreed reference viewport.
4. Connect Supabase Auth/Postgres/Storage with least-privilege RLS policies.
5. Connect server-verified payment provider flows and secure product delivery.
6. Verify visual fidelity using individual source screenshots for each target panel, because the master image is a composite board.

## Quick visual preview without installing packages

Open `preview.html` directly in Chrome or Edge to inspect the homepage composition and shared design styles. This is a static visual aid only; use the Next.js app (`npm install` then `npm run dev`) for real page routing and interactive feature previews. The `foundation/` exercises are deliberately separate from the Next.js application so the HTML → CSS → JavaScript learning progression remains visible without duplicating the production app.
