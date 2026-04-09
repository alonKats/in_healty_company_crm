import { getReportData, getPeriodStats, type ReportPeriod } from "@/lib/queries/report-queries";
import {
  getRecentInvoices,
  getRecentExpenses,
  getMonthlyFinancialSummary,
} from "@/lib/queries/green-invoice-queries";
import { ReportsPageClient } from "@/components/reports/reports-page-client";
import { serialize } from "@/lib/utils";

interface ReportsPageProps {
  searchParams: Promise<{ year?: string; tab?: string; period?: string }>;
}

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const params = await searchParams;
  const currentYear = new Date().getFullYear();
  const year = params.year ? parseInt(params.year, 10) : currentYear;
  const availableYears = [currentYear, currentYear - 1, currentYear - 2];
  const activeTab = params.tab ?? "reports";

  const validPeriods: ReportPeriod[] = ["daily", "weekly", "monthly", "yearly"];
  const period: ReportPeriod = validPeriods.includes(params.period as ReportPeriod)
    ? (params.period as ReportPeriod)
    : "monthly";

  const [data, invoices, expenses, summary, periodStats] = await Promise.all([
    getReportData(year),
    getRecentInvoices(),
    getRecentExpenses(),
    getMonthlyFinancialSummary(),
    getPeriodStats(period),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const serializedData = serialize(data) as any;

  return (
    <ReportsPageClient
      data={{ ...serializedData, year }}
      availableYears={availableYears}
      financials={{ invoices, expenses, summary }}
      activeTab={activeTab}
      period={period}
      periodStats={periodStats}
    />
  );
}
