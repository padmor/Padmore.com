# Technical architecture and implementation standards

## Application shape

Use a modular monolith: one Next.js application with explicit feature boundaries. Do not introduce microservices until measured scaling or independent deployment needs justify them.

## Feature boundaries

Each feature should own its view components, types, validation and data-access contracts. Suggested areas:

- profile
- projects
- tutorials
- store
- hosted-apps
- community
- collaboration
- project-requests
- achievements
- updates
- admin
- analytics

Cross-feature communication should use typed service interfaces or narrowly scoped events. Avoid importing one feature's private implementation files from another feature.

## Security boundaries

- Public routes can read published public content only.
- Member-owned records must be scoped to the authenticated user on the server and reinforced with database RLS.
- Admin role must be server-controlled, never inferred from editable profile metadata or a client-side flag.
- Payment webhooks must verify provider signatures and transaction references before creating an entitlement.
- Paid files must remain in private storage; downloads should use short-lived signed URLs after checking an entitlement.
- Keep secrets out of browser bundles and `NEXT_PUBLIC_` variables.

## Performance

- Prefer server components for content and client components only where interaction requires them.
- Avoid repeated nested scans; use keyed maps for repeated in-memory ID lookups and database indexes for frequently queried fields.
- Debounce search; paginate potentially large collections.
- Avoid premature `memo`/`useMemo`; measure first.
- Use responsive, dimensioned images and lazy-load non-critical imagery.
- Cache versioned static assets for a long period; revalidate public pages when published content changes.
- Never shared-cache private user, admin, payment or enquiry responses.

## Module completion checklist

- Requirements and data contracts documented.
- Semantic markup and keyboard support implemented.
- Responsive layouts checked at compact, standard and wide viewports.
- Loading, empty, error, success, disabled and focus states implemented.
- Input validation exists on the client and server where applicable.
- Authorization and data visibility reviewed.
- Unit/component/integration tests added for critical paths.
- No unintended changes to approved modules.
- Build and typecheck pass.
- Performance and accessibility measurements recorded.
- Docs updated.
