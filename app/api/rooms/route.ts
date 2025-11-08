import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/src/lib/prisma';
import { roomSchema } from '@/src/lib/validation';
import { authOptions } from '@/src/lib/auth';

export async function GET() {
  try {
    const rooms = await prisma.room.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(rooms);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = roomSchema.parse(body);

    // Check if room already exists
    const existingRoom = await prisma.room.findUnique({
      where: { name: validatedData.name },
    });

    if (existingRoom) {
      return NextResponse.json(
        { error: 'Room already exists' },
        { status: 400 }
      );
    }

    const room = await prisma.room.create({
      data: {
        name: validatedData.name,
      },
      select: {
        id: true,
        name: true,
      },
    });

    return NextResponse.json(room, { status: 201 });
  } catch (error) {
    console.error('Error creating room:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
