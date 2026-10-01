# 🚀 EventHub – Short README: Technical Decisions & Setup Guide

> **A streamlined, full-stack event and participant management system built with Next.js 16, PostgreSQL (Supabase), and Tailwind CSS, deployed on Vercel.**

---

## 🏛️ Technical Decisions & Architecture

### 1. High-Level Architecture
* **Serverless Fullstack Pattern:** Built as a unified single-repository application leveraging **Next.js App Router** with **Server Actions** directly interfaced to **Supabase (Backend-as-a-Service)**.
* **Engineering Rationale:** For the required scope (Auth, RBAC, CRUD, and Registrations within a 2–4 hour delivery timeline), adding a decoupled backend (e.g., Express, FastAPI, or Laravel) introduces unnecessary API boilerplate, CORS handshakes, redundant DTO schemas, and multi-service deployment friction. A serverless architecture minimizes operational overhead while maintaining strict server-side validation.

---

### 2. Technology Choices

| Category | Technology | Rationale |
| :--- | :--- | :--- |
| **Frontend Framework** | **Next.js 16 (App Router) + TypeScript** | Server-Side Rendering (SSR) for fast initial paint, static typing safety, and React 19 server components. |
| **Backend Framework** | **Next.js Server Actions** | Type-safe RPC-style server mutations directly executed on the server; keeps database keys and validation logic off client bundles. |
| **Database** | **PostgreSQL (Supabase)** | Fully relational model with Foreign Keys, constraints, custom schema isolation, and automated SQL triggers. |
| **Hosting & Deployment** | **Vercel** + **Supabase Cloud** | Automated zero-config CI/CD via GitHub commits with global CDN edge delivery and serverless runtime. |
| **UI Design** | **Tailwind CSS + Radix UI Primitives** | Designed with an **eye-comfort Dark Mode** (`#090d16` slate background), smooth glassmorphism panels, and clear contrast for high readability. |
| **Libraries & APIs** | **`@supabase/ssr`**, **`lucide-react`** | Official cookie-based SSR session management, accessible UI primitives, and clean iconography for form controls. |

---

### 3. Database & Data Modeling (Relational PostgreSQL)

The system relies on a relational model isolated within a dedicated schema (`simple_event_manager`):

1. **`auth.users` (Supabase Internal):** Securely handles password hashing, JWT credentials, and Google OAuth sessions.
2. **`simple_event_manager.profiles`:** Stores custom user attributes (`full_name`, `username`, `birth_date`, `role`: `ADMIN` | `PARTICIPANT`, `status`: `ACTIVE` | `SUSPENDED`).
   * *Automatic Trigger:* Connected 1:1 to `auth.users` via a PostgreSQL `AFTER INSERT` trigger (`handle_new_user()`) that provisions a profile instantly upon signup.
3. **`simple_event_manager.events`:** Stores event records (`title`, `description` with Markdown support, `location`, `start_time`, `end_time`, `capacity`, `status`: `DRAFT` | `PUBLISHED` | `COMPLETED` | `CANCELLED`, `created_by`).
4. **`simple_event_manager.registrations` (Junction Table):** Many-to-many link between `profiles` and `events`.
   * Holds enrollment `status` (`REGISTERED`, `ATTENDED`, `CANCELLED`) and `certificate_url`.
   * **Data Integrity:** Enforces `UNIQUE(event_id, user_id)` constraint to prevent duplicate enrollments at the database level.

---

### 4. Security & Access Control (RBAC)

A **dual-layer security barrier** is enforced across the platform:
* **Layer 1 – Edge Proxy / Middleware (`proxy.ts`):** Evaluates user sessions on every request. Protects `/dashboard` routes from unauthenticated users and restricts `/admin` routes strictly to accounts with the `ADMIN` role.
* **Layer 2 – Server Actions & PostgreSQL Row Level Security (RLS):** 
  * **Participants:** Can read published events, enroll/cancel only their own registrations, and access their own issued certificates.
  * **Administrators:** Have elevated permissions to create/edit/delete events, inspect participant rosters, toggle attendance status (`ATTENDED`), and attach official certificate URLs.

---

