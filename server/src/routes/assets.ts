import { Router } from 'express';
import { prisma } from '../db';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();
router.use(authenticate);

// GET /api/assets
router.get('/', async (req, res) => {
  const assets = await prisma.asset.findMany({
    include: { assignedTo: { select: { id: true, name: true, email: true } }, department: { select: { id: true, name: true } } }
  });
  res.json(assets);
});

// GET /api/assets/:id
router.get('/:id', async (req, res) => {
  const asset = await prisma.asset.findUnique({
    where: { id: req.params.id },
    include: {
      assignedTo: { select: { id: true, name: true, email: true } },
      department: { select: { id: true, name: true } },
      allocations: { include: { user: { select: { id: true, name: true } } }, orderBy: { allocatedAt: 'desc' } },
      maintenanceRequests: { orderBy: { raisedAt: 'desc' } },
      bookings: { orderBy: { startTime: 'desc' } }
    }
  });
  if (!asset) { res.status(404).json({ error: 'Asset not found' }); return; }
  res.json(asset);
});

// POST /api/assets (ADMIN only)
router.post('/', requireRole('ADMIN'), async (req, res) => {
  try {
    const { id, department, assignedTo, allocations, transfers, maintenanceRequests, bookings, audits, ...data } = req.body;
    if (data.status) data.status = data.status.toUpperCase();
    if (data.purchaseDate) data.purchaseDate = new Date(data.purchaseDate);
    if (data.warrantyExpiry) {
      data.warrantyExpiry = new Date(data.warrantyExpiry);
    } else {
      delete data.warrantyExpiry;
    }
    
    const asset = await prisma.asset.create({ data });
    res.status(201).json(asset);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/assets/:id (ADMIN only)
router.put('/:id', requireRole('ADMIN'), async (req, res) => {
  try {
    const { id, department, assignedTo, allocations, transfers, maintenanceRequests, bookings, audits, ...data } = req.body;
    if (data.status) data.status = data.status.toUpperCase();
    if (data.purchaseDate) data.purchaseDate = new Date(data.purchaseDate);
    if (data.warrantyExpiry) {
      data.warrantyExpiry = new Date(data.warrantyExpiry);
    } else {
      delete data.warrantyExpiry;
    }

    const asset = await prisma.asset.update({ where: { id: String(req.params.id) }, data });
    res.json(asset);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/assets/:id (ADMIN only)
router.delete('/:id', requireRole('ADMIN'), async (req, res) => {
  try {
    await prisma.asset.delete({ where: { id: String(req.params.id) } });
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
