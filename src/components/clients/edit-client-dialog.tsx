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
import { updateClient } from "@/lib/actions/client-actions";
import type { Client, User } from "@/generated/prisma";

// Accept either serialized (string) or raw (Date) timestamps since ClientDetail passes already-serialized data
type ClientLike = Omit<Client, "createdAt" | "updatedAt"> & {
  createdAt: string | Date;
  updatedAt: string | Date;
};

interface EditClientDialogProps {
  client: ClientLike;
  users: Pick<User, "id" | "name">[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditClientDialog({ client, users, open, onOpenChange }: EditClientDialogProps) {
  const [source, setSource] = useState(client.source);
  const [status, setStatus] = useState(client.status);
  const [assignedToId, setAssignedToId] = useState(client.assignedToId ?? "none");
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    formData.set("source", source);
    formData.set("status", status);
    if (assignedToId && assignedToId !== "none") {
      formData.set("assignedToId", assignedToId);
    }
    startTransition(async () => {
      await updateClient(client.id, formData);
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>עריכת לקוח</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="edit-client-name">שם *</Label>
              <Input
                id="edit-client-name"
                name="name"
                defaultValue={client.name}
                placeholder="שם הלקוח"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-client-company">חברה</Label>
              <Input
                id="edit-client-company"
                name="company"
                defaultValue={client.company ?? ""}
                placeholder="שם החברה"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-client-phone">טלפון</Label>
              <Input
                id="edit-client-phone"
                name="phone"
                defaultValue={client.phone ?? ""}
                placeholder="05X-XXXXXXX"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-client-email">אימייל</Label>
              <Input
                id="edit-client-email"
                name="email"
                type="email"
                defaultValue={client.email ?? ""}
                placeholder="email@example.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-client-address">כתובת</Label>
              <Input
                id="edit-client-address"
                name="address"
                defaultValue={client.address ?? ""}
                placeholder="כתובת"
              />
            </div>
            <div className="space-y-1.5">
              <Label>מקור</Label>
              <Select value={source} onValueChange={(v) => v && setSource(v as typeof source)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="REFERRAL">הפניה</SelectItem>
                  <SelectItem value="WEBSITE">אתר</SelectItem>
                  <SelectItem value="COLD_OUTREACH">פניה יזומה</SelectItem>
                  <SelectItem value="LINKEDIN">לינקדאין</SelectItem>
                  <SelectItem value="CONFERENCE">כנס</SelectItem>
                  <SelectItem value="CAMPAIGN">קמפיין</SelectItem>
                  <SelectItem value="MAILING">דיוור</SelectItem>
                  <SelectItem value="INBOUND">פניית לקוח</SelectItem>
                  <SelectItem value="OTHER">אחר</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>סטטוס</Label>
              <Select value={status} onValueChange={(v) => v && setStatus(v as typeof status)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LEAD">ליד</SelectItem>
                  <SelectItem value="ACTIVE">פעיל</SelectItem>
                  <SelectItem value="DORMANT">רדום</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {users.length > 0 && (
              <div className="space-y-1.5 sm:col-span-2">
                <Label>אחראי</Label>
                <Select value={assignedToId} onValueChange={(v) => v && setAssignedToId(v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="בחר אחראי" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">ללא</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="flex items-center gap-2 sm:col-span-2">
              <input
                type="checkbox"
                id="edit-client-mailing"
                name="isOnMailingList"
                defaultChecked={client.isOnMailingList}
                className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
              />
              <Label htmlFor="edit-client-mailing">רשום לרשימת דיוור</Label>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="edit-client-notes">הערות</Label>
              <Textarea
                id="edit-client-notes"
                name="notes"
                defaultValue={client.notes ?? ""}
                placeholder="הערות נוספות"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              ביטול
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "שומר..." : "שמור שינויים"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
