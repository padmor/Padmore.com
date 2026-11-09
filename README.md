# Padmore.com

Personal developer portfolio for Padmore Yeb: projects, tutorials, achievements, a members-only community and a follow feature, built with Next.js and a Neon Postgres backend.

## Features

- **Portfolio:** home, About me (profile, education, schools and programmes, certificates), projects, live projects and achievements with PDFs, images and video.
- **Tutorials:** articles with attached files of many types (Markdown, PDF, slides, audio, video). Reading, watching and listening are free; downloading files needs a free account.
- **Community:** anyone can read; posting, replying and voting need a sign-in.
- **Accounts:** sign in and sign up, return to the page you came from, saved tutorials and projects, a dashboard with a feed of new content since you followed.
- **Follow:** follow the site to see new tutorials and projects in your dashboard.
- **Admin:** staff tools for content, files, enquiries and subscribers.

## Tech stack

Next.js 16 (App Router, server actions), React 19, TypeScript, Tailwind CSS v4 with shadcn/ui components alongside the site's own CSS, Neon Postgres with row-level security, Neon Auth, Resend, Vitest and Playwright.

> This Next.js version differs from older releases. Read the guides in `node_modules/next/dist/docs/` before changing framework-level code (see `AGENTS.md`).

## Getting started

Requires Node.js 22 LTS (20.9 or newer).

```bash
npm install
cp .env.example .env      # then fill in the values
npm run db:migrate        # applies db/migrations/*.sql
npm run dev               # http://localhost:3000
```

### Environment variables

See [.env.example](.env.example). `.env` is git-ignored and must never be committed. The server role (`DATABASE_SERVER_URL`) must be the limited `app_server` role, never the owner.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build and server |
| `npm run typecheck` | TypeScript check |
| `npm test` | Unit tests (Vitest) |
| `npm run test:community` | Browser tests for the Community, Follow, Saved items, tutorial and achievement files (needs a running build) |
| `npm run test:e2e`, `test:portfolio`, `test:forms`, `test:admin`, `test:content` | Other browser suites |
| `npm run db:migrate` | Apply database migrations |

The browser tests need Microsoft Edge and a running app, and they create and remove throwaway accounts in the database named in `.env`. Run them against a development database.

## Project structure

```
app/            Routes, layouts and route handlers (tutorial-files, achievement-files, state endpoints)
components/     Shared site shell, icons, and shadcn/ui components (components/ui)
features/       Feature UI: home, projects, tutorials, community, follow, achievements, admin, auth ...
modules/        Server-side logic per area: repositories, actions, validation
lib/            Shared helpers: auth, environment, data models, utilities
db/             Drizzle schema, SQL migrations and seed
scripts/        Migration and database check scripts
tests/          Unit tests and browser suites
docs/           Architecture, design system, module map, verification report
foundation/     HTML, CSS and JavaScript learning exercises and a static preview (not part of the app)
public/         Static images and videos
```

The application is a modular monolith. See [docs/architecture.md](docs/architecture.md), [docs/module-map.md](docs/module-map.md) and [docs/design-system.md](docs/design-system.md).

## Deployment

1. Create a Neon project, run `npm run db:migrate`, and enable Neon Auth and the Data API.
2. Create the project on a host such as Vercel and import this repository.
3. Add every variable from `.env.example` as a production secret. Set `APP_URL` to the live domain.
4. Build command `npm run build`, start command `npm start` (Vercel detects these).
5. In Resend, verify your sending domain before turning on email.

## Known limits

- Uploaded files are stored in the database and are limited to 4 MB each. Use YouTube or Vimeo links for large video and audio.
- Follower emails are not sent yet. Followers see new content in their dashboard. Email needs a verified Resend sender.
- Sample copy and the portrait placeholder (`public/images/portrait-reference-placeholder.webp`) should be replaced with approved personal material before launch.
