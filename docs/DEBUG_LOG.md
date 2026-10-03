# 🛠️ Bug Fixes & Technical Debugging Report

This document summarizes root cause analyses and technical bug fixes for the **Event & Participant Management** application.

---

## Bug List

### 🔴 Bug 1: `Runtime Error: Invalid schema: simple_event_manager`
* **Symptom**: When loading profile data / actions (e.g. `getMyProfile`), the server throws `Invalid schema: simple_event_manager`.
* **Root Cause**:
  1. Supabase Cloud PostgREST API exposes only the `public` schema by default. Passing `{ db: { schema: "simple_event_manager" } }` to the Supabase client (`client.ts`, `server.ts`, `proxy.ts`) fails if the schema has not been registered in the PostgREST config.
* **Fix**:
  1. Run the full DDL SQL for the `simple_event_manager` schema (tables: `profiles`, `events`, `registrations`, custom enums, RLS policies, and the `handle_new_user` trigger).
  2. Register `simple_event_manager` schema in the Supabase API / PostgREST settings.

---

### 🔴 Bug 2: `Could not find the table 'public.profiles' in the schema cache`
* **Symptom**: Server runtime error in `app/actions/profile.ts: getMyProfile` looking for a table in the `public` schema (`public.profiles`).
* **Root Cause**:
  - The Supabase SSR client was initialized without explicitly setting the target database schema, causing all `supabase.from("profiles")` calls to default to `public.*`.
