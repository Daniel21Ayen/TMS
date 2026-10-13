export function timeAgo(d: Date) {
  const m = Math.floor((Date.now() - d.getTime()) / 60000);
  if (m < 1) return "Just now"; if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
export const etb = (n: number) => `ETB ${n.toLocaleString()}`;
export const lastDays = (n: number) => Array.from({ length: n }, (_, i) => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - (n - 1 - i)); return d; });
export const productStatus = (p: { stock: number; expiresAt: Date | null }) => p.expiresAt && p.expiresAt < new Date() ? "EXPIRED" : p.stock <= 0 ? "OUT_OF_STOCK" : "ACTIVE";
export const settingsPath = (role: string) => role === "DRIVER" ? "/driver/settings" : role === "VENDOR" ? "/vendor/profile-settings" : "/profile/settings";
export const supportPath = (role: string) => role === "ADMIN" ? "/admin/support-center" : `/${role.toLowerCase()}/support-center`;
