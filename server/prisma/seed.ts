import { prisma } from "../src/lib/prisma.js";
import { hashPassword } from "../src/services/password.service.js";

async function main(): Promise<void> {
  const email = (process.env.ADMIN_EMAIL ?? "admin@example.com").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "SecureAdminPass123!";

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    if (existing.role !== "ADMIN") {
      await prisma.user.update({
        where: { id: existing.id },
        data: { role: "ADMIN", emailVerified: true, isActive: true },
      });
      console.info(`Promoted existing user to admin: ${email}`);
    } else {
      console.info(`Admin user already exists: ${email}`);
    }
    return;
  }

  const passwordHash = await hashPassword(password);

  await prisma.user.create({
    data: {
      email,
      name: "Administrator",
      passwordHash,
      role: "ADMIN",
      emailVerified: true,
    },
  });

  console.info(`Admin user created: ${email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
