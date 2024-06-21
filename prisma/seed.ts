import { RoleEnum, StatusEnum, PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

export const ADMIN_EMAIL = 'admin@gmail.com';
export const ADMIN_PASSWORD = 'admin';

const prisma = new PrismaClient();

const seedUser = async (prisma: PrismaClient): Promise<void> => {
  console.log('Seeding user');

  const alreadyHasAdminUser =
    (await prisma.user.count({
      where: {
        role: RoleEnum.ADMIN,
      },
    })) > 0;

  if (!alreadyHasAdminUser) {
    console.log('Creating admin user');

    await prisma.user.create({
      data: {
        email: ADMIN_EMAIL,
        name: 'Admin User',
        Media: {
          create: {
            url: 'https://example.com/image.jpg',
          },
        },
        password: await bcrypt.hash(ADMIN_PASSWORD, 10),
        status: StatusEnum.ACTIVE,
        recoveryPasswordToken: null,
        refreshToken: null,
        deletedAt: null,
        role: RoleEnum.ADMIN,
      },
    });
  }
};

(async () => {
  await seedUser(prisma);
})();
