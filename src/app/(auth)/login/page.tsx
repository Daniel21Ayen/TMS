"use client";
import { Suspense, useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, LogIn, ShieldCheck, BarChart3, Settings, Headphones, MapPin, Loader2 } from "lucide-react";

const perks = [
  { i: ShieldCheck, t: "Secure Access", d: "Your data is protected with advanced security." },
  { i: BarChart3, t: "Real-time Insights", d: "Access real-time analytics and reports." },
  { i: Settings, t: "Full Control", d: "Manage users, trips, fleets, payments and more." },
  { i: Headphones, t: "24/7 Support", d: "We're here to help you anytime." },
];

function LoginForm() {
  const router = useRouter(); const sp = useSearchParams();
  const [show, setShow] = useState(false), [loading, setLoading] = useState(false), [error, setError] = useState("");
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setLoading(true); setError("");
    const f = new FormData(e.currentTarget);
    const res = await signIn("credentials", { email: f.get("email"), password: f.get("password"), redirect: false });
    setLoading(false);
    if (res?.error) { if (res.error === "EMAIL_NOT_VERIFIED") return router.push(`/verify-otp?email=${encodeURIComponent(String(f.get("email")))}`); return setError(res.error === "RATE_LIMITED" ? "Too many attempts. Please wait a few minutes and try again." : "Invalid email or password"); }
    router.push("/"); router.refresh();
  }
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <section className="hidden flex-col justify-between bg-gradient-to-br from-brand-50 via-white to-brand-100 p-12 lg:flex">
        <div className="flex items-center gap-3"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-600 text-white"><MapPin /></div><div><p className="text-2xl font-bold text-navy-800">TMS</p><p className="text-xs text-brand-600">Transport Management System</p></div></div>
        <div><h1 className="text-5xl font-bold text-navy-900">Welcome Back,<br /><span className="text-brand-600">to TMS!</span></h1><p className="mt-4 max-w-md text-slate-600">Sign in to your account and manage the transport network efficiently.</p></div>
        <div className="grid grid-cols-4 gap-4">{perks.map(({ i: I, t, d }) => (
          <div key={t} className="text-center"><div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-white text-brand-600 shadow-card"><I className="h-5 w-5" /></div><p className="mt-2 text-sm font-semibold">{t}</p><p className="text-[11px] text-slate-500">{d}</p></div>))}</div>
      </section>
      <section className="grid place-items-center p-6">
        <form onSubmit={onSubmit} className="card w-full max-w-md space-y-5 p-8">
          <div><h2 className="text-3xl font-bold text-navy-900">Sign In</h2><p className="text-sm text-slate-500">Enter your credentials to access your account</p></div>
          <label className="block text-sm font-semibold">Email Address
            <div className="relative mt-1.5"><Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><input name="email" type="email" required placeholder="Enter your email address" className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm font-normal outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" /></div></label>
          <label className="block text-sm font-semibold">Password
            <div className="relative mt-1.5"><Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><input name="password" type={show ? "text" : "password"} required placeholder="Enter your password" className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-10 text-sm font-normal outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" />
              <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-3 text-slate-400">{show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></label>
          <div className="flex items-center justify-between text-sm"><label className="flex items-center gap-2"><input type="checkbox" defaultChecked className="accent-brand-600" />Remember me</label><a href="/forgot-password" className="font-medium text-brand-600">Forgot Password?</a></div>
          {sp.get("verified") && <p className="rounded-lg bg-emerald-50 p-2 text-sm text-emerald-600">Email verified. You can sign in now.</p>}
          {sp.get("reset") && <p className="rounded-lg bg-emerald-50 p-2 text-sm text-emerald-600">Password updated. Sign in with your new password.</p>}
          {error && <p className="rounded-lg bg-rose-50 p-2 text-sm text-rose-600">{error}</p>}
          <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-3 font-semibold text-white hover:bg-brand-700 disabled:opacity-60">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}Sign In</button>
          <p className="text-center text-sm text-slate-500">New to TMS? <Link href="/register" className="font-medium text-brand-600">Create an account</Link></p>
          {process.env.NEXT_PUBLIC_SHOW_DEMO === "true" && <p className="rounded-lg bg-slate-50 p-3 text-xs text-slate-500">Demo: admin@ / customer@ / driver@ / vendor@<b>tms.et</b> · Password123!</p>}
        </form>
      </section>
    </div>
  );
}

export default function LoginPage() { return <Suspense><LoginForm /></Suspense>; }
