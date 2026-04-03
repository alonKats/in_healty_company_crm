"use client";

import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Provider, ProviderService, Service, Category, FeeType } from "@/generated/prisma";

interface ProviderServiceWithRelations extends ProviderService {
  service: Service & { category: Category };
}

interface ProviderWithRelations extends Provider {
  services: ProviderServiceWithRelations[];
}

interface ProviderListProps {
  providers: ProviderWithRelations[];
}

const feeTypeLabels: Record<FeeType, string> = {
  PER_EVENT: "לאירוע",
  PER_HOUR: "לשעה",
  PER_PARTICIPANT: "למשתתף",
};

export function ProviderList({ providers }: ProviderListProps) {
  if (providers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-muted-foreground mb-4">אין ספקים במערכת</p>
        <Link
          href="/providers/new"
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-lg font-bold transition-all shadow-lg shadow-teal-600/20"
        >
          <PlusIcon className="h-4 w-4" />
          ספק חדש
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">ספקים</h2>
          <p className="text-slate-500 text-sm mt-1">ניהול ספקים חיצוניים — מרצים, רופאים, מנחי סדנאות</p>
        </div>
        <Link
          href="/providers/new"
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-lg font-bold transition-all shadow-lg shadow-teal-600/20 active:scale-95"
        >
          <PlusIcon className="h-4 w-4" />
          ספק חדש
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">שם</th>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">התמחות</th>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">שירותים</th>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">תעריף</th>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">סוג תעריף</th>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">סטטוס</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {providers.map((provider) => (
                <tr key={provider.id} className="hover:bg-teal-50/30 transition-colors">
                  <td className="px-6 py-4">
                    <Link
                      href={`/providers/${provider.id}`}
                      className="font-bold text-slate-800 hover:text-teal-600 transition-colors"
                    >
                      {provider.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {provider.specialty || "—"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {provider.services.length > 0
                        ? provider.services.map((ps) => (
                            <span
                              key={ps.id}
                              className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-teal-50 text-teal-700 border border-teal-200"
                            >
                              {ps.service.name}
                            </span>
                          ))
                        : <span className="text-sm text-slate-400">—</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-800">
                    {provider.defaultFee ? `₪${Number(provider.defaultFee).toFixed(0)}` : "—"}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {feeTypeLabels[provider.feeType as FeeType]}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        "px-3 py-1 rounded-full text-[11px] font-bold",
                        provider.isActive
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-600"
                      )}
                    >
                      {provider.isActive ? "פעיל" : "לא פעיל"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
