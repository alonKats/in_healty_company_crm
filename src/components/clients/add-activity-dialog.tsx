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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createActivity } from "@/lib/actions/activity-actions";

interface AddActivityDialogProps {
  clientId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function nowLocalDatetimeValue(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

export function AddActivityDialog({ clientId, open, onOpenChange }: AddActivityDialogProps) {
  const [type, setType] = useState("CALL");
  const [direction, setDirection] = useState("OUTBOUND");
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    formData.set("type", type);
    formData.set("direction", direction);
    startTransition(async () => {
      await createActivity(clientId, formData);
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>פעילות חדשה</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>סוג פעילות</Label>
              <Select value={type} onValueChange={(v) => v && setType(v)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CALL">שיחה</SelectItem>
                  <SelectItem value="EMAIL">מייל</SelectItem>
                  <SelectItem value="WHATSAPP">וואטסאפ</SelectItem>
                  <SelectItem value="MEETING">פגישה</SelectItem>
                  <SelectItem value="NOTE">הערה</SelectItem>
                  <SelectItem value="MAILING">דיוור</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>כיוון</Label>
              <Select value={direction} onValueChange={(v) => v && setDirection(v)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INBOUND">נכנס</SelectItem>
                  <SelectItem value="OUTBOUND">יוצא</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="date">תאריך ושעה</Label>
              <Input
                id="date"
                name="date"
                type="datetime-local"
                defaultValue={nowLocalDatetimeValue()}
                required
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="subject">נושא</Label>
            <Input id="subject" name="subject" placeholder="נושא (אופציונלי)" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="content">תוכן *</Label>
            <Textarea
              id="content"
              name="content"
              placeholder="פרט את תוכן הפעילות..."
              rows={4}
              required
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
              {isPending ? "שומר..." : "שמור פעילות"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
