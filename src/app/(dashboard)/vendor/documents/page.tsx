import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import DocumentsPanel from "@/components/shared/DocumentsPanel";
export const dynamic = "force-dynamic";
export default async function Page({ searchParams }: { searchParams: { error?: string; ok?: string } }) { const s = await getServerSession(authOptions); return <DocumentsPanel userId={s!.user.id} role={s!.user.role} {...searchParams} />; }
