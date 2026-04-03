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

export function QuickAddLead() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await createLeadQuick(formData);
      setOpen(false);
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

      <Dialog open={open} onOpenChange={setOpen}>
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
