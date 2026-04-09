"use client";

import { Badge } from "@/components/ui/badge";
import { LinkIcon } from "lucide-react";
import Link from "next/link";

interface Invoice {
  id: string;
  clientName: string;
  amount: number;
  status: number;
  date: string;
  type: number;
  url: string;
}

interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
}

interface MonthlySummary {
  income: number;
  expenses: number;
  profit: number;
  invoiceCount: number;
}

interface FinancialReportsProps {
  invoices: Invoice[] | null;
  expenses: Expense[] | null;
  summary: MonthlySummary | null;
}

const STATUS_LABELS: Record<number, string> = {
  0: "טיוטה",
  1: "סופי",
  2: "שולם",
  3: "שולם חלקית",
  4: "בוטל",
};

function statusBadgeVariant(status: number): "default" | "secondary" | "outline" | "destructive" {
  if (status === 2) return "default"; // paid — green via className
  if (status === 1 || status === 3) return "secondary";
  if (status === 4) return "destructive";
  return "outline";
}

function statusClassName(status: number): string {
  if (status === 2) return "bg-green-100 text-green-700 border-green-200";
  if (status === 1 || status === 3) return "bg-amber-100 text-amber-700 border-amber-200";
  if (status === 4) return "bg-red-100 text-red-700 border-red-200";
  return "";
}

function fmt(n: number) {
  return `₪${n.toLocaleString("he-IL", { maximumFractionDigits: 0 })}`;
}

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

export function FinancialReports({ invoices, expenses, summary }: FinancialReportsProps) {
  if (!invoices && !expenses && !summary) {
    return (
      <div className="py-12 text-center">
        <p className="text-slate-400 text-sm">חשבונית ירוקה לא מחוברת</p>
        <Link
          href="/settings"
          className="text-xs text-teal-600 hover:text-teal-700 flex items-center gap-1 justify-center mt-2"
        >
          <LinkIcon className="h-3 w-3" />
          חבר חשבונית ירוקה
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Monthly summary cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard label="הכנסות החודש" value={fmt(summary.income)} color="text-green-600" />
          <SummaryCard label="הוצאות החודש" value={fmt(summary.expenses)} color="text-red-500" />
          <SummaryCard
            label="רווח נקי"
            value={`${summary.profit < 0 ? "-" : ""}${fmt(summary.profit)}`}
            color={summary.profit >= 0 ? "text-green-600" : "text-red-500"}
          />
          <SummaryCard label="חשבוניות" value={String(summary.invoiceCount)} color="text-slate-800" />
        </div>
      )}

      {/* Invoices table */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-4">חשבוניות אחרונות</h3>
        {!invoices || invoices.length === 0 ? (
          <p className="text-sm text-slate-400 py-8 text-center">אין חשבוניות</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="pb-2 text-xs font-bold text-slate-500">תאריך</th>
                  <th className="pb-2 text-xs font-bold text-slate-500">לקוח</th>
                  <th className="pb-2 text-xs font-bold text-slate-500">סכום</th>
                  <th className="pb-2 text-xs font-bold text-slate-500">סטטוס</th>
                  <th className="pb-2 text-xs font-bold text-slate-500"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td className="py-2 text-slate-600">{formatDate(inv.date)}</td>
                    <td className="py-2 font-medium text-slate-700">{inv.clientName}</td>
                    <td className="py-2 font-bold text-slate-800">{fmt(inv.amount)}</td>
                    <td className="py-2">
                      <Badge
                        variant={statusBadgeVariant(inv.status)}
                        className={statusClassName(inv.status)}
                      >
                        {STATUS_LABELS[inv.status] ?? `סטטוס ${inv.status}`}
                      </Badge>
                    </td>
                    <td className="py-2">
                      {inv.url && (
                        <a
                          href={inv.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-teal-600 hover:text-teal-700 text-xs"
                        >
                          פתח
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Expenses table */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-4">הוצאות אחרונות</h3>
        {!expenses || expenses.length === 0 ? (
          <p className="text-sm text-slate-400 py-8 text-center">אין הוצאות</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="pb-2 text-xs font-bold text-slate-500">תאריך</th>
                  <th className="pb-2 text-xs font-bold text-slate-500">תיאור</th>
                  <th className="pb-2 text-xs font-bold text-slate-500">סכום</th>
                  <th className="pb-2 text-xs font-bold text-slate-500">קטגוריה</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {expenses.map((exp) => (
                  <tr key={exp.id}>
                    <td className="py-2 text-slate-600">{formatDate(exp.date)}</td>
                    <td className="py-2 font-medium text-slate-700">{exp.description}</td>
                    <td className="py-2 font-bold text-red-600">{fmt(exp.amount)}</td>
                    <td className="py-2 text-slate-600">{exp.category}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
      <span className="text-slate-500 text-xs font-medium">{label}</span>
      <div className={`text-2xl font-bold mt-1 ${color}`}>{value}</div>
    </div>
  );
}
