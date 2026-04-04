"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  PhoneIcon,
  MailIcon,
  MapPinIcon,
  PlusIcon,
  FileTextIcon,
  ShoppingBagIcon,
  PencilIcon,
  MessageCircleIcon,
  NewspaperIcon,
} from "lucide-react";
import { ActivityFeed } from "./activity-feed";
import { ContactList } from "./contact-list";
import { AddActivityDialog } from "./add-activity-dialog";
import { EditClientDialog } from "./edit-client-dialog";
import { toWhatsAppLink } from "@/lib/phone-utils";
import { toggleMailingList } from "@/lib/actions/client-actions";
import type { Client, Contact, Activity, Quote, Order, User } from "@/generated/prisma";

interface ActivityWithUser extends Activity {
  createdBy: Pick<User, "id" | "name">;
}

interface QuoteWithUser extends Quote {
  assignedTo: Pick<User, "id" | "name"> | null;
}

interface ClientWithRelations extends Client {
  assignedTo: Pick<User, "id" | "name"> | null;
  contacts: Contact[];
  activities: ActivityWithUser[];
  quotes: QuoteWithUser[];
  orders: Order[];
}

interface ClientDetailProps {
  client: ClientWithRelations;
  users: Pick<User, "id" | "name">[];
}

const statusLabels: Record<string, string> = {
  LEAD: "ליד",
  ACTIVE: "פעיל",
  DORMANT: "רדום",
};

const statusVariants: Record<string, "default" | "secondary" | "outline"> = {
  LEAD: "secondary",
  ACTIVE: "default",
  DORMANT: "outline",
};

const quoteStatusLabels: Record<string, string> = {
  DRAFT: "טיוטה",
  SENT: "נשלח",
  APPROVED: "מאושר",
  REJECTED: "נדחה",
  EXPIRED: "פג תוקף",
};

const orderStatusLabels: Record<string, string> = {
  CONFIRMED: "מאושר",
  IN_PROGRESS: "בביצוע",
  COMPLETED: "הושלם",
  CANCELLED: "בוטל",
};

function MailingListBadge({ clientId, isOnMailingList }: { clientId: string; isOnMailingList: boolean }) {
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    startTransition(async () => {
      await toggleMailingList(clientId, !isOnMailingList);
    });
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors",
        isOnMailingList
          ? "bg-teal-50 text-teal-700 hover:bg-teal-100"
          : "bg-slate-100 text-slate-400 hover:bg-slate-200"
      )}
      title={isOnMailingList ? "רשום לדיוור — לחץ להסרה" : "לא רשום לדיוור — לחץ להוספה"}
    >
      <NewspaperIcon className="h-3.5 w-3.5" />
      {isPending ? "..." : isOnMailingList ? "רשום לדיוור" : "דיוור"}
    </button>
  );
}

export function ClientDetail({ client, users }: ClientDetailProps) {
  const [activityDialogOpen, setActivityDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold">{client.name}</h1>
                <Badge variant={statusVariants[client.status] ?? "outline"}>
                  {statusLabels[client.status] ?? client.status}
                </Badge>
                <button
                  onClick={() => setEditDialogOpen(true)}
                  className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
                >
                  <PencilIcon className="h-4 w-4 ml-1" />
                  עריכה
                </button>
              </div>
              {client.company && (
                <p className="text-muted-foreground">{client.company}</p>
              )}
              <div className="flex flex-wrap gap-1.5 mt-1">
                {client.phone && (
                  <a
                    href={`tel:${client.phone}`}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-teal-50 text-slate-600 hover:text-teal-700 transition-colors text-xs font-medium"
                    title="התקשר"
                  >
                    <PhoneIcon className="h-3.5 w-3.5" />
                    {client.phone}
                  </a>
                )}
                {client.email && (
                  <a
                    href={`mailto:${client.email}`}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-teal-50 text-slate-600 hover:text-teal-700 transition-colors text-xs font-medium"
                    title="שלח מייל"
                  >
                    <MailIcon className="h-3.5 w-3.5" />
                    {client.email}
                  </a>
                )}
                {toWhatsAppLink(client.phone) && (
                  <a
                    href={toWhatsAppLink(client.phone)!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-green-50 hover:bg-green-100 text-green-700 transition-colors text-xs font-medium"
                    title="שלח וואטסאפ"
                  >
                    <MessageCircleIcon className="h-3.5 w-3.5" />
                    וואטסאפ
                  </a>
                )}
                {client.address && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium">
                    <MapPinIcon className="h-3.5 w-3.5" />
                    {client.address}
                  </span>
                )}
                <MailingListBadge clientId={client.id} isOnMailingList={client.isOnMailingList} />
              </div>
              {client.assignedTo && (
                <p className="text-xs text-muted-foreground">
                  אחראי: {client.assignedTo.name}
                </p>
              )}
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setActivityDialogOpen(true)}
                className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
              >
                <PlusIcon className="h-4 w-4 ml-1" />
                פעילות חדשה
              </button>
              <Link
                href={`/quotes/new?clientId=${client.id}`}
                className={cn(buttonVariants({ variant: "default", size: "sm" }))}
              >
                <FileTextIcon className="h-4 w-4 ml-1" />
                הצעת מחיר
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contacts */}
      <Card>
        <CardContent className="p-4">
          <ContactList clientId={client.id} contacts={client.contacts} />
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="activities">
        <TabsList>
          <TabsTrigger value="activities">
            פעילויות ({client.activities.length})
          </TabsTrigger>
          <TabsTrigger value="quotes">
            הצעות מחיר ({client.quotes.length})
          </TabsTrigger>
          <TabsTrigger value="orders">
            הזמנות ({client.orders.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activities" className="mt-4">
          <ActivityFeed activities={client.activities} />
        </TabsContent>

        <TabsContent value="quotes" className="mt-4">
          {client.quotes.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground text-sm">אין הצעות מחיר</p>
          ) : (
            <div className="space-y-2">
              {client.quotes.map((quote) => (
                <Card key={quote.id}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <FileTextIcon className="h-4 w-4 text-muted-foreground" />
                        <Link
                          href={`/quotes/${quote.id}`}
                          className="font-medium text-primary hover:underline text-sm"
                        >
                          הצעה #{quote.quoteNumber}
                        </Link>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {quoteStatusLabels[quote.status] ?? quote.status}
                        </Badge>
                        <span className="text-sm font-medium">
                          ₪{Number(quote.totalAmount).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="orders" className="mt-4">
          {client.orders.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground text-sm">אין הזמנות</p>
          ) : (
            <div className="space-y-2">
              {client.orders.map((order) => (
                <Card key={order.id}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <ShoppingBagIcon className="h-4 w-4 text-muted-foreground" />
                        <Link
                          href={`/orders/${order.id}`}
                          className="font-medium text-primary hover:underline text-sm"
                        >
                          הזמנה #{order.orderNumber}
                        </Link>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {orderStatusLabels[order.status] ?? order.status}
                        </Badge>
                        <span className="text-sm font-medium">
                          ₪{Number(order.totalAmount).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <AddActivityDialog
        clientId={client.id}
        open={activityDialogOpen}
        onOpenChange={setActivityDialogOpen}
      />

      <EditClientDialog
        client={client}
        users={users}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />
    </div>
  );
}
