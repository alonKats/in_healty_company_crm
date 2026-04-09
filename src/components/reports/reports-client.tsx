"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

interface ReportData {
  year: number;
  revenueByMonth: { month: string; total: number }[];
  revenueByCategory: { name: string; value: number }[];
  topClients: { name: string; revenue: number; orders: number; lastDate: string }[];
  supplierMargins: { name: string; orderCount: number; totalRevenue: number; totalFees: number; margin: number; marginPct: number }[];
  quoteFunnel: { sent: number; approved: number; ordered: number };
  paymentCollection: { invoiced: number; collected: number };
  saleDistribution: { single: { count: number; revenue: number }; bundle: { count: number; revenue: number } };
}

const COLORS = ["#2A9D8F", "#E9C46A", "#F4A261", "#E76F51", "#264653", "#A8DADC", "#457B9D"];

const hebrewMonths: Record<string, string> = {
  "01": "ינו'", "02": "פבר'", "03": "מרץ", "04": "אפר'", "05": "מאי", "06": "יוני",
  "07": "יולי", "08": "אוג'", "09": "ספט'", "10": "אוק'", "11": "נוב'", "12": "דצמ'",
};

function formatMonth(m: string) {
  const parts = m.split("-");
  return hebrewMonths[parts[1] ?? ""] ?? m;
}

function fmt(n: number) {
  return `₪${n.toLocaleString("he-IL", { maximumFractionDigits: 0 })}`;
}

export function ReportsClient({ data, availableYears }: { data: ReportData; availableYears: number[] }) {
  const [, setYear] = useState(data.year);

  const collectionRate = data.paymentCollection.invoiced > 0
    ? Math.round((data.paymentCollection.collected / data.paymentCollection.invoiced) * 100)
    : 0;

  const funnelApprovalRate = data.quoteFunnel.sent > 0
    ? Math.round((data.quoteFunnel.approved / data.quoteFunnel.sent) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header with year selector */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">דוחות</h2>
          <p className="text-slate-500 text-sm mt-1">ניתוח ביצועים ותובנות עסקיות</p>
        </div>
        <Select defaultValue={String(data.year)} onValueChange={(v) => {
          setYear(Number(v));
          window.location.href = `/reports?year=${v}`;
        }}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {availableYears.map((y) => (
              <SelectItem key={y} value={String(y)}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Revenue by month */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-4">הכנסות לפי חודש</h3>
        <div style={{ direction: "ltr" }}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.revenueByMonth.map((d) => ({ ...d, label: formatMonth(d.month) }))} margin={{ top: 8, right: 8, left: 8, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickFormatter={(v: number) => `₪${(v / 1000).toFixed(0)}k`} axisLine={false} tickLine={false} width={52} />
              <Tooltip formatter={(v) => [fmt(Number(v)), "הכנסות"]} />
              <Bar dataKey="total" fill="#2A9D8F" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Revenue by category + Top clients */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4">הכנסות לפי קטגוריה</h3>
          {data.revenueByCategory.length === 0 ? (
            <p className="text-sm text-slate-400 py-8 text-center">אין נתונים</p>
          ) : (
            <div style={{ direction: "ltr" }}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={data.revenueByCategory} dataKey="value" nameKey="name" cx="50%" cy="40%" outerRadius={85} fontSize={11}>
                    {data.revenueByCategory.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => fmt(Number(v))} />
                  <Legend
                    verticalAlign="bottom"
                    align="center"
                    wrapperStyle={{ fontSize: 12, direction: "rtl", paddingTop: 8 }}
                    formatter={(value: string) => <span className="text-slate-600">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4">לקוחות מובילים</h3>
          {data.topClients.length === 0 ? (
            <p className="text-sm text-slate-400 py-8 text-center">אין נתונים</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="pb-2 text-xs font-bold text-slate-500">לקוח</th>
                    <th className="pb-2 text-xs font-bold text-slate-500">הכנסות</th>
                    <th className="pb-2 text-xs font-bold text-slate-500">הזמנות</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data.topClients.map((c, i) => (
                    <tr key={i}>
                      <td className="py-2 font-medium text-slate-700">{c.name}</td>
                      <td className="py-2 font-bold text-slate-800">{fmt(c.revenue)}</td>
                      <td className="py-2 text-slate-600">{c.orders}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Supplier margins */}
      {data.supplierMargins.length > 0 && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4">רווחיות ספקים</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="pb-2 text-xs font-bold text-slate-500">ספק</th>
                  <th className="pb-2 text-xs font-bold text-slate-500">הזמנות</th>
                  <th className="pb-2 text-xs font-bold text-slate-500">הכנסות</th>
                  <th className="pb-2 text-xs font-bold text-slate-500">עלויות</th>
                  <th className="pb-2 text-xs font-bold text-slate-500">רווח</th>
                  <th className="pb-2 text-xs font-bold text-slate-500">מרווח %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data.supplierMargins.map((s, i) => (
                  <tr key={i}>
                    <td className="py-2 font-medium text-slate-700">{s.name}</td>
                    <td className="py-2 text-slate-600">{s.orderCount}</td>
                    <td className="py-2 text-slate-800">{fmt(s.totalRevenue)}</td>
                    <td className="py-2 text-slate-600">{fmt(s.totalFees)}</td>
                    <td className="py-2 font-bold text-slate-800">{fmt(s.margin)}</td>
                    <td className="py-2">
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-xs font-bold",
                        s.marginPct >= 30 ? "text-green-700 bg-green-50" :
                        s.marginPct >= 10 ? "text-amber-700 bg-amber-50" :
                        "text-red-700 bg-red-50"
                      )}>
                        {s.marginPct.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quote funnel + Payment collection */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4">משפך הצעות מחיר</h3>
          <div className="space-y-3">
            <FunnelBar label="נשלחו" value={data.quoteFunnel.sent} max={data.quoteFunnel.sent} color="bg-slate-200" />
            <FunnelBar label="אושרו" value={data.quoteFunnel.approved} max={data.quoteFunnel.sent} color="bg-teal-400" />
            <FunnelBar label="הפכו להזמנה" value={data.quoteFunnel.ordered} max={data.quoteFunnel.sent} color="bg-teal-600" />
          </div>
          <p className="text-xs text-slate-500 mt-3">אחוז אישור: {funnelApprovalRate}%</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4">גביית תשלומים</h3>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">סה&quot;כ חשבוניות</span>
              <span className="font-bold text-slate-800">{fmt(data.paymentCollection.invoiced)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">נגבה</span>
              <span className="font-bold text-green-600">{fmt(data.paymentCollection.collected)}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3">
              <div className="bg-teal-500 h-3 rounded-full transition-all" style={{ width: `${Math.min(collectionRate, 100)}%` }} />
            </div>
            <p className="text-xs text-slate-500">אחוז גבייה: {collectionRate}%</p>
          </div>
        </div>
      </div>

      {/* Sale distribution */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm max-w-md">
        <h3 className="text-lg font-bold text-slate-800 mb-4">סוגי הזמנות</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600">בודד</span>
            <span className="font-bold text-slate-800">{data.saleDistribution.single.count} הזמנות — {fmt(data.saleDistribution.single.revenue)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">סל מוצרים</span>
            <span className="font-bold text-slate-800">{data.saleDistribution.bundle.count} הזמנות — {fmt(data.saleDistribution.bundle.revenue)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function FunnelBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-slate-600">{label}</span>
        <span className="font-bold text-slate-800">{value}</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2.5">
        <div className={cn(color, "h-2.5 rounded-full transition-all")} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
