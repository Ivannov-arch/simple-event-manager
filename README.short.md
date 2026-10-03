# 🚀 EventHub – Short README

> **Full-stack event & participant management system with real-time seat validation, digital certificates, and RBAC.**

---

## 🏛️ Technical Decisions

### 1. High-Level Architecture
* **Pattern:** Single-repo serverless fullstack using **Next.js App Router** + **Server Actions** + **Supabase (BaaS)**.
* **Engineering Rationale:** For this project's scope, a separate backend (Express/FastAPI/Laravel) adds unnecessary API boilerplate, CORS setup, redundant DTOs, and deployment friction. A serverless setup minimizes operational overhead while maintaining strict server-side validation and security.

### 2. Tech Stack

| Component | Choice | Reason |
| :--- | :--- | :--- |
| **Frontend** | **Next.js 16 + TypeScript** | Fast SSR, type safety, React 19 server components. |
| **Backend** | **Next.js Server Actions** | Secure, type-safe RPC mutations executed on the server. |
| **Database** | **PostgreSQL (Supabase)** | Relational model with foreign keys, custom schema, and SQL triggers. |
| **Hosting** | **Vercel + Supabase Cloud** | Zero-config CI/CD via GitHub, global edge CDN, serverless scale. |
| **UI Design** | **Tailwind CSS + Radix UI** | Clean, eye-comfort **Dark Mode** with responsive glassmorphism. |
| **Libraries** | **`@supabase/ssr`, `lucide-react`** | Cookie-based session auth and lightweight icons. |

### 3. Database & Data Model (`simple_event_manager` schema)
* **`auth.users`**: Managed auth credentials and OAuth sessions.
* **`profiles`**: User metadata (`role`: `ADMIN` \| `PARTICIPANT`). Auto-created on signup via SQL trigger.
* **`events`**: Event details with Markdown descriptions and seat capacities.
* **`registrations`**: Many-to-many junction table with `UNIQUE(event_id, user_id)` to prevent double registrations.

### 4. Security & RBAC (Dual-Layer Guard)
1. **Edge Middleware (`proxy.ts`):** Restricts unauthenticated access to `/dashboard` and limits `/admin` to `ADMIN` users.
2. **Database Level (RLS & Server Actions):** Participants can only modify their own registrations; admins have full CRUD, attendee status toggling, and certificate attachment permissions.

### 5. Capacity Validation
Server Actions enforce an atomic active count (`status != 'CANCELLED'`) before confirming enrollment, preventing overbooking.

---

## ⚙️ Setup Instructions

### 1. Install & Configure
```bash
git clone https://github.com/Ivannov-arch/simple-event-manager.git
cd simple-event-manager
npm install
cp .env.example .env.local
```

Fill `.env.local` with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

### 2. Database Setup
1. Run the migration script from [README.md](./README.md#4-setup-postgresql-database-schema) in your **Supabase SQL Editor**.
2. Go to **Project Settings → API → Data API Settings** and add `simple_event_manager` to **Exposed schemas**.

### 3. Run
```bash
npm run dev     # Development (http://localhost:3000)
npm run build   # Production build
npm start       # Start production server
```

### 4. Admin Role Assignment
Run in **Supabase SQL Editor**:
```sql
UPDATE simple_event_manager.profiles SET role = 'ADMIN' WHERE username = 'your_username';
```
