"use client";

import { useState } from "react";
import Link from "next/link";
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
  const [sourceFilter, setSourceFilter] = useState<string>("ALL");

  if (services.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-muted-foreground mb-4">אין מוצרים או שירותים במערכת</p>
        <Link href="/services/new" className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-lg font-bold transition-all shadow-lg shadow-teal-600/20">
          <PlusIcon className="h-4 w-4" />
          מוצר חדש
        </Link>
      </div>
    );
  }

  // Filter by source type
  const filteredServices = sourceFilter === "ALL" ? services : services.filter((s) => s.sourceType === sourceFilter);

  // Group by category
  const grouped = filteredServices.reduce<Record<string, ServiceWithRelations[]>>((acc, service) => {
    const categoryName = service.category.name;
    if (!acc[categoryName]) acc[categoryName] = [];
    acc[categoryName].push(service);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">מוצרים ושירותים</h2>
          <p className="text-slate-500 text-sm mt-1">ניהול קטלוג השירותים ומחירונים</p>
        </div>
        <Link
          href="/services/new"
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-lg font-bold transition-all shadow-lg shadow-teal-600/20 active:scale-95"
        >
          <PlusIcon className="h-4 w-4" />
          מוצר חדש
        </Link>
      </div>

      <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-200 flex items-center justify-around max-w-md">
        {[
          { value: "ALL", label: "הכל" },
          { value: "IN_HOUSE", label: "מוצרי בית" },
          { value: "EXTERNAL_SUPPLIER", label: "ספקים חיצוניים" },
        ].map((opt) => (
          <button
            key={opt.value}
            onClick={() => setSourceFilter(opt.value)}
            className={cn(
              "px-4 py-1.5 text-xs font-medium rounded-lg transition-colors",
              sourceFilter === opt.value
                ? "bg-teal-50 text-teal-700 font-bold"
                : "text-slate-500 hover:bg-slate-50"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {filteredServices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-muted-foreground mb-4">אין מוצרים או שירותים במסנן זה</p>
        </div>
      ) : (
        Object.entries(grouped).map(([categoryName, categoryServices]) => (
        <div key={categoryName} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">{categoryName}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">שם</th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">סוג</th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">מחיר (₪)</th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">עלות (₪)</th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">מרווח %</th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">סטטוס</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categoryServices.map((service) => {
                  const basePrice = Number(service.basePrice);
                  const totalCost = getTotalCost(service.costItems);
                  const margin = getMargin(basePrice, totalCost);

                  return (
                    <tr key={service.id} className="hover:bg-teal-50/30 transition-colors">
                      <td className="px-6 py-4">
                        <Link href={`/services/${service.id}`} className="font-bold text-slate-800 hover:text-teal-600 transition-colors">
                          {service.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {service.sourceType === "IN_HOUSE" ? "מוצר בית" : "ספק חיצוני"}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-800">₪{basePrice.toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {service.costItems.length > 0 ? `₪${totalCost.toFixed(2)}` : "—"}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {margin !== null && service.costItems.length > 0 ? (
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-xs font-bold",
                            margin >= 30
                              ? "text-green-700 bg-green-50"
                              : margin >= 10
                              ? "text-amber-700 bg-amber-50"
                              : "text-red-700 bg-red-50"
                          )}>
                            {margin.toFixed(1)}%
                          </span>
                        ) : "—"}
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[11px] font-bold",
                          service.status === "ACTIVE"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        )}>
                          {service.status === "ACTIVE" ? "פעיל" : "לא פעיל"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        ))
      )}
    </div>
  );
}
