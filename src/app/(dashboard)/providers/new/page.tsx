import { getActiveServices } from "@/lib/queries/service-queries";
import { serialize } from "@/lib/utils";
import { ProviderForm } from "@/components/providers/provider-form";
import { createProvider } from "@/lib/actions/provider-actions";

export default async function NewProviderPage() {
  const services = serialize(await getActiveServices());

  return (
    <div className="max-w-2xl mx-auto">
      <ProviderForm
        allServices={services}
        action={createProvider}
        title="ספק חדש"
      />
    </div>
  );
}
