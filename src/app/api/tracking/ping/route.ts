import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const s = await getServerSession(authOptions);
  if (s?.user?.role !== "DRIVER") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!req.headers.get("content-type")?.includes("application/json")) return NextResponse.json({ error: "Bad request" }, { status: 415 }); // blocks cross-site form posts
  if (!(await rateLimit(`ping:${s.user.id}`, 10, 60)).ok) return NextResponse.json({ error: "Too many updates" }, { status: 429 });
  const { lat, lng } = await req.json().catch(() => ({}));
  if (typeof lat !== "number" || typeof lng !== "number" || Math.abs(lat) > 90 || Math.abs(lng) > 180) return NextResponse.json({ error: "Invalid position" }, { status: 400 });
  const [loads, trips] = await Promise.all([prisma.load.count({ where: { driverId: s.user.id, status: "IN_TRANSIT" } }), prisma.trip.count({ where: { driverId: s.user.id, status: "ONGOING" } })]);
  if (!loads && !trips) return NextResponse.json({ error: "No active trip" }, { status: 409 }); // never record location outside a job
  await prisma.driverLocation.upsert({ where: { userId: s.user.id }, update: { lat, lng }, create: { userId: s.user.id, lat, lng } });
  return NextResponse.json({ ok: true });
}
