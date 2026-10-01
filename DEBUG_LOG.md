# 🛠️ Bug Fixes & Technical Debugging Report

Dokumen ini merangkum analisis akar masalah (*root cause*), perbaikan bug teknis, serta peningkatan antarmuka (*UI/UX Modernization*) dan fitur baru pada aplikasi **Event & Participant Management**.

---

## 1. Daftar Bug yang Ditemukan & Diperbaiki

### 🔴 Bug 1: `Runtime Error: Invalid schema: simple_event_manager`
* **Gejala**: Saat memuat data profile / actions (misal `getMyProfile`), server melempar error `Invalid schema: simple_event_manager`.
* **Akar Masalah**:
  1. PostgREST API Supabase Cloud secara default mengekspos skema `public`. Melewatkan opsi `{ db: { schema: "simple_event_manager" } }` ke client Supabase (`client.ts`, `server.ts`, `proxy.ts`) gagal jika skema belum didaftarkan di config PostgREST.
* **Solusi**:
  1. Menjalankan DDL SQL lengkap untuk skema `simple_event_manager` (tabel `profiles`, `events`, `registrations`, custom enums, RLS policies, dan trigger `handle_new_user`).
  2. Mendaftarkan skema `simple_event_manager` pada pengaturan API PostgREST Supabase.

---

### 🔴 Bug 2: `Could not find the table 'public.profiles' in the schema cache`
* **Gejala**: Error runtime server pada `app/actions/profile.ts: getMyProfile` yang mencari tabel di skema `public` (`public.profiles`).
* **Akar Masalah**:
  - Inisialisasi Supabase SSR client belum menetapkan target skema database secara eksplisit, sehingga semua pemanggilan `supabase.from("profiles")` default mencari ke skema `public.*`.
