import { getServices } from "@/lib/queries/service-queries";
import { ServiceList } from "@/components/services/service-list";

export default async function ServicesPage() {
  const services = await getServices();
  return <ServiceList services={services} />;
}
