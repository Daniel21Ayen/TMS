import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

// Fixed-window limiter stored in Postgres: one atomic upsert per hit, works across serverless instances (no Redis needed).
// All time math uses the DATABASE clock in UTC (the same convention Prisma uses for DateTime columns), so window expiry
// is correct whatever time zone the app server or the database session uses.
export async function rateLimit(key: string, max: number, windowSec: number) {
  const [row] = await prisma.$queryRaw<{ count: number; secs: number }[]>`
    INSERT INTO "RateLimit" ("key","count","resetAt")
    VALUES (${key}, 1, (NOW() AT TIME ZONE 'UTC') + ${windowSec}::double precision * INTERVAL '1 second')
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE WHEN "RateLimit"."resetAt" < (NOW() AT TIME ZONE 'UTC') THEN 1 ELSE "RateLimit"."count" + 1 END,
      "resetAt" = CASE WHEN "RateLimit"."resetAt" < (NOW() AT TIME ZONE 'UTC')
        THEN (NOW() AT TIME ZONE 'UTC') + ${windowSec}::double precision * INTERVAL '1 second' ELSE "RateLimit"."resetAt" END
    RETURNING "count", EXTRACT(EPOCH FROM ("resetAt" - (NOW() AT TIME ZONE 'UTC')))::double precision AS "secs"`;
  if (Math.random() < 0.01) prisma.$executeRaw`DELETE FROM "RateLimit" WHERE "resetAt" < (NOW() AT TIME ZONE 'UTC')`.catch(() => {}); // opportunistic cleanup
  return { ok: Number(row.count) <= max, retryAfter: Math.max(1, Math.ceil(Number(row.secs))) };
}
// NOTE: x-forwarded-for is only trustworthy behind your own proxy/host (e.g. Vercel, Caddy). Don't expose the app directly to the internet.
export const clientIp = () => (headers().get("x-forwarded-for")?.split(",")[0] ?? "unknown").trim();
export async function guard(key: string, max: number, windowSec: number) {
  const r = await rateLimit(key, max, windowSec);
  return r.ok ? null : `Too many attempts. Try again in ${Math.ceil(r.retryAfter / 60)} min.`;
}