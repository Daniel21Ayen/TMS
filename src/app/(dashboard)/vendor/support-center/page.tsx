import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import SupportCenter from "@/components/shared/SupportCenter";
export const dynamic = "force-dynamic";
export default async function Page({ searchParams }: { searchParams: { error?: string } }) { const s = await getServerSession(authOptions); return <SupportCenter userId={s!.user.id} error={searchParams.error} />; }
