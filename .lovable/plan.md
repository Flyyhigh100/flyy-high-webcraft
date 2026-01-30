
Goal: Ensure sensitive tables are not readable by the public (anon) and not readable by non-admin authenticated users, using a “deny-by-default + explicit allow” approach that is simple, auditable, and scanner-friendly. Also ensure table owners cannot bypass RLS.

What I found (test environment)
1) `public.project_inquiries`
- RLS is enabled and forced:
  - relrowsecurity = true
  - relforcerowsecurity = true
- Current policies include:
  - `Deny all anonymous access to project inquiries` (TO anon, qual false)  ✅
  - `Only admins can view project inquiries` (TO authenticated, RESTRICTIVE, USING is_admin(auth.uid()))  ⚠
  - `Service role can insert project inquiries` exists but is scoped to `authenticated` role with `WITH CHECK auth.role() = 'service_role'`  (works as a guard, but the role scoping is misleading to scanners and humans)
- Security scanner still flags “no explicit blocking non-admin authenticated users”. In practice, RLS default-deny should already block them, but scanners commonly expect explicit role scoping and a clear “admin allow” policy.

2) `public.subscriptions`
- RLS enabled and forced (good).
- Deny anon policy exists (good).
- SELECT policy already restricts to “own rows or admin” for authenticated (good).
- This table is likely “fine” from a pure RLS standpoint, but we should validate that no code path uses service role incorrectly on the client. (Your frontend Supabase client uses the anon key, which is correct.)

3) `public.website_project_intake` (this is a related “same class” risk)
- RLS enabled, but NOT forced:
  - relrowsecurity = true
  - relforcerowsecurity = false  ⚠ (table owner could bypass RLS in some situations; forcing RLS is a hardening best practice for sensitive data)
- Policies are scoped to role `public` (meaning both anon + authenticated), which is scanner-unfriendly and harder to reason about.
  - There is a “Block anonymous access” policy, but it is `TO public` with `USING false`, which doesn’t literally mean “anon only” and triggers warnings.

Different approach (principles)
A) Make “who can do what” obvious by role scoping:
- anon: explicitly denied for sensitive tables
- authenticated: only explicitly allowed if admin (for admin-only tables), or only allowed for “own rows” (for user-owned tables)
- service_role: only allowed where needed for inserts/updates performed by Edge Functions

B) Use PERMISSIVE “allow” policies for the intended access paths and rely on default-deny for everyone else.
- This avoids tricky edge cases where a RESTRICTIVE-only setup can behave unexpectedly (because RESTRICTIVE policies are AND’ed but still require at least one permissive allow path depending on operation and other policy combinations).
- It also matches what most scanners are looking for.

C) Force RLS on tables containing PII/financials.

Implementation plan (DB changes)
All changes will be done via a single new SQL migration (so it’s reviewable and reversible).

Step 1 — Fix `project_inquiries` policy model (make it unambiguous)
1.1 Drop/replace the current SELECT policy to a clear PERMISSIVE admin-only policy:
- Drop:
  - `Only admins can view project inquiries`
- Create:
  - `Admins can view project inquiries` (PERMISSIVE)
    - FOR SELECT
    - TO authenticated
    - USING (is_admin(auth.uid()))

1.2 Ensure anon is denied (already done, but we’ll make sure it is correctly scoped)
- Keep or recreate:
  - `Deny all anonymous access to project inquiries`
    - FOR SELECT (or FOR ALL, depending on preference)
    - TO anon
    - USING (false)

1.3 Correct the “service role insert” policy to be scoped to the correct DB role (instead of “authenticated”)
- Drop and recreate:
  - `Service role can insert project inquiries`
    - FOR INSERT
    - TO service_role
    - WITH CHECK (true)
Why: service role bypasses RLS anyway, but having correct policy scoping removes confusion and prevents scanners from interpreting it as an authenticated-user policy.

Step 2 — Harden `subscriptions` (confirm + optionally tighten to match the same pattern)
2.1 Verify no PUBLIC/anon policies exist besides the explicit anon deny (they don’t, based on pg_policies).
2.2 Keep existing SELECT policy (it is correct):
- Authenticated users can view own subscriptions; admins can view all
2.3 Keep anon deny policy (already present).
2.4 (Optional hardening) If any policies are currently “TO public” (they aren’t for subscriptions), rewrite them to explicit roles.

Step 3 — Fix `website_project_intake` because it’s the same risk category and currently scanner-unfriendly
3.1 Force RLS:
- ALTER TABLE public.website_project_intake FORCE ROW LEVEL SECURITY;

3.2 Rewrite policies that are currently scoped to `public` into explicit roles:
- Replace “Block anonymous access to intake submissions” to:
  - TO anon USING (false)
- Replace “Admins can view all intake submissions” to:
  - TO authenticated USING (is_admin(auth.uid()))
- Replace “Admins can update/delete” similarly to authenticated admin-only
- Replace “Service role can insert” to:
  - TO service_role WITH CHECK (true)

This makes the intent explicit and reduces “authenticated non-admin might read” scanner noise.

Step 4 — Validation (prove it, don’t assume)
After migration:
4.1 Rerun the security scan and confirm the specific findings are cleared:
- project_inquiries exposure
- subscriptions exposure (if still flagged)
- website_project_intake exposure

4.2 Perform “real-world” verification tests:
- Anonymous (logged out) attempts to select:
  - project_inquiries: should fail
  - subscriptions: should fail
  - website_project_intake: should fail
- Authenticated non-admin attempts to select:
  - project_inquiries: should fail
  - website_project_intake: should fail
  - subscriptions: should only return their own rows (if any)
- Authenticated admin attempts:
  - project_inquiries: should succeed (admin dashboard)
  - website_project_intake: should succeed (admin dashboard)

Step 5 — App/Edge Function impact check (to prevent regressions)
- The public “Project Inquiry” submission is already going through an Edge Function (`submit-project-inquiry`) using `SUPABASE_SERVICE_ROLE_KEY`, so tightening table SELECT won’t affect submissions.
- Admin views should continue to work (admins either:
  - read via an Edge Function using service-role, or
  - read directly via authenticated admin RLS).
We’ll review any frontend code that directly queries `project_inquiries` or `website_project_intake` to ensure it’s only used in admin-only screens and that those screens already require admin.

Deliverables
- 1 SQL migration that:
  - Clarifies and tightens RLS policies for `project_inquiries` and `website_project_intake`
  - Forces RLS on `website_project_intake`
  - Leaves `subscriptions` in a verified-good state (or tightens if needed)
- Post-migration verification checklist + rerun security scan to confirm the findings are resolved

Notes / why this should end the “months-long same errors”
- The scanner complaints are often less about “is it technically secure” and more about “is it explicitly and unambiguously secure.”
- By removing `TO public` policies, scoping service role policies correctly, and using a straightforward “PERMISSIVE admin allow + explicit anon deny” model, we eliminate ambiguity that triggers repeated findings.

If you approve, I’ll implement the migration exactly as above and then rerun the security scan to confirm the findings are gone.