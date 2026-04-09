import { getDashboardData } from "@/lib/queries/dashboard-queries";
import { getMonthlyFinancialSummary } from "@/lib/queries/green-invoice-queries";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { ActionItems } from "@/components/dashboard/action-items";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { FinancialSummary } from "@/components/dashboard/financial-summary";
import { serialize } from "@/lib/utils";

export default async function DashboardPage() {
  const [data, financialSummary] = await Promise.all([
    getDashboardData(),
    getMonthlyFinancialSummary(),
  ]);
  const serializedData = serialize(data);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">לוח בקרה</h1>
        <p className="text-slate-500 text-sm mt-1">סקירה כללית של ביצועי החברה</p>
      </div>

      {/* Action Items — top priority */}
      <ActionItems
        pendingQuotes={serializedData.pendingQuotes}
        upcomingEvents={serializedData.upcomingEvents}
      />

      {/* Financial KPIs */}
      <KpiCards kpis={serializedData.kpis} />

      {/* Revenue trend + Recent activity + GI Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart data={serializedData.revenueByMonth} />
        </div>
        <FinancialSummary data={financialSummary} />
      </div>

      <RecentActivity activities={serializedData.recentActivities} />
    </div>
  );
}
