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
import { createClient } from "@/lib/actions/client-actions";
import type { User } from "@/generated/prisma";

interface AddClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  users: Pick<User, "id" | "name">[];
}

const sourceOptions = [
  { value: "REFERRAL", label: "הפניה" },
  { value: "WEBSITE", label: "אתר" },
  { value: "COLD_OUTREACH", label: "פניה יזומה" },
  { value: "LINKEDIN", label: "לינקדאין" },
  { value: "CONFERENCE", label: "כנס" },
  { value: "CAMPAIGN", label: "קמפיין" },
  { value: "MAILING", label: "דיוור" },
  { value: "INBOUND", label: "פניית לקוח" },
  { value: "OTHER", label: "אחר" },
];

export function AddClientDialog({ open, onOpenChange, users }: AddClientDialogProps) {
  const [source, setSource] = useState("OTHER");
  const [assignedToId, setAssignedToId] = useState("");
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    formData.set("source", source);
    formData.set("assignedToId", assignedToId);
    startTransition(async () => {
      await createClient(formData);
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>לקוח חדש</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">שם *</Label>
              <Input id="name" name="name" placeholder="שם מלא" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="company">חברה</Label>
              <Input id="company" name="company" placeholder="שם חברה" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">טלפון</Label>
              <Input id="phone" name="phone" placeholder="05X-XXXXXXX" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">אימייל</Label>
              <Input id="email" name="email" type="email" placeholder="email@example.com" />
            </div>
            <div className="space-y-1.5">
              <Label>מקור</Label>
              <Select value={source} onValueChange={(v) => v && setSource(v)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sourceOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>אחראי</Label>
              <Select value={assignedToId} onValueChange={(v) => setAssignedToId(v ?? "")}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="בחר אחראי" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="notes">הערות</Label>
            <Textarea id="notes" name="notes" placeholder="הערות כלליות..." rows={3} />
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
              {isPending ? "שומר..." : "צור לקוח"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
