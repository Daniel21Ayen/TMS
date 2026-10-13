import ProfileSettings from "@/components/shared/ProfileSettings";
export const dynamic = "force-dynamic";
export default function Page({ searchParams }: { searchParams: { ok?: string; error?: string } }) { return <ProfileSettings {...searchParams} />; }
