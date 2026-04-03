import { getCategories } from "@/lib/queries/service-queries";
import { serialize } from "@/lib/utils";
import { ServiceForm } from "@/components/services/service-form";
import { createService } from "@/lib/actions/service-actions";

export default async function NewServicePage() {
  const categories = await getCategories();

  return (
    <div className="max-w-2xl mx-auto">
      <ServiceForm
        categories={serialize(categories)}
        action={createService}
        title="מוצר / שירות חדש"
      />
    </div>
  );
}
