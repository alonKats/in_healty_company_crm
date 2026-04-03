import { prisma } from "@/lib/prisma";

export async function getOrders() {
  return prisma.order.findMany({
    include: {
      client: { select: { id: true, name: true } },
      items: { select: { id: true } },
      payments: { select: { id: true, status: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getOrderById(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, name: true, company: true } },
      quote: { select: { id: true, quoteNumber: true } },
      items: {
        include: {
          service: { select: { id: true, name: true } },
        },
      },
      payments: {
        orderBy: { date: "asc" },
      },
    },
  });
}
