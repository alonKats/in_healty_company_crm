"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { OrderStatus } from "@/generated/prisma";

interface OrderItemInput {
  serviceId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  costPerUnit?: number;
  notes?: string;
  sortOrder: number;
}

export async function createOrder(formData: FormData) {
  const clientId = formData.get("clientId") as string;
  const quoteId = formData.get("quoteId") as string | null;
  const type = formData.get("type") as string;
  const eventDate = formData.get("eventDate") as string | null;
  const eventLocation = formData.get("eventLocation") as string | null;
  const notes = formData.get("notes") as string | null;
  const itemsJson = formData.get("items") as string;

  const items: OrderItemInput[] = itemsJson ? JSON.parse(itemsJson) : [];

  const totalAmount = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );

  const order = await prisma.order.create({
    data: {
      clientId,
      quoteId: quoteId || null,
      type: (type as "SINGLE" | "BUNDLE") ?? "SINGLE",
      eventDate: eventDate ? new Date(eventDate) : null,
      eventLocation: eventLocation || null,
      notes: notes || null,
      totalAmount,
      items: {
        create: items.map((item) => ({
          serviceId: item.serviceId || null,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          costPerUnit: item.costPerUnit ?? null,
          total: item.quantity * item.unitPrice,
          notes: item.notes || null,
        })),
      },
    },
  });

  redirect(`/orders/${order.id}`);
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  await prisma.order.update({
    where: { id },
    data: { status },
  });

  revalidatePath(`/orders/${id}`);
  revalidatePath("/orders");
}

export async function addPayment(orderId: string, formData: FormData) {
  const amount = Number(formData.get("amount"));
  const method = formData.get("method") as string;
  const date = formData.get("date") as string;
  const invoiceNumber = formData.get("invoiceNumber") as string | null;
  const status = formData.get("status") as string;
  const notes = formData.get("notes") as string | null;

  await prisma.payment.create({
    data: {
      orderId,
      amount,
      method: (method as "CASH" | "TRANSFER" | "CREDIT_CARD" | "CHECK") ?? "TRANSFER",
      date: new Date(date),
      invoiceNumber: invoiceNumber || null,
      status: (status as "PENDING" | "PAID" | "PARTIAL") ?? "PENDING",
      notes: notes || null,
    },
  });

  revalidatePath(`/orders/${orderId}`);
}

export async function deletePayment(paymentId: string, orderId: string) {
  await prisma.payment.delete({ where: { id: paymentId } });

  revalidatePath(`/orders/${orderId}`);
}
