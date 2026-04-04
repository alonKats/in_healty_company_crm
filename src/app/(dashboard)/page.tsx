import { getDashboardData } from "@/lib/queries/dashboard-queries";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { ActionItems } from "@/components/dashboard/action-items";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { serialize } from "@/lib/utils";

export default async function DashboardPage() {
  const data = serialize(await getDashboardData());
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">לוח בקרה</h1>
        <p className="text-slate-500 text-sm mt-1">סקירה כללית של ביצועי החברה</p>
      </div>

      {/* Action Items — top priority */}
      <ActionItems
        pendingQuotes={data.pendingQuotes}
        upcomingEvents={data.upcomingEvents}
      />

      {/* Financial KPIs */}
      <KpiCards kpis={data.kpis} />

      {/* Revenue trend + Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart data={data.revenueByMonth} />
        <RecentActivity activities={data.recentActivities} />
      </div>
    </div>
  );
}
