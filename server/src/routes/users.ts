import { Router } from 'express';
import { prisma } from '../db';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, status: true, departmentId: true, joinedAt: true },
    orderBy: { name: 'asc' }
  });
  res.json(users);
});

router.get('/departments', async (req, res) => {
  const departments = await prisma.department.findMany({
    include: { head: { select: { id: true, name: true } } },
    orderBy: { name: 'asc' }
  });
  res.json(departments);
});

export default router;
