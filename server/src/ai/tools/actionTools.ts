import { Tool } from '../types';
import { prisma } from '../../db';

export const returnAssetTool: Tool = {
  name: 'return_asset',
  description: 'Return an allocated asset. Finds the active allocation by asset tag or ID and marks it returned.',
  parameters: [
    { name: 'assetId', type: 'string', description: 'ID of the asset to return', required: true },
    { name: 'condition', type: 'string', description: 'Condition of the asset on return (excellent/good/fair/poor)', required: false }
  ],
  execute: async (args: any) => {
    const asset = await prisma.asset.findFirst({ where: { OR: [{ id: args.assetId }, { tag: args.assetId }] } });
    if (!asset) throw new Error('Asset not found');

    const allocation = await prisma.allocationRecord.findFirst({
      where: { assetId: asset.id, status: { in: ['ACTIVE', 'OVERDUE'] } }
    });
    if (!allocation) throw new Error('No active allocation found for this asset');

    await prisma.allocationRecord.update({
      where: { id: allocation.id },
      data: { status: 'RETURNED', returnedAt: new Date(), condition: args.condition || 'Good' }
    });
    await prisma.asset.update({ where: { id: asset.id }, data: { status: 'AVAILABLE', assignedToId: null } });
    return { success: true, message: `Asset ${asset.name} returned successfully` };
  }
};

export const approveTransferTool: Tool = {
  name: 'approve_transfer',
  description: 'Approve a pending asset transfer request by ID.',
  parameters: [
    { name: 'transferId', type: 'string', description: 'ID of the transfer request', required: true }
  ],
  execute: async (args: any) => {
    const transfer = await prisma.transferRequest.findUnique({ where: { id: args.transferId } });
    if (!transfer || transfer.status !== 'PENDING') throw new Error('Transfer not found or not pending');

    await prisma.transferRequest.update({ where: { id: args.transferId }, data: { status: 'APPROVED', approvedAt: new Date() } });
    await prisma.allocationRecord.updateMany({
      where: { assetId: transfer.assetId, status: 'TRANSFER_REQUESTED' },
      data: { userId: transfer.toUserId, status: 'ACTIVE' }
    });
    await prisma.asset.update({ where: { id: transfer.assetId }, data: { assignedToId: transfer.toUserId } });
    return { success: true, message: 'Transfer approved successfully' };
  }
};

export const approveMaintenanceTool: Tool = {
  name: 'approve_maintenance',
  description: 'Approve a pending maintenance request.',
  parameters: [{ name: 'maintenanceId', type: 'string', description: 'ID of the maintenance request', required: true }],
  execute: async (args: any) => {
    const updated = await prisma.maintenanceRequest.update({
      where: { id: args.maintenanceId },
      data: { status: 'APPROVED', approvedAt: new Date() }
    });
    return { success: true, status: updated.status };
  }
};

export const resolveMaintenanceTool: Tool = {
  name: 'resolve_maintenance',
  description: 'Mark a maintenance request as resolved.',
  parameters: [
    { name: 'maintenanceId', type: 'string', description: 'ID of the maintenance request', required: true },
    { name: 'notes', type: 'string', description: 'Resolution notes', required: false }
  ],
  execute: async (args: any) => {
    const mr = await prisma.maintenanceRequest.findUnique({ where: { id: args.maintenanceId } });
    if (!mr) throw new Error('Maintenance request not found');

    await prisma.maintenanceRequest.update({
      where: { id: args.maintenanceId },
      data: { status: 'RESOLVED', resolvedAt: new Date(), notes: args.notes || undefined }
    });
    const others = await prisma.maintenanceRequest.count({
      where: { assetId: mr.assetId, status: { in: ['PENDING', 'APPROVED', 'IN_PROGRESS'] }, id: { not: args.maintenanceId } }
    });
    if (others === 0) {
      const allocation = await prisma.allocationRecord.findFirst({ where: { assetId: mr.assetId, status: 'ACTIVE' } });
      await prisma.asset.update({ where: { id: mr.assetId }, data: { status: allocation ? 'ALLOCATED' : 'AVAILABLE' } });
    }
    return { success: true, message: 'Maintenance resolved' };
  }
};

export const createBookingTool: Tool = {
  name: 'create_booking',
  description: 'Book a bookable resource (meeting room, vehicle, projector) for a time slot.',
  parameters: [
    { name: 'assetTag', type: 'string', description: 'Tag of the asset to book', required: true },
    { name: 'userId', type: 'string', description: 'User ID booking the resource', required: true },
    { name: 'startTime', type: 'string', description: 'ISO start datetime', required: true },
    { name: 'endTime', type: 'string', description: 'ISO end datetime', required: true },
    { name: 'purpose', type: 'string', description: 'Purpose of the booking', required: true }
  ],
  execute: async (args: any) => {
    const asset = await prisma.asset.findFirst({ where: { OR: [{ tag: args.assetTag }, { id: args.assetTag }], isBookable: true } });
    if (!asset) throw new Error('Bookable asset not found with that tag');

    const overlap = await prisma.booking.findFirst({
      where: {
        assetId: asset.id, status: { in: ['UPCOMING', 'ONGOING'] },
        AND: [{ startTime: { lt: new Date(args.endTime) } }, { endTime: { gt: new Date(args.startTime) } }]
      }
    });
    if (overlap) throw new Error('Asset already booked during that time');

    const user = await prisma.user.findUnique({ where: { id: args.userId } });
    if (!user) throw new Error('User not found');

    const booking = await prisma.booking.create({
      data: {
        assetId: asset.id, userId: args.userId, departmentId: user.departmentId,
        startTime: new Date(args.startTime), endTime: new Date(args.endTime),
        purpose: args.purpose, status: 'UPCOMING'
      }
    });
    return { success: true, bookingId: booking.id, message: `Booking created for ${asset.name}` };
  }
};
