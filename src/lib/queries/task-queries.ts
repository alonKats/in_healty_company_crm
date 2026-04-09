import { prisma } from "@/lib/prisma";
import type { TaskStatus } from "@/generated/prisma";

interface TaskFilters {
  assignedToId?: string;
  status?: TaskStatus;
  limit?: number;
}

export async function getTasksDue(options?: TaskFilters) {
  const limit = options?.limit ?? 50;

  const where: Record<string, unknown> = {
    status: options?.status ?? "PENDING",
  };

  if (options?.assignedToId) {
    where.assignedToId = options.assignedToId;
  }

  return prisma.task.findMany({
    where,
    include: {
      client: { select: { id: true, name: true, company: true } },
      assignedTo: { select: { id: true, name: true } },
    },
    orderBy: [
      {
        priority: "asc", // HIGH < MEDIUM < LOW alphabetically — we handle this via Prisma enum ordering
      },
      {
        dueDate: "asc",
      },
    ],
    take: limit,
  });
}

export async function getTasksByClient(clientId: string) {
  return prisma.task.findMany({
    where: { clientId },
    include: {
      assignedTo: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getOverdueTasks() {
  return prisma.task.findMany({
    where: {
      status: "PENDING",
      dueDate: { lt: new Date() },
    },
    include: {
      client: { select: { id: true, name: true, company: true } },
      assignedTo: { select: { id: true, name: true } },
    },
    orderBy: { dueDate: "asc" },
  });
}

export async function getAllTasks(limit = 100) {
  return prisma.task.findMany({
    include: {
      client: { select: { id: true, name: true, company: true } },
      assignedTo: { select: { id: true, name: true } },
    },
    orderBy: [{ createdAt: "desc" }],
    take: limit,
  });
}

export async function getTaskStats() {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [pending, overdue, completedThisWeek] = await Promise.all([
    prisma.task.count({
      where: { status: "PENDING" },
    }),
    prisma.task.count({
      where: {
        status: "PENDING",
        dueDate: { lt: now },
      },
    }),
    prisma.task.count({
      where: {
        status: "COMPLETED",
        completedAt: { gte: sevenDaysAgo },
      },
    }),
  ]);

  return { pending, overdue, completedThisWeek };
}
