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
import { Switch } from "@/components/ui/switch";
import { CostBreakdown, type CostItemData } from "./cost-breakdown";
import type { Category, CostItem, PackageItem, Service } from "@/generated/prisma";
import { PlusIcon, Trash2Icon } from "lucide-react";

interface PackageItemWithService extends PackageItem {
  service: Service;
}

interface ServiceWithRelations extends Service {
  category: Category;
  costItems: CostItem[];
  packageItems: PackageItemWithService[];
}

interface PackageItemInput {
  serviceId: string;
  quantity: number;
}

interface ServiceFormProps {
  categories: (Category & { children: Category[]; parent: Category | null })[];
  service?: ServiceWithRelations;
  allServices?: Service[]; // for picking package contents
  action: (formData: FormData) => Promise<void>;
  title: string;
}

export function ServiceForm({ categories, service, allServices = [], action, title }: ServiceFormProps) {
  const initialCostItems: CostItemData[] = service?.costItems.map((item) => ({
    description: item.description,
    amount: String(Number(item.amount)),
    type: item.type,
  })) ?? [];

  const initialPackageItems: PackageItemInput[] = service?.packageItems.map((pi) => ({
    serviceId: pi.serviceId,
    quantity: pi.quantity,
  })) ?? [];

  const [costItems, setCostItems] = useState<CostItemData[]>(initialCostItems);
  const [categoryId, setCategoryId] = useState(service?.categoryId ?? "");
  const [sourceType, setSourceType] = useState(service?.sourceType ?? "IN_HOUSE");
  const [status, setStatus] = useState(service?.status ?? "ACTIVE");
  const [isPackage, setIsPackage] = useState(service?.isPackage ?? false);
  const [packageItems, setPackageItems] = useState<PackageItemInput[]>(initialPackageItems);

  // Services that can be added as package components (exclude self, exclude other packages)
  const availableServices = allServices.filter(
    (s) => s.id !== service?.id && !s.isPackage && s.status === "ACTIVE"
  );

  function addPackageItem() {
    setPackageItems((prev) => [...prev, { serviceId: "", quantity: 1 }]);
  }

  function removePackageItem(index: number) {
    setPackageItems((prev) => prev.filter((_, i) => i !== index));
  }

  function updatePackageItem(index: number, field: keyof PackageItemInput, value: string | number | null) {
    setPackageItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: value ?? "" } : item
      )
    );
  }

  async function handleSubmit(formData: FormData) {
    formData.set("categoryId", categoryId);
    formData.set("sourceType", sourceType);
    if (service) {
      formData.set("status", status);
    }
    formData.set("costItems", JSON.stringify(costItems));
    formData.set("isPackage", String(isPackage));
    formData.set("packageItems", JSON.stringify(isPackage ? packageItems.filter((pi) => pi.serviceId) : []));
    await action(formData);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="name">שם המוצר / שירות</Label>
              <Input
                id="name"
                name="name"
                defaultValue={service?.name ?? ""}
                placeholder="הזן שם מוצר"
                required
              />
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <Label>קטגוריה</Label>
              <Select value={categoryId} onValueChange={(v) => v && setCategoryId(v)} required>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="בחר קטגוריה" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Source Type */}
            <div className="space-y-1.5">
              <Label>סוג מקור</Label>
              <Select value={sourceType} onValueChange={(v) => v && setSourceType(v as "IN_HOUSE" | "EXTERNAL_SUPPLIER")}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IN_HOUSE">מוצר בית</SelectItem>
                  <SelectItem value="EXTERNAL_SUPPLIER">ספק חיצוני</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Base Price */}
            <div className="space-y-1.5">
              <Label htmlFor="basePrice">מחיר בסיס (לפני מע&quot;מ) ₪</Label>
              <Input
                id="basePrice"
                name="basePrice"
                type="number"
                defaultValue={service ? String(Number(service.basePrice)) : ""}
                placeholder="0"
                min="0"
                step="0.01"
                required
              />
            </div>

            {/* Status — edit only */}
            {service && (
              <div className="space-y-1.5">
                <Label>סטטוס</Label>
                <Select value={status} onValueChange={(v) => v && setStatus(v as "ACTIVE" | "INACTIVE")}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">פעיל</SelectItem>
                    <SelectItem value="INACTIVE">לא פעיל</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description">תיאור</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={service?.description ?? ""}
              placeholder="תיאור קצר של המוצר או השירות"
              rows={3}
            />
          </div>

          {/* Package Toggle */}
          <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50">
            <Switch
              id="isPackage"
              checked={isPackage}
              onCheckedChange={setIsPackage}
            />
            <div>
              <Label htmlFor="isPackage" className="font-semibold cursor-pointer">חבילה</Label>
              <p className="text-xs text-slate-500 mt-0.5">
                {isPackage ? "שירות זה הוא חבילה הכוללת מספר שירותים" : "הפעל אם שירות זה הוא חבילה של מספר שירותים"}
              </p>
            </div>
          </div>

          {/* Package Contents — shown only when isPackage is on */}
          {isPackage && (
            <div className="border rounded-lg p-4 space-y-3 bg-teal-50/40 border-teal-200">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-bold text-teal-800">שירותים בחבילה</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addPackageItem}
                  className="text-teal-700 border-teal-300 hover:bg-teal-100"
                >
                  <PlusIcon className="h-4 w-4 ml-1" />
                  הוסף שירות
                </Button>
              </div>

              {packageItems.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-2">
                  לחץ &quot;הוסף שירות&quot; כדי להוסיף שירותים לחבילה
                </p>
              ) : (
                <div className="space-y-2">
                  {packageItems.map((pi, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <div className="flex-1">
                        <Select
                          value={pi.serviceId}
                          onValueChange={(v) => updatePackageItem(index, "serviceId", v)}
                        >
                          <SelectTrigger className="w-full bg-white">
                            <SelectValue placeholder="בחר שירות" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableServices.map((s) => (
                              <SelectItem key={s.id} value={s.id}>
                                {s.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="w-24">
                        <Input
                          type="number"
                          min="1"
                          value={pi.quantity}
                          onChange={(e) => updatePackageItem(index, "quantity", parseInt(e.target.value) || 1)}
                          className="bg-white text-center"
                          placeholder="כמות"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removePackageItem(index)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0"
                      >
                        <Trash2Icon className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <p className="text-xs text-slate-500 mt-1">כמות = מספר יחידות של כל שירות בחבילה</p>
                </div>
              )}
            </div>
          )}

          {/* Cost Breakdown */}
          <div className="border rounded-lg p-4">
            <CostBreakdown initialItems={initialCostItems} onChange={setCostItems} />
          </div>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => history.back()}>
              ביטול
            </Button>
            <Button type="submit">
              {service ? "שמור שינויים" : "צור מוצר"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
