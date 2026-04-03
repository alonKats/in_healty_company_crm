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
import { createExpense } from "@/lib/actions/expense-actions";

interface AddExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function todayDateValue(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

export function AddExpenseDialog({ open, onOpenChange }: AddExpenseDialogProps) {
  const [category, setCategory] = useState("OTHER");
  const [paymentMethod, setPaymentMethod] = useState("TRANSFER");
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    formData.set("category", category);
    formData.set("paymentMethod", paymentMethod);
    startTransition(async () => {
      await createExpense(formData);
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>הוספת הוצאה</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="date">תאריך</Label>
              <Input
                id="date"
                name="date"
                type="datetime-local"
                defaultValue={todayDateValue()}
                required
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="description">תיאור *</Label>
              <Input
                id="description"
                name="description"
                placeholder="תיאור ההוצאה"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>קטגוריה</Label>
              <Select value={category} onValueChange={(v) => v && setCategory(v)}>
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
              <Label htmlFor="amount">סכום (₪) *</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                required
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>אמצעי תשלום</Label>
              <Select value={paymentMethod} onValueChange={(v) => v && setPaymentMethod(v)}>
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
              <Label htmlFor="notes">הערות</Label>
              <Textarea
                id="notes"
                name="notes"
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
              {isPending ? "שומר..." : "הוסף הוצאה"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
