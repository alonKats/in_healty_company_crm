"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusIcon, TrashIcon, PhoneIcon, MailIcon } from "lucide-react";
import { addContact, deleteContact } from "@/lib/actions/client-actions";
import type { Contact } from "@/generated/prisma";

interface ContactListProps {
  clientId: string;
  contacts: Contact[];
}

export function ContactList({ clientId, contacts }: ContactListProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleAdd(formData: FormData) {
    startTransition(async () => {
      await addContact(clientId, formData);
      setDialogOpen(false);
    });
  }

  async function handleDelete(contactId: string) {
    startTransition(async () => {
      await deleteContact(contactId, clientId);
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">אנשי קשר</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setDialogOpen(true)}
        >
          <PlusIcon className="h-4 w-4 ml-1" />
          הוסף
        </Button>
      </div>

      {contacts.length === 0 ? (
        <p className="text-sm text-muted-foreground py-2">אין אנשי קשר</p>
      ) : (
        <div className="space-y-2">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="flex items-start justify-between rounded-lg border p-3 gap-2"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm">{contact.name}</span>
                  {contact.isPrimary && (
                    <Badge variant="secondary" className="text-xs">
                      ראשי
                    </Badge>
                  )}
                  {contact.role && (
                    <span className="text-xs text-muted-foreground">{contact.role}</span>
                  )}
                </div>
                <div className="flex flex-col gap-0.5">
                  {contact.phone && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <PhoneIcon className="h-3 w-3" />
                      {contact.phone}
                    </div>
                  )}
                  {contact.email && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MailIcon className="h-3 w-3" />
                      {contact.email}
                    </div>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => handleDelete(contact.id)}
                disabled={isPending}
              >
                <TrashIcon className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>הוספת איש קשר</DialogTitle>
          </DialogHeader>
          <form action={handleAdd} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="contact-name">שם *</Label>
              <Input id="contact-name" name="name" placeholder="שם מלא" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contact-role">תפקיד</Label>
              <Input id="contact-role" name="role" placeholder="תפקיד" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contact-phone">טלפון</Label>
              <Input id="contact-phone" name="phone" placeholder="05X-XXXXXXX" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contact-email">אימייל</Label>
              <Input id="contact-email" name="email" type="email" placeholder="email@example.com" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                ביטול
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "שומר..." : "הוסף"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
