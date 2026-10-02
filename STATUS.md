# STATUS INFRASTRUKTUR AUTOSOSMED v1

## 1. Database & Migrations (DONE)
- **Engine**: Supabase Postgres Cloud (`yyqfdaautohjineimrbs.supabase.co`)
- **Schema**: `Account`, `Media`, `Post`
- **Security**: Row Level Security (RLS) diaktifkan, user hanya bisa membaca/menulis datanya sendiri via `auth.uid() = user_id`.
- **Status**: Migrasi tabel dan RLS berstatus OK. Bukti curl tanpa auth otomatis ditolak `42501` (New row violates row-level security policy).

## 2. Autentikasi (DONE)
- **Gate**: Supabase Auth
- **Alur**: `POST /api/auth/login` menerima email/password, hit Supabase Auth, menerima token JWT, dan menyetel `sb-access-token` ke HttpOnly Cookie (`lax`).
- **Verifikasi**: Endpoint Route Handler dibungkus `getSupabaseServerClient()` yang akan membongkar JWT dari Cookie dan memasukkannya ke header `Authorization: Bearer <token>`, sehingga PostgREST selalu berjalan atas nama user tersebut (RLS patuh). 
- **Endpoint**: 
  - `POST /api/auth/login` (Login)
  - `POST /api/auth/logout` (Hapus cookie sb-access-token)
  - `GET /api/auth/me` (Cek sesi, butuh cookie valid)
- *Note:* User testing baru dibuat. Pastikan 'Email Confirmation' dimatikan di Supabase Dashboard (Authentication -> Providers -> Email -> nonaktifkan 'Confirm email') jika ingin login tanpa verify link.

## 3. Worker (DONE)
- **Opsi Terpilih**: Opsi 1 (Worker jalan di PC lokal).
- **Proses**: Worker `scheduler.mjs` jalan di latar (Cron 2-menit). Tugasnya melakukan poll tabel `Post` ke Supabase, melalukan posting via Playwright, dan update status `Post`.
- **Status**: Siap (PID aktif).

## 4. Monitoring / Uptime Kuma (DONE)
- **Port**: `:3002` (via Docker `louislam/uptime-kuma:1`)
- **URL**: [http://localhost:3002](http://localhost:3002)
- **Monitors Aktif**: 9router gateway, autososmed web, AFFiNE lokal.

## 5. Deployment Cloudflare Pages (Siap Deploy)
Aplikasi terbagi dua, Cloudflare untuk landing page dan Vercel untuk API+Dashboard.
- **Landing (Cloudflare Pages)**: Tinggal jalankan perintah berikut di direktori `landing`:
  ```bash
  cd ~/03_Projects/autososmed/landing
  npx wrangler pages deploy .
  ```
- **Dashboard & API (Vercel)**: Project root `web/` dikonfigurasi melalui `vercel.json` dan siap di-deploy via Vercel CLI atau GitHub.
