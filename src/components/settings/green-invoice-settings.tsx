"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { testGreenInvoiceConnection } from "@/lib/actions/settings-actions";

type ConnectionStatus =
  | { state: "idle" }
  | { state: "success"; businessName: string }
  | { state: "error"; message: string };

export function GreenInvoiceSettings() {
  const [status, setStatus] = useState<ConnectionStatus>({ state: "idle" });
  const [isPending, startTransition] = useTransition();

  function handleTest() {
    startTransition(async () => {
      const result = await testGreenInvoiceConnection();
      if (result.success) {
        setStatus({ state: "success", businessName: result.businessName });
      } else {
        setStatus({ state: "error", message: result.error });
      }
    });
  }

  return (
    <div className="space-y-4 mt-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">חשבונית ירוקה (Green Invoice)</CardTitle>
          <CardDescription>חיבור למערכת חשבוניות</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button onClick={handleTest} disabled={isPending} variant="outline">
              {isPending ? "בודק..." : "בדיקת חיבור"}
            </Button>

            {status.state === "success" && (
              <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
                <span aria-hidden="true">✓</span>
                מחובר —{" "}
                <span className="font-semibold">{status.businessName}</span>
              </span>
            )}

            {status.state === "error" && (
              <span className="flex items-center gap-1.5 text-sm text-red-600 font-medium">
                <span aria-hidden="true">✗</span>
                שגיאה: {status.message}
              </span>
            )}
          </div>

          <p className="text-xs text-slate-500">
            מפתחות ה-API מוגדרים דרך משתני סביבה (
            <code className="font-mono">GREEN_INVOICE_API_KEY_ID</code> /{" "}
            <code className="font-mono">GREEN_INVOICE_API_KEY_SECRET</code>).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
