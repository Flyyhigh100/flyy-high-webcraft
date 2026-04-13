

# Comprehensive Function Testing Plan

This plan covers testing every user-facing and admin function on the site, organized by category. We'll use a combination of direct Edge Function calls (curl), browser interaction, and log inspection.

---

## Phase 1: Public-Facing Forms

### 1. Contact Form (`contact-form`)
- Submit the contact form at `/contact` with valid test data
- Verify the Edge Function returns success
- Check that admin notification arrives at `kofi@sydevault.com`
- Check that confirmation email is sent to the submitter
- Test validation: empty fields, invalid email, spam content detection
- Test rate limiting: confirm 429 after 3 rapid submissions

### 2. Newsletter Signup (`notify-newsletter-signup`)
- Subscribe via the footer/blog widget with a test email
- Verify the subscriber is stored in `newsletter_subscribers` table
- Verify admin notification email is sent to `kofi@sydevault.com`
- Test duplicate email handling

### 3. Project Intake Form (`submit-website-intake`)
- Submit the multi-step intake form at `/project-intake` with valid data
- Verify data is stored in `website_project_intake` table
- Verify admin notification email is sent
- Verify confirmation email is sent to submitter
- Test validation (missing required fields)

### 4. Get Started / Project Inquiry (`submit-project-inquiry`)
- Submit the form at `/get-started` with valid data
- Verify data is stored in `project_inquiries` table
- Verify admin notification goes to `kofi@sydevault.com` (via `ADMIN_NOTIFICATION_EMAIL` secret)
- Verify confirmation email to submitter
- Test honeypot spam detection (send with `botField` populated)
- Test rate limiting

---

## Phase 2: Authentication & User Flows

### 5. Signup / Login / Password Reset
- Test signup flow creates profile and assigns `user` role
- Test login and session persistence
- Test forgot password flow sends reset email
- Test password reset with valid token

---

## Phase 3: Payment & Subscription Functions (Requires Auth)

### 6. Create Checkout (`create-checkout`)
- Call with `plan: 'basic'` and `plan: 'pro'` for authenticated user
- Verify Stripe checkout session is created and redirect URL returned
- Test with `billingCycle: 'monthly'` and `billingCycle: 'yearly'`
- Test invitation-based payment with custom amount

### 7. Verify Payment (`verify-payment`)
- Test with a valid Stripe session ID after checkout
- Verify payment record is created in `payments` table
- Verify website `payment_status` updates to `current`

### 8. Customer Portal (`customer-portal`)
- Call for authenticated user with active subscription
- Verify Stripe portal URL is returned

### 9. Cancel Subscription (`cancel-subscription`)
- Test cancellation sets `cancel_at_period_end` on subscription
- Verify `send-cancellation-email` fires and sends email

### 10. Plan Change (`calculate-proration`, `send-plan-change-email`)
- Test proration calculation between basic/pro
- Verify plan change email notification

### 11. Payment Reminders (`send-payment-reminder`)
- Call with a test `siteId` and various reminder types
- Verify email sent from `billing@notifications.sydevault.com`
- Verify `payment_reminders` table records the send

### 12. Daily Payment Check (`daily-payment-check`)
- Invoke and verify it updates `payment_status` for overdue sites
- Check that auto-reminders are triggered

### 13. Download Receipt (`download-receipt`)
- Call with a valid payment ID for authenticated user
- Verify receipt data is returned

---

## Phase 4: Admin Functions (Requires Admin Auth)

### 14. Client Invitation Flow
- `invite-client`: Create invitation, verify email sent
- `get-invitation-details`: Retrieve invitation by token
- `accept-invitation`: Accept with matching user
- `resend-invitation`: Resend and verify new email
- `confirm-invited-user`: Confirm user post-signup

### 15. Admin Service (`admin-service`)
- Test admin data retrieval endpoints

### 16. Cleanup Functions
- `cleanup-client`: Test client data removal (non-admin accounts only)
- `cleanup-orphaned-websites`: Test orphan detection
- `cleanup-duplicates`: Test duplicate record cleanup

### 17. Marketing Email (`send-marketing-email`)
- Send test marketing email to a single recipient
- Verify delivery from `notifications.sydevault.com`

### 18. Reconcile Payments (`reconcile-payments`)
- Invoke and verify it syncs Stripe data with local records

---

## Phase 5: Verification & Logging

### 19. Cross-check all email senders
- After each email test, inspect Edge Function logs to confirm:
  - `from` address uses `notifications.sydevault.com`
  - `to` address is `kofi@sydevault.com` for admin notifications
  - No references to old/removed emails

### 20. Database verification
- Query `security_logs` for all test events
- Query `rate_limits` to confirm rate limit entries were created
- Query `payments`, `subscriptions`, `websites` for correct state transitions

---

## Execution Approach

I'll work through these systematically using:
1. **`curl_edge_functions`** for direct Edge Function testing (fastest, no browser needed)
2. **Database queries** to verify data was stored correctly
3. **Edge Function logs** to verify email sends and catch errors
4. **Browser testing** only where UI interaction is essential (form submissions with validation)

We'll start with Phase 1 (public forms) since those don't require authentication, then move to payment flows which need a logged-in user.

---

## What You'll Need To Do

- **Log in to the preview** before we test authenticated functions (Phases 3-4)
- **Check your inbox** (`kofi@sydevault.com`) to confirm emails actually arrive
- **Let me know** if you want to skip any Stripe/payment tests to avoid creating real charges (we can test in Stripe test mode)

