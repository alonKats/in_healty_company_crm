import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { DashboardClient } from "@/components/layout/dashboard-client";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <DashboardClient userName={session.user.name} role={session.user.role}>
      <Sidebar role={session.user.role} />
      <main className="mr-56 mt-14 p-6">{children}</main>
    </DashboardClient>
  );
}
