const API_BASE = "https://api.greeninvoice.co.il/api/v1";

// Token caching
let cachedToken: string | null = null;
let tokenExpiry = 0;

async function getToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;

  const apiKeyId = process.env.GREEN_INVOICE_API_KEY_ID;
  const apiKeySecret = process.env.GREEN_INVOICE_API_KEY_SECRET;

  if (!apiKeyId || !apiKeySecret) {
    throw new Error("Missing GREEN_INVOICE_API_KEY_ID or GREEN_INVOICE_API_KEY_SECRET");
  }

  const res = await fetch(`${API_BASE}/account/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: apiKeyId, secret: apiKeySecret }),
  });

  if (!res.ok) throw new Error(`GI auth failed (${res.status})`);

  const data = await res.json();
  cachedToken = data.token;
  tokenExpiry = Date.now() + 50 * 60 * 1000;
  return cachedToken as string;
}

async function apiRequest(method: string, path: string, body?: unknown) {
  const token = await getToken();
  const opts: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(`${API_BASE}${path}`, opts);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GI API error (${res.status}): ${text}`);
  }
  return res.json();
}

// ── Clients ──────────────────────────────────────────────────────────────────

export async function searchClients(query: string) {
  return apiRequest("POST", "/clients/search", {
    name: query,
    page: 1,
    pageSize: 20,
  });
}

export interface CreateClientData {
  name: string;
  email?: string;
  phone?: string;
  accountingKey?: string;
}

export async function createClient(data: CreateClientData) {
  const payload: Record<string, unknown> = {
    name: data.name,
  };
  if (data.email) payload.emails = [data.email];
  if (data.phone) payload.phone = data.phone;
  if (data.accountingKey) payload.accountingKey = data.accountingKey;
  return apiRequest("POST", "/clients", payload);
}

// ── Documents ─────────────────────────────────────────────────────────────────

export interface DocumentIncomeItem {
  description: string;
  quantity: number;
  price: number;
  currency?: string; // default "ILS"
  vatType?: number;  // 0 = no VAT
}

export interface DocumentPaymentItem {
  type: 1 | 3 | 4; // 1=cash, 3=credit card, 4=bank transfer
  price: number;
  currency?: string; // default "ILS"
}

export interface CreateDocumentData {
  type?: number; // default 320 = tax invoice/receipt
  client: {
    id: string;
    name: string;
    emails?: string[];
  };
  income: DocumentIncomeItem[];
  payment: DocumentPaymentItem[];
  [key: string]: unknown;
}

export async function createDocument(data: CreateDocumentData) {
  const payload: CreateDocumentData = {
    type: data.type ?? 320,
    client: data.client,
    income: data.income.map((item) => ({
      currency: "ILS",
      vatType: 0,
      ...item,
    })),
    payment: data.payment.map((item) => ({
      currency: "ILS",
      ...item,
    })),
    ...Object.fromEntries(
      Object.entries(data).filter(
        ([k]) => !["type", "client", "income", "payment"].includes(k)
      )
    ),
  };
  return apiRequest("POST", "/documents", payload);
}

export async function getDocument(id: string) {
  return apiRequest("GET", `/documents/${id}`);
}

export async function searchDocuments(filters?: Record<string, unknown>) {
  return apiRequest("POST", "/documents/search", {
    page: 1,
    pageSize: 20,
    ...filters,
  });
}

// ── Utility ───────────────────────────────────────────────────────────────────

export async function testConnection() {
  return apiRequest("GET", "/businesses/me");
}
