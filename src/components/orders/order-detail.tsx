"use client";

import { useTransition } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
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
import { Trash2Icon } from "lucide-react";
import { updateOrderStatus, deletePayment } from "@/lib/actions/order-actions";
import { AddPaymentDialog } from "./add-payment-dialog";
import type { Order, OrderItem, Client, Quote, Payment, Service } from "@/generated/prisma";

interface OrderItemWithService extends OrderItem {
  service: Pick<Service, "id" | "name"> | null;
}

interface OrderWithRelations extends Order {
  client: Pick<Client, "id" | "name" | "company">;
  quote: Pick<Quote, "id" | "quoteNumber"> | null;
  items: OrderItemWithService[];
  payments: Payment[];
}

interface OrderDetailProps {
  order: OrderWithRelations;
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

const paymentMethodLabels: Record<string, string> = {
  CASH: "מזומן",
  TRANSFER: "העברה",
  CREDIT_CARD: "כרטיס אשראי",
  CHECK: "צ׳ק",
};

const paymentStatusLabels: Record<string, string> = {
  PENDING: "ממתין",
  PAID: "שולם",
  PARTIAL: "חלקי",
};

const paymentStatusVariants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  PENDING: "secondary",
  PAID: "default",
  PARTIAL: "outline",
};

function formatDate(date: Date | null | undefined): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("he-IL");
}

export function OrderDetail({ order }: OrderDetailProps) {
  const [isPending, startTransition] = useTransition();

  function handleStatusUpdate(status: "IN_PROGRESS" | "COMPLETED" | "CANCELLED") {
    startTransition(async () => {
      await updateOrderStatus(order.id, status);
    });
  }

  function handleDeletePayment(paymentId: string) {
    startTransition(async () => {
      await deletePayment(paymentId, order.id);
    });
  }

  const grandTotal = order.items.reduce(
    (sum, item) => sum + Number(item.total),
    0
  );

  const totalPaid = order.payments
    .filter((p) => p.status === "PAID")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold">הזמנה #{order.orderNumber}</h1>
                <Badge variant={statusVariants[order.status] ?? "outline"}>
                  {statusLabels[order.status] ?? order.status}
                </Badge>
                <Badge variant="outline">
                  {typeLabels[order.type] ?? order.type}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground space-y-0.5">
                <p>
                  לקוח:{" "}
                  <Link href={`/clients/${order.client.id}`} className="text-primary hover:underline">
                    {order.client.name}
                    {order.client.company ? ` — ${order.client.company}` : ""}
                  </Link>
                </p>
                {order.eventDate && <p>תאריך אירוע: {formatDate(order.eventDate)}</p>}
                {order.eventLocation && <p>מיקום: {order.eventLocation}</p>}
                {order.quote && (
                  <p>
                    הצעת מחיר:{" "}
                    <Link href={`/quotes/${order.quote.id}`} className="text-primary hover:underline">
                      #{order.quote.quoteNumber}
                    </Link>
                  </p>
                )}
              </div>
            </div>

            {/* Status actions */}
            <div className="flex flex-wrap gap-2">
              {order.status === "CONFIRMED" && (
                <button
                  onClick={() => handleStatusUpdate("IN_PROGRESS")}
                  disabled={isPending}
                  className={cn(buttonVariants({ variant: "default", size: "sm" }))}
                >
                  התחל ביצוע
                </button>
              )}
              {order.status === "IN_PROGRESS" && (
                <button
                  onClick={() => handleStatusUpdate("COMPLETED")}
                  disabled={isPending}
                  className={cn(buttonVariants({ variant: "default", size: "sm" }))}
                >
                  הושלמה
                </button>
              )}
              {order.status !== "CANCELLED" && order.status !== "COMPLETED" && (
                <button
                  onClick={() => handleStatusUpdate("CANCELLED")}
                  disabled={isPending}
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                >
                  בטל
                </button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items table */}
      <Card>
        <CardHeader>
          <CardTitle>פריטים</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">תיאור</TableHead>
                <TableHead className="text-right">כמות</TableHead>
                <TableHead className="text-right">מחיר יחידה</TableHead>
                <TableHead className="text-right">סה&quot;כ</TableHead>
                <TableHead className="text-right">הערות</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="text-sm">{item.description}</TableCell>
                  <TableCell className="text-sm">{item.quantity}</TableCell>
                  <TableCell className="text-sm">
                    ₪{Number(item.unitPrice).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-sm font-medium">
                    ₪{Number(item.total).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {item.notes ?? "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex justify-end p-4 border-t">
            <span className="text-lg font-bold">
              סה&quot;כ: ₪{grandTotal.toLocaleString()}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Payments */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>תשלומים</CardTitle>
            <AddPaymentDialog orderId={order.id} />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {order.payments.length === 0 ? (
            <p className="text-sm text-muted-foreground p-4">אין תשלומים רשומים</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">תאריך</TableHead>
                  <TableHead className="text-right">סכום</TableHead>
                  <TableHead className="text-right">אמצעי תשלום</TableHead>
                  <TableHead className="text-right">חשבונית</TableHead>
                  <TableHead className="text-right">סטטוס</TableHead>
                  <TableHead className="text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="text-sm">{formatDate(payment.date)}</TableCell>
                    <TableCell className="text-sm font-medium">
                      ₪{Number(payment.amount).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {paymentMethodLabels[payment.method] ?? payment.method}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {payment.invoiceNumber ?? "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={paymentStatusVariants[payment.status] ?? "outline"}>
                        {paymentStatusLabels[payment.status] ?? payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => handleDeletePayment(payment.id)}
                        disabled={isPending}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                        aria-label="מחק תשלום"
                      >
                        <Trash2Icon className="h-4 w-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Payment summary */}
          <div className="flex justify-between items-center p-4 border-t text-sm">
            <span className="text-muted-foreground">
              שולם: ₪{totalPaid.toLocaleString()} מתוך ₪{grandTotal.toLocaleString()}
            </span>
            <span className={cn("font-semibold", totalPaid >= grandTotal ? "text-green-600" : "text-orange-500")}>
              {totalPaid >= grandTotal ? "שולם במלואו" : `נותר: ₪${(grandTotal - totalPaid).toLocaleString()}`}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      {order.notes && (
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-semibold mb-1">הערות</p>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{order.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
