import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  // Find ACTIVE clients with no activity in the last 90 days
  // (includes clients with zero activities who were created > 90 days ago)
  const inactiveClients = await prisma.client.findMany({
    where: {
      status: "ACTIVE",
      OR: [
        {
          activities: {
            none: { date: { gte: ninetyDaysAgo } },
          },
          createdAt: { lt: ninetyDaysAgo },
        },
      ],
    },
    select: { id: true, name: true },
  });

  let created = 0;

  for (const client of inactiveClients) {
    // Skip if an open AUTO_CLIENT_INACTIVE task already exists
    const existingTask = await prisma.task.findFirst({
      where: {
        clientId: client.id,
        trigger: "AUTO_CLIENT_INACTIVE",
        status: "PENDING",
      },
    });

    if (!existingTask) {
      await prisma.task.create({
        data: {
          clientId: client.id,
          title: "לקוח לא פעיל — יש ליצור קשר",
          description:
            "לא הייתה פעילות מול הלקוח הזה ב-3 החודשים האחרונים",
          type: "RE_ENGAGEMENT",
          priority: "MEDIUM",
          status: "PENDING",
          trigger: "AUTO_CLIENT_INACTIVE",
          dueDate: new Date(),
        },
      });
      created++;
    }
  }

  return Response.json({
    ok: true,
    inactiveClientsFound: inactiveClients.length,
    tasksCreated: created,
  });
}
