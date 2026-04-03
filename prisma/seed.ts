import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { hash } from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
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
  const staff = await prisma.user.upsert({
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
    { id: "cat-inhouse", name: "מוצרי בית", sortOrder: 1 },
    { id: "cat-external", name: "ספקים חיצוניים", sortOrder: 2 },
    { id: "cat-stands", name: "עמדות בריאות", sortOrder: 3 },
    { id: "cat-lectures", name: "הרצאות מומחים", sortOrder: 4 },
    { id: "cat-workshops-health", name: "סדנאות בריאות", sortOrder: 5 },
    { id: "cat-workshops-nutrition", name: "סדנאות תזונה", sortOrder: 6 },
    { id: "cat-workshops-cooking", name: "סדנאות בישול", sortOrder: 7 },
    { id: "cat-workshops-bodymind", name: "סדנאות גוף נפש", sortOrder: 8 },
    { id: "cat-movement", name: "תנועה וחיזוק", sortOrder: 9 },
    { id: "cat-medical", name: "בדיקות רופאים ומדדים", sortOrder: 10 },
    { id: "cat-challenges", name: "אתגרי בריאות", sortOrder: 11 },
  ];

  for (const cat of serviceCategories) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: {},
      create: cat,
    });
  }

  // =============================================
  // SERVICES — real catalog from Dexel health week quote
  // =============================================

  const serviceDefinitions = [
    // עמדות בריאות (Health Stands)
    { name: "עמדת משקאות חורף ומתוקים טבעיים", categoryId: "cat-stands", basePrice: 13900, description: "עד 500 עובדים" },
    { name: "עמדת סמודי בולס", categoryId: "cat-stands", basePrice: 12950, description: "כולל התכולה העשירה, ניוד מבני בר וצוות מיומן" },
    { name: "עמדת אסאי", categoryId: "cat-stands", basePrice: 11500, description: "עד 300 עובדים" },
    { name: "עמדת שייקים", categoryId: "cat-stands", basePrice: 9800, description: "עד 300 עובדים" },
    { name: "עמדת סלטים", categoryId: "cat-stands", basePrice: 8500, description: "עד 200 עובדים" },
    { name: "עמדת מרקים", categoryId: "cat-stands", basePrice: 8300, description: "עד 200 עובדים" },
    // הרצאות מומחים (Expert Lectures)
    { name: "הרצאה 'האנשים הבריאים בעולם' / אופיר פוגל", categoryId: "cat-lectures", basePrice: 3550, description: "משך ההרצאה: שעה" },
    { name: "הרצאה בריאות האישה בגיל המעבר", categoryId: "cat-lectures", basePrice: 3200, description: "משך ההרצאה: שעה" },
    { name: "הרצאה לחודש המודעות לסרטן הערמונית", categoryId: "cat-lectures", basePrice: 6500, description: "ד\"ר דן קרת, משך שעה" },
    { name: "הרצאת תזונה מודעת", categoryId: "cat-lectures", basePrice: 3000, description: "משך ההרצאה: שעה" },
    { name: "הרצאה למניעת סרטן", categoryId: "cat-lectures", basePrice: 4800, description: "משך ההרצאה: שעה" },
    { name: "הרצאת קיימות ומזון", categoryId: "cat-lectures", basePrice: 3500, description: "משך ההרצאה: שעה" },
    // סדנאות בריאות (Health Workshops)
    { name: "סדנת Free(z) your mind – נשימות וחשיפה לקור", categoryId: "cat-workshops-health", basePrice: 4800, description: "משך שעה, עד 35 משתתפים. סבב נוסף ב-2000 ₪" },
    { name: "סדנת רוקחות טבעית", categoryId: "cat-workshops-health", basePrice: 3800, description: "משך שעה ורבע, עד 40 משתתפים" },
    // סדנאות תזונה (Nutrition Workshops)
    { name: "סדנת תזונה", categoryId: "cat-workshops-nutrition", basePrice: 3200, description: "משך שעה, עד 40 משתתפים" },
    { name: "סדנת חטיפי אנרגיה", categoryId: "cat-workshops-nutrition", basePrice: 3500, description: "משך שעה, עד 35 משתתפים" },
    // סדנאות בישול (Cooking Workshops)
    { name: "סדנת בישול בריא", categoryId: "cat-workshops-cooking", basePrice: 4200, description: "משך שעה וחצי, עד 30 משתתפים" },
    { name: "סדנת שייקים וצמחי מרפא", categoryId: "cat-workshops-cooking", basePrice: 3800, description: "משך שעה, עד 35 משתתפים" },
    // סדנאות גוף נפש (Body & Mind)
    { name: "סדנת יוגה בליווי צלילים חיים", categoryId: "cat-workshops-bodymind", basePrice: 3400, description: "משך שעה ורבע, עד 35 משתתפים" },
    { name: "סדנת מדיטציה", categoryId: "cat-workshops-bodymind", basePrice: 2800, description: "משך שעה, עד 40 משתתפים" },
    // תנועה וחיזוק (Movement)
    { name: "שיעור פילאטיס", categoryId: "cat-movement", basePrice: 950, description: "כולל נסיעות והבאת מזרנים" },
    { name: "שיעור יוגה", categoryId: "cat-movement", basePrice: 950, description: "כולל נסיעות והבאת מזרנים" },
    // בדיקות רופאים ומדדים (Medical)
    { name: "בדיקת מדדים ויעוץ תזונתי – 5 יועצות", categoryId: "cat-medical", basePrice: 10500, description: "5 יועצות תזונה, 7 שעות, 100 ייעוצים" },
    { name: "בדיקות כירורגית שד – יומיים", categoryId: "cat-medical", basePrice: 18500, description: "יומיים, 7 שעות מדי יום, 46 בדיקות מדי יום" },
    { name: "בדיקות רופאת עור – יומיים", categoryId: "cat-medical", basePrice: 21000, description: "יומיים בדיקות" },
    // אתגרי בריאות (Health Challenges)
    { name: "אתגר אוכלים בריא", categoryId: "cat-challenges", basePrice: 5000, description: "תכנית ארגונית, חודש" },
  ];

  const serviceMap = new Map<string, string>(); // name -> id
  for (const svc of serviceDefinitions) {
    const existing = await prisma.service.findFirst({ where: { name: svc.name } });
    if (existing) {
      serviceMap.set(svc.name, existing.id);
      continue;
    }
    const created = await prisma.service.create({
      data: {
        name: svc.name,
        categoryId: svc.categoryId,
        basePrice: svc.basePrice,
        description: svc.description,
        sourceType: "IN_HOUSE",
        status: "ACTIVE",
      },
    });
    serviceMap.set(svc.name, created.id);
  }

  // =============================================
  // CLIENT DATA — imported from Oren's Excel sheets
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
    { name: "Essence", status: "ACTIVE", source: "COLD_OUTREACH" },
    { name: "General Motors", status: "ACTIVE", source: "LINKEDIN", contact_name: "Dana Izhari" },
    { name: "HP", status: "ACTIVE", source: "COLD_OUTREACH" },
    { name: "HPE", status: "ACTIVE", source: "COLD_OUTREACH" },
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
    { name: "אדרניסט עו\"ד", status: "ACTIVE", source: "COLD_OUTREACH" },
    { name: "איטורו", status: "ACTIVE", source: "COLD_OUTREACH" },
    { name: "אייטק מערכות", status: "ACTIVE", source: "COLD_OUTREACH" },
    { name: "איליון", status: "ACTIVE", source: "COLD_OUTREACH" },
    { name: "אינבידיה (מלנוקס)", status: "ACTIVE", source: "COLD_OUTREACH", contact_name: "תמרה", contact_phone: "054-7758758" },
    { name: "אינטואיט", status: "ACTIVE", source: "COLD_OUTREACH" },
    { name: "איקאה", status: "ACTIVE", source: "COLD_OUTREACH" },
    { name: "אלביט נתניה", status: "ACTIVE", source: "COLD_OUTREACH", contact_name: "חן בלום", contact_phone: "054-9996401" },
    { name: "אלביט רחובות", status: "DORMANT", source: "COLD_OUTREACH" },
    { name: "אלוט תקשורת", status: "ACTIVE", source: "COLD_OUTREACH" },
    { name: "אמזון", status: "DORMANT", source: "COLD_OUTREACH" },
    { name: "אמי טכנולוגיות", status: "ACTIVE", source: "COLD_OUTREACH" },
    { name: "באייר", status: "DORMANT", source: "COLD_OUTREACH" },
    { name: "בנק הפועלים", status: "DORMANT", source: "COLD_OUTREACH" },
    { name: "ברייט משינס", status: "DORMANT", source: "COLD_OUTREACH" },
    { name: "ג'וינט", status: "ACTIVE", source: "COLD_OUTREACH" },
    { name: "גונג", status: "DORMANT", source: "COLD_OUTREACH" },
    { name: "דאטהריילס", status: "ACTIVE", source: "COLD_OUTREACH" },
    { name: "דל", status: "ACTIVE", source: "COLD_OUTREACH" },
    { name: "דקסל", status: "ACTIVE", source: "COLD_OUTREACH" },
    { name: "דרך ארץ", status: "ACTIVE", source: "COLD_OUTREACH", contact_name: "זוהר דרור", contact_phone: "050-8328371" },
    { name: "הייבוב", status: "ACTIVE", source: "COLD_OUTREACH" },
    { name: "הפניקס", status: "ACTIVE", source: "COLD_OUTREACH" },
    { name: "הרמן", status: "ACTIVE", source: "COLD_OUTREACH" },
    { name: "ווסט פארמה", status: "ACTIVE", source: "COLD_OUTREACH" },
    { name: "טאואר", status: "ACTIVE", source: "COLD_OUTREACH" },
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
    { name: "סימנס", status: "ACTIVE", source: "COLD_OUTREACH" },
    { name: "סלברייט", status: "DORMANT", source: "COLD_OUTREACH" },
    { name: "סמסונג", status: "ACTIVE", source: "COLD_OUTREACH" },
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
    { name: "קלאודינרי", status: "ACTIVE", source: "COLD_OUTREACH" },
    { name: "רדוור", status: "DORMANT", source: "COLD_OUTREACH" },
    { name: "רזונטיקס", status: "ACTIVE", source: "COLD_OUTREACH" },
    { name: "שיכון ובינוי", status: "ACTIVE", source: "COLD_OUTREACH", contact_name: "מורן ואיילת" },
    { name: "שפיר", status: "ACTIVE", source: "COLD_OUTREACH", contact_name: "מיכל" },
    { name: "תופין", status: "DORMANT", source: "COLD_OUTREACH" },
  ];

  let clientCount = 0;
  for (const c of clients) {
    const existing = await prisma.client.findFirst({ where: { name: c.name } });
    if (existing) continue;

    await prisma.client.create({
      data: {
        name: c.name,
        status: c.status,
        source: c.source,
        assignedToId: admin.id, // default to Oren
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
  // 2026 INCOME DATA — from Oren's revenue CSV
  // =============================================

  const existingOrders = await prisma.order.count();
  let orderCount = 0;

  if (existingOrders === 0) {
    const sales2026: Array<{
      month: number;
      year: number;
      client: string;
      description: string;
      quantity: number;
      amount: number;
    }> = [
      // January 2026
      { month: 1, year: 2026, client: "סימנס", description: "כירורגית שד", quantity: 1, amount: 8450 },
      { month: 1, year: 2026, client: "קלאודינרי", description: "חודש בריאות", quantity: 1, amount: 24350 },
      { month: 1, year: 2026, client: "קלאודינרי", description: "בדיקות מדדים", quantity: 1, amount: 9650 },
      { month: 1, year: 2026, client: "קלאודינרי", description: "עמדת משקאות חורף", quantity: 1, amount: 7000 },
      { month: 1, year: 2026, client: "קלאודינרי", description: "סדנת חטיפים", quantity: 1, amount: 7700 },
      // February 2026
      { month: 2, year: 2026, client: "דאטהריילס", description: "עמדת סמודי בולס וחטיפי אנרגיה", quantity: 1, amount: 7000 },
      { month: 2, year: 2026, client: "HP", description: "הרצאה למניעת סרטן", quantity: 1, amount: 4800 },
      { month: 2, year: 2026, client: "זירו נטוורקס", description: "סדנת רוקחות טבעית", quantity: 1, amount: 5650 },
      { month: 2, year: 2026, client: "זירו נטוורקס", description: "עמדת משקאות חורף", quantity: 1, amount: 4250 },
      { month: 2, year: 2026, client: "גונג", description: "סדנת שייקים", quantity: 1, amount: 4200 },
      { month: 2, year: 2026, client: "גונג", description: "סדנת צמחי מרפא", quantity: 2, amount: 7700 },
      { month: 2, year: 2026, client: "HPE", description: "עמדת מרקים", quantity: 1, amount: 8300 },
      { month: 2, year: 2026, client: "נובו נורדיסק", description: "סדנת שייקים", quantity: 1, amount: 3650 },
      // March 2026
      { month: 3, year: 2026, client: "איקאה", description: "סדנאות רוקחות", quantity: 5, amount: 28400 },
      { month: 3, year: 2026, client: "סימנס", description: "שבוע בריאות", quantity: 1, amount: 44350 },
      { month: 3, year: 2026, client: "סימנס", description: "עמדות בריאות", quantity: 3, amount: 8550 },
      { month: 3, year: 2026, client: "סימנס", description: "הרצאות", quantity: 3, amount: 2500 },
      { month: 3, year: 2026, client: "סימנס", description: "סדנאות בריאות", quantity: 3, amount: 2500 },
      { month: 3, year: 2026, client: "סימנס", description: "בדיקות", quantity: 10, amount: 19900 },
      { month: 3, year: 2026, client: "סימנס", description: "יוגה", quantity: 2, amount: 2200 },
      { month: 3, year: 2026, client: "סימנס", description: "עמדת סלטים", quantity: 2, amount: 3200 },
      { month: 3, year: 2026, client: "סימנס", description: "סדנאות בישול", quantity: 3, amount: 5500 },
      { month: 3, year: 2026, client: "טכניון", description: "עמדת סלטים ושייקים", quantity: 1, amount: 9700 },
      { month: 3, year: 2026, client: "הייבוב", description: "עמדת משקאות חורף", quantity: 1, amount: 6950 },
      { month: 3, year: 2026, client: "הייבוב", description: "הרצאה צמבוז", quantity: 1, amount: 10700 },
      { month: 3, year: 2026, client: "סודה סטרים", description: "עמדת משקאות חורף לכנס מנהלים", quantity: 1, amount: 11650 },
      { month: 3, year: 2026, client: "סטורנקסט", description: "עמדת שייקים וכריכים", quantity: 1, amount: 7750 },
      { month: 3, year: 2026, client: "אדרניסט עו\"ד", description: "הרצאת קיימות", quantity: 1, amount: 5050 },
    ];

    // Group sales by client+month into orders
    const orderGroups = new Map<string, typeof sales2026>();
    for (const sale of sales2026) {
      const key = `${sale.client}-${sale.month}-${sale.year}`;
      if (!orderGroups.has(key)) orderGroups.set(key, []);
      orderGroups.get(key)!.push(sale);
    }

    for (const [, items] of orderGroups) {
      const first = items[0];
      const clientRecord = await prisma.client.findFirst({
        where: { name: first.client },
      });

      // Create client if doesn't exist (e.g., טכניון, נובו נורדיסק)
      const clientId = clientRecord?.id ?? (
        await prisma.client.create({
          data: {
            name: first.client,
            status: "ACTIVE",
            source: "COLD_OUTREACH",
            assignedToId: admin.id,
          },
        })
      ).id;

      const totalAmount = items.reduce((sum, i) => sum + i.amount, 0);
      const eventDate = new Date(first.year, first.month - 1, 15); // mid-month

      // Map order item descriptions to real service IDs where possible
      const descriptionToServiceName: Record<string, string> = {
        "כירורגית שד": "בדיקות כירורגית שד – יומיים",
        "בדיקות מדדים": "בדיקת מדדים ויעוץ תזונתי – 5 יועצות",
        "עמדת משקאות חורף": "עמדת משקאות חורף ומתוקים טבעיים",
        "סדנת חטיפים": "סדנת חטיפי אנרגיה",
        "עמדת סמודי בולס": "עמדת סמודי בולס",
        "הרצאה למניעת סרטן": "הרצאה למניעת סרטן",
        "סדנת רוקחות טבעית": "סדנת רוקחות טבעית",
        "עמדת מרקים": "עמדת מרקים",
        "סדנת שייקים": "סדנת שייקים וצמחי מרפא",
        "עמדת סלטים": "עמדת סלטים",
        "הרצאת קיימות": "הרצאת קיימות ומזון",
        "יוגה": "שיעור יוגה",
      };

      function resolveServiceId(description: string): string | undefined {
        for (const [keyword, serviceName] of Object.entries(descriptionToServiceName)) {
          if (description.includes(keyword)) {
            return serviceMap.get(serviceName);
          }
        }
        return undefined;
      }

      const order = await prisma.order.create({
        data: {
          clientId,
          status: "COMPLETED",
          type: items.length > 1 ? "BUNDLE" : "SINGLE",
          eventDate,
          totalAmount,
          items: {
            create: items.map((item) => ({
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.amount / item.quantity,
              total: item.amount,
              serviceId: resolveServiceId(item.description),
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
  }

  console.log("Seed complete:", {
    users: [admin.email, staff.email],
    categories: serviceCategories.length,
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
