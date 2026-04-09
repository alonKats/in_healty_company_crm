import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type { Quote, QuoteItem, Client } from "@/generated/prisma";

// Register Noto Sans Hebrew — supports Hebrew in react-pdf
Font.register({
  family: "NotoHebrew",
  fonts: [
    {
      src: "https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-hebrew@5.0.0/files/noto-sans-hebrew-hebrew-400-normal.woff",
      fontWeight: 400,
    },
    {
      src: "https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-hebrew@5.0.0/files/noto-sans-hebrew-hebrew-700-normal.woff",
      fontWeight: 700,
    },
  ],
});

type QuoteWithItems = Quote & {
  client: Client;
  items: QuoteItem[];
  paymentTerms?: string | null;
  version?: number;
};

const styles = StyleSheet.create({
  page: {
    fontFamily: "NotoHebrew",
    fontSize: 10,
    padding: 40,
    direction: "rtl",
    textAlign: "right",
    backgroundColor: "#ffffff",
  },
  // Header
  header: {
    marginBottom: 20,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "#2d6a4f",
    paddingBottom: 12,
  },
  companyName: {
    fontSize: 22,
    fontWeight: 700,
    color: "#2d6a4f",
    textAlign: "center",
  },
  companySubtitle: {
    fontSize: 11,
    color: "#555555",
    marginTop: 3,
    textAlign: "center",
  },
  // Quote meta
  quoteMeta: {
    marginBottom: 16,
    padding: 10,
    backgroundColor: "#f4f9f6",
    borderRadius: 4,
  },
  quoteMetaTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: "#2d6a4f",
    marginBottom: 6,
    textAlign: "right",
  },
  metaRow: {
    flexDirection: "row-reverse",
    marginBottom: 3,
  },
  metaLabel: {
    fontWeight: 700,
    marginLeft: 4,
    color: "#333333",
    width: 90,
    textAlign: "right",
  },
  metaValue: {
    color: "#555555",
    textAlign: "right",
  },
  // Table
  table: {
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: "row-reverse",
    backgroundColor: "#2d6a4f",
    padding: 7,
    borderRadius: 2,
  },
  tableHeaderCell: {
    color: "#ffffff",
    fontWeight: 700,
    fontSize: 9,
    textAlign: "center",
  },
  // Column widths
  colDomain: { width: "20%" },
  colName: { width: "35%" },
  colPrice: { width: "20%" },
  colNotes: { width: "25%" },

  // Category row
  categoryRow: {
    flexDirection: "row-reverse",
    backgroundColor: "#d8eddf",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#b7d8c4",
  },
  categoryText: {
    fontWeight: 700,
    color: "#1b4332",
    fontSize: 9,
    width: "100%",
    textAlign: "right",
  },

  // Item row
  itemRow: {
    flexDirection: "row-reverse",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#e8e8e8",
  },
  itemRowAlt: {
    backgroundColor: "#f9f9f9",
  },
  itemCell: {
    fontSize: 9,
    color: "#333333",
    textAlign: "center",
  },
  itemCellRight: {
    textAlign: "right",
  },

  // Total row
  totalRow: {
    flexDirection: "row-reverse",
    backgroundColor: "#2d6a4f",
    padding: 9,
    marginTop: 2,
    borderRadius: 2,
  },
  totalLabel: {
    color: "#ffffff",
    fontWeight: 700,
    fontSize: 11,
    flex: 1,
    textAlign: "right",
  },
  totalValue: {
    color: "#ffffff",
    fontWeight: 700,
    fontSize: 11,
    textAlign: "left",
  },

  // Terms / Notes
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: "#2d6a4f",
    marginBottom: 4,
    textAlign: "right",
  },
  sectionBody: {
    fontSize: 9,
    color: "#444444",
    lineHeight: 1.5,
    textAlign: "right",
  },

  // Footer
  footer: {
    marginTop: "auto",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#cccccc",
    alignItems: "center",
  },
  footerText: {
    fontSize: 8,
    color: "#888888",
    textAlign: "center",
  },
});

