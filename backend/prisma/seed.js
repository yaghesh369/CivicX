require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const departments = [
    { name: "Road Department", description: "Handles road & pothole issues" },
    { name: "Water Department", description: "Handles water supply & leakage" },
    { name: "Drainage Department", description: "Handles drainage issues" },
    { name: "Sanitation Department", description: "Handles garbage & illegal dumping" },
    { name: "Streetlight Department", description: "Handles streetlight issues" },
  ];

  for (const dept of departments) {
    const existing = await prisma.department.findFirst({ where: { name: dept.name } });
    if (!existing) await prisma.department.create({ data: dept });
  }

  const adminEmail = "admin@civicx.local";
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const hashed = await bcrypt.hash("Admin@12345", 10);
    await prisma.user.create({
      data: {
        name: "CivicX Admin",
        email: adminEmail,
        password: hashed,
        role: "ADMIN",
      },
    });
    console.log(`Seeded admin user: ${adminEmail} / Admin@12345`);
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
