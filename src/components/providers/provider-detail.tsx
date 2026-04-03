"use client";

import Link from "next/link";
import { ArrowRight, Mail, Phone, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Provider, ProviderService, Service, Category, FeeType } from "@/generated/prisma";

interface ProviderServiceWithRelations extends ProviderService {
  service: Service & { category: Category };
}

interface ProviderWithRelations extends Provider {
  services: ProviderServiceWithRelations[];
}

interface ProviderDetailProps {
  provider: ProviderWithRelations;
  deleteAction: () => Promise<void>;
}

const feeTypeLabels: Record<FeeType, string> = {
  PER_EVENT: "לאירוע",
  PER_HOUR: "לשעה",
  PER_PARTICIPANT: "למשתתף",
};

export function ProviderDetail({ provider, deleteAction }: ProviderDetailProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <Link href="/providers" className="text-slate-400 hover:text-teal-600 transition-colors">
            <ArrowRight className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {provider.name}
              </h2>
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
            </div>
            {provider.specialty && (
              <p className="text-slate-500 text-sm mt-1">{provider.specialty}</p>
            )}
          </div>
        </div>
        <Link
          href={`/providers/${provider.id}/edit`}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-lg font-bold transition-all shadow-lg shadow-teal-600/20 active:scale-95"
        >
          <Pencil className="h-4 w-4" />
          עריכה
        </Link>
      </div>

      {/* Contact Info Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">פרטי קשר</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Phone className="h-4 w-4 text-slate-400" />
            {provider.phone || "—"}
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Mail className="h-4 w-4 text-slate-400" />
            {provider.email || "—"}
          </div>
          <div className="text-sm text-slate-600">
            <span className="text-slate-400">תעריף: </span>
            {provider.defaultFee ? `₪${Number(provider.defaultFee).toFixed(0)}` : "—"}{" "}
            <span className="text-slate-400">({feeTypeLabels[provider.feeType as FeeType]})</span>
          </div>
        </div>
        {provider.notes && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-sm text-slate-600 whitespace-pre-wrap">{provider.notes}</p>
          </div>
        )}
      </div>

      {/* Linked Services Table with Margin */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">שירותים מקושרים</h3>
        </div>
        {provider.services.length === 0 ? (
          <div className="p-6 text-center text-sm text-slate-400">
            אין שירותים מקושרים לספק זה
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">שירות</th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">קטגוריה</th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">מחיר ללקוח (₪)</th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">תעריף ספק (₪)</th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">מרווח (₪)</th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">מרווח %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {provider.services.map((ps) => {
                  const clientPrice = Number(ps.service.basePrice);
                  const providerFee = ps.fee
                    ? Number(ps.fee)
                    : provider.defaultFee
                    ? Number(provider.defaultFee)
                    : null;
                  const margin = providerFee !== null ? clientPrice - providerFee : null;
                  const marginPct =
                    margin !== null && clientPrice > 0
                      ? (margin / clientPrice) * 100
                      : null;

                  return (
                    <tr key={ps.id} className="hover:bg-teal-50/30 transition-colors">
                      <td className="px-6 py-4 font-bold text-sm text-slate-800">
                        {ps.service.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {ps.service.category.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-800">
                        ₪{clientPrice.toFixed(0)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-800">
                        {providerFee !== null ? `₪${providerFee.toFixed(0)}` : "—"}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-800">
                        {margin !== null ? `₪${margin.toFixed(0)}` : "—"}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {marginPct !== null ? (
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded-full text-xs font-bold",
                              marginPct >= 30
                                ? "text-green-700 bg-green-50"
                                : marginPct >= 10
                                ? "text-amber-700 bg-amber-50"
                                : "text-red-700 bg-red-50"
                            )}
                          >
                            {marginPct.toFixed(1)}%
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete */}
      <form action={deleteAction}>
        <button
          type="submit"
          className="text-sm text-destructive hover:underline"
          onClick={(e) => {
            if (!confirm("האם למחוק את הספק?")) e.preventDefault();
          }}
        >
          מחק ספק
        </button>
      </form>
    </div>
  );
}
