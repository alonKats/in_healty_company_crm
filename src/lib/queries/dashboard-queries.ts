import { prisma } from "@/lib/prisma";

export async function getDashboardData() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
  const fourteenDaysFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

  const [
    paidThisMonth,
    paidLastMonth,
    openQuotes,
    pendingPayments,
    openQuotesCount,
    sentQuotesThisMonth,
    approvedQuotesThisMonth,
    pendingQuotesList,
    upcomingEventsList,
    recentActivities,
  ] = await Promise.all([
    // Revenue this month
    prisma.payment.aggregate({
      where: { status: "PAID", date: { gte: startOfMonth, lte: endOfMonth } },
      _sum: { amount: true },
    }),
    // Revenue last month
    prisma.payment.aggregate({
      where: { status: "PAID", date: { gte: startOfLastMonth, lte: endOfLastMonth } },
      _sum: { amount: true },
    }),
    // Open quotes value
    prisma.quote.aggregate({
      where: { status: { in: ["DRAFT", "SENT"] } },
      _sum: { totalAmount: true },
    }),
    // Pending payments total
    prisma.payment.aggregate({
      where: { status: { in: ["PENDING", "PARTIAL"] } },
      _sum: { amount: true },
    }),
    // Open quotes count
    prisma.quote.count({
      where: { status: { in: ["DRAFT", "SENT"] } },
    }),
    // Sent quotes this month (for conversion rate)
    prisma.quote.count({
      where: {
        status: { in: ["SENT", "APPROVED", "REJECTED"] },
        createdAt: { gte: startOfMonth, lte: endOfMonth },
      },
    }),
    // Approved quotes this month
    prisma.quote.count({
      where: {
        status: "APPROVED",
        createdAt: { gte: startOfMonth, lte: endOfMonth },
      },
    }),
    // Pending quotes (SENT, awaiting response) for action items
    prisma.quote.findMany({
      where: { status: "SENT" },
      select: {
        id: true,
        quoteNumber: true,
        totalAmount: true,
        createdAt: true,
        notes: true,
        client: { select: { id: true, name: true } },
        items: { take: 1, select: { description: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
    // Upcoming events (next 14 days)
    prisma.order.findMany({
      where: {
        eventDate: { gte: now, lte: fourteenDaysFromNow },
        status: { in: ["CONFIRMED", "IN_PROGRESS"] },
      },
      select: {
        id: true,
        orderNumber: true,
        eventDate: true,
        eventLocation: true,
        totalAmount: true,
        client: { select: { id: true, name: true } },
        items: { take: 1, select: { description: true } },
      },
      orderBy: { eventDate: "asc" },
    }),
    // Recent activities (last 10)
    prisma.activity.findMany({
      orderBy: { date: "desc" },
      take: 10,
      select: {
        id: true,
        type: true,
        subject: true,
        content: true,
        date: true,
        client: { select: { id: true, name: true } },
      },
    }),
  ]);

  // Outstanding payments count (orders with unpaid balance)
  const ordersWithPayments = await prisma.order.findMany({
    where: { status: { in: ["CONFIRMED", "IN_PROGRESS", "COMPLETED"] } },
    select: {
      totalAmount: true,
      payments: { where: { status: "PAID" }, select: { amount: true } },
    },
  });
  const outstandingOrdersCount = ordersWithPayments.filter((o) => {
    const paid = o.payments.reduce((sum, p) => sum + Number(p.amount), 0);
    return paid < Number(o.totalAmount);
  }).length;

  // Revenue by month (last 6 months)
  const revenueByMonth: { month: string; total: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
    const label = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const agg = await prisma.payment.aggregate({
      where: { status: "PAID", date: { gte: start, lte: end } },
      _sum: { amount: true },
    });
    revenueByMonth.push({ month: label, total: Number(agg._sum.amount ?? 0) });
  }

  const monthlyRevenue = Number(paidThisMonth._sum.amount ?? 0);
  const lastMonthRevenue = Number(paidLastMonth._sum.amount ?? 0);
  const hebrewMonthNames = ["ינואר","פברואר","מרץ","אפריל","מאי","יוני","יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר"];

  return {
    kpis: {
      monthlyRevenue,
      lastMonthRevenue,
      currentMonthName: hebrewMonthNames[now.getMonth()] ?? "",
      openQuotesValue: Number(openQuotes._sum.totalAmount ?? 0),
      openQuotesCount,
      pendingPayments: Number(pendingPayments._sum.amount ?? 0),
      outstandingOrdersCount,
      conversionRate: sentQuotesThisMonth > 0
        ? Math.round((approvedQuotesThisMonth / sentQuotesThisMonth) * 100)
        : 0,
    },
    pendingQuotes: pendingQuotesList.map((q) => ({
      ...q,
      totalAmount: Number(q.totalAmount),
      daysSinceSent: Math.floor((now.getTime() - new Date(q.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
      description: q.items[0]?.description ?? q.notes ?? "",
    })),
    upcomingEvents: upcomingEventsList.map((o) => ({
      ...o,
      totalAmount: Number(o.totalAmount),
      daysUntil: o.eventDate
        ? Math.ceil((new Date(o.eventDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        : null,
      description: o.items[0]?.description ?? "",
    })),
    recentActivities,
    revenueByMonth,
  };
}
