import { prisma } from "@/lib/prisma";
import type { ExpenseCategory } from "@/generated/prisma";

interface ExpenseFilters {
  dateFrom?: string;
  dateTo?: string;
  category?: ExpenseCategory;
}

export async function getExpenses(filters?: ExpenseFilters) {
  const where: Record<string, unknown> = {};

  if (filters?.category) {
    where.category = filters.category;
  }

  if (filters?.dateFrom || filters?.dateTo) {
    where.date = {};
    if (filters.dateFrom) {
      (where.date as Record<string, unknown>).gte = new Date(filters.dateFrom);
    }
    if (filters.dateTo) {
      (where.date as Record<string, unknown>).lte = new Date(filters.dateTo);
    }
  }

  return prisma.expense.findMany({
    where,
    orderBy: { date: "desc" },
  });
}

export async function getExpenseById(id: string) {
  return prisma.expense.findUnique({ where: { id } });
}

export async function getMonthlyExpenseSummary() {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const expenses = await prisma.expense.findMany({
    where: { date: { gte: sixMonthsAgo } },
    select: { date: true, amount: true },
    orderBy: { date: "asc" },
  });

  const monthMap: Record<string, number> = {};

  for (const expense of expenses) {
    const date = new Date(expense.date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    monthMap[key] = (monthMap[key] ?? 0) + Number(expense.amount);
  }

  return Object.entries(monthMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, total]) => ({ month, total }));
}
