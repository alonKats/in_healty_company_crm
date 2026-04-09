import { notFound } from "next/navigation";
import { getProviderById } from "@/lib/queries/provider-queries";
import { ProviderDetail } from "@/components/providers/provider-detail";
import { ProviderPurchaseOrders } from "@/components/providers/provider-purchase-orders";
import { ProviderSupplierInvoices } from "@/components/providers/provider-supplier-invoices";
import { deleteProvider } from "@/lib/actions/provider-actions";
import { serialize } from "@/lib/utils";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProviderPage({ params }: Props) {
  const { id } = await params;
  const provider = serialize(await getProviderById(id));

  if (!provider) notFound();

  async function handleDelete() {
    "use server";
    await deleteProvider(id);
  }

  return (
    <>
      <ProviderDetail provider={provider} deleteAction={handleDelete} />
      <div className="mt-6 space-y-6">
        <ProviderPurchaseOrders
          orders={provider.purchaseOrders ?? []}
          providerId={id}
        />
        <ProviderSupplierInvoices
          invoices={provider.supplierInvoices ?? []}
          providerId={id}
        />
      </div>
    </>
  );
}
