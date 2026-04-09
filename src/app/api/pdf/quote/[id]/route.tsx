import { NextRequest, NextResponse } from "next/server";
import * as ReactPDF from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { QuotePdfDocument } from "./document";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const quote = await prisma.quote.findUnique({
    where: { id },
    include: {
      client: true,
      items: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!quote) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const pdfBuffer = await ReactPDF.renderToBuffer(
      <QuotePdfDocument quote={quote} />
    );

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="quote-${quote.quoteNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { error: "PDF generation failed", details: (error as Error).message },
      { status: 500 }
    );
  }
}
