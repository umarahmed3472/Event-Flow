import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/src/lib/prisma';
import { authOptions } from '@/src/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    if (booking.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Booking is not pending' },
        { status: 400 }
      );
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: params.id },
      data: { status: 'APPROVED' },
    });

    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error('Error approving booking:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
