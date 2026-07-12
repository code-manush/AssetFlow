import { prisma } from './db';
import bcrypt from 'bcryptjs';

async function addPasswords() {
  const password = await bcrypt.hash('admin123', 10);
  const managerPwd = await bcrypt.hash('manager123', 10);
  const empPwd = await bcrypt.hash('employee123', 10);

  const users = await prisma.user.findMany({ select: { id: true, role: true } });
  
  for (const user of users) {
    let pwd = empPwd;
    if (user.role === 'ADMIN') pwd = password;
    else if (user.role === 'ASSET_MANAGER') pwd = managerPwd;
    
    await prisma.user.update({ where: { id: user.id }, data: { password: pwd } });
  }

  console.log(`Updated passwords for ${users.length} users.`);
}

addPasswords()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
