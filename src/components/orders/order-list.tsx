"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  CONFIRMED: "bg-green-100 text-green-700 border-green-200",
  IN_PROGRESS: "bg-blue-100 text-blue-700 border-blue-200",
  COMPLETED: "bg-gray-100 text-gray-700 border-gray-200",
  CANCELLED: "bg-red-100 text-red-700 border-red-200",
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
  if (payments.length === 0) return "bg-gray-100 text-gray-700 border-gray-200";
  const allPaid = payments.every((p) => p.status === "PAID");
  if (allPaid) return "bg-green-100 text-green-700 border-green-200";
  return "bg-amber-100 text-amber-700 border-amber-200";
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
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">הזמנות</h2>
        <Link
          href="/orders/new"
          className={cn(buttonVariants({ variant: "default" }))}
        >
          <PlusIcon className="h-4 w-4 ml-1" />
          הזמנה חדשה
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-muted-foreground mb-4">אין הזמנות</p>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">
                    <SortableHeader label="מספר" field="orderNumber" currentField={sortField} currentDir={sortDir} onSort={handleSort} />
                  </TableHead>
                  <TableHead className="text-right">לקוח</TableHead>
                  <TableHead className="text-right">סוג</TableHead>
                  <TableHead className="text-right">
                    <SortableHeader label="תאריך אירוע" field="eventDate" currentField={sortField} currentDir={sortDir} onSort={handleSort} />
                  </TableHead>
                  <TableHead className="text-right">
                    <SortableHeader label="סטטוס" field="status" currentField={sortField} currentDir={sortDir} onSort={handleSort} />
                  </TableHead>
                  <TableHead className="text-right">
                    <SortableHeader label="סכום" field="totalAmount" currentField={sortField} currentDir={sortDir} onSort={handleSort} />
                  </TableHead>
                  <TableHead className="text-right">תשלום</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <Link
                        href={`/orders/${order.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        #{order.orderNumber}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/clients/${order.client.id}`}
                        className="hover:underline text-sm"
                      >
                        {order.client.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {typeLabels[order.type] ?? order.type}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(order.eventDate)}
                    </TableCell>
                    <TableCell>
                      <span className={cn(
                        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                        statusColors[order.status] ?? "bg-gray-100 text-gray-700 border-gray-200"
                      )}>
                        {statusLabels[order.status] ?? order.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      ₪{Number(order.totalAmount).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <span className={cn(
                        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                        getPaymentColor(order.payments)
                      )}>
                        {getPaymentStatus(order.payments)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
