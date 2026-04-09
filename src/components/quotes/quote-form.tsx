"use client";

import { useState, useRef, useEffect } from "react";
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

// Searchable combobox for client/service pickers
interface SearchableSelectProps {
  items: { id: string; label: string }[];
  value: string;
  onSelect: (id: string) => void;
  placeholder?: string;
  clearLabel?: string;
}

function SearchableSelect({ items, value, onSelect, placeholder = "הקלד לחיפוש...", clearLabel }: SearchableSelectProps) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selectedLabel = items.find((i) => i.id === value)?.label ?? "";

  const filtered = items.filter((item) =>
    item.label.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <input
        type="text"
        value={open ? search : selectedLabel}
        onChange={(e) => { setSearch(e.target.value); setOpen(true); }}
        onFocus={() => { setOpen(true); setSearch(""); }}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
      />
      {open && (
        <div className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
          {clearLabel && (
            <button
              type="button"
              onClick={() => { onSelect(""); setOpen(false); setSearch(""); }}
              className="w-full text-right px-3 py-2 text-sm text-slate-400 hover:bg-slate-50"
            >
              {clearLabel}
            </button>
          )}
          {filtered.length === 0 ? (
            <div className="px-3 py-2 text-sm text-slate-400">לא נמצאו תוצאות</div>
          ) : (
            filtered.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => { onSelect(item.id); setOpen(false); setSearch(""); }}
                className={`w-full text-right px-3 py-2 text-sm hover:bg-teal-50 ${item.id === value ? "bg-teal-50 font-medium text-teal-700" : "text-slate-800"}`}
              >
                {item.label}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

interface ServiceWithRelations extends Service {
  category: Category;
  costItems: CostItem[];
}

interface InitialQuoteData {
  id: string;
  clientId: string;
  assignedToId: string | null;
  source: string;
  eventDate: string | null;
  validUntil: string | null;
  notes: string | null;
  terms: string | null;
  paymentTerms: string | null;
  items: {
    serviceId: string | null;
    category: string | null;
    description: string;
    quantity: number;
    unitPrice: number;
    costPerUnit: number | null;
    notes: string | null;
    sortOrder: number;
  }[];
}

interface QuoteFormProps {
  clients: Pick<Client, "id" | "name" | "company">[];
  users: Pick<User, "id" | "name">[];
  services: ServiceWithRelations[];
  defaultClientId?: string;
  action: (formData: FormData) => Promise<void>;
  initialData?: InitialQuoteData;
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
  initialData,
}: QuoteFormProps) {
  const isEditing = !!initialData;
  const [clientId, setClientId] = useState(initialData?.clientId ?? defaultClientId ?? "");
  const [assignedToId, setAssignedToId] = useState(initialData?.assignedToId ?? "");
  const [source, setSource] = useState(initialData?.source ?? "OUTBOUND");
  const [paymentTerms, setPaymentTerms] = useState(initialData?.paymentTerms ?? "");
  const [lineItems, setLineItems] = useState<LineItem[]>(
    initialData?.items?.length
      ? initialData.items.map((item, i) => ({
          id: crypto.randomUUID(),
          serviceId: item.serviceId ?? "",
          category: item.category ?? "",
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          costPerUnit: item.costPerUnit,
          notes: item.notes ?? "",
          sortOrder: item.sortOrder ?? i,
        }))
      : [emptyItem(0)]
  );

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
    formData.set("paymentTerms", paymentTerms);
    formData.set(
      "items",
      JSON.stringify(
        lineItems.map(({ id: _id, ...rest }) => rest)
      )
    );
    await action(formData);
  }

  return (
    <form action={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {isEditing ? "עריכת הצעת מחיר" : "הצעת מחיר חדשה"}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {isEditing ? "עדכון פרטי הצעת המחיר" : "יצירת הצעת מחיר חדשה עבור לקוחות החברה"}
          </p>
        </div>
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={() => history.back()} className="border-slate-300 text-slate-600 rounded-lg hover:bg-slate-100 font-medium">
            ביטול
          </Button>
          <Button type="submit" disabled={lineItems.length === 0 || !clientId} className="bg-teal-600 text-white rounded-lg hover:bg-teal-700 shadow-lg shadow-teal-600/20 font-bold px-8">
            {isEditing ? "עדכון הצעה" : "שמירת הצעה"}
          </Button>
        </div>
      </div>

      {/* Quote Details Card */}
      <Card className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100 pb-4">
          <CardTitle className="text-teal-600 flex items-center gap-2 text-lg">
            {isEditing ? "עריכת הצעת מחיר" : "הצעת מחיר חדשה"}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 pt-6">
          {/* Client */}
          <div className="space-y-1.5">
            <Label>לקוח *</Label>
            <SearchableSelect
              items={clients.map((c) => ({ id: c.id, label: c.name + (c.company ? ` — ${c.company}` : "") }))}
              value={clientId}
              onSelect={(id) => setClientId(id)}
              placeholder="הקלד שם לקוח..."
            />
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
            <Input id="eventDate" name="eventDate" type="date" defaultValue={initialData?.eventDate ? initialData.eventDate.slice(0, 10) : ""} />
          </div>

          {/* Valid until */}
          <div className="space-y-1.5">
            <Label htmlFor="validUntil">תוקף הצעה עד</Label>
            <Input id="validUntil" name="validUntil" type="date" defaultValue={initialData?.validUntil ? initialData.validUntil.slice(0, 10) : ""} />
          </div>
        </CardContent>
      </Card>

      {/* Line Items */}
      <Card className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="border-b border-slate-100 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-teal-600 flex items-center gap-2 text-lg">פריטים</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addItem} className="text-teal-600 hover:text-teal-700 font-bold text-sm bg-teal-50 border-teal-200 hover:bg-teal-100 rounded-lg">
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
                    <SearchableSelect
                      items={services.map((s) => ({ id: s.id, label: s.name }))}
                      value={item.serviceId}
                      onSelect={(id) => handleServiceSelect(item.id, id)}
                      placeholder="הקלד שם שירות..."
                      clearLabel="ללא שירות"
                    />
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
          <div className="bg-teal-600 p-5 flex justify-between items-center text-white rounded-lg mt-2">
            <div className="text-sm font-medium opacity-90">סך הכל לפני מע&quot;מ</div>
            <div className="text-2xl font-black tracking-tight">סה&quot;כ: ₪{grandTotal.toLocaleString()}</div>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100 pb-4">
          <CardTitle className="text-slate-700 text-lg">הערות ותנאים</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="paymentTerms">תנאי תשלום</Label>
            <Input
              id="paymentTerms"
              list="payment-terms-options"
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
              placeholder="בחר או הקלד תנאי תשלום"
            />
            <datalist id="payment-terms-options">
              <option value="מזומן" />
              <option value="שוטף + 30" />
              <option value="שוטף + 60" />
              <option value="שוטף + 90" />
            </datalist>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="notes">הערות</Label>
            <Textarea
              id="notes"
              name="notes"
              rows={3}
              placeholder="הערות להצעה"
              defaultValue={initialData?.notes ?? ""}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="terms">תנאים</Label>
            <Textarea
              id="terms"
              name="terms"
              rows={3}
              placeholder="תנאי תשלום ומסירה"
              defaultValue={initialData?.terms ?? ""}
            />
          </div>
        </CardContent>
      </Card>

    </form>
  );
}
