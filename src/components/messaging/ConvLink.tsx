"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
export default function ConvLink({ href, children }: { href: string; children: React.ReactNode }) {
  const on = usePathname() === href;
  return <Link href={href} className={`flex items-center gap-3 rounded-xl p-3 transition ${on ? "bg-brand-50" : "hover:bg-slate-50"}`}>{children}</Link>;
}
