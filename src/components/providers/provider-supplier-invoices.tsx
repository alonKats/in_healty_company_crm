"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { SupplierInvoiceList } from "./supplier-invoice-list";
import { AddSupplierInvoiceDialog } from "./add-supplier-invoice-dialog";
import type { SupplierInvoice } from "@/generated/prisma";

interface ProviderSupplierInvoicesProps {
  invoices: SupplierInvoice[];
  providerId: string;
}

export function ProviderSupplierInvoices({ invoices, providerId }: ProviderSupplierInvoicesProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
          חשבוניות ספק
        </h3>
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 ml-1" />
          חשבונית חדשה
        </Button>
      </div>
      <SupplierInvoiceList invoices={invoices} />
      <AddSupplierInvoiceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        providerId={providerId}
      />
    </div>
  );
}
