import { Tool } from '../types';
import { prisma } from '../../db';

export const getAssetUtilizationTool: Tool = {
  name: 'get_asset_utilization',
  description: 'Get counts of assets by status.',
  parameters: [],
  execute: async () => {
    const counts = await prisma.asset.groupBy({
      by: ['status'],
      _count: { id: true }
    });
    return counts;
  }
};

export const getOverdueAllocationsTool: Tool = {
  name: 'get_overdue_allocations',
  description: 'Get allocations that are past their expected return date.',
  parameters: [],
  execute: async () => {
    const overdue = await prisma.allocationRecord.findMany({
      where: {
        status: 'ACTIVE',
        expectedReturn: { lt: new Date() }
      },
      include: {
        asset: { select: { tag: true, name: true } },
        user: { select: { name: true, email: true } }
      }
    });
    return overdue;
  }
};
