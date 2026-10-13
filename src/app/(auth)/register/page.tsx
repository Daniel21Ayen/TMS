import Link from "next/link";
import { UserPlus, User, Mail, Phone, Lock, ShieldCheck, UserRound, Car, Store } from "lucide-react";
import AuthCard, { AuthField, Notice, submit } from "@/components/auth/AuthCard";
import { register } from "@/actions/auth/register.action";
const roles = [{ v: "CUSTOMER", l: "Customer", d: "Ship items & book rides", i: UserRound }, { v: "DRIVER", l: "Driver", d: "Earn with your vehicle", i: Car }, { v: "VENDOR", l: "Vendor", d: "Sell goods & services", i: Store }];
export default function Register({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <AuthCard title="Create your account" subtitle="Join TMS and start moving people and goods." icon={UserPlus}>
      <form action={register} className="space-y-4">
        <Notice error={searchParams.error} />
        <div className="grid grid-cols-3 gap-2">{roles.map(({ v, l, d, i: I }, n) => (
          <label key={v} className="cursor-pointer"><input type="radio" name="role" value={v} defaultChecked={n === 0} className="peer sr-only" />
            <div className="rounded-xl border border-slate-200 p-3 text-center transition peer-checked:border-brand-500 peer-checked:bg-brand-50 peer-checked:text-brand-700"><I className="mx-auto h-5 w-5" /><p className="mt-1 text-sm font-semibold">{l}</p><p className="text-[10px] text-slate-400">{d}</p></div></label>))}</div>
        <AuthField label="Full name" icon={User} name="name" required placeholder="Meron Tesfaye" />
        <AuthField label="Email" icon={Mail} name="email" type="email" required placeholder="you@example.com" />
        <AuthField label="Phone (optional)" icon={Phone} name="phone" placeholder="+251 91 234 5678" />
        <AuthField label="Password" icon={Lock} name="password" type="password" required placeholder="8+ characters, letters and numbers" />
        <AuthField label="Confirm password" icon={ShieldCheck} name="confirm" type="password" required placeholder="Repeat your password" />
        <button className={submit}>Create Account</button>
        <p className="text-center text-sm text-slate-500">Already have an account? <Link href="/login" className="font-medium text-brand-600">Sign in</Link></p>
      </form>
    </AuthCard>
  );
}
