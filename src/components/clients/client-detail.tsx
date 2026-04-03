"use client";

import { useState } from "react";
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
} from "lucide-react";
import { ActivityFeed } from "./activity-feed";
import { ContactList } from "./contact-list";
import { AddActivityDialog } from "./add-activity-dialog";
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

export function ClientDetail({ client }: ClientDetailProps) {
  const [activityDialogOpen, setActivityDialogOpen] = useState(false);

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
              </div>
              {client.company && (
                <p className="text-muted-foreground">{client.company}</p>
              )}
              <div className="flex flex-col gap-1">
                {client.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <PhoneIcon className="h-4 w-4" />
                    {client.phone}
                  </div>
                )}
                {client.email && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MailIcon className="h-4 w-4" />
                    {client.email}
                  </div>
                )}
                {client.address && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPinIcon className="h-4 w-4" />
                    {client.address}
                  </div>
                )}
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
    </div>
  );
}
