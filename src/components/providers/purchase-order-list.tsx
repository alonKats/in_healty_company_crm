"use client";

import { useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updatePurchaseOrderStatus } from "@/lib/actions/purchase-order-actions";
import type { PurchaseOrder, PurchaseOrderStatus } from "@/generated/prisma";

interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

const statusLabels: Record<PurchaseOrderStatus, string> = {
  DRAFT: "טיוטה",
  SENT: "נשלחה",
  CONFIRMED: "אושרה",
  CANCELLED: "בוטלה",
};

const statusColors: Record<PurchaseOrderStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-700",
  SENT: "bg-blue-100 text-blue-700",
  CONFIRMED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-red-100 text-red-700",
};

interface PurchaseOrderListProps {
  orders: PurchaseOrder[];
  providerId: string;
}

export function PurchaseOrderList({ orders, providerId }: PurchaseOrderListProps) {
  const [isPending, startTransition] = useTransition();

  function handleStatusChange(orderId: string, newStatus: string) {
    startTransition(async () => {
      await updatePurchaseOrderStatus(
        orderId,
        newStatus as PurchaseOrderStatus,
        providerId
      );
    });
  }

  if (orders.length === 0) {
    return (
      <div className="p-6 text-center text-sm text-slate-400">
        אין הזמנות רכש
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-right border-collapse">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
              מס׳ הזמנה
            </th>
            <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
              פריטים
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
          {orders.map((order) => {
            const items = (order.items as unknown as LineItem[]) || [];
            const status = order.status as PurchaseOrderStatus;
            return (
              <tr key={order.id} className="hover:bg-teal-50/30 transition-colors">
                <td className="px-6 py-4 text-sm font-mono text-slate-800">
                  {order.orderNumber.slice(-8)}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {items.length} פריטים
                </td>
                <td className="px-6 py-4 text-sm font-bold text-slate-800">
                  ₪{Number(order.totalAmount).toLocaleString()}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {new Date(order.createdAt).toLocaleDateString("he-IL")}
                </td>
                <td className="px-6 py-4">
                  <Select
                    value={status}
                    onValueChange={(v) => v && handleStatusChange(order.id, v)}
                    disabled={isPending}
                  >
                    <SelectTrigger className="h-8 w-28">
                      <Badge className={statusColors[status]} variant="secondary">
                        {statusLabels[status]}
                      </Badge>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">טיוטה</SelectItem>
                      <SelectItem value="SENT">נשלחה</SelectItem>
                      <SelectItem value="CONFIRMED">אושרה</SelectItem>
                      <SelectItem value="CANCELLED">בוטלה</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
