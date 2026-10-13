# TMS Platform – Phase 16
1. npm install
2. cp .env.example .env.local  (set DATABASE_URL + NEXTAUTH_SECRET)
3. npx prisma db push && npm run db:seed   (schema changed: re-run db push; npm install for recharts)
4. npm run dev
Logins: admin@/customer@/driver@/vendor@tms.et — Password123!
Dev: OTP codes print in the server console unless BREVO_API_KEY is set.
Production: set NODE_ENV=production, a strong NEXTAUTH_SECRET, leave NEXT_PUBLIC_SHOW_DEMO unset, do NOT run the demo seed.
Maps: npm install (leaflet, react-leaflet). Optional ORS_API_KEY for real road routes.
Tests: copy .env.test.example to .env.test (DB name must contain "test"), then `npm run test:unit` (no DB) or `npm test` (unit + integration). E2E: seed dev DB, `npx playwright install chromium`, `npm run test:e2e`.

## Deploy (Docker)
1. Locally, once: `docker compose -f docker-compose.dev.yml up -d`, set DATABASE_URL in .env.local, run `npx prisma migrate dev --name init` and COMMIT prisma/migrations (production applies migrations, not `db push`).
2. On the server: `cp .env.production.example .env.production`, fill it in (strong NEXTAUTH_SECRET, DOMAIN, BREVO_API_KEY). Point your domain's DNS at the server.
3. `docker compose up -d --build` -> database, migrations, app and HTTPS (Caddy) start in order. Check `https://DOMAIN/api/health`.
4. Create your first admin (the demo seed is blocked in production): run the seed once with ALLOW_SEED=true on a private copy, or insert an ADMIN user with a bcrypt hash yourself.
5. Cron `scripts/backup.sh` daily and copy backups off the server.
