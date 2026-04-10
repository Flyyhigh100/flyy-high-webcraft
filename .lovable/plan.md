

## Site Design Overhaul Plan

After a thorough review of every section on the home page, I found several significant design issues that undermine credibility for a web design agency. Here's what needs fixing:

---

### Issue 1: Testimonials Section Uses Light Theme (Critical)
The testimonials section uses hardcoded light colors (`bg-gray-50`, `bg-white`, `text-gray-600`, `text-gray-500`, `border-gray-300`) that clash violently with the dark theme. It also references non-existent `flyy-*` color classes. This makes it look broken and unprofessional.

**Fix:** Restyle entirely using the dark theme design tokens (`bg-card`, `text-foreground`, `text-muted-foreground`, `border-border`, `text-primary`). Add a quote icon in gold, smooth slide transitions between testimonials, and use left/right arrows instead of up/down.

---

### Issue 2: Duplicate useEffect in PricingSection
`PricingSection.tsx` has the exact same `useEffect` for IntersectionObserver duplicated twice (lines 54-72 and 73-91). This creates double observers.

**Fix:** Remove the duplicate useEffect block.

---

### Issue 3: Services Section Lacks Visual Polish
The service cards use plain inline SVGs and basic hover effects. For a web design agency, these should feel more premium.

**Fix:** Add subtle gradient backgrounds to the icon containers, improve hover states with a gold glow effect, and add a subtle border-bottom accent on hover.

---

### Issue 4: CTA Section is Flat
The CTA section is a plain gold gradient block with a single button. It doesn't create urgency or premium feel.

**Fix:** Add a subtle pattern overlay, improve typography hierarchy, and add a secondary "View Portfolio" link.

---

### Issue 5: Footer Lacks Brand Presence
The footer is functional but generic. No social links, no brand personality.

**Fix:** Add the logo image to the footer, add social media icon links (placeholder hrefs), and improve spacing.

---

### Issue 6: Missing "Process" / "How It Works" Section
Potential clients want to know how working with you goes. Adding a simple 3-4 step process section between Services and Portfolio would build confidence.

**Fix:** Add a new `ProcessSection` component with numbered steps (Discovery, Design, Development, Launch) with connecting lines and icons.

---

### Implementation Summary

| File | Change |
|------|--------|
| `TestimonialsSection.tsx` | Full dark-theme restyle with slide animation |
| `PricingSection.tsx` | Remove duplicate useEffect |
| `ServicesSection.tsx` | Enhanced icon containers and hover glow |
| `CTASection.tsx` | Pattern overlay, improved typography |
| `Footer.tsx` | Add logo and social links |
| New: `ProcessSection.tsx` | 4-step "How It Works" section |
| `Index.tsx` | Add ProcessSection between Services and Portfolio |
| `tailwind.config.ts` | Add any needed keyframes for new animations |

