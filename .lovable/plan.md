

## Fix: Update Email Sender Addresses to Use Verified Domain

### Problem
Your verified Resend domain is `notifications.sydevault.com`, but the **payment reminder** and **project inquiry** Edge Functions are sending from the root `sydevault.com` domain (which is NOT verified). That's why emails fail with "domain not verified."

### What's Already Correct
- `contact-form` → `no-reply@notifications.sydevault.com` ✅
- `submit-website-intake` → `no-reply@notifications.sydevault.com` ✅
- `invite-client` → `no-reply@notifications.sydevault.com` ✅

### What Needs Fixing

| Function | Current (broken) | Fix to |
|----------|-----------------|--------|
| `send-payment-reminder` | `billing@sydevault.com` | `SydeVault Billing <billing@notifications.sydevault.com>` |
| `submit-project-inquiry` (client email) | `onboarding@resend.dev` | `SydeVault <no-reply@notifications.sydevault.com>` |
| `submit-project-inquiry` (admin email) | `onboarding@resend.dev` | `SydeVault <no-reply@notifications.sydevault.com>` |

### Changes
1. **`supabase/functions/send-payment-reminder/index.ts`** — Change the `from` field from `billing@sydevault.com` to `billing@notifications.sydevault.com`
2. **`supabase/functions/submit-project-inquiry/index.ts`** — Change both `from` fields from `onboarding@resend.dev` to `no-reply@notifications.sydevault.com`
3. **Redeploy** both Edge Functions

