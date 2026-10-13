import type { LucideIcon } from "lucide-react";
const tones = { indigo: "bg-indigo-50 text-indigo-600", green: "bg-emerald-50 text-emerald-600", violet: "bg-violet-50 text-violet-600", orange: "bg-orange-50 text-orange-500" };
export default function StatCard({ label, value, delta, icon: Icon, tone = "indigo" }: { label: string; value: string; delta?: string; icon: LucideIcon; tone?: keyof typeof tones }) {
  return (
    <div className="card flex items-center gap-4 p-5">
      <div className={`grid h-12 w-12 place-items-center rounded-xl ${tones[tone]}`}><Icon className="h-6 w-6" /></div>
      <div><p className="text-xs text-slate-500">{label}</p><p className="text-2xl font-bold">{value}</p>{delta && <p className="text-[11px] font-medium text-emerald-600">{delta}</p>}</div>
    </div>
  );
}
