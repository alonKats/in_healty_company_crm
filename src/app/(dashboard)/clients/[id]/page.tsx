import { notFound } from "next/navigation";
import { getClientById } from "@/lib/queries/client-queries";
import { getClientFinancials } from "@/lib/queries/green-invoice-queries";
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

  // Fetch GI financials if client is linked
  const financials = client.greenInvoiceId
    ? await getClientFinancials(client.greenInvoiceId)
    : null;

  return <ClientDetail client={client} users={serialize(users)} financials={financials} />;
}
