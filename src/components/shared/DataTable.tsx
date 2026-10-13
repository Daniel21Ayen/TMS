import type { ReactNode } from "react";
import { Inbox } from "lucide-react";
export type Column<T> = { header: string; cell: (row: T) => ReactNode; className?: string };
export default function DataTable<T extends { id: string }>({ columns, rows }: { columns: Column<T>[]; rows: T[] }) {
  if (!rows.length) return <div className="grid place-items-center gap-2 py-16 text-slate-400"><Inbox className="h-8 w-8" /><p className="text-sm">No results found</p></div>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead><tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">{columns.map((c) => <th key={c.header} className={`px-4 py-3 font-medium ${c.className ?? ""}`}>{c.header}</th>)}</tr></thead>
        <tbody>{rows.map((r) => <tr key={r.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60">{columns.map((c) => <td key={c.header} className={`px-4 py-3 ${c.className ?? ""}`}>{c.cell(r)}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}
