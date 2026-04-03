"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Trash2Icon, PlusIcon } from "lucide-react";
import type { Client, User, Service, Category, CostItem } from "@/generated/prisma";

interface ServiceWithRelations extends Service {
  category: Category;
  costItems: CostItem[];
}

interface QuoteFormProps {
  clients: Pick<Client, "id" | "name" | "company">[];
  users: Pick<User, "id" | "name">[];
  services: ServiceWithRelations[];
  defaultClientId?: string;
  action: (formData: FormData) => Promise<void>;
}

interface LineItem {
  id: string;
  serviceId: string;
  category: string;
  description: string;
  quantity: number;
  unitPrice: number;
  costPerUnit: number | null;
  notes: string;
  sortOrder: number;
}

function emptyItem(sortOrder: number): LineItem {
  return {
    id: crypto.randomUUID(),
    serviceId: "",
    category: "",
    description: "",
    quantity: 1,
    unitPrice: 0,
    costPerUnit: null,
    notes: "",
    sortOrder,
  };
}

export function QuoteForm({
  clients,
  users,
  services,
  defaultClientId,
  action,
}: QuoteFormProps) {
  const [clientId, setClientId] = useState(defaultClientId ?? "");
  const [assignedToId, setAssignedToId] = useState("");
  const [source, setSource] = useState("OUTBOUND");
  const [lineItems, setLineItems] = useState<LineItem[]>([emptyItem(0)]);

  function addItem() {
    setLineItems((prev) => [...prev, emptyItem(prev.length)]);
  }

  function removeItem(id: string) {
    setLineItems((prev) =>
      prev
        .filter((item) => item.id !== id)
        .map((item, i) => ({ ...item, sortOrder: i }))
    );
  }

  function updateItem(id: string, updates: Partial<LineItem>) {
    setLineItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  }

  function handleServiceSelect(itemId: string, serviceId: string) {
    if (!serviceId) {
      updateItem(itemId, { serviceId: "" });
      return;
    }
    const svc = services.find((s) => s.id === serviceId);
    if (!svc) return;

    const totalCost = svc.costItems.reduce((sum, ci) => sum + Number(ci.amount), 0);

    updateItem(itemId, {
      serviceId,
      category: svc.category.name,
      description: svc.name,
      unitPrice: Number(svc.basePrice),
      costPerUnit: totalCost > 0 ? totalCost : null,
    });
  }

  const grandTotal = lineItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );

  async function handleSubmit(formData: FormData) {
    formData.set("clientId", clientId);
    formData.set("assignedToId", assignedToId);
    formData.set("source", source);
    formData.set(
      "items",
      JSON.stringify(
        lineItems.map(({ id: _id, ...rest }) => rest)
      )
    );
    await action(formData);
  }

  return (
    <form action={handleSubmit} className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle>הצעת מחיר חדשה</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {/* Client */}
          <div className="space-y-1.5">
            <Label>לקוח *</Label>
            <Select value={clientId} onValueChange={(v) => v && setClientId(v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="בחר לקוח" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                    {c.company ? ` — ${c.company}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Assigned to */}
          <div className="space-y-1.5">
            <Label>אחראי</Label>
            <Select value={assignedToId} onValueChange={(v) => setAssignedToId(v ?? "")}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="בחר אחראי" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">ללא</SelectItem>
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Source */}
          <div className="space-y-1.5">
            <Label>מקור</Label>
            <Select value={source} onValueChange={(v) => v && setSource(v)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="OUTBOUND">פניה יזומה</SelectItem>
                <SelectItem value="INBOUND">פניית לקוח</SelectItem>
                <SelectItem value="REFERRAL">הפניה</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Event date */}
          <div className="space-y-1.5">
            <Label htmlFor="eventDate">תאריך אירוע</Label>
            <Input id="eventDate" name="eventDate" type="date" />
          </div>

          {/* Valid until */}
          <div className="space-y-1.5">
            <Label htmlFor="validUntil">תוקף הצעה עד</Label>
            <Input id="validUntil" name="validUntil" type="date" />
          </div>
        </CardContent>
      </Card>

      {/* Line Items */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>פריטים</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addItem}>
              <PlusIcon className="h-4 w-4 ml-1" />
              הוסף פריט
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {lineItems.map((item) => {
            const lineTotal = item.quantity * item.unitPrice;
            const margin =
              item.costPerUnit && item.unitPrice > 0
                ? Math.round(((item.unitPrice - item.costPerUnit) / item.unitPrice) * 100)
                : null;

            return (
              <div
                key={item.id}
                className="border rounded-lg p-4 space-y-3 relative"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-muted-foreground">
                    פריט {item.sortOrder + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                    aria-label="הסר פריט"
                  >
                    <Trash2Icon className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {/* Service picker */}
                  <div className="space-y-1.5">
                    <Label>שירות (אופציונלי)</Label>
                    <Select
                      value={item.serviceId}
                      onValueChange={(v) => handleServiceSelect(item.id, v ?? "")}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="בחר שירות" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">ללא שירות</SelectItem>
                        {services.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Category */}
                  <div className="space-y-1.5">
                    <Label>קטגוריה</Label>
                    <Input
                      value={item.category}
                      onChange={(e) => updateItem(item.id, { category: e.target.value })}
                      placeholder="קטגוריה"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label>תיאור *</Label>
                    <Input
                      value={item.description}
                      onChange={(e) => updateItem(item.id, { description: e.target.value })}
                      placeholder="תיאור הפריט"
                      required
                    />
                  </div>

                  {/* Quantity */}
                  <div className="space-y-1.5">
                    <Label>כמות</Label>
                    <Input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(item.id, { quantity: Math.max(1, Number(e.target.value)) })
                      }
                    />
                  </div>

                  {/* Unit price */}
                  <div className="space-y-1.5">
                    <Label>מחיר יחידה ₪</Label>
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      value={item.unitPrice}
                      onChange={(e) =>
                        updateItem(item.id, { unitPrice: Number(e.target.value) })
                      }
                    />
                  </div>

                  {/* Notes */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label>הערות (כמות, משך, כושר)</Label>
                    <Input
                      value={item.notes}
                      onChange={(e) => updateItem(item.id, { notes: e.target.value })}
                      placeholder="הערות לפריט"
                    />
                  </div>
                </div>

                {/* Line totals */}
                <div className="flex items-center gap-4 text-sm pt-1">
                  <span className="font-medium">
                    סה&quot;כ פריט: ₪{lineTotal.toLocaleString()}
                  </span>
                  {margin !== null && (
                    <span className="text-muted-foreground">
                      מרווח: {margin}%
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {/* Grand total */}
          <div className="flex justify-end pt-2 border-t">
            <span className="text-lg font-bold">
              סה&quot;כ: ₪{grandTotal.toLocaleString()}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>הערות ותנאים</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="notes">הערות</Label>
            <Textarea
              id="notes"
              name="notes"
              rows={3}
              placeholder="הערות להצעה"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="terms">תנאים</Label>
            <Textarea
              id="terms"
              name="terms"
              rows={3}
              placeholder="תנאי תשלום ומסירה"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={() => history.back()}>
          ביטול
        </Button>
        <Button type="submit" disabled={lineItems.length === 0 || !clientId}>
          צור הצעת מחיר
        </Button>
      </div>
    </form>
  );
}