* **Solusi**:
  - Menambahkan konfigurasi `{ db: { schema: "simple_event_manager" } }` pada:
    1. [client.ts](file:///c:/Coding/event-manager/lib/supabase/client.ts) (`createBrowserClient`)
    2. [server.ts](file:///c:/Coding/event-manager/lib/supabase/server.ts) (`createServerClient`)
    3. [proxy.ts](file:///c:/Coding/event-manager/lib/supabase/proxy.ts) (`createServerClient` pada middleware)
  - Seluruh query ORM Supabase di seluruh aplikasi kini otomatis menargetkan tabel dalam skema `simple_event_manager`.

---

### 🔴 Bug 3: `Encountered a script tag while rendering React component`
* **Gejala**: Console error pada `RootLayout` di `app/layout.tsx`:
  > *"Encountered a script tag while rendering React component. Scripts inside React components are never executed when rendering on the client."*
* **Akar Masalah**: `next-themes` menginjeksi inline script tag untuk flash prevention pada SSR, yang memicu peringatan/error pada React 19 / Next.js 16 App Router.
* **Solusi**:
  1. Membuat `ThemeProvider` kustom di [theme-provider.tsx](file:///c:/Coding/event-manager/components/theme-provider.tsx) yang sepenuhnya kompatibel dengan React 19 tanpa menginjeksi raw script tags.
  2. Mengonfigurasi `className="dark"` secara bawaan pada tag `<html>` di [layout.tsx](file:///c:/Coding/event-manager/app/layout.tsx).
  3. Memperbarui [theme-switcher.tsx](file:///c:/Coding/event-manager/components/theme-switcher.tsx) agar mengonsumsi ThemeProvider lokal.

---

### 🔴 Bug 4: `Route segment config "dynamic" is not compatible with nextConfig.cacheComponents`
* **Gejala**: Next.js 16 melempar error build/kompilasi:
  > *"Route segment config 'dynamic' is not compatible with `nextConfig.cacheComponents`. Please remove it."*
* **Akar Masalah**: Konfigurasi `cacheComponents: true` pada `next.config.ts` di Next.js 16 bertentangan secara eksplisit dengan deklarasi route-segment legacy `export const dynamic = "force-dynamic"`.
* **Solusi**:
  1. Membersihkan `cacheComponents: true` dari `next.config.ts`.
  2. Menghapus deklarasi `export const dynamic = "force-dynamic"` di seluruh halaman sehingga Next.js 16 menggunakan model rendering dinamis otomatis bawaan App Router tanpa konflik.

---

### 🔴 Bug 5: Incompatible `supabase.auth.getClaims()` di `proxy.ts`
* **Gejala**: Method `supabase.auth.getClaims()` tidak valid pada standar client Supabase SSR sehingga berpotensi gagal me-refresh session atau menyebabkan logout acak.
* **Akar Masalah**: Pemanggilan helper yang tidak didukung secara native pada library `@supabase/ssr`.
* **Solusi**:
  - Memperbarui `lib/supabase/proxy.ts` menggunakan standar resmi:
    ```typescript
    const { data: { user } } = await supabase.auth.getUser();
    ```
  - Memverifikasi hak akses role admin secara aman melalui query tabel `profiles`.

---

### 🔴 Bug 6: Google OAuth `{"code":400,"error_code":"validation_failed","msg":"Unsupported provider: provider is not enabled"}`
* **Gejala**: Tombol *Continue with Google* melempar error 400 dari endpoint auth Supabase.
* **Akar Masalah**: Google Provider belum diaktifkan di Supabase Dashboard (Authentication $\rightarrow$ Providers $\rightarrow$ Google).
* **Solusi**:
  1. Membuat OAuth Client ID di Google Cloud Console dengan Redirect URI `https://<project-ref>.supabase.co/auth/v1/callback`.
  2. Memasukkan Client ID & Client Secret ke Dashboard Supabase dan mengaktifkan toggle *Enable Google provider*.

---

### 🔴 Bug 7: Database Error `JWT issued at future`
* **Gejala**: Pemanggilan API Supabase melempar error `JWT issued at future` saat mengeksekusi Server Actions.
* **Akar Masalah**: Terjadi *clock skew / time drift* antara jam lokal sistem dengan jam server Supabase Cloud (PostgREST mengecek `iat <= now()`), atau adanya cookie sesi lama yang membawa timestamp tidak valid.
* **Solusi**:
  1. Melakukan sinkronisasi jam Windows via *Settings $\rightarrow$ Date & Time $\rightarrow$ Sync now*.
  2. Membersihkan cookie browser lokal (`sb-*`) dan login ulang untuk mendapatkan token baru yang tersinkronisasi.

---

### 🔴 Bug 8: Tombol & Proteksi Role Admin Tidak Muncul / Case-Sensitive
* **Gejala**: Pengguna dengan role admin tidak melihat tombol `🛡️ Admin` di Navbar, atau tertolak saat mengakses `/admin`.
* **Akar Masalah**: Pengecekan string `role === "ADMIN"` bersifat *case-sensitive*, dan user baru yang mendaftar secara default berstatus `PARTICIPANT`.
* **Solusi**:
  - Mengubah seluruh pengecekan role menjadi *case-insensitive*:
    ```typescript
    const isAdmin = profile?.role?.toUpperCase() === "ADMIN";
    ```
  - Diperbarui pada [layout.tsx](file:///c:/Coding/event-manager/app/(dashboard)/layout.tsx), [proxy.ts](file:///c:/Coding/event-manager/lib/supabase/proxy.ts), [event.ts](file:///c:/Coding/event-manager/app/actions/event.ts), [profile.ts](file:///c:/Coding/event-manager/app/actions/profile.ts), dan [register.ts](file:///c:/Coding/event-manager/app/actions/register.ts).

---

### 🔴 Bug 9: `Runtime TypeError: Cannot read properties of null (reading 'selectionStart')` Saat Paste Judul Event
* **Gejala**: Aplikasi crash saat pengguna menempel (*paste*) teks ke input Event Title pada form pembuatan event.
* **Akar Masalah**: Properti `e.currentTarget` pada React Synthetic Event diakses di dalam callback asinkron `setTitle((prev) => { ... })`, di mana objek event telah dibersihkan oleh React (*event pooling / nullified*).
* **Solusi**:
  - Membaca `selectionStart` dan `selectionEnd` secara sinkron langsung sebelum pembaruan state dijalankan:
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
* **Gejala**: Deployment di Vercel gagal saat menjalankan `npm run build` dengan error TypeScript:
  > *"components/theme-switcher.tsx(58,42): error TS2345: Argument of type 'string' is not assignable to parameter of type 'Theme'."*
* **Akar Masalah**: Callback `onValueChange` pada `DropdownMenuRadioGroup` menghasilkan tipe `string`, sedangkan fungsi `setTheme` di `useTheme` mengekspektasikan union type `Theme` (`"dark" | "light" | "system"`).
* **Solusi**:
  - Mengekspor `type Theme` dari [theme-provider.tsx](file:///c:/Coding/event-manager/components/theme-provider.tsx).
  - Melakukan type-casting `onValueChange={(e) => setTheme(e as Theme)}` pada [theme-switcher.tsx](file:///c:/Coding/event-manager/components/theme-switcher.tsx).

---

### 🔴 Bug 11: Infinite Loading & Redirect Loop pada Google OAuth Callback
* **Gejala**: Login atau registrasi via tombol *Continue with Google* mengalami *infinite loading* atau terlempar ke `Site URL` yang salah jika diakses dari domain Vercel atau localhost.
* **Akar Masalah**:
  1. Parameter `redirectTo` mengirim query string dinamis `?next=/dashboard` (`.../auth/callback?next=/dashboard`). Supabase GoTrue Auth kaku dalam pencocokan URL dan mengabaikan parameter jika query string tidak cocok persis dengan entri di *Redirect URLs Allowlist*.
  2. Saat diabaikan, Supabase mem-fallback ke default `Site URL`, menyebabkan cookie verifier PKCE tidak ditemukan (berada di domain berbeda) dan alur auth macet.
  3. Handler `app/auth/callback/route.ts` sebelumnya me-redirect ke `/auth/error` tanpa query pesan error asli dari Supabase.
* **Solusi**:
  1. Membersihkan query string dari `redirectTo` di [login-form.tsx](file:///c:/Coding/Friends/Jeremia/event-manager/components/login-form.tsx) dan [sign-up-form.tsx](file:///c:/Coding/Friends/Jeremia/event-manager/components/sign-up-form.tsx) menjadi `${window.location.origin}/auth/callback`.
  2. Menetapkan nilai default `next` langsung ke `/dashboard` di [route.ts](file:///c:/Coding/Friends/Jeremia/event-manager/app/auth/callback/route.ts).
  3. Meneruskan pesan error asli Supabase ke `/auth/error?error=${encodeURIComponent(error.message)}` agar kegagalan auth dapat terdeteksi transparan.

---

### 🔴 Bug 12: Kuota Acara Fiktif Penuh Akibat Pendaftaran `CANCELLED` Dihitung Aktif
* **Gejala**: Acara yang kursinya telah dibatalkan oleh peserta tetap berstatus *Full* / Kuota Penuh di katalog acara (`/events`), sehingga calon peserta baru terhalang mendaftar.
* **Akar Masalah**:
  - Query pembacaan event di `app/actions/event.ts` menggunakan seleksi agregasi `registrations(count)` dari PostgREST yang menghitung **seluruh total baris** pada tabel `registrations`, termasuk baris peserta yang sudah dibatalkan (`status = 'CANCELLED'`).
* **Solusi**:
  1. Mengubah seleksi query menjadi `registrations(id, status)` di [event.ts](file:///c:/Coding/Friends/Jeremia/event-manager/app/actions/event.ts).
  2. Memperbarui perhitungan jumlah peserta aktif di seluruh tampilan ([events/page.tsx](file:///c:/Coding/Friends/Jeremia/event-manager/app/(dashboard)/events/page.tsx), [events/[id]/page.tsx](file:///c:/Coding/Friends/Jeremia/event-manager/app/(dashboard)/events/[id]/page.tsx), [admin/page.tsx](file:///c:/Coding/Friends/Jeremia/event-manager/app/(dashboard)/admin/page.tsx), [admin/events/page.tsx](file:///c:/Coding/Friends/Jeremia/event-manager/app/(dashboard)/admin/events/page.tsx), dan [admin/events/[id]/page.tsx](file:///c:/Coding/Friends/Jeremia/event-manager/app/(dashboard)/admin/events/[id]/page.tsx)) agar memfilter pendaftaran aktif (`status !== "CANCELLED"`).

---

### 🔴 Bug 13: Potensi Overbooking Kapasitas Saat Peserta Berstatus `ATTENDED`
* **Gejala**: Kapasitas maksimal event bisa terlampaui (*overbooked*) jika administrator sudah menandai kehadiran peserta menjadi `ATTENDED`.
* **Akar Masalah**:
  - Validasi kapasitas pendaftaran pada `registerEvent` di `app/actions/register.ts` hanya menghitung peserta dengan filter `.eq("status", "REGISTERED")`. Ketika peserta ditandai `ATTENDED`, kuota terdaftar berkurang di mata sistem validasi dan membuka celah pendaftaran berlebih.
* **Solusi**:
  - Mengubah filter kapasitas menjadi `.neq("status", "CANCELLED")` pada [register.ts](file:///c:/Coding/Friends/Jeremia/event-manager/app/actions/register.ts), sehingga baik peserta `REGISTERED` maupun `ATTENDED` tetap dihitung menempati kuota kursi.

---

### 🔴 Bug 14: Unhandled Crash `RangeError: Invalid time value` pada Event Form
* **Gejala**: Mengirim input tanggal/jam yang tidak lengkap atau tidak valid pada form pembuatan/edit event memicu crash React runtime (*blank screen*).
* **Akar Masalah**:
  - Konversi `.toISOString()` dipanggil langsung pada `new Date(...)` tanpa memverifikasi apakah objek Date valid melalui `isNaN(date.getTime())`.
* **Solusi**:
  - Menambahkan pengecekan `isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())` serta validasi kronologis sebelum konversi ISO di [event-form.tsx](file:///c:/Coding/Friends/Jeremia/event-manager/app/(dashboard)/admin/events/event-form.tsx).

---

### 🔴 Bug 15: Error `supabase.auth.getClaims is not a function` & Redirect Reset Password
* **Gejala**:
  1. Mengubah password pada form lupa password mengarahkan pengguna ke `/protected` yang crash dengan error: `TypeError: supabase.auth.getClaims is not a function`.
  2. Logout tidak langsung menghapus sesi di antarmuka server components.
* **Akar Masalah**:
  - Method `getClaims()` adalah method non-standar yang tidak tersedia pada `@supabase/ssr`.
  - Halaman `/protected` merupakan artefak boilerplate lama starter kit yang belum dibersihkan.
* **Solusi**:
  1. Mengarahkan form ganti password ke `/dashboard` di [update-password-form.tsx](file:///c:/Coding/Friends/Jeremia/event-manager/components/update-password-form.tsx).
  2. Mengganti seluruh pemanggilan `getClaims()` dengan `supabase.auth.getUser()` pada [auth-button.tsx](file:///c:/Coding/Friends/Jeremia/event-manager/components/auth-button.tsx) dan [protected/page.tsx](file:///c:/Coding/Friends/Jeremia/event-manager/app/protected/page.tsx).
  3. Menambahkan `router.refresh()` pada [logout-button.tsx](file:///c:/Coding/Friends/Jeremia/event-manager/components/logout-button.tsx) agar cookie sesi langsung tersinkronisasi.

---

## 2. Peningkatan Fitur & Antarmuka (UI/UX Overhaul)

### 🎨 1. Modernisasi Input Jadwal (Date & Time Picker)
* **Pemisahan Input**: Mengganti `datetime-local` yang kaku dengan **Date Picker** (`type="date"`) dan **Time Picker** (`type="time"`) terpisah yang jauh lebih presisi.
* **Custom Lucide Icon Overlay**: Menyembunyikan ikon hitam bawaan browser (*shadow DOM*) dan menggantinya dengan **Ikon Lucide React Kustom** (`Calendar` warna violet & `Clock` warna sky) yang berada di dalam input, sehingga tampilan 100% konsisten, elegan, dan berwarna di seluruh platform/browser.
* **Quick Presets**: Tombol 1-klik untuk jadwal cepat (*Today*, *Tomorrow*, *Weekend*).

### 📝 2. Dukungan Penuh Markdown & Live Preview pada Deskripsi Event
* **Komponen Renderer**: Membuat [markdown-renderer.tsx](file:///c:/Coding/event-manager/components/markdown-renderer.tsx) untuk merender elemen judul (`#`, `##`, `###`), teks tebal (`**bold**`), miring (`*italic*`), daftar poin (`- item`), nomor (`1. item`), kutipan (`> quote`), tautan (`[teks](url)`), dan blok kode (`` `code` ``).
* **Toolbar Markdown**: Menambahkan toolbar pintas untuk format cepat di form pembuatan/edit event.
* **Tab Write & Live Preview**: Memungkinkan admin mempratinjau hasil format Markdown secara instan sebelum disimpan.
* **Preservasi Spasi & Jarak Paragraf**: Menambahkan penanganan baris kosong (*blank lines*) dan `whitespace-pre-wrap` agar jarak antar paragraf dan baris baru tidak terpotong/hilang.
* **Tampilan Peserta & Admin**: Halaman detail event peserta (`events/[id]`) dan admin (`admin/events/[id]`) kini merender format Markdown secara otomatis dan elegan.

---
