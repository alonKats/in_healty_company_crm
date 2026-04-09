"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function createSupplierInvoice(data: {
  providerId: string;
  invoiceNumber: string;
  amount: number;
  date: string;
  description?: string;
  notes?: string;
}) {
  await prisma.supplierInvoice.create({
    data: {
      providerId: data.providerId,
      invoiceNumber: data.invoiceNumber,
      amount: data.amount,
      date: new Date(data.date),
      description: data.description || null,
      notes: data.notes || null,
    },
  });

  revalidatePath(`/providers/${data.providerId}`);
}
