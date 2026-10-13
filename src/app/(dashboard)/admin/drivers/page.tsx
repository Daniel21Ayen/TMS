import UserList from "@/components/admin/Users/UserList";
export const dynamic = "force-dynamic";
export default function Page({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  return <UserList title="Drivers" subtitle="Manage and monitor all drivers in the system." basePath="/admin/drivers" role="DRIVER" sp={searchParams} />;
}
