import { prisma } from "@/lib/prisma";

export type ActionItem = {
  id: string;
  type: "overdue_followup" | "expiring_quote" | "upcoming_event" | "pending_payment" | "new_lead";
  urgency: "red" | "orange" | "yellow" | "gray";
  title: string;
  subtitle: string;
  href: string;
  actionLabel: string;
  date?: string;
};

const URGENCY_ORDER: Record<ActionItem["urgency"], number> = {
  red: 0,
  orange: 1,
  yellow: 2,
  gray: 3,
};

function buildActionStream(
  needsAttention: {
    dormantClients: { id: string; name: string; company: string | null }[];
    expiredQuotes: { id: string; quoteNumber: number; totalAmount: number; validUntil: Date | string | null; client: { name: string } }[];
    upcomingEvents: { id: string; orderNumber: number; eventDate: Date | string | null; client: { name: string } }[];
  },
  pipeline: {
    newLeads: { id: string; name: string; company: string | null; createdAt: Date | string }[];
  },
): ActionItem[] {
  const items: ActionItem[] = [];
  const now = new Date();
  const oneDayMs = 24 * 60 * 60 * 1000;

  // Dormant clients → red overdue_followup
  for (const c of needsAttention.dormantClients) {
    items.push({
      id: `dormant-${c.id}`,
      type: "overdue_followup",
      urgency: "red",
      title: c.name,
      subtitle: c.company ? `${c.company} — ללא פעילות 30+ יום` : "ללא פעילות 30+ יום",
      href: `/clients/${c.id}`,
      actionLabel: "צפה בלקוח",
    });
  }

  // Expired quotes → red expiring_quote
  for (const q of needsAttention.expiredQuotes) {
    items.push({
      id: `expired-quote-${q.id}`,
      type: "expiring_quote",
      urgency: "red",
      title: `הצעה #${q.quoteNumber} — ${q.client.name}`,
      subtitle: `₪${q.totalAmount.toLocaleString()} — פג תוקף`,
      href: `/quotes/${q.id}`,
      actionLabel: "צפה בהצעה",
      date: q.validUntil ? new Date(q.validUntil).toISOString() : undefined,
    });
  }

  // Upcoming events → orange (≤1 day) or yellow (≤7 days)
  for (const o of needsAttention.upcomingEvents) {
    const eventDate = o.eventDate ? new Date(o.eventDate) : null;
    const diffMs = eventDate ? eventDate.getTime() - now.getTime() : Infinity;
    const urgency: ActionItem["urgency"] = diffMs <= oneDayMs ? "orange" : "yellow";

    items.push({
      id: `event-${o.id}`,
      type: "upcoming_event",
      urgency,
      title: `הזמנה #${o.orderNumber} — ${o.client.name}`,
      subtitle: eventDate
        ? `אירוע ב-${eventDate.toLocaleDateString("he-IL")}`
        : "אירוע קרוב",
      href: `/orders/${o.id}`,
      actionLabel: "צפה בהזמנה",
      date: eventDate?.toISOString(),
    });
  }

  // New leads (first 5) → gray new_lead
  for (const l of pipeline.newLeads.slice(0, 5)) {
    items.push({
      id: `lead-${l.id}`,
      type: "new_lead",
      urgency: "gray",
      title: l.name,
      subtitle: l.company ? `${l.company} — ליד חדש` : "ליד חדש",
      href: `/clients/${l.id}`,
      actionLabel: "צפה בליד",
      date: new Date(l.createdAt).toISOString(),
    });
  }

  // Sort by urgency order
  items.sort((a, b) => URGENCY_ORDER[a.urgency] - URGENCY_ORDER[b.urgency]);

  return items;
}

