
Goal: Stop the intake form from failing on submit by fixing the underlying rate-limiting database design bug that’s causing the edge function to error out (and often present as “Too many submissions” or a generic submission failure).

What’s actually happening (root cause)
- Your edge function `submit-website-intake` calls the Postgres function `check_edge_function_rate_limit`.
- That function writes to `public.rate_limits` using:
  - `INSERT ... ON CONFLICT (ip_address, endpoint) DO UPDATE ...`
- But the `rate_limits` table currently has:
  - a normal (non-unique) index on `(ip_address, endpoint)` (idx_rate_limits_ip_endpoint)
  - no UNIQUE constraint or UNIQUE index matching `(ip_address, endpoint)`
- Postgres therefore throws:
  - `42P10: there is no unique or exclusion constraint matching the ON CONFLICT specification`
- The edge function catches that as “Rate limit check failed” and returns an error, so the form submission fails even when you haven’t exceeded limits.

Additionally: even if we “just add a unique constraint”, the current single-row-per-(ip,endpoint) upsert logic is incomplete because it never resets `window_start`, which can make rate limiting behave incorrectly over time. So we should fix both:
1) The missing uniqueness constraint
2) The rate-limit “window” reset behavior

Proposed fix (high confidence)
A) Database schema: enforce the ON CONFLICT target
1. Add a UNIQUE constraint (or unique index) on `public.rate_limits(ip_address, endpoint)`.
2. Before adding it, safely remove any existing duplicate rows that would violate the new uniqueness constraint (keep the newest row per ip+endpoint).

B) Database functions: make the upsert window-aware
Update these functions so when the existing row is “outside the window”, the counter resets and `window_start` is refreshed:
- `public.check_edge_function_rate_limit(ip_addr text, endpoint_name text, max_requests int, window_minutes int)`
- `public.check_profile_query_rate_limit()` (uses 1 minute window)
- `public.check_invitation_query_rate_limit()` (uses 5 minute window)

Implementation behavior we want:
- For a given (ip_address, endpoint):
  - If now - window_start > window:
    - set request_count = 1
    - set window_start = now()
  - Else:
    - increment request_count
  - Always update updated_at = now()

C) Edge function + UI: improve error transparency and avoid “mystery failures”
1. Keep the existing IP normalization in `submit-website-intake` (already correct).
2. Improve the frontend toast in `MultiStepIntakeForm.tsx` to display a more helpful message:
   - If the edge function returns `{ error: "Too many submissions..." }`, show that.
   - If it returns a generic server error, show a friendlier “Something went wrong, please try again” but also log the full error for debugging.
   - This doesn’t replace the backend fix, but it prevents the “constant issue” from feeling opaque when something else goes wrong later.

Step-by-step execution plan
1) Confirm current database state (read-only verification during implementation)
- Query rate_limits for duplicates by (ip_address, endpoint).
- Confirm which functions reference `ON CONFLICT (ip_address, endpoint)`.

2) Apply DB migration (schema + function fixes)
Migration contents:
- Deduplicate `rate_limits`:
  - Keep the most recently updated/created row per (ip_address, endpoint), delete the rest.
- Add a UNIQUE constraint:
  - `ALTER TABLE public.rate_limits ADD CONSTRAINT rate_limits_ip_endpoint_key UNIQUE (ip_address, endpoint);`
- Replace the three functions with updated “window-aware upsert” logic described above.

3) Validate with logs
- Submit the intake form once.
- Confirm `submit-website-intake` logs no longer show the `42P10` ON CONFLICT error.
- Confirm DB is inserting/updating `rate_limits` correctly.

4) Improve frontend error display (small UI change)
- Update `MultiStepIntakeForm.tsx` catch block to display the error message returned by the function when present (especially 429).
- Keep the existing success path unchanged.

5) End-to-end test checklist (what you’ll verify in Preview)
- Submit intake with normal data: should succeed and show SuccessStep.
- Submit again immediately: should hit the 2-per-15-min limit and show “Too many submissions…” (expected).
- Wait (or temporarily reduce limits for test) to confirm it resets after the window.
- Try from a different browser/incognito: should behave per-IP as designed.

Risk & rollback
- Risk: Adding the unique constraint could fail if duplicates exist and aren’t removed first. We mitigate by deduping in the same migration.
- Risk: Changing rate-limit behavior could affect other endpoints (profile/invitation) since they share the same table. We mitigate by updating those functions in the same migration, keeping their intended limits.
- Rollback: If needed, we can drop the unique constraint and revert the functions, but that would reintroduce the ON CONFLICT failure. The correct rollback is adjusting function logic, not removing uniqueness.

Technical notes (for future reliability)
- The current `rate_limits` approach is a “single rolling window row” per endpoint+ip. That’s fine as long as window_start resets appropriately.
- Alternative architecture (not required now): insert-only event rows and sum in-window counts, with periodic cleanup. More storage, simpler semantics. We’ll avoid this unless you want more analytics later.

Expected outcome
- Intake form submissions will stop failing due to rate limit RPC errors.
- The “Too many submissions” message will only appear when you actually exceed the limit.
- When something else fails, the UI will show a more meaningful message instead of a generic error that feels “constant” and unfixable.
