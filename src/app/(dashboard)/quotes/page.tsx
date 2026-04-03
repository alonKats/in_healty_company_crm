import { getQuotes } from "@/lib/queries/quote-queries";
import { QuoteList } from "@/components/quotes/quote-list";

export default async function QuotesPage() {
  const quotes = await getQuotes();
  return <QuoteList quotes={quotes} />;
}
