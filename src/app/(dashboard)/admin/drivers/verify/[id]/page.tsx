import { redirect } from "next/navigation";
export default function Verify({ params }: { params: { id: string } }) { redirect(`/admin/drivers/${params.id}`); }
