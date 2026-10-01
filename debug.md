# 🛠️ Bug Fixes & Technical Debugging Report

Dokumen ini merangkum analisis akar masalah (*root cause*), perbaikan bug teknis, serta peningkatan estetika antarmuka (*UI/UX Modernization*) pada aplikasi **Event & Participant Management**.

---

## 1. Daftar Bug yang Ditemukan & Diperbaiki

### 🔴 Bug 1: `Runtime Error: Invalid schema: simple_event_manager`
* **Gejala**: Saat memuat data profile / actions (misal `getMyProfile`), server melempar error `Invalid schema: simple_event_manager`.
* **Akar Masalah**:
  1. PostgREST API Supabase Cloud secara default mengekspos skema `public`. Melewatkan opsi `{ db: { schema: "simple_event_manager" } }` ke client Supabase (`client.ts`, `server.ts`, `proxy.ts`) gagal jika skema belum didaftarkan di config PostgREST.
* **Solusi**:
  1. Menjalankan DDL SQL lengkap untuk skema `simple_event_manager` (tabel `profiles`, `events`, `registrations`, custom enums, RLS policies, dan trigger `handle_new_user`).
  2. Membuat updatable views di skema `public` (`public.profiles`, `public.events`, `public.registrations`) dengan `WITH (security_invoker = true)` dan memberikan hak akses penuh (`GRANT ALL ON public.* TO anon, authenticated, service_role`).
  3. Menghapus konfigurasi custom schema override dari `lib/supabase/client.ts`, `lib/supabase/server.ts`, dan `lib/supabase/proxy.ts` agar query otomatis melewati updatable views `public` dengan keamanan RLS tetap terjaga.
  4. Berhasil memverifikasi operasi **INSERT** dan **READ/SELECT** langsung ke database Supabase.

---

### 🔴 Bug 2: `Encountered a script tag while rendering React component`
* **Gejala**: Console error pada `RootLayout` di `app/layout.tsx`:
  > *"Encountered a script tag while rendering React component. Scripts inside React components are never executed when rendering on the client."*
* **Akar Masalah**: `next-themes` menginjeksi inline script tag untuk flash prevention pada SSR, yang memicu peringatan/error pada React 19 / Next.js 16 App Router.
* **Solusi**:
  1. Membuat `ThemeProvider` kustom di [theme-provider.tsx](file:///c:/Coding/event-manager/components/theme-provider.tsx) yang sepenuhnya kompatibel dengan React 19 tanpa menginjeksi raw script tags.
  2. Mengonfigurasi `className="dark"` secara bawaan pada tag `<html>` di [layout.tsx](file:///c:/Coding/event-manager/app/layout.tsx).
  3. Memperbarui [theme-switcher.tsx](file:///c:/Coding/event-manager/components/theme-switcher.tsx) agar mengonsumsi ThemeProvider lokal.

---

### 🔴 Bug 3: `Route segment config "dynamic" is not compatible with nextConfig.cacheComponents`
* **Gejala**: Next.js 16 melempar error build/kompilasi:
  > *"Route segment config 'dynamic' is not compatible with `nextConfig.cacheComponents`. Please remove it."*
* **Akar Masalah**: Konfigurasi `cacheComponents: true` pada `next.config.ts` di Next.js 16 bertentangan secara eksplisit dengan deklarasi route-segment legacy `export const dynamic = "force-dynamic"`.
* **Solusi**:
  1. Membersihkan `cacheComponents: true` dari `next.config.ts`.
  2. Menghapus deklarasi `export const dynamic = "force-dynamic"` di seluruh halaman sehingga Next.js 16 menggunakan model rendering dinamis otomatis bawaan App Router tanpa konflik.

---

### 🔴 Bug 4: Incompatible `supabase.auth.getClaims()` di `proxy.ts`
* **Gejala**: Method `supabase.auth.getClaims()` tidak valid pada standar client Supabase SSR sehingga berpotensi gagal me-refresh session atau menyebabkan logout acak.
* **Akar Masalah**: Pemanggilan helper yang tidak didukung secara native pada library `@supabase/ssr`.
* **Solusi**:
  - Memperbarui `lib/supabase/proxy.ts` menggunakan standar resmi:
    ```typescript
    const { data: { user } } = await supabase.auth.getUser();
    ```
  - Memverifikasi hak akses role admin secara aman melalui query tabel `profiles`.

---

## 2. Peningkatan Estetika & Desain UI (Modern & Premium Overhaul)

Sesuai permintaan untuk menghilangkan kesan tampilan standar (*default*), seluruh UI telah dirombak dengan desain modern:

1. **Desain Sistem & Color Palette (`app/globals.css`)**:
   - Skema warna **Deep Midnight / Violet & Indigo Glow** dengan aksen Emerald & Sky.
   - Penambahan utility class `.glass-panel` (*backdrop-blur*, translucent borders), `.gradient-text`, dan efek glow `.glow-purple`.

2. **Landing Page (`app/page.tsx`)**:
   - Hero section futuristik dengan ambient lighting blur, badge pengumuman, pill statistik langsung, dan highlight fitur berbasis kartu glassmorphism.

3. **Dashboard Peserta (`app/(dashboard)/dashboard/page.tsx`)**:
   - Kartu metrik registrasi, event completed, dan total history dengan warna status kontras.
   - List event terdaftar dengan badge status real-time, link direct sertifikat, dan detail venue.

4. **Katalog Event (`app/(dashboard)/events/page.tsx`)**:
   - Visual progress bar untuk kapasitas tempat duduk (*Seats filled %*).
   - Indikator badge dinamis (*Registered*, *Full*, *Open*).

5. **Konsol Admin (`app/(dashboard)/admin/*`)**:
   - Metric dashboard cards dengan icon-icon representatif.
   - Tabel event dan peserta yang responsif dan interaktif.
   - Dropdown pengubahan status instan (*REGISTERED* / *ATTENDED* / *CANCELLED*) & input sertifikat inline tanpa reload halaman.
   - Tombol hapus aman (*delete confirm*) yang hanya aktif untuk event draft/cancelled.

6. **Formulir & Autentikasi (`components/login-form.tsx`, `components/sign-up-form.tsx`, `event-form.tsx`)**:
   - Input fields dengan ikon, feedback status interaktif, tombol gradient, dan status loader beranimasi (*spinner*).
