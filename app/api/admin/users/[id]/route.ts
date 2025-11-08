import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/src/lib/prisma';
import { authOptions } from '@/src/lib/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isOwner) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { isAdmin } = body;

    if (typeof isAdmin !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid isAdmin value' },
        { status: 400 }
      );
    }

    // Prevent owner from demoting themselves
    if (params.id === session.user.id && !isAdmin) {
      return NextResponse.json(
        { error: 'Cannot demote yourself as owner' },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: { isAdmin },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phoneE164: true,
        isAdmin: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
