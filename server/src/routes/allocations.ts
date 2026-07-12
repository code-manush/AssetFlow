import { Router } from 'express';
import { prisma } from '../db';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();
router.use(authenticate);

// GET all allocations
router.get('/', async (req, res) => {
  const records = await prisma.allocationRecord.findMany({
    include: {
      asset: { select: { id: true, name: true, tag: true, category: true } },
      user: { select: { id: true, name: true, email: true } },
      department: { select: { id: true, name: true } }
    },
    orderBy: { allocatedAt: 'desc' }
  });
  res.json(records);
});

// POST allocate an asset (ADMIN, ASSET_MANAGER)
router.post('/', requireRole('ADMIN', 'ASSET_MANAGER'), async (req, res) => {
  const { assetId, userId, departmentId, expectedReturn, notes } = req.body;
  if (!assetId || !userId || !departmentId) {
    res.status(400).json({ error: 'assetId, userId, departmentId are required' });
    return;
  }
  try {
    const asset = await prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset || asset.status !== 'AVAILABLE') {
      res.status(409).json({ error: 'Asset is not available for allocation' });
      return;
    }

    const allocation = await prisma.allocationRecord.create({
      data: {
        assetId,
        userId,
        departmentId,
        condition: 'Good',
        notes: notes || '',
        status: 'ACTIVE',
        expectedReturn: expectedReturn ? new Date(expectedReturn) : null
      }
    });

    await prisma.asset.update({
      where: { id: assetId },
      data: { status: 'ALLOCATED', assignedToId: userId, departmentId }
    });

    res.status(201).json(allocation);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// POST return an asset
router.post('/:id/return', requireRole('ADMIN', 'ASSET_MANAGER'), async (req, res) => {
  const { condition, notes } = req.body;
  try {
    const record = await prisma.allocationRecord.findUnique({ where: { id: String(req.params.id) } });
    if (!record) { res.status(404).json({ error: 'Record not found' }); return; }

    const updated = await prisma.allocationRecord.update({
      where: { id: String(req.params.id) },
      data: { status: 'RETURNED', returnedAt: new Date(), condition: condition || record.condition, notes: notes || record.notes }
    });

    await prisma.asset.update({
      where: { id: record.assetId },
      data: { status: 'AVAILABLE', assignedToId: null }
    });

    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
