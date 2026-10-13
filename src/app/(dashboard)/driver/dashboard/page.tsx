import { Route, PackageCheck, Package, Wallet } from "lucide-react";
import StatCard from "@/components/shared/StatCard";
export default function DriverDashboard() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Good Morning, Abebe! 👋</h1><p className="text-sm text-slate-500">Here&apos;s what&apos;s happening with your transportation today.</p></div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Today's Trips" value="4" icon={Route} tone="green" /><StatCard label="Active Deliveries" value="2" icon={PackageCheck} tone="violet" />
        <StatCard label="Available Loads" value="7" icon={Package} tone="orange" /><StatCard label="Today's Earnings" value="ETB 2,450" icon={Wallet} />
      </div>
      <div className="card bg-gradient-to-r from-navy-800 to-brand-600 p-8 text-white"><h2 className="text-xl font-bold">Drive More, Earn More!</h2><p className="text-sm text-white/70">New loads and trips are available near your location.</p></div>
    </div>
  );
}
