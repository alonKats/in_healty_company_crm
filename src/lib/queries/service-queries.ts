import { prisma } from "@/lib/prisma";

export async function getServices() {
  return prisma.service.findMany({
    include: {
      category: true,
      costItems: true,
    },
    orderBy: [
      { category: { sortOrder: "asc" } },
      { name: "asc" },
    ],
  });
}

export async function getServiceById(id: string) {
  return prisma.service.findUnique({
    where: { id },
    include: {
      category: true,
      costItems: true,
    },
  });
}

export async function getCategories() {
  return prisma.category.findMany({
    include: {
      children: true,
      parent: true,
    },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getActiveServices() {
  return prisma.service.findMany({
    where: { status: "ACTIVE" },
    include: {
      category: true,
      costItems: true,
    },
    orderBy: [
      { category: { sortOrder: "asc" } },
      { name: "asc" },
    ],
  });
}
