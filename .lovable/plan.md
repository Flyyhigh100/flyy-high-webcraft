
# Update Hosting Options in Intake Form

## Summary
Modify the hosting-related questions to align with your business model where all clients must use your hosting. The "keep existing hosting" option will be removed, and the ongoing hosting question will be simplified since hosting with you is essentially required.

---

## Current Issue

The hosting question offers options that don't match your service model:
- "Yes, and I want to keep using it" - **Not possible** (you can't use client's existing hosting)
- "No, I can manage it myself" - **Potentially misleading** (if all sites need your hosting)

---

## Proposed Changes

### 1. Update Current Hosting Question

**From:**
```
Do you currently have web hosting? *
- Yes, and I want to keep using it
- Yes, but I'm open to switching
- No, I need hosting set up
- I'm not sure what hosting is
```

**To:**
```
Do you currently have web hosting? *
- Yes (we'll help you transition to our hosting)
- No, I need hosting set up
- I'm not sure what hosting is
```

This simplifies the options and sets the expectation that existing hosting won't be used.

### 2. Update Ongoing Hosting Question

**From:**
```
Do you need ongoing hosting and maintenance services? *
- Yes, I want a fully managed solution
- Yes, but just basic hosting
- No, I can manage it myself
- I'd like to discuss options
```

**To:**
```
Which hosting plan interests you? *
- Fully managed hosting (includes updates & support)
- Basic hosting only
- I'd like to discuss options
```

Removes "manage it myself" since hosting is included with your service, and reframes the question as a plan preference.

---

## Technical Changes

**File: `src/components/intake/steps/DomainHostingStep.tsx`**

1. **Lines 20-25**: Update `hostingOptions` array:
   - Remove `yes_keep` option
   - Update `yes_open_switch` to just `yes_transition` with clearer label
   - Keep `need_setup` and `not_sure`

2. **Lines 27-32**: Update `ongoingHostingOptions` array:
   - Keep `yes_managed` and `yes_basic`
   - Remove `no_self_manage` option
   - Keep `discuss` option

3. **Lines 118-119**: Update the label text to add context:
   - Add helper text explaining that all projects are hosted on your platform

4. **Lines 143-146**: Update the ongoing hosting question label to reflect it's about plan preference

---

## Updated Options

```typescript
const hostingOptions = [
  { value: 'yes_transition', label: 'Yes (we will help transition to our hosting)' },
  { value: 'need_setup', label: 'No, I need hosting set up' },
  { value: 'not_sure', label: "I'm not sure what hosting is" },
];

const ongoingHostingOptions = [
  { value: 'yes_managed', label: 'Fully managed (includes updates & support)' },
  { value: 'yes_basic', label: 'Basic hosting only' },
  { value: 'discuss', label: "I'd like to discuss options" },
];
```

---

## Benefits

1. Sets clear expectations upfront that clients will use your hosting
2. Removes confusion about keeping existing hosting
3. Simplifies decision-making for clients
4. Reframes ongoing hosting as a plan choice rather than yes/no
