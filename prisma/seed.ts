import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create rooms
  const roomA = await prisma.room.upsert({
    where: { name: 'Room A' },
    update: {},
    create: { name: 'Room A' },
  });

  const roomB = await prisma.room.upsert({
    where: { name: 'Room B' },
    update: {},
    create: { name: 'Room B' },
  });

  const auditorium = await prisma.room.upsert({
    where: { name: 'Auditorium' },
    update: {},
    create: { name: 'Auditorium' },
  });

  // Create admin user
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'admin123';
  const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      isOwner: true, // Ensure existing admin becomes owner
      isAdmin: true,
    },
    create: {
      firstName: 'Admin',
      lastName: 'User',
      email: adminEmail,
      phoneE164: '+17164442017',
      password: hashedAdminPassword,
      isAdmin: true,
      isOwner: true, // Make the admin user the owner
    },
  });

  // Create regular user
  const hashedUserPassword = await bcrypt.hash('user123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'user@example.com',
      phoneE164: '+17164007439',
      password: hashedUserPassword,
      isAdmin: false,
    },
  });

  // Create some approved bookings for this week to demo conflicts
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay()); // Start of current week
  startOfWeek.setHours(9, 0, 0, 0);

  const booking1Start = new Date(startOfWeek);
  booking1Start.setDate(startOfWeek.getDate() + 1); // Tuesday
  const booking1End = new Date(booking1Start);
  booking1End.setHours(11, 0, 0, 0);

  await prisma.booking.upsert({
    where: { id: 'demo-booking-1' },
    update: {},
    create: {
      id: 'demo-booking-1',
      requesterId: user.id,
      roomId: roomA.id,
      eventName: 'Team Meeting',
      description: 'Weekly team sync meeting',
      start: booking1Start,
      end: booking1End,
      status: 'APPROVED',
    },
  });

  const booking2Start = new Date(startOfWeek);
  booking2Start.setDate(startOfWeek.getDate() + 3); // Thursday
  booking2Start.setHours(14, 0, 0, 0);
  const booking2End = new Date(booking2Start);
  booking2End.setHours(16, 0, 0, 0);

  await prisma.booking.upsert({
    where: { id: 'demo-booking-2' },
    update: {},
    create: {
      id: 'demo-booking-2',
      requesterId: admin.id,
      roomId: roomA.id,
      eventName: 'Client Presentation',
      description: 'Quarterly review presentation',
      start: booking2Start,
      end: booking2End,
      status: 'APPROVED',
    },
  });

  console.log('Database seeded successfully!');
  console.log(`Admin user: ${adminEmail} / ${adminPassword}`);
  console.log('Regular user: user@example.com / user123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
