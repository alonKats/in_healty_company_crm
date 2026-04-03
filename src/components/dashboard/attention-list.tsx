import Link from "next/link";

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
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-full">
      <div className="flex items-center gap-2 mb-6">
        <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        <h2 className="text-lg font-bold text-slate-800">דורש תשומת לב</h2>
      </div>

      <div className="space-y-4">
        {/* Dormant clients */}
        {items.dormantClients.length > 0 && (
          <div className="flex items-start gap-4 p-3 bg-red-50 rounded-lg border border-red-100">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">לקוחות רדומים</h4>
              <p className="text-xs text-slate-600">{items.dormantClients.length} לקוחות מפתח לא יצרו קשר מעל 3 חודשים.</p>
              <ul className="mt-1 space-y-0.5">
                {items.dormantClients.slice(0, 3).map((c) => (
                  <li key={c.id}>
                    <Link href={`/clients/${c.id}`} className="text-xs font-bold text-red-600 hover:underline">
                      {c.name}{c.company ? ` — ${c.company}` : ""}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Expired quotes */}
        {items.expiredQuotes.length > 0 && (
          <div className="flex items-start gap-4 p-3 bg-amber-50 rounded-lg border border-amber-100">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">הצעות שפג תוקפן</h4>
              <p className="text-xs text-slate-600">{items.expiredQuotes.length} הצעות מחיר מחכות לעדכון או סגירה.</p>
              <ul className="mt-1 space-y-0.5">
                {items.expiredQuotes.slice(0, 3).map((q) => (
                  <li key={q.id}>
                    <Link href={`/quotes/${q.id}`} className="text-xs font-bold text-amber-700 hover:underline">
                      #{q.quoteNumber} — {q.client.name}
                      {q.validUntil && <span className="font-normal text-slate-500"> (פג {formatDate(q.validUntil)})</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Upcoming events */}
        {items.upcomingEvents.length > 0 && (
          <div className="flex items-start gap-4 p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">אירועים קרובים</h4>
              <p className="text-xs text-slate-600">{items.upcomingEvents.length} אירועים בשבועות הקרובים.</p>
              <ul className="mt-1 space-y-0.5">
                {items.upcomingEvents.slice(0, 3).map((o) => (
                  <li key={o.id}>
                    <Link href={`/orders/${o.id}`} className="text-xs font-bold text-slate-600 hover:underline">
                      #{o.orderNumber} — {o.client.name}
                      {o.eventDate && <span className="font-normal text-slate-500"> ({formatDate(o.eventDate)})</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {items.dormantClients.length === 0 && items.expiredQuotes.length === 0 && items.upcomingEvents.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-4">הכל בסדר. אין פריטים הדורשים תשומת לב.</p>
        )}
      </div>
    </div>
  );
}
