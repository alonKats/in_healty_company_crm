"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { updateActivity } from "@/lib/actions/activity-actions";
import type { Activity, User } from "@/generated/prisma";

interface ActivityWithUser extends Activity {
  createdBy: Pick<User, "id" | "name">;
}

interface EditActivityDialogProps {
  activity: ActivityWithUser;
  clientId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function toDatetimeLocal(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function EditActivityDialog({ activity, clientId, open, onOpenChange }: EditActivityDialogProps) {
  const [type, setType] = useState(activity.type);
  const [direction, setDirection] = useState(activity.direction);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    formData.set("type", type);
    formData.set("direction", direction);
    startTransition(async () => {
      await updateActivity(activity.id, clientId, formData);
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>עריכת פעילות</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>סוג פעילות</Label>
              <Select value={type} onValueChange={(v) => v && setType(v as typeof type)}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
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
              <Select value={direction} onValueChange={(v) => v && setDirection(v as typeof direction)}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="INBOUND">נכנס</SelectItem>
                  <SelectItem value="OUTBOUND">יוצא</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="edit-activity-date">תאריך ושעה</Label>
              <Input id="edit-activity-date" name="date" type="datetime-local" defaultValue={toDatetimeLocal(activity.date)} required />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-activity-subject">נושא</Label>
            <Input id="edit-activity-subject" name="subject" defaultValue={activity.subject ?? ""} placeholder="נושא (אופציונלי)" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-activity-content">תוכן *</Label>
            <Textarea id="edit-activity-content" name="content" defaultValue={activity.content} rows={4} required />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>ביטול</Button>
            <Button type="submit" disabled={isPending}>{isPending ? "שומר..." : "שמור שינויים"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
