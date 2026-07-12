import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  
  const dept1 = await prisma.department.create({
    data: {
      name: 'Engineering',
      head: 'u1',
      status: 'active',
      budget: 500000,
    }
  });

  const dept2 = await prisma.department.create({
    data: {
      name: 'Operations',
      head: 'u2',
      status: 'active',
      budget: 300000,
    }
  });

  const admin = await prisma.user.create({
    data: {
      name: 'Alex Rivera',
      email: 'alex.rivera@assetflow.io',
      role: 'admin',
      department: dept1.id,
      status: 'active',
      joinedAt: '2022-01-15'
    }
  });

  const employee = await prisma.user.create({
    data: {
      name: 'Sara Chen',
      email: 'sara.chen@assetflow.io',
      role: 'employee',
      department: dept1.id,
      status: 'active',
      joinedAt: '2023-02-20'
    }
  });

  const asset1 = await prisma.asset.create({
    data: {
      name: 'MacBook Pro 16"',
      tag: 'AF-LPT-001',
      category: 'laptop',
      status: 'allocated',
      location: 'Engineering - Floor 3',
      department: dept1.id,
      purchaseDate: '2023-01-15',
      purchasePrice: 2499,
      warrantyExpiry: '2026-01-15',
      serialNumber: 'SN-MBP-2023-001',
      assignedTo: employee.id,
      isBookable: false
    }
  });

  console.log('Database seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
