"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
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
  DRAFT: "bg-slate-100 text-slate-600",
  SENT: "bg-amber-100 text-amber-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-700",
  EXPIRED: "bg-slate-100 text-slate-500",
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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">הצעות מחיר</h2>
          <p className="text-slate-500 text-sm mt-1">ניהול הצעות מחיר ומעקב אחר סטטוס</p>
        </div>
        <Link
          href="/quotes/new"
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-lg font-bold transition-all shadow-lg shadow-teal-600/20 active:scale-95"
        >
          <PlusIcon className="h-4 w-4" />
          הצעה חדשה
        </Link>
      </div>

      {quotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-xl border border-slate-200 shadow-sm">
          <p className="text-slate-400 text-sm">אין הצעות מחיר</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <SortableHeader label="מספר" field="quoteNumber" currentField={sortField} currentDir={sortDir} onSort={handleSort} />
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">לקוח</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <SortableHeader label="סכום" field="totalAmount" currentField={sortField} currentDir={sortDir} onSort={handleSort} />
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <SortableHeader label="תאריך" field="createdAt" currentField={sortField} currentDir={sortDir} onSort={handleSort} />
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">תוקף עד</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">אחראי</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <SortableHeader label="סטטוס" field="status" currentField={sortField} currentDir={sortDir} onSort={handleSort} />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sorted.map((quote) => (
                  <tr key={quote.id} className="hover:bg-teal-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <Link href={`/quotes/${quote.id}`} className="font-bold text-teal-600 hover:underline">
                        #{quote.quoteNumber}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/clients/${quote.client.id}`} className="font-medium text-slate-800 hover:text-teal-600 transition-colors text-sm">
                        {quote.client.name}
                        {quote.client.company && (
                          <span className="text-slate-400"> — {quote.client.company}</span>
                        )}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-800">
                      ₪{Number(quote.totalAmount).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{formatDate(quote.createdAt)}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{formatDate(quote.validUntil)}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{quote.assignedTo?.name ?? "—"}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[11px] font-bold",
                        statusColors[quote.status] ?? "bg-slate-100 text-slate-600"
                      )}>
                        {statusLabels[quote.status] ?? quote.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 bg-slate-50/30 border-t border-slate-100">
            <div className="text-sm text-slate-500">
              סה&quot;כ <span className="font-bold text-slate-700">{quotes.length}</span> הצעות
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
