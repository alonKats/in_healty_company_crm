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
import { updateContact } from "@/lib/actions/client-actions";
import type { Contact } from "@/generated/prisma";

interface EditContactDialogProps {
  contact: Contact;
  clientId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditContactDialog({ contact, clientId, open, onOpenChange }: EditContactDialogProps) {
  const [isPrimary, setIsPrimary] = useState(contact.isPrimary);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    formData.set("isPrimary", isPrimary ? "true" : "false");
    startTransition(async () => {
      await updateContact(contact.id, clientId, formData);
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>עריכת איש קשר</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="edit-contact-name">שם *</Label>
            <Input id="edit-contact-name" name="name" defaultValue={contact.name} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-contact-role">תפקיד</Label>
            <Input id="edit-contact-role" name="role" defaultValue={contact.role ?? ""} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-contact-phone">טלפון</Label>
            <Input id="edit-contact-phone" name="phone" defaultValue={contact.phone ?? ""} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-contact-email">אימייל</Label>
            <Input id="edit-contact-email" name="email" type="email" defaultValue={contact.email ?? ""} />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="edit-contact-primary"
              checked={isPrimary}
              onChange={(e) => setIsPrimary(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
            />
            <Label htmlFor="edit-contact-primary">איש קשר ראשי</Label>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              ביטול
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "שומר..." : "שמור"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
