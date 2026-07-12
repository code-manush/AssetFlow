import { Tool } from '../types';
import { prisma } from '../../db';

export const getUsersTool: Tool = {
  name: 'get_users',
  description: 'Search users by name or email.',
  parameters: [
    { name: 'query', type: 'string', description: 'Name or email to search for', required: false }
  ],
  execute: async (args: any) => {
    const where = args.query ? {
      OR: [
        { name: { contains: args.query } },
        { email: { contains: args.query } }
      ]
    } : {};
    
    return prisma.user.findMany({
      where,
      select: { id: true, name: true, email: true, role: true, departmentId: true }
    });
  }
};

export const getDepartmentsTool: Tool = {
  name: 'get_departments',
  description: 'Get all departments.',
  parameters: [],
  execute: async () => {
    return prisma.department.findMany({
      select: { id: true, name: true, status: true }
    });
  }
};
