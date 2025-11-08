import { getServerSession } from 'next-auth';
import { authOptions } from '@/src/lib/auth';
import { prisma } from '@/src/lib/prisma';
import NavBar from '@/src/components/NavBar';
// import RoomList from '@/src/components/RoomList';
import RoomsPageClient from '@/src/components/RoomsPageClient';

export default async function RoomsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return null; // Middleware will handle redirect
  }

  const rooms = await prisma.room.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: 'asc',
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <RoomsPageClient initialRooms={rooms} />
    </div>
    // <RoomsPageClient initialRooms={rooms} />
    // <div className="min-h-screen bg-gray-50">
    //   <NavBar />
    //   <div className="container mx-auto px-4 py-8">
    //     <div className="mb-8">
    //       <h1 className="text-3xl font-bold text-gray-900 mb-2">
    //         Available Rooms
    //       </h1>
    //       <p className="text-gray-600">
    //         Select a room to view its calendar and make a booking
    //       </p>
    //     </div>
        
    //     <RoomList rooms={rooms} />
    //   </div>
    // </div>
  );
}