### 5. Capacity Validation & Anti-Overbooking
Before confirming any event registration, the server executes a non-cancelled participant count (`status != 'CANCELLED'`). If `event.capacity` is defined and filled, the transaction aborts with a user-friendly error, preventing race-condition overbooking.

---

## ⚙️ Setup & Installation Instructions

### Prerequisites
* **Node.js**: `v20.x` LTS or higher
* **Package Manager**: `npm`, `pnpm`, or `bun`
* **Active Supabase Project**: With PostgreSQL and Authentication enabled

---

### 1. Clone the Repository
```bash
git clone https://github.com/Ivannov-arch/simple-event-manager.git
cd simple-event-manager
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy the template file to `.env.local`:
```bash
cp .env.example .env.local
```
Update `.env.local` with your Supabase project credentials (found under **Supabase Dashboard → Project Settings → API**):
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-or-anon-key
```

### 4. Setup Database Schema in Supabase
Run the following SQL migration script in your **Supabase SQL Editor**:

```sql
-- 1. Create Dedicated Schema
CREATE SCHEMA IF NOT EXISTS simple_event_manager;

-- 2. Create Enums
CREATE TYPE simple_event_manager.user_role AS ENUM ('ADMIN', 'PARTICIPANT');
CREATE TYPE simple_event_manager.user_status AS ENUM ('ACTIVE', 'SUSPENDED');
CREATE TYPE simple_event_manager.event_status AS ENUM ('DRAFT', 'PUBLISHED', 'COMPLETED', 'CANCELLED');
CREATE TYPE simple_event_manager.registration_status AS ENUM ('REGISTERED', 'ATTENDED', 'CANCELLED');

-- 3. Profiles Table
CREATE TABLE simple_event_manager.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  username TEXT UNIQUE,
  birth_date DATE,
  role simple_event_manager.user_role DEFAULT 'PARTICIPANT' NOT NULL,
  status simple_event_manager.user_status DEFAULT 'ACTIVE' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 4. Events Table
CREATE TABLE simple_event_manager.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  location TEXT DEFAULT 'Online' NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  capacity INT,
  status simple_event_manager.event_status DEFAULT 'DRAFT' NOT NULL,
  created_by UUID REFERENCES simple_event_manager.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 5. Registrations Junction Table
CREATE TABLE simple_event_manager.registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES simple_event_manager.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES simple_event_manager.profiles(id) ON DELETE CASCADE,
  status simple_event_manager.registration_status DEFAULT 'REGISTERED' NOT NULL,
  certificate_url TEXT,
  registered_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT unique_event_participant UNIQUE (event_id, user_id)
);

-- 6. User Provisioning Trigger
CREATE OR REPLACE FUNCTION simple_event_manager.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO simple_event_manager.profiles (id, full_name, username, role, status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Participant'),
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1) || '_' || substr(NEW.id::text, 1, 4)),
    'PARTICIPANT',
    'ACTIVE'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION simple_event_manager.handle_new_user();

-- 7. Row Level Security & Permissions
ALTER TABLE simple_event_manager.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE simple_event_manager.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE simple_event_manager.registrations ENABLE ROW LEVEL SECURITY;

GRANT USAGE ON SCHEMA simple_event_manager TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA simple_event_manager TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA simple_event_manager TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA simple_event_manager GRANT ALL ON TABLES TO anon, authenticated;
```

> ⚠️ **Crucial Step (Expose Schema in Data API)**:
> In Supabase Dashboard → **Project Settings** → **API** → under **Data API Settings** → add `simple_event_manager` to **Exposed schemas** and save.

---

### 5. Running the Application

#### Development Mode:
```bash
npm run dev
```
Access the application at [http://localhost:3000](http://localhost:3000).

#### Production Build & Run:
```bash
npm run build
npm start
```

---

### 6. Promoting an Account to Administrator

To test admin capabilities, sign up an account, then run this query in your **Supabase SQL Editor**:
```sql
UPDATE simple_event_manager.profiles
SET role = 'ADMIN'
WHERE username = 'your_registered_username';
```
Refresh your browser to unlock the **🛡️ Admin Console** navigation item.
