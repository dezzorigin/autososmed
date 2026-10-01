# AutoSosmed — Status & Laporan Infrastruktur

Terakhir diperbarui: 2026-10-02

---

## 1. Status Fitur & Fase Inti (1 - 4)

| No | Fitur / Komponen | Status | Keterangan & Bukti Verifikasi |
|---|---|---|---|
| **1** | **Evidence Mapping API** | **DONE** | Route `/api/evidence/[jobId]` dinormalisasi untuk menangani decoding karakter `+` / spasi, fallback ke disk `evidence/*.png`, dan database. `curl -I http://localhost:3001/api/evidence/kopi-a+threads+57a1adeaab06` mengembalikan `HTTP 200` (18.231 bytes, `image/png`). |
| **2** | **Hapus Dummy Auth + Supabase Auth Gate** | **DONE** | Seluruh referensi `TEAM_SECRET` telah dihapus dari codebase (terbukti 0 sisa via grep). Gate Supabase Auth aktif: jika `SUPABASE_URL` / `SUPABASE_ANON_KEY` belum diset, mengembalikan error terstandar `BUTUH_SUPABASE_ANON_KEY` (`HTTP 503`). |
| **3** | **Supabase MCP** | **PENDING** | Memerlukan kredensial `SUPABASE_ACCESS_TOKEN`. Status: `BUTUH_SUPABASE_TOKEN`. |
| **4** | **Cloudflare Pages Deployment** | **READY** | `wrangler` v4.146.0 terpasang, konfigurasi `wrangler.toml` siap, `npm run build` produksi sukses (14/14 pages). Dihentikan sebelum `wrangler login` sesuai instruksi. |

---

## 2. Status Layanan & Infrastruktur

- **Uptime Kuma Dashboard**: `http://localhost:3002` (`HTTP 200` OK, Bytes: 2.493)
  - **Monitor 1**: `9router` (`http://host.docker.internal:20128/v1/models`) — **UP** (200 OK, keyword `data` terverifikasi)
  - **Monitor 2**: `autososmed` (`http://host.docker.internal:3001/api/health`) — **UP** (200 OK)
  - **Monitor 3**: `AFFiNE` (`http://host.docker.internal:3010`) — **UP** (200 OK)
- **Background Worker Daemon**: Aktif di background (`PID: 220625`), polling queue antrean tiap 5 detik, auto-generate mockup evidence PNG dan eksekusi browser Playwright.
- **Next.js Web Server**: `http://localhost:3001` — **UP**.
- **Postgres Database**: Port `5433` (Docker Compose) — **HEALTHY**.
- **Redis Cache**: Port `6380` (Docker Compose) — **HEALTHY**.
- **9router Local AI Gateway**: Port `20128` — **HEALTHY** (terhubung ke model `ag/gemini-3.8-flash`).

---

## 3. Daftar Eksplisit Kebutuhan (BUTUH_*)

1. **`BUTUH_SUPABASE_ANON_KEY`**:
   - Diperlukan untuk menghubungkan login/signup langsung ke Supabase Auth.
   - Tambahkan di `.env`:
     ```env
     NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key-dari-supabase>
     ```

2. **`BUTUH_SUPABASE_TOKEN`**:
   - Diperlukan untuk memasang dan menjalankan Supabase Model Context Protocol (MCP).
   - Cara pembuatan token:
     1. Buka dashboard [supabase.com](https://supabase.com/dashboard)
     2. Buka **Account Settings** → **Access Tokens**
     3. Klik **Generate new token**, beri nama `autososmed-mcp`
     4. Masukkan ke `.env`:
        ```env
        SUPABASE_ACCESS_TOKEN=<token_anda>
        ```

3. **`BUTUH_DISCORD_WEBHOOK`** *(Opsional)*:
   - Jika ingin mengaktifkan alert otomatis saat posting sukses/gagal di worker atau monitoring Uptime Kuma:
     ```env
     DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
     ```

---

## 4. Instruksi Deploy Cloudflare Pages

Jalankan perintah berikut di terminal untuk otentikasi browser dan deploy:

```bash
cd ~/03_Projects/autososmed/web

# 1. Login ke Cloudflare (akan membuka jendela browser)
npx wrangler login

# 2. Deploy ke Cloudflare Pages
npx wrangler pages deploy .next --project-name=autososmed
```
