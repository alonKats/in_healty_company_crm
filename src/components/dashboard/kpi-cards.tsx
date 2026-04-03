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

interface KpiCardProps {
  label: string;
  value: string | number;
}

function KpiCard({ label, value }: KpiCardProps) {
  return (
    <Card className="border border-gray-200 bg-white rounded-lg overflow-hidden">
      <div className="h-1 w-full" style={{ backgroundColor: "#2A9D8F" }} />
      <CardHeader className="pb-2 pt-3">
        <CardTitle className="text-sm text-muted-foreground font-normal">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold" style={{ color: "#2A9D8F" }}>{value}</p>
      </CardContent>
    </Card>
  );
}

export function KpiCards({ kpis }: { kpis: Kpis }) {
  return (
    <div className="grid grid-cols-5 gap-4">
      <KpiCard label="הכנסות החודש" value={formatCurrency(kpis.monthlyRevenue)} />
      <KpiCard label="הצעות פתוחות" value={formatCurrency(kpis.activeQuotesValue)} />
      <KpiCard label="תשלומים ממתינים" value={formatCurrency(kpis.pendingPayments)} />
      <KpiCard label="הזמנות פעילות" value={kpis.activeOrdersCount} />
      <KpiCard label="אחוז המרה" value={`${kpis.conversionRate}%`} />
    </div>
  );
}
