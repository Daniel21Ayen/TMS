import UserDetail from "@/components/admin/Users/UserDetail";
export const dynamic = "force-dynamic";
export default function Page({ params, searchParams }: { params: { id: string }; searchParams: { error?: string } }) { return <UserDetail id={params.id} error={searchParams.error} />; }
