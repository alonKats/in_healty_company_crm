"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { updatePayment } from "@/lib/actions/order-actions";
import type { Payment } from "@/generated/prisma";

interface EditPaymentDialogProps {
  payment: Payment;
  orderId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function toDateValue(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().split("T")[0];
}

export function EditPaymentDialog({ payment, orderId, open, onOpenChange }: EditPaymentDialogProps) {
  const [method, setMethod] = useState(payment.method);
  const [status, setStatus] = useState(payment.status);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    formData.set("method", method);
    formData.set("status", status);
    startTransition(async () => {
      await updatePayment(payment.id, orderId, formData);
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>עריכת תשלום</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="edit-amount">סכום ₪ *</Label>
            <Input id="edit-amount" name="amount" type="number" min={0} step={0.01} required defaultValue={Number(payment.amount)} />
          </div>
          <div className="space-y-1.5">
            <Label>אמצעי תשלום</Label>
            <Select value={method} onValueChange={(v) => v && setMethod(v as typeof method)}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="CASH">מזומן</SelectItem>
                <SelectItem value="TRANSFER">העברה</SelectItem>
                <SelectItem value="CREDIT_CARD">כרטיס אשראי</SelectItem>
                <SelectItem value="CHECK">צ׳ק</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-date">תאריך *</Label>
            <Input id="edit-date" name="date" type="date" required defaultValue={toDateValue(payment.date)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-invoiceNumber">מספר חשבונית</Label>
            <Input id="edit-invoiceNumber" name="invoiceNumber" defaultValue={payment.invoiceNumber ?? ""} />
          </div>
          <div className="space-y-1.5">
            <Label>סטטוס</Label>
            <Select value={status} onValueChange={(v) => v && setStatus(v as typeof status)}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">ממתין</SelectItem>
                <SelectItem value="PAID">שולם</SelectItem>
                <SelectItem value="PARTIAL">חלקי</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-notes">הערות</Label>
            <Textarea id="edit-notes" name="notes" rows={2} defaultValue={payment.notes ?? ""} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>ביטול</Button>
            <Button type="submit" disabled={isPending}>{isPending ? "שומר..." : "שמור"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
