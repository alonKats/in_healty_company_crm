import { getServices } from "@/lib/queries/service-queries";
import { ServiceList } from "@/components/services/service-list";
import { serialize } from "@/lib/utils";

export default async function ServicesPage() {
  const services = serialize(await getServices());
  return <ServiceList services={services} />;
}
