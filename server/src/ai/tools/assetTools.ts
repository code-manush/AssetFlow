import { Tool } from '../types';
import { prisma } from '../../db';

export const getAssetsTool: Tool = {
  name: 'get_assets',
  description: 'Search for assets by status, category, or tag.',
  parameters: [
    { name: 'status', type: 'string', description: 'AssetStatus (AVAILABLE, ALLOCATED, MAINTENANCE, RETIRED)', required: false },
    { name: 'category', type: 'string', description: 'Category of the asset', required: false },
    { name: 'tag', type: 'string', description: 'Asset tag', required: false }
  ],
  execute: async (args: any) => {
    const where: any = {};
    if (args.status) where.status = args.status;
    if (args.category) where.category = args.category;
    if (args.tag) where.tag = args.tag;

    const assets = await prisma.asset.findMany({
      where,
      select: { id: true, name: true, tag: true, category: true, status: true, isBookable: true }
    });
    return assets;
  }
};

export const registerAssetTool: Tool = {
  name: 'register_asset',
  description: 'Register a brand new asset in the system.',
  parameters: [
    { name: 'name', type: 'string', description: 'Name of the asset', required: true },
    { name: 'tag', type: 'string', description: 'Unique Asset Tag (e.g., AF-1234)', required: true },
    { name: 'category', type: 'string', description: 'Asset category (e.g. Electronics, Furniture)', required: true },
    { name: 'location', type: 'string', description: 'Physical location of the asset', required: true },
    { name: 'purchaseDate', type: 'string', description: 'ISO string of purchase date', required: true },
    { name: 'purchasePrice', type: 'number', description: 'Cost of the asset', required: true },
    { name: 'isBookable', type: 'boolean', description: 'Can this asset be booked by time-slots?', required: false }
  ],
  execute: async (args: any) => {
    return prisma.asset.create({
      data: {
        name: args.name,
        tag: args.tag,
        category: args.category,
        location: args.location,
        purchaseDate: new Date(args.purchaseDate),
        purchasePrice: parseFloat(args.purchasePrice),
        isBookable: args.isBookable || false,
        status: 'AVAILABLE'
      }
    });
  }
};

export const allocateAssetTool: Tool = {
  name: 'allocate_asset',
  description: 'Allocate an available asset to a user or department.',
  parameters: [
    { name: 'assetId', type: 'string', description: 'ID of the asset to allocate', required: true },
    { name: 'userId', type: 'string', description: 'ID of the user', required: true },
    { name: 'departmentId', type: 'string', description: 'ID of the department', required: true }
  ],
  execute: async (args: any) => {
    const { assetId, userId, departmentId } = args;
    
    const asset = await prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset || asset.status !== 'AVAILABLE') {
      throw new Error('Asset is not available for allocation.');
    }

    const allocation = await prisma.allocationRecord.create({
      data: {
        assetId,
        userId,
        departmentId,
        condition: 'Good',
        status: 'ACTIVE'
      }
    });

    await prisma.asset.update({
      where: { id: assetId },
      data: { status: 'ALLOCATED', assignedToId: userId }
    });

    return allocation;
  }
};
