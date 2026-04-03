import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { buttonVariants } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Category, CostItem, Service } from "@/generated/prisma";

interface ServiceWithRelations extends Service {
  category: Category;
  costItems: CostItem[];
}

interface ServiceListProps {
  services: ServiceWithRelations[];
}

function getTotalCost(costItems: CostItem[]): number {
  return costItems.reduce((sum, item) => sum + Number(item.amount), 0);
}

function getMargin(basePrice: number, totalCost: number): number | null {
  if (basePrice === 0) return null;
  return ((basePrice - totalCost) / basePrice) * 100;
}

export function ServiceList({ services }: ServiceListProps) {
  if (services.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-muted-foreground mb-4">אין מוצרים או שירותים במערכת</p>
        <Link href="/services/new" className={cn(buttonVariants({ variant: "default" }))}>
          <PlusIcon className="h-4 w-4 ml-1" />
          מוצר חדש
        </Link>
      </div>
    );
  }

  // Group by category
  const grouped = services.reduce<Record<string, ServiceWithRelations[]>>((acc, service) => {
    const categoryName = service.category.name;
    if (!acc[categoryName]) acc[categoryName] = [];
    acc[categoryName].push(service);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">מוצרים ושירותים</h2>
        <Link href="/services/new" className={cn(buttonVariants({ variant: "default" }))}>
          <PlusIcon className="h-4 w-4 ml-1" />
          מוצר חדש
        </Link>
      </div>

      {Object.entries(grouped).map(([categoryName, categoryServices]) => (
        <Card key={categoryName}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{categoryName}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">שם</TableHead>
                  <TableHead className="text-right">סוג</TableHead>
                  <TableHead className="text-right">מחיר (₪)</TableHead>
                  <TableHead className="text-right">עלות (₪)</TableHead>
                  <TableHead className="text-right">מרווח %</TableHead>
                  <TableHead className="text-right">סטטוס</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categoryServices.map((service) => {
                  const basePrice = Number(service.basePrice);
                  const totalCost = getTotalCost(service.costItems);
                  const margin = getMargin(basePrice, totalCost);

                  return (
                    <TableRow key={service.id}>
                      <TableCell>
                        <Link
                          href={`/services/${service.id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {service.name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {service.sourceType === "IN_HOUSE" ? "מוצר בית" : "ספק חיצוני"}
                      </TableCell>
                      <TableCell>₪{basePrice.toFixed(2)}</TableCell>
                      <TableCell>
                        {service.costItems.length > 0 ? `₪${totalCost.toFixed(2)}` : "—"}
                      </TableCell>
                      <TableCell>
                        {margin !== null && service.costItems.length > 0 ? (
                          <span
                            className={
                              margin >= 30
                                ? "text-green-600 font-medium"
                                : margin >= 10
                                ? "text-yellow-600 font-medium"
                                : "text-red-600 font-medium"
                            }
                          >
                            {margin.toFixed(1)}%
                          </span>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={service.status === "ACTIVE" ? "default" : "outline"}>
                          {service.status === "ACTIVE" ? "פעיל" : "לא פעיל"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
