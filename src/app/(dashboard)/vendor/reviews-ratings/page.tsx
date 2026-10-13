import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import RatingsView from "@/components/shared/RatingsView";
export const dynamic = "force-dynamic";
export default async function Page() { const s = await getServerSession(authOptions); return <RatingsView targetId={s!.user.id} title="Reviews & Ratings" />; }
