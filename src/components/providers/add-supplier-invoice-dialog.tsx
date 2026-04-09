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
import { createSupplierInvoice } from "@/lib/actions/supplier-invoice-actions";

interface AddSupplierInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  providerId: string;
}

function todayDateValue(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export function AddSupplierInvoiceDialog({
  open,
  onOpenChange,
  providerId,
}: AddSupplierInvoiceDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayDateValue());
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!invoiceNumber.trim() || !amount) return;

    startTransition(async () => {
      await createSupplierInvoice({
        providerId,
        invoiceNumber: invoiceNumber.trim(),
        amount: parseFloat(amount),
        date,
        description: description || undefined,
        notes: notes || undefined,
      });
      // Reset
      setInvoiceNumber("");
      setAmount("");
      setDate(todayDateValue());
      setDescription("");
      setNotes("");
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>חשבונית ספק חדשה</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Invoice Number */}
            <div className="space-y-1.5">
              <Label htmlFor="invoiceNumber">מספר חשבונית *</Label>
              <Input
                id="invoiceNumber"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder="מספר חשבונית"
                required
              />
            </div>

            {/* Amount */}
            <div className="space-y-1.5">
              <Label htmlFor="inv-amount">סכום (₪) *</Label>
              <Input
                id="inv-amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                min="0"
                step="0.01"
                required
              />
            </div>

            {/* Date */}
            <div className="space-y-1.5">
              <Label htmlFor="inv-date">תאריך *</Label>
              <Input
                id="inv-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="inv-description">תיאור</Label>
            <Input
              id="inv-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="תיאור החשבונית"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="inv-notes">הערות</Label>
            <Textarea
              id="inv-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="הערות (אופציונלי)"
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              ביטול
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "שומר..." : "הוסף חשבונית"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
