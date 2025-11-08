import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/src/lib/prisma';
import { bookingSchema } from '@/src/lib/validation';
import { authOptions } from '@/src/lib/auth';
import { isOverlapping } from '@/src/lib/time';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const bookings = await prisma.booking.findMany({
      where: {
        requesterId: session.user.id,
      },
      include: {
        room: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        start: 'desc',
      },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = bookingSchema.parse(body);

    const startTime = new Date(validatedData.start);
    const endTime = new Date(validatedData.end);

    // Additional check: prevent booking in the past
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Reset to start of today
    
    if (startTime < now) {
      return NextResponse.json(
        { error: 'Cannot book dates in the past' },
        { status: 400 }
      );
    }

    // Check for overlapping APPROVED bookings
    const overlappingBookings = await prisma.booking.findMany({
      where: {
        roomId: validatedData.roomId,
        status: 'APPROVED',
        start: {
          lt: endTime,
        },
        end: {
          gt: startTime,
        },
      },
    });

    if (overlappingBookings.length > 0) {
      return NextResponse.json(
        { error: 'TIME_NOT_AVAILABLE' },
        { status: 409 }
      );
    }

    const booking = await prisma.booking.create({
      data: {
        requesterId: session.user.id,
        roomId: validatedData.roomId,
        eventName: validatedData.eventName,
        description: validatedData.description,
        start: startTime,
        end: endTime,
        status: 'PENDING',
      },
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
