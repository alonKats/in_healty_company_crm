import { TrendingUp, FileText, Clock, ShoppingCart, BarChart2 } from "lucide-react";

interface Kpis {
  monthlyRevenue: number;
  lastMonthRevenue: number;
  currentMonthName: string;
  activeQuotesValue: number;
  pendingPayments: number;
  activeOrdersCount: number;
  conversionRate: number;
}

function formatCurrency(amount: number) {
  return `₪${amount.toLocaleString("he-IL", { maximumFractionDigits: 0 })}`;
}

function revenueChange(current: number, previous: number): { pct: number; direction: "up" | "down" | "flat" } | null {
  if (previous === 0) return null;
  const pct = Math.round(((current - previous) / previous) * 100);
  if (pct === 0) return { pct: 0, direction: "flat" };
  return { pct: Math.abs(pct), direction: pct > 0 ? "up" : "down" };
}

interface KpiCardProps {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  badge?: string;
  badgeColor?: string;
  comparison?: React.ReactNode;
}

function KpiCard({ label, value, icon: Icon, iconBg, iconColor, badge, badgeColor, comparison }: KpiCardProps) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2">
      <div className="flex justify-between items-start">
        <span className={`${iconBg} ${iconColor} p-2 rounded-lg`}>
          <Icon className="w-5 h-5" />
        </span>
        {badge && (
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${badgeColor}`}>
            {badge}
          </span>
        )}
      </div>
      <div className="mt-4">
        <span className="text-slate-500 text-xs font-medium block">{label}</span>
        <span className="text-2xl font-bold text-slate-800">{value}</span>
        {comparison && (
          <span className="block text-xs mt-1">{comparison}</span>
        )}
      </div>
    </div>
  );
}

export function KpiCards({ kpis }: { kpis: Kpis }) {
  const change = revenueChange(kpis.monthlyRevenue, kpis.lastMonthRevenue);

  const revenueComparison = change ? (
    <span className={change.direction === "up" ? "text-green-600 font-semibold" : change.direction === "down" ? "text-red-500 font-semibold" : "text-slate-400"}>
      {change.direction === "up" ? "▲" : change.direction === "down" ? "▼" : "—"}{" "}
      {change.pct}% מהחודש הקודם
    </span>
  ) : (
    <span className="text-slate-400">אין נתוני השוואה</span>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
      <KpiCard
        label={`הכנסות ${kpis.currentMonthName}`}
        value={formatCurrency(kpis.monthlyRevenue)}
        icon={TrendingUp}
        iconBg="bg-teal-50"
        iconColor="text-teal-600"
        comparison={revenueComparison}
      />
      <KpiCard
        label="הצעות פתוחות"
        value={formatCurrency(kpis.activeQuotesValue)}
        icon={FileText}
        iconBg="bg-orange-50"
        iconColor="text-orange-500"
        badge="פתוחות"
        badgeColor="text-slate-400 bg-slate-50"
      />
      <KpiCard
        label="תשלומים ממתינים"
        value={formatCurrency(kpis.pendingPayments)}
        icon={Clock}
        iconBg="bg-amber-50"
        iconColor="text-amber-500"
        badge="דחוף"
        badgeColor="text-amber-600 bg-amber-50"
      />
      <KpiCard
        label="הזמנות פעילות"
        value={kpis.activeOrdersCount}
        icon={ShoppingCart}
        iconBg="bg-blue-50"
        iconColor="text-blue-500"
        badge="בביצוע"
        badgeColor="text-blue-600 bg-blue-50"
      />
      <KpiCard
        label="אחוז המרה"
        value={`${kpis.conversionRate}%`}
        icon={BarChart2}
        iconBg="bg-teal-50"
        iconColor="text-teal-600"
        badge={`${kpis.currentMonthName}`}
        badgeColor="text-slate-400 bg-slate-50"
      />
    </div>
  );
}
