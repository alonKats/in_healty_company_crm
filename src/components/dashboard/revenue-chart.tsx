"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RevenueDataPoint {
  month: string;
  total: number;
}

const HEBREW_MONTHS: Record<string, string> = {
  "01": "ינואר",
  "02": "פברואר",
  "03": "מרץ",
  "04": "אפריל",
  "05": "מאי",
  "06": "יוני",
  "07": "יולי",
  "08": "אוגוסט",
  "09": "ספטמבר",
  "10": "אוקטובר",
  "11": "נובמבר",
  "12": "דצמבר",
};

function hebrewMonth(monthStr: string) {
  const parts = monthStr.split("-");
  const month = parts[1];
  return month ? (HEBREW_MONTHS[month] ?? monthStr) : monthStr;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatTooltip(value: any): [string, string] {
  const num = typeof value === "number" ? value : parseFloat(String(value)) || 0;
  return [`₪${num.toLocaleString("he-IL")}`, "הכנסות"];
}

export function RevenueChart({ data }: { data: RevenueDataPoint[] }) {
  const chartData = data.map((d) => ({
    ...d,
    label: hebrewMonth(d.month),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>הכנסות — 6 חודשים אחרונים</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
            <YAxis
              tick={{ fontSize: 12 }}
              tickFormatter={(v: number) => `₪${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip formatter={formatTooltip} />
            <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
