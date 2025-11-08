import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/src/lib/auth';
import { prisma } from '@/src/lib/prisma';
import { parsePhoneNumber } from 'libphonenumber-js/min';

export async function POST(request: NextRequest) {
  console.log('Phone API route called');
  
  try {
    const session = await getServerSession(authOptions);
    console.log('Session exists:', !!session);
    
    if (!session?.user?.id) {
      console.log('No session or user ID');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { phone } = await request.json();
    console.log('Received phone:', phone);

    if (!phone) {
      console.log('No phone provided');
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // Validate phone number
    try {
      const parsedPhone = parsePhoneNumber(phone, 'US');
      if (!parsedPhone?.isValid()) {
        console.log('Invalid phone format');
        return NextResponse.json({ error: 'Invalid phone number format' }, { status: 400 });
      }

      const phoneE164 = parsedPhone.number;
      console.log('Parsed phone E164:', phoneE164);

      // Check if phone number is already in use by another user
      const existingUser = await prisma.user.findUnique({
        where: { phoneE164 },
      });

      if (existingUser && existingUser.id !== session.user.id) {
        console.log('Phone number already in use');
        return NextResponse.json({ error: 'Phone number is already in use' }, { status: 400 });
      }

      // Update user's phone number
      console.log('Updating user phone number for user:', session.user.id);
      await prisma.user.update({
        where: { id: session.user.id },
        data: { phoneE164 },
      });

      console.log('Phone number updated successfully');
      return NextResponse.json({ message: 'Phone number updated successfully' });
    } catch (error) {
      console.log('Phone validation error:', error);
      return NextResponse.json({ error: 'Invalid phone number format' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error updating phone number:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
