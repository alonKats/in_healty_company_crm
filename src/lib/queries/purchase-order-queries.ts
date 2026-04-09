import { prisma } from "@/lib/prisma";

export async function getPurchaseOrdersByProvider(providerId: string) {
  return prisma.purchaseOrder.findMany({
    where: { providerId },
    include: { provider: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAllPurchaseOrders() {
  return prisma.purchaseOrder.findMany({
    include: { provider: true },
    orderBy: { createdAt: "desc" },
  });
}
