import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@assetflow.io';
  const adminPassword = await bcrypt.hash('admin123', 10);
  
  // Need a department for the user
  let dept = await prisma.department.findFirst();
  if (!dept) {
    dept = await prisma.department.create({
      data: { name: 'IT Department', status: 'ACTIVE', budget: 100000 }
    });
  }

  // Upsert the Admin User
  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: 'ADMIN'
    },
    create: {
      name: 'System Admin',
      email: adminEmail,
      role: 'ADMIN',
      status: 'ACTIVE',
      departmentId: dept.id
    }
  });

  // Upsert the UsersLogin record
  await prisma.usersLogin.upsert({
    where: { email: adminEmail },
    update: { password: adminPassword },
    create: {
      email: adminEmail,
      password: adminPassword,
      userId: adminUser.id
    }
  });

  console.log('Dummy Admin seeded successfully: admin@assetflow.io / admin123');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
