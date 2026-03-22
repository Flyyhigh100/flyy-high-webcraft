

## Add Logo Image & Center Brand Name in Header

**Current state**: The Header shows only the "SydeVault" text on the left side, with nav links on the right. No logo image.

**Goal**: Add the logo image back (bigger), and center the brand name prominently across the middle of the header.

### Layout Change — `src/components/layout/Header.tsx`

Restructure the header into a **three-column layout**:

1. **Left**: Nav links (Home, Services, Portfolio, etc.)
2. **Center**: Logo image + "SydeVault" text, centered and prominent
   - Logo: `/lovable-uploads/a1260ea6-f719-4e0e-a7ef-6ebd36869298.png`, sized ~`h-12 md:h-16`
   - Text: larger Cinzel font (`text-3xl md:text-4xl lg:text-5xl`)
3. **Right**: Auth controls (Sign In / User dropdown + Admin link)

On mobile: logo + brand name centered at top, hamburger menu for nav.

### Files Modified
- `src/components/layout/Header.tsx` — restructure to 3-column centered brand layout

