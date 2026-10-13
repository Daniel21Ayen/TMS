import { User, Mail, Phone, Lock, KeyRound, ShieldCheck, AlertCircle, CheckCircle2, BadgeCheck } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateProfile, changePassword } from "@/actions/profile/profile.action";
const input = "w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 disabled:bg-slate-50 disabled:text-slate-400";
const F = ({ label, icon: I, ...p }: { label: string; icon: typeof User } & React.InputHTMLAttributes<HTMLInputElement>) => <label className="block text-sm font-semibold">{label}<div className="relative mt-1.5"><I className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><input className={input} {...p} /></div></label>;
export default async function ProfileSettings({ ok, error }: { ok?: string; error?: string }) {
  const s = await getServerSession(authOptions);
  const u = await prisma.user.findUniqueOrThrow({ where: { id: s!.user.id } });
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div><h1 className="text-2xl font-bold">Profile Settings</h1><p className="text-sm text-slate-500">Manage your personal information and account security.</p></div>
      {error && <p className="flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-sm text-rose-600"><AlertCircle className="h-4 w-4" />{error}</p>}
      {ok && <p className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-600"><CheckCircle2 className="h-4 w-4" />{ok === "password" ? "Password updated." : "Profile saved."}</p>}
      <form action={updateProfile} className="card space-y-5 p-6">
        <div className="flex items-center gap-4"><span className="grid h-16 w-16 place-items-center rounded-full bg-brand-100 text-2xl font-bold text-brand-600">{u.name[0]}</span>
          <div><p className="font-semibold">{u.name}</p><p className="flex items-center gap-1.5 text-xs capitalize text-slate-400">{u.role.toLowerCase()}{u.verified && <span className="inline-flex items-center gap-1 text-emerald-600"><BadgeCheck className="h-3.5 w-3.5" />Verified</span>}</p></div></div>
        <div className="grid gap-4 sm:grid-cols-2"><F label="Full name" icon={User} name="name" defaultValue={u.name} required /><F label="Phone" icon={Phone} name="phone" defaultValue={u.phone ?? ""} /></div>
        <F label="Email (cannot be changed)" icon={Mail} value={u.email} disabled readOnly />
        <button className="rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">Save Changes</button>
      </form>
      <form action={changePassword} className="card space-y-5 p-6">
        <h2 className="flex items-center gap-2 font-semibold"><ShieldCheck className="h-5 w-5 text-brand-600" />Change Password</h2>
        <F label="Current password" icon={Lock} name="current" type="password" required />
        <div className="grid gap-4 sm:grid-cols-2"><F label="New password" icon={KeyRound} name="password" type="password" required placeholder="8+ chars, letters & numbers" /><F label="Confirm new password" icon={KeyRound} name="confirm" type="password" required /></div>
        <button className="rounded-xl bg-navy-800 px-6 py-2.5 text-sm font-semibold text-white hover:bg-navy-900">Update Password</button>
      </form>
    </div>
  );
}
