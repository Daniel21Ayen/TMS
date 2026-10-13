const green = "bg-emerald-50 text-emerald-600", amber = "bg-amber-50 text-amber-600", red = "bg-rose-50 text-rose-600", blue = "bg-sky-50 text-sky-600", violet = "bg-violet-50 text-violet-600", orange = "bg-orange-50 text-orange-600", indigo = "bg-indigo-50 text-indigo-600";
const styles: Record<string, string> = { ACTIVE: green, APPROVED: green, REJECTED: red, EXPIRED: red, CANCELLED: red, OUT_OF_STOCK: amber, CONFIRMED: indigo, PROCESSING: blue, OPEN: blue, UPCOMING: indigo, ONGOING: blue, COMPLETED: green, IN_PROGRESS: amber, RESOLVED: green, HIGH: red, MEDIUM: amber, LOW: "bg-slate-100 text-slate-600", AVAILABLE: green, DELIVERED: green, PENDING: amber, MAINTENANCE: amber, RESERVED: amber, SUSPENDED: red, INACTIVE: red,
  IN_TRANSIT: blue, DRIVER: blue, ADMIN: violet, CUSTOMER: indigo, VENDOR: orange };
export default function StatusBadge({ value }: { value: string }) {
  const t = value.replace(/_/g, " ").toLowerCase();
  return <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ${styles[value] ?? "bg-slate-100 text-slate-600"}`}>{t.charAt(0).toUpperCase() + t.slice(1)}</span>;
}
