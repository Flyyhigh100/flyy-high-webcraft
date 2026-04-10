

## Problem

The header bounces/shakes on scroll because `transition-all duration-300` is applied to the header, container, logo, and text. When scrolling crosses the 20px threshold, the height of the sticky header animates (logo shrinks from h-32 to h-16, padding changes), which pushes page content up/down. This can cause a feedback loop: the header shrinks → content moves up → scrollY drops below 20 → header expands → content moves down → scrollY goes above 20 → repeat. This creates the "stuck zooming" bounce effect.

## Fix

1. **Remove `transition-all` from the header and container** -- use instant size changes instead of animated ones to prevent the scroll feedback loop.
2. **Keep transitions only on non-layout-affecting properties** (like colors), or switch to a small hysteresis threshold to prevent rapid toggling.
3. **Add scroll hysteresis** -- use different thresholds for scrolling down vs up (e.g., shrink at 20px, expand back only when < 5px) to prevent rapid state toggling.

### Changes in `src/components/layout/Header.tsx`:
- Remove `transition-all duration-300` from the `<header>`, container `<div>`, logo `<img>`, and brand text `<Link>`.
- Add a hysteresis check: only toggle `scrolled` back to false when scrollY < 5 (instead of 20).
- Optionally keep subtle color transitions but not size/padding transitions.

This eliminates the layout-shift feedback loop that causes the bouncing.

