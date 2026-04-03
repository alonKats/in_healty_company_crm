import Link from "next/link";

interface CalendarEvent {
  id: string;
  orderNumber: number;
  eventDate: string | Date | null;
  client: { name: string };
}

function getDayLabel(dateStr: string): string {
  const d = new Date(dateStr);
  const dayNames = ["יום א׳", "יום ב׳", "יום ג׳", "יום ד׳", "יום ה׳", "יום ו׳", "שבת"];
  return dayNames[d.getDay()] ?? "";
}

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

function isToday(dateStr: string): boolean {
  const d = new Date(dateStr);
  const now = new Date();
  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  );
}

function isTomorrow(dateStr: string): boolean {
  const d = new Date(dateStr);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return (
    d.getDate() === tomorrow.getDate() &&
    d.getMonth() === tomorrow.getMonth() &&
    d.getFullYear() === tomorrow.getFullYear()
  );
}

/** Build a 14-day strip starting from today, grouping events by date */
function build14DayStrip(events: CalendarEvent[]) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const days: { dateStr: string; events: CalendarEvent[] }[] = [];

  for (let i = 0; i < 14; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    const isoDate = d.toISOString().slice(0, 10);
    days.push({ dateStr: isoDate, events: [] });
  }

  for (const event of events) {
    if (!event.eventDate) continue;
    const eventDay = new Date(event.eventDate).toISOString().slice(0, 10);
    const match = days.find((d) => d.dateStr === eventDay);
    if (match) match.events.push(event);
  }

  // Only return days that have events, or the first 3 days (so there's always something visible)
  return days.filter((d, i) => d.events.length > 0 || i < 3);
}

export function MiniCalendar({ events }: { events: CalendarEvent[] }) {
  const days = build14DayStrip(events);

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-full">
      <div className="flex items-center gap-2 mb-5">
        <svg
          className="w-5 h-5 text-teal-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <h2 className="text-lg font-bold text-slate-800">14 ימים קרובים</h2>
      </div>

      {days.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-8">
          אין אירועים קרובים.
        </p>
      ) : (
        <div className="space-y-1">
          {days.map((day) => {
            const today = isToday(day.dateStr);
            const tomorrow = isTomorrow(day.dateStr);
            const hasEvents = day.events.length > 0;

            return (
              <div
                key={day.dateStr}
                className={`flex items-start gap-3 py-2 px-2 rounded-lg ${
                  today
                    ? "bg-teal-50 border border-teal-200"
                    : hasEvents
                      ? "bg-slate-50"
                      : ""
                }`}
              >
                {/* Date column */}
                <div className="w-14 shrink-0 text-center">
                  <div
                    className={`text-xs font-medium ${
                      today ? "text-teal-700" : "text-slate-500"
                    }`}
                  >
                    {today ? "היום" : tomorrow ? "מחר" : getDayLabel(day.dateStr)}
                  </div>
                  <div
                    className={`text-sm font-bold ${
                      today ? "text-teal-800" : "text-slate-700"
                    }`}
                  >
                    {formatShortDate(day.dateStr)}
                  </div>
                </div>

                {/* Events */}
                <div className="flex-1 min-w-0">
                  {hasEvents ? (
                    <div className="space-y-1">
                      {day.events.map((ev) => (
                        <Link
                          key={ev.id}
                          href={`/orders/${ev.id}`}
                          className="flex items-center gap-2 group"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" />
                          <span className="text-sm text-slate-700 truncate group-hover:text-teal-700 transition-colors">
                            {ev.client.name}
                          </span>
                          <span className="text-xs text-slate-400">
                            #{ev.orderNumber}
                          </span>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-300 pt-1">—</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
