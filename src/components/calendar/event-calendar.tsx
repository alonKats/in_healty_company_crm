"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Order, Client, OrderItem, Service, Category } from "@/generated/prisma";

// --- Types ---

interface CalendarOrderItem extends OrderItem {
  service: (Service & { category: Category }) | null;
}

interface CalendarEvent extends Order {
  client: Pick<Client, "name" | "company">;
  items: CalendarOrderItem[];
}

interface EventCalendarProps {
  events: CalendarEvent[];
  eventCounts: Record<string, number>;
}

// --- Category color map ---

const categoryColors: Record<string, string> = {
  "עמדות בריאות": "bg-green-100 text-green-800 border-green-300",
  "הרצאות מומחים": "bg-blue-100 text-blue-800 border-blue-300",
  "סדנאות בריאות": "bg-purple-100 text-purple-800 border-purple-300",
  "תנועה וחיזוק": "bg-orange-100 text-orange-800 border-orange-300",
  "בדיקות רופאים ומדדים": "bg-red-100 text-red-800 border-red-300",
};

const defaultColor = "bg-slate-100 text-slate-700 border-slate-300";

function getCategoryColor(event: CalendarEvent): string {
  const firstCategory = event.items[0]?.service?.category?.name;
  if (!firstCategory) return defaultColor;
  return categoryColors[firstCategory] ?? defaultColor;
}

// --- Helpers ---

const hebrewDays = ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"];

const hebrewMonths = [
  "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
  "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר",
];

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function getDaysInMonth(year: number, month: number): Date[] {
  const days: Date[] = [];
  const d = new Date(year, month, 1);
  while (d.getMonth() === month) {
    days.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return days;
}

function getCalendarGrid(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1);
  const startDow = firstDay.getDay(); // 0=Sunday
  const grid: Date[] = [];

  // Fill leading days from previous month
  for (let i = startDow - 1; i >= 0; i--) {
    grid.push(new Date(year, month, -i));
  }

  // Days of current month
  const daysInMonth = getDaysInMonth(year, month);
  grid.push(...daysInMonth);

  // Fill trailing days to complete the last week
  while (grid.length % 7 !== 0) {
    const last = grid[grid.length - 1];
    const next = new Date(last);
    next.setDate(next.getDate() + 1);
    grid.push(next);
  }

  return grid;
}

// --- Component ---

export function EventCalendar({ events, eventCounts }: EventCalendarProps) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const grid = getCalendarGrid(year, month);
  const todayKey = toDateKey(today);

  // Group events by date key
  const eventsByDate: Record<string, CalendarEvent[]> = {};
  for (const event of events) {
    if (!event.eventDate) continue;
    const key = typeof event.eventDate === "string"
      ? (event.eventDate as string).slice(0, 10)
      : new Date(event.eventDate).toISOString().slice(0, 10);
    if (!eventsByDate[key]) eventsByDate[key] = [];
    eventsByDate[key].push(event);
  }

  function goToPrevMonth() {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  }

  function goToNextMonth() {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  }

  function getDayBg(dateKey: string): string {
    const count = eventCounts[dateKey] ?? 0;
    if (count >= 2) return "bg-amber-50";
    if (count === 1) return "bg-green-50";
    return "";
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={goToNextMonth}
          className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="חודש הבא"
        >
          <ChevronLeft className="h-5 w-5 text-slate-600" />
        </button>
        <h2 className="text-xl font-bold text-slate-800">
          {hebrewMonths[month]} {year}
        </h2>
        <button
          onClick={goToPrevMonth}
          className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="חודש קודם"
        >
          <ChevronRight className="h-5 w-5 text-slate-600" />
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 mb-2">
        {hebrewDays.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-semibold text-slate-500 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 border-t border-r border-slate-200">
        {grid.map((date, idx) => {
          const dateKey = toDateKey(date);
          const isCurrentMonth = date.getMonth() === month;
          const isToday = dateKey === todayKey;
          const dayEvents = eventsByDate[dateKey] ?? [];
          const visibleEvents = dayEvents.slice(0, 3);
          const overflow = dayEvents.length - 3;

          return (
            <div
              key={idx}
              className={cn(
                "min-h-[100px] border-b border-l border-slate-200 p-1.5",
                getDayBg(dateKey),
                !isCurrentMonth && "opacity-40",
                isToday && "ring-2 ring-teal-500 ring-inset rounded-sm"
              )}
            >
              <div
                className={cn(
                  "text-xs font-medium mb-1",
                  isToday ? "text-teal-700 font-bold" : "text-slate-600"
                )}
              >
                {date.getDate()}
              </div>
              <div className="space-y-0.5">
                {visibleEvents.map((event) => (
                  <Link
                    key={event.id}
                    href={`/orders/${event.id}`}
                    className={cn(
                      "block text-[10px] leading-tight px-1.5 py-0.5 rounded border truncate hover:opacity-80 transition-opacity",
                      getCategoryColor(event)
                    )}
                    title={event.client.company ?? event.client.name}
                  >
                    {event.client.company ?? event.client.name}
                  </Link>
                ))}
                {overflow > 0 && (
                  <div className="text-[10px] text-slate-400 px-1">
                    +{overflow} עוד
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center gap-4 text-[11px] text-slate-500">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-green-50 border border-slate-200" />
          <span>אירוע אחד</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-amber-50 border border-slate-200" />
          <span>2+ אירועים</span>
        </div>
        <div className="border-r border-slate-300 h-3 mx-1" />
        {Object.entries(categoryColors).map(([name, cls]) => (
          <div key={name} className="flex items-center gap-1.5">
            <span className={cn("w-3 h-3 rounded border", cls.split(" ").slice(0, 1).join(" "), cls.split(" ").slice(2).join(" "))} />
            <span>{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
