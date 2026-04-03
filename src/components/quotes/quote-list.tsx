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
import type { Quote, Client, User } from "@/generated/prisma";

interface QuoteWithRelations extends Quote {
  client: Pick<Client, "id" | "name" | "company">;
  assignedTo: Pick<User, "id" | "name"> | null;
  items: { id: string }[];
}

interface QuoteListProps {
  quotes: QuoteWithRelations[];
}

const statusLabels: Record<string, string> = {
  DRAFT: "טיוטה",
  SENT: "נשלחה",
  APPROVED: "אושרה",
  REJECTED: "נדחתה",
  EXPIRED: "פגה",
};

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700 border-gray-200",
  SENT: "bg-amber-100 text-amber-700 border-amber-200",
  APPROVED: "bg-green-100 text-green-700 border-green-200",
  REJECTED: "bg-red-100 text-red-700 border-red-200",
  EXPIRED: "bg-gray-100 text-gray-700 border-gray-200",
};

function formatDate(date: Date | null | undefined): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("he-IL");
}

export function QuoteList({ quotes }: QuoteListProps) {
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

  const sorted = Array.from(quotes).sort((a, b) => {
    let cmp = 0;
    if (sortField === "quoteNumber") {
      cmp = a.quoteNumber - b.quoteNumber;
    } else if (sortField === "totalAmount") {
      cmp = Number(a.totalAmount) - Number(b.totalAmount);
    } else if (sortField === "createdAt") {
      cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else if (sortField === "status") {
      cmp = a.status.localeCompare(b.status);
    }
    return sortDir === "asc" ? cmp : -cmp;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">הצעות מחיר</h2>
        <Link
          href="/quotes/new"
          className={cn(buttonVariants({ variant: "default" }))}
        >
          <PlusIcon className="h-4 w-4 ml-1" />
          הצעה חדשה
        </Link>
      </div>

      {quotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-muted-foreground mb-4">אין הצעות מחיר</p>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">
                    <SortableHeader label="מספר" field="quoteNumber" currentField={sortField} currentDir={sortDir} onSort={handleSort} />
                  </TableHead>
                  <TableHead className="text-right">לקוח</TableHead>
                  <TableHead className="text-right">
                    <SortableHeader label="סכום" field="totalAmount" currentField={sortField} currentDir={sortDir} onSort={handleSort} />
                  </TableHead>
                  <TableHead className="text-right">
                    <SortableHeader label="תאריך" field="createdAt" currentField={sortField} currentDir={sortDir} onSort={handleSort} />
                  </TableHead>
                  <TableHead className="text-right">תוקף עד</TableHead>
                  <TableHead className="text-right">אחראי</TableHead>
                  <TableHead className="text-right">
                    <SortableHeader label="סטטוס" field="status" currentField={sortField} currentDir={sortDir} onSort={handleSort} />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((quote) => (
                  <TableRow key={quote.id}>
                    <TableCell>
                      <Link
                        href={`/quotes/${quote.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        #{quote.quoteNumber}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/clients/${quote.client.id}`}
                        className="hover:underline text-sm"
                      >
                        {quote.client.name}
                        {quote.client.company && (
                          <span className="text-muted-foreground"> — {quote.client.company}</span>
                        )}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      ₪{Number(quote.totalAmount).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(quote.createdAt)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(quote.validUntil)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {quote.assignedTo?.name ?? "—"}
                    </TableCell>
                    <TableCell>
                      <span className={cn(
                        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                        statusColors[quote.status] ?? "bg-gray-100 text-gray-700 border-gray-200"
                      )}>
                        {statusLabels[quote.status] ?? quote.status}
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
