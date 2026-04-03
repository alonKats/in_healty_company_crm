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
import { CostBreakdown, type CostItemData } from "./cost-breakdown";
import type { Category, CostItem, Service } from "@/generated/prisma";

interface ServiceWithRelations extends Service {
  category: Category;
  costItems: CostItem[];
}

interface ServiceFormProps {
  categories: (Category & { children: Category[]; parent: Category | null })[];
  service?: ServiceWithRelations;
  action: (formData: FormData) => Promise<void>;
  title: string;
}

export function ServiceForm({ categories, service, action, title }: ServiceFormProps) {
  const initialCostItems: CostItemData[] = service?.costItems.map((item) => ({
    description: item.description,
    amount: String(Number(item.amount)),
    type: item.type,
  })) ?? [];

  const [costItems, setCostItems] = useState<CostItemData[]>(initialCostItems);
  const [categoryId, setCategoryId] = useState(service?.categoryId ?? "");
  const [sourceType, setSourceType] = useState(service?.sourceType ?? "IN_HOUSE");
  const [status, setStatus] = useState(service?.status ?? "ACTIVE");

  async function handleSubmit(formData: FormData) {
    formData.set("categoryId", categoryId);
    formData.set("sourceType", sourceType);
    if (service) {
      formData.set("status", status);
    }
    formData.set("costItems", JSON.stringify(costItems));
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
