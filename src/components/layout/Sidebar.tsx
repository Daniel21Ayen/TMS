"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPin, Headphones, ChevronRight } from "lucide-react";
import clsx from "clsx";
import { NAV, ROLE_LABEL, type Role } from "@/data/constants/roles";

export default function Sidebar({ role }: { role: Role }) {
  const path = usePathname();
  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-gradient-to-b from-navy-800 to-navy-900 text-white">
      <div className="flex items-center gap-3 px-5 py-6">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/10"><MapPin className="h-5 w-5" /></div>
        <div><p className="text-xl font-bold leading-none">TMS</p><p className="text-[11px] text-white/60">{ROLE_LABEL[role]}</p></div>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3">
        {NAV[role].map(({ label, href, icon: Icon }) => {
          const active = path === href || path.startsWith(href + "/");
          return (
            <Link key={href} href={href}
              className={clsx("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
                active ? "bg-brand-600 font-medium shadow-lg shadow-brand-600/30" : "text-white/70 hover:bg-white/10 hover:text-white")}>
              <Icon className="h-[18px] w-[18px]" />{label}
            </Link>
          );
        })}
      </nav>
      <Link href="#" className="m-3 flex items-center gap-3 rounded-2xl bg-white/10 p-3 text-sm hover:bg-white/15">
        <Headphones className="h-5 w-5" /><span className="flex-1"><b className="block">Need help?</b><span className="text-xs text-white/60">Contact support</span></span><ChevronRight className="h-4 w-4" />
      </Link>
    </aside>
  );
}
