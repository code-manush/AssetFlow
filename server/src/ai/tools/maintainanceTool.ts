import { Tool } from '../types';
import { prisma } from '../../db';

export const raiseMaintenanceTool: Tool = {
  name: 'raise_maintenance',
  description: 'Raise a maintenance request for an asset.',
  parameters: [
    { name: 'assetId', type: 'string', description: 'ID of the asset', required: true },
    { name: 'raisedById', type: 'string', description: 'ID of the user raising request', required: true },
    { name: 'priority', type: 'string', description: 'CRITICAL, HIGH, MEDIUM, LOW', required: true },
    { name: 'issue', type: 'string', description: 'Description of the issue', required: true }
  ],
  execute: async (args: any) => {
    const { assetId, raisedById, priority, issue } = args;

    const request = await prisma.maintenanceRequest.create({
      data: {
        assetId,
        raisedById,
        priority: priority as any,
        issue,
        status: 'PENDING'
      }
    });

    return request;
  }
};

export const getMaintenanceRequestsTool: Tool = {
  name: 'get_maintenance_requests',
  description: 'Get maintenance requests, optionally filtered by asset.',
  parameters: [
    { name: 'assetId', type: 'string', description: 'ID of the asset (optional)', required: false }
  ],
  execute: async (args: any) => {
    const where = args.assetId ? { assetId: args.assetId } : {};
    return prisma.maintenanceRequest.findMany({ where });
  }
};
