import UserList from "@/components/admin/Users/UserList";
export const dynamic = "force-dynamic";
export default function Page({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  return <UserList title="User Management" subtitle="Manage all system users, roles and permissions." basePath="/admin/users"  sp={searchParams} />;
}
