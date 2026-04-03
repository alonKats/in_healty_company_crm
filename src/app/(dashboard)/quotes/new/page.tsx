import { getActiveServices } from "@/lib/queries/service-queries";
import { getClients } from "@/lib/queries/client-queries";
import { prisma } from "@/lib/prisma";
import { QuoteForm } from "@/components/quotes/quote-form";
import { createQuote } from "@/lib/actions/quote-actions";
import { serialize } from "@/lib/utils";

interface NewQuotePageProps {
  searchParams: Promise<{ clientId?: string }>;
}

export default async function NewQuotePage({ searchParams }: NewQuotePageProps) {
  const { clientId } = await searchParams;

  const [clients, services, users] = await Promise.all([
    getClients().then(serialize),
    getActiveServices().then(serialize),
    prisma.user.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }).then(serialize),
  ]);

  const clientsForForm = clients.map((c) => ({
    id: c.id,
    name: c.name,
    company: c.company ?? null,
  }));

  return (
    <QuoteForm
      clients={clientsForForm}
      users={users}
      services={services}
      defaultClientId={clientId}
      action={createQuote}
    />
  );
}