* **Fix**:
  - Added `{ db: { schema: "simple_event_manager" } }` config to:
    1. [client.ts](file:///c:/Coding/Friends/Jeremia/event-manager/lib/supabase/client.ts) (`createBrowserClient`)
    2. [server.ts](file:///c:/Coding/Friends/Jeremia/event-manager/lib/supabase/server.ts) (`createServerClient`)
    3. [proxy.ts](file:///c:/Coding/Friends/Jeremia/event-manager/lib/supabase/proxy.ts) (`createServerClient` in middleware)
  - All Supabase ORM queries across the app now automatically target tables in the `simple_event_manager` schema.

---

### 🔴 Bug 3: `Encountered a script tag while rendering React component`
* **Symptom**: Console error in `RootLayout` inside `app/layout.tsx`:
  > *"Encountered a script tag while rendering React component. Scripts inside React components are never executed when rendering on the client."*
* **Root Cause**: `next-themes` injects inline script tags for SSR flash prevention, which triggers warnings/errors in React 19 / Next.js 16 App Router.
* **Fix**:
  1. Created a custom `ThemeProvider` in [theme-provider.tsx](file:///c:/Coding/Friends/Jeremia/event-manager/components/theme-provider.tsx) fully compatible with React 19 — no raw script tag injection.
  2. Set `className="dark"` as default on the `<html>` tag in [layout.tsx](file:///c:/Coding/Friends/Jeremia/event-manager/app/layout.tsx).
  3. Updated [theme-switcher.tsx](file:///c:/Coding/Friends/Jeremia/event-manager/components/theme-switcher.tsx) to consume the local ThemeProvider.

---

### 🔴 Bug 4: `Route segment config "dynamic" is not compatible with nextConfig.cacheComponents`
* **Symptom**: Next.js 16 throws a build/compilation error:
  > *"Route segment config 'dynamic' is not compatible with `nextConfig.cacheComponents`. Please remove it."*
* **Root Cause**: `cacheComponents: true` in `next.config.ts` explicitly conflicts with the legacy route-segment declaration `export const dynamic = "force-dynamic"` in Next.js 16.
* **Fix**:
  1. Removed `cacheComponents: true` from `next.config.ts`.
  2. Removed all `export const dynamic = "force-dynamic"` declarations across pages — Next.js 16 App Router handles dynamic rendering automatically.

---

### 🔴 Bug 5: Incompatible `supabase.auth.getClaims()` in `proxy.ts`
* **Symptom**: The method `supabase.auth.getClaims()` is not valid on the standard Supabase SSR client, potentially causing session refresh failures or random logouts.
* **Root Cause**: Non-standard helper call not natively supported by the `@supabase/ssr` library.
* **Fix**:
  - Updated `lib/supabase/proxy.ts` to use the official standard:
    ```typescript
    const { data: { user } } = await supabase.auth.getUser();
    ```
  - Admin role access is now safely verified via a query on the `profiles` table.

---

### 🔴 Bug 6: Google OAuth `{"code":400,"error_code":"validation_failed","msg":"Unsupported provider: provider is not enabled"}`
* **Symptom**: The *Continue with Google* button throws a 400 error from the Supabase auth endpoint.
* **Root Cause**: Google Provider was not enabled in the Supabase Dashboard (Authentication → Providers → Google).
* **Fix**:
  1. Created an OAuth Client ID in Google Cloud Console with Redirect URI `https://<project-ref>.supabase.co/auth/v1/callback`.
  2. Entered the Client ID & Client Secret into the Supabase Dashboard and enabled the *Enable Google provider* toggle.

---

### 🔴 Bug 7: Database Error `JWT issued at future`
* **Symptom**: Supabase API calls throw `JWT issued at future` when executing Server Actions.
* **Root Cause**: Clock skew / time drift between the local system clock and the Supabase Cloud server clock (PostgREST checks `iat <= now()`), or stale session cookies carrying an invalid timestamp.
* **Fix**:
  1. Synced Windows clock via *Settings → Date & Time → Sync now*.
  2. Cleared local browser cookies (`sb-*`) and logged in again to obtain a freshly synchronized token.

---

### 🔴 Bug 8: Admin Role Button & Protection Not Showing / Case-Sensitive Check
* **Symptom**: Users with the admin role don't see the `🛡️ Admin` button in the Navbar, or are rejected when accessing `/admin`.
* **Root Cause**: The string check `role === "ADMIN"` is case-sensitive, and newly registered users default to `PARTICIPANT` status.
* **Fix**:
  - Changed all role checks to case-insensitive:
    ```typescript
    const isAdmin = profile?.role?.toUpperCase() === "ADMIN";
    ```
  - Updated in [layout.tsx](file:///c:/Coding/Friends/Jeremia/event-manager/app/(dashboard)/layout.tsx), [proxy.ts](file:///c:/Coding/Friends/Jeremia/event-manager/lib/supabase/proxy.ts), [event.ts](file:///c:/Coding/Friends/Jeremia/event-manager/app/actions/event.ts), [profile.ts](file:///c:/Coding/Friends/Jeremia/event-manager/app/actions/profile.ts), and [register.ts](file:///c:/Coding/Friends/Jeremia/event-manager/app/actions/register.ts).

---

### 🔴 Bug 9: `Runtime TypeError: Cannot read properties of null (reading 'selectionStart')` When Pasting Event Title
* **Symptom**: The app crashes when a user pastes text into the Event Title input on the event creation form.
* **Root Cause**: The `e.currentTarget` property on a React Synthetic Event was accessed inside an async `setTitle((prev) => { ... })` callback, by which point the event object had already been nullified by React (event pooling).
* **Fix**:
  - Read `selectionStart` and `selectionEnd` synchronously before any state update is executed:
    ```typescript
    const handleTitlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      const pastedText = e.clipboardData.getData("text");
      if (pastedText && /[\r\n]/.test(pastedText)) {
        e.preventDefault();
        const input = e.currentTarget;
        const start = input.selectionStart ?? title.length;
        const end = input.selectionEnd ?? title.length;
        const cleaned = pastedText.replace(/[\r\n]+/g, " ");
        const updated = title.substring(0, start) + cleaned + title.substring(end);
        setTitle(updated);
      }
    };
    ```

---

### 🔴 Bug 10: Vercel Build Error `TS2345: Argument of type 'string' is not assignable to parameter of type 'Theme'`
* **Symptom**: Vercel deployment fails during `npm run build` with a TypeScript error:
  > *"components/theme-switcher.tsx(58,42): error TS2345: Argument of type 'string' is not assignable to parameter of type 'Theme'."*
* **Root Cause**: The `onValueChange` callback on `DropdownMenuRadioGroup` produces a `string` type, while `setTheme` from `useTheme` expects the union type `Theme` (`"dark" | "light" | "system"`).
* **Fix**:
  - Exported `type Theme` from [theme-provider.tsx](file:///c:/Coding/Friends/Jeremia/event-manager/components/theme-provider.tsx).
  - Added type-cast `onValueChange={(e) => setTheme(e as Theme)}` in [theme-switcher.tsx](file:///c:/Coding/Friends/Jeremia/event-manager/components/theme-switcher.tsx).

---

### 🔴 Bug 11: Infinite Loading & Redirect Loop on Google OAuth Callback
* **Symptom**: Login or sign-up via *Continue with Google* results in infinite loading or redirects to the wrong `Site URL` when accessed from a Vercel domain or localhost.
* **Root Cause**:
  1. The `redirectTo` parameter sent a dynamic query string `?next=/dashboard` (`.../auth/callback?next=/dashboard`). Supabase GoTrue Auth is strict about URL matching and ignores parameters if the query string doesn't exactly match an entry in the *Redirect URLs Allowlist*.
  2. When ignored, Supabase falls back to the default `Site URL`, causing the PKCE verifier cookie not to be found (on a different domain), stalling the auth flow.
  3. The `app/auth/callback/route.ts` handler previously redirected to `/auth/error` without forwarding the original error message from Supabase.
* **Fix**:
  1. Cleaned the query string from `redirectTo` in [login-form.tsx](file:///c:/Coding/Friends/Jeremia/event-manager/components/login-form.tsx) and [sign-up-form.tsx](file:///c:/Coding/Friends/Jeremia/event-manager/components/sign-up-form.tsx) — now simply `${window.location.origin}/auth/callback`.
  2. Set the default value of `next` directly to `/dashboard` in [route.ts](file:///c:/Coding/Friends/Jeremia/event-manager/app/auth/callback/route.ts).
  3. Forward the original Supabase error message to `/auth/error?error=${encodeURIComponent(error.message)}` for transparent auth failure detection.

---

### 🔴 Bug 12: Phantom Full Capacity Due to `CANCELLED` Registrations Being Counted as Active
* **Symptom**: Events whose seats were cancelled by participants still show as *Full* in the event catalog (`/events`), blocking new registrations.
* **Root Cause**:
  - The event query in `app/actions/event.ts` used the `registrations(count)` PostgREST aggregate selector, which counts **all rows** in the `registrations` table — including rows where `status = 'CANCELLED'`.
* **Fix**:
  1. Changed the query selector to `registrations(id, status)` in [event.ts](file:///c:/Coding/Friends/Jeremia/event-manager/app/actions/event.ts).
  2. Updated the active participant count calculation across all views ([events/page.tsx](file:///c:/Coding/Friends/Jeremia/event-manager/app/(dashboard)/events/page.tsx), [events/[id]/page.tsx](file:///c:/Coding/Friends/Jeremia/event-manager/app/(dashboard)/events/[id]/page.tsx), [admin/page.tsx](file:///c:/Coding/Friends/Jeremia/event-manager/app/(dashboard)/admin/page.tsx), [admin/events/page.tsx](file:///c:/Coding/Friends/Jeremia/event-manager/app/(dashboard)/admin/events/page.tsx), and [admin/events/[id]/page.tsx](file:///c:/Coding/Friends/Jeremia/event-manager/app/(dashboard)/admin/events/[id]/page.tsx)) to filter active registrations (`status !== "CANCELLED"`).

---

### 🔴 Bug 13: Potential Overbooking When Participants Are Marked `ATTENDED`
* **Symptom**: The maximum event capacity can be exceeded (overbooked) after an administrator marks participants as `ATTENDED`.
* **Root Cause**:
  - The capacity validation in `registerEvent` inside `app/actions/register.ts` only counted participants filtered by `.eq("status", "REGISTERED")`. Once a participant was marked `ATTENDED`, the system no longer counted them toward the quota, opening a slot for over-registration.
* **Fix**:
  - Changed the capacity filter to `.neq("status", "CANCELLED")` in [register.ts](file:///c:/Coding/Friends/Jeremia/event-manager/app/actions/register.ts), so both `REGISTERED` and `ATTENDED` participants are counted as occupying a seat.

---

### 🔴 Bug 14: Unhandled Crash `RangeError: Invalid time value` on Event Form
* **Symptom**: Submitting incomplete or invalid date/time input in the event creation/edit form triggers a React runtime crash (blank screen).
* **Root Cause**:
  - `.toISOString()` was called directly on `new Date(...)` without first verifying that the Date object is valid via `isNaN(date.getTime())`.
* **Fix**:
  - Added `isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())` guard and chronological order validation before ISO conversion in [event-form.tsx](file:///c:/Coding/Friends/Jeremia/event-manager/app/(dashboard)/admin/events/event-form.tsx).

---

### 🔴 Bug 15: Error `supabase.auth.getClaims is not a function` & Password Reset Redirect
* **Symptom**:
  1. Changing the password on the forgot-password form redirects users to `/protected`, which crashes with: `TypeError: supabase.auth.getClaims is not a function`.
  2. Logout does not immediately clear the session from the server components UI.
* **Root Cause**:
  - `getClaims()` is a non-standard method not available in `@supabase/ssr`.
  - The `/protected` page was a leftover artifact from the old starter kit boilerplate that had not been cleaned up.
* **Fix**:
  1. Redirected the password-change form to `/dashboard` in [update-password-form.tsx](file:///c:/Coding/Friends/Jeremia/event-manager/components/update-password-form.tsx).
  2. Replaced all `getClaims()` calls with `supabase.auth.getUser()` in [auth-button.tsx](file:///c:/Coding/Friends/Jeremia/event-manager/components/auth-button.tsx) and [protected/page.tsx](file:///c:/Coding/Friends/Jeremia/event-manager/app/protected/page.tsx).
  3. Added `router.refresh()` to [logout-button.tsx](file:///c:/Coding/Friends/Jeremia/event-manager/components/logout-button.tsx) so the session cookie is immediately synchronized.
