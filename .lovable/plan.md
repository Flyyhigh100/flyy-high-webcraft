

## Two Issues Found

### Issue 1: "Failed to load subscriber emails" on Marketing tab
The `MarketingEmailManager` component calls `get_user_emails_bulk` RPC immediately on mount via `useEffect`. If the auth session isn't fully ready (e.g., token is being refreshed after tab switch), the RPC fails because `is_admin(auth.uid())` returns false with a null/stale token. This is a race condition.

**Fix:** Add an auth readiness check before fetching. Pass the current user from the parent or check session before calling the RPC. Wrap the fetch in a guard that waits for a valid session.

### Issue 2: Dashboard reloads and loses tab position
Two causes:
1. **Tab state resets**: `<Tabs defaultValue="websites">` is uncontrolled. Every re-render resets to the "websites" tab. When `onAuthStateChange` fires a `TOKEN_REFRESHED` event (happens when returning from another browser tab), it triggers state updates (`setSession`, `setUser`, `checkAdminStatus`), which cause the entire admin dashboard to re-render, resetting the tab.
2. **Data re-fetches**: The `useAdminData` hook re-runs `fetchData` on every mount/re-render cycle triggered by auth state changes, showing the loading spinner and losing your place.

**Fix:**
- Make the `Tabs` component **controlled** with `useState` so the active tab persists across re-renders.
- In `AuthContext`, skip redundant state updates on `TOKEN_REFRESHED` if the user hasn't changed -- avoid triggering re-renders that cascade into data re-fetches.
- In `useAdminData`, don't re-fetch if data is already loaded and the user hasn't changed.

---

## Implementation

### Step 1: Make admin dashboard tabs controlled
In `src/pages/AdminDashboard.tsx`:
- Add `const [activeTab, setActiveTab] = useState("websites")`
- Change `<Tabs defaultValue="websites">` to `<Tabs value={activeTab} onValueChange={setActiveTab}>`

### Step 2: Prevent unnecessary auth re-renders
In `src/contexts/AuthContext.tsx`:
- In the `onAuthStateChange` callback, check if the user ID actually changed before updating state. For `TOKEN_REFRESHED` events, only update the session/token without re-running admin checks if the user is the same.

### Step 3: Prevent unnecessary data re-fetches
In `src/hooks/useAdminData.tsx`:
- Add a `dataLoaded` ref to skip re-fetching when data is already present.
- Only re-fetch when `refreshData()` is explicitly called.

### Step 4: Fix marketing subscriber auth timing
In `src/components/admin/MarketingEmailManager.tsx`:
- Before calling `get_user_emails_bulk`, verify there's an active session with `supabase.auth.getSession()`. If no session, skip and retry after auth is ready.

