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
import {
  PlusIcon,
  TrashIcon,
  PhoneIcon,
  MailIcon,
  PencilIcon,
  MessageCircleIcon,
} from "lucide-react";
import { addContact, deleteContact } from "@/lib/actions/client-actions";
import { toWhatsAppLink } from "@/lib/phone-utils";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { EditContactDialog } from "./edit-contact-dialog";
import type { Contact } from "@/generated/prisma";

interface ContactListProps {
  clientId: string;
  contacts: Contact[];
}

export function ContactList({ clientId, contacts }: ContactListProps) {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editContact, setEditContact] = useState<Contact | null>(null);
  const [deleteContactId, setDeleteContactId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleAdd(formData: FormData) {
    startTransition(async () => {
      await addContact(clientId, formData);
      setAddDialogOpen(false);
    });
  }

  function handleDeleteConfirm() {
    if (!deleteContactId) return;
    startTransition(async () => {
      await deleteContact(deleteContactId, clientId);
      setDeleteContactId(null);
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">אנשי קשר</h3>
        <Button variant="ghost" size="sm" onClick={() => setAddDialogOpen(true)}>
          <PlusIcon className="h-4 w-4 ml-1" />
          הוסף
        </Button>
      </div>

      {contacts.length === 0 ? (
        <p className="text-sm text-muted-foreground py-2">אין אנשי קשר</p>
      ) : (
        <div className="space-y-2">
          {contacts.map((contact) => {
            const waLink = toWhatsAppLink(contact.phone);
            return (
              <div
                key={contact.id}
                className="flex items-start justify-between rounded-lg border p-3 gap-2"
              >
                <div className="space-y-1.5 min-w-0">
                  {/* Name + primary badge + role */}
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

                  {/* Clickable channel icon pills */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {contact.phone && (
                      <a
                        href={`tel:${contact.phone}`}
                        className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground hover:bg-muted/70 hover:text-foreground transition-colors"
                      >
                        <PhoneIcon className="h-3 w-3" />
                        {contact.phone}
                      </a>
                    )}
                    {contact.email && (
                      <a
                        href={`mailto:${contact.email}`}
                        className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground hover:bg-muted/70 hover:text-foreground transition-colors"
                      >
                        <MailIcon className="h-3 w-3" />
                        {contact.email}
                      </a>
                    )}
                    {waLink && (
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground hover:bg-muted/70 hover:text-foreground transition-colors"
                      >
                        <MessageCircleIcon className="h-3 w-3" />
                        WhatsApp
                      </a>
                    )}
                  </div>
                </div>

                {/* Edit + Delete buttons */}
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setEditContact(contact)}
                  >
                    <PencilIcon className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setDeleteContactId(contact.id)}
                    disabled={isPending}
                  >
                    <TrashIcon className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Contact Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
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
              <Button type="button" variant="outline" onClick={() => setAddDialogOpen(false)}>
                ביטול
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "שומר..." : "הוסף"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Contact Dialog */}
      {editContact && (
        <EditContactDialog
          contact={editContact}
          clientId={clientId}
          open={editContact !== null}
          onOpenChange={(open) => { if (!open) setEditContact(null); }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        open={deleteContactId !== null}
        onOpenChange={(open) => { if (!open) setDeleteContactId(null); }}
        onConfirm={handleDeleteConfirm}
        title="מחיקת איש קשר"
        description="האם אתה בטוח שברצונך למחוק את איש הקשר? פעולה זו אינה ניתנת לביטול."
        isPending={isPending}
      />
    </div>
  );
}
