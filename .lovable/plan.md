
# Update Email Routing for Contact & Intake Forms

## Summary
Update both edge functions to send notification emails to `kofi@sydevault.com` and use proper "from" labels with your verified domain.

---

## Resend Setup Verification ✅

Your Resend account is properly configured:
- **Domain**: `notifications.sydevault.com` is verified
- **API Keys**: Two keys exist with full access
- **DNS Records**: Already set up in GoDaddy (verification passed)

**One thing to verify**: Make sure the `RESEND_API_KEY` secret in Supabase matches one of the API keys shown in your Resend dashboard. The "No activity" status suggests either:
- No emails have been sent yet (normal if you haven't tested), OR
- The key in Supabase is different from these two

---

## Changes Required

### 1. Contact Form Edge Function
**File**: `supabase/functions/contact-form/index.ts`

| Setting | Current | New |
|---------|---------|-----|
| Admin notification recipient | `operations@sydevault.com` | `kofi@sydevault.com` |
| Admin notification "from" | `Contact Form <onboarding@resend.dev>` | `Contact Form <no-reply@notifications.sydevault.com>` |
| User confirmation "from" | `SydeVault Support <support@sydevault.com>` | `SydeVault <no-reply@notifications.sydevault.com>` |

**Lines to change**:
- Line 163: Update "from" address
- Line 164: Update "to" address
- Line 191: Update "from" address for user confirmation

### 2. Intake Form Edge Function
**File**: `supabase/functions/submit-website-intake/index.ts`

| Setting | Current | New |
|---------|---------|-----|
| Admin notification recipient | Uses `ADMIN_NOTIFICATION_EMAIL` env var (defaults to `support@sydevault.com`) | `kofi@sydevault.com` (hardcoded for now) |
| Admin notification "from" | `SydeVault <no-reply@notifications.sydevault.com>` | `Intake Form <no-reply@notifications.sydevault.com>` |
| User confirmation "from" | `SydeVault <no-reply@notifications.sydevault.com>` | Same (already correct) |

**Lines to change**:
- Line 59: Remove fallback and hardcode `kofi@sydevault.com`
- Line 220: Update "from" to say "Intake Form"

---

## Technical Summary

All emails will use your verified subdomain `notifications.sydevault.com` which ensures deliverability. The "from" display names will clearly identify which form generated the email:

- **Contact Form submissions**: From "Contact Form"
- **Intake Form submissions**: From "Intake Form"

Both go to: `kofi@sydevault.com`

---

## After Implementation

1. **Test the contact form** by submitting a message on the website
2. **Test the intake form** by completing the multi-step form
3. Check your `kofi@sydevault.com` inbox for both emails
4. Verify the "from" labels show correctly
