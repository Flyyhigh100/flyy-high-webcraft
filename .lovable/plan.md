

## Fix: Intake Form Submission Rate Limit Bug

### Problem Identified
When you submit the intake form, you get a "Too many submissions" error even though you haven't exceeded the limit. The root cause is a **bug in the `check_edge_function_rate_limit` database function**.

The function has a variable named `request_count` that conflicts with the column name `request_count` in the `rate_limits` table. This causes a PostgreSQL error:
```
column reference "request_count" is ambiguous
```

When this error occurs, the function fails and effectively blocks all submissions.

---

### Solution

I'll update the database function to use table-qualified column names (prefixing with `rate_limits.`) to avoid the ambiguity. This is a simple fix that will resolve the error.

---

### Changes Required

**Database Migration:**
Update the `check_edge_function_rate_limit` function to qualify the ambiguous column references:

```sql
CREATE OR REPLACE FUNCTION public.check_edge_function_rate_limit(
  ip_addr text, 
  endpoint_name text, 
  max_requests integer, 
  window_minutes integer
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  current_count integer;  -- Renamed from request_count
BEGIN
  IF ip_addr IS NULL OR ip_addr = 'unknown' THEN
    RETURN true;
  END IF;
  
  -- Qualify column references with table name
  SELECT COALESCE(SUM(rate_limits.request_count), 0) INTO current_count
  FROM public.rate_limits
  WHERE rate_limits.ip_address = ip_addr::inet
    AND rate_limits.endpoint = endpoint_name
    AND rate_limits.window_start > (now() - (window_minutes || ' minutes')::interval);
  
  IF current_count >= max_requests THEN
    INSERT INTO public.security_logs (
      event_type, ip_address, success, details
    ) VALUES (
      'edge_function_rate_limit_exceeded',
      ip_addr::inet,
      false,
      jsonb_build_object(
        'endpoint', endpoint_name,
        'count', current_count,
        'limit', max_requests,
        'window_minutes', window_minutes
      )
    );
    RETURN false;
  END IF;
  
  INSERT INTO public.rate_limits (ip_address, endpoint, request_count, window_start)
  VALUES (ip_addr::inet, endpoint_name, 1, now())
  ON CONFLICT (ip_address, endpoint) 
  DO UPDATE SET 
    request_count = rate_limits.request_count + 1,
    updated_at = now();
  
  RETURN true;
END;
$function$
```

Key changes:
1. Renamed local variable from `request_count` to `current_count` to avoid naming collision
2. Qualified all column references with `rate_limits.` table prefix
3. No changes needed to the edge function code

---

### Technical Details

| Component | Status |
|-----------|--------|
| Database function | Needs fix (ambiguous column reference) |
| Edge function | No changes needed |
| Frontend form | No changes needed |

---

### After the Fix
Once approved and applied, the intake form will:
- Properly track rate limits per IP address
- Allow 2 submissions per 15 minutes per user
- Stop incorrectly blocking all submissions

