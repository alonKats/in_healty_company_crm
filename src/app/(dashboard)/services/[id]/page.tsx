import { notFound } from "next/navigation";
import { getServiceById, getCategories } from "@/lib/queries/service-queries";
import { ServiceForm } from "@/components/services/service-form";
import { updateService, deleteService } from "@/lib/actions/service-actions";
import { serialize } from "@/lib/utils";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditServicePage({ params }: Props) {
  const { id } = await params;
  const [service, categories] = await Promise.all([
    getServiceById(id).then(serialize),
    getCategories().then(serialize),
  ]);

  if (!service) notFound();

  const updateWithId = updateService.bind(null, id);

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <ServiceForm
        categories={categories}
        service={service}
        action={updateWithId}
        title="עריכת מוצר / שירות"
      />

      <form
        action={async () => {
          "use server";
          await deleteService(id);
        }}
      >
        <button
          type="submit"
          className="text-sm text-destructive hover:underline"
          onClick={(e) => {
            if (!confirm("האם למחוק את המוצר?")) e.preventDefault();
          }}
        >
          מחק מוצר
        </button>
      </form>
    </div>
  );
}
