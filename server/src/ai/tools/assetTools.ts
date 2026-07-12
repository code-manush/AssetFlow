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

export const updateAssetTool: Tool = {
  name: 'update_asset',
  description: 'Update an existing asset (e.g. change price, add serial number, update notes, change location).',
  parameters: [
    { name: 'tag', type: 'string', description: 'Unique Asset Tag to identify the asset (e.g., AF-LPT-100)', required: true },
    { name: 'price', type: 'number', description: 'New purchase price', required: false },
    { name: 'serialNumber', type: 'string', description: 'New serial number', required: false },
    { name: 'location', type: 'string', description: 'New location', required: false },
    { name: 'status', type: 'string', description: 'New status', required: false },
    { name: 'notes', type: 'string', description: 'Notes about the asset', required: false }
  ],
  execute: async (args: any) => {
    const data: any = {};
    if (args.price !== undefined) data.purchasePrice = parseFloat(args.price);
    if (args.serialNumber !== undefined) data.serialNumber = args.serialNumber;
    if (args.location !== undefined) data.location = args.location;
    if (args.status !== undefined) data.status = args.status.toUpperCase();
    if (args.notes !== undefined) data.notes = args.notes;

    if (Object.keys(data).length === 0) {
      throw new Error('No fields provided to update.');
    }

    const asset = await prisma.asset.update({
      where: { tag: args.tag },
      data
    });
    return asset;
  }
};

export const deleteAssetTool: Tool = {
  name: 'delete_asset',
  description: 'Delete an asset completely from the database.',
  parameters: [
    { name: 'tag', type: 'string', description: 'Unique Asset Tag to identify the asset', required: true }
  ],
  execute: async (args: any) => {
    await prisma.asset.delete({ where: { tag: args.tag } });
    return { success: true, message: `Asset ${args.tag} deleted successfully.` };
  }
};
