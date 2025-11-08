'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import RoomList from './RoomList';
import AddRoomModal from './AddRoomModal';

interface Room {
  id: string;
  name: string;
}

interface RoomsPageClientProps {
  initialRooms: Room[];
}

export default function RoomsPageClient({ initialRooms }: RoomsPageClientProps) {
  const { data: session } = useSession();
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/rooms');
      if (response.ok) {
        const updatedRooms = await response.json();
        setRooms(updatedRooms);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoomAdded = () => {
    fetchRooms(); // Refresh the room list
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Available Rooms
          </h1>
          <p className="text-gray-600">
            Select a room to view its calendar and make a booking
          </p>
        </div>
        
        {/* Add Room Button - Only show for admins */}
        {session?.user?.isAdmin && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            Add a Room
          </button>
        )}
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="text-gray-500">Loading rooms...</div>
        </div>
      ) : (
        <RoomList rooms={rooms} />
      )}

      <AddRoomModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRoomAdded={handleRoomAdded}
      />
    </div>
  );
}