# Resend Email Configuration for SydeVault

## Current Status
The application is currently using test sender addresses from Resend's sandbox domain. To ensure emails are delivered reliably and maintain SydeVault branding, you need to verify your custom domain.

## Required Setup Steps

### 1. Verify Your Domain in Resend

1. **Log in to Resend Dashboard**: https://resend.com/domains
2. **Add Your Domain**: Click "Add Domain" and enter `sydevault.com`
3. **Add DNS Records**: Resend will provide DNS records to add to your domain registrar:
   - **SPF Record** (TXT): Authorizes Resend to send emails from your domain
   - **DKIM Record** (TXT): Ensures email authenticity
   - **MX Record** (optional): For receiving bounce notifications

4. **DNS Propagation**: Wait 24-48 hours for DNS changes to propagate
5. **Verify Status**: Resend will automatically verify once DNS is configured

### 2. Verify Individual Email Addresses

After domain verification, verify these specific sender addresses:
- `billing@sydevault.com` - For payment reminders
- `support@sydevault.com` - For contact form responses
- `no-reply@sydevault.com` - For system notifications (invite-client function)

### 3. Current Edge Functions Using Email

These edge functions have been updated with SydeVault branding and will use verified addresses:

#### Payment Reminders (`send-payment-reminder`)
- **Sender**: `SydeVault Billing <billing@sydevault.com>`
- **Purpose**: Sends overdue and upcoming payment notifications
- **Branding**: All "Flyy High" references replaced with "SydeVault"

#### Contact Form (`contact-form`)
- **Sender**: `SydeVault Support <support@sydevault.com>`
- **Purpose**: Contact form submissions and auto-replies
- **Branding**: Updated to SydeVault colors (#DAA520 gold)

#### Client Invitations (`invite-client`)
- **Sender**: `SydeVault <no-reply@notifications.sydevault.com>`
- **Purpose**: Client onboarding invitations
- **Branding**: Uses SydeVault branding throughout

### 4. Testing After Verification

Once domain is verified, test each flow:

1. **Password Reset Flow**
   - Request password reset
   - Verify email arrives from correct sender
   - Check for any Supabase branding

2. **Payment Reminder Flow**
   - Trigger test payment reminder
   - Verify sender is `billing@sydevault.com`
   - Confirm SydeVault branding

3. **Client Invitation Flow**
   - Send test invitation
   - Verify all links point to `sydevault.com`
   - Confirm consistent branding

4. **Contact Form**
   - Submit test contact
   - Verify confirmation email
   - Check branding consistency

### 5. Monitoring Email Delivery

Once live, monitor:
- **Delivery Rates**: Check Resend dashboard for bounce/spam rates
- **DNS Health**: Ensure SPF/DKIM records remain valid
- **Reputation**: Monitor domain reputation scores

### 6. Troubleshooting

**Emails Not Sending:**
- Verify domain status in Resend dashboard
- Check DNS records are correctly configured
- Ensure RESEND_API_KEY is set in Supabase secrets

**Emails Going to Spam:**
- Verify DKIM is properly configured
- Check SPF record includes Resend
- Warm up sending volume gradually

**Authentication Emails Still Have Supabase Branding:**
- These require custom SMTP configuration in Supabase Dashboard
- See Phase 1 in main implementation plan

## Additional Configuration Needed

### Supabase Authentication Emails
To completely remove Supabase branding from auth emails:

1. **Option A: Custom SMTP** (Recommended)
   - Go to Supabase Dashboard → Authentication → Email Templates
   - Configure SMTP settings with Resend credentials
   - Customize all email templates

2. **Option B: Custom Edge Functions**
   - Create custom auth flows using edge functions
   - Use Resend API for all auth communications
   - More control but requires more development

## Summary of Changes Made

✅ **Completed:**
- Updated all payment reminder emails to use `billing@sydevault.com`
- Updated contact form to use `support@sydevault.com`
- Updated invite-client to use `no-reply@sydevault.com`
- Replaced all "Flyy High" references with "SydeVault"
- Updated Stripe descriptions to show "SydeVault" on bank statements
- Updated site_url in config to `sydevault.com`
- Created error sanitization utility to hide technical service names

⚠️ **Requires Domain Verification:**
- All sender addresses need Resend domain verification
- DNS records must be configured at domain registrar
- Allow 24-48 hours for propagation

📝 **Next Steps:**
1. Complete domain verification in Resend
2. Test all email flows
3. Configure custom SMTP for Supabase auth emails (optional)
4. Monitor delivery rates and reputation
