import { getCategories, getActiveServices } from "@/lib/queries/service-queries";
import { serialize } from "@/lib/utils";
import { ServiceForm } from "@/components/services/service-form";
import { createService } from "@/lib/actions/service-actions";

export default async function NewServicePage() {
  const [categories, allServices] = await Promise.all([
    getCategories(),
    getActiveServices(),
  ]);

  return (
    <div className="max-w-2xl mx-auto">
      <ServiceForm
        categories={serialize(categories)}
        allServices={serialize(allServices)}
        action={createService}
        title="מוצר / שירות חדש"
      />
    </div>
  );
}
