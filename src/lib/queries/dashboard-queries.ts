import { prisma } from "@/lib/prisma";

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
  };
}
