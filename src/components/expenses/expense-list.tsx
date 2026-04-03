"use client";

import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PlusIcon, PencilIcon, TrashIcon, Wallet, History, Tag } from "lucide-react";
import { SortableHeader } from "@/components/ui/sortable-header";
import { AddExpenseDialog } from "./add-expense-dialog";
import { EditExpenseDialog } from "./edit-expense-dialog";
import { deleteExpense } from "@/lib/actions/expense-actions";
import type { Expense } from "@/generated/prisma";

export interface SerializedExpense extends Omit<Expense, "amount" | "date" | "createdAt" | "updatedAt"> {
  amount: number;
  date: string;
  createdAt: string;
  updatedAt: string;
}

interface ExpenseListProps {
  expenses: SerializedExpense[];
  monthlySummary: { month: string; total: number }[];
}

const categoryLabels: Record<string, string> = {
  SALARY: "שכר",
  RAW_MATERIALS: "חומרי גלם",
  RENT: "שכירות",
  TRAVEL: "נסיעות",
  MARKETING: "שיווק",
  EQUIPMENT: "ציוד",
  INSURANCE: "ביטוח",
  PROFESSIONAL_SERVICES: "שירותים מקצועיים",
  OTHER: "אחר",
};

const categoryColors: Record<string, string> = {
  SALARY: "bg-blue-100 text-blue-700",
  RAW_MATERIALS: "bg-teal-100 text-teal-700",
  RENT: "bg-amber-100 text-amber-700",
  TRAVEL: "bg-purple-100 text-purple-700",
  MARKETING: "bg-orange-100 text-orange-700",
  EQUIPMENT: "bg-indigo-100 text-indigo-700",
  INSURANCE: "bg-green-100 text-green-700",
  PROFESSIONAL_SERVICES: "bg-slate-100 text-slate-700",
  OTHER: "bg-slate-100 text-slate-600",
};

const paymentMethodLabels: Record<string, string> = {
  CASH: "מזומן",
  TRANSFER: "העברה",
  CREDIT_CARD: "כרטיס אשראי",
  CHECK: "צ׳ק",
};

function formatDate(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleDateString("he-IL");
}

function currentMonthTotal(expenses: SerializedExpense[]): number {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  return expenses
    .filter((e) => {
      const d = new Date(e.date);
      return d.getMonth() === month && d.getFullYear() === year;
    })
    .reduce((sum, e) => sum + e.amount, 0);
}

export function ExpenseList({ expenses, monthlySummary }: ExpenseListProps) {
  const [addOpen, setAddOpen] = useState(false);
  const [editExpense, setEditExpense] = useState<SerializedExpense | null>(null);
  const [isPending, startTransition] = useTransition();
  const [sortField, setSortField] = useState("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  function handleSort(field: string) {
    if (field === sortField) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  const sorted = Array.from(expenses).sort((a, b) => {
    let cmp = 0;
    if (sortField === "date") {
      cmp = new Date(a.date).getTime() - new Date(b.date).getTime();
    } else if (sortField === "amount") {
      cmp = a.amount - b.amount;
    } else if (sortField === "category") {
      cmp = a.category.localeCompare(b.category);
    }
    return sortDir === "asc" ? cmp : -cmp;
  });

  function handleDelete(id: string) {
    if (!confirm("למחוק את ההוצאה?")) return;
    startTransition(async () => {
      await deleteExpense(id);
    });
  }

  const monthTotal = currentMonthTotal(expenses);
  const lastMonth = monthlySummary[monthlySummary.length - 1];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">הוצאות</h2>
          <p className="text-slate-500 text-sm mt-1">ניהול ומעקב אחר הוצאות העסק</p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-lg font-bold transition-all shadow-lg shadow-teal-600/20 active:scale-95"
        >
          <PlusIcon className="h-4 w-4" />
          הוסף הוצאה
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-xs font-medium mb-1">סה&quot;כ הוצאות החודש</p>
            <h3 className="text-2xl font-bold text-slate-800">₪{monthTotal.toLocaleString("he-IL", { minimumFractionDigits: 0 })}</h3>
          </div>
          <div className="p-3 bg-teal-50 rounded-lg text-teal-600">
            <Wallet className="w-7 h-7" />
          </div>
        </div>
        {lastMonth && (
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-xs font-medium mb-1">חודש קודם ({lastMonth.month})</p>
              <h3 className="text-2xl font-bold text-slate-800">₪{lastMonth.total.toLocaleString("he-IL", { minimumFractionDigits: 0 })}</h3>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg text-orange-500">
              <History className="w-7 h-7" />
            </div>
          </div>
        )}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-xs font-medium mb-1">סה&quot;כ רשומות</p>
            <h3 className="text-2xl font-bold text-slate-800">{expenses.length}</h3>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg text-blue-500">
            <Tag className="w-7 h-7" />
          </div>
        </div>
      </div>

      {/* Table */}
      {expenses.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm py-12 text-center">
          <p className="text-slate-400 text-sm">אין הוצאות רשומות</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <SortableHeader label="תאריך" field="date" currentField={sortField} currentDir={sortDir} onSort={handleSort} />
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">תיאור</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <SortableHeader label="קטגוריה" field="category" currentField={sortField} currentDir={sortDir} onSort={handleSort} />
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <SortableHeader label="סכום" field="amount" currentField={sortField} currentDir={sortDir} onSort={handleSort} />
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">אמצעי תשלום</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">פעולות</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sorted.map((expense) => (
                  <tr key={expense.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 text-sm text-slate-700">{formatDate(expense.date)}</td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-slate-900 max-w-[200px] truncate block">
                        {expense.description}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2.5 py-1 rounded-full text-xs font-bold",
                        categoryColors[expense.category] ?? "bg-slate-100 text-slate-600"
                      )}>
                        {categoryLabels[expense.category] ?? expense.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900">
                      ₪{expense.amount.toLocaleString("he-IL", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {paymentMethodLabels[expense.paymentMethod] ?? expense.paymentMethod}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditExpense(expense)}
                          disabled={isPending}
                          className="text-slate-400 hover:text-teal-600 transition-colors"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(expense.id)}
                          disabled={isPending}
                          className="text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
            <span className="text-xs text-slate-500 font-medium">
              מציג {sorted.length} מתוך {expenses.length} הוצאות
            </span>
          </div>
        </div>
      )}

      <AddExpenseDialog open={addOpen} onOpenChange={setAddOpen} />

      {editExpense && (
        <EditExpenseDialog
          expense={editExpense}
          open={!!editExpense}
          onOpenChange={(open) => { if (!open) setEditExpense(null); }}
        />
      )}
    </div>
  );
}
