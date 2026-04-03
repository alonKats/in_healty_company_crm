import { prisma } from "@/lib/prisma";

export async function getClientActivities(clientId: string) {
  return prisma.activity.findMany({
    where: { clientId },
    orderBy: { date: "desc" },
    include: {
      createdBy: { select: { id: true, name: true } },
    },
  });
}
