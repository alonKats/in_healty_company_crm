/**
 * Historical data import from Oren's Excel workbook.
 *
 * Usage:
 *   npx tsx prisma/import-history.ts path/to/workbook.xlsx [--dry-run]
 *
 * Blocked on: Oren sending his actual XLSX export.
 * Update the SHEET_MAP and column mappings once we have the real file.
 */

import * as XLSX from "xlsx";
import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

const DRY_RUN = process.argv.includes("--dry-run");
const filePath = process.argv[2];

if (!filePath) {
  console.error("Usage: npx tsx prisma/import-history.ts <path-to-xlsx> [--dry-run]");
  process.exit(1);
}

// Sheet name → handler mapping. Update once we see Oren's actual sheet names.
const SHEET_MAP: Record<string, (rows: Record<string, string>[]) => Promise<void>> = {
  // "מעקב לקוחות": importClientInteractions,
  // "LinkedIn": importLinkedInLeads,
  // "לידים חדשים": importNewProspects,
  // "לקוחות רדומים": importDormantClients,
  // "מעקב הצעות מחיר": importQuoteTracking,
  // "לידים קמפיין": importCampaignLeads,
  // "כנסים": importConferenceContacts,
  // "ניוזלטר": importNewsletterTracking,
};

async function findOrCreateClient(
  name: string,
  company: string | null,
  source: string,
): Promise<string> {
  const existing = await prisma.client.findFirst({
    where: {
      name: { equals: name, mode: "insensitive" },
      ...(company ? { company: { equals: company, mode: "insensitive" } } : {}),
    },
    select: { id: true },
  });

  if (existing) return existing.id;

  if (DRY_RUN) {
    console.log(`[DRY RUN] Would create client: ${name} (${company ?? "no company"}) source=${source}`);
    return "dry-run-id";
  }

  const client = await prisma.client.create({
    data: {
      name,
      company,
      source: source as "REFERRAL" | "LINKEDIN" | "CONFERENCE" | "CAMPAIGN" | "MAILING" | "OTHER",
      status: "LEAD",
    },
  });

  return client.id;
}

async function main() {
  console.log(`Reading workbook: ${filePath}`);
  console.log(DRY_RUN ? "Mode: DRY RUN (no writes)" : "Mode: LIVE");

  const workbook = XLSX.readFile(filePath);

  console.log(`\nSheets found: ${workbook.SheetNames.join(", ")}`);

  for (const sheetName of workbook.SheetNames) {
    const handler = SHEET_MAP[sheetName];
    if (!handler) {
      console.log(`\n⏭ Skipping sheet: "${sheetName}" (no handler mapped)`);
      continue;
    }

    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet);
    console.log(`\n📋 Processing sheet: "${sheetName}" (${rows.length} rows)`);

    await handler(rows);
  }

  console.log("\nDone.");
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Import failed:", err);
  prisma.$disconnect();
  process.exit(1);
});
