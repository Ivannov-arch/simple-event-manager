# Improvements Log

## [2026-10-03] - Event Cover Image Upload & Drag-and-Drop Support

### Overview
Expanded event creation and management features to support event cover image uploads via Supabase Storage, including a modern drag-and-drop client interface and public event listing display.

---

### Technical Architecture & Flow

```
[ Client Browser ]
    │
    ├─ 1. User selects / drops image (validated: <= 5MB, jpeg/png/webp)
    ├─ 2. Direct upload to Supabase Storage: `event-covers/{timestamp}-{filename}`
    ├─ 3. Retrieve public URL via `getPublicUrl()`
    │
    ▼
[ Next.js Server Action: createEvent() / updateEvent() ]
    │
    └─ 4. Persist event payload including `cover_image_url`
          into PostgreSQL `public.events` table
```

> **Why Client-Side Upload?**
> Standard Next.js Server Actions cannot reliably serialize binary `File` objects directly in complex JSON payloads. Direct upload from the client to Supabase Storage minimizes server memory overhead and ensures seamless file streaming.

---

### Code Changes Summary

#### 1. [`app/actions/event.ts`](file:///c:/Coding/Friends/Jeremia/event-manager/app/actions/event.ts)
- **Interface Update**: Added `cover_image_url?: string | null` to the `EventPayload` interface.
- **Server Action Compatibility**: `createEvent()` and `updateEvent()` now accept and store `cover_image_url` in the database.

#### 2. [`app/(dashboard)/admin/events/event-form.tsx`](file:///c:/Coding/Friends/Jeremia/event-manager/app/(dashboard)/admin/events/event-form.tsx)
- **State Management**:
  - `coverImageFile: File | null`: Tracks active file selected.
  - `coverImagePreview: string | null`: Tracks preview object URL / initial URL.
  - `isUploadingImage: boolean`: Disables form submission and indicates upload progress.
  - `isDragging: boolean`: Tracks drag-and-drop hover state for visual feedback.
- **Drag-and-Drop Support**:
  - Implemented `handleDragOver`, `handleDragLeave`, and `handleDrop` events.
  - Shared file validation in `applyImageFile()` (file size limit: 5MB; formats: JPEG, PNG, WEBP).
- **Direct Supabase Upload**:
  - Integrated Supabase browser client (`createClient()` from `@/lib/supabase/client`).
  - Sanitized filenames and stored assets under `event-covers/` bucket before submitting form data.

#### 3. [`app/(dashboard)/events/page.tsx`](file:///c:/Coding/Friends/Jeremia/event-manager/app/(dashboard)/events/page.tsx)
- **UI Enhancement**: Rendered event cover image headers on event cards (`h-32` aspect ratio container, fallback gradient placeholder when no cover image is present).

---

### Database & Supabase Storage Prerequisites

Ensure the following steps are executed on your Supabase dashboard:

#### 1. Database Migration
Run in Supabase SQL Editor:
```sql
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS cover_image_url TEXT DEFAULT NULL;
```

#### 2. Storage Bucket Creation
- Create bucket named: `event-covers`
- Set bucket access: **Public**

#### 3. Storage Row Level Security (RLS) Policies
Under Storage > `event-covers` > Policies:
- **Public Read (`SELECT`)**:
  - Target roles: `public`, `anon`, `authenticated`
  - Policy: `bucket_id = 'event-covers'`
- **Admin Upload (`INSERT`)**:
  - Target roles: `authenticated`
  - Policy: Check if the authenticated user has an `admin` role in `public.profiles`.
- **Admin Delete (`DELETE`)**:
  - Target roles: `authenticated`
  - Policy: Check if user is an admin.
