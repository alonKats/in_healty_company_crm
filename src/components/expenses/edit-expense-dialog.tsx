"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateExpense } from "@/lib/actions/expense-actions";
import type { Expense } from "@/generated/prisma";

interface SerializedExpense extends Omit<Expense, "amount" | "date" | "createdAt" | "updatedAt"> {
  amount: number;
  date: string;
  createdAt: string;
  updatedAt: string;
}

interface EditExpenseDialogProps {
  expense: SerializedExpense;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function toDatetimeLocal(isoString: string): string {
  const d = new Date(isoString);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function EditExpenseDialog({ expense, open, onOpenChange }: EditExpenseDialogProps) {
  const [category, setCategory] = useState(expense.category);
  const [paymentMethod, setPaymentMethod] = useState(expense.paymentMethod);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    formData.set("category", category);
    formData.set("paymentMethod", paymentMethod);
    startTransition(async () => {
      await updateExpense(expense.id, formData);
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>עריכת הוצאה</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="edit-date">תאריך</Label>
              <Input
                id="edit-date"
                name="date"
                type="datetime-local"
                defaultValue={toDatetimeLocal(expense.date)}
                required
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="edit-description">תיאור *</Label>
              <Input
                id="edit-description"
                name="description"
                defaultValue={expense.description}
                placeholder="תיאור ההוצאה"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>קטגוריה</Label>
              <Select value={category} onValueChange={(v) => v && setCategory(v as typeof category)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SALARY">שכר</SelectItem>
                  <SelectItem value="RAW_MATERIALS">חומרי גלם</SelectItem>
                  <SelectItem value="RENT">שכירות</SelectItem>
                  <SelectItem value="TRAVEL">נסיעות</SelectItem>
                  <SelectItem value="MARKETING">שיווק</SelectItem>
                  <SelectItem value="EQUIPMENT">ציוד</SelectItem>
                  <SelectItem value="INSURANCE">ביטוח</SelectItem>
                  <SelectItem value="PROFESSIONAL_SERVICES">שירותים מקצועיים</SelectItem>
                  <SelectItem value="OTHER">אחר</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-amount">סכום (₪) *</Label>
              <Input
                id="edit-amount"
                name="amount"
                type="number"
                step="0.01"
                min="0"
                defaultValue={expense.amount}
                required
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>אמצעי תשלום</Label>
              <Select value={paymentMethod} onValueChange={(v) => v && setPaymentMethod(v as typeof paymentMethod)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">מזומן</SelectItem>
                  <SelectItem value="TRANSFER">העברה</SelectItem>
                  <SelectItem value="CREDIT_CARD">כרטיס אשראי</SelectItem>
                  <SelectItem value="CHECK">צ׳ק</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="edit-notes">הערות</Label>
              <Textarea
                id="edit-notes"
                name="notes"
                defaultValue={expense.notes ?? ""}
                placeholder="הערות נוספות (אופציונלי)"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              ביטול
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "שומר..." : "שמור שינויים"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
