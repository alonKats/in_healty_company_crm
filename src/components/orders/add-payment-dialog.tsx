"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlusIcon } from "lucide-react";
import { addPayment } from "@/lib/actions/order-actions";

interface AddPaymentDialogProps {
  orderId: string;
}

export function AddPaymentDialog({ orderId }: AddPaymentDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [method, setMethod] = useState("TRANSFER");
  const [status, setStatus] = useState("PAID");

  function handleSubmit(formData: FormData) {
    formData.set("method", method);
    formData.set("status", status);
    startTransition(async () => {
      await addPayment(orderId, formData);
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm">
            <PlusIcon className="h-4 w-4 ml-1" />
            הוסף תשלום
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>הוספת תשלום</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          {/* Amount */}
          <div className="space-y-1.5">
            <Label htmlFor="amount">סכום ₪ *</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              min={0}
              step={0.01}
              required
              placeholder="0.00"
            />
          </div>

          {/* Method */}
          <div className="space-y-1.5">
            <Label>אמצעי תשלום</Label>
            <Select value={method} onValueChange={(v) => v && setMethod(v)}>
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

          {/* Date */}
          <div className="space-y-1.5">
            <Label htmlFor="date">תאריך *</Label>
            <Input
              id="date"
              name="date"
              type="date"
              required
              defaultValue={new Date().toISOString().split("T")[0]}
            />
          </div>

          {/* Invoice number */}
          <div className="space-y-1.5">
            <Label htmlFor="invoiceNumber">מספר חשבונית (אופציונלי)</Label>
            <Input
              id="invoiceNumber"
              name="invoiceNumber"
              type="text"
              placeholder="INV-001"
            />
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <Label>סטטוס</Label>
            <Select value={status} onValueChange={(v) => v && setStatus(v)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">ממתין</SelectItem>
                <SelectItem value="PAID">שולם</SelectItem>
                <SelectItem value="PARTIAL">חלקי</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="notes">הערות (אופציונלי)</Label>
            <Textarea
              id="notes"
              name="notes"
              rows={2}
              placeholder="הערות לתשלום"
            />
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              ביטול
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "שומר..." : "הוסף תשלום"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
