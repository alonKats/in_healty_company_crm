import { getQuotes } from "@/lib/queries/quote-queries";
import { QuoteList } from "@/components/quotes/quote-list";
import { serialize } from "@/lib/utils";

export default async function QuotesPage() {
  const quotes = serialize(await getQuotes());
  return <QuoteList quotes={quotes} />;
}
