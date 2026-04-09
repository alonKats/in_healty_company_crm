"use client";

import { DollarSignIcon, TrendingUpIcon, TrendingDownIcon, FileTextIcon, LinkIcon } from "lucide-react";
import Link from "next/link";

interface FinancialSummaryData {
  income: number;
  expenses: number;
  profit: number;
  invoiceCount: number;
}

function fmt(n: number) {
  return `₪${Math.abs(n).toLocaleString("he-IL", { maximumFractionDigits: 0 })}`;
}

export function FinancialSummary({ data }: { data: FinancialSummaryData | null }) {
  if (!data) {
    return (
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-700">חשבונית ירוקה</h3>
          <DollarSignIcon className="h-4 w-4 text-slate-400" />
        </div>
        <p className="text-sm text-slate-400 text-center py-4">
          לא מחובר לחשבונית ירוקה
        </p>
        <Link
          href="/settings"
          className="text-xs text-teal-600 hover:text-teal-700 flex items-center gap-1 justify-center mt-1"
        >
          <LinkIcon className="h-3 w-3" />
          חבר חשבונית ירוקה
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-700">סיכום חודשי — חשבונית ירוקה</h3>
        <DollarSignIcon className="h-4 w-4 text-teal-500" />
      </div>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="bg-green-50 text-green-600 p-1.5 rounded-lg">
              <TrendingUpIcon className="h-3.5 w-3.5" />
            </span>
            <span className="text-sm text-slate-600">הכנסות</span>
          </div>
          <span className="text-sm font-bold text-green-600">{fmt(data.income)}</span>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="bg-red-50 text-red-500 p-1.5 rounded-lg">
              <TrendingDownIcon className="h-3.5 w-3.5" />
            </span>
            <span className="text-sm text-slate-600">הוצאות</span>
          </div>
          <span className="text-sm font-bold text-red-500">{fmt(data.expenses)}</span>
        </div>
        <div className="border-t border-slate-100 pt-2 flex justify-between items-center">
          <span className="text-sm font-medium text-slate-700">רווח נקי</span>
          <span className={`text-sm font-bold ${data.profit >= 0 ? "text-green-600" : "text-red-500"}`}>
            {data.profit < 0 ? "-" : ""}{fmt(data.profit)}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <FileTextIcon className="h-3 w-3" />
          <span>{data.invoiceCount} חשבוניות החודש</span>
        </div>
      </div>
    </div>
  );
}
