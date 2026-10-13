import { z } from "zod";
// Fail fast at startup with a clear message instead of failing later in the middle of a request.
export function validateEnv() {
  const prod = process.env.NODE_ENV === "production";
  const r = z.object({ DATABASE_URL: z.string().min(1), NEXTAUTH_URL: z.string().url(), NEXTAUTH_SECRET: z.string().min(prod ? 32 : 8) }).safeParse(process.env);
  const problems = r.success ? [] : r.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
  if (prod) {
    if (!process.env.NEXTAUTH_URL?.startsWith("https://")) problems.push("NEXTAUTH_URL must be https:// in production");
    if (!process.env.BREVO_API_KEY && process.env.ALLOW_CONSOLE_EMAIL !== "true") problems.push("BREVO_API_KEY is required in production, otherwise verification codes are only printed to the log and nobody can register (set ALLOW_CONSOLE_EMAIL=true to override)");
  }
  if (problems.length) throw new Error("Invalid environment:\n - " + problems.join("\n - "));
}
