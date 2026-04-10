

## Timed Engagement Widget Plan

A subtle slide-in widget that appears after a visitor has been browsing for ~45 seconds. Not a modal/popup — a small card that slides up from the bottom-right corner, easy to dismiss, and doesn't block content.

### Design
- Small card (max ~320px wide) slides up from bottom-right after 45 seconds on site
- Only shows once per session (tracked via `sessionStorage`)
- Dismissed with an X button; smooth slide-out animation
- Dark card matching the site's `bg-card` / `border-border` theme with gold accent
- Does NOT show on admin/dashboard routes or for logged-in users

### Content Options (rotating or single)
The widget asks a friendly, low-commitment question:

> **"Have a project in mind?"**
> Tell us what you're looking for and we'll get back to you within 24 hours.
>
> [Quick Question] [Get a Free Quote]

- **"Quick Question"** → links to `/contact`
- **"Get a Free Quote"** → links to `/get-started`
- Alternatively, a simple email capture field: "Drop your email and we'll reach out" (reuses newsletter subscriber insert)

### Implementation

| File | Change |
|------|--------|
| New: `src/components/home/EngagementWidget.tsx` | Slide-in card component with 45s timer, sessionStorage check, dismiss logic |
| `src/components/layout/Layout.tsx` | Render `<EngagementWidget />` for non-authenticated users only |

### Behavior Details
- Timer starts on `Layout` mount; after 45s, widget slides in
- `sessionStorage.setItem('engagementShown', 'true')` prevents repeat
- Skip rendering if `user` is logged in (from `useAuth`)
- Slide-in via CSS transform transition (`translate-y-0` from `translate-y-full`)
- Fixed position: `bottom-4 right-4`, z-index below modals

