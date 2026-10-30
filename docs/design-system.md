# Personal portfolio design system

## Brand and visual direction

This is Padmore Yeb's personal developer portfolio. It is not a separate company brand. The default experience is light mode, based on the supplied reference board.

## Colour tokens

| Token | Value | Usage |
|---|---|---|
| Background | `#FFFFFF` | Main page background |
| Soft background | `#F6F8FD` | Alternating page and panel surfaces |
| Muted background | `#F0F4FB` | Secondary panels |
| Main text | `#101B3D` | Headings and primary text |
| Secondary text | `#344566` | Body and supporting text |
| Muted text | `#72809A` | Metadata and helper copy |
| Border | `#E5EBF5` | Card and input borders |
| Primary | `#4169F5` | Main buttons, links and focus |
| Primary hover | `#3158E8` | Hover/pressed emphasis |
| Violet | `#8058ED` | Secondary highlight |
| Cyan | `#35BCD2` | Supporting accent |
| Success | `#15966B` | Positive states |
| Warning | `#B7791F` | Warning states |
| Danger | `#D9485F` | Error states |

## Typography

- Use the system sans-serif stack with Inter preferred when available.
- Headings use a tight line-height and negative letter spacing.
- Body text prioritizes comfortable reading over visual density.
- Metadata, labels and captions use a smaller scale but remain readable.
- Avoid fixed font sizes where fluid sizing with `clamp()` is more appropriate.

## Shape and elevation

- Small radius: 10px.
- Medium radius: 16px.
- Large radius: 22px.
- Extra-large radius: 28px.
- Use thin borders first; use soft shadows only for raised interactive surfaces.
- Avoid heavy shadows and decorative outlines on every element.

## Interaction states

Shared controls should define default, hover, active/pressed, focus-visible, disabled, loading, success and error states as appropriate. Do not convey status using colour alone; pair it with a label or icon.

## Feedback and motion

- Content loading: skeleton shimmer.
- Short operations: small inline spinner.
- Measurable long operations: real progress value.
- Images: reserve dimensions and reveal after loading.
- Navigation: lightweight progress indication only when navigation is actually pending.
- Respect `prefers-reduced-motion`.
- Prefer transform and opacity transitions and keep feedback immediate.

## Responsive rules

- Fluid page containers and typography.
- CSS Grid and Flexbox for content-driven reflow.
- Container queries when reusable components need local responsiveness.
- No hover-only interactions.
- No fixed-width page layouts.
- Avoid horizontal page overflow.
- Watch-sized viewports up to 200 CSS px use the compact glance experience; complex forms, checkout and admin functions require a larger screen.
- Test narrow widths, foldable/split-screen widths, portrait, landscape and browser zoom.

## Fidelity rule

The supplied composite reference image is the visual source of truth. Implement each panel as its own real route/component using the shared tokens above. Do not render the composite image as a webpage. Do not independently redesign approved screens. Where the composite does not supply enough resolution/detail, preserve the overall system and mark the exact asset/content that needs the original source file.
