"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { FeeType } from "@/generated/prisma";

interface ServiceLinkInput {
  serviceId: string;
  fee?: number | null;
}

export async function createProvider(formData: FormData) {
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string | null;
  const email = formData.get("email") as string | null;
  const specialty = formData.get("specialty") as string | null;
  const notes = formData.get("notes") as string | null;
  const feeType = formData.get("feeType") as FeeType;
  const defaultFeeStr = formData.get("defaultFee") as string | null;
  const defaultFee = defaultFeeStr ? parseFloat(defaultFeeStr) : null;
  const paymentTerms = (formData.get("paymentTerms") as string) || null;
  const bankDetails = (formData.get("bankDetails") as string) || null;
  const taxId = (formData.get("taxId") as string) || null;
  const servicesJson = formData.get("services") as string;
  const services: ServiceLinkInput[] = servicesJson ? JSON.parse(servicesJson) : [];

  const provider = await prisma.provider.create({
    data: {
      name,
      phone: phone || null,
      email: email || null,
      specialty: specialty || null,
      notes: notes || null,
      feeType,
      defaultFee,
      paymentTerms,
      bankDetails,
      taxId,
      services: {
        create: services.map((s) => ({
          serviceId: s.serviceId,
          fee: s.fee ?? null,
        })),
      },
    },
  });

  revalidatePath("/providers");
  redirect(`/providers/${provider.id}`);
}

export async function updateProvider(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string | null;
  const email = formData.get("email") as string | null;
  const specialty = formData.get("specialty") as string | null;
  const notes = formData.get("notes") as string | null;
  const feeType = formData.get("feeType") as FeeType;
  const defaultFeeStr = formData.get("defaultFee") as string | null;
  const defaultFee = defaultFeeStr ? parseFloat(defaultFeeStr) : null;
  const isActive = formData.get("isActive") === "true";
  const paymentTerms = (formData.get("paymentTerms") as string) || null;
  const bankDetails = (formData.get("bankDetails") as string) || null;
  const taxId = (formData.get("taxId") as string) || null;
  const servicesJson = formData.get("services") as string;
  const services: ServiceLinkInput[] = servicesJson ? JSON.parse(servicesJson) : [];

  await prisma.$transaction([
    prisma.providerService.deleteMany({ where: { providerId: id } }),
    prisma.provider.update({
      where: { id },
      data: {
        name,
        phone: phone || null,
        email: email || null,
        specialty: specialty || null,
        notes: notes || null,
        feeType,
        defaultFee,
        isActive,
        paymentTerms,
        bankDetails,
        taxId,
        services: {
          create: services.map((s) => ({
            serviceId: s.serviceId,
            fee: s.fee ?? null,
          })),
        },
      },
    }),
  ]);

  revalidatePath("/providers");
  redirect(`/providers/${id}`);
}

export async function deleteProvider(id: string) {
  await prisma.provider.delete({ where: { id } });

  revalidatePath("/providers");
  redirect("/providers");
}
