import Link from "next/link";
import { KeyRound, Mail, Lock, ShieldCheck, Hash } from "lucide-react";
import AuthCard, { AuthField, Notice, submit } from "@/components/auth/AuthCard";
import { requestReset, resetPassword } from "@/actions/auth/password-reset.action";
export default function Forgot({ searchParams }: { searchParams: { step?: string; email?: string; error?: string } }) {
  const reset = searchParams.step === "reset";
  return (
    <AuthCard title={reset ? "Set a new password" : "Forgot password?"} subtitle={reset ? "If an account exists for that email, we sent a 6-digit code." : "Enter your email and we'll send you a reset code."} icon={KeyRound}>
      <Notice error={searchParams.error} />
      {reset ? (
        <form action={resetPassword} className="space-y-4"><input type="hidden" name="email" value={searchParams.email ?? ""} />
          <AuthField label="Reset code" icon={Hash} name="code" required inputMode="numeric" pattern="\d{6}" maxLength={6} placeholder="123456" />
          <AuthField label="New password" icon={Lock} name="password" type="password" required placeholder="8+ characters, letters and numbers" />
          <AuthField label="Confirm password" icon={ShieldCheck} name="confirm" type="password" required />
          <button className={submit}>Update Password</button></form>
      ) : (
        <form action={requestReset} className="space-y-4"><AuthField label="Email" icon={Mail} name="email" type="email" required placeholder="you@example.com" /><button className={submit}>Send Reset Code</button></form>
      )}
      <p className="text-center text-sm"><Link href="/login" className="text-slate-400 hover:text-brand-600">Back to sign in</Link></p>
    </AuthCard>
  );
}
