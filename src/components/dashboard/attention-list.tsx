import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DormantClient {
  id: string;
  name: string;
  company: string | null;
}

interface ExpiredQuote {
  id: string;
  quoteNumber: number;
  totalAmount: number;
  validUntil: Date | null;
  client: { name: string };
}

interface UpcomingEvent {
  id: string;
  orderNumber: number;
  eventDate: Date | null;
  client: { name: string };
}

interface NeedsAttention {
  dormantClients: DormantClient[];
  expiredQuotes: ExpiredQuote[];
  upcomingEvents: UpcomingEvent[];
}

function formatDate(date: Date | null) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("he-IL");
}

export function AttentionList({ items }: { items: NeedsAttention }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>דורש תשומת לב</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Dormant clients */}
        <div>
          <h4 className="text-sm font-semibold mb-2 text-muted-foreground">
            לקוחות רדומים ({items.dormantClients.length})
          </h4>
          {items.dormantClients.length === 0 ? (
            <p className="text-xs text-muted-foreground">אין</p>
          ) : (
            <ul className="space-y-1">
              {items.dormantClients.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/clients/${c.id}`}
                    className="text-sm hover:underline"
                  >
                    {c.name}
                    {c.company && (
                      <span className="text-muted-foreground"> — {c.company}</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Expired quotes */}
        <div>
          <h4 className="text-sm font-semibold mb-2 text-muted-foreground">
            הצעות שפג תוקפן ({items.expiredQuotes.length})
          </h4>
          {items.expiredQuotes.length === 0 ? (
            <p className="text-xs text-muted-foreground">אין</p>
          ) : (
            <ul className="space-y-1">
              {items.expiredQuotes.map((q) => (
                <li key={q.id}>
                  <Link
                    href={`/quotes/${q.id}`}
                    className="text-sm hover:underline"
                  >
                    #{q.quoteNumber} — {q.client.name}
                  </Link>
                  {q.validUntil && (
                    <span className="text-xs text-muted-foreground mr-1">
                      (פג {formatDate(q.validUntil)})
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Upcoming events */}
        <div>
          <h4 className="text-sm font-semibold mb-2 text-muted-foreground">
            אירועים קרובים ({items.upcomingEvents.length})
          </h4>
          {items.upcomingEvents.length === 0 ? (
            <p className="text-xs text-muted-foreground">אין</p>
          ) : (
            <ul className="space-y-1">
              {items.upcomingEvents.map((o) => (
                <li key={o.id} className="flex items-center gap-2">
                  <span className="text-xs font-medium text-primary">
                    {formatDate(o.eventDate)}
                  </span>
                  <Link
                    href={`/orders/${o.id}`}
                    className="text-sm hover:underline"
                  >
                    #{o.orderNumber} — {o.client.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
