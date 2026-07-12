const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function addPasswords() {
  const password = await bcrypt.hash('admin123', 10);
  const managerPwd = await bcrypt.hash('manager123', 10);
  const empPwd = await bcrypt.hash('employee123', 10);

  // Fetch all users
  const users = await prisma.user.findMany({ select: { id: true, role: true } });
  
  for (const user of users) {
    let pwd = empPwd;
    if (user.role === 'ADMIN') pwd = password;
    else if (user.role === 'ASSET_MANAGER') pwd = managerPwd;
    
    await prisma.user.update({ where: { id: user.id }, data: { password: pwd } });
  }

  console.log(`Updated passwords for ${users.length} users.`);
  console.log('Credentials:');
  console.log('  ADMIN: alex.rivera@assetflow.io / admin123');
  console.log('  ASSET_MANAGER: priya.sharma@assetflow.io / manager123');
  console.log('  EMPLOYEE: sara.chen@assetflow.io / employee123');
}

addPasswords()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
