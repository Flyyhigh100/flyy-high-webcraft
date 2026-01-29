
# Multi-Step Website Project Intake Form

## Overview

This plan creates a comprehensive 8-section multi-step intake form that collects detailed project requirements from clients. The form will be easy to use with a visual progress indicator, smooth transitions, and step-by-step validation.

## What You'll Get

- A beautiful, professional intake form at `/project-intake` 
- 8 organized sections that guide clients through providing all necessary information
- Progress bar showing completion status
- Smooth animations between steps
- Form validation that prevents moving forward until required fields are complete
- Email confirmation to both you and the client upon submission
- Mobile-friendly design that works on all devices

---

## Technical Plan

### 1. Database Updates

**Create a new table** `website_project_intake` to store all the detailed form responses:

```text
Table: website_project_intake
----------------------------------------
id                          UUID (primary key)
created_at                  Timestamp
status                      Text (default: 'new')
admin_notes                 Text (nullable)
reviewed_at                 Timestamp (nullable)
reviewed_by                 UUID (nullable)

-- Section 1: Contact Information
full_name                   Text (required)
email                       Text (required)
phone                       Text (nullable)
preferred_contact_method    Text (required)

-- Section 2: About Your Business
business_name               Text (required)
business_description        Text (required)
industry                    Text (required)
has_existing_website        Boolean (required)
current_website_url         Text (nullable)

-- Section 3: Branding & Design Assets
has_logo                    Text (required)
has_color_palette           Text (required)
brand_colors                Text (nullable)
has_brand_guidelines        Text (required)
has_professional_photos     Text (required)

-- Section 4: Domain & Hosting
owns_domain                 Text (required)
domain_name                 Text (nullable)
has_domain_registrar_access Text (required)
has_hosting                 Text (required)
needs_ongoing_hosting       Text (required)

-- Section 5: Website Requirements
website_types               Text[] (required, array)
is_new_or_redesign          Text (required)
estimated_pages             Text (required)
required_features           Text[] (required, array)
has_content_ready           Text (required)
needs_content_updates       Text (required)

-- Section 6: Design Preferences
design_styles               Text[] (required, array)
reference_websites          Text (nullable)
design_dislikes             Text (nullable)

-- Section 7: Budget & Timeline
budget_range                Text (required)
timeline                    Text (required)
deadline_event              Text (nullable)

-- Section 8: Additional Information
competitors                 Text (nullable)
target_audience             Text (required)
website_goals               Text[] (required, array)
referral_source             Text (nullable)
additional_notes            Text (nullable)
```

**RLS Policies:**
- Anonymous users can insert (for the public form)
- Only admins can view/update/delete entries

### 2. Frontend Components

**File Structure:**
```text
src/
  components/
    intake/
      MultiStepIntakeForm.tsx       (Main form container with step logic)
      IntakeProgress.tsx            (Visual progress indicator)
      steps/
        ContactInfoStep.tsx         (Section 1)
        BusinessInfoStep.tsx        (Section 2)
        BrandingAssetsStep.tsx      (Section 3)
        DomainHostingStep.tsx       (Section 4)
        WebsiteRequirementsStep.tsx (Section 5)
        DesignPreferencesStep.tsx   (Section 6)
        BudgetTimelineStep.tsx      (Section 7)
        AdditionalInfoStep.tsx      (Section 8)
        SuccessStep.tsx             (Confirmation message)
  pages/
    ProjectIntake.tsx               (Page wrapper)
```

**Key Features:**
- Progress bar at top showing step X of 8
- Clickable step indicators (can jump to completed steps)
- Form state persisted in React state
- Smooth CSS transitions between steps
- Required field indicators (asterisks)
- Inline validation with error messages
- "Next" and "Back" navigation buttons
- "Submit" button on final step

### 3. Edge Function Updates

**Update `submit-project-inquiry/index.ts`** or create new function `submit-website-intake`:

- Accept all form fields from the 8 sections
- Validate required fields server-side
- Insert into `website_project_intake` table
- Send confirmation email to client with summary
- Send detailed notification email to admin
- Rate limiting (2 submissions per 15 minutes per IP)
- Security logging

**Email Content:**
- Client receives: Thank you message + summary of their responses
- Admin receives: Full form data in organized sections + link to admin dashboard

### 4. Routing

Add new route in `App.tsx`:
```typescript
<Route path="/project-intake" element={<ProjectIntake />} />
```

The existing `/get-started` page can remain as a simpler quick inquiry form, or we can replace it.

### 5. Form Validation

Using Zod schemas for both client and server validation:

- Section 1: Email format, required fields
- Section 2: Required business info
- Section 3: Required branding selections
- Section 4: Required hosting/domain selections
- Section 5: At least one website type and feature selected
- Section 6: At least one design style selected
- Section 7: Budget and timeline required
- Section 8: Target audience required

### 6. User Experience

**Progress Indicator Design:**
```text
+----+----+----+----+----+----+----+----+
| 1  | 2  | 3  | 4  | 5  | 6  | 7  | 8  |
+----+----+----+----+----+----+----+----+
  ✓    ●    ○    ○    ○    ○    ○    ○
  
Contact | Business | Branding | Domain | ...
```

**Step Transitions:**
- Fade out current step
- Fade in new step
- Scroll to top of form
- Focus first input of new step

**Validation Behavior:**
- Show error messages inline below fields
- Highlight fields with errors
- Prevent "Next" until all required fields are valid
- Allow "Back" without validation

### 7. Mobile Responsiveness

- Single-column layout on mobile
- Full-width buttons
- Larger touch targets for radio buttons and checkboxes
- Sticky progress bar at top
- Collapsible step indicator on mobile

---

## Implementation Phases

### Phase 1: Database & Edge Function
1. Create `website_project_intake` table with all columns
2. Set up RLS policies
3. Create/update edge function for form submission

### Phase 2: Form Components
1. Create step components (8 sections)
2. Create progress indicator component
3. Create main form container with step logic

### Phase 3: Page & Routing
1. Create ProjectIntake page
2. Add route to App.tsx
3. Style and polish

### Phase 4: Testing & Polish
1. Test full form flow
2. Test validation
3. Test email delivery
4. Mobile testing
5. Accessibility review

---

## Files to Create/Modify

**New Files (10):**
1. `src/pages/ProjectIntake.tsx`
2. `src/components/intake/MultiStepIntakeForm.tsx`
3. `src/components/intake/IntakeProgress.tsx`
4. `src/components/intake/steps/ContactInfoStep.tsx`
5. `src/components/intake/steps/BusinessInfoStep.tsx`
6. `src/components/intake/steps/BrandingAssetsStep.tsx`
7. `src/components/intake/steps/DomainHostingStep.tsx`
8. `src/components/intake/steps/WebsiteRequirementsStep.tsx`
9. `src/components/intake/steps/DesignPreferencesStep.tsx`
10. `src/components/intake/steps/BudgetTimelineStep.tsx`
11. `src/components/intake/steps/AdditionalInfoStep.tsx`
12. `src/components/intake/steps/SuccessStep.tsx`
13. `supabase/functions/submit-website-intake/index.ts` (new edge function)

**Modified Files (1):**
1. `src/App.tsx` - Add new route

**Database Migration:**
1. Create `website_project_intake` table
2. Add RLS policies

---

## Questions Before Implementation

None - the requirements are comprehensive and clear. Ready to implement upon approval.
