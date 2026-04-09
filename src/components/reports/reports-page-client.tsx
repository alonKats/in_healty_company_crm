"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ReportsClient } from "./reports-client";
import { FinancialReports } from "./financial-reports";

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
}

export function ReportsPageClient({ data, availableYears, financials, activeTab }: ReportsPageClientProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">דוחות</h2>
        <p className="text-slate-500 text-sm mt-1">ניתוח ביצועים ותובנות עסקיות</p>
      </div>

      <Tabs defaultValue={activeTab}>
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
