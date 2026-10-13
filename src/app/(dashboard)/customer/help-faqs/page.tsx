import Link from "next/link";
import { ChevronDown, Headphones, HelpCircle } from "lucide-react";
const faqs = [
  ["How do I post a shipment?", "Go to My Shipments → New Shipment, enter the item, route, weight and your offer. Drivers nearby can then accept it."],
  ["How do I add money to my wallet?", "Open Payments & Wallet, choose Add Money, pay via Telebirr, CBE Birr or bank transfer, and submit the receipt number. An admin verifies it and credits your wallet."],
  ["How do I track my delivery?", "Track Orders shows each shipment's progress: Posted, Accepted, In Transit and Delivered."],
  ["Can I cancel a shipment?", "Yes, while no driver has accepted it. Use the bin icon on My Shipments. Marketplace orders can be cancelled by the vendor before processing and are refunded automatically."],
  ["How are payments handled?", "Money is taken from your wallet when you order from the marketplace, and when a shipment is delivered. You'll see every charge in your transaction list."],
  ["How do I rate a driver or vendor?", "After delivery, open Reviews & Ratings and give 1–5 stars with an optional comment."]];
export default function Help() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div><h1 className="text-2xl font-bold">Help & FAQs</h1><p className="text-sm text-slate-500">Find answers to common questions about the platform.</p></div>
      <div className="space-y-3">{faqs.map(([q, a]) => (
        <details key={q} className="card group p-5"><summary className="flex cursor-pointer list-none items-center gap-3 font-medium"><HelpCircle className="h-5 w-5 text-brand-600" /><span className="flex-1">{q}</span><ChevronDown className="h-4 w-4 text-slate-400 transition group-open:rotate-180" /></summary><p className="mt-3 pl-8 text-sm text-slate-500">{a}</p></details>))}</div>
      <div className="card flex items-center gap-4 bg-brand-50 p-5"><Headphones className="h-8 w-8 text-brand-600" /><div className="flex-1"><p className="font-semibold">Still need help?</p><p className="text-sm text-slate-500">Our support team will get back to you.</p></div>
        <Link href="/customer/support-center" className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">Contact Support</Link></div>
    </div>
  );
}
