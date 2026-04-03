"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
import { PlusIcon } from "lucide-react";
import { createLeadQuick } from "@/lib/actions/client-actions";

const serviceChips = [
  { value: "קייטרינג", label: "קייטרינג" },
  { value: "סדנה", label: "סדנה" },
  { value: "הרצאה", label: "הרצאה" },
  { value: "בדיקות", label: "בדיקות" },
  { value: "חבילה", label: "חבילה" },
];

export function QuickAddLead() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const router = useRouter();

  function toggleService(value: string) {
    setSelectedServices((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  }

  async function handleSubmit(formData: FormData) {
    formData.set("serviceInterest", selectedServices.join(", "));
    startTransition(async () => {
      await createLeadQuick(formData);
      setOpen(false);
      setSelectedServices([]);
      router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-1.5 text-sm font-bold text-white shadow-sm hover:bg-teal-700 transition-colors"
      >
        <PlusIcon className="h-4 w-4" />
        ליד חדש
      </button>

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setSelectedServices([]); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>הוספת ליד חדש</DialogTitle>
          </DialogHeader>
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="lead-name">שם *</Label>
              <Input
                id="lead-name"
                name="name"
                placeholder="שם הלקוח"
                required
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lead-company">חברה</Label>
              <Input
                id="lead-company"
                name="company"
                placeholder="שם החברה (אופציונלי)"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lead-phone">טלפון</Label>
              <Input
                id="lead-phone"
                name="phone"
                type="tel"
                placeholder="מספר טלפון (אופציונלי)"
                dir="ltr"
              />
            </div>
            <div className="space-y-1.5">
              <Label>מתעניין ב</Label>
              <div className="flex flex-wrap gap-2">
                {serviceChips.map((chip) => (
                  <button
                    key={chip.value}
                    type="button"
                    onClick={() => toggleService(chip.value)}
                    className={`text-sm px-3 py-1 rounded-full border transition-colors ${
                      selectedServices.includes(chip.value)
                        ? "bg-teal-600 text-white border-teal-600"
                        : "bg-white text-slate-600 border-slate-300 hover:border-teal-400"
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lead-note">הערה</Label>
              <Textarea
                id="lead-note"
                name="note"
                placeholder="הערה קצרה (אופציונלי)"
                rows={2}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                ביטול
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="bg-teal-600 text-white hover:bg-teal-700"
              >
                {isPending ? "שומר..." : "הוסף ליד"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
