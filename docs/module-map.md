# Feature module map

The application is a modular monolith. Each feature owns its page-specific UI and behaviour; global navigation, icons, typography and generic form feedback remain shared.

| Module | Location | Current routes |
|---|---|---|
| Profile | `features/profile`, `app/about`, `app/profile` | `/about`, `/profile` |
| Projects | `features/projects`, `app/projects` | `/projects`, `/projects/[slug]` |
| Tutorials | `features/tutorials`, `app/tutorials` | `/tutorials`, `/tutorials/[slug]` |
| Store | `features/store`, `app/store`, `app/cart` | `/store`, `/store/[slug]`, `/cart` |
| Community | `features/community`, `app/community` | `/community` |
| Collaboration | `features/collaboration`, `app/build-with-me` | `/build-with-me` |
| Client requests | `features/project-requests`, `app/request-project` | `/request-project` |
| Contact/subscriptions | `features/contact`, `app/contact` | `/contact` |
| Hosted applications | `features/hosted-apps`, `app/hosted-apps` | `/hosted-apps` |
| Achievements | `features/achievements`, `app/achievements` | `/achievements` |
| Updates | `features/updates`, `app/updates` | `/updates` |
| Authentication | `features/auth`, `app/signin`, `app/signup` | `/signin`, `/signup` |
| Admin | `features/admin`, `app/admin` | `/admin` |
| Analytics | `features/analytics`, `app/admin` | Admin analytics preview |
| Achievements/updates | `app/achievements`, `app/updates` | `/achievements`, `/updates` |

## Shared application layer

- `components/` — shell, watch-sized glance view, icon, page intro, theme control and generic form feedback.
- `lib/data.ts` — illustrative typed data used by the current front-end preview.
- `app/globals.css` — single design-token and responsive styling system.

## Rules for future work

1. Feature components stay inside their feature folder.
2. Feature-specific validation and services stay beside the feature.
3. Cross-feature imports should use public feature exports or shared contracts, not private implementation files.
4. Only generic UI primitives belong in `components/`.
5. Backend repositories must return typed domain data and enforce authorization server-side.
6. Each feature should add unit/integration tests before it is considered complete.
