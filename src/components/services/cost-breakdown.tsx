"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusIcon, TrashIcon } from "lucide-react";

export interface CostItemData {
  description: string;
  amount: string;
  type: "FIXED" | "PER_UNIT";
}

interface CostBreakdownProps {
  initialItems?: CostItemData[];
  onChange: (items: CostItemData[]) => void;
}

export function CostBreakdown({ initialItems = [], onChange }: CostBreakdownProps) {
  const [items, setItems] = useState<CostItemData[]>(initialItems);

  function addItem() {
    const newItems = [...items, { description: "", amount: "", type: "FIXED" as const }];
    setItems(newItems);
    onChange(newItems);
  }

  function removeItem(index: number) {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    onChange(newItems);
  }

  function updateItem(index: number, field: keyof CostItemData, value: string) {
    const newItems = items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    setItems(newItems);
    onChange(newItems);
  }

  const total = items.reduce((sum, item) => {
    const amount = parseFloat(item.amount) || 0;
    return sum + amount;
  }, 0);

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">פירוט עלויות (אופציונלי)</Label>

      {items.length > 0 && (
        <div className="space-y-2">
          <div className="grid grid-cols-[1fr_120px_120px_36px] gap-2 text-xs text-muted-foreground px-1">
            <span>תיאור</span>
            <span>סכום (₪)</span>
            <span>סוג</span>
            <span />
          </div>
          {items.map((item, index) => (
            <div key={index} className="grid grid-cols-[1fr_120px_120px_36px] gap-2 items-center">
              <Input
                value={item.description}
                onChange={(e) => updateItem(index, "description", e.target.value)}
                placeholder="תיאור עלות"
                className="h-8 text-sm"
              />
              <Input
                type="number"
                value={item.amount}
                onChange={(e) => updateItem(index, "amount", e.target.value)}
                placeholder="0"
                min="0"
                step="0.01"
                className="h-8 text-sm"
              />
              <Select
                value={item.type}
                onValueChange={(value) => value && updateItem(index, "type", value)}
              >
                <SelectTrigger className="h-8 text-sm w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FIXED">קבוע</SelectItem>
                  <SelectItem value="PER_UNIT">ליחידה</SelectItem>
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => removeItem(index)}
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <Button type="button" variant="outline" size="sm" onClick={addItem}>
        <PlusIcon className="h-4 w-4 ml-1" />
        הוסף עלות
      </Button>

      {items.length > 0 && (
        <div className="flex justify-end border-t pt-2">
          <span className="text-sm font-medium">
            סה&quot;כ עלות: ₪{total.toFixed(2)}
          </span>
        </div>
      )}
    </div>
  );
}
