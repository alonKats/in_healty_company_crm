import { PrismaClient } from "../src/generated/prisma";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

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

  console.log("Seed complete:", {
    users: [admin.email, staff.email],
    categories: serviceCategories.length,
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
