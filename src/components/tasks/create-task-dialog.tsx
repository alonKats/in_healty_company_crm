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
import { createTask } from "@/lib/actions/task-actions";
import type { ClientOption } from "./task-list";

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clients: ClientOption[];
}

function todayDateValue(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export function CreateTaskDialog({
  open,
  onOpenChange,
  clients,
}: CreateTaskDialogProps) {
  const [type, setType] = useState("GENERAL");
  const [priority, setPriority] = useState("MEDIUM");
  const [clientId, setClientId] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const title = formData.get("title") as string;
    const description = (formData.get("description") as string) || undefined;
    const dueDate = (formData.get("dueDate") as string) || undefined;

    startTransition(async () => {
      await createTask({
        title,
        description,
        type,
        priority: priority as "HIGH" | "MEDIUM" | "LOW",
        clientId: clientId || undefined,
        dueDate: dueDate || undefined,
      });
      // Reset form
      setType("GENERAL");
      setPriority("MEDIUM");
      setClientId("");
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>משימה חדשה</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Title */}
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="title">כותרת *</Label>
              <Input
                id="title"
                name="title"
                placeholder="תיאור המשימה"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="description">פירוט</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="פירוט נוסף (אופציונלי)"
                rows={3}
              />
            </div>

            {/* Client */}
            <div className="space-y-1.5">
              <Label>לקוח</Label>
              <Select value={clientId} onValueChange={(v) => setClientId(v ?? "")}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="בחר לקוח (אופציונלי)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">ללא לקוח</SelectItem>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                      {c.company ? ` — ${c.company}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Type */}
            <div className="space-y-1.5">
              <Label>סוג</Label>
              <Select value={type} onValueChange={(v) => v && setType(v)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FOLLOW_UP">מעקב</SelectItem>
                  <SelectItem value="SEND_QUOTE">שליחת הצעה</SelectItem>
                  <SelectItem value="PAYMENT_REMINDER">תזכורת תשלום</SelectItem>
                  <SelectItem value="EVENT_PREP">הכנה לאירוע</SelectItem>
                  <SelectItem value="RE_ENGAGEMENT">חידוש קשר</SelectItem>
                  <SelectItem value="GENERAL">כללי</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Priority */}
            <div className="space-y-1.5">
              <Label>עדיפות</Label>
              <Select value={priority} onValueChange={(v) => v && setPriority(v)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HIGH">גבוהה</SelectItem>
                  <SelectItem value="MEDIUM">בינונית</SelectItem>
                  <SelectItem value="LOW">נמוכה</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Due date */}
            <div className="space-y-1.5">
              <Label htmlFor="dueDate">תאריך יעד</Label>
              <Input
                id="dueDate"
                name="dueDate"
                type="date"
                defaultValue={todayDateValue()}
              />
            </div>
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
              {isPending ? "שומר..." : "צור משימה"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
