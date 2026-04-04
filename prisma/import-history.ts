/**
 * Historical data import from Oren's Excel workbook.
 *
 * Usage:
 *   npx tsx prisma/import-history.ts '/path/to/workbook.xlsx' [--dry-run]
 *
 * Processes 12 sheets: client tracking (3 years), LinkedIn, new leads,
 * dormant clients, quote tracking (3 years), campaigns, conference,
 * newsletter, and seasonal segmentation.
 *
 * Idempotent — safe to re-run. Matches clients by name, deduplicates
 * contacts and activities.
 */

import * as fs from "fs";
import * as path from "path";
import * as XLSX from "xlsx";
import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// ── Load .env.local ──────────────────────────────────────────────────
// tsx / Next.js won't auto-load .env.local for standalone scripts
const envPath = path.resolve(__dirname, "..", ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL not found. Make sure .env.local exists.");
  process.exit(1);
}

// ── Prisma setup (same pattern as seed.ts) ───────────────────────────
// Use unpooled URL if available (more stable for long-running imports against Neon)
const connStr = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
const pool = new Pool({
  connectionString: connStr,
  max: 3,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  keepAlive: true,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ── CLI args ─────────────────────────────────────────────────────────
const DRY_RUN = process.argv.includes("--dry-run");
const filePath = process.argv.find((a) => a.endsWith(".xlsx"));

if (!filePath) {
  console.error("Usage: npx tsx prisma/import-history.ts <path-to-xlsx> [--dry-run]");
  process.exit(1);
}

// ── Stats ────────────────────────────────────────────────────────────
const stats = {
  clientsCreated: 0,
  clientsMatched: 0,
  contactsCreated: 0,
  contactsSkipped: 0,
  activitiesCreated: 0,
  activitiesSkipped: 0,
  mailingListUpdated: 0,
};

// ── Hebrew month helpers ─────────────────────────────────────────────
const HEBREW_MONTHS: Record<string, number> = {
  "ינואר": 1, "פברואר": 2, "פבר'": 2, "מרץ": 3, "אפריל": 4,
  "מאי": 5, "יוני": 6, "יולי": 7, "אוגוסט": 8, "אוג'": 8,
  "ספטמבר": 9, "ספט'": 9, "אוקטובר": 10, "אוק'": 10,
  "נובמבר": 11, "נוב'": 11, "דצמבר": 12, "דצ'": 12,
};

function parseHebrewMonth(header: string): number | null {
  const cleaned = header.trim();
  for (const [name, num] of Object.entries(HEBREW_MONTHS)) {
    if (cleaned.startsWith(name) || cleaned.includes(name)) return num;
  }
  return null;
}

// ── Client cache (name → id) to avoid repeated DB lookups ────────────
const clientCache = new Map<string, string>();

function normalizeCompanyName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

function clientCacheKey(name: string): string {
  return normalizeCompanyName(name).toLowerCase();
}

// ── User IDs (loaded at startup) ─────────────────────────────────────
let orenUserId: string;
let adiUserId: string;

// ── Core helpers ─────────────────────────────────────────────────────

async function findOrCreateClient(
  companyName: string,
  opts: {
    source?: "REFERRAL" | "WEBSITE" | "COLD_OUTREACH" | "LINKEDIN" | "CONFERENCE" | "CAMPAIGN" | "MAILING" | "INBOUND" | "OTHER";
    status?: "LEAD" | "ACTIVE" | "DORMANT";
    phone?: string;
    email?: string;
  } = {},
): Promise<string | null> {
  const name = normalizeCompanyName(companyName);
  if (!name) return null;
  const key = clientCacheKey(name);

  // Check cache first
  if (clientCache.has(key)) {
    stats.clientsMatched++;
    return clientCache.get(key)!;
  }

  // DB lookup — case-insensitive
  const existing = await prisma.client.findFirst({
    where: { name: { equals: name, mode: "insensitive" } },
    select: { id: true },
  });

  if (existing) {
    clientCache.set(key, existing.id);
    stats.clientsMatched++;

    // Update status/source if provided and meaningful
    if (opts.status === "DORMANT" || opts.source) {
      if (!DRY_RUN) {
        const updateData: Record<string, unknown> = {};
        if (opts.status === "DORMANT") updateData.status = "DORMANT";
        if (opts.email) updateData.email = opts.email;
        if (opts.phone) updateData.phone = opts.phone;
        if (Object.keys(updateData).length > 0) {
          await prisma.client.update({ where: { id: existing.id }, data: updateData });
        }
      }
    }

    return existing.id;
  }

  // Create new client
  if (DRY_RUN) {
    console.log(`  [DRY] Would create client: "${name}" source=${opts.source ?? "OTHER"}`);
    const fakeId = `dry-${key}`;
    clientCache.set(key, fakeId);
    stats.clientsCreated++;
    return fakeId;
  }

  const client = await prisma.client.create({
    data: {
      name,
      company: name,
      source: opts.source ?? "OTHER",
      status: opts.status ?? "LEAD",
      phone: opts.phone,
      email: opts.email,
    },
  });

  clientCache.set(key, client.id);
  stats.clientsCreated++;
  return client.id;
}

async function findOrCreateContact(
  clientId: string,
  contactName: string,
  opts: { phone?: string; email?: string; role?: string } = {},
): Promise<void> {
  const name = contactName.trim();
  if (!name || clientId.startsWith("dry-")) {
    if (name && DRY_RUN) {
      console.log(`  [DRY] Would create contact: "${name}" for client ${clientId}`);
      stats.contactsCreated++;
    }
    return;
  }

  // Check if contact already exists for this client
  const existing = await prisma.contact.findFirst({
    where: {
      clientId,
      name: { equals: name, mode: "insensitive" },
    },
  });

  if (existing) {
    stats.contactsSkipped++;
    // Update phone/email if we have new data and existing is empty
    if (!DRY_RUN && (opts.phone || opts.email)) {
      const updateData: Record<string, unknown> = {};
      if (opts.phone && !existing.phone) updateData.phone = opts.phone;
      if (opts.email && !existing.email) updateData.email = opts.email;
      if (Object.keys(updateData).length > 0) {
        await prisma.contact.update({ where: { id: existing.id }, data: updateData });
      }
    }
    return;
  }

  if (!DRY_RUN) {
    await prisma.contact.create({
      data: {
        clientId,
        name,
        phone: opts.phone || null,
        email: opts.email || null,
        role: opts.role || null,
        isPrimary: false,
      },
    });
  }
  stats.contactsCreated++;
}

async function findOrCreateActivity(
  clientId: string,
  opts: {
    type?: "CALL" | "EMAIL" | "WHATSAPP" | "MEETING" | "NOTE" | "MAILING";
    subject: string;
    content: string;
    date: Date;
    direction?: "INBOUND" | "OUTBOUND";
  },
): Promise<void> {
  if (!clientId || clientId.startsWith("dry-")) {
    if (DRY_RUN) {
      console.log(`  [DRY] Would create activity: "${opts.subject}" — ${opts.content.substring(0, 60)}`);
      stats.activitiesCreated++;
    }
    return;
  }

  // Idempotency check: match on clientId + subject + date (same day)
  const dayStart = new Date(opts.date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(opts.date);
  dayEnd.setHours(23, 59, 59, 999);

  const existing = await prisma.activity.findFirst({
    where: {
      clientId,
      subject: opts.subject,
      date: { gte: dayStart, lte: dayEnd },
    },
  });

  if (existing) {
    stats.activitiesSkipped++;
    return;
  }

  if (!DRY_RUN) {
    await prisma.activity.create({
      data: {
        clientId,
        type: opts.type ?? "NOTE",
        direction: opts.direction ?? "OUTBOUND",
        subject: opts.subject,
        content: opts.content,
        source: "MANUAL",
        date: opts.date,
        createdById: orenUserId,
      },
    });
  }
  stats.activitiesCreated++;
}

// ── Cell helpers ─────────────────────────────────────────────────────

function cellStr(sheet: XLSX.WorkSheet, row: number, col: number): string {
  const addr = XLSX.utils.encode_cell({ r: row, c: col });
  const cell = sheet[addr];
  if (!cell) return "";
  return String(cell.v).trim();
}

function cellRaw(sheet: XLSX.WorkSheet, row: number, col: number): XLSX.CellObject | undefined {
  return sheet[XLSX.utils.encode_cell({ r: row, c: col })];
}

function parseExcelDate(val: unknown): Date | null {
  if (!val) return null;
  if (typeof val === "number") {
    // Excel serial date
    const d = XLSX.SSF.parse_date_code(val);
    if (d) return new Date(d.y, d.m - 1, d.d);
  }
  if (typeof val === "string") {
    // Try DD.MM or DD.MM.YY format
    const dotMatch = val.match(/^(\d{1,2})\.(\d{1,2})(?:\.(\d{2,4}))?$/);
    if (dotMatch) {
      const day = parseInt(dotMatch[1]);
      const month = parseInt(dotMatch[2]);
      let year = dotMatch[3] ? parseInt(dotMatch[3]) : new Date().getFullYear();
      if (year < 100) year += 2000;
      return new Date(year, month - 1, day);
    }
    // Try DD/MM/YY
    const slashMatch = val.match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?$/);
    if (slashMatch) {
      const day = parseInt(slashMatch[1]);
      const month = parseInt(slashMatch[2]);
      let year = slashMatch[3] ? parseInt(slashMatch[3]) : new Date().getFullYear();
      if (year < 100) year += 2000;
      return new Date(year, month - 1, day);
    }
  }
  return null;
}

function formatPhone972(raw: string): string {
  // Convert 972XXXXXXXXX → 0XX-XXXXXXX
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("972") && digits.length >= 12) {
    const local = "0" + digits.slice(3);
    return local.slice(0, 3) + "-" + local.slice(3);
  }
  return raw;
}

function getSheetDataRange(sheet: XLSX.WorkSheet): { startRow: number; endRow: number; endCol: number } {
  const range = XLSX.utils.decode_range(sheet["!ref"] || "A1");
  return { startRow: range.s.r, endRow: range.e.r, endCol: range.e.c };
}

// ── Sheet handlers ───────────────────────────────────────────────────

/**
 * Main tracking sheets: מעקב פניות ללקוחות, מעקב לקוחות 25, מעקב לקוחות 26
 * Row 4 = headers, data from row 5.
 * Col 0 = index, Col 1 = company name, Cols 2-14 = monthly interaction notes
 */
async function importMainTracking(sheet: XLSX.WorkSheet, sheetName: string): Promise<void> {
  const { endRow, endCol } = getSheetDataRange(sheet);

  // Determine year from sheet name
  let year = 2024; // default for מעקב פניות ללקוחות (which covers 2023-2024 based on headers)
  if (sheetName.includes("25")) year = 2025;
  if (sheetName.includes("26")) year = 2026;

  // Parse month headers from row 4
  const monthCols: { col: number; month: number; year: number; label: string }[] = [];
  for (let c = 2; c <= Math.min(endCol, 14); c++) {
    const header = cellStr(sheet, 4, c);
    if (!header) continue;

    const monthNum = parseHebrewMonth(header);
    if (monthNum === null) continue;

    // For the original sheet, headers contain month names that span 2023-2024
    // Columns go: H1-2023, July-Dec 2023, then Jan-Jun 2024
    let colYear = year;
    if (sheetName === "מעקב פניות ללקוחות") {
      // First column (c=2) is "H1 of 23", then Jul-Dec = 2023, then Jan24 onward
      if (header.includes("23") || header.includes("בחציון")) {
        colYear = 2023;
      } else if (header.includes("24")) {
        colYear = 2024;
      } else {
        // July (7) through December (12) = 2023, January (1) through June (6) = 2024
        colYear = monthNum >= 7 ? 2023 : 2024;
      }
    }

    monthCols.push({ col: c, month: monthNum, year: colYear, label: header });
  }

  let processed = 0;
  for (let r = 5; r <= endRow; r++) {
    const company = cellStr(sheet, r, 1);
    if (!company) continue;

    const clientId = await findOrCreateClient(company, { status: "ACTIVE" });
    if (!clientId) continue;

    for (const mc of monthCols) {
      const value = cellStr(sheet, r, mc.col);
      if (!value) continue;

      const date = new Date(mc.year, mc.month - 1, 1);
      const subject = mc.label.trim() || `${Object.keys(HEBREW_MONTHS).find((k) => HEBREW_MONTHS[k] === mc.month) ?? mc.month} ${mc.year}`;

      const isJustX = value === "X" || value === "x" || value === "V" || value === "v";
      const content = isJustX ? "פנייה ללקוח" : value;

      await findOrCreateActivity(clientId, {
        type: "NOTE",
        subject: `מעקב ${subject}`,
        content,
        date,
      });
    }
    processed++;
  }
  console.log(`    Processed ${processed} companies`);
}

/**
 * לינקדאין — LinkedIn leads
 * Data starts row 2. Col 0=date, 1=contact name, 2=company, 3=notes
 */
async function importLinkedIn(sheet: XLSX.WorkSheet): Promise<void> {
  const { endRow } = getSheetDataRange(sheet);
  let processed = 0;

  for (let r = 2; r <= endRow; r++) {
    const contactName = cellStr(sheet, r, 1);
    const company = cellStr(sheet, r, 2);
    if (!company && !contactName) continue;

    const clientId = await findOrCreateClient(company || contactName, { source: "LINKEDIN" });
    if (!clientId) continue;

    if (contactName) {
      await findOrCreateContact(clientId, contactName);
    }

    const notes = cellStr(sheet, r, 3);
    const dateRaw = cellRaw(sheet, r, 0);
    const date = dateRaw ? parseExcelDate(dateRaw.v) : null;

    if (notes || contactName) {
      await findOrCreateActivity(clientId, {
        type: "NOTE",
        subject: "LinkedIn — פנייה",
        content: notes || `קשר דרך LinkedIn: ${contactName}`,
        date: date ?? new Date(2025, 0, 1),
      });
    }
    processed++;
  }
  console.log(`    Processed ${processed} LinkedIn leads`);
}

/**
 * לקוחות חדשים — New leads
 * Row 1 = headers. Data from row 2.
 * C0=company, C1=contact, C2=phone, C3=date, C4=notes, C5=who, C6=follow-up date, C7=what offered
 */
async function importNewLeads(sheet: XLSX.WorkSheet): Promise<void> {
  const { endRow } = getSheetDataRange(sheet);
  let processed = 0;

  for (let r = 2; r <= endRow; r++) {
    const company = cellStr(sheet, r, 0);
    if (!company) continue;

    const clientId = await findOrCreateClient(company, { status: "LEAD" });
    if (!clientId) continue;

    const contactName = cellStr(sheet, r, 1);
    const phone = cellStr(sheet, r, 2);
    if (contactName) {
      await findOrCreateContact(clientId, contactName, { phone: phone || undefined });
    }

    // Assign to Adi if C5 mentions עדי
    const whoContacted = cellStr(sheet, r, 5);
    if (whoContacted.includes("עדי") && clientId && !clientId.startsWith("dry-")) {
      if (!DRY_RUN) {
        await prisma.client.update({
          where: { id: clientId },
          data: { assignedToId: adiUserId },
        });
      }
    }

    const notes = cellStr(sheet, r, 4);
    const whatOffered = cellStr(sheet, r, 7);
    const dateRaw = cellRaw(sheet, r, 3);
    const date = dateRaw ? parseExcelDate(dateRaw.v) : null;

    const contentParts = [notes, whatOffered].filter(Boolean);
    if (contentParts.length > 0) {
      await findOrCreateActivity(clientId, {
        type: "NOTE",
        subject: "ליד חדש",
        content: contentParts.join(" | "),
        date: date ?? new Date(2025, 0, 1),
      });
    }
    processed++;
  }
  console.log(`    Processed ${processed} new leads`);
}

/**
 * לקוחות רדומים — Dormant clients
 * Data from row 2. C0=company, C1=contact, C2=date, C3=notes, C4=more notes, C5=date
 */
async function importDormant(sheet: XLSX.WorkSheet): Promise<void> {
  const { endRow } = getSheetDataRange(sheet);
  let processed = 0;

  for (let r = 2; r <= endRow; r++) {
    const company = cellStr(sheet, r, 0);
    if (!company) continue;

    const clientId = await findOrCreateClient(company, { status: "DORMANT" });
    if (!clientId) continue;

    const contactName = cellStr(sheet, r, 1);
    if (contactName) {
      await findOrCreateContact(clientId, contactName);
    }

    const notes1 = cellStr(sheet, r, 3);
    const notes2 = cellStr(sheet, r, 4);
    const dateRaw = cellRaw(sheet, r, 2);
    const date = dateRaw ? parseExcelDate(dateRaw.v) : null;

    const content = [notes1, notes2].filter(Boolean).join(" | ");
    if (content) {
      await findOrCreateActivity(clientId, {
        type: "NOTE",
        subject: "לקוח רדום",
        content,
        date: date ?? new Date(2025, 0, 1),
      });
    }
    processed++;
  }
  console.log(`    Processed ${processed} dormant clients`);
}

/**
 * כנס רווחה — Conference contacts
 * Data from row 2. C0=index, C1=name, C2=company, C3=phone, C4=email, C5=interest, C6=follow-up, C7=date
 */
async function importConference(sheet: XLSX.WorkSheet): Promise<void> {
  const { endRow } = getSheetDataRange(sheet);
  let processed = 0;

  for (let r = 2; r <= endRow; r++) {
    const contactName = cellStr(sheet, r, 1);
    const company = cellStr(sheet, r, 2);
    if (!company && !contactName) continue;

    const phone = cellStr(sheet, r, 3);
    const email = cellStr(sheet, r, 4);

    const clientId = await findOrCreateClient(company || contactName, {
      source: "CONFERENCE",
      phone: phone || undefined,
      email: email || undefined,
    });
    if (!clientId) continue;

    if (contactName) {
      await findOrCreateContact(clientId, contactName, {
        phone: phone || undefined,
        email: email || undefined,
      });
    }

    const interest = cellStr(sheet, r, 5);
    const followUp = cellStr(sheet, r, 6);
    const dateRaw = cellRaw(sheet, r, 7);
    const date = dateRaw ? parseExcelDate(dateRaw.v) : null;

    const content = [interest, followUp].filter(Boolean).join(" | ");
    if (content || contactName) {
      await findOrCreateActivity(clientId, {
        type: "NOTE",
        subject: "כנס רווחה",
        content: content || `פגישה בכנס: ${contactName}`,
        date: date ?? new Date(2024, 6, 2), // Default July 2, 2024 based on data
      });
    }
    processed++;
  }
  console.log(`    Processed ${processed} conference contacts`);
}

/**
 * מעקב קמפיינים — Campaign tracking
 * Data from row 1. C0=name, C1=email, C2=phone(972...), C3=company, C4=boolean, C5=notes
 */
async function importCampaigns(sheet: XLSX.WorkSheet): Promise<void> {
  const { endRow } = getSheetDataRange(sheet);
  let processed = 0;

  for (let r = 1; r <= endRow; r++) {
    const contactName = cellStr(sheet, r, 0);
    const email = cellStr(sheet, r, 1);
    const phoneRaw = cellStr(sheet, r, 2);
    const company = cellStr(sheet, r, 3);
    if (!contactName && !company) continue;

    const phone = phoneRaw ? formatPhone972(phoneRaw) : undefined;

    const clientId = await findOrCreateClient(company || contactName, {
      source: "CAMPAIGN",
      email: email || undefined,
      phone: phone || undefined,
    });
    if (!clientId) continue;

    if (contactName) {
      await findOrCreateContact(clientId, contactName, {
        email: email || undefined,
        phone: phone || undefined,
      });
    }

    const notes = cellStr(sheet, r, 5);
    if (notes) {
      await findOrCreateActivity(clientId, {
        type: "NOTE",
        subject: "קמפיין — פנייה",
        content: notes,
        date: new Date(2024, 2, 1), // Campaign was March-April 2024
      });
    }
    processed++;
  }
  console.log(`    Processed ${processed} campaign leads`);
}

/**
 * מעקב הצעות מחיר — Quote tracking (24, 25, 26)
 * Row 1 = headers. Data from row 2.
 * 24: C0=date, C1=company, C2=contact, C3=offered, C4=when, C5=status, C6=source
 * 25/26: C0=date, C1=company, C2=offered, C3=when, C4=status, C5=source
 */
async function importQuotes(sheet: XLSX.WorkSheet, sheetName: string): Promise<void> {
  const { endRow } = getSheetDataRange(sheet);
  const is24 = sheetName.includes("24");
  const year = sheetName.includes("24") ? 2024 : sheetName.includes("25") ? 2025 : 2026;

  let processed = 0;

  for (let r = 2; r <= endRow; r++) {
    const company = cellStr(sheet, r, 1);
    if (!company) continue;

    const clientId = await findOrCreateClient(company);
    if (!clientId) continue;

    // Column offsets differ between 24 (has contact name col) and 25/26
    const offeredCol = is24 ? 3 : 2;
    const whenCol = is24 ? 4 : 3;
    const statusCol = is24 ? 5 : 4;
    const sourceCol = is24 ? 6 : 5;

    const offered = cellStr(sheet, r, offeredCol);
    const when = cellStr(sheet, r, whenCol);
    const status = cellStr(sheet, r, statusCol);
    const requestSource = cellStr(sheet, r, sourceCol);

    // Parse date from C0
    const dateRaw = cellRaw(sheet, r, 0);
    let date: Date | null = null;
    if (dateRaw) {
      date = parseExcelDate(dateRaw.v);
      // If the date parsed is just month name like "ינואר", create date from that
      if (!date && typeof dateRaw.v === "string") {
        const m = parseHebrewMonth(dateRaw.v as string);
        if (m) date = new Date(year, m - 1, 1);
      }
    }
    if (!date) date = new Date(year, 0, 1);

    // If 24 has a contact name in C2
    if (is24) {
      const contactName = cellStr(sheet, r, 2);
      if (contactName) {
        await findOrCreateContact(clientId, contactName);
      }
    }

    const contentParts = [];
    if (offered) contentParts.push(`הצעה: ${offered}`);
    if (when) contentParts.push(`למתי: ${when}`);
    if (status) contentParts.push(`סטטוס: ${status}`);
    if (requestSource) contentParts.push(`מקור: ${requestSource}`);

    if (contentParts.length > 0) {
      await findOrCreateActivity(clientId, {
        type: "NOTE",
        subject: `הצעת מחיר ${year}`,
        content: contentParts.join(" | "),
        date,
      });
    }
    processed++;
  }
  console.log(`    Processed ${processed} quotes for ${year}`);
}

/**
 * מעקב דיוורים — Newsletter tracking
 * Row 1 = headers. Data from row 2. C0=email, C1=name, C2=open date, C3=total opens
 */
async function importNewsletter(sheet: XLSX.WorkSheet): Promise<void> {
  const { endRow } = getSheetDataRange(sheet);
  let matched = 0;
  let unmatched = 0;

  for (let r = 2; r <= endRow; r++) {
    const email = cellStr(sheet, r, 0);
    if (!email || !email.includes("@")) continue;

    const emailLower = email.toLowerCase();

    // Try to match against client email
    let client = await prisma.client.findFirst({
      where: { email: { equals: emailLower, mode: "insensitive" } },
      select: { id: true },
    });

    // Try to match against contact email
    if (!client) {
      const contact = await prisma.contact.findFirst({
        where: { email: { equals: emailLower, mode: "insensitive" } },
        select: { clientId: true },
      });
      if (contact) {
        client = { id: contact.clientId };
      }
    }

    if (client) {
      if (!DRY_RUN) {
        await prisma.client.update({
          where: { id: client.id },
          data: { isOnMailingList: true },
        });
      }
      stats.mailingListUpdated++;
      matched++;
    } else {
      unmatched++;
    }
  }
  console.log(`    Newsletter: ${matched} matched, ${unmatched} unmatched emails`);
}

/**
 * פילוח לפעילות עונתית — Seasonal activity segmentation
 * Row 0 = headers. Data from row 1.
 * C0=company, then various activity columns with X/dates/notes
 */
async function importSeasonal(sheet: XLSX.WorkSheet): Promise<void> {
  const { endRow, endCol } = getSheetDataRange(sheet);

  // Parse headers from row 0
  const headers: string[] = [];
  for (let c = 0; c <= endCol; c++) {
    headers.push(cellStr(sheet, 0, c));
  }

  let processed = 0;

  for (let r = 1; r <= endRow; r++) {
    const company = cellStr(sheet, r, 0);
    if (!company) continue;

    const clientId = await findOrCreateClient(company);
    if (!clientId) continue;

    // Collect non-empty columns as activity notes
    const activityParts: string[] = [];
    for (let c = 1; c <= endCol; c++) {
      const val = cellStr(sheet, r, c);
      if (!val || val === "X" || val === "x") continue;
      const header = headers[c] || `עמודה ${c}`;
      activityParts.push(`${header}: ${val}`);
    }

    // Check which categories apply (X marks)
    const categoryFlags: string[] = [];
    for (let c = 1; c <= endCol; c++) {
      const val = cellStr(sheet, r, c);
      if (val === "X" || val === "x") {
        const header = headers[c] || `עמודה ${c}`;
        categoryFlags.push(header);
      }
    }

    if (activityParts.length > 0 || categoryFlags.length > 0) {
      const content = [
        categoryFlags.length > 0 ? `עניין ב: ${categoryFlags.join(", ")}` : "",
        ...activityParts,
      ]
        .filter(Boolean)
        .join("\n");

      await findOrCreateActivity(clientId, {
        type: "NOTE",
        subject: "פילוח עונתי",
        content,
        date: new Date(2024, 1, 1), // Approximate — early 2024
      });
    }
    processed++;
  }
  console.log(`    Processed ${processed} seasonal entries`);
}

// ── Main ─────────────────────────────────────────────────────────────

async function main() {
  console.log(`\nInHealthy CRM — Historical Data Import`);
  console.log(`========================================`);
  console.log(`File: ${filePath}`);
  console.log(`Mode: ${DRY_RUN ? "DRY RUN (no writes)" : "LIVE"}`);
  console.log();

  // Load user IDs
  const oren = await prisma.user.findFirst({ where: { email: "oren@inhealthycompany.co.il" } });
  const adi = await prisma.user.findFirst({ where: { email: "adi@inhealthycompany.co.il" } });
  if (!oren) {
    console.error("Admin user (Oren) not found. Run seed first.");
    process.exit(1);
  }
  orenUserId = oren.id;
  adiUserId = adi?.id ?? oren.id;
  console.log(`Admin user: ${oren.name} (${orenUserId})`);
  console.log(`Staff user: ${adi?.name ?? "N/A"} (${adiUserId})`);

  // Pre-warm client cache
  const existingClients = await prisma.client.findMany({ select: { id: true, name: true } });
  for (const c of existingClients) {
    clientCache.set(clientCacheKey(c.name), c.id);
  }
  console.log(`\nPre-loaded ${existingClients.length} existing clients into cache`);

  // Read workbook
  const workbook = XLSX.readFile(filePath!);
  console.log(`\nSheets in workbook: ${workbook.SheetNames.join(", ")}`);

  // ── Process each sheet ──
  const sheetHandlers: [string, (sheet: XLSX.WorkSheet, name: string) => Promise<void>][] = [
    // Main tracking sheets first — these establish most clients
    ["מעקב פניות ללקוחות", importMainTracking],
    ["מעקב לקוחות 25", importMainTracking],
    ["מעקב לקוחות 26", importMainTracking],
    // Rich data sheets
    ["כנס רווחה", (s) => importConference(s)],
    ["לקוחות חדשים", (s) => importNewLeads(s)],
    ["לקוחות רדומים", (s) => importDormant(s)],
    ["מעקב קמפיינים", (s) => importCampaigns(s)],
    ["לינקדאין", (s) => importLinkedIn(s)],
    // Quote tracking
    ["מעקב הצעות מחיר24", (s) => importQuotes(s, "מעקב הצעות מחיר24")],
    ["מעקב הצעות מחיר25", (s) => importQuotes(s, "מעקב הצעות מחיר25")],
    ["מעקב הצעות מחיר 26", (s) => importQuotes(s, "מעקב הצעות מחיר 26")],
    // Seasonal
    ["פילוח לפעילות עונתית", (s) => importSeasonal(s)],
    // Newsletter last — matches against already-imported clients
    ["מעקב דיוורים", (s) => importNewsletter(s)],
  ];

  for (const [sheetName, handler] of sheetHandlers) {
    if (!workbook.SheetNames.includes(sheetName)) {
      console.log(`\n  SKIP "${sheetName}" — not found in workbook`);
      continue;
    }

    console.log(`\n  >> ${sheetName}`);
    const sheet = workbook.Sheets[sheetName];
    await handler(sheet, sheetName);
  }

  // ── Summary ──
  console.log(`\n========================================`);
  console.log(`Import Summary${DRY_RUN ? " (DRY RUN)" : ""}:`);
  console.log(`  Clients created:      ${stats.clientsCreated}`);
  console.log(`  Clients matched:      ${stats.clientsMatched}`);
  console.log(`  Contacts created:     ${stats.contactsCreated}`);
  console.log(`  Contacts skipped:     ${stats.contactsSkipped}`);
  console.log(`  Activities created:   ${stats.activitiesCreated}`);
  console.log(`  Activities skipped:   ${stats.activitiesSkipped}`);
  console.log(`  Mailing list updated: ${stats.mailingListUpdated}`);
  console.log(`========================================\n`);

  await prisma.$disconnect();
  await pool.end();
}

main().catch(async (err) => {
  console.error("\nImport failed:", err);
  await prisma.$disconnect();
  await pool.end();
  process.exit(1);
});
