

# Plan: Dark Theme Redesign + Blog & Newsletter

This is a significant redesign touching the entire site's visual identity plus two new features. Based on the reference screenshots (right side = target), the goal is a dark, professional theme with gold accents, a Blog page, and newsletter signup with admin visibility.

---

## 1. Dark Theme Overhaul

**CSS Variables (`src/index.css`)**: Replace the light `:root` values with dark defaults matching the reference:
- Background: dark navy/charcoal (~`#0a0b14`)
- Card: slightly lighter dark (`#111827`)
- Foreground: light gray/white
- Primary/accent: gold (`#F59E0B` / `#FBBF24`)
- Border/input: dark gray tones
- Remove the `.dark` block (dark IS the default now)

**Components to restyle** (remove hardcoded `bg-white`, `text-gray-600`, etc. and use theme tokens):
- `Header.tsx` — dark background, gold accents, add "Blog" nav link
- `Footer.tsx` — dark background, gold accents, add Blog + Newsletter signup
- `HeroSection.tsx` — dark gradient background, updated copy to match reference ("Websites That Turn Visitors Into Customers"), "Now accepting new projects" badge, stats row (8+, 100%, 2-4wk)
- `ServicesSection.tsx` — dark cards with gold icons, updated heading ("How We Help Your Business Grow Online")
- `PortfolioSection.tsx` — dark card backgrounds
- `PricingSection.tsx` — dark cards
- `CTASection.tsx` — keep gold gradient, adjust text contrast
- `ContactHero.tsx`, `ContactForm.tsx`, `ContactInfo.tsx` — dark theme
- `About.tsx` — dark theme
- `Services.tsx` — dark theme
- `Pricing.tsx` — dark theme
- `Layout.tsx` — no changes needed (uses theme tokens)
- `Navbar.tsx` — dark styling (if still used)

**Tailwind config**: No structural changes needed; the gold color scale already exists.

---

## 2. Blog & Resources Page

**New files**:
- `src/pages/Blog.tsx` — Blog listing page with hero ("Blog & Resources") and card grid
- `src/lib/blog-data.ts` — Static blog post data (title, excerpt, category, date, read time, slug, content)
- `src/pages/BlogPost.tsx` — Individual blog post page

**Blog posts** (matching reference screenshots):
- "5 Signs Your Website Needs a Redesign" (Web Design, Feb 1 2026)
- "Why Website Speed Matters More Than Ever in 2026" (Performance, Jan 15 2026)
- "How Much Does a Small Business Website Cost in 2026?" (Business)
- Plus 2-3 more articles

**Route**: Add `/blog` and `/blog/:slug` to `App.tsx`

**Navigation**: Add "Blog" link to Header desktop + mobile nav

---

## 3. Newsletter Signup

**Database**: Create a `newsletter_subscribers` table via Supabase migration:
- `id` (uuid), `email` (text, unique), `subscribed_at` (timestamptz), `source` (text — e.g. "footer", "blog")
- RLS: allow anonymous inserts, admin-only selects

**UI Components**:
- `src/components/home/NewsletterSignup.tsx` — email input + subscribe button, placed in Footer and optionally on Blog page
- Uses `supabase.from('newsletter_subscribers').insert(...)` directly

**Admin View**:
- `src/components/admin/NewsletterSubscribersTable.tsx` — table showing subscribers with email, date, source
- Add a "Newsletter" tab/section to `AdminDashboard.tsx`
- Future: admin can compose and forward emails to subscribers (noted but not built in this pass — marketing email restrictions apply)

---

## 4. Routing Updates (`App.tsx`)

Add within the Layout routes:
```
<Route path="/blog" element={<Blog />} />
<Route path="/blog/:slug" element={<BlogPost />} />
```

---

## Files to Create
- `src/pages/Blog.tsx`
- `src/pages/BlogPost.tsx`
- `src/lib/blog-data.ts`
- `src/components/home/NewsletterSignup.tsx`
- `src/components/admin/NewsletterSubscribersTable.tsx`
- Supabase migration for `newsletter_subscribers` table

## Files to Edit
- `src/index.css` — dark theme variables
- `src/App.tsx` — add blog routes
- `src/components/layout/Header.tsx` — dark styling + Blog link
- `src/components/layout/Footer.tsx` — dark styling + newsletter signup + Blog link
- `src/components/home/HeroSection.tsx` — dark theme + updated copy/layout
- `src/components/home/ServicesSection.tsx` — dark theme + updated copy
- `src/components/home/PortfolioSection.tsx` — dark theme
- `src/components/home/PricingSection.tsx` — dark theme
- `src/components/home/CTASection.tsx` — minor adjustments
- `src/components/contact/ContactHero.tsx` — dark theme
- `src/pages/About.tsx` — dark theme
- `src/pages/Services.tsx` — dark theme
- `src/pages/Pricing.tsx` — dark theme
- `src/pages/AdminDashboard.tsx` — add newsletter subscribers section
- `src/components/layout/Navbar.tsx` — dark styling (if used)

## Technical Notes
- All hardcoded `bg-white`, `text-gray-600/700`, `bg-gray-50/100` references across components will be replaced with semantic theme tokens (`bg-background`, `text-foreground`, `text-muted-foreground`, `bg-card`, etc.)
- Newsletter admin view is read-only (viewing subscribers). Sending emails to subscribers would be marketing and is not included.
- Blog content is static (no CMS) — stored as TypeScript data for now

