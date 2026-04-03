import { notFound } from "next/navigation";
import { getClientById } from "@/lib/queries/client-queries";
import { ClientDetail } from "@/components/clients/client-detail";

interface ClientPageProps {
  params: Promise<{ id: string }>;
}

export default async function ClientPage({ params }: ClientPageProps) {
  const { id } = await params;
  const client = await getClientById(id);

  if (!client) {
    notFound();
  }

  return <ClientDetail client={client} />;
}
