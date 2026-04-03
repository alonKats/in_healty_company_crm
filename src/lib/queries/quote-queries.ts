import { prisma } from "@/lib/prisma";
import type { QuoteStatus } from "@/generated/prisma";

interface QuoteFilters {
  status?: QuoteStatus;
}

export async function getQuotes(filters?: QuoteFilters) {
  return prisma.quote.findMany({
    where: filters?.status ? { status: filters.status } : undefined,
    include: {
      client: { select: { id: true, name: true, company: true } },
      assignedTo: { select: { id: true, name: true } },
      items: { select: { id: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getQuoteById(id: string) {
  return prisma.quote.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, name: true, company: true } },
      assignedTo: { select: { id: true, name: true } },
      items: {
        include: {
          service: { select: { id: true, name: true } },
        },
        orderBy: { sortOrder: "asc" },
      },
      orders: {
        select: { id: true, orderNumber: true, status: true },
      },
    },
  });
}
