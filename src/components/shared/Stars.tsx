import { Star } from "lucide-react";
export default function Stars({ n, size = "h-4 w-4" }: { n: number; size?: string }) {
  return <span className="inline-flex">{[1, 2, 3, 4, 5].map((i) => <Star key={i} className={`${size} ${i <= Math.round(n) ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} />)}</span>;
}
