import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ROLE_HOME } from "@/data/constants/roles";
export default async function Home() {
  const s = await getServerSession(authOptions);
  redirect(s?.user ? ROLE_HOME[s.user.role] : "/login");
}
