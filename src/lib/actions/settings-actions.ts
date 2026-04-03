"use server";

import { revalidatePath } from "next/cache";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { Role } from "@/generated/prisma";

// ── Users ──────────────────────────────────────────────

export async function createUser(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as Role;

  const passwordHash = await hash(password, 12);

  await prisma.user.create({
    data: { name, email, passwordHash, role },
  });

  revalidatePath("/settings");
}

export async function deleteUser(id: string) {
  await prisma.user.delete({ where: { id } });
  revalidatePath("/settings");
}

// ── Categories ─────────────────────────────────────────

export async function createCategory(formData: FormData) {
  const name = formData.get("name") as string;
  const parentId = (formData.get("parentId") as string) || null;
  const sortOrder = parseInt(formData.get("sortOrder") as string, 10) || 0;

  await prisma.category.create({
    data: { name, parentId, sortOrder },
  });

  revalidatePath("/settings");
}

export async function updateCategory(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const sortOrder = parseInt(formData.get("sortOrder") as string, 10) || 0;

  await prisma.category.update({
    where: { id },
    data: { name, sortOrder },
  });

  revalidatePath("/settings");
}

export async function deleteCategory(id: string) {
  await prisma.category.delete({ where: { id } });
  revalidatePath("/settings");
}
