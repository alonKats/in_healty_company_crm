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
import type {
  Provider,
  ProviderService,
  Service,
  Category,
  FeeType,
} from "@/generated/prisma";

interface ProviderServiceWithRelations extends ProviderService {
  service: Service & { category: Category };
}

interface ProviderWithRelations extends Provider {
  services: ProviderServiceWithRelations[];
}

interface ServiceWithCategory extends Service {
  category: Category;
}

interface ProviderFormProps {
  allServices: ServiceWithCategory[];
  provider?: ProviderWithRelations;
  action: (formData: FormData) => Promise<void>;
  title: string;
}

interface ServiceSelection {
  serviceId: string;
  fee: string;
}

export function ProviderForm({ allServices, provider, action, title }: ProviderFormProps) {
  const initialSelections: Record<string, ServiceSelection> = {};
  if (provider) {
    for (const ps of provider.services) {
      initialSelections[ps.serviceId] = {
        serviceId: ps.serviceId,
        fee: ps.fee ? String(Number(ps.fee)) : "",
      };
    }
  }

  const [selectedServices, setSelectedServices] = useState<Record<string, ServiceSelection>>(initialSelections);
  const [feeType, setFeeType] = useState<string>(provider?.feeType ?? "PER_EVENT");
  const [isActive, setIsActive] = useState(provider?.isActive ?? true);

  // Group services by category
  const grouped = allServices.reduce<Record<string, ServiceWithCategory[]>>((acc, service) => {
    const catName = service.category.name;
    if (!acc[catName]) acc[catName] = [];
    acc[catName].push(service);
    return acc;
  }, {});

  function toggleService(serviceId: string) {
    setSelectedServices((prev) => {
      const copy = { ...prev };
      if (copy[serviceId]) {
        delete copy[serviceId];
      } else {
        copy[serviceId] = { serviceId, fee: "" };
      }
      return copy;
    });
  }

  function updateServiceFee(serviceId: string, fee: string) {
    setSelectedServices((prev) => ({
      ...prev,
      [serviceId]: { ...prev[serviceId], fee },
    }));
  }

  async function handleSubmit(formData: FormData) {
    formData.set("feeType", feeType);
    if (provider) {
      formData.set("isActive", String(isActive));
    }

    const servicesPayload = Object.values(selectedServices).map((s) => ({
      serviceId: s.serviceId,
      fee: s.fee ? parseFloat(s.fee) : null,
    }));
    formData.set("services", JSON.stringify(servicesPayload));

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
              <Label htmlFor="name">שם הספק</Label>
              <Input
                id="name"
                name="name"
                defaultValue={provider?.name ?? ""}
                placeholder="הזן שם ספק"
                required
              />
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <Label htmlFor="phone">טלפון</Label>
              <Input
                id="phone"
                name="phone"
                defaultValue={provider?.phone ?? ""}
                placeholder="050-0000000"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email">אימייל</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={provider?.email ?? ""}
                placeholder="email@example.com"
              />
            </div>

            {/* Specialty */}
            <div className="space-y-1.5">
              <Label htmlFor="specialty">התמחות</Label>
              <Input
                id="specialty"
                name="specialty"
                defaultValue={provider?.specialty ?? ""}
                placeholder="תחום התמחות"
              />
            </div>

            {/* Fee Type */}
            <div className="space-y-1.5">
              <Label>סוג תעריף</Label>
              <Select value={feeType} onValueChange={(v) => v && setFeeType(v)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PER_EVENT">לאירוע</SelectItem>
                  <SelectItem value="PER_HOUR">לשעה</SelectItem>
                  <SelectItem value="PER_PARTICIPANT">למשתתף</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Default Fee */}
            <div className="space-y-1.5">
              <Label htmlFor="defaultFee">תעריף ברירת מחדל (₪)</Label>
              <Input
                id="defaultFee"
                name="defaultFee"
                type="number"
                defaultValue={provider?.defaultFee ? String(Number(provider.defaultFee)) : ""}
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>

            {/* Status — edit only */}
            {provider && (
              <div className="space-y-1.5">
                <Label>סטטוס</Label>
                <Select
                  value={isActive ? "active" : "inactive"}
                  onValueChange={(v) => setIsActive(v === "active")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">פעיל</SelectItem>
                    <SelectItem value="inactive">לא פעיל</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="notes">הערות</Label>
            <Textarea
              id="notes"
              name="notes"
              defaultValue={provider?.notes ?? ""}
              placeholder="הערות על הספק"
              rows={3}
            />
          </div>

          {/* Service Linkage */}
          <div className="border rounded-lg p-4 space-y-4">
            <Label className="text-sm font-medium">שירותים מקושרים</Label>
            <p className="text-xs text-slate-500">סמן שירותים שהספק מספק, והזן תעריף ספציפי לשירות (אופציונלי)</p>

            {Object.entries(grouped).map(([categoryName, services]) => (
              <div key={categoryName} className="space-y-2">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {categoryName}
                </h4>
                <div className="space-y-1.5">
                  {services.map((service) => {
                    const isSelected = !!selectedServices[service.id];
                    return (
                      <div key={service.id} className="flex items-center gap-3">
                        <label className="flex items-center gap-2 cursor-pointer min-w-[200px]">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleService(service.id)}
                            className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                          />
                          <span className="text-sm text-slate-700">{service.name}</span>
                        </label>
                        {isSelected && (
                          <Input
                            type="number"
                            value={selectedServices[service.id]?.fee ?? ""}
                            onChange={(e) => updateServiceFee(service.id, e.target.value)}
                            placeholder="תעריף ספציפי (₪)"
                            min="0"
                            step="0.01"
                            className="h-8 text-sm w-40"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => history.back()}>
              ביטול
            </Button>
            <Button type="submit">
              {provider ? "שמור שינויים" : "צור ספק"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
