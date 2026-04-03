import { prisma } from "@/lib/prisma";

export async function getCalendarEvents(start: Date, end: Date) {
  return prisma.order.findMany({
    where: {
      eventDate: { gte: start, lte: end },
      status: { not: "CANCELLED" },
    },
    include: {
      client: { select: { name: true, company: true } },
      items: {
        include: { service: { include: { category: true } } },
        take: 3,
      },
    },
    orderBy: { eventDate: "asc" },
  });
}

export async function getEventCountByDay(start: Date, end: Date) {
  const orders = await prisma.order.findMany({
    where: {
      eventDate: { gte: start, lte: end },
      status: { not: "CANCELLED" },
    },
    select: { eventDate: true },
  });

  const counts: Record<string, number> = {};
  for (const order of orders) {
    if (order.eventDate) {
      const key = order.eventDate.toISOString().slice(0, 10);
      counts[key] = (counts[key] ?? 0) + 1;
    }
  }
  return counts;
}
