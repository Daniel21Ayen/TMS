import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const s = await getServerSession(authOptions);
  if (!s?.user) redirect("/login");
  const [unread, me] = await Promise.all([prisma.notification.count({ where: { userId: s.user.id, read: false } }), prisma.user.findUnique({ where: { id: s.user.id }, select: { name: true } })]);
  return (
    <div className="flex h-screen">
      <Sidebar role={s.user.role} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header name={me?.name ?? s.user.name ?? "User"} role={s.user.role} unread={unread} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
