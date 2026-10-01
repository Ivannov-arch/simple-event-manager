# 🚀 EventHub – Simple Event & Participant Management System

> **A unified event management platform for organizers and participants featuring a real-time registration system, participation certificate issuance, and Role-Based Access Control (RBAC).**

---

## 📌 Short Description

Event management is often hampered by manual registration processes, real-time seat availability uncertainty, and slow, fragmented certificate distribution processes. **EventHub** addresses these issues by providing a modern web-based platform that automates the entire event lifecycle—from creation and publication to self-registration with instant capacity validation, attendance verification, and direct certificate access. Through this platform, administrators gain full control and data transparency, while participants enjoy a fast, secure, and responsive event exploration and registration experience.

---

## 📑 Table of Contents

1. [Key Features](https://www.google.com/search?q=%23-key-features)
* [Participant Portal](https://www.google.com/search?q=%23-participant-portal)
* [Admin Management Console](https://www.google.com/search?q=%23-admin-management-console)


2. [Technical Decisions & Architecture](https://www.google.com/search?q=%23-technical-decisions--architecture)
3. [Tech Stack](https://www.google.com/search?q=%23-tech-stack)
4. [Prerequisites](https://www.google.com/search?q=%23-prerequisites)
5. [Installation](https://www.google.com/search?q=%23-installation)
* [1. Clone Repository](https://www.google.com/search?q=%231-clone-repository)
* [2. Install Dependencies](https://www.google.com/search?q=%232-install-dependencies)
* [3. Configure Environment Variables](https://www.google.com/search?q=%233-configure-environment-variables)
* [4. Setup PostgreSQL Database Schema](https://www.google.com/search?q=%234-setup-postgresql-database-schema)


6. [Usage](https://www.google.com/search?q=%23-usage)
* [Running the Development Server](https://www.google.com/search?q=%23running-the-development-server)
* [Build & Run in Production Mode](https://www.google.com/search?q=%23build--run-in-production-mode)
* [Participant Feature Testing Flow](https://www.google.com/search?q=%23participant-feature-testing-flow)
* [Administrator Feature Testing Flow](https://www.google.com/search?q=%23administrator-feature-testing-flow)


7. [License](https://www.google.com/search?q=%23-license)
8. [Contributing](https://www.google.com/search?q=%23-contributing)

---

## ✨ Key Features

In accordance with user requirement specifications (*Participant* and *Administrator*):

### 👤 Participant Portal

* **Account Authentication**: New account registration and secure login via Email & Password as well as **Google OAuth**.
* **Browse Events**: Explore all `PUBLISHED` status events with real-time remaining quota/seat capacity updates.
* **Interactive Event Details**: View detailed event descriptions rendered in rich format using **Markdown** syntax (headers, lists, links, blockquotes).
* **Self-Registration (Register Event)**: 1-click registration with transactional capacity validation and duplicate prevention (*anti-duplicate check*).
* **Participant Dashboard**: Track the list of joined events along with their status (`REGISTERED`, `ATTENDED`, or `CANCELLED`).
* **Participation Certificate Access**: Access and download official attendance certificate links after issuance by administrators.

### 🛡️ Admin Management Console

* **Dedicated Admin Dashboard**: An isolated administrative area with strict access control verification (*Role-Based Access Control*).
* **Event Lifecycle (CRUD Events)**: Create, edit, publish, and cancel events.
* **Markdown Editor & Live Preview**: Compose event descriptions with the help of a quick Markdown formatting toolbar and a live preview tab before saving.
* **Schedule & Capacity Management**: Date and time configuration using modern time pickers with Lucide React icons, as well as participant quota limits (left blank for unlimited).
* **Registered Roster Monitoring**: View a detailed list of all registered participants for each event.
* **Status Updates & Certificates**: Update participant attendance status (e.g., mark as `ATTENDED`) and attach participation certificate URLs for each participant.
* **User Status Governance**: Monitor and manage user account active status (`ACTIVE` or `SUSPENDED`).

---

## 🏛️ Technical Decisions & Architecture

In designing and implementing this application, several software engineering decisions were made to ensure security, scalability, and efficiency:

1. **Framework: Next.js 16 (App Router & Server Actions)**
* **Reason**: Next.js App Router provides *Server-Side Rendering (SSR)* capabilities for fast page loads and SEO friendliness.
* **Server Actions**: Used for all data mutation operations (registration, event manipulation, profile updates). This approach eliminates the need to create separate public REST API endpoints while keeping validation logic and authentication keys secure on the server side.


2. **Relational Database: PostgreSQL with Custom Schema (`simple_event_manager`)**
* **Reason**: The event, participant, and registration data models have strong relational characteristics (a *many-to-many* relationship between events and users).
* **Schema Isolation**: All tables are stored within a dedicated `simple_event_manager` schema (instead of the `public` schema) to ensure application data isolation from system schemas or other extensions.
* **Relational Integrity**: Utilization of *Foreign Keys* with `CASCADE` actions and a `UNIQUE(event_id, user_id)` constraint on the `registrations` table to guarantee data integrity at the database level.


3. **Authentication & Authorization: Supabase SSR & RBAC (Role-Based Access Control)**
* **Cookie-Based Sessions**: Uses the official `@supabase/ssr` package to manage JWT session tokens in `httpOnly` cookies, keeping sessions synchronized between the client browser, middleware, and server environment.
* **Dual-Layer Guard**:
* Layer 1 (*Edge Middleware / Proxy*): Prevents unauthenticated users from accessing the `/dashboard` route and restricts the `/admin` route exclusively to accounts with the `ADMIN` role.
* Layer 2 (*Database Row Level Security / RLS*): PostgreSQL RLS is applied to the `profiles`, `events`, and `registrations` tables to guarantee that data can only be read or modified by authorized entities.




4. **Validation & Capacity Transactions**
* Capacity checks are dynamically performed using `COUNT()` aggregation on the `registrations` table for active registrations when a registration request is received, preventing *overbooking* when quotas are limited.


5. **Modern UI/UX & Accessibility Design**
* Powered by **Tailwind CSS** with a built-in dark mode (*Dark Mode*) and *glassmorphism* effects.
* Date and time inputs are split into standalone pickers embedded with custom **Lucide React** icons for a consistent input experience across different browsers.



---

## 🛠️ Tech Stack

| Category | Technology | Description |
| --- | --- | --- |
| **Framework** | [Next.js 16](https://nextjs.org/) | React Framework (App Router, Turbopack, Server Actions) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | Static typing for code reliability and maintainability |
| **Database** | [PostgreSQL (Supabase)](https://supabase.com/) | Relational database with custom schema & RLS policies |
| **Authentication** | [Supabase SSR Auth](https://supabase.com/docs/guides/auth) | Cookie-based session, Email/Password & Google OAuth |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) | Modern utility-first styling with Dark/Light mode |
| **Icons** | [Lucide React](https://lucide.dev/) | Consistent and lightweight SVG icon set |
| **UI Components** | [Radix UI](https://www.radix-ui.com/) | Accessible UI primitives (Dropdown, Checkbox, Dialog) |

---

## 💻 Prerequisites

Before starting the local installation process, make sure your development environment meets the following requirements:

* **Node.js**: Version `20.x` LTS or higher.
* **Package Manager**: `npm` (version 10+), `pnpm` (version 9+), or `yarn`.
* **Operating System**: Windows 10/11, macOS, or a modern Linux distribution.
* **Supabase Account**: An active project on [Supabase](https://supabase.com/) for PostgreSQL and Auth services.
* **Git**: Version `2.x` for source code repository management.

---

## ⚙️ Installation

Follow these steps sequentially to run the project on your local machine:

### 1. Clone Repository

Open your terminal and run the following command:

```bash
git clone https://github.com/Ivannov-arch/simple-event-manager.git
cd simple-event-manager

```

### 2. Install Dependencies

Install all required dependency packages:

```bash
npm install

```

### 3. Configure Environment Variables

Copy the environment file template `.env.example` to `.env.local`:

```bash
cp .env.example .env.local

```

Open `.env.local` and enter your Supabase project credentials (obtainable at **Supabase Dashboard $\rightarrow$ Project Settings $\rightarrow$ API**):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-or-anon-key

```

### 4. Setup PostgreSQL Database Schema

Run the following SQL commands in the **Supabase SQL Editor** to create the schema, enum types, tables, new user triggers, and Row Level Security (RLS) policies:

```sql
-- 1. Create Dedicated Schema
CREATE SCHEMA IF NOT EXISTS simple_event_manager;

-- 2. Create Enum Types
CREATE TYPE simple_event_manager.user_role AS ENUM ('ADMIN', 'PARTICIPANT');
CREATE TYPE simple_event_manager.user_status AS ENUM ('ACTIVE', 'SUSPENDED');
CREATE TYPE simple_event_manager.event_status AS ENUM ('DRAFT', 'PUBLISHED', 'COMPLETED', 'CANCELLED');
CREATE TYPE simple_event_manager.registration_status AS ENUM ('REGISTERED', 'ATTENDED', 'CANCELLED');

-- 3. Profiles Table (linked to auth.users)
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

-- 5. Registrations Table (Junction Table)
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

-- 6. Automatic Profile Creation Trigger when User Registers in Supabase Auth
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

-- 7. Enable Row Level Security (RLS)
ALTER TABLE simple_event_manager.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE simple_event_manager.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE simple_event_manager.registrations ENABLE ROW LEVEL SECURITY;

-- 8. Grant Access Permissions to Anon and Authenticated Roles
GRANT USAGE ON SCHEMA simple_event_manager TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA simple_event_manager TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA simple_event_manager TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA simple_event_manager GRANT ALL ON TABLES TO anon, authenticated;

```

> [!IMPORTANT]
> **Important (Expose Schema in PostgREST API)**:
> Go to **Supabase Dashboard** $\rightarrow$ **Project Settings** $\rightarrow$ **API** $\rightarrow$ find the **Data API Settings** section $\rightarrow$ under **Exposed schemas**, add the `simple_event_manager` schema alongside `public`, then save settings.

---

## 🎯 Usage

Below are commands that can be directly copied to run and manage the application:

### Running the Development Server

Run this command in the project directory:

```bash
npm run dev

```

Open your browser and navigate to:

```text
http://localhost:3000

```

### Build & Run in Production Mode

To verify build readiness and run production mode locally:

```bash
# 1. Compile Next.js application
npm run build

# 2. Run production server
npm start

```

---

### Participant Feature Testing Flow

1. **Account Registration**: Go to the homepage, click **Sign Up**, and create a new account using email or the *Continue with Google* button.
2. **Browse Events**: Click the **Events** menu on top navigation to view the catalog of currently open (*Published*) events.
3. **View Details & Register**: Select an event, read the complete Markdown-formatted description, and click the **Register for Event** button.
4. **Check Dashboard**: Access the **Dashboard** menu to see your joined events, monitor attendance status, or download certificates once issued.

### Administrator Feature Testing Flow

1. **Promote Account to Admin**:
Run the following query in the Supabase SQL Editor to grant admin privileges to your account:
```sql
UPDATE simple_event_manager.profiles
SET role = 'ADMIN'
WHERE username = 'your_username';

```


2. **Access Admin Panel**: Refresh your browser. The **🛡️ Admin** navigation button will automatically appear (or visit `/admin`).
3. **Create New Event**: Click **Create New Event**, fill in the title, date, time, capacity, and description using Markdown (use the *Preview* tab to preview in real-time).
4. **Publish Event**: Change the event status to `PUBLISHED` so it becomes visible to all participants.
5. **Manage Attendance & Certificates**: On the event detail page inside the Admin Panel, open the registrants tab to view the list of participants, change statuses to `ATTENDED`, and insert participation certificate URLs.

---

## ⚖️ License

This project is released and distributed under the open-source [MIT License](https://www.google.com/search?q=LICENSE).

You are free to use, modify, merge, publish, distribute, and sublicense this code for personal or commercial purposes, provided that original copyright attribution is retained.

---

## 🤝 Contributing

Contributions to the development of **EventHub** are highly appreciated! If you would like to contribute, please follow the standard workflow:

1. **Fork** this repository to your GitHub account.
2. Create a new feature branch off of the `main` branch:
```bash
git checkout -b feature/new-feature-name

```


3. Make your code changes adhering to a clean and consistent coding style.
4. Commit your changes with a clear and descriptive commit message:
```bash
git commit -m "feat: add event search filter by category"

```


5. Push your branch to your forked repository:
```bash
git push origin feature/new-feature-name

```


6. Open a **Pull Request (PR)** targeting the `main` branch of the primary repository with a clear description of your changes.

---