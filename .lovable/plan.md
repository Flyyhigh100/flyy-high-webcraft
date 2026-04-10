

## Inline Engagement Widget with Data Capture

Replace the current "link-only" widget with a two-step inline form that captures visitor info without navigating away.

### User Flow

```text
Step 1 (Initial view):
┌──────────────────────────────┐
│ ● Have a project in mind?  X │
│                              │
│  Name:    [____________]     │
│  Email:   [____________]     │
│  Interest: [ Select ▼  ]     │
│                              │
│  [ Send It Over →  ]        │
│                              │
│  Or: Quick Question | Quote  │
└──────────────────────────────┘

Step 2 (After submit):
┌──────────────────────────────┐
│ ✓ Thanks! We'll be in touch. │
│   (auto-dismiss after 3s)    │
└──────────────────────────────┘
```

### What We Capture
- **Name** (text input)
- **Email** (text input)
- **Interest** (select dropdown): New Website, Redesign, E-Commerce, Other

### Where Data Goes
- Inserted into the existing `newsletter_subscribers` table with `source: 'engagement_widget'` for the email (lightweight, already has anon INSERT RLS)
- Also calls the existing `submit-project-inquiry` Edge Function to store the full inquiry in `project_inquiries` and trigger admin notification emails to the SydeVault team (kofi@sydevault.com / chris.d.conley@gmail.com)

This reuses existing infrastructure -- no new tables or Edge Functions needed. The `submit-project-inquiry` function already handles rate limiting, validation, and sends both a confirmation email to the visitor and a notification to the admin.

### Implementation

| File | Change |
|------|--------|
| `src/components/home/EngagementWidget.tsx` | Replace link buttons with inline form (name, email, interest dropdown). Add form state, validation, submit handler that calls `supabase.functions.invoke('submit-project-inquiry')`. Show success state after submission. Keep the "Quick Question" and "Free Quote" links as secondary options below the form. |

### Details
- Client-side validation: name required, email format check
- Loading state on submit button
- On success: show checkmark + "We'll be in touch" message, auto-dismiss after 3 seconds
- On error: toast notification, form stays open
- The interest dropdown value maps to `projectType` in the Edge Function payload
- `projectDescription` will be auto-filled as "Submitted via engagement widget - interested in [selection]"

