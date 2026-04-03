"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

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

function Column({
  title,
  count,
  color,
  children,
}: {
  title: string;
  count: number;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-[220px] flex-1">
      <div className="flex items-center gap-2 mb-3 rounded-md px-2 py-1.5 bg-white border border-gray-200">
        <span className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
        <span className="font-semibold text-sm flex-1">{title}</span>
        <span className="inline-flex items-center justify-center rounded-full bg-gray-100 text-gray-600 text-xs font-medium w-5 h-5">
          {count}
        </span>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function PipelineCard({
  href,
  title,
  subtitle,
  days,
}: {
  href: string;
  title: string;
  subtitle?: string;
  days: number;
}) {
  return (
    <Link href={href}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-3">
          <p className="font-medium text-sm truncate">{title}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-0.5 truncate">{subtitle}</p>
          )}
          <p className="text-xs text-muted-foreground mt-1">לפני {days} ימים</p>
        </CardContent>
      </Card>
    </Link>
  );
}

export function PipelineKanban({ pipeline }: { pipeline: Pipeline }) {
  return (
    <div className="overflow-x-auto">
      <div className="flex gap-4 pb-4 min-w-max">
        <Column title="ליד חדש" count={pipeline.newLeads.length} color="#9CA3AF">
          {pipeline.newLeads.map((lead) => (
            <PipelineCard
              key={lead.id}
              href={`/clients/${lead.id}`}
              title={lead.name}
              subtitle={lead.company ?? undefined}
              days={daysAgo(lead.createdAt)}
            />
          ))}
        </Column>

        <Column title="הצעה נשלחה" count={pipeline.sentQuotes.length} color="#F59E0B">
          {pipeline.sentQuotes.map((q) => (
            <PipelineCard
              key={q.id}
              href={`/quotes/${q.id}`}
              title={q.client.name}
              subtitle={formatCurrency(q.totalAmount)}
              days={daysAgo(q.createdAt)}
            />
          ))}
        </Column>

        <Column title="הצעה אושרה" count={pipeline.approvedQuotes.length} color="#22C55E">
          {pipeline.approvedQuotes.map((q) => (
            <PipelineCard
              key={q.id}
              href={`/quotes/${q.id}`}
              title={q.client.name}
              subtitle={formatCurrency(q.totalAmount)}
              days={daysAgo(q.createdAt)}
            />
          ))}
        </Column>

        <Column title="הזמנה פעילה" count={pipeline.activeOrders.length} color="#3B82F6">
          {pipeline.activeOrders.map((o) => (
            <PipelineCard
              key={o.id}
              href={`/orders/${o.id}`}
              title={o.client.name}
              subtitle={formatCurrency(o.totalAmount)}
              days={daysAgo(o.createdAt)}
            />
          ))}
        </Column>

        <Column title="בוצע" count={pipeline.completedUnpaid.length} color="#2A9D8F">
          {pipeline.completedUnpaid.map((o) => (
            <PipelineCard
              key={o.id}
              href={`/orders/${o.id}`}
              title={o.client.name}
              subtitle={formatCurrency(o.totalAmount)}
              days={daysAgo(o.createdAt)}
            />
          ))}
        </Column>
      </div>
    </div>
  );
}
