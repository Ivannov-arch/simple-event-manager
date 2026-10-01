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
