import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import TrackingView from "@/components/customer/Tracking/TrackingView";
export default function Tracking({ params }: { params: { id: string } }) {
  return <div className="space-y-4"><Link href="/customer/deliveries" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-brand-600"><ArrowLeft className="h-4 w-4" />Back to orders</Link><TrackingView id={params.id} /></div>;
}
