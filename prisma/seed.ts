import { faker } from '@faker-js/faker';
import { BookingStatus, PrismaClient } from '@prisma/client';

const AMOUNT_OF_USERS = 3;
const AMOUNT_OF_ROOMS = 10;
const AMOUNT_OF_BOOKINGS = 2;

const prisma = new PrismaClient();

async function applyUsersSeeder(): Promise<void> {
  try {
    for (let i = 0; i < AMOUNT_OF_USERS; i++) {
      await prisma.user.create({
        data: {
          name: faker.person.fullName(),
          email: faker.internet.email(),
        },
      });
      console.info(`Seeded database with user #${i + 1}.`);
    }
  } catch (error) {
    console.error('Error seeding users:', error);
    throw error;
  }
}

async function applyRoomsSeeder(): Promise<void> {
  try {
    for (let i = 0; i < AMOUNT_OF_ROOMS; i++) {
      await prisma.room.create({
        data: {
          name: `Room #${i + 1}`,
          capacity: faker.number.int({ min: 1, max: 4 }),
          description: `Great room with #${i + 1}.`,
        },
      });
      console.info(`Seeded database with room #${i + 1}.`);
    }
  } catch (error) {
    console.error('Error seeding rooms:', error);
    throw error;
  }
}

async function applyBookingsSeeder(): Promise<void> {
  try {
    for (let i = 0; i < AMOUNT_OF_BOOKINGS; i++) {
      const startTime = faker.date.future();
      const endTime = new Date(
        startTime.getTime() +
          faker.number.int({ min: 1, max: 24 }) * 60 * 60 * 1000,
      );

      await prisma.booking.create({
        data: {
          roomId: faker.number.int({ min: 1, max: AMOUNT_OF_ROOMS }),
          userId: faker.number.int({ min: 1, max: AMOUNT_OF_USERS }),
          startTime,
          endTime,
          status: BookingStatus.CONFIRMED,
        },
      });
      console.info(`Seeded database with booking #${i + 1}.`);
    }
  } catch (error) {
    console.error('Error seeding bookings:', error);
    throw error;
  }
}

async function applySeeders(): Promise<void> {
  try {
    await applyUsersSeeder();
    await applyRoomsSeeder();
    await applyBookingsSeeder();
  } catch (err) {
    console.error('Error applying seeders:', err);
    throw err;
  } finally {
    await prisma.$disconnect();
  }
}

applySeeders();
