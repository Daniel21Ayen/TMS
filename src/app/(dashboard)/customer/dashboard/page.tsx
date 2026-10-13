import Link from "next/link";
import { Send, CalendarCheck, CheckCheck, Wallet, Plus } from "lucide-react";
import StatCard from "@/components/shared/StatCard";
export default function CustomerDashboard() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Welcome back! 👋</h1><p className="text-sm text-slate-500">Need a ride or delivery? We&apos;re here to move you forward.</p></div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Requests" value="5" icon={Send} /><StatCard label="Total Bookings" value="3" icon={CalendarCheck} tone="green" />
        <StatCard label="Completed Trips" value="8" icon={CheckCheck} tone="violet" /><StatCard label="Wallet Balance" value="ETB 2,460" icon={Wallet} tone="orange" />
      </div>
      <div className="card flex items-center justify-between bg-gradient-to-r from-brand-50 to-white p-8">
        <div><h2 className="text-xl font-bold">Need a Ride or a Delivery?</h2><p className="text-sm text-slate-500">Post your request or find available trips near you.</p></div>
        <Link href="/customer/shipments/create" className="flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-700"><Plus className="h-4 w-4" />Create New Request</Link>
      </div>
    </div>
  );
}
