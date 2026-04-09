import { prisma } from "@/lib/prisma";

export async function getProviders() {
  return prisma.provider.findMany({
    include: {
      services: {
        include: { service: { include: { category: true } } },
      },
    },
    orderBy: { name: "asc" },
  });
}

export async function getProviderById(id: string) {
  return prisma.provider.findUnique({
    where: { id },
    include: {
      services: {
        include: { service: { include: { category: true } } },
      },
      purchaseOrders: {
        orderBy: { createdAt: "desc" },
      },
      supplierInvoices: {
        orderBy: { date: "desc" },
      },
    },
  });
}
