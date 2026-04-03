import { prisma } from "@/lib/prisma";
import type { ClientStatus } from "@/generated/prisma";

interface ClientFilters {
  search?: string;
  status?: ClientStatus;
}

export async function getClients(filters?: ClientFilters) {
  const where: Record<string, unknown> = {};

  if (filters?.status) {
    where.status = filters.status;
  }

  if (filters?.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { company: { contains: filters.search, mode: "insensitive" } },
      { email: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  return prisma.client.findMany({
    where,
    include: {
      assignedTo: { select: { id: true, name: true } },
      quotes: { where: { status: { in: ["DRAFT", "SENT"] } }, select: { id: true } },
      activities: { orderBy: { date: "desc" }, take: 1, select: { date: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getClientById(id: string) {
  return prisma.client.findUnique({
    where: { id },
    include: {
      assignedTo: { select: { id: true, name: true } },
      contacts: true,
      activities: {
        orderBy: { date: "desc" },
        include: { createdBy: { select: { id: true, name: true } } },
      },
      quotes: {
        orderBy: { createdAt: "desc" },
        include: { assignedTo: { select: { id: true, name: true } } },
      },
      orders: {
        orderBy: { createdAt: "desc" },
      },
    },
  });
}
