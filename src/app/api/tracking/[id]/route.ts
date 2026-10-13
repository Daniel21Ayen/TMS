import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { resolveTracking } from "@/lib/tracking";
import { getRoute } from "@/services/location/routing.service";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const s = await getServerSession(authOptions);
  if (!s?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const info = await resolveTracking(params.id, s.user);
  if (!info) return NextResponse.json({ error: "Not found" }, { status: 404 });
  let driver = null;
  if (info.live && info.driverId) { // only while in transit, and only if the position is fresh (< 5 min)
    const l = await prisma.driverLocation.findUnique({ where: { userId: info.driverId } });
    if (l && Date.now() - l.updatedAt.getTime() < 5 * 60_000) driver = { lat: l.lat, lng: l.lng, updatedAt: l.updatedAt };
  }
  return NextResponse.json({ ...info, driverId: undefined, route: await getRoute(info.from, info.to), driver }, { headers: { "Cache-Control": "no-store" } });
}
