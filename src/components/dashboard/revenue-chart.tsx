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

const hebrewMonths: Record<string, string> = {
  "01": "ינו'",
  "02": "פבר'",
  "03": "מרץ",
  "04": "אפר'",
  "05": "מאי",
  "06": "יוני",
  "07": "יולי",
  "08": "אוג'",
  "09": "ספט'",
  "10": "אוק'",
  "11": "נוב'",
  "12": "דצמ'",
};

function formatMonthLabel(monthStr: string): string {
  const parts = monthStr.split("-");
  const year = parts[0];
  const month = parts[1];
  if (!year || !month) return monthStr;
  const shortYear = year.slice(2);
  const hMonth = hebrewMonths[month] ?? month;
  return `${hMonth} '${shortYear}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatTooltip(value: any): [string, string] {
  const num = typeof value === "number" ? value : parseFloat(String(value)) || 0;
  return [`₪${num.toLocaleString("he-IL")}`, "הכנסות"];
}

function formatDateRange(data: RevenueDataPoint[]): string {
  if (data.length === 0) return "";
  const first = data[0].month;
  const last = data[data.length - 1].month;
  return `${formatMonthLabel(first)} – ${formatMonthLabel(last)}`;
}

export function RevenueChart({ data }: { data: RevenueDataPoint[] }) {
  const chartData = data.map((d) => ({
    ...d,
    label: formatMonthLabel(d.month),
  }));

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-slate-800">הכנסות לפי חודש</h2>
        <p className="text-sm text-slate-400 mt-0.5">{formatDateRange(data)}</p>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData} margin={{ top: 24, right: 8, left: 8, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            tickFormatter={(v: number) => `₪${(v / 1000).toFixed(0)}k`}
            axisLine={false}
            tickLine={false}
            width={52}
          />
          <Tooltip
            formatter={formatTooltip}
            contentStyle={{
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              fontSize: "13px",
            }}
          />
          <Bar
            dataKey="total"
            fill="#2A9D8F"
            radius={[4, 4, 0, 0]}
            label={{
              position: "top",
              fontSize: 11,
              fill: "#64748b",
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter: (v: any) => {
                const num = Number(v);
                return num > 0 ? `₪${(num / 1000).toFixed(0)}k` : "";
              },
            }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
