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
import { updateQuoteStatus, createOrderFromQuote } from "@/lib/actions/quote-actions";
import type { Quote, QuoteItem, Client, User, Order, Service } from "@/generated/prisma";

interface QuoteItemWithService extends QuoteItem {
  service: Pick<Service, "id" | "name"> | null;
}

interface QuoteWithRelations extends Quote {
  client: Pick<Client, "id" | "name" | "company">;
  assignedTo: Pick<User, "id" | "name"> | null;
  items: QuoteItemWithService[];
  orders: Pick<Order, "id" | "orderNumber" | "status">[];
  version: number;
  paymentTerms: string | null;
}

interface QuoteDetailProps {
  quote: QuoteWithRelations;
}

const statusLabels: Record<string, string> = {
  DRAFT: "טיוטה",
  SENT: "נשלחה",
  APPROVED: "אושרה",
  REJECTED: "נדחתה",
  EXPIRED: "פגה",
};

const statusVariants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  DRAFT: "secondary",
  SENT: "default",
  APPROVED: "default",
  REJECTED: "destructive",
  EXPIRED: "outline",
};

const orderStatusLabels: Record<string, string> = {
  CONFIRMED: "מאושר",
  IN_PROGRESS: "בביצוע",
  COMPLETED: "הושלם",
  CANCELLED: "בוטל",
};

function formatDate(date: Date | null | undefined): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("he-IL");
}

export function QuoteDetail({ quote }: QuoteDetailProps) {
  const [isPending, startTransition] = useTransition();

  function handleStatusUpdate(status: "SENT" | "APPROVED" | "REJECTED") {
    startTransition(async () => {
      await updateQuoteStatus(quote.id, status);
    });
  }

  function handleCreateOrder() {
    startTransition(async () => {
      await createOrderFromQuote(quote.id);
    });
  }

  const grandTotal = quote.items.reduce(
    (sum, item) => sum + Number(item.total),
    0
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold">הצעת מחיר #{quote.quoteNumber}</h1>
                <Badge variant={statusVariants[quote.status] ?? "outline"}>
                  {statusLabels[quote.status] ?? quote.status}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground space-y-0.5">
                <p>
                  לקוח:{" "}
                  <Link href={`/clients/${quote.client.id}`} className="text-primary hover:underline">
                    {quote.client.name}
                    {quote.client.company ? ` — ${quote.client.company}` : ""}
                  </Link>
                </p>
                {quote.eventDate && <p>תאריך אירוע: {formatDate(quote.eventDate)}</p>}
                {quote.validUntil && <p>תוקף עד: {formatDate(quote.validUntil)}</p>}
                {quote.assignedTo && <p>אחראי: {quote.assignedTo.name}</p>}
                {quote.version > 1 && <p>גרסה: {quote.version}</p>}
                {quote.paymentTerms && <p>תנאי תשלום: {quote.paymentTerms}</p>}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              {(quote.status === "DRAFT" || quote.status === "SENT") && (
                <Link
                  href={`/quotes/${quote.id}/edit`}
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                >
                  עריכה
                </Link>
              )}

              {quote.status === "DRAFT" && (
                <button
                  onClick={() => handleStatusUpdate("SENT")}
                  disabled={isPending}
                  className={cn(buttonVariants({ variant: "default", size: "sm" }))}
                >
                  סמן כנשלחה
                </button>
              )}

              {quote.status === "SENT" && (
                <>
                  <button
                    onClick={() => handleStatusUpdate("APPROVED")}
                    disabled={isPending}
                    className={cn(buttonVariants({ variant: "default", size: "sm" }))}
                  >
                    אושרה
                  </button>
                  <button
                    onClick={() => handleStatusUpdate("REJECTED")}
                    disabled={isPending}
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                  >
                    נדחתה
                  </button>
                </>
              )}

              {quote.status === "APPROVED" && quote.orders.length === 0 && (
                <button
                  onClick={handleCreateOrder}
                  disabled={isPending}
                  className={cn(buttonVariants({ variant: "default", size: "sm" }))}
                >
                  צור הזמנה מהצעה
                </button>
              )}

              <Link
                href={`/api/pdf/quote/${quote.id}`}
                target="_blank"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
              >
                הורד PDF
              </Link>
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
                <TableHead className="text-right">קטגוריה</TableHead>
                <TableHead className="text-right">תיאור</TableHead>
                <TableHead className="text-right">כמות</TableHead>
                <TableHead className="text-right">מחיר יחידה</TableHead>
                <TableHead className="text-right">סה&quot;כ</TableHead>
                <TableHead className="text-right">הערות</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quote.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="text-sm text-muted-foreground">
                    {item.category ?? "—"}
                  </TableCell>
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

      {/* Notes & Terms */}
      {(quote.notes || quote.terms) && (
        <Card>
          <CardContent className="p-4 space-y-4">
            {quote.notes && (
              <div>
                <p className="text-sm font-semibold mb-1">הערות</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{quote.notes}</p>
              </div>
            )}
            {quote.terms && (
              <div>
                <p className="text-sm font-semibold mb-1">תנאים</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{quote.terms}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Linked orders */}
      {quote.orders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>הזמנות מקושרות</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-2">
              {quote.orders.map((order) => (
                <div key={order.id} className="flex items-center justify-between">
                  <Link
                    href={`/orders/${order.id}`}
                    className="text-primary hover:underline text-sm font-medium"
                  >
                    הזמנה #{order.orderNumber}
                  </Link>
                  <Badge variant="outline" className="text-xs">
                    {orderStatusLabels[order.status] ?? order.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