function formatPrice(amount: number | string | { toString(): string }): string {
  const num = typeof amount === "number" ? amount : parseFloat(amount.toString());
  return `₪${num.toLocaleString("he-IL", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function formatDate(date: Date | null | undefined): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("he-IL");
}

// Group items by category, preserving sort order
function groupItemsByCategory(
  items: QuoteItem[]
): { category: string; items: QuoteItem[] }[] {
  const groups: { category: string; items: QuoteItem[] }[] = [];
  const seen = new Map<string, number>();

  for (const item of items) {
    const cat = item.category || "כללי";
    if (!seen.has(cat)) {
      seen.set(cat, groups.length);
      groups.push({ category: cat, items: [] });
    }
    groups[seen.get(cat)!].items.push(item);
  }

  return groups;
}

export function QuotePdfDocument({ quote }: { quote: QuoteWithItems }) {
  const groups = groupItemsByCategory(quote.items);

  let rowIndex = 0;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Company Header */}
        <View style={styles.header}>
          <Text style={styles.companyName}>בחברה בריאה</Text>
          <Text style={styles.companySubtitle}>קידום בריאות בחברה</Text>
        </View>

        {/* Quote Meta */}
        <View style={styles.quoteMeta}>
          <Text style={styles.quoteMetaTitle}>
            הצעת מחיר מספר #{quote.quoteNumber}
            {quote.version && quote.version > 1 ? ` (גרסה ${quote.version})` : ""}
          </Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>תאריך:</Text>
            <Text style={styles.metaValue}>
              {formatDate(quote.createdAt)}
            </Text>
          </View>
          {quote.validUntil && (
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>בתוקף עד:</Text>
              <Text style={styles.metaValue}>
                {formatDate(quote.validUntil)}
              </Text>
            </View>
          )}
          {quote.eventDate && (
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>תאריך אירוע:</Text>
              <Text style={styles.metaValue}>
                {formatDate(quote.eventDate)}
              </Text>
            </View>
          )}
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>לקוח:</Text>
            <Text style={styles.metaValue}>{quote.client.name}</Text>
          </View>
          {quote.client.company && (
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>חברה:</Text>
              <Text style={styles.metaValue}>{quote.client.company}</Text>
            </View>
          )}
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colNotes]}>
              הערות
            </Text>
            <Text style={[styles.tableHeaderCell, styles.colPrice]}>
              עלות הפעילות
            </Text>
            <Text style={[styles.tableHeaderCell, styles.colName]}>
              שם הפעילות
            </Text>
            <Text style={[styles.tableHeaderCell, styles.colDomain]}>
              תחום הפעילות
            </Text>
          </View>

          {/* Grouped Rows */}
          {groups.map((group) => (
            <View key={group.category}>
              {/* Category header row */}
              <View style={styles.categoryRow}>
                <Text style={styles.categoryText}>{group.category}</Text>
              </View>

              {/* Item rows */}
              {group.items.map((item) => {
                const isAlt = rowIndex % 2 === 1;
                rowIndex++;
                return (
                  <View
                    key={item.id}
                    style={[styles.itemRow, isAlt ? styles.itemRowAlt : {}]}
                  >
                    <Text style={[styles.itemCell, styles.colNotes]}>
                      {item.notes || ""}
                    </Text>
                    <Text style={[styles.itemCell, styles.colPrice]}>
                      {formatPrice(item.total)}
                      {item.quantity > 1 && (
                        <Text style={{ fontSize: 8, color: "#888" }}>
                          {" "}
                          ({item.quantity} x {formatPrice(item.unitPrice)})
                        </Text>
                      )}
                    </Text>
                    <Text
                      style={[
                        styles.itemCell,
                        styles.colName,
                        styles.itemCellRight,
                      ]}
                    >
                      {item.description}
                    </Text>
                    <Text style={[styles.itemCell, styles.colDomain]}>
                      {""}
                    </Text>
                  </View>
                );
              })}
            </View>
          ))}

          {/* Grand Total */}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>סה״כ לפני מע״מ:</Text>
            <Text style={styles.totalValue}>
              {formatPrice(quote.totalAmount)}
            </Text>
          </View>
        </View>

        {/* Notes */}
        {quote.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>הערות</Text>
            <Text style={styles.sectionBody}>{quote.notes}</Text>
          </View>
        )}

        {/* Terms */}
        {quote.terms && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>תנאים</Text>
            <Text style={styles.sectionBody}>{quote.terms}</Text>
          </View>
        )}

        {/* Payment Terms */}
        {quote.paymentTerms && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>תנאי תשלום</Text>
            <Text style={styles.sectionBody}>{quote.paymentTerms}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            בחברה בריאה | קידום בריאות בחברה
          </Text>
          <Text style={styles.footerText}>
            www.bchevraberiva.co.il
          </Text>
        </View>
      </Page>
    </Document>
  );
}
