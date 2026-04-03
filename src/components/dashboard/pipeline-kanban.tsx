"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-[220px] flex-1">
      <div className="flex items-center gap-2 mb-3">
        <span className="font-semibold text-sm">{title}</span>
        <Badge variant="secondary">{count}</Badge>
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
        <Column title="ליד חדש" count={pipeline.newLeads.length}>
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

        <Column title="הצעה נשלחה" count={pipeline.sentQuotes.length}>
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

        <Column title="הצעה אושרה" count={pipeline.approvedQuotes.length}>
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

        <Column title="הזמנה פעילה" count={pipeline.activeOrders.length}>
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

        <Column title="בוצע" count={pipeline.completedUnpaid.length}>
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
