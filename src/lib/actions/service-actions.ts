"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { CostItemType, ServiceSourceType, ServiceStatus } from "@/generated/prisma";

interface CostItemInput {
  description: string;
  amount: number;
  type: CostItemType;
}

interface PackageItemInput {
  serviceId: string;
  quantity: number;
}

export async function createService(formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string | null;
  const categoryId = formData.get("categoryId") as string;
  const sourceType = formData.get("sourceType") as ServiceSourceType;
  const basePrice = parseFloat(formData.get("basePrice") as string);
  const costItemsJson = formData.get("costItems") as string;
  const isPackage = formData.get("isPackage") === "true";
  const packageItemsJson = formData.get("packageItems") as string;

  const costItems: CostItemInput[] = costItemsJson ? JSON.parse(costItemsJson) : [];
  const packageItems: PackageItemInput[] = packageItemsJson ? JSON.parse(packageItemsJson) : [];

  await prisma.service.create({
    data: {
      name,
      description: description || null,
      categoryId,
      sourceType,
      basePrice,
      status: "ACTIVE",
      isPackage,
      costItems: {
        create: costItems.map((item) => ({
          description: item.description,
          amount: item.amount,
          type: item.type,
        })),
      },
      ...(isPackage && packageItems.length > 0
        ? {
            packageItems: {
              create: packageItems.map((pi) => ({
                serviceId: pi.serviceId,
                quantity: pi.quantity,
              })),
            },
          }
        : {}),
    },
  });

  revalidatePath("/services");
  redirect("/services");
}

export async function updateService(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string | null;
  const categoryId = formData.get("categoryId") as string;
  const sourceType = formData.get("sourceType") as ServiceSourceType;
  const basePrice = parseFloat(formData.get("basePrice") as string);
  const status = formData.get("status") as ServiceStatus;
  const costItemsJson = formData.get("costItems") as string;
  const isPackage = formData.get("isPackage") === "true";
  const packageItemsJson = formData.get("packageItems") as string;

  const costItems: CostItemInput[] = costItemsJson ? JSON.parse(costItemsJson) : [];
  const packageItems: PackageItemInput[] = packageItemsJson ? JSON.parse(packageItemsJson) : [];

  await prisma.$transaction([
    prisma.costItem.deleteMany({ where: { serviceId: id } }),
    prisma.packageItem.deleteMany({ where: { packageId: id } }),
    prisma.service.update({
      where: { id },
      data: {
        name,
        description: description || null,
        categoryId,
        sourceType,
        basePrice,
        status,
        isPackage,
        costItems: {
          create: costItems.map((item) => ({
            description: item.description,
            amount: item.amount,
            type: item.type,
          })),
        },
        ...(isPackage && packageItems.length > 0
          ? {
              packageItems: {
                create: packageItems.map((pi) => ({
                  serviceId: pi.serviceId,
                  quantity: pi.quantity,
                })),
              },
            }
          : {}),
      },
    }),
  ]);

  revalidatePath("/services");
  redirect("/services");
}

export async function deleteService(id: string) {
  await prisma.service.delete({ where: { id } });

  revalidatePath("/services");
  redirect("/services");
}
