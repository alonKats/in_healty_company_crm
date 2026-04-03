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
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-slate-800">הכנסות חודשיות</h2>
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={chartData} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            tickFormatter={(v: number) => `₪${(v / 1000).toFixed(0)}k`}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip formatter={formatTooltip} contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />
          <Bar dataKey="total" fill="#2A9D8F" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
