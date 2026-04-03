import { getActiveServices } from "@/lib/queries/service-queries";
import { getClients } from "@/lib/queries/client-queries";
import { getQuoteById } from "@/lib/queries/quote-queries";
import { OrderForm } from "@/components/orders/order-form";
import { createOrder } from "@/lib/actions/order-actions";

interface NewOrderPageProps {
  searchParams: Promise<{ quoteId?: string; clientId?: string }>;
}

export default async function NewOrderPage({ searchParams }: NewOrderPageProps) {
  const { quoteId, clientId } = await searchParams;

  const [clients, services] = await Promise.all([
    getClients(),
    getActiveServices(),
  ]);

  const clientsForForm = clients.map((c) => ({
    id: c.id,
    name: c.name,
    company: c.company ?? null,
  }));

  let defaultClientId = clientId;
  let defaultItems: Array<{
    serviceId?: string;
    description: string;
    quantity: number;
    unitPrice: number;
    costPerUnit?: number | null;
    notes?: string;
  }> | undefined;

  if (quoteId) {
    const quote = await getQuoteById(quoteId);
    if (quote) {
      defaultClientId = quote.clientId;
      defaultItems = quote.items.map((item) => ({
        serviceId: item.serviceId ?? undefined,
        description: item.description,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        costPerUnit: item.costPerUnit ? Number(item.costPerUnit) : null,
        notes: item.notes ?? undefined,
      }));
    }
  }

  return (
    <OrderForm
      clients={clientsForForm}
      services={services}
      defaultClientId={defaultClientId}
      defaultItems={defaultItems}
      defaultQuoteId={quoteId}
      action={createOrder}
    />
  );
}
