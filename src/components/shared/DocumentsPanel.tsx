import { FileCheck2, Upload, Eye, ShieldCheck, Clock, AlertCircle, CheckCircle2, FileX2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { DOC_LABEL, REQUIRED } from "@/data/constants/documents";
import { uploadDocument } from "@/actions/documents/document.action";
import StatusBadge from "./StatusBadge";
export default async function DocumentsPanel({ userId, role, error, ok }: { userId: string; role: string; error?: string; ok?: string }) {
  const [docs, me] = await Promise.all([
    prisma.document.findMany({ where: { userId }, select: { id: true, kind: true, filename: true, size: true, status: true, note: true } }), // never select the file bytes in lists
    prisma.user.findUnique({ where: { id: userId }, select: { status: true } })]);
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div><h1 className="text-2xl font-bold">Verification Documents</h1><p className="text-sm text-slate-500">Upload clear photos or PDFs (JPG, PNG, PDF · max 3 MB). Our team reviews them before your account goes live.</p></div>
      {me?.status === "ACTIVE" ? <p className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700"><ShieldCheck className="h-4 w-4" />Your account is verified.</p>
        : <p className="flex items-center gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-700"><Clock className="h-4 w-4" />Awaiting verification. Upload every document below to be reviewed.</p>}
      {error && <p className="flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-sm text-rose-600"><AlertCircle className="h-4 w-4" />{error}</p>}
      {ok && <p className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-600"><CheckCircle2 className="h-4 w-4" />Document uploaded for review.</p>}
      {REQUIRED[role].map((k) => { const d = docs.find((x) => x.kind === k); return (
        <div key={k} className="card space-y-3 p-5">
          <div className="flex items-center justify-between"><p className="flex items-center gap-2 font-semibold"><FileCheck2 className="h-5 w-5 text-brand-600" />{DOC_LABEL[k]}</p>{d ? <StatusBadge value={d.status} /> : <span className="text-xs text-slate-400">Not uploaded</span>}</div>
          {d && <p className="flex items-center justify-between text-xs text-slate-500"><span>{d.filename} · {(d.size / 1024).toFixed(0)} KB</span><a href={`/api/documents/${d.id}`} target="_blank" className="flex items-center gap-1 font-medium text-brand-600"><Eye className="h-3.5 w-3.5" />View</a></p>}
          {d?.status === "REJECTED" && <p className="flex items-center gap-2 rounded-lg bg-rose-50 p-2 text-xs text-rose-600"><FileX2 className="h-4 w-4" />{d.note}</p>}
          {d?.status !== "APPROVED" && <form action={uploadDocument.bind(null, k)} className="flex flex-wrap gap-2">
            <input type="file" name="file" required accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf" className="flex-1 rounded-xl border border-slate-200 p-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-brand-600" />
            <button className="flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"><Upload className="h-4 w-4" />{d ? "Replace" : "Upload"}</button></form>}
        </div>); })}
    </div>
  );
}
