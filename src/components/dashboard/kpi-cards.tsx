import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Kpis {
  monthlyRevenue: number;
  activeQuotesValue: number;
  pendingPayments: number;
  activeOrdersCount: number;
  conversionRate: number;
}

function formatCurrency(amount: number) {
  return `₪${amount.toLocaleString("he-IL", { maximumFractionDigits: 0 })}`;
}

export function KpiCards({ kpis }: { kpis: Kpis }) {
  return (
    <div className="grid grid-cols-5 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground font-normal">
            הכנסות החודש
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{formatCurrency(kpis.monthlyRevenue)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground font-normal">
            הצעות פתוחות
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{formatCurrency(kpis.activeQuotesValue)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground font-normal">
            תשלומים ממתינים
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{formatCurrency(kpis.pendingPayments)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground font-normal">
            הזמנות פעילות
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{kpis.activeOrdersCount}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground font-normal">
            אחוז המרה
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{kpis.conversionRate}%</p>
        </CardContent>
      </Card>
    </div>
  );
}
