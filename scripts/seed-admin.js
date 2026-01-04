const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const email = 'admin@admin.com';
  const plainPassword = '123456';

  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) {
    console.log('Admin user already exists:', email);
    return;
  }

  const passwordHash = await bcrypt.hash(plainPassword, 10);

  await prisma.adminUser.create({
    data: {
      email,
      passwordHash,
      name: 'Platform Admin',
    },
  });

  console.log('Seeded admin user:', email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
