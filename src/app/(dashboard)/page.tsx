import { getDashboardData } from "@/lib/queries/dashboard-queries";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { PipelineKanban } from "@/components/dashboard/pipeline-kanban";
import { AttentionList } from "@/components/dashboard/attention-list";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { serialize } from "@/lib/utils";

export default async function DashboardPage() {
  const data = serialize(await getDashboardData());
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">לוח בקרה</h2>
      <KpiCards kpis={data.kpis} />
      <PipelineKanban pipeline={data.pipeline} />
      <div className="grid grid-cols-2 gap-6">
        <RevenueChart data={data.revenueByMonth} />
        <AttentionList items={data.needsAttention} />
      </div>
    </div>
  );
}
