import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";

// Documents are private: only the owner or an admin can open them.
export async function GET(_: Request, { params }: { params: { id: string } }) {
  const s = await getServerSession(authOptions);
  if (!s?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const d = await prisma.document.findUnique({ where: { id: params.id } });
  if (!d || (d.userId !== s.user.id && s.user.role !== "ADMIN")) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (s.user.role === "ADMIN" && d.userId !== s.user.id) await audit(s.user.id, "document.view", d.id, d.kind);
  return new NextResponse(new Uint8Array(d.data), { headers: {
    "Content-Type": d.mime, "Content-Disposition": `inline; filename="${d.filename}"`, "Cache-Control": "private, no-store",
    "X-Content-Type-Options": "nosniff", "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox" } });
}
