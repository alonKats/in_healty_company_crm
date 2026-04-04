"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusIcon, SearchIcon, Trash2Icon, PencilIcon } from "lucide-react";
import { AddClientDialog } from "./add-client-dialog";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { deleteClient } from "@/lib/actions/client-actions";
import { SortableHeader } from "@/components/ui/sortable-header";
import type { Client, User, Quote, Activity } from "@/generated/prisma";

interface ClientWithRelations extends Client {
  assignedTo: Pick<User, "id" | "name"> | null;
  quotes: Pick<Quote, "id" | "status">[];
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

const statusColors: Record<string, string> = {
  LEAD: "bg-amber-100 text-amber-700",
  ACTIVE: "bg-emerald-100 text-emerald-700",
  DORMANT: "bg-red-100 text-red-700",
};

const avatarColors = [
  "bg-teal-100 text-teal-700",
  "bg-blue-100 text-blue-700",
  "bg-purple-100 text-purple-700",
  "bg-orange-100 text-orange-700",
  "bg-green-100 text-green-700",
  "bg-indigo-100 text-indigo-700",
  "bg-slate-100 text-slate-700",
];

function getAvatarColor(name: string) {
  const idx = name.charCodeAt(0) % avatarColors.length;
  return avatarColors[idx] ?? "bg-teal-100 text-teal-700";
}

function getInitials(name: string) {
  return name.slice(0, 2);
}

function daysSince(date: Date | string): number {
  const d = typeof date === "string" ? new Date(date) : date;
  return Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
}

export function ClientList({ clients, users }: ClientListProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [lastContactFilter, setLastContactFilter] = useState<string>("ALL");
  const [pendingQuotesOnly, setPendingQuotesOnly] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sortField, setSortField] = useState("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [deletingClientId, setDeletingClientId] = useState<string | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();

  function handleDeleteClient() {
    if (!deletingClientId) return;
    startDeleteTransition(async () => {
      await deleteClient(deletingClientId);
      setDeletingClientId(null);
    });
  }

  function handleSort(field: string) {
    if (field === sortField) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  const filtered = clients.filter((client) => {
    const matchesStatus = statusFilter === "ALL" || client.status === statusFilter;
    const matchesSearch =
      !search ||
      client.name.toLowerCase().includes(search.toLowerCase()) ||
      (client.company ?? "").toLowerCase().includes(search.toLowerCase());

    let matchesLastContact = true;
    if (lastContactFilter !== "ALL") {
      const lastActivity = client.activities[0]?.date;
      if (lastContactFilter === "NONE") {
        matchesLastContact = !lastActivity;
      } else if (!lastActivity) {
        matchesLastContact = false;
      } else {
        const days = daysSince(lastActivity);
        if (lastContactFilter === "TODAY") matchesLastContact = days === 0;
        else if (lastContactFilter === "WEEK") matchesLastContact = days <= 7;
        else if (lastContactFilter === "MONTH") matchesLastContact = days <= 30;
        else if (lastContactFilter === "30PLUS") matchesLastContact = days > 30;
        else if (lastContactFilter === "60PLUS") matchesLastContact = days > 60;
      }
    }

    const matchesPendingQuotes = !pendingQuotesOnly || client.quotes.some((q) => q.status === "SENT");

    return matchesStatus && matchesSearch && matchesLastContact && matchesPendingQuotes;
  });

  const sorted = Array.from(filtered).sort((a, b) => {
    let cmp = 0;
    if (sortField === "name") {
      cmp = a.name.localeCompare(b.name);
    } else if (sortField === "company") {
      cmp = (a.company ?? "").localeCompare(b.company ?? "");
    } else if (sortField === "lastActivity") {
      const aDate = a.activities[0]?.date ? new Date(a.activities[0].date).getTime() : 0;
      const bDate = b.activities[0]?.date ? new Date(b.activities[0].date).getTime() : 0;
      cmp = aDate - bDate;
    } else if (sortField === "status") {
      cmp = a.status.localeCompare(b.status);
    }
    return sortDir === "asc" ? cmp : -cmp;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">לקוחות</h2>
          <p className="text-slate-500 text-sm mt-1">ניהול ותחזוקת תיקי לקוחות</p>
        </div>
        <button
          onClick={() => setDialogOpen(true)}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-lg font-bold transition-all shadow-lg shadow-teal-600/20 active:scale-95"
        >
          <PlusIcon className="h-4 w-4" />
          לקוח חדש
        </button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-2 bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-3">
          <SearchIcon className="h-4 w-4 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="חיפוש לקוח לפי שם, חברה..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent border-none text-sm focus:ring-0 outline-none placeholder:text-slate-400"
          />
        </div>
        <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-200 flex items-center justify-around">
          {["ALL", "ACTIVE", "LEAD", "DORMANT"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "px-4 py-1.5 text-xs font-medium rounded-lg transition-colors",
                statusFilter === s
                  ? "bg-teal-50 text-teal-700 font-bold"
                  : "text-slate-500 hover:bg-slate-50"
              )}
            >
              {s === "ALL" ? "הכל" : statusLabels[s]}
            </button>
          ))}
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">מיון לפי:</span>
          <Select value={sortField} onValueChange={(v) => v && setSortField(v)}>
            <SelectTrigger className="w-auto border-none shadow-none text-sm font-medium text-slate-700 focus:ring-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">שם</SelectItem>
              <SelectItem value="company">חברה</SelectItem>
              <SelectItem value="lastActivity">פעילות</SelectItem>
              <SelectItem value="status">סטטוס</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Additional Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 flex items-center gap-3">
          <span className="text-xs font-medium text-slate-400 whitespace-nowrap">מגע אחרון:</span>
          <Select value={lastContactFilter} onValueChange={(v) => v && setLastContactFilter(v)}>
            <SelectTrigger className="w-auto border-none shadow-none text-sm font-medium text-slate-700 focus:ring-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">הכל</SelectItem>
              <SelectItem value="TODAY">היום</SelectItem>
              <SelectItem value="WEEK">השבוע</SelectItem>
              <SelectItem value="MONTH">החודש</SelectItem>
              <SelectItem value="30PLUS">30+ ימים</SelectItem>
              <SelectItem value="60PLUS">60+ ימים</SelectItem>
              <SelectItem value="NONE">ללא מגע</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <button
          onClick={() => setPendingQuotesOnly(!pendingQuotesOnly)}
          className={cn(
            "px-4 py-2 rounded-xl shadow-sm border text-xs font-medium transition-colors",
            pendingQuotesOnly
              ? "bg-amber-50 border-amber-200 text-amber-700"
              : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
          )}
        >
          הצעות ממתינות
        </button>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-xl border border-slate-200 shadow-sm">
          <p className="text-slate-400 text-sm">לא נמצאו לקוחות</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <SortableHeader label="שם לקוח" field="name" currentField={sortField} currentDir={sortDir} onSort={handleSort} />
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <SortableHeader label="חברה" field="company" currentField={sortField} currentDir={sortDir} onSort={handleSort} />
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <SortableHeader label="פעילות אחרונה" field="lastActivity" currentField={sortField} currentDir={sortDir} onSort={handleSort} />
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">הצעות פתוחות</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">אחראי</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <SortableHeader label="סטטוס" field="status" currentField={sortField} currentDir={sortDir} onSort={handleSort} />
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-20">פעולות</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sorted.map((client) => {
                  const lastActivity = client.activities[0]?.date;
                  const days = lastActivity ? daysSince(lastActivity) : null;
                  const isStale = days !== null && days > 30;

                  return (
                    <tr
                      key={client.id}
                      className={cn(
                        "transition-colors group",
                        client.status === "DORMANT"
                          ? "hover:bg-red-50/30 bg-red-50/10"
                          : "hover:bg-teal-50/30"
                      )}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={cn("w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm", getAvatarColor(client.name))}>
                            {getInitials(client.name)}
                          </div>
                          <Link href={`/clients/${client.id}`} className="font-bold text-slate-800 hover:text-teal-600 transition-colors">
                            {client.name}
                          </Link>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{client.company ?? "—"}</td>
                      <td className="px-6 py-4">
                        {days === null ? (
                          <span className="text-sm text-slate-400">אין</span>
                        ) : (
                          <span className={cn("text-sm", isStale ? "text-red-500 font-medium" : "text-slate-600")}>
                            לפני {days} ימים
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2.5 py-0.5 rounded-full text-xs font-medium",
                          client.quotes.length > 0 ? "bg-slate-100 text-slate-700" : "bg-slate-100 text-slate-400"
                        )}>
                          {client.quotes.length}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{client.assignedTo?.name ?? "—"}</td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[11px] font-bold",
                          statusColors[client.status] ?? "bg-gray-100 text-gray-700"
                        )}>
                          {statusLabels[client.status] ?? client.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link
                            href={`/clients/${client.id}`}
                            className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-teal-600 transition-colors"
                            title="ערוך"
                          >
                            <PencilIcon className="h-3.5 w-3.5" />
                          </Link>
                          <button
                            onClick={() => setDeletingClientId(client.id)}
                            className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                            title="מחק"
                          >
                            <Trash2Icon className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 bg-slate-50/30 border-t border-slate-100 flex items-center justify-between">
            <div className="text-sm text-slate-500">
              מציג <span className="font-bold text-slate-700">{sorted.length}</span> מתוך <span className="font-bold text-slate-700">{clients.length}</span> לקוחות
            </div>
          </div>
        </div>
      )}

      <ConfirmDeleteDialog
        open={!!deletingClientId}
        onOpenChange={(open) => !open && setDeletingClientId(null)}
        onConfirm={handleDeleteClient}
        title="מחיקת לקוח"
        description="למחיקת לקוח יימחקו גם כל אנשי הקשר, הפעילויות, ההצעות וההזמנות שלו. פעולה זו אינה ניתנת לביטול."
        isPending={isDeleting}
      />
      <AddClientDialog open={dialogOpen} onOpenChange={setDialogOpen} users={users} />
    </div>
  );
}
