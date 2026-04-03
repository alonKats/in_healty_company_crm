import { notFound } from "next/navigation";
import { getProviderById } from "@/lib/queries/provider-queries";
import { getActiveServices } from "@/lib/queries/service-queries";
import { ProviderForm } from "@/components/providers/provider-form";
import { updateProvider } from "@/lib/actions/provider-actions";
import { serialize } from "@/lib/utils";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditProviderPage({ params }: Props) {
  const { id } = await params;
  const [provider, services] = await Promise.all([
    getProviderById(id).then(serialize),
    getActiveServices().then(serialize),
  ]);

  if (!provider) notFound();

  const updateWithId = updateProvider.bind(null, id);

  return (
    <div className="max-w-2xl mx-auto">
      <ProviderForm
        allServices={services}
        provider={provider}
        action={updateWithId}
        title="עריכת ספק"
      />
    </div>
  );
}
