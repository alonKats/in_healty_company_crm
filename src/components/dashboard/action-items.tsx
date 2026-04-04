"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { FileTextIcon, CalendarIcon, CheckCircle2Icon, BellIcon, MapPinIcon } from "lucide-react";

interface PendingQuote {
  id: string;
  quoteNumber: number;
  totalAmount: number;
  daysSinceSent: number;
  description: string;
  client: { id: string; name: string };
}

interface UpcomingEvent {
  id: string;
  orderNumber: number;
  eventDate: string | Date | null;
  eventLocation: string | null;
  totalAmount: number;
  daysUntil: number | null;
  description: string;
  client: { id: string; name: string };
}

interface ActionItemsProps {
  pendingQuotes: PendingQuote[];
  upcomingEvents: UpcomingEvent[];
}

function urgencyColor(days: number): string {
  if (days >= 14) return "border-r-red-500 bg-red-50/30";
  if (days >= 7) return "border-r-amber-500 bg-amber-50/30";
  return "border-r-slate-200";
}

function urgencyBadge(days: number): { label: string; className: string } {
  if (days >= 14) return { label: `${days} ימים`, className: "bg-red-100 text-red-700" };
  if (days >= 7) return { label: `${days} ימים`, className: "bg-amber-100 text-amber-700" };
  return { label: `${days} ימים`, className: "bg-slate-100 text-slate-600" };
}

function formatEventDate(date: string | Date | null): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("he-IL", { day: "numeric", month: "short" });
}

export function ActionItems({ pendingQuotes, upcomingEvents }: ActionItemsProps) {
  const isEmpty = pendingQuotes.length === 0 && upcomingEvents.length === 0;

  if (isEmpty) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 flex flex-col items-center justify-center text-center">
        <CheckCircle2Icon className="h-10 w-10 text-emerald-400 mb-3" />
        <h3 className="text-lg font-bold text-slate-700">הכל מטופל</h3>
        <p className="text-sm text-slate-400 mt-1">אין משימות דחופות</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <BellIcon className="h-5 w-5 text-amber-500" />
          לטפל היום
        </h2>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x lg:divide-x-reverse divide-slate-100">
        {/* Pending Quotes */}
        <div className="p-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <FileTextIcon className="h-3.5 w-3.5" />
            הצעות ממתינות ({pendingQuotes.length})
          </h3>
          {pendingQuotes.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">אין הצעות ממתינות</p>
          ) : (
            <div className="space-y-2">
              {pendingQuotes.map((q) => {
                const badge = urgencyBadge(q.daysSinceSent);
                return (
                  <Link
                    key={q.id}
                    href={`/quotes/${q.id}`}
                    className={cn(
                      "block rounded-lg border border-r-4 p-3 hover:shadow-sm transition-shadow",
                      urgencyColor(q.daysSinceSent)
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-slate-800">#{q.quoteNumber}</span>
                          <span className="text-sm text-slate-600">—</span>
                          <span className="text-sm font-medium text-slate-700 truncate">{q.client.name}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 truncate">{q.description}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span className="text-sm font-bold text-slate-800">₪{q.totalAmount.toLocaleString()}</span>
                        <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-full", badge.className)}>
                          {badge.label}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Upcoming Events */}
        <div className="p-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <CalendarIcon className="h-3.5 w-3.5" />
            אירועים קרובים ({upcomingEvents.length})
          </h3>
          {upcomingEvents.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">אין אירועים ב-14 הימים הקרובים</p>
          ) : (
            <div className="space-y-2">
              {upcomingEvents.map((e) => (
                <Link
                  key={e.id}
                  href={`/orders/${e.id}`}
                  className="block rounded-lg border p-3 hover:shadow-sm transition-shadow hover:border-teal-200"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-slate-800">#{e.orderNumber}</span>
                        <span className="text-sm text-slate-600">—</span>
                        <span className="text-sm font-medium text-slate-700 truncate">{e.client.name}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 truncate">{e.description}</p>
                      {e.eventLocation && (
                        <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                          <MapPinIcon className="h-3 w-3" />
                          {e.eventLocation}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className="text-xs font-medium text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">
                        {formatEventDate(e.eventDate)}
                      </span>
                      {e.daysUntil !== null && (
                        <span className="text-[10px] text-slate-500">
                          בעוד {e.daysUntil} ימים
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
