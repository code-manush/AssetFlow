import { Tool } from '../types';
import { prisma } from '../../db';

export const createAuditTool: Tool = {
  name: 'create_audit',
  description: 'Create a new audit cycle for a department or entire organization.',
  parameters: [
    { name: 'title', type: 'string', description: 'Title of the audit', required: true },
    { name: 'departmentId', type: 'string', description: 'Optional department ID to narrow scope', required: false }
  ],
  execute: async (args: any) => {
    return prisma.auditCycle.create({
      data: {
        title: args.title,
        departmentId: args.departmentId || null,
        status: 'OPEN'
      }
    });
  }
};

export const logDiscrepancyTool: Tool = {
  name: 'log_discrepancy',
  description: 'Log an asset discrepancy (MISSING or DAMAGED) in an active audit cycle.',
  parameters: [
    { name: 'auditCycleId', type: 'string', description: 'ID of the audit cycle', required: true },
    { name: 'assetId', type: 'string', description: 'ID of the asset', required: true },
    { name: 'status', type: 'string', description: 'MISSING or DAMAGED', required: true },
    { name: 'notes', type: 'string', description: 'Auditor notes', required: false }
  ],
  execute: async (args: any) => {
    if (!['MISSING', 'DAMAGED'].includes(args.status)) {
      throw new Error('Status must be MISSING or DAMAGED');
    }
    const item = await prisma.auditItem.create({
      data: {
        auditCycleId: args.auditCycleId,
        assetId: args.assetId,
        status: args.status,
        notes: args.notes
      }
    });
    
    // Auto-update asset status if missing
    if (args.status === 'MISSING') {
      await prisma.asset.update({ where: { id: args.assetId }, data: { status: 'LOST' } });
    }
    
    return item;
  }
};
