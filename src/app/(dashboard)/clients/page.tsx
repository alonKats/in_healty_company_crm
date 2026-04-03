import { getClients } from "@/lib/queries/client-queries";
import { prisma } from "@/lib/prisma";
import { ClientList } from "@/components/clients/client-list";
import { serialize } from "@/lib/utils";

export default async function ClientsPage() {
  const [clients, users] = await Promise.all([
    getClients(),
    prisma.user.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  return <ClientList clients={serialize(clients)} users={serialize(users)} />;
}
