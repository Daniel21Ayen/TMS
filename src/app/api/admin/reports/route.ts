import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const esc = (v: unknown) => { const s = String(v ?? ""); return /^[=+\-@]/.test(s) ? `"'${s.replace(/"/g, '""')}"` : /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; }; // also blocks spreadsheet formula injection

export async function GET(req: Request) {
  const s = await getServerSession(authOptions);
  if (s?.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const d = Number(new URL(req.url).searchParams.get("days"));
  const days = [7, 30, 90].includes(d) ? d : 30;
  const since = new Date(); since.setDate(since.getDate() - (days - 1)); since.setHours(0, 0, 0, 0);
  const loads = await prisma.load.findMany({ where: { createdAt: { gte: since } }, include: { postedBy: true, driver: true }, orderBy: { createdAt: "desc" } });
  const rows = [["Date", "Item", "Origin", "Destination", "Weight (kg)", "Price (ETB)", "Status", "Customer", "Driver"],
    ...loads.map((l) => [l.createdAt.toISOString().slice(0, 10), l.item, l.origin, l.destination, l.weightKg, l.price, l.status, l.postedBy.name, l.driver?.name ?? ""])];
  return new NextResponse(rows.map((r) => r.map(esc).join(",")).join("\n"), { headers: { "Content-Type": "text/csv", "Content-Disposition": `attachment; filename="tms-shipments-${days}d.csv"` } });
}
