import { prisma } from "../src/db.js";
import { hashPassword } from "../src/auth.js";

async function main() {
  const adminUsername = process.env.SEED_ADMIN_USERNAME ?? "admin";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!";

  const existing = await prisma.user.findFirst({ where: { username: adminUsername } });
  if (!existing) {
    await prisma.user.create({
      data: {
        name: "System Admin",
        username: adminUsername,
        password: await hashPassword(adminPassword),
        language: "ar",
        role: "Administrator",
        active: true
      }
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
