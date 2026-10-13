import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import WalletView from "@/components/shared/WalletView";
import RequestPanel from "@/components/shared/RequestPanel";
import { requestWithdrawal } from "@/actions/wallet/withdraw.action";
export const dynamic = "force-dynamic";
export default async function Page({ searchParams }: { searchParams: { error?: string; ok?: string } }) {
  const s = await getServerSession(authOptions);
  return <WalletView userId={s!.user.id} title="Earnings & Wallet" subtitle="Track your earnings and manage your wallet."><RequestPanel kind="WITHDRAWAL" action={requestWithdrawal} userId={s!.user.id} {...searchParams} /></WalletView>;
}
