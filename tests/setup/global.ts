import { execSync } from "child_process";
import { loadEnv } from "vite";
export default function setup() {
  if (process.env.UNIT_ONLY === "1") return; // pure unit tests need no database
  const env = loadEnv("test", process.cwd(), "");
  if (!/\/[^/?]*test[^/?]*(\?.*)?$/i.test(env.DATABASE_URL ?? "")) throw new Error("Refusing to run: DATABASE_URL (in .env.test) must point to a database whose name contains 'test'. This suite wipes it.");
  execSync("npx prisma db push --force-reset --skip-generate", { stdio: "inherit", env: { ...process.env, ...env } });
}
