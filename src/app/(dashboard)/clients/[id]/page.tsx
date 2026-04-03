import { notFound } from "next/navigation";
import { getClientById } from "@/lib/queries/client-queries";
import { ClientDetail } from "@/components/clients/client-detail";
import { serialize } from "@/lib/utils";
import { prisma } from "@/lib/prisma";

interface ClientPageProps {
  params: Promise<{ id: string }>;
}

export default async function ClientPage({ params }: ClientPageProps) {
  const { id } = await params;
  const [clientData, users] = await Promise.all([
    getClientById(id),
    prisma.user.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  const client = serialize(clientData);

  if (!client) {
    notFound();
  }

  return <ClientDetail client={client} users={serialize(users)} />;
}
