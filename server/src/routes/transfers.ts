import { Router } from 'express';
import { prisma } from '../db';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  const list = await prisma.transferRequest.findMany({
    include: {
      asset: { select: { id: true, name: true, tag: true } },
      fromUser: { select: { id: true, name: true } },
      toUser: { select: { id: true, name: true } },
      requestedBy: { select: { id: true, name: true } },
      approvedBy: { select: { id: true, name: true } }
    },
    orderBy: { requestedAt: 'desc' }
  });
  res.json(list);
});

router.post('/', async (req, res) => {
  const { assetId, toUserId, notes } = req.body;
  const requestedById = req.user!.id;
  try {
    const allocation = await prisma.allocationRecord.findFirst({
      where: { assetId, status: { in: ['ACTIVE', 'OVERDUE'] } }
    });
    if (!allocation) {
      res.status(409).json({ error: 'No active allocation found for this asset' });
      return;
    }
    const transfer = await prisma.transferRequest.create({
      data: { assetId, fromUserId: allocation.userId, toUserId, requestedById, notes, status: 'PENDING' }
    });
    await prisma.allocationRecord.update({ where: { id: allocation.id }, data: { status: 'TRANSFER_REQUESTED' } });
    res.status(201).json(transfer);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/:id/approve', requireRole('ADMIN', 'ASSET_MANAGER'), async (req, res) => {
  try {
    const transfer = await prisma.transferRequest.findUnique({ where: { id: String(req.params.id) } });
    if (!transfer || transfer.status !== 'PENDING') {
      res.status(409).json({ error: 'Transfer not pending' }); return;
    }
    const updated = await prisma.transferRequest.update({
      where: { id: String(req.params.id) },
      data: { status: 'APPROVED', approvedById: req.user!.id, approvedAt: new Date() }
    });
    // Update the allocation to new user
    await prisma.allocationRecord.updateMany({
      where: { assetId: transfer.assetId, status: 'TRANSFER_REQUESTED' },
      data: { userId: transfer.toUserId, status: 'ACTIVE' }
    });
    await prisma.asset.update({ where: { id: transfer.assetId }, data: { assignedToId: transfer.toUserId } });
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/:id/reject', requireRole('ADMIN', 'ASSET_MANAGER'), async (req, res) => {
  try {
    const transfer = await prisma.transferRequest.findUnique({ where: { id: String(req.params.id) } });
    if (!transfer || transfer.status !== 'PENDING') {
      res.status(409).json({ error: 'Transfer not pending' }); return;
    }
    await prisma.transferRequest.update({
      where: { id: String(req.params.id) },
      data: { status: 'REJECTED', approvedById: req.user!.id, approvedAt: new Date() }
    });
    await prisma.allocationRecord.updateMany({
      where: { assetId: transfer.assetId, status: 'TRANSFER_REQUESTED' },
      data: { status: 'ACTIVE' }
    });
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
