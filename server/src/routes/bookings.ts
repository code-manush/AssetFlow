import { Router } from 'express';
import { prisma } from '../db';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  const list = await prisma.booking.findMany({
    include: {
      asset: { select: { id: true, name: true, tag: true, category: true } },
      user: { select: { id: true, name: true } },
      department: { select: { id: true, name: true } }
    },
    orderBy: { startTime: 'desc' }
  });
  res.json(list);
});

router.post('/', async (req, res) => {
  const { assetId, departmentId, startTime, endTime, purpose } = req.body;
  if (!assetId || !startTime || !endTime || !purpose) {
    res.status(400).json({ error: 'assetId, startTime, endTime, purpose are required' });
    return;
  }
  try {
    // Check for overlaps
    const overlapping = await prisma.booking.findFirst({
      where: {
        assetId,
        status: { in: ['UPCOMING', 'ONGOING'] },
        AND: [{ startTime: { lt: new Date(endTime) } }, { endTime: { gt: new Date(startTime) } }]
      }
    });
    if (overlapping) {
      res.status(409).json({ error: 'This asset is already booked during that time' });
      return;
    }
    const booking = await prisma.booking.create({
      data: {
        assetId, userId: req.user!.id,
        departmentId: departmentId || req.user!.id,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        purpose, status: 'UPCOMING'
      }
    });
    res.status(201).json(booking);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/:id/cancel', async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({ where: { id: String(req.params.id) } });
    if (!booking) { res.status(404).json({ error: 'Booking not found' }); return; }
    
    const canCancel = req.user!.id === booking.userId || ['ADMIN', 'ASSET_MANAGER'].includes(req.user!.role);
    if (!canCancel) { res.status(403).json({ error: 'You cannot cancel this booking' }); return; }

    const updated = await prisma.booking.update({ where: { id: String(req.params.id) }, data: { status: 'CANCELLED' } });
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
