"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ReportsClient } from "./reports-client";
import { FinancialReports } from "./financial-reports";
import { FileText, ShoppingCart, TrendingUp, CheckSquare } from "lucide-react";

interface Invoice {
  id: string;
  clientName: string;
  amount: number;
  status: number;
  date: string;
  type: number;
  url: string;
}

interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
}

interface MonthlySummary {
  income: number;
  expenses: number;
  profit: number;
  invoiceCount: number;
}

interface PeriodStats {
  newQuotes: number;
  confirmedOrders: number;
  revenue: number;
  completedTasks: number;
}

type Period = "daily" | "weekly" | "monthly" | "yearly";

interface ReportsPageClientProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  availableYears: number[];
  financials: {
    invoices: Invoice[] | null;
    expenses: Expense[] | null;
    summary: MonthlySummary | null;
  };
  activeTab: string;
  period: Period;
  periodStats: PeriodStats;
}

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: "daily", label: "יומי" },
  { value: "weekly", label: "שבועי" },
  { value: "monthly", label: "חודשי" },
  { value: "yearly", label: "שנתי" },
];

function fmt(n: number) {
  return `₪${n.toLocaleString("he-IL", { maximumFractionDigits: 0 })}`;
}

interface KpiCardProps {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
}

function KpiCard({ label, value, icon: Icon, iconBg, iconColor }: KpiCardProps) {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-1">
      <div className="flex justify-between items-start">
        <span className="text-slate-500 text-xs font-medium">{label}</span>
        <span className={`${iconBg} ${iconColor} p-2 rounded-lg`}>
          <Icon className="w-4 h-4" />
        </span>
      </div>
      <span className="text-2xl font-bold text-slate-800 mt-1">{value}</span>
    </div>
  );
}

export function ReportsPageClient({
  data,
  availableYears,
  financials,
  activeTab,
  period,
  periodStats,
}: ReportsPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handlePeriodChange(p: Period) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("period", p);
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleTabChange(tab: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">דוחות</h2>
        <p className="text-slate-500 text-sm mt-1">ניתוח ביצועים ותובנות עסקיות</p>
      </div>

      {/* Period selector */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-medium text-slate-600 ml-1">תקופה:</span>
        {PERIOD_OPTIONS.map((opt) => (
          <Button
            key={opt.value}
            variant={period === opt.value ? "default" : "outline"}
            size="sm"
            onClick={() => handlePeriodChange(opt.value)}
            className={
              period === opt.value
                ? "bg-teal-600 hover:bg-teal-700 text-white"
                : "text-slate-600 border-slate-200"
            }
          >
            {opt.label}
          </Button>
        ))}
      </div>

      {/* Period KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="הצעות חדשות"
          value={String(periodStats.newQuotes)}
          icon={FileText}
          iconBg="bg-blue-50"
          iconColor="text-blue-500"
        />
        <KpiCard
          label="הזמנות מאושרות"
          value={String(periodStats.confirmedOrders)}
          icon={ShoppingCart}
          iconBg="bg-teal-50"
          iconColor="text-teal-600"
        />
        <KpiCard
          label="הכנסות שנגבו"
          value={fmt(periodStats.revenue)}
          icon={TrendingUp}
          iconBg="bg-green-50"
          iconColor="text-green-600"
        />
        <KpiCard
          label="משימות שהושלמו"
          value={String(periodStats.completedTasks)}
          icon={CheckSquare}
          iconBg="bg-purple-50"
          iconColor="text-purple-500"
        />
      </div>

      <Tabs defaultValue={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="reports">ביצועים</TabsTrigger>
          <TabsTrigger value="financials">פיננסים</TabsTrigger>
        </TabsList>

        <TabsContent value="reports">
          <ReportsClient data={data} availableYears={availableYears} hideHeader />
        </TabsContent>

        <TabsContent value="financials">
          <FinancialReports
            invoices={financials.invoices}
            expenses={financials.expenses}
            summary={financials.summary}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
