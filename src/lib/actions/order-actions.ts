"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { OrderStatus } from "@/generated/prisma";
import { triggerAutoTasks } from "./task-actions";

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

  try {
    await triggerAutoTasks({ type: "ORDER_CREATED", clientId, relatedId: order.id, relatedType: "order" });
  } catch (e) {
    console.error("Auto-trigger failed:", e);
  }

  redirect(`/orders/${order.id}`);
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  await prisma.order.update({
    where: { id },
    data: { status },
  });

  if (status === "COMPLETED") {
    const order = await prisma.order.findUnique({ where: { id }, select: { clientId: true } });
    if (order?.clientId) {
      try {
        await triggerAutoTasks({
          type: "EVENT_COMPLETED",
          clientId: order.clientId,
          relatedId: id,
          relatedType: "order",
        });
      } catch (e) {
        console.error("Auto-trigger failed:", e);
      }
    }
  }

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

export async function deleteOrder(orderId: string) {
  const order = await prisma.order.findUniqueOrThrow({
    where: { id: orderId },
    select: { payments: { select: { id: true } } },
  });

  if (order.payments.length > 0) {
    throw new Error("לא ניתן למחוק הזמנה עם תשלומים רשומים");
  }

  await prisma.order.delete({ where: { id: orderId } });
  revalidatePath("/orders");
  redirect("/orders");
}

export async function updatePayment(paymentId: string, orderId: string, formData: FormData) {
  const amount = Number(formData.get("amount"));
  const method = formData.get("method") as string;
  const date = formData.get("date") as string;
  const invoiceNumber = formData.get("invoiceNumber") as string | null;
  const status = formData.get("status") as string;
  const notes = formData.get("notes") as string | null;

  await prisma.payment.update({
    where: { id: paymentId },
    data: {
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
