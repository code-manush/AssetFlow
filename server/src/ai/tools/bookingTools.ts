import { Tool } from '../types';
import { prisma } from '../../db';

export const bookResourceTool: Tool = {
  name: 'book_resource',
  description: 'Book a shared resource. Fails if time slots overlap.',
  parameters: [
    { name: 'assetId', type: 'string', description: 'ID of the asset (must be bookable)', required: true },
    { name: 'userId', type: 'string', description: 'ID of the user', required: true },
    { name: 'departmentId', type: 'string', description: 'ID of the department', required: true },
    { name: 'startTime', type: 'string', description: 'ISO string of start time', required: true },
    { name: 'endTime', type: 'string', description: 'ISO string of end time', required: true },
    { name: 'purpose', type: 'string', description: 'Purpose of booking', required: true }
  ],
  execute: async (args: any) => {
    const { assetId, userId, departmentId, startTime, endTime, purpose } = args;
    
    const asset = await prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset || !asset.isBookable) {
      throw new Error('Asset is not bookable.');
    }

    const sTime = new Date(startTime);
    const eTime = new Date(endTime);

    // Overlap validation
    const overlaps = await prisma.booking.findFirst({
      where: {
        assetId,
        status: { in: ['UPCOMING', 'ONGOING'] },
        AND: [
          { startTime: { lt: eTime } },
          { endTime: { gt: sTime } }
        ]
      }
    });

    if (overlaps) {
      throw new Error('Time slot overlaps with an existing booking.');
    }

    const booking = await prisma.booking.create({
      data: {
        assetId,
        userId,
        departmentId,
        startTime: sTime,
        endTime: eTime,
        purpose,
        status: 'UPCOMING'
      }
    });

    return booking;
  }
};

export const getBookingsTool: Tool = {
  name: 'get_bookings',
  description: 'Get bookings for a specific asset.',
  parameters: [
    { name: 'assetId', type: 'string', description: 'ID of the asset', required: true }
  ],
  execute: async (args: any) => {
    return prisma.booking.findMany({
      where: { assetId: args.assetId },
      orderBy: { startTime: 'asc' }
    });
  }
};
