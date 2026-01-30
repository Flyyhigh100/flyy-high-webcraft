
# RLS Policy Hardening - COMPLETED

**Status**: ✅ Migration executed successfully on 2026-01-30

## Summary of Changes

### Migration Applied
A comprehensive SQL migration was executed that:

1. **`project_inquiries` table** - Fixed policy model:
   - ✅ Dropped ambiguous policies (`Only admins can view project inquiries`, `Service role can insert project inquiries`)
   - ✅ Created explicit `RESTRICTIVE` anon deny: `Deny anon access to project_inquiries` (TO anon, FOR ALL, USING false)
   - ✅ Created `PERMISSIVE` admin-only SELECT: `Admins can view project inquiries` (TO authenticated, USING is_admin(auth.uid()))
   - ✅ Correctly scoped service role INSERT: `Service role inserts project inquiries` (TO service_role, WITH CHECK true)

2. **`website_project_intake` table** - Complete overhaul:
   - ✅ **Forced RLS**: `ALTER TABLE ... FORCE ROW LEVEL SECURITY` (prevents table owner bypass)
   - ✅ Dropped all `TO public` scoped policies
   - ✅ Created explicit `RESTRICTIVE` anon deny: `Deny anon access to website_project_intake`
   - ✅ Created `PERMISSIVE` admin-only policies for SELECT, UPDATE, DELETE (TO authenticated, USING is_admin(...))
   - ✅ Correctly scoped service role INSERT (TO service_role)

3. **`subscriptions` table** - Verified existing policies are correct:
   - ✅ Anon deny policy exists and is correctly scoped
   - ✅ SELECT policy correctly limits to own rows OR admin
   - No changes needed

## Why This Fixes the Scanner Issues

The previous policies had these problems that triggered scanner warnings:
- Policies scoped `TO public` (ambiguous - includes both anon and authenticated)
- RESTRICTIVE policies without matching PERMISSIVE allow paths
- Service role policies incorrectly scoped to `authenticated` role
- `website_project_intake` didn't have FORCE ROW LEVEL SECURITY

The new approach:
- **Explicit role scoping**: Every policy targets a specific role (anon, authenticated, or service_role)
- **PERMISSIVE allow + RESTRICTIVE deny**: Clear intent - admins are allowed, everyone else is denied
- **Forced RLS**: Table owners cannot bypass policies even in special circumstances

## Verification

The security event was logged to `security_logs` with event_type `rls_policy_hardening`.

To manually verify:
1. Anonymous user SELECT on `project_inquiries` → Should fail
2. Anonymous user SELECT on `website_project_intake` → Should fail
3. Authenticated non-admin SELECT on `project_inquiries` → Should fail
4. Authenticated non-admin SELECT on `website_project_intake` → Should fail
5. Authenticated admin SELECT on both tables → Should succeed

## Remaining Scanner Findings

The remaining findings from the security scan are:
- **WARN**: Postgres version upgrade available (user action required in Supabase dashboard)
- **WARN/INFO**: Defense-in-depth recommendations (rate limiting at network layer, unique constraints, etc.) - not security blockers
