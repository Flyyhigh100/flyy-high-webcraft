
# Fix Hero Section "Get Started" Button

## Problem
The "Get Started" button in the Hero section links to `/get-started` instead of `/project-intake`. You want users to go to the multi-step intake form.

## Solution
Update the Hero section button to navigate to `/project-intake` and use React Router's `Link` component for proper client-side navigation (matching the pattern used elsewhere in the app).

## Change Required

**File: `src/components/home/HeroSection.tsx`**

Change line 25-27 from:
```tsx
<Button asChild className="bg-primary hover:bg-accent text-primary-foreground px-8 py-6 text-lg">
  <a href="/get-started">Get Started</a>
</Button>
```

To:
```tsx
<Button asChild className="bg-primary hover:bg-accent text-primary-foreground px-8 py-6 text-lg">
  <Link to="/project-intake">Get Started</Link>
</Button>
```

Also add the import at the top:
```tsx
import { Link } from 'react-router-dom';
```

## Why This Matters
- Users clicking "Get Started" in the hero will now see the comprehensive multi-step intake form
- Using `Link` instead of `<a>` provides smooth client-side navigation without full page reload
- This aligns with the established user onboarding flow where all primary CTAs direct to `/project-intake`
