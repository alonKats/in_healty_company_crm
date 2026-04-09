"use client";

import { useState, useTransition } from "react";
import { ReceiptIcon, ExternalLinkIcon, LoaderIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createInvoiceFromOrder } from "@/lib/actions/invoice-actions";

interface CreateInvoiceButtonProps {
  orderId: string;
  invoiceId?: string | null;
  invoiceUrl?: string | null;
}

export function CreateInvoiceButton({
  orderId,
  invoiceId,
  invoiceUrl,
}: CreateInvoiceButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [localInvoiceUrl, setLocalInvoiceUrl] = useState<string | null>(
    invoiceUrl ?? null
  );
  const [localInvoiceId, setLocalInvoiceId] = useState<string | null>(
    invoiceId ?? null
  );

  // Already has an invoice — show a link instead
  if (localInvoiceId && localInvoiceUrl) {
    return (
      <a
        href={localInvoiceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors"
      >
        <ReceiptIcon className="h-4 w-4" />
        צפה בחשבונית
        <ExternalLinkIcon className="h-3 w-3" />
      </a>
    );
  }

  function handleCreate() {
    startTransition(async () => {
      try {
        const result = await createInvoiceFromOrder(orderId);
        setLocalInvoiceId(result.invoiceId);
        setLocalInvoiceUrl(result.invoiceUrl);
        toast.success("חשבונית נוצרה בהצלחה", {
          description: "החשבונית נשמרה ב-Green Invoice",
          action: result.invoiceUrl
            ? {
                label: "פתח חשבונית",
                onClick: () => window.open(result.invoiceUrl, "_blank"),
              }
            : undefined,
        });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "שגיאה לא ידועה";
        toast.error("שגיאה ביצירת חשבונית", { description: message });
      }
    });
  }

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handleCreate}
      disabled={isPending}
      className="gap-1.5"
    >
      {isPending ? (
        <LoaderIcon className="h-4 w-4 animate-spin" />
      ) : (
        <ReceiptIcon className="h-4 w-4" />
      )}
      {isPending ? "יוצר חשבונית..." : "צור חשבונית"}
    </Button>
  );
}
