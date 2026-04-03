"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import type { ActivityType, ActivityDirection } from "@/generated/prisma";

export async function createActivity(clientId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const type = formData.get("type") as ActivityType;
  const direction = formData.get("direction") as ActivityDirection;
  const dateStr = formData.get("date") as string;
  const subject = formData.get("subject") as string | null;
  const content = formData.get("content") as string;

  await prisma.activity.create({
    data: {
      clientId,
      type,
      direction: direction || "OUTBOUND",
      subject: subject || null,
      content,
      date: new Date(dateStr),
      createdById: session.user.id,
      source: "MANUAL",
    },
  });

  revalidatePath(`/clients/${clientId}`);
}
