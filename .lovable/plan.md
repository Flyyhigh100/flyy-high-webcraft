
# Scroll-to-Top Fix for Page Navigation

## Problem
When navigating to the Project Intake page (`/project-intake`), the page starts at the form instead of showing the header with the title and description. Clients should see the full page context when first arriving.

## Root Cause
The `MultiStepIntakeForm` component has a scroll behavior that triggers on initial mount:

```typescript
// Current code (lines 178-183)
useEffect(() => {
  if (formRef.current) {
    formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}, [currentStep]);
```

This runs when `currentStep` is initialized to 0, causing an immediate scroll to the form element - overriding the `ScrollToTop` component that already exists in the Layout.

## Solution

### File: `src/components/intake/MultiStepIntakeForm.tsx`

Add a ref to track whether this is the initial mount, and only scroll on actual step changes (not initial load):

```typescript
// Add new ref after existing refs
const isInitialMount = useRef(true);

// Update the useEffect
useEffect(() => {
  // Skip scroll on initial mount - let ScrollToTop handle it
  if (isInitialMount.current) {
    isInitialMount.current = false;
    return;
  }
  
  // Only scroll to form when step changes (not on initial load)
  if (formRef.current) {
    formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}, [currentStep]);
```

This ensures:
- Initial page load: User sees the page from the top (title, description, then form)
- Step navigation: Form scrolls into view for a smooth multi-step experience

## Other Pages
The `ScrollToTop` component is already properly integrated in the Layout and handles all other pages correctly. The `/invite` and `/client-onboarding` pages are standalone with centered content, so they don't need scroll handling.

---

## Technical Details

| File | Change |
|------|--------|
| `src/components/intake/MultiStepIntakeForm.tsx` | Add `isInitialMount` ref to prevent scroll on first render |

**Lines affected:** 20-21 (add ref), 178-183 (modify useEffect)
