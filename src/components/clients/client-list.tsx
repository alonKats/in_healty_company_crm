"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { PlusIcon, SearchIcon } from "lucide-react";
import { AddClientDialog } from "./add-client-dialog";
import type { Client, User, Quote, Activity } from "@/generated/prisma";

interface ClientWithRelations extends Client {
  assignedTo: Pick<User, "id" | "name"> | null;
  quotes: Pick<Quote, "id">[];
  activities: Pick<Activity, "date">[];
}

interface ClientListProps {
  clients: ClientWithRelations[];
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

function daysSince(date: Date | string): number {
  const d = typeof date === "string" ? new Date(date) : date;
  return Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
}

export function ClientList({ clients, users }: ClientListProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [dialogOpen, setDialogOpen] = useState(false);

  const filtered = clients.filter((client) => {
    const matchesStatus = statusFilter === "ALL" || client.status === statusFilter;
    const matchesSearch =
      !search ||
      client.name.toLowerCase().includes(search.toLowerCase()) ||
      (client.company ?? "").toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">לקוחות</h2>
        <button
          onClick={() => setDialogOpen(true)}
          className={cn(buttonVariants({ variant: "default" }))}
        >
          <PlusIcon className="h-4 w-4 ml-1" />
          לקוח חדש
        </button>
      </div>

      <div className="flex gap-3 items-center">
        <div className="relative flex-1 max-w-sm">
          <SearchIcon className="absolute right-2.5 top-2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="חיפוש לקוח..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-8"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(v) => v && setStatusFilter(v)}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="סטטוס" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">הכל</SelectItem>
            <SelectItem value="LEAD">ליד</SelectItem>
            <SelectItem value="ACTIVE">פעיל</SelectItem>
            <SelectItem value="DORMANT">רדום</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-muted-foreground mb-4">לא נמצאו לקוחות</p>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">שם</TableHead>
                  <TableHead className="text-right">חברה</TableHead>
                  <TableHead className="text-right">פעילות אחרונה</TableHead>
                  <TableHead className="text-right">הצעות פתוחות</TableHead>
                  <TableHead className="text-right">אחראי</TableHead>
                  <TableHead className="text-right">סטטוס</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((client) => {
                  const lastActivity = client.activities[0]?.date;
                  const days = lastActivity ? daysSince(lastActivity) : null;
                  const isStale = days !== null && days > 30;

                  return (
                    <TableRow key={client.id}>
                      <TableCell>
                        <Link
                          href={`/clients/${client.id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {client.name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {client.company ?? "—"}
                      </TableCell>
                      <TableCell>
                        {days === null ? (
                          <span className="text-muted-foreground text-sm">אין</span>
                        ) : (
                          <span className={cn("text-sm", isStale && "text-red-600 font-medium")}>
                            לפני {days} ימים
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {client.quotes.length > 0 ? (
                          <span className="font-medium">{client.quotes.length}</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {client.assignedTo?.name ?? "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariants[client.status] ?? "outline"}>
                          {statusLabels[client.status] ?? client.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <AddClientDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        users={users}
      />
    </div>
  );
}
