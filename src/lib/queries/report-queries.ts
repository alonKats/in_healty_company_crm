import { prisma } from "@/lib/prisma";

export type ReportPeriod = "daily" | "weekly" | "monthly" | "yearly";

export function getPeriodStartDate(period: ReportPeriod): Date {
  const now = new Date();
  switch (period) {
    case "daily": {
      const d = new Date(now);
      d.setHours(0, 0, 0, 0);
      return d;
    }
    case "weekly": {
      const d = new Date(now);
      d.setDate(d.getDate() - d.getDay()); // Sunday
      d.setHours(0, 0, 0, 0);
      return d;
    }
    case "monthly":
      return new Date(now.getFullYear(), now.getMonth(), 1);
    case "yearly":
      return new Date(now.getFullYear(), 0, 1);
  }
}

export async function getPeriodStats(period: ReportPeriod) {
  const startDate = getPeriodStartDate(period);

  const [newQuotes, confirmedOrders, revenue, completedTasks] = await Promise.all([
    prisma.quote.count({ where: { createdAt: { gte: startDate } } }),
    prisma.order.count({ where: { status: "CONFIRMED", createdAt: { gte: startDate } } }),
    prisma.payment.aggregate({
      where: { status: "PAID", date: { gte: startDate } },
      _sum: { amount: true },
    }),
    prisma.task.count({ where: { status: "COMPLETED", completedAt: { gte: startDate } } }),
  ]);

  return {
    newQuotes,
    confirmedOrders,
    revenue: Number(revenue._sum.amount ?? 0),
    completedTasks,
  };
}

export async function getReportData(year: number) {
  const startOfYear = new Date(year, 0, 1);
  const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999);

  // Revenue by month
  const revenueByMonth: { month: string; total: number }[] = [];
  for (let m = 0; m < 12; m++) {
    const start = new Date(year, m, 1);
    const end = new Date(year, m + 1, 0, 23, 59, 59, 999);
    const agg = await prisma.payment.aggregate({
      where: { status: "PAID", date: { gte: start, lte: end } },
      _sum: { amount: true },
    });
    revenueByMonth.push({
      month: `${year}-${String(m + 1).padStart(2, "0")}`,
      total: Number(agg._sum.amount ?? 0),
    });
  }

  // Revenue by category
  const orderItems = await prisma.orderItem.findMany({
    where: {
      order: {
        status: { in: ["CONFIRMED", "IN_PROGRESS", "COMPLETED"] },
        createdAt: { gte: startOfYear, lte: endOfYear },
      },
    },
    select: {
      total: true,
      service: { select: { category: { select: { name: true } } } },
    },
  });

  const categoryMap = new Map<string, number>();
  for (const item of orderItems) {
    const cat = item.service?.category?.name ?? "ללא קטגוריה";
    categoryMap.set(cat, (categoryMap.get(cat) ?? 0) + Number(item.total));
  }
  const revenueByCategory = Array.from(categoryMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // Top 10 clients by revenue
  const orders = await prisma.order.findMany({
    where: {
      status: { in: ["CONFIRMED", "IN_PROGRESS", "COMPLETED"] },
      createdAt: { gte: startOfYear, lte: endOfYear },
    },
    select: {
      totalAmount: true,
      createdAt: true,
      client: { select: { id: true, name: true } },
    },
  });

  const clientMap = new Map<string, { name: string; revenue: number; orders: number; lastDate: Date }>();
  for (const o of orders) {
    const existing = clientMap.get(o.client.id);
    const amt = Number(o.totalAmount);
    if (existing) {
      existing.revenue += amt;
      existing.orders += 1;
      if (new Date(o.createdAt) > existing.lastDate) existing.lastDate = new Date(o.createdAt);
    } else {
      clientMap.set(o.client.id, { name: o.client.name, revenue: amt, orders: 1, lastDate: new Date(o.createdAt) });
    }
  }
  const topClients = Array.from(clientMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  // Supplier margins
  const providers = await prisma.provider.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      services: {
        select: {
          fee: true,
          service: {
            select: {
              orderItems: {
                where: {
                  order: {
                    createdAt: { gte: startOfYear, lte: endOfYear },
                    status: { in: ["CONFIRMED", "IN_PROGRESS", "COMPLETED"] },
                  },
                },
                select: { quantity: true, unitPrice: true, total: true },
              },
            },
          },
        },
      },
    },
  });

  const supplierMargins = providers
    .map((p) => {
      let totalRevenue = 0;
      let totalFees = 0;
      let orderCount = 0;
      for (const ps of p.services) {
        const fee = Number(ps.fee ?? 0);
        for (const oi of ps.service.orderItems) {
          totalRevenue += Number(oi.total);
          totalFees += fee * oi.quantity;
          orderCount++;
        }
      }
      const margin = totalRevenue - totalFees;
      const marginPct = totalRevenue > 0 ? (margin / totalRevenue) * 100 : 0;
      return { name: p.name, orderCount, totalRevenue, totalFees, margin, marginPct };
    })
    .filter((s) => s.orderCount > 0)
    .sort((a, b) => b.margin - a.margin);

  // Quote conversion funnel
  const [totalSent, totalApproved, totalOrdered] = await Promise.all([
    prisma.quote.count({
      where: { status: { in: ["SENT", "APPROVED", "REJECTED", "EXPIRED"] }, createdAt: { gte: startOfYear, lte: endOfYear } },
    }),
    prisma.quote.count({
      where: { status: "APPROVED", createdAt: { gte: startOfYear, lte: endOfYear } },
    }),
    prisma.quote.count({
      where: { status: "APPROVED", orders: { some: {} }, createdAt: { gte: startOfYear, lte: endOfYear } },
    }),
  ]);

  // Payment collection
  const [totalInvoiced, totalCollected] = await Promise.all([
    prisma.order.aggregate({
      where: { createdAt: { gte: startOfYear, lte: endOfYear }, status: { in: ["CONFIRMED", "IN_PROGRESS", "COMPLETED"] } },
      _sum: { totalAmount: true },
    }),
    prisma.payment.aggregate({
      where: { status: "PAID", date: { gte: startOfYear, lte: endOfYear } },
      _sum: { amount: true },
    }),
  ]);

  // Single vs Bundle
  const [singleOrders, bundleOrders] = await Promise.all([
    prisma.order.aggregate({
      where: { type: "SINGLE", createdAt: { gte: startOfYear, lte: endOfYear } },
      _count: true,
      _sum: { totalAmount: true },
    }),
    prisma.order.aggregate({
      where: { type: "BUNDLE", createdAt: { gte: startOfYear, lte: endOfYear } },
      _count: true,
      _sum: { totalAmount: true },
    }),
  ]);

  return {
    revenueByMonth,
    revenueByCategory,
    topClients,
    supplierMargins,
    quoteFunnel: { sent: totalSent, approved: totalApproved, ordered: totalOrdered },
    paymentCollection: {
      invoiced: Number(totalInvoiced._sum.totalAmount ?? 0),
      collected: Number(totalCollected._sum.amount ?? 0),
    },
    saleDistribution: {
      single: { count: singleOrders._count, revenue: Number(singleOrders._sum.totalAmount ?? 0) },
      bundle: { count: bundleOrders._count, revenue: Number(bundleOrders._sum.totalAmount ?? 0) },
    },
  };
}
