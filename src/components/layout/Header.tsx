"use client";
import { Bell, MessageSquare, Search, LogOut } from "lucide-react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { ROLE_LABEL, type Role } from "@/data/constants/roles";

export default function Header({ name, role, unread = 0 }: { name: string; role: Role; unread?: number }) {
  return (
    <header className="flex h-16 items-center gap-4 border-b border-slate-100 bg-white px-6">
      <div className="relative max-w-md flex-1">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <input placeholder="Search anything..." className="w-full rounded-xl bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/30" />
      </div>
      <Link href="/notifications" className="relative rounded-xl p-2 hover:bg-slate-50"><Bell className="h-5 w-5 text-slate-500" />{unread > 0 && <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">{unread > 9 ? "9+" : unread}</span>}</Link>
      <button className="rounded-xl p-2 hover:bg-slate-50"><MessageSquare className="h-5 w-5 text-slate-500" /></button>
      <div className="flex items-center gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-full bg-brand-100 text-sm font-semibold text-brand-600">{name[0]}</div>
        <div className="hidden text-xs sm:block"><p className="font-semibold">{name}</p><p className="text-slate-400">{ROLE_LABEL[role]}</p></div>
        <button onClick={() => signOut({ callbackUrl: "/login" })} title="Sign out" className="rounded-xl p-2 text-slate-400 hover:bg-slate-50 hover:text-rose-500"><LogOut className="h-4 w-4" /></button>
      </div>
    </header>
  );
}
