import { TrendingUp, FileText, Clock, BarChart2 } from "lucide-react";

interface Kpis {
  monthlyRevenue: number;
  lastMonthRevenue: number;
  currentMonthName: string;
  openQuotesValue: number;
  openQuotesCount: number;
  pendingPayments: number;
  outstandingOrdersCount: number;
  conversionRate: number;
}

function formatCurrency(amount: number) {
  return `₪${amount.toLocaleString("he-IL", { maximumFractionDigits: 0 })}`;
}

interface KpiCardProps {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  subtitle: React.ReactNode;
}

function KpiCard({ label, value, icon: Icon, iconBg, iconColor, subtitle }: KpiCardProps) {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-1">
      <div className="flex justify-between items-start">
        <span className="text-slate-500 text-xs font-medium">{label}</span>
        <span className={`${iconBg} ${iconColor} p-2 rounded-lg`}>
          <Icon className="w-4 h-4" />
        </span>
      </div>
      <span className="text-2xl font-bold text-slate-800 mt-1">{value}</span>
      <span className="text-xs text-slate-500 mt-0.5">{subtitle}</span>
    </div>
  );
}

export function KpiCards({ kpis }: { kpis: Kpis }) {
  const prevRevenue = kpis.lastMonthRevenue;
  let revenueSubtitle: React.ReactNode = "אין נתוני השוואה";
  if (prevRevenue > 0) {
    const pct = Math.round(((kpis.monthlyRevenue - prevRevenue) / prevRevenue) * 100);
    const isUp = pct >= 0;
    revenueSubtitle = (
      <span className={isUp ? "text-green-600 font-semibold" : "text-red-500 font-semibold"}>
        {isUp ? "▲" : "▼"} {Math.abs(pct)}% מהחודש הקודם
      </span>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <KpiCard
        label={`הכנסות ${kpis.currentMonthName}`}
        value={formatCurrency(kpis.monthlyRevenue)}
        icon={TrendingUp}
        iconBg="bg-teal-50"
        iconColor="text-teal-600"
        subtitle={revenueSubtitle}
      />
      <KpiCard
        label="תשלומים ממתינים"
        value={formatCurrency(kpis.pendingPayments)}
        icon={Clock}
        iconBg="bg-amber-50"
        iconColor="text-amber-500"
        subtitle={`${kpis.outstandingOrdersCount} הזמנות`}
      />
      <KpiCard
        label="ערך הצעות פתוחות"
        value={formatCurrency(kpis.openQuotesValue)}
        icon={FileText}
        iconBg="bg-blue-50"
        iconColor="text-blue-500"
        subtitle={`${kpis.openQuotesCount} הצעות`}
      />
      <KpiCard
        label="אחוז המרה"
        value={`${kpis.conversionRate}%`}
        icon={BarChart2}
        iconBg="bg-purple-50"
        iconColor="text-purple-500"
        subtitle="הצעות שאושרו מתוך שנשלחו"
      />
    </div>
  );
}
