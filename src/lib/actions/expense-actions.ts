"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { ExpenseCategory, ExpensePaymentMethod } from "@/generated/prisma";

export async function createExpense(formData: FormData) {
  const date = new Date(formData.get("date") as string);
  const description = formData.get("description") as string;
  const category = formData.get("category") as ExpenseCategory;
  const amount = parseFloat(formData.get("amount") as string);
  const paymentMethod = formData.get("paymentMethod") as ExpensePaymentMethod;
  const notes = (formData.get("notes") as string) || null;

  await prisma.expense.create({
    data: {
      date,
      description,
      category,
      amount,
      paymentMethod,
      notes,
    },
  });

  revalidatePath("/expenses");
}

export async function updateExpense(id: string, formData: FormData) {
  const date = new Date(formData.get("date") as string);
  const description = formData.get("description") as string;
  const category = formData.get("category") as ExpenseCategory;
  const amount = parseFloat(formData.get("amount") as string);
  const paymentMethod = formData.get("paymentMethod") as ExpensePaymentMethod;
  const notes = (formData.get("notes") as string) || null;

  await prisma.expense.update({
    where: { id },
    data: {
      date,
      description,
      category,
      amount,
      paymentMethod,
      notes,
    },
  });

  revalidatePath("/expenses");
}

export async function deleteExpense(id: string) {
  await prisma.expense.delete({ where: { id } });
  revalidatePath("/expenses");
}
