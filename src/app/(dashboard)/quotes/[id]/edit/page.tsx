import { notFound } from "next/navigation";
import { getQuoteById } from "@/lib/queries/quote-queries";
import { getActiveServices } from "@/lib/queries/service-queries";
import { getClients } from "@/lib/queries/client-queries";
import { prisma } from "@/lib/prisma";
import { QuoteForm } from "@/components/quotes/quote-form";
import { updateQuote } from "@/lib/actions/quote-actions";
import { serialize } from "@/lib/utils";

interface EditQuotePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditQuotePage({ params }: EditQuotePageProps) {
  const { id } = await params;

  const [quote, clients, services, users] = await Promise.all([
    getQuoteById(id),
    getClients().then(serialize),
    getActiveServices().then(serialize),
    prisma.user
      .findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } })
      .then(serialize),
  ]);

  if (!quote) {
    notFound();
  }

  // Only DRAFT and SENT quotes can be edited
  if (quote.status !== "DRAFT" && quote.status !== "SENT") {
    notFound();
  }

  const serializedQuote = serialize(quote);

  const clientsForForm = clients.map((c) => ({
    id: c.id,
    name: c.name,
    company: c.company ?? null,
  }));

  // serialize converts Date->string and Decimal->number
  const sq = serializedQuote as Record<string, unknown>;

  const initialData = {
    id: serializedQuote.id,
    clientId: serializedQuote.clientId,
    assignedToId: serializedQuote.assignedToId,
    source: serializedQuote.source as string,
    eventDate: (serializedQuote.eventDate as unknown as string) ?? null,
    validUntil: (serializedQuote.validUntil as unknown as string) ?? null,
    notes: serializedQuote.notes,
    terms: serializedQuote.terms,
    paymentTerms: (sq.paymentTerms as string) ?? null,
    items: serializedQuote.items.map((item) => ({
      serviceId: item.serviceId,
      category: item.category,
      description: item.description,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      costPerUnit: item.costPerUnit ? Number(item.costPerUnit) : null,
      notes: item.notes,
      sortOrder: item.sortOrder,
    })),
  };

  async function handleUpdate(formData: FormData) {
    "use server";
    await updateQuote(id, formData);
  }

  return (
    <QuoteForm
      clients={clientsForForm}
      users={users}
      services={services}
      action={handleUpdate}
      initialData={initialData}
    />
  );
}
