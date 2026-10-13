import UserList from "@/components/admin/Users/UserList";
export const dynamic = "force-dynamic";
export default function Page({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  return <UserList title="Vendors & Suppliers" subtitle="Manage vendors, suppliers and their products/services." basePath="/admin/vendors" role="VENDOR" sp={searchParams} />;
}
