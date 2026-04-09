import { getReportData } from "@/lib/queries/report-queries";
import {
  getRecentInvoices,
  getRecentExpenses,
  getMonthlyFinancialSummary,
} from "@/lib/queries/green-invoice-queries";
import { ReportsPageClient } from "@/components/reports/reports-page-client";
import { serialize } from "@/lib/utils";

interface ReportsPageProps {
  searchParams: Promise<{ year?: string; tab?: string }>;
}

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const params = await searchParams;
  const currentYear = new Date().getFullYear();
  const year = params.year ? parseInt(params.year, 10) : currentYear;
  const availableYears = [currentYear, currentYear - 1, currentYear - 2];
  const activeTab = params.tab ?? "reports";

  const [data, invoices, expenses, summary] = await Promise.all([
    getReportData(year),
    getRecentInvoices(),
    getRecentExpenses(),
    getMonthlyFinancialSummary(),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const serializedData = serialize(data) as any;

  return (
    <ReportsPageClient
      data={{ ...serializedData, year }}
      availableYears={availableYears}
      financials={{ invoices, expenses, summary }}
      activeTab={activeTab}
    />
  );
}
