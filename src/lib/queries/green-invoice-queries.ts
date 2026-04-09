import { searchDocuments, searchExpenses } from "@/lib/services/green-invoice";

// ── Helpers ──────────────────────────────────────────────────────────────────

function isConfigured(): boolean {
  return !!(process.env.GREEN_INVOICE_API_KEY_ID && process.env.GREEN_INVOICE_API_KEY_SECRET);
}

function threeMonthsAgo(): string {
  const d = new Date();
  d.setMonth(d.getMonth() - 3);
  return d.toISOString().slice(0, 10);
}

function startOfMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDocument(doc: any) {
  return {
    id: doc.id as string,
    clientName: doc.client?.name ?? doc.clientName ?? "",
    amount: Number(doc.amount ?? doc.total ?? 0),
    status: doc.status as number,
    date: doc.documentDate ?? doc.createdAt ?? "",
    type: doc.type as number,
    url: doc.url ?? (doc.id ? `https://app.greeninvoice.co.il/documents/${doc.id}` : ""),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapExpense(exp: any) {
  return {
    id: exp.id as string,
    description: exp.description ?? exp.supplier ?? "",
    amount: Number(exp.amount ?? exp.total ?? 0),
    date: exp.date ?? exp.documentDate ?? "",
    category: exp.category ?? exp.categoryName ?? "",
  };
}

// ── Document status helpers ──────────────────────────────────────────────────

export const DOC_STATUS_LABELS: Record<number, string> = {
  0: "טיוטה",
  1: "סופי",
  2: "שולם",
  3: "שולם חלקית",
  4: "בוטל",
};

export function docStatusColor(status: number): "green" | "orange" | "red" | "slate" {
  if (status === 2) return "green";
  if (status === 1 || status === 3) return "orange";
  if (status === 4) return "red";
  return "slate";
}

// ── Queries ──────────────────────────────────────────────────────────────────

export async function getRecentInvoices(limit = 20) {
  if (!isConfigured()) return null;
  try {
    const res = await searchDocuments({
      fromDate: threeMonthsAgo(),
      toDate: today(),
      type: [320, 305, 400, 330],
      page: 1,
      pageSize: limit,
      sort: "documentDate",
      sortType: "desc",
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (res.items ?? res.data ?? []).map(mapDocument);
  } catch {
    return null;
  }
}

export async function getRecentExpenses(limit = 20) {
  if (!isConfigured()) return null;
  try {
    const res = await searchExpenses({
      fromDate: threeMonthsAgo(),
      toDate: today(),
      page: 1,
      pageSize: limit,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (res.items ?? res.data ?? []).map(mapExpense);
  } catch {
    return null;
  }
}

export async function getClientFinancials(greenInvoiceId: string) {
  if (!isConfigured()) return null;
  try {
    const res = await searchDocuments({
      client: greenInvoiceId,
      page: 1,
      pageSize: 50,
      sort: "documentDate",
      sortType: "desc",
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const docs = (res.items ?? res.data ?? []).map(mapDocument);
    const totalInvoiced = docs.reduce((s: number, d: { amount: number }) => s + d.amount, 0);
    const totalPaid = docs
      .filter((d: { status: number }) => d.status === 2)
      .reduce((s: number, d: { amount: number }) => s + d.amount, 0);
    return {
      documents: docs,
      totalInvoiced,
      totalPaid,
      outstanding: totalInvoiced - totalPaid,
    };
  } catch {
    return null;
  }
}

export async function getMonthlyFinancialSummary() {
  if (!isConfigured()) return null;
  try {
    const from = startOfMonth();
    const to = today();

    const [docsRes, expRes] = await Promise.all([
      searchDocuments({
        fromDate: from,
        toDate: to,
        type: [320, 305, 400, 330],
        page: 1,
        pageSize: 100,
      }),
      searchExpenses({ fromDate: from, toDate: to, page: 1, pageSize: 100 }),
    ]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const docs = (docsRes.items ?? docsRes.data ?? []).map(mapDocument);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const expenses = (expRes.items ?? expRes.data ?? []).map(mapExpense);

    const income = docs.reduce((s: number, d: { amount: number }) => s + d.amount, 0);
    const expenseTotal = expenses.reduce((s: number, e: { amount: number }) => s + e.amount, 0);

    return {
      income,
      expenses: expenseTotal,
      profit: income - expenseTotal,
      invoiceCount: docs.length,
    };
  } catch {
    return null;
  }
}
