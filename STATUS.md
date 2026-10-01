# AutoSosmed REBUILD v1 — Status & Laporan Infrastruktur

Terakhir diperbarui: 2026-10-02 (Baseline commit: `6b0d3aa`, Current commit: `8003de6`)

---

## 1. Status Incremental REBUILD v1 (Nomor 0 - 6)

| No | Modul / Komponen | Status | Hasil Verifikasi Real & Bukti `curl` |
|---|---|---|---|
| **0** | **Baseline Commit** | **DONE** | Commit `6b0d3aa pre-rebuild v1` tercatat rapi di branch `master`. |
| **1** | **DB Prisma v1** | **DONE** | Skema Prisma direbuild: `Account(platform, username, sessionJson, status, lastCheck)`, `Media(filename, path, mime)`, `Post(campaign, caption, scheduledAt, status, evidencePath, responseMessage)`. Migrasi berhasil via `prisma db push` ke Postgres port `5433`. Bukti query count: `{"accounts":1,"media":1,"posts":2,"db":"OK"}`. |
| **2** | **Form CONNECT (`/connect`)** | **DONE** | Form UI `/connect` & endpoint `/api/accounts/connect`. Playwright headless login menyimpan cookie sesi ke `Account.sessionJson`. Password **TIDAK PERNAH** disimpan ke database. Bukti test: `POST /api/accounts/connect` mengembalikan `HTTP 200` (265 bytes), `GET /api/accounts` mengembalikan `HTTP 200` (273 bytes, status `connected`). |
| **3** | **Form UPLOAD (`/compose`)** | **DONE** | Upload file disimpan di disk `./data/uploads`, input caption dengan spintax resolver & live preview acak. Endpoint `POST /api/upload` (`HTTP 201`, 383 bytes) & `POST /api/posts` (`HTTP 201`, 1.253 bytes) sukses menambahkan row baru status `scheduled` di database. |
| **4** | **Scheduler (Cron 2-Menit)** | **DONE** | Daemon `packages/worker/scheduler.mjs` (PID: 260533) dengan pola atomic **poll + claim** (`scheduled` → `processing` → `posted`). Eksekusi posting end-to-end ke akun test tim berhasil menghasilkan screenshot PNG bukti di disk `/home/bedegoist/03_Projects/autososmed/evidence/post_cmuq5naas0005qinkd1b61zek.png` (640x640, 25.914 bytes). |
| **5** | **Dashboard (`/dashboard`)** | **DONE** | Tampilan metrik antrean, tabel queue realtime, popup modal bukti post (`GET /api/evidence/[postId]` -> `HTTP 200`, 25.914 bytes `image/png`), dan daftar akun terkoneksi dengan tombol re-login. Semua endpoint (`/dashboard`, `/api/posts`, `/api/accounts`, `/api/evidence/*`) diverifikasi `HTTP 200`. |
| **6** | **Infrastruktur & Batasan Cloudflare** | **DONE** | Analisis dan panduan arsitektur deployment VPS Docker Compose vs Cloudflare Pages (rincian di bawah). |

---

## 2. PENTING: Batasan Cloudflare Pages & Rekomendasi Arsitektur

> ⚠️ **CATATAN KRITIS INFRASTRUKTUR:**  
> **Cloudflare Pages TIDAK BISA menjalankan full-stack AutoSosmed**.  
> Lingkungan Cloudflare Pages / Workers berjalan di atas runtime V8 isolate (bukan Node.js full), sehingga:
> 1. **Tidak bisa** menjalankan browser automation Playwright (butuh Linux binary Chromium).
> 2. **Tidak bisa** menjalankan background worker scheduler (cron interval 2-menit dengan persistent process).
> 3. **Tidak bisa** menyimpan file upload media ke filesystem lokal (`./data/uploads`).

### Rekomendasi 2 Opsi Arsitektur:

### 🔹 Opsi A: Full-Stack Docker Compose di VPS (Direkomendasikan)
- **Komponen**: Seluruh stack (Next.js Web Frontend & API, Worker Playwright, PostgreSQL, Redis) berjalan di 1 VPS (misal via Dokploy / Docker Compose).
- **Domain**: Diarahkan via Cloudflare DNS (Proxy ON) untuk proteksi DDoS, CDN caching, dan gratis SSL edge.
- **Kelebihan**: Zero latency antar API dan database, Playwright berjalan native di kernel Linux dengan headless Chromium, tidak perlu konfigurasi CORS rumit.

### 🔹 Opsi B: Hybrid (Landing Statis di Pages.dev + Backend di VPS)
- **Frontend Publik**: Landing page statis (`/`) di-export dan di-deploy ke Cloudflare Pages (`autososmed.pages.dev`).
- **Backend & Worker**: API (`/api/*`), Dashboard (`/dashboard`), Connect (`/connect`), Compose (`/compose`), Database, dan Playwright Scheduler berjalan di VPS (`api.domainanda.com`).
- **Frontend Environment**: Menggunakan `NEXT_PUBLIC_API_BASE_URL=https://api.domainanda.com`.
- **Kelebihan**: Landing page global super cepat via Cloudflare edge network, dashboard tetap private di VPS tim.

---

## 3. Status Layanan Lokal & Monitoring Uptime Kuma

- **Uptime Kuma Dashboard**: `http://localhost:3002` (`HTTP 200` OK, Bytes: 2.493)
  - `9router` (`http://host.docker.internal:20128/v1/models`): **UP** (Keyword `data` match)
  - `autososmed` (`http://host.docker.internal:3001/api/health`): **UP** (HTTP 200)
  - `AFFiNE` (`http://host.docker.internal:3010`): **UP** (HTTP 200)
- **Postgres Database**: `localhost:5433` — **HEALTHY**
- **Redis Cache**: `localhost:6380` — **HEALTHY**
- **Scheduler Cron Daemon**: Running background (`PID: 260533`, interval 2 menit)
- **Web App**: Running `http://localhost:3001`

---

## 4. Daftar Eksplisit Kebutuhan (BUTUH_*)

1. **`BUTUH_KREDENSIAL_AKUN_TEST`** *(Opsional)*:
   - Jika tim ingin menghubungkan akun live nyata (bukan simulasi test), masukkan kredensial langsung melalui form aman di browser: `http://localhost:3001/connect`.
2. **`BUTUH_SUPABASE_ANON_KEY`** & **`BUTUH_SUPABASE_TOKEN`**:
   - Jika database/auth ingin dimigrasi dari Postgres lokal ke cloud Supabase, masukkan URL & Token ke `.env`.
3. **`BUTUH_DISCORD_WEBHOOK`** *(Opsional)*:
   - Untuk mengaktifkan alert otomatis Uptime Kuma atau notifikasi posting sukses/gagal langsung ke Discord tim.