export async function getDashboardData() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  // KPIs
  const [
    paidPaymentsThisMonth,
    paidPaymentsLastMonth,
    openQuotes,
    pendingPaymentsData,
    activeOrdersCount,
    quotesThisMonth,
    approvedQuotesThisMonth,
  ] = await Promise.all([
    prisma.payment.aggregate({
      where: {
        status: "PAID",
        date: { gte: startOfMonth, lte: endOfMonth },
      },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: {
        status: "PAID",
        date: { gte: startOfLastMonth, lte: endOfLastMonth },
      },
      _sum: { amount: true },
    }),
    prisma.quote.aggregate({
      where: { status: { in: ["DRAFT", "SENT"] } },
      _sum: { totalAmount: true },
    }),
    prisma.payment.aggregate({
      where: { status: { in: ["PENDING", "PARTIAL"] } },
      _sum: { amount: true },
    }),
    prisma.order.count({
      where: { status: { in: ["CONFIRMED", "IN_PROGRESS"] } },
    }),
    prisma.quote.count({
      where: { createdAt: { gte: startOfMonth, lte: endOfMonth } },
    }),
    prisma.quote.count({
      where: {
        status: "APPROVED",
        createdAt: { gte: startOfMonth, lte: endOfMonth },
      },
    }),
  ]);

  const monthlyRevenue = Number(paidPaymentsThisMonth._sum.amount ?? 0);
  const lastMonthRevenue = Number(paidPaymentsLastMonth._sum.amount ?? 0);
  const activeQuotesValue = Number(openQuotes._sum.totalAmount ?? 0);
  const pendingPayments = Number(pendingPaymentsData._sum.amount ?? 0);
  const conversionRate =
    quotesThisMonth > 0
      ? Math.round((approvedQuotesThisMonth / quotesThisMonth) * 100)
      : 0;

  const hebrewMonthNames = ["ינואר","פברואר","מרץ","אפריל","מאי","יוני","יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר"];
  const currentMonthName = hebrewMonthNames[now.getMonth()] ?? "";

  // Pipeline data
  const [
    newLeads,
    sentQuotes,
    approvedQuotesNoPipeline,
    activeOrders,
    completedUnpaid,
  ] = await Promise.all([
    prisma.client.findMany({
      where: {
        status: "LEAD",
        quotes: { none: {} },
      },
      select: { id: true, name: true, company: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.quote.findMany({
      where: { status: "SENT" },
      select: {
        id: true,
        quoteNumber: true,
        totalAmount: true,
        createdAt: true,
        client: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.quote.findMany({
      where: {
        status: "APPROVED",
        orders: { none: {} },
      },
      select: {
        id: true,
        quoteNumber: true,
        totalAmount: true,
        createdAt: true,
        client: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.order.findMany({
      where: { status: { in: ["CONFIRMED", "IN_PROGRESS"] } },
      select: {
        id: true,
        orderNumber: true,
        totalAmount: true,
        eventDate: true,
        createdAt: true,
        client: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.order.findMany({
      where: {
        status: "COMPLETED",
        payments: { some: { status: { in: ["PENDING", "PARTIAL"] } } },
      },
      select: {
        id: true,
        orderNumber: true,
        totalAmount: true,
        eventDate: true,
        createdAt: true,
        client: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // Needs attention
  const [dormantClients, expiredQuotes, upcomingEvents] = await Promise.all([
    prisma.client.findMany({
      where: {
        status: "ACTIVE",
        activities: {
          every: { date: { lt: thirtyDaysAgo } },
        },
      },
      select: { id: true, name: true, company: true, createdAt: true },
      take: 10,
      orderBy: { updatedAt: "asc" },
    }),
    prisma.quote.findMany({
      where: {
        status: "SENT",
        validUntil: { lt: now },
      },
      select: {
        id: true,
        quoteNumber: true,
        totalAmount: true,
        validUntil: true,
        client: { select: { name: true } },
      },
      take: 10,
      orderBy: { validUntil: "asc" },
    }),
    prisma.order.findMany({
      where: {
        eventDate: { gte: now, lte: sevenDaysFromNow },
        status: { in: ["CONFIRMED", "IN_PROGRESS"] },
      },
      select: {
        id: true,
        orderNumber: true,
        eventDate: true,
        client: { select: { name: true } },
      },
      take: 10,
      orderBy: { eventDate: "asc" },
    }),
  ]);

  // Revenue by month — last 6 months
  const months: { month: string; total: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
    const label = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

    const agg = await prisma.payment.aggregate({
      where: {
        status: "PAID",
        date: { gte: start, lte: end },
      },
      _sum: { amount: true },
    });
    months.push({ month: label, total: Number(agg._sum.amount ?? 0) });
  }

  return {
    kpis: {
      monthlyRevenue,
      lastMonthRevenue,
      currentMonthName,
      activeQuotesValue,
      pendingPayments,
      activeOrdersCount,
      conversionRate,
    },
    pipeline: {
      newLeads,
      sentQuotes: sentQuotes.map((q) => ({
        ...q,
        totalAmount: Number(q.totalAmount),
      })),
      approvedQuotes: approvedQuotesNoPipeline.map((q) => ({
        ...q,
        totalAmount: Number(q.totalAmount),
      })),
      activeOrders: activeOrders.map((o) => ({
        ...o,
        totalAmount: Number(o.totalAmount),
      })),
      completedUnpaid: completedUnpaid.map((o) => ({
        ...o,
        totalAmount: Number(o.totalAmount),
      })),
    },
    needsAttention: {
      dormantClients,
      expiredQuotes: expiredQuotes.map((q) => ({
        ...q,
        totalAmount: Number(q.totalAmount),
      })),
      upcomingEvents,
    },
    revenueByMonth: months,
    actionStream: buildActionStream(
      {
        dormantClients,
        expiredQuotes: expiredQuotes.map((q) => ({
          ...q,
          totalAmount: Number(q.totalAmount),
        })),
        upcomingEvents,
      },
      { newLeads },
    ),
  };
}
