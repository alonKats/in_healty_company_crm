import { getReportData } from "@/lib/queries/report-queries";
import { ReportsClient } from "@/components/reports/reports-client";
import { serialize } from "@/lib/utils";

interface ReportsPageProps {
  searchParams: Promise<{ year?: string }>;
}

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const params = await searchParams;
  const currentYear = new Date().getFullYear();
  const year = params.year ? parseInt(params.year, 10) : currentYear;
  const availableYears = [currentYear, currentYear - 1, currentYear - 2];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = serialize(await getReportData(year)) as any;

  return <ReportsClient data={{ ...data, year }} availableYears={availableYears} />;
}
