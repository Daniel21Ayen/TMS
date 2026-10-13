import Link from "next/link";
import { MailCheck, KeyRound } from "lucide-react";
import { redirect } from "next/navigation";
import AuthCard, { AuthField, Notice, submit } from "@/components/auth/AuthCard";
import { verifyEmail, resendCode } from "@/actions/auth/verify-otp.action";
export default function VerifyOtp({ searchParams }: { searchParams: { email?: string; error?: string; sent?: string } }) {
  const email = searchParams.email?.toLowerCase();
  if (!email) redirect("/register");
  return (
    <AuthCard title="Verify your email" subtitle={`We sent a 6-digit code to ${email}. It expires in 10 minutes.`} icon={MailCheck}>
      <Notice error={searchParams.error} ok={searchParams.sent ? "If the account exists, a new code is on its way." : undefined} />
      <form action={verifyEmail} className="space-y-4"><input type="hidden" name="email" value={email} />
        <AuthField label="Verification code" icon={KeyRound} name="code" required inputMode="numeric" pattern="\d{6}" maxLength={6} autoComplete="one-time-code" placeholder="123456" />
        <button className={submit}>Verify & Continue</button></form>
      <form action={resendCode.bind(null, email)} className="text-center text-sm text-slate-500">Didn&apos;t get it? <button className="font-medium text-brand-600">Resend code</button></form>
      <p className="text-center text-sm"><Link href="/login" className="text-slate-400 hover:text-brand-600">Back to sign in</Link></p>
    </AuthCard>
  );
}
