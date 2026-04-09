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
import { Plus, Trash2 } from "lucide-react";
import { createPurchaseOrder } from "@/lib/actions/purchase-order-actions";

interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

interface CreatePurchaseOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  providerId: string;
}

const emptyItem = (): LineItem => ({ description: "", quantity: 1, unitPrice: 0 });

export function CreatePurchaseOrderDialog({
  open,
  onOpenChange,
  providerId,
}: CreatePurchaseOrderDialogProps) {
  const [items, setItems] = useState<LineItem[]>([emptyItem()]);
  const [notes, setNotes] = useState("");
  const [isPending, startTransition] = useTransition();

  const total = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  function updateItem(index: number, field: keyof LineItem, value: string) {
    setItems((prev) => {
      const copy = [...prev];
      if (field === "description") {
        copy[index] = { ...copy[index], description: value };
      } else if (field === "quantity") {
        copy[index] = { ...copy[index], quantity: parseInt(value) || 0 };
      } else {
        copy[index] = { ...copy[index], unitPrice: parseFloat(value) || 0 };
      }
      return copy;
    });
  }

  function addItem() {
    setItems((prev) => [...prev, emptyItem()]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validItems = items.filter((item) => item.description.trim() && item.unitPrice > 0);
    if (validItems.length === 0) return;

    startTransition(async () => {
      await createPurchaseOrder({
        providerId,
        items: validItems,
        notes: notes || undefined,
      });
      setItems([emptyItem()]);
      setNotes("");
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>הזמנת רכש חדשה</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Line Items */}
          <div className="space-y-2">
            <Label>פריטים</Label>
            {items.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={item.description}
                  onChange={(e) => updateItem(index, "description", e.target.value)}
                  placeholder="תיאור"
                  className="flex-1"
                  required
                />
                <Input
                  type="number"
                  value={item.quantity || ""}
                  onChange={(e) => updateItem(index, "quantity", e.target.value)}
                  placeholder="כמות"
                  className="w-20"
                  min="1"
                  required
                />
                <Input
                  type="number"
                  value={item.unitPrice || ""}
                  onChange={(e) => updateItem(index, "unitPrice", e.target.value)}
                  placeholder="מחיר ליחידה (₪)"
                  className="w-32"
                  min="0"
                  step="0.01"
                  required
                />
                <span className="text-sm text-slate-500 w-20 text-left">
                  ₪{(item.quantity * item.unitPrice).toLocaleString()}
                </span>
                {items.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(index)}
                    className="h-8 w-8 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addItem}
              className="mt-1"
            >
              <Plus className="h-4 w-4 ml-1" />
              הוסף פריט
            </Button>
          </div>

          {/* Total */}
          <div className="flex justify-between items-center px-2 py-3 bg-slate-50 rounded-lg">
            <span className="text-sm font-bold text-slate-700">סה״כ</span>
            <span className="text-lg font-bold text-slate-900">
              ₪{total.toLocaleString()}
            </span>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="po-notes">הערות</Label>
            <Textarea
              id="po-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="הערות להזמנה (אופציונלי)"
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
              {isPending ? "שומר..." : "צור הזמנת רכש"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
