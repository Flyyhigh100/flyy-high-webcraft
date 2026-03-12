

# Plan: Client Chooses Monthly or Yearly at First Payment

## Approach

Since the client chooses their billing cycle at checkout (not the admin), the flow becomes:

1. **Admin invites client** with just plan type (Basic or Pro) -- no billing cycle selection
2. **Pricing page** stays as-is (shows $15/mo and $30/mo as the base rates)
3. **Client dashboard** (InvitationPaymentCard) presents two payment buttons: "Pay Monthly ($15/mo)" and "Pay Yearly ($120/yr)" -- the client picks when they pay
4. **Stripe checkout** creates the subscription with the chosen interval

## Changes

### 1. Admin Invite Modal (`ClientInviteModal.tsx`)
- Simplify plan dropdown to just "Basic - $15/mo" and "Pro - $30/mo" (remove yearly options)
- Remove `billing_cycle` from the invite payload -- admin only picks plan type
- Store `next_payment_amount` as the monthly rate (informational only; actual charge depends on client's choice)

### 2. Invitation Payment Card (`InvitationPaymentCard.tsx`)
- Instead of a single "Pay for Your Plan" button, show two options:
  - **Pay Monthly** -- $15/mo (Basic) or $30/mo (Pro)
  - **Pay Yearly** -- $120/yr (Basic) or $240/yr (Pro), with a "Save $60/yr" or "Save $120/yr" note
- Pass the chosen `billingCycle` to the `create-checkout` edge function

### 3. Dashboard Change Plan section (`ImprovedSubscriptionManager.tsx`)
- Keep the monthly/yearly toggle in the "Change Plan" card (it's useful here for existing subscribers who want to switch)
- Clean up the toggle UI to be consistent with the simplified pricing

### 4. Checkout Edge Function (`create-checkout/index.ts`)
- Already supports `billingCycle` parameter -- no changes needed

### 5. Pricing Page (`PricingSection.tsx`)
- No changes -- keep showing $15/mo and $30/mo as the starting prices

### 6. Database
- No schema changes needed. The `websites.billing_cycle` column already exists and will be set based on what the client chooses at checkout.

## Summary

The key change is in the **InvitationPaymentCard**: instead of one "Pay" button at the admin-set amount, the client sees two clear options (monthly vs yearly with savings highlighted). Everything else stays largely the same.

