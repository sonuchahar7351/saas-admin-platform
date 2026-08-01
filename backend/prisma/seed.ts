import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const superAdminRole = await prisma.role.upsert({
    where: { name: 'SUPER_ADMIN' },
    update: {},
    create: { name: 'SUPER_ADMIN', description: 'Full system access' },
  });

  await prisma.role.upsert({
    where: { name: 'SUB_ADMIN' },
    update: {},
    create: { name: 'SUB_ADMIN', description: 'Assigned module access' },
  });

  await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: { name: 'ADMIN', description: 'Read-only, own records' },
  });

  const permissions = [
    { resource: 'users', action: 'read' },
    { resource: 'users', action: 'write' },
    { resource: 'users', action: 'delete' },
  ];

  for (const p of permissions) {
    await prisma.permission.upsert({
      where: { resource_action: { resource: p.resource, action: p.action } },
      update: {},
      create: p,
    });
  }

  // Super Admin gets everything
  const allPermissions = await prisma.permission.findMany();
  for (const perm of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: superAdminRole.id,
          permissionId: perm.id,
        },
      },
      update: {},
      create: { roleId: superAdminRole.id, permissionId: perm.id },
    });
  }

  // Admin gets read-only access to users (their own records, enforced at repository level)
  const usersReadPermission = await prisma.permission.findUnique({
    where: { resource_action: { resource: 'users', action: 'read' } },
  });

  const adminRole = await prisma.role.findUnique({ where: { name: 'ADMIN' } });

  if (usersReadPermission && adminRole) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: usersReadPermission.id,
        },
      },
      update: {},
      create: { roleId: adminRole.id, permissionId: usersReadPermission.id },
    });
  }

  const hashedPassword = await bcrypt.hash('ChangeMe123!', 10);
  await prisma.user.upsert({
    where: { email: 'superadmin@example.com' },
    update: {},
    create: {
      email: 'superadmin@example.com',
      password: hashedPassword,
      name: 'Super Admin',
      roleId: superAdminRole.id,
    },
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
