# Manual QA checklist

## Responsive viewports

- [ ] 160 × 160 watch-sized compact state
- [ ] 240 × 320 narrow viewport
- [ ] 320 × 568 small phone
- [ ] 360 × 800 phone
- [ ] 430 × 932 large phone
- [ ] 600 × 900 compact tablet
- [ ] 768 × 1024 tablet / unfolded compact foldable
- [ ] 1024 × 768 landscape tablet / laptop
- [ ] 1366 × 768 laptop
- [ ] 1536 × 1024 design reference size
- [ ] 1920 × 1080 desktop
- [ ] 200% zoom and landscape layout

## Navigation and content

- [ ] Desktop navigation and More menu
- [ ] Mobile menu and bottom navigation
- [ ] Project search, category and status filters
- [ ] Project details and bookmarks
- [ ] Tutorial search, categories and article anchors
- [ ] Store category filters and product details
- [ ] Add/remove items from cart; cart survives reload
- [ ] Community follow preview state
- [ ] Build With Me application validation
- [ ] Request a Project form validation
- [ ] Contact and newsletter preview states
- [ ] Sign-in/sign-up preview states (never transmit real credentials)
- [ ] Theme toggle persists after reload
- [ ] Admin preview warning remains visible

## Accessibility and recovery

- [ ] Keyboard-only navigation and visible focus
- [ ] Screen-reader labels and landmarks
- [ ] Reduced-motion preference
- [ ] Empty results and invalid forms
- [ ] Loading skeleton and 404 page
- [ ] Offline/failed submission behaviour before production backend integration

## Production gates

- [ ] Replace sample copy, metrics, profile photo, products and prices
- [ ] Connect secure auth and database RLS
- [ ] Protect admin with server-enforced role checks
- [ ] Persist private enquiries only on a secured backend
- [ ] Verify payment transactions and webhooks on the server
- [ ] Protect download files and entitlements
- [ ] Replace placeholder production domain in metadata, sitemap and robots
- [ ] Run `npm run typecheck` and `npm run build`
- [ ] Measure Core Web Vitals on real devices and networks
