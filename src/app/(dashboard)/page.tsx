import { getDashboardData } from "@/lib/queries/dashboard-queries";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { PipelineKanban } from "@/components/dashboard/pipeline-kanban";
import { ActionStream } from "@/components/dashboard/action-stream";
import { MiniCalendar } from "@/components/dashboard/mini-calendar";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { serialize } from "@/lib/utils";

export default async function DashboardPage() {
  const data = serialize(await getDashboardData());
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">לוח בקרה</h1>
        <p className="text-slate-500 text-sm mt-1">סקירה כללית של ביצועי החברה</p>
      </div>
      <KpiCards kpis={data.kpis} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <ActionStream items={data.actionStream} />
        </div>
        <div className="lg:col-span-1">
          <MiniCalendar events={data.needsAttention.upcomingEvents} />
        </div>
      </div>
      <PipelineKanban pipeline={data.pipeline} />
      <RevenueChart data={data.revenueByMonth} />
    </div>
  );
}
