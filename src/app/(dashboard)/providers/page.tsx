import { getProviders } from "@/lib/queries/provider-queries";
import { ProviderList } from "@/components/providers/provider-list";
import { serialize } from "@/lib/utils";

export default async function ProvidersPage() {
  const providers = serialize(await getProviders());
  return <ProviderList providers={providers} />;
}
