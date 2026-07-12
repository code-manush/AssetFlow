import { Router } from 'express';
import { prisma } from '../db';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  const list = await prisma.maintenanceRequest.findMany({
    include: {
      asset: { select: { id: true, name: true, tag: true } },
      raisedBy: { select: { id: true, name: true } },
      assignedTo: { select: { id: true, name: true } },
      approvedBy: { select: { id: true, name: true } }
    },
    orderBy: { raisedAt: 'desc' }
  });
  res.json(list);
});

// Any role can raise a maintenance request
router.post('/', async (req, res) => {
  const { assetId, priority, issue, notes } = req.body;
  try {
    const record = await prisma.maintenanceRequest.create({
      data: { assetId, raisedById: req.user!.id, priority, issue, notes: notes || '', status: 'PENDING' }
    });
    await prisma.asset.update({ where: { id: assetId }, data: { status: 'MAINTENANCE' } });
    res.status(201).json(record);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/:id/approve', requireRole('ADMIN', 'ASSET_MANAGER'), async (req, res) => {
  try {
    const updated = await prisma.maintenanceRequest.update({
      where: { id: String(req.params.id) },
      data: { status: 'APPROVED', approvedById: req.user!.id, approvedAt: new Date() }
    });
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/:id/reject', requireRole('ADMIN', 'ASSET_MANAGER'), async (req, res) => {
  try {
    const mr = await prisma.maintenanceRequest.findUnique({ where: { id: String(req.params.id) } });
    const updated = await prisma.maintenanceRequest.update({
      where: { id: String(req.params.id) },
      data: { status: 'REJECTED', approvedById: req.user!.id, approvedAt: new Date() }
    });
    // revert asset status to AVAILABLE if no other active maintenance
    if (mr) {
      const others = await prisma.maintenanceRequest.count({
        where: { assetId: mr.assetId, status: { in: ['PENDING', 'APPROVED', 'IN_PROGRESS'] }, id: { not: String(req.params.id) } }
      });
      if (others === 0) {
        await prisma.asset.update({ where: { id: mr.assetId }, data: { status: mr.assignedToId ? 'ALLOCATED' : 'AVAILABLE' } });
      }
    }
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/:id/assign', requireRole('ADMIN', 'ASSET_MANAGER'), async (req, res) => {
  const { assignedToId } = req.body;
  try {
    const updated = await prisma.maintenanceRequest.update({
      where: { id: String(req.params.id) },
      data: { assignedToId, status: 'IN_PROGRESS' }
    });
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/:id/resolve', requireRole('ADMIN', 'ASSET_MANAGER'), async (req, res) => {
  const { notes } = req.body;
  try {
    const mr = await prisma.maintenanceRequest.findUnique({ where: { id: String(req.params.id) } });
    const updated = await prisma.maintenanceRequest.update({
      where: { id: String(req.params.id) },
      data: { status: 'RESOLVED', resolvedAt: new Date(), notes: notes || undefined }
    });
    if (mr) {
      const others = await prisma.maintenanceRequest.count({
        where: { assetId: mr.assetId, status: { in: ['PENDING', 'APPROVED', 'IN_PROGRESS'] }, id: { not: String(req.params.id) } }
      });
      if (others === 0) {
        const allocation = await prisma.allocationRecord.findFirst({ where: { assetId: mr.assetId, status: 'ACTIVE' } });
        await prisma.asset.update({ where: { id: mr.assetId }, data: { status: allocation ? 'ALLOCATED' : 'AVAILABLE' } });
      }
    }
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
