"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { PlusIcon } from "lucide-react";
import { SortableHeader } from "@/components/ui/sortable-header";
import type { Order, Client, Payment } from "@/generated/prisma";

interface OrderWithRelations extends Order {
  client: Pick<Client, "id" | "name">;
  items: { id: string }[];
  payments: Pick<Payment, "id" | "status">[];
}

interface OrderListProps {
  orders: OrderWithRelations[];
}

const statusLabels: Record<string, string> = {
  CONFIRMED: "אושרה",
  IN_PROGRESS: "בביצוע",
  COMPLETED: "הושלמה",
  CANCELLED: "בוטלה",
};

const statusColors: Record<string, string> = {
  CONFIRMED: "bg-emerald-100 text-emerald-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-slate-100 text-slate-600",
  CANCELLED: "bg-red-100 text-red-700",
};

const typeLabels: Record<string, string> = {
  SINGLE: "בודד",
  BUNDLE: "סל מוצרים",
};

function formatDate(date: Date | null | undefined): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("he-IL");
}

function getPaymentStatus(payments: Pick<Payment, "id" | "status">[]): string {
  if (payments.length === 0) return "טרם שולם";
  const allPaid = payments.every((p) => p.status === "PAID");
  if (allPaid) return "שולם";
  return "ממתין";
}

function getPaymentColor(payments: Pick<Payment, "id" | "status">[]): string {
  if (payments.length === 0) return "bg-slate-100 text-slate-500";
  const allPaid = payments.every((p) => p.status === "PAID");
  if (allPaid) return "bg-emerald-100 text-emerald-700";
  return "bg-amber-100 text-amber-700";
}

export function OrderList({ orders }: OrderListProps) {
  const [sortField, setSortField] = useState("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  function handleSort(field: string) {
    if (field === sortField) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  const sorted = Array.from(orders).sort((a, b) => {
    let cmp = 0;
    if (sortField === "orderNumber") {
      cmp = a.orderNumber - b.orderNumber;
    } else if (sortField === "totalAmount") {
      cmp = Number(a.totalAmount) - Number(b.totalAmount);
    } else if (sortField === "eventDate") {
      const aDate = a.eventDate ? new Date(a.eventDate).getTime() : 0;
      const bDate = b.eventDate ? new Date(b.eventDate).getTime() : 0;
      cmp = aDate - bDate;
    } else if (sortField === "status") {
      cmp = a.status.localeCompare(b.status);
    } else if (sortField === "createdAt") {
      cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    return sortDir === "asc" ? cmp : -cmp;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">הזמנות</h2>
          <p className="text-slate-500 text-sm mt-1">ניהול ומעקב אחר הזמנות פעילות</p>
        </div>
        <Link
          href="/orders/new"
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-lg font-bold transition-all shadow-lg shadow-teal-600/20 active:scale-95"
        >
          <PlusIcon className="h-4 w-4" />
          הזמנה חדשה
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-xl border border-slate-200 shadow-sm">
          <p className="text-slate-400 text-sm">אין הזמנות</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <SortableHeader label="מספר" field="orderNumber" currentField={sortField} currentDir={sortDir} onSort={handleSort} />
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">לקוח</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">סוג</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <SortableHeader label="תאריך אירוע" field="eventDate" currentField={sortField} currentDir={sortDir} onSort={handleSort} />
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <SortableHeader label="סטטוס" field="status" currentField={sortField} currentDir={sortDir} onSort={handleSort} />
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <SortableHeader label="סכום" field="totalAmount" currentField={sortField} currentDir={sortDir} onSort={handleSort} />
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">תשלום</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sorted.map((order) => (
                  <tr key={order.id} className="hover:bg-teal-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <Link href={`/orders/${order.id}`} className="font-bold text-teal-600 hover:underline">
                        #{order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/clients/${order.client.id}`} className="font-medium text-slate-800 hover:text-teal-600 transition-colors text-sm">
                        {order.client.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {typeLabels[order.type] ?? order.type}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{formatDate(order.eventDate)}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[11px] font-bold",
                        statusColors[order.status] ?? "bg-slate-100 text-slate-600"
                      )}>
                        {statusLabels[order.status] ?? order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-800">
                      ₪{Number(order.totalAmount).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[11px] font-bold",
                        getPaymentColor(order.payments)
                      )}>
                        {getPaymentStatus(order.payments)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 bg-slate-50/30 border-t border-slate-100">
            <div className="text-sm text-slate-500">
              סה&quot;כ <span className="font-bold text-slate-700">{orders.length}</span> הזמנות
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
