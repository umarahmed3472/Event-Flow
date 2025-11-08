'use client';

import Link from 'next/link';

interface Room {
  id: string;
  name: string;
}

interface RoomListProps {
  rooms: Room[];
}

export default function RoomList({ rooms }: RoomListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {rooms.map((room) => (
        <Link
          key={room.id}
          href={`/rooms/${room.id}`}
          className="block p-6 bg-white rounded-lg border border-gray-200 shadow-md hover:bg-gray-50 transition-colors"
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {room.name}
          </h3>
          <p className="text-gray-600">Click to view and book this room</p>
        </Link>
      ))}
    </div>
  );
}
