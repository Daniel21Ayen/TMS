import UserList from "@/components/admin/Users/UserList";
export const dynamic = "force-dynamic";
export default function Page({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  return <UserList title="Customers" subtitle="Manage customer accounts and their information." basePath="/admin/customers" role="CUSTOMER" sp={searchParams} />;
}
