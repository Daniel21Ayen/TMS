import { Trash2 } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import DataTable, { type Column } from "@/components/shared/DataTable";
import Stars from "@/components/shared/Stars";
import { deleteReview } from "@/actions/reviews/delete-review.action";
export const dynamic = "force-dynamic";
type Row = Prisma.ReviewGetPayload<{ include: { author: true; target: true } }>;
export default async function AdminReviews() {
  const rows = await prisma.review.findMany({ include: { author: true, target: true }, orderBy: { createdAt: "desc" }, take: 50 });
  const cols: Column<Row>[] = [
    { header: "From", cell: (r) => r.author.name }, { header: "About", cell: (r) => <div><p>{r.target.name}</p><p className="text-xs capitalize text-slate-400">{r.target.role.toLowerCase()}</p></div> },
    { header: "Rating", cell: (r) => <Stars n={r.rating} /> }, { header: "Comment", cell: (r) => <span className="line-clamp-2 max-w-xs text-slate-500">{r.comment ?? "—"}</span> },
    { header: "Date", cell: (r) => r.createdAt.toLocaleDateString("en-GB") },
    { header: "Actions", className: "text-right", cell: (r) => <form action={deleteReview.bind(null, r.id)}><button title="Remove review" className="rounded-lg p-2 text-rose-500 hover:bg-rose-50"><Trash2 className="h-4 w-4" /></button></form> }];
  return (
    <div className="space-y-5"><div><h1 className="text-2xl font-bold">Reviews & Ratings</h1><p className="text-sm text-slate-500">View and moderate customer and driver reviews.</p></div>
      <div className="card"><DataTable columns={cols} rows={rows} /></div></div>
  );
}
