import Link from "next/link";
export default function StatusTabs({ base, current, tabs }: { base: string; current?: string; tabs: { label: string; value?: string; count: number }[] }) {
  return (
    <div className="flex flex-wrap gap-2">{tabs.map((t) => {
      const on = (current ?? "") === (t.value ?? "");
      return <Link key={t.label} href={t.value ? `${base}?status=${t.value}` : base} className={`rounded-xl px-4 py-2 text-sm font-medium ${on ? "bg-brand-600 text-white shadow-lg shadow-brand-600/25" : "bg-white text-slate-600 hover:bg-brand-50"}`}>{t.label} ({t.count})</Link>;
    })}</div>
  );
}
