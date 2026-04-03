import { notFound } from "next/navigation";
import { getQuoteById } from "@/lib/queries/quote-queries";
import { QuoteDetail } from "@/components/quotes/quote-detail";

interface QuotePageProps {
  params: Promise<{ id: string }>;
}

export default async function QuotePage({ params }: QuotePageProps) {
  const { id } = await params;
  const quote = await getQuoteById(id);

  if (!quote) {
    notFound();
  }

  return <QuoteDetail quote={quote} />;
}
