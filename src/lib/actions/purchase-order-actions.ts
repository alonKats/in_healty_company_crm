"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { PurchaseOrderStatus } from "@/generated/prisma";

interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export async function createPurchaseOrder(data: {
  providerId: string;
  items: LineItem[];
  notes?: string;
}) {
  const totalAmount = data.items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );

  await prisma.purchaseOrder.create({
    data: {
      providerId: data.providerId,
      items: JSON.parse(JSON.stringify(data.items)),
      totalAmount,
      notes: data.notes || null,
    },
  });

  revalidatePath(`/providers/${data.providerId}`);
}

export async function updatePurchaseOrderStatus(
  id: string,
  status: PurchaseOrderStatus,
  providerId: string
) {
  await prisma.purchaseOrder.update({
    where: { id },
    data: { status },
  });

  revalidatePath(`/providers/${providerId}`);
}
