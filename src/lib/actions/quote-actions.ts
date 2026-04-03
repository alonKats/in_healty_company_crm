"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { QuoteStatus } from "@/generated/prisma";

interface QuoteItemInput {
  serviceId?: string;
  category?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  costPerUnit?: number;
  notes?: string;
  sortOrder: number;
}

export async function createQuote(formData: FormData) {
  const clientId = formData.get("clientId") as string;
  const assignedToId = formData.get("assignedToId") as string | null;
  const source = formData.get("source") as string;
  const eventDate = formData.get("eventDate") as string | null;
  const validUntil = formData.get("validUntil") as string | null;
  const notes = formData.get("notes") as string | null;
  const terms = formData.get("terms") as string | null;
  const itemsJson = formData.get("items") as string;

  const items: QuoteItemInput[] = itemsJson ? JSON.parse(itemsJson) : [];

  const totalAmount = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );

  const quote = await prisma.quote.create({
    data: {
      clientId,
      assignedToId: assignedToId || null,
      source: (source as "OUTBOUND" | "INBOUND" | "REFERRAL") ?? "OUTBOUND",
      eventDate: eventDate ? new Date(eventDate) : null,
      validUntil: validUntil ? new Date(validUntil) : null,
      notes: notes || null,
      terms: terms || null,
      totalAmount,
      items: {
        create: items.map((item) => ({
          serviceId: item.serviceId || null,
          category: item.category || null,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          costPerUnit: item.costPerUnit ?? null,
          total: item.quantity * item.unitPrice,
          notes: item.notes || null,
          sortOrder: item.sortOrder,
        })),
      },
    },
  });

  redirect(`/quotes/${quote.id}`);
}

export async function updateQuoteStatus(id: string, status: QuoteStatus) {
  await prisma.quote.update({
    where: { id },
    data: { status },
  });

  revalidatePath(`/quotes/${id}`);
  revalidatePath("/quotes");
}

export async function createOrderFromQuote(quoteId: string) {
  const quote = await prisma.quote.findUniqueOrThrow({
    where: { id: quoteId },
    include: { items: true },
  });

  const orderType = quote.items.length > 1 ? "BUNDLE" : "SINGLE";

  const order = await prisma.order.create({
    data: {
      clientId: quote.clientId,
      quoteId: quote.id,
      type: orderType,
      eventDate: quote.eventDate,
      totalAmount: quote.totalAmount,
      notes: quote.notes,
      items: {
        create: quote.items.map((item) => ({
          serviceId: item.serviceId ?? null,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          costPerUnit: item.costPerUnit ?? null,
          total: item.total,
          notes: item.notes ?? null,
        })),
      },
    },
  });

  redirect(`/orders/${order.id}`);
}
