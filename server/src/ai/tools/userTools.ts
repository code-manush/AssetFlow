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

export const updateUserTool: Tool = {
  name: 'update_user',
  description: 'Update user details like role, department, or status.',
  parameters: [
    { name: 'email', type: 'string', description: 'Email of the user to update', required: true },
    { name: 'role', type: 'string', description: 'New role (ADMIN, EMPLOYEE)', required: false },
    { name: 'departmentId', type: 'string', description: 'New department ID', required: false },
    { name: 'status', type: 'string', description: 'New status (ACTIVE, INACTIVE)', required: false }
  ],
  execute: async (args: any) => {
    const data: any = {};
    if (args.role) data.role = args.role.toUpperCase();
    if (args.departmentId) data.departmentId = args.departmentId;
    if (args.status) data.status = args.status.toUpperCase();
    
    return prisma.user.update({
      where: { email: args.email },
      data
    });
  }
};

export const createDepartmentTool: Tool = {
  name: 'create_department',
  description: 'Create a new department in the database.',
  parameters: [
    { name: 'name', type: 'string', description: 'Department Name', required: true },
    { name: 'budget', type: 'number', description: 'Department Budget', required: true }
  ],
  execute: async (args: any) => {
    return prisma.department.create({
      data: {
        name: args.name,
        budget: parseFloat(args.budget),
        status: 'ACTIVE'
      }
    });
  }
};
