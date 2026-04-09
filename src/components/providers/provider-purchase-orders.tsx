"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PurchaseOrderList } from "./purchase-order-list";
import { CreatePurchaseOrderDialog } from "./create-purchase-order-dialog";
import type { PurchaseOrder } from "@/generated/prisma";

interface ProviderPurchaseOrdersProps {
  orders: PurchaseOrder[];
  providerId: string;
}

export function ProviderPurchaseOrders({ orders, providerId }: ProviderPurchaseOrdersProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
          הזמנות רכש
        </h3>
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 ml-1" />
          הזמנה חדשה
        </Button>
      </div>
      <PurchaseOrderList orders={orders} providerId={providerId} />
      <CreatePurchaseOrderDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        providerId={providerId}
      />
    </div>
  );
}
