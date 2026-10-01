# AutoSosmed (internal)

Automation posting + antrean untuk seluruh lini bisnis. Web Next.js + worker Playwright.
Design intent: `~/01_Academic/a plan/autososmed-full/`.

## Status

- [x] Scheduler core (`packages/scheduler`) — 7/7 test pass
- [x] Infra lokal (Postgres + Redis via compose)
- [ ] Web: Prisma migrate + API queue + dashboard
- [ ] Worker: login/poster Playwright per platform
- [ ] AI composer (caption + image via gateway 9router)

## Jalan lokal

```bash
cp -n .env.example .env
docker compose up -d db redis
cd packages/scheduler && npm test
cd ../../web && npm install && npx prisma migrate dev && npm run dev
```
