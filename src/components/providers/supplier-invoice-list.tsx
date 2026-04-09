"use client";

import { Badge } from "@/components/ui/badge";
import type { SupplierInvoice, PaymentStatus } from "@/generated/prisma";

const statusLabels: Record<PaymentStatus, string> = {
  PENDING: "ממתין",
  PAID: "שולם",
  PARTIAL: "חלקי",
};

const statusColors: Record<PaymentStatus, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  PAID: "bg-emerald-100 text-emerald-700",
  PARTIAL: "bg-blue-100 text-blue-700",
};

interface SupplierInvoiceListProps {
  invoices: SupplierInvoice[];
}

export function SupplierInvoiceList({ invoices }: SupplierInvoiceListProps) {
  if (invoices.length === 0) {
    return (
      <div className="p-6 text-center text-sm text-slate-400">
        אין חשבוניות ספק
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-right border-collapse">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
              מס׳ חשבונית
            </th>
            <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
              תיאור
            </th>
            <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
              סכום (₪)
            </th>
            <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
              תאריך
            </th>
            <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
              סטטוס
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {invoices.map((invoice) => {
            const status = invoice.status as PaymentStatus;
            return (
              <tr key={invoice.id} className="hover:bg-teal-50/30 transition-colors">
                <td className="px-6 py-4 text-sm font-bold text-slate-800">
                  {invoice.invoiceNumber}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {invoice.description || "—"}
                </td>
                <td className="px-6 py-4 text-sm font-bold text-slate-800">
                  ₪{Number(invoice.amount).toLocaleString()}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {new Date(invoice.date).toLocaleDateString("he-IL")}
                </td>
                <td className="px-6 py-4">
                  <Badge className={statusColors[status]} variant="secondary">
                    {statusLabels[status]}
                  </Badge>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
