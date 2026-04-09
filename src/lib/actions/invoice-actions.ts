"use server";

import { prisma } from "@/lib/prisma";
import { createClient, createDocument, searchClients } from "@/lib/services/green-invoice";
import { revalidatePath } from "next/cache";

// GI payment type: 1=cash, 2=check, 3=credit card, 4=bank transfer
const paymentMethodMap: Record<string, number> = {
  CASH: 1,
  CHECK: 2,
  CREDIT_CARD: 3,
  TRANSFER: 4,
};

export async function createInvoiceFromOrder(orderId: string) {
  // Check env vars before making any API calls
  if (!process.env.GREEN_INVOICE_API_KEY_ID || !process.env.GREEN_INVOICE_API_KEY_SECRET) {
    throw new Error("מפתחות Green Invoice לא מוגדרים — אנא הגדר אותם בהגדרות");
  }

  // 1. Fetch order with client, items, and paid payments
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      client: true,
      items: true,
      payments: { where: { status: "PAID" } },
    },
  });

  if (!order) throw new Error("הזמנה לא נמצאה");
  if (order.invoiceId) throw new Error("חשבונית כבר נוצרה עבור הזמנה זו");

  // 2. Ensure client exists in Green Invoice
  let giClientId = order.client.greenInvoiceId;

  if (!giClientId) {
    // Try to find by name first
    const searchResult = await searchClients(order.client.name);
    if (searchResult.items?.length > 0) {
      giClientId = searchResult.items[0].id as string;
    } else {
      // Create new client in GI
      const giClient = await createClient({
        name: order.client.name,
        email: order.client.email || undefined,
        phone: order.client.phone || undefined,
      });
      giClientId = giClient.id as string;
    }

    // Save GI client ID back to CRM
    await prisma.client.update({
      where: { id: order.client.id },
      data: { greenInvoiceId: giClientId },
    });
  }

  // 3. Build income lines from order items
  const income = order.items.map((item) => ({
    description: item.description,
    quantity: Number(item.quantity),
    price: Number(item.unitPrice),
    currency: "ILS" as const,
    vatType: 0, // VAT inclusive
  }));

  // 4. Build payment lines from recorded paid payments
  // Cast type to satisfy GI API — GI supports type 2 (check) even though our TS type omits it
  const payment: Array<{ type: 1 | 3 | 4; price: number; currency: "ILS" }> =
    order.payments.map((p) => ({
      type: (paymentMethodMap[p.method] ?? 4) as 1 | 3 | 4,
      price: Number(p.amount),
      currency: "ILS",
    }));

  // If no paid payments recorded, fall back to full order amount via bank transfer
  if (payment.length === 0) {
    payment.push({
      type: 4,
      price: Number(order.totalAmount),
      currency: "ILS",
    });
  }

  // 5. Create the document in Green Invoice (type 320 = Tax Invoice/Receipt)
  const doc = await createDocument({
    type: 320,
    client: {
      id: giClientId,
      name: order.client.name,
      emails: order.client.email ? [order.client.email] : [],
    },
    income,
    payment,
  });

  const invoiceId = doc.id as string;
  const invoiceUrl =
    (doc.url as string | undefined) ??
    `https://app.greeninvoice.co.il/documents/${invoiceId}`;

  // 6. Save invoice reference on the order
  await prisma.order.update({
    where: { id: orderId },
    data: { invoiceId, invoiceUrl },
  });

  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/orders");

  return { success: true, invoiceId, invoiceUrl };
}
