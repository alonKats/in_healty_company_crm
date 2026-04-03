"use client";

import Link from "next/link";

interface Lead {
  id: string;
  name: string;
  company: string | null;
  createdAt: Date;
}

interface QuoteCard {
  id: string;
  quoteNumber: number;
  totalAmount: number;
  createdAt: Date;
  client: { name: string };
}

interface OrderCard {
  id: string;
  orderNumber: number;
  totalAmount: number;
  eventDate: Date | null;
  createdAt: Date;
  client: { name: string };
}

interface Pipeline {
  newLeads: Lead[];
  sentQuotes: QuoteCard[];
  approvedQuotes: QuoteCard[];
  activeOrders: OrderCard[];
  completedUnpaid: OrderCard[];
}

function daysAgo(date: Date) {
  const diff = Date.now() - new Date(date).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function formatCurrency(amount: number) {
  return `₪${amount.toLocaleString("he-IL", { maximumFractionDigits: 0 })}`;
}

interface ColumnProps {
  title: string;
  count: number;
  dotColor: string;
  labelColor: string;
  children: React.ReactNode;
}

function Column({ title, count, dotColor, labelColor, children }: ColumnProps) {
  return (
    <div className="flex-1 min-w-0 flex flex-col gap-4">
      <div className="flex items-center justify-between px-2">
        <span className={`text-sm font-bold ${labelColor}`}>{title} ({count})</span>
        <span className={`w-2 h-2 rounded-full ${dotColor}`} />
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

interface PipelineCardProps {
  href: string;
  title: string;
  subtitle?: string;
  days: number;
  borderColor: string;
  extra?: React.ReactNode;
}

function PipelineCard({ href, title, subtitle, days, borderColor, extra }: PipelineCardProps) {
  return (
    <Link href={href}>
      <div className={`bg-white p-4 rounded-lg border-r-4 ${borderColor} shadow-sm hover:shadow-md transition-all cursor-pointer`}>
        <h3 className="text-sm font-bold text-slate-800 truncate">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500 mt-1 truncate">{subtitle}</p>}
        <div className="mt-3 flex justify-between items-center">
          {extra ?? <span className="text-[10px] text-slate-400">לפני {days} ימים</span>}
        </div>
      </div>
    </Link>
  );
}

export function PipelineKanban({ pipeline }: { pipeline: Pipeline }) {
  return (
    <div>
      <h2 className="text-lg font-bold text-slate-800 mb-4">תהליך מכירה (Pipeline)</h2>
      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(5, minmax(0, 1fr))" }}>
        <Column title="ליד חדש" count={pipeline.newLeads.length} dotColor="bg-slate-300" labelColor="text-slate-600">
          {pipeline.newLeads.map((lead) => (
            <PipelineCard
              key={lead.id}
              href={`/clients/${lead.id}`}
              title={lead.name}
              subtitle={lead.company ?? undefined}
              days={daysAgo(lead.createdAt)}
              borderColor="border-slate-300"
              extra={<span className="text-[10px] text-slate-400">לפני {daysAgo(lead.createdAt)} ימים</span>}
            />
          ))}
        </Column>

        <Column title="הצעה נשלחה" count={pipeline.sentQuotes.length} dotColor="bg-amber-400" labelColor="text-amber-600">
          {pipeline.sentQuotes.map((q) => (
            <PipelineCard
              key={q.id}
              href={`/quotes/${q.id}`}
              title={q.client.name}
              subtitle={formatCurrency(q.totalAmount)}
              days={daysAgo(q.createdAt)}
              borderColor="border-amber-400"
              extra={<span className="text-[10px] text-slate-400">לפני {daysAgo(q.createdAt)} ימים</span>}
            />
          ))}
        </Column>

        <Column title="הצעה אושרה" count={pipeline.approvedQuotes.length} dotColor="bg-teal-500" labelColor="text-teal-600">
          {pipeline.approvedQuotes.map((q) => (
            <PipelineCard
              key={q.id}
              href={`/quotes/${q.id}`}
              title={q.client.name}
              subtitle={formatCurrency(q.totalAmount)}
              days={daysAgo(q.createdAt)}
              borderColor="border-teal-500"
              extra={
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-teal-600">{formatCurrency(q.totalAmount)}</span>
                  <span className="text-[10px] text-teal-600 font-bold bg-teal-50 px-2 py-0.5 rounded">מאושר</span>
                </div>
              }
            />
          ))}
        </Column>

        <Column title="הזמנה פעילה" count={pipeline.activeOrders.length} dotColor="bg-blue-500" labelColor="text-blue-600">
          {pipeline.activeOrders.map((o) => (
            <PipelineCard
              key={o.id}
              href={`/orders/${o.id}`}
              title={o.client.name}
              subtitle={formatCurrency(o.totalAmount)}
              days={daysAgo(o.createdAt)}
              borderColor="border-blue-500"
              extra={<span className="text-[10px] text-slate-400">לפני {daysAgo(o.createdAt)} ימים</span>}
            />
          ))}
        </Column>

        <Column title="בוצע" count={pipeline.completedUnpaid.length} dotColor="bg-green-500" labelColor="text-green-600">
          {pipeline.completedUnpaid.map((o) => (
            <PipelineCard
              key={o.id}
              href={`/orders/${o.id}`}
              title={o.client.name}
              subtitle={formatCurrency(o.totalAmount)}
              days={daysAgo(o.createdAt)}
              borderColor="border-green-500"
              extra={<span className="text-[10px] text-slate-400">לפני {daysAgo(o.createdAt)} ימים</span>}
            />
          ))}
        </Column>
      </div>
    </div>
  );
}
