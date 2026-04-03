"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

const statusVariants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  CONFIRMED: "default",
  IN_PROGRESS: "default",
  COMPLETED: "secondary",
  CANCELLED: "destructive",
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

function getPaymentVariant(payments: Pick<Payment, "id" | "status">[]): "default" | "secondary" | "outline" {
  if (payments.length === 0) return "outline";
  const allPaid = payments.every((p) => p.status === "PAID");
  if (allPaid) return "default";
  return "secondary";
}

export function OrderList({ orders }: OrderListProps) {
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
                  <TableHead className="text-right">מספר</TableHead>
                  <TableHead className="text-right">לקוח</TableHead>
                  <TableHead className="text-right">סוג</TableHead>
                  <TableHead className="text-right">תאריך אירוע</TableHead>
                  <TableHead className="text-right">סטטוס</TableHead>
                  <TableHead className="text-right">סכום</TableHead>
                  <TableHead className="text-right">תשלום</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
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
                      <Badge variant={statusVariants[order.status] ?? "outline"}>
                        {statusLabels[order.status] ?? order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      ₪{Number(order.totalAmount).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPaymentVariant(order.payments)}>
                        {getPaymentStatus(order.payments)}
                      </Badge>
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
