import { getCalendarEvents, getEventCountByDay } from "@/lib/queries/calendar-queries";
import { EventCalendar } from "@/components/calendar/event-calendar";
import { serialize } from "@/lib/utils";

export default async function CalendarPage() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 2, 0);

  const [events, eventCounts] = await Promise.all([
    getCalendarEvents(start, end),
    getEventCountByDay(start, end),
  ]);

  return <EventCalendar events={serialize(events)} eventCounts={serialize(eventCounts)} />;
}
