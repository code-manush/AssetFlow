import { PrismaClient, UserRole, UserStatus, AssetStatus, DepartmentStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  
  const dept1 = await prisma.department.create({
    data: {
      name: 'Engineering',
      status: DepartmentStatus.ACTIVE,
      budget: 500000,
    }
  });

  const dept2 = await prisma.department.create({
    data: {
      name: 'Operations',
      status: DepartmentStatus.ACTIVE,
      budget: 300000,
    }
  });

  const admin = await prisma.user.create({
    data: {
      name: 'Alex Rivera',
      email: 'alex.rivera@assetflow.io',
      role: UserRole.ADMIN,
      departmentId: dept1.id,
      status: UserStatus.ACTIVE,
      joinedAt: new Date('2022-01-15T00:00:00Z')
    }
  });

  // Assign dept head now that user exists
  await prisma.department.update({
    where: { id: dept1.id },
    data: { headId: admin.id }
  });

  const employee = await prisma.user.create({
    data: {
      name: 'Sara Chen',
      email: 'sara.chen@assetflow.io',
      role: UserRole.EMPLOYEE,
      departmentId: dept1.id,
      status: UserStatus.ACTIVE,
      joinedAt: new Date('2023-02-20T00:00:00Z')
    }
  });

  const asset1 = await prisma.asset.create({
    data: {
      name: 'MacBook Pro 16"',
      tag: 'AF-LPT-001',
      category: 'laptop',
      status: AssetStatus.ALLOCATED,
      location: 'Engineering - Floor 3',
      departmentId: dept1.id,
      purchaseDate: new Date('2023-01-15T00:00:00Z'),
      purchasePrice: 2499,
      warrantyExpiry: new Date('2026-01-15T00:00:00Z'),
      serialNumber: 'SN-MBP-2023-001',
      assignedToId: employee.id,
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
