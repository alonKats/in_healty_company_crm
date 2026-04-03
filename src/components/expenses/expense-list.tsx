"use client";

import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlusIcon, PencilIcon, TrashIcon } from "lucide-react";
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
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">הוצאות החודש</p>
            <p className="text-2xl font-bold mt-1">₪{monthTotal.toLocaleString("he-IL", { minimumFractionDigits: 2 })}</p>
          </CardContent>
        </Card>
        {lastMonth && (
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">חודש קודם ({lastMonth.month})</p>
              <p className="text-2xl font-bold mt-1">₪{lastMonth.total.toLocaleString("he-IL", { minimumFractionDigits: 2 })}</p>
            </CardContent>
          </Card>
        )}
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">סה״כ רשומות</p>
            <p className="text-2xl font-bold mt-1">{expenses.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Header + Add Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">רשימת הוצאות</h2>
        <button
          onClick={() => setAddOpen(true)}
          className={cn(buttonVariants({ variant: "default", size: "sm" }))}
        >
          <PlusIcon className="h-4 w-4 ml-1" />
          הוסף הוצאה
        </button>
      </div>

      {/* Table */}
      {expenses.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground text-sm">
            אין הוצאות רשומות
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">
                    <SortableHeader label="תאריך" field="date" currentField={sortField} currentDir={sortDir} onSort={handleSort} />
                  </TableHead>
                  <TableHead className="text-right">תיאור</TableHead>
                  <TableHead className="text-right">
                    <SortableHeader label="קטגוריה" field="category" currentField={sortField} currentDir={sortDir} onSort={handleSort} />
                  </TableHead>
                  <TableHead className="text-right">
                    <SortableHeader label="סכום" field="amount" currentField={sortField} currentDir={sortDir} onSort={handleSort} />
                  </TableHead>
                  <TableHead className="text-right">אמצעי תשלום</TableHead>
                  <TableHead className="text-right w-20">פעולות</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell className="text-sm">{formatDate(expense.date)}</TableCell>
                    <TableCell className="text-sm font-medium max-w-[200px] truncate">
                      {expense.description}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-blue-100 text-blue-700 border-blue-200">
                        {categoryLabels[expense.category] ?? expense.category}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      ₪{expense.amount.toLocaleString("he-IL", { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {paymentMethodLabels[expense.paymentMethod] ?? expense.paymentMethod}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditExpense(expense)}
                          disabled={isPending}
                        >
                          <PencilIcon className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(expense.id)}
                          disabled={isPending}
                        >
                          <TrashIcon className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
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
