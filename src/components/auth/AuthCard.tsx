import type { LucideIcon } from "lucide-react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
export default function AuthCard({ title, subtitle, icon: Icon, children }: { title: string; subtitle: string; icon: LucideIcon; children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-br from-brand-50 via-white to-brand-100 p-6">
      <div className="card w-full max-w-md space-y-5 p-8">
        <div className="flex flex-col items-center gap-3 text-center"><span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-600 text-white shadow-lg shadow-brand-600/30"><Icon className="h-7 w-7" /></span>
          <div><h1 className="text-2xl font-bold text-navy-900">{title}</h1><p className="text-sm text-slate-500">{subtitle}</p></div></div>
        {children}
      </div>
    </div>
  );
}
export const Notice = ({ error, ok }: { error?: string; ok?: string }) => error
  ? <p className="flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-sm text-rose-600"><AlertCircle className="h-4 w-4 shrink-0" />{error}</p>
  : ok ? <p className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-600"><CheckCircle2 className="h-4 w-4 shrink-0" />{ok}</p> : null;
export function AuthField({ label, icon: I, ...p }: { label: string; icon: LucideIcon } & React.InputHTMLAttributes<HTMLInputElement>) {
  return <label className="block text-sm font-semibold">{label}<div className="relative mt-1.5"><I className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
    <input className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm font-normal outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" {...p} /></div></label>;
}
export const submit = "w-full rounded-xl bg-brand-600 py-3 font-semibold text-white hover:bg-brand-700";
