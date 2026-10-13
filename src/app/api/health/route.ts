import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";
// Used by Docker/monitoring. Reveals nothing beyond up/down.
export async function GET() {
  try { await prisma.$queryRaw`SELECT 1`; return NextResponse.json({ status: "ok" }); }
  catch { return NextResponse.json({ status: "down" }, { status: 503 }); }
}
