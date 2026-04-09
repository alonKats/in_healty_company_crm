import { prisma } from "@/lib/prisma";
import { searchDocuments } from "@/lib/services/green-invoice";

export async function GET(request: Request) {
  // Auth check
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Guard against missing GI env vars
  if (
    !process.env.GREEN_INVOICE_API_KEY_ID ||
    !process.env.GREEN_INVOICE_API_KEY_SECRET
  ) {
    return Response.json({
      ok: false,
      message: "Green Invoice env vars not configured",
    });
  }

  try {
    // Fetch GI documents updated in the last 2 hours
    const twoHoursAgo = new Date();
    twoHoursAgo.setHours(twoHoursAgo.getHours() - 2);
    const fromDate = twoHoursAgo.toISOString().split("T")[0]; // YYYY-MM-DD

    const result = await searchDocuments({
      fromDate,
      page: 1,
      pageSize: 50,
    });

    const docs: Record<string, unknown>[] = result?.items ?? result?.data ?? [];

    let paymentsUpdated = 0;
    let unmatched = 0;

    for (const doc of docs) {
      const docId = doc.id as string | undefined;
      const docStatus = doc.status as number | undefined;
      const docClientId = (doc.client as Record<string, unknown> | undefined)
        ?.id as string | undefined;

      // Try to match by invoiceId on Order
      const order = docId
        ? await prisma.order.findFirst({
            where: { invoiceId: docId },
            include: { payments: true },
          })
        : null;

      if (order) {
        // GI document status 10 = paid (מסמך שולם)
        const isPaid = docStatus === 10;

        if (isPaid) {
          // Mark any PENDING payments on this order as PAID
          const pendingPayments = order.payments.filter(
            (p) => p.status === "PENDING"
          );

          for (const payment of pendingPayments) {
            await prisma.payment.update({
              where: { id: payment.id },
              data: { status: "PAID" },
            });
            paymentsUpdated++;
          }
        }
      } else {
        // No order match — try to find CRM client by greenInvoiceId for logging
        const crmClient = docClientId
          ? await prisma.client.findFirst({
              where: { greenInvoiceId: docClientId },
              select: { id: true, name: true },
            })
          : null;

        console.log(
          `[gi-sync] Unmatched document: id=${docId}, status=${docStatus}, gi_client_id=${docClientId}, crm_client=${crmClient?.name ?? "none"}`
        );
        unmatched++;
      }
    }

    return Response.json({
      ok: true,
      documentsChecked: docs.length,
      paymentsUpdated,
      unmatched,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[gi-sync] error:", message);
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
