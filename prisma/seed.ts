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

  console.log("Seed complete:", {
    users: [admin.email, staff.email],
    categories: serviceCategories.length,
    clients: clientCount,
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
