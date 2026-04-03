import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { hash } from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Clear existing data for clean re-seed
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.quoteItem.deleteMany();
  await prisma.quote.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.client.deleteMany();
  await prisma.service.deleteMany();
  await prisma.costItem.deleteMany();
  await prisma.category.deleteMany();
  // Don't delete users

  const adminPassword = await hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "oren@inhealthycompany.co.il" },
    update: {},
    create: {
      name: "אורן",
      email: "oren@inhealthycompany.co.il",
      passwordHash: adminPassword,
      role: "ADMIN",
    },
  });

  const staffPassword = await hash("staff123", 12);
  await prisma.user.upsert({
    where: { email: "adi@inhealthycompany.co.il" },
    update: {},
    create: {
      name: "עדי",
      email: "adi@inhealthycompany.co.il",
      passwordHash: staffPassword,
      role: "STAFF",
    },
  });

  const serviceCategories = [
    { id: "cat-stands", name: "דוכנים", sortOrder: 1 },
    { id: "cat-external-lectures", name: "הרצאות חיצוניות", sortOrder: 2 },
    { id: "cat-food-workshops", name: "סדנאות אוכל", sortOrder: 3 },
    { id: "cat-external-workshops", name: "סדנאות חיצוניות", sortOrder: 4 },
    { id: "cat-bodymind", name: "סדנאות גוף נפש", sortOrder: 5 },
    { id: "cat-movement", name: "סדנאות תנועה", sortOrder: 6 },
    { id: "cat-medical", name: "בדיקות רופא", sortOrder: 7 },
    { id: "cat-health-month", name: "חודש בריאות", sortOrder: 8 },
    { id: "cat-health-day", name: "יום בריאות", sortOrder: 9 },
  ];

  for (const cat of serviceCategories) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: {},
      create: cat,
    });
  }

  // =============================================
  // SERVICES — real catalog derived from actual Q1 2026 sales
  // =============================================

  const serviceDefinitions = [
    // דוכנים (Stands)
    { name: "דוכן סמודי בולס", categoryId: "cat-stands", basePrice: 9700 },
    { name: "דוכן סמודי בולס וחטיפי אנרגיה", categoryId: "cat-stands", basePrice: 7000 },
    { name: "דוכן מרקים", categoryId: "cat-stands", basePrice: 8300 },
    { name: "דוכן משקאות חורף", categoryId: "cat-stands", basePrice: 6950 },
    { name: "דוכן סלטים טורטיות ושייקים", categoryId: "cat-stands", basePrice: 11650 },
    { name: "דוכן שייקים", categoryId: "cat-stands", basePrice: 5050 },
    { name: "דוכן שייקים ותוספת בריכים", categoryId: "cat-stands", basePrice: 7750 },
    // הרצאות חיצוניות (External Lectures)
    { name: "הרצאה בנושא מניעת סרטן", categoryId: "cat-external-lectures", basePrice: 4800 },
    { name: "הרצאה קרן אן גיימן", categoryId: "cat-external-lectures", basePrice: 5650 },
    // סדנאות אוכל (Food Workshops)
    { name: "סדנת מתוקים בריאים", categoryId: "cat-food-workshops", basePrice: 4250 },
    { name: "סדנת שייקים", categoryId: "cat-food-workshops", basePrice: 4200 },
    // סדנאות חיצוניות (External Workshops)
    { name: "סדנת צמחי מרפא", categoryId: "cat-external-workshops", basePrice: 3850 },
    { name: "סדנת רוקחות", categoryId: "cat-external-workshops", basePrice: 5680 },
    // סדנאות גוף נפש (Body & Mind)
    { name: "מעסים", categoryId: "cat-bodymind", basePrice: 1990 },
    { name: "סדנת קרח", categoryId: "cat-bodymind", basePrice: 2850 },
    { name: "צלילים מרפאים", categoryId: "cat-bodymind", basePrice: 1833 },
    // סדנאות תנועה (Movement)
    { name: "שיעור יוגה", categoryId: "cat-movement", basePrice: 833 },
    { name: "שיעור פילאטיס", categoryId: "cat-movement", basePrice: 833 },
    { name: "צ'י קונג", categoryId: "cat-movement", basePrice: 1100 },
    { name: "אירובי דאנס", categoryId: "cat-movement", basePrice: 1600 },
    // בדיקות רופא (Medical)
    { name: "כירורגית שד", categoryId: "cat-medical", basePrice: 8450 },
    { name: "סקירת שומות", categoryId: "cat-medical", basePrice: 7700 },
    // חבילות (Packages)
    { name: "חודש בריאות", categoryId: "cat-health-month", basePrice: 24350 },
    { name: "יום בריאות", categoryId: "cat-health-day", basePrice: 44350 },
    // 2025 additions — services not in Q1 2026 catalog
    { name: "עמדת סחלב ומתוקים", categoryId: "cat-stands", basePrice: 7050 },
    { name: "יעוץ תזונתי", categoryId: "cat-medical", basePrice: 4500 },
    { name: "עמדת אסאי", categoryId: "cat-stands", basePrice: 4500 },
    { name: "סדנת דיטוקס", categoryId: "cat-food-workshops", basePrice: 3500 },
    { name: "רופאת עור", categoryId: "cat-medical", basePrice: 10250 },
    { name: "סדנת חטיפי אנרגיה", categoryId: "cat-food-workshops", basePrice: 3500 },
    { name: "סדנאות קיימות", categoryId: "cat-external-workshops", basePrice: 5000 },
    { name: "שבוע בריאות", categoryId: "cat-health-month", basePrice: 8850 },
  ];

  const serviceMap = new Map<string, string>(); // name -> id
  for (const svc of serviceDefinitions) {
    const created = await prisma.service.create({
      data: {
        name: svc.name,
        categoryId: svc.categoryId,
        basePrice: svc.basePrice,
        sourceType: "IN_HOUSE",
        status: "ACTIVE",
      },
    });
    serviceMap.set(svc.name, created.id);
  }

  // =============================================
  // CLIENT DATA
  // =============================================

  const clients: Array<{
    name: string;
    status: "LEAD" | "ACTIVE" | "DORMANT";
    source: "COLD_OUTREACH" | "LINKEDIN" | "CONFERENCE" | "CAMPAIGN" | "INBOUND" | "REFERRAL" | "OTHER";
    contact_name?: string;
    contact_phone?: string;
  }> = [
    { name: "At&t", status: "ACTIVE", source: "COLD_OUTREACH" },
    { name: "Atera", status: "ACTIVE", source: "LINKEDIN", contact_name: "Shani Singer" },
    { name: "Datarails", status: "ACTIVE", source: "COLD_OUTREACH" },
    { name: "Essence", status: "ACTIVE", source: "COLD_OUTREACH" },
    { name: "General Motors", status: "ACTIVE", source: "LINKEDIN", contact_name: "Dana Izhari" },
    { name: "Gong", status: "ACTIVE", source: "COLD_OUTREACH" },
    { name: "HiBob", status: "ACTIVE", source: "COLD_OUTREACH" },
    { name: "HP", status: "ACTIVE", source: "COLD_OUTREACH" },
    { name: "Hpe", status: "ACTIVE", source: "COLD_OUTREACH" },
    { name: "Ikea", status: "ACTIVE", source: "COLD_OUTREACH" },
    { name: "J&J", status: "ACTIVE", source: "COLD_OUTREACH" },
    { name: "KLA", status: "ACTIVE", source: "COLD_OUTREACH" },
    { name: "Mobileye", status: "ACTIVE", source: "LINKEDIN", contact_name: "Yarden Kol" },
    { name: "MyHeritage", status: "DORMANT", source: "LINKEDIN", contact_name: "Ophir Tchwella" },
    { name: "Payu", status: "ACTIVE", source: "COLD_OUTREACH" },
    { name: "Similarweb", status: "ACTIVE", source: "LINKEDIN", contact_name: "May Zvi" },
    { name: "Sysaid", status: "ACTIVE", source: "COLD_OUTREACH", contact_name: "ויקי", contact_phone: "054-7887250" },
    { name: "WSC-Sport", status: "ACTIVE", source: "COLD_OUTREACH" },
    { name: "Appsflyer", status: "ACTIVE", source: "COLD_OUTREACH", contact_name: "רותי" },
    { name: "Monday", status: "ACTIVE", source: "LINKEDIN", contact_name: "Hadar Yaakov" },
    { name: "Wiz", status: "ACTIVE", source: "LINKEDIN", contact_name: "Renana Borenstein" },
    { name: "Walkme", status: "ACTIVE", source: "LINKEDIN", contact_name: "Hili Shofman" },
    { name: "Yotpo", status: "ACTIVE", source: "LINKEDIN", contact_name: "Bator Geva" },
    { name: "zero networks", status: "ACTIVE", source: "COLD_OUTREACH" },
    { name: "siemens", status: "ACTIVE", source: "COLD_OUTREACH" },
    { name: "cloudinary", status: "ACTIVE", source: "COLD_OUTREACH" },
    { name: "אדרניסט עו\"ד", status: "ACTIVE", source: "COLD_OUTREACH" },
    { name: "איטורו", status: "ACTIVE", source: "COLD_OUTREACH" },
    { name: "אייטק מערכות", status: "ACTIVE", source: "COLD_OUTREACH" },
    { name: "איליון", status: "ACTIVE", source: "COLD_OUTREACH" },
    { name: "אינבידיה (מלנוקס)", status: "ACTIVE", source: "COLD_OUTREACH", contact_name: "תמרה", contact_phone: "054-7758758" },
    { name: "אינטואיט", status: "ACTIVE", source: "COLD_OUTREACH" },
    { name: "אלביט נתניה", status: "ACTIVE", source: "COLD_OUTREACH", contact_name: "חן בלום", contact_phone: "054-9996401" },
    { name: "אלביט רחובות", status: "DORMANT", source: "COLD_OUTREACH" },
    { name: "אלוט תקשורת", status: "ACTIVE", source: "COLD_OUTREACH" },
    { name: "אמזון", status: "DORMANT", source: "COLD_OUTREACH" },
    { name: "אמי טכנולוגיות", status: "ACTIVE", source: "COLD_OUTREACH" },
    { name: "באייר", status: "DORMANT", source: "COLD_OUTREACH" },
    { name: "בנק הפועלים", status: "DORMANT", source: "COLD_OUTREACH" },
    { name: "ברייט משינס", status: "DORMANT", source: "COLD_OUTREACH" },
    { name: "ג'וינט", status: "ACTIVE", source: "COLD_OUTREACH" },
    { name: "דל", status: "ACTIVE", source: "COLD_OUTREACH" },
    { name: "דקסל", status: "ACTIVE", source: "COLD_OUTREACH" },
    { name: "דרך ארץ", status: "ACTIVE", source: "COLD_OUTREACH", contact_name: "זוהר דרור", contact_phone: "050-8328371" },
    { name: "הפניקס", status: "ACTIVE", source: "COLD_OUTREACH" },
    { name: "הרמן", status: "ACTIVE", source: "COLD_OUTREACH" },
    { name: "ווסט פארמה", status: "ACTIVE", source: "COLD_OUTREACH" },
    { name: "טאואר", status: "ACTIVE", source: "COLD_OUTREACH" },
    { name: "טכניון", status: "ACTIVE", source: "COLD_OUTREACH" },
    { name: "כלמוביל", status: "ACTIVE", source: "COLD_OUTREACH" },
    { name: "כתר", status: "ACTIVE", source: "COLD_OUTREACH" },
    { name: "לפידות", status: "ACTIVE", source: "COLD_OUTREACH" },
    { name: "מדטכניקה / Ilex", status: "ACTIVE", source: "COLD_OUTREACH" },
    { name: "מדטרוניק", status: "DORMANT", source: "COLD_OUTREACH" },
    { name: "מזרחי טפחות", status: "ACTIVE", source: "COLD_OUTREACH", contact_name: "אבי יעל" },
    { name: "מטא", status: "ACTIVE", source: "COLD_OUTREACH" },
    { name: "מטריקס", status: "ACTIVE", source: "COLD_OUTREACH" },
    { name: "מינט מדיה", status: "ACTIVE", source: "COLD_OUTREACH" },
    { name: "מכון ויצמן", status: "ACTIVE", source: "COLD_OUTREACH" },
    { name: "מרק תרופות", status: "ACTIVE", source: "COLD_OUTREACH" },
    { name: "מתף", status: "ACTIVE", source: "COLD_OUTREACH" },
    { name: "נובולוג", status: "ACTIVE", source: "COLD_OUTREACH" },
    { name: "נוירדרם", status: "ACTIVE", source: "COLD_OUTREACH" },
    { name: "סאפיינס", status: "ACTIVE", source: "COLD_OUTREACH" },
    { name: "סודה סטרים", status: "ACTIVE", source: "COLD_OUTREACH" },
    { name: "סטורנקסט", status: "ACTIVE", source: "COLD_OUTREACH" },
    { name: "סייבר ארק", status: "DORMANT", source: "COLD_OUTREACH" },
    { name: "סלברייט", status: "DORMANT", source: "COLD_OUTREACH" },
    { name: "סמסונג", status: "ACTIVE", source: "COLD_OUTREACH" },
    { name: "עיריית ראשל\"צ", status: "ACTIVE", source: "COLD_OUTREACH" },
    { name: "פאלו אלטו נטוורקס", status: "ACTIVE", source: "COLD_OUTREACH" },
    { name: "פאפיה גיימינג", status: "ACTIVE", source: "COLD_OUTREACH" },
    { name: "פורטינט", status: "ACTIVE", source: "COLD_OUTREACH" },
    { name: "פייבר", status: "DORMANT", source: "COLD_OUTREACH" },
    { name: "פיליפס", status: "ACTIVE", source: "COLD_OUTREACH" },
    { name: "פלסאון", status: "ACTIVE", source: "COLD_OUTREACH" },
    { name: "פנטרה", status: "DORMANT", source: "COLD_OUTREACH" },
    { name: "צ'ק מרקס", status: "DORMANT", source: "COLD_OUTREACH" },
    { name: "קוגניט / ורינט", status: "ACTIVE", source: "COLD_OUTREACH", contact_name: "לימור וייס" },
    { name: "קייטו נטוורקס", status: "ACTIVE", source: "COLD_OUTREACH" },
    { name: "רדוור", status: "DORMANT", source: "COLD_OUTREACH" },
    { name: "רזונטיקס", status: "ACTIVE", source: "COLD_OUTREACH" },
    { name: "שיכון ובינוי", status: "ACTIVE", source: "COLD_OUTREACH", contact_name: "מורן ואיילת" },
    { name: "שפיר", status: "ACTIVE", source: "COLD_OUTREACH", contact_name: "מיכל" },
    { name: "שתיים הפקות (נובו נורדיסק)", status: "ACTIVE", source: "COLD_OUTREACH" },
    { name: "תופין", status: "DORMANT", source: "COLD_OUTREACH" },
  ];

  let clientCount = 0;
  for (const c of clients) {
    await prisma.client.create({
      data: {
        name: c.name,
        status: c.status,
        source: c.source,
        assignedToId: admin.id,
        contacts: c.contact_name
          ? {
              create: {
                name: c.contact_name,
                phone: c.contact_phone ?? null,
                isPrimary: true,
              },
            }
          : undefined,
      },
    });
    clientCount++;
  }

  // =============================================
  // 2026 INCOME DATA — real Q1 2026 sales from PDF
  // Bundle orders (חבילה + רכיב סל) are grouped into one order per client+month.
  // Single products (מוצר בודד) from the same client+month also group into one order.
  // =============================================

  // Each entry: month, year, client name (as in PDF), items array
  // Items have: serviceName, qty, amount, type (BUNDLE_HEADER | BUNDLE_COMPONENT | SINGLE)
  type SaleItem = {
    serviceName: string;
    quantity: number;
    amount: number;
    isBundleHeader?: boolean; // true for the חבילה line
  };
  type SaleGroup = {
    month: number;
    year: number;
    client: string;
    orderType: "BUNDLE" | "SINGLE";
    items: SaleItem[];
  };

  const sales2026: SaleGroup[] = [
    // ===== JANUARY 2026 =====
    {
      month: 1, year: 2026, client: "siemens", orderType: "SINGLE",
      items: [{ serviceName: "כירורגית שד", quantity: 1, amount: 8450 }],
    },
    // Cloudinary: 1 bundle header + 3 components = ONE bundle order
    {
      month: 1, year: 2026, client: "cloudinary", orderType: "BUNDLE",
      items: [
        { serviceName: "חודש בריאות", quantity: 1, amount: 24350, isBundleHeader: true },
        { serviceName: "מעסים", quantity: 1, amount: 9650 },
        { serviceName: "כירורגית שד", quantity: 1, amount: 7000 },
        { serviceName: "סקירת שומות", quantity: 1, amount: 7700 },
      ],
    },

    // ===== FEBRUARY 2026 =====
    {
      month: 2, year: 2026, client: "Datarails", orderType: "SINGLE",
      items: [{ serviceName: "דוכן סמודי בולס וחטיפי אנרגיה", quantity: 1, amount: 7000 }],
    },
    {
      month: 2, year: 2026, client: "HP", orderType: "SINGLE",
      items: [{ serviceName: "הרצאה בנושא מניעת סרטן", quantity: 1, amount: 4800 }],
    },
    {
      month: 2, year: 2026, client: "zero networks", orderType: "SINGLE",
      items: [
        { serviceName: "הרצאה קרן אן גיימן", quantity: 1, amount: 5650 },
        { serviceName: "סדנת מתוקים בריאים", quantity: 1, amount: 4250 },
      ],
    },
    {
      month: 2, year: 2026, client: "Gong", orderType: "SINGLE",
      items: [
        { serviceName: "סדנת שייקים", quantity: 1, amount: 4200 },
        { serviceName: "סדנת צמחי מרפא", quantity: 2, amount: 7700 },
      ],
    },
    {
      month: 2, year: 2026, client: "Hpe", orderType: "SINGLE",
      items: [{ serviceName: "דוכן מרקים", quantity: 1, amount: 8300 }],
    },
    {
      month: 2, year: 2026, client: "שתיים הפקות (נובו נורדיסק)", orderType: "SINGLE",
      items: [{ serviceName: "סדנת שייקים", quantity: 1, amount: 3650 }],
    },

    // ===== MARCH 2026 =====
    {
      month: 3, year: 2026, client: "Ikea", orderType: "SINGLE",
      items: [{ serviceName: "סדנת רוקחות", quantity: 5, amount: 28400 }],
    },
    // מכון ויצמן: 1 bundle header + 8 components = ONE bundle order
    {
      month: 3, year: 2026, client: "מכון ויצמן", orderType: "BUNDLE",
      items: [
        { serviceName: "יום בריאות", quantity: 1, amount: 44350, isBundleHeader: true },
        { serviceName: "סדנת קרח", quantity: 3, amount: 8550 },
        { serviceName: "שיעור יוגה", quantity: 3, amount: 2500 },
        { serviceName: "שיעור פילאטיס", quantity: 3, amount: 2500 },
        { serviceName: "מעסים", quantity: 10, amount: 19900 },
        { serviceName: "צ'י קונג", quantity: 2, amount: 2200 },
        { serviceName: "אירובי דאנס", quantity: 2, amount: 3200 },
        { serviceName: "צלילים מרפאים", quantity: 3, amount: 5500 },
      ],
    },
    {
      month: 3, year: 2026, client: "טכניון", orderType: "SINGLE",
      items: [{ serviceName: "דוכן סמודי בולס", quantity: 1, amount: 9700 }],
    },
    {
      month: 3, year: 2026, client: "HiBob", orderType: "SINGLE",
      items: [
        { serviceName: "דוכן משקאות חורף", quantity: 1, amount: 6950 },
        { serviceName: "דוכן מרקים", quantity: 1, amount: 10700 },
      ],
    },
    {
      month: 3, year: 2026, client: "טכניון", orderType: "SINGLE",
      items: [{ serviceName: "דוכן סלטים טורטיות ושייקים", quantity: 1, amount: 11650 }],
    },
    {
      month: 3, year: 2026, client: "סטורנקסט", orderType: "SINGLE",
      items: [{ serviceName: "דוכן שייקים ותוספת בריכים", quantity: 1, amount: 7750 }],
    },
    {
      month: 3, year: 2026, client: "עיריית ראשל\"צ", orderType: "SINGLE",
      items: [{ serviceName: "דוכן שייקים", quantity: 1, amount: 5050 }],
    },
  ];

  let orderCount = 0;
  for (const group of sales2026) {
    const clientRecord = await prisma.client.findFirst({
      where: { name: group.client },
    });

    const clientId = clientRecord?.id ?? (
      await prisma.client.create({
        data: {
          name: group.client,
          status: "ACTIVE",
          source: "COLD_OUTREACH",
          assignedToId: admin.id,
        },
      })
    ).id;

    const totalAmount = group.items.reduce((sum, i) => sum + i.amount, 0);
    const eventDate = new Date(group.year, group.month - 1, 15); // mid-month

    await prisma.order.create({
      data: {
        clientId,
        status: "COMPLETED",
        type: group.orderType,
        eventDate,
        totalAmount,
        items: {
          create: group.items.map((item) => ({
            description: item.serviceName,
            quantity: item.quantity,
            unitPrice: Math.round(item.amount / item.quantity),
            total: item.amount,
            serviceId: serviceMap.get(item.serviceName),
          })),
        },
        payments: {
          create: {
            amount: totalAmount,
            method: "TRANSFER",
            date: eventDate,
            status: "PAID",
          },
        },
      },
    });
    orderCount++;
  }

  // =============================================
  // 2025 INCOME DATA — 44 valid sales (3 garbage entries filtered out)
  // Filtered: "416", "683", "3700" (numeric = misaligned column data)
  //           "כולל דקסל:" (subtotal label)
  // Client fuzzy matching: "סודה סטרים - אשקלון" → "סודה סטרים", etc.
  // =============================================

  const sales2025: SaleGroup[] = [
    // ===== JANUARY 2025 =====
    {
      month: 1, year: 2025, client: "ווסט פארמה", orderType: "SINGLE",
      items: [{ serviceName: "עמדת סחלב ומתוקים", quantity: 1, amount: 7050 }],
    },
    {
      month: 1, year: 2025, client: "Hpe", orderType: "SINGLE",
      items: [{ serviceName: "סדנת רוקחות", quantity: 1, amount: 3950 }],
    },
    {
      month: 1, year: 2025, client: "cloudinary", orderType: "BUNDLE",
      items: [{ serviceName: "חודש בריאות", quantity: 1, amount: 41883, isBundleHeader: true }],
    },
    {
      month: 1, year: 2025, client: "ריבון", orderType: "SINGLE",
      items: [{ serviceName: "דוכן מרקים", quantity: 1, amount: 11950 }],
    },

    // ===== FEBRUARY 2025 =====
    {
      month: 2, year: 2025, client: "We Work", orderType: "SINGLE",
      items: [{ serviceName: "סדנת חטיפי אנרגיה", quantity: 1, amount: 3500 }],
    },
    {
      month: 2, year: 2025, client: "דקסל", orderType: "SINGLE",
      items: [{ serviceName: "יעוץ תזונתי", quantity: 2, amount: 4500 }],
    },
    {
      month: 2, year: 2025, client: "IBM", orderType: "SINGLE",
      items: [{ serviceName: "דוכן מרקים", quantity: 2, amount: 7200 }],
    },
    {
      month: 2, year: 2025, client: "דרייבס", orderType: "SINGLE",
      items: [{ serviceName: "דוכן מרקים", quantity: 1, amount: 5550 }],
    },
    {
      month: 2, year: 2025, client: "Datarails", orderType: "SINGLE",
      items: [{ serviceName: "עמדת אסאי", quantity: 1, amount: 4550 }],
    },
    {
      month: 2, year: 2025, client: "סופרקום", orderType: "SINGLE",
      items: [{ serviceName: "סדנת חטיפי אנרגיה", quantity: 1, amount: 3950 }],
    },
    {
      month: 2, year: 2025, client: "אייטק מערכות", orderType: "SINGLE",
      items: [{ serviceName: "הרצאה בנושא מניעת סרטן", quantity: 1, amount: 2950 }],
    },
    {
      month: 2, year: 2025, client: "ויסמן פרידמן", orderType: "SINGLE",
      items: [{ serviceName: "דוכן מרקים", quantity: 1, amount: 5050 }],
    },

    // ===== MARCH 2025 =====
    {
      month: 3, year: 2025, client: "בקטוכם", orderType: "SINGLE",
      items: [{ serviceName: "סדנת מתוקים בריאים", quantity: 2, amount: 7290 }],
    },
    {
      month: 3, year: 2025, client: "איגודן", orderType: "SINGLE",
      items: [{ serviceName: "סדנת מתוקים בריאים", quantity: 1, amount: 3600 }],
    },

    // ===== APRIL 2025 =====
    {
      month: 4, year: 2025, client: "Ikea", orderType: "SINGLE",
      items: [{ serviceName: "סדנאות קיימות", quantity: 1, amount: 15150 }],
    },
    {
      month: 4, year: 2025, client: "טכניון", orderType: "SINGLE",
      items: [{ serviceName: "עמדת אסאי", quantity: 1, amount: 5800 }],
    },

    // ===== MAY 2025 =====
    {
      month: 5, year: 2025, client: "טאואר", orderType: "SINGLE",
      items: [{ serviceName: "דוכן סמודי בולס", quantity: 1, amount: 48750 }],
    },
    {
      month: 5, year: 2025, client: "סודה סטרים", orderType: "BUNDLE",
      items: [{ serviceName: "שבוע בריאות", quantity: 1, amount: 135300, isBundleHeader: true }],
    },
    {
      month: 5, year: 2025, client: "בנפיט עמותה מילואים", orderType: "SINGLE",
      items: [{ serviceName: "עמדת אסאי", quantity: 1, amount: 2750 }],
    },
    {
      month: 5, year: 2025, client: "מדטרוניק", orderType: "SINGLE",
      items: [{ serviceName: "עמדת אסאי", quantity: 1, amount: 4900 }],
    },
    {
      month: 5, year: 2025, client: "רזונטיקס", orderType: "SINGLE",
      items: [{ serviceName: "דוכן סמודי בולס", quantity: 2, amount: 12900 }],
    },
    {
      month: 5, year: 2025, client: "RTS אסם", orderType: "SINGLE",
      items: [{ serviceName: "סדנת חטיפי אנרגיה", quantity: 2, amount: 6700 }],
    },

    // ===== JUNE 2025 =====
    {
      month: 6, year: 2025, client: "סודה סטרים", orderType: "BUNDLE",
      items: [{ serviceName: "יום בריאות", quantity: 1, amount: 14140, isBundleHeader: true }],
    },
    {
      month: 6, year: 2025, client: "ג'וינט", orderType: "SINGLE",
      items: [{ serviceName: "רופאת עור", quantity: 1, amount: 10250 }],
    },
    {
      month: 6, year: 2025, client: "פנטרה", orderType: "SINGLE",
      items: [{ serviceName: "מעסים", quantity: 4, amount: 5310 }],
    },
    {
      month: 6, year: 2025, client: "Datarails", orderType: "SINGLE",
      items: [{ serviceName: "סדנת מתוקים בריאים", quantity: 1, amount: 2500 }],
    },
    {
      month: 6, year: 2025, client: "פיינל", orderType: "SINGLE",
      items: [{ serviceName: "דוכן שייקים", quantity: 1, amount: 12650 }],
    },

    // ===== JULY 2025 =====
    {
      month: 7, year: 2025, client: "ג'וינט", orderType: "SINGLE",
      items: [{ serviceName: "רופאת עור", quantity: 1, amount: 3400 }],
    },

    // ===== SEPTEMBER 2025 =====
    {
      month: 9, year: 2025, client: "HiBob", orderType: "BUNDLE",
      items: [{ serviceName: "שבוע בריאות", quantity: 1, amount: 8950, isBundleHeader: true }],
    },
    {
      month: 9, year: 2025, client: "מארוול", orderType: "SINGLE",
      items: [{ serviceName: "דוכן שייקים", quantity: 2, amount: 5250 }],
    },
    {
      month: 9, year: 2025, client: "Gong", orderType: "SINGLE",
      items: [{ serviceName: "דוכן שייקים", quantity: 1, amount: 6450 }],
    },
    {
      month: 9, year: 2025, client: "קוגניט / ורינט", orderType: "SINGLE",
      items: [{ serviceName: "דוכן שייקים", quantity: 1, amount: 3200 }],
    },
    {
      month: 9, year: 2025, client: "הרמן", orderType: "SINGLE",
      items: [{ serviceName: "עמדת אסאי", quantity: 1, amount: 5900 }],
    },
    {
      month: 9, year: 2025, client: "כנס ישראל כללית", orderType: "SINGLE",
      items: [{ serviceName: "דוכן שייקים", quantity: 2, amount: 5350 }],
    },

    // ===== NOVEMBER 2025 =====
    {
      month: 11, year: 2025, client: "סטרטסיס", orderType: "SINGLE",
      items: [{ serviceName: "סדנת שייקים", quantity: 1, amount: 34400 }],
    },
    {
      month: 11, year: 2025, client: "אורפק", orderType: "SINGLE",
      items: [{ serviceName: "רופאת עור", quantity: 1, amount: 37500 }],
    },
    {
      month: 11, year: 2025, client: "אלביט מערכות", orderType: "BUNDLE",
      items: [{ serviceName: "יום בריאות", quantity: 1, amount: 14400, isBundleHeader: true }],
    },
    {
      month: 11, year: 2025, client: "Ikea", orderType: "BUNDLE",
      items: [{ serviceName: "חודש בריאות", quantity: 1, amount: 22400, isBundleHeader: true }],
    },
    {
      month: 11, year: 2025, client: "דל", orderType: "BUNDLE",
      items: [{ serviceName: "שבוע בריאות", quantity: 1, amount: 6500, isBundleHeader: true }],
    },
    {
      month: 11, year: 2025, client: "דל מכירות", orderType: "BUNDLE",
      items: [{ serviceName: "יום בריאות", quantity: 1, amount: 2750, isBundleHeader: true }],
    },
    {
      month: 11, year: 2025, client: "סאפיינס", orderType: "BUNDLE",
      items: [{ serviceName: "שבוע בריאות", quantity: 1, amount: 8850, isBundleHeader: true }],
    },
    {
      month: 11, year: 2025, client: "איטורו", orderType: "BUNDLE",
      items: [{ serviceName: "שבוע בריאות", quantity: 1, amount: 4100, isBundleHeader: true }],
    },
    {
      month: 11, year: 2025, client: "KLA", orderType: "SINGLE",
      items: [{ serviceName: "רופאת עור", quantity: 2, amount: 18300 }],
    },
  ];

  for (const group of sales2025) {
    const clientRecord = await prisma.client.findFirst({
      where: { name: group.client },
    });

    const clientId = clientRecord?.id ?? (
      await prisma.client.create({
        data: {
          name: group.client,
          status: "ACTIVE",
          source: "COLD_OUTREACH",
          assignedToId: admin.id,
        },
      })
    ).id;

    const totalAmount = group.items.reduce((sum, i) => sum + i.amount, 0);
    const eventDate = new Date(group.year, group.month - 1, 15); // mid-month

    await prisma.order.create({
      data: {
        clientId,
        status: "COMPLETED",
        type: group.orderType,
        eventDate,
        totalAmount,
        items: {
          create: group.items.map((item) => ({
            description: item.serviceName,
            quantity: item.quantity,
            unitPrice: Math.round(item.amount / item.quantity),
            total: item.amount,
            serviceId: serviceMap.get(item.serviceName),
          })),
        },
        payments: {
          create: {
            amount: totalAmount,
            method: "TRANSFER",
            date: eventDate,
            status: "PAID",
          },
        },
      },
    });
    orderCount++;
  }

  console.log("Seed complete:", {
    users: [admin.email],
    categories: serviceCategories.length,
    services: serviceDefinitions.length,
    clients: clientCount,
    orders: orderCount,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
