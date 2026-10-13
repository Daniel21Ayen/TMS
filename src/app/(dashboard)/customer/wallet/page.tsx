import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import WalletView from "@/components/shared/WalletView";
import RequestPanel from "@/components/shared/RequestPanel";
import { requestTopUp } from "@/actions/wallet/add-money.action";
export const dynamic = "force-dynamic";
export default async function Page({ searchParams }: { searchParams: { error?: string; ok?: string } }) {
  const s = await getServerSession(authOptions);
  return <WalletView userId={s!.user.id} title="Payments & Wallet" subtitle="Manage your payments and wallet balance."><RequestPanel kind="TOPUP" action={requestTopUp} userId={s!.user.id} {...searchParams} /></WalletView>;
}
