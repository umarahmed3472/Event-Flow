'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import NavBar from '@/src/components/NavBar';
import CalendarView, { CalendarViewRef } from '@/src/components/CalendarView';
import BookingForm from '@/src/components/BookingForm';
import EventDetailsPanel from '@/src/components/EventDetailsPanel';
import Toast from '@/src/components/Toast';

interface Room {
  id: string;
  name: string;
}

interface Booking {
  id: string;
  start: string;
  end: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  eventName: string;
  description: string;
  requesterId: string;
  comment?: string;
}

export default function RoomDetailPage() {
  const params = useParams();
  const roomId = params.id as string;
  const calendarRef = useRef<CalendarViewRef>(null);
  const { data: session } = useSession();
  
  const [room, setRoom] = useState<Room | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ date: string; startTime: string; endTime: string } | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Booking | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoomData();
    fetchBookings();
  }, [roomId]);

  const fetchRoomData = async () => {
    try {
      const response = await fetch('/api/rooms');
      const rooms = await response.json();
      const currentRoom = rooms.find((r: Room) => r.id === roomId);
      setRoom(currentRoom || null);
    } catch (error) {
      console.error('Error fetching room data:', error);
    }
  };

  const fetchBookings = async () => {
    try {
      const now = new Date();
      const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const twoMonthsLater = new Date(now.getFullYear(), now.getMonth() + 2, 0);

      const response = await fetch(
        `/api/rooms/${roomId}/availability?from=${oneMonthAgo.toISOString()}&to=${twoMonthsLater.toISOString()}`
      );
      const data = await response.json();
      setBookings(data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingSubmit = async (bookingData: {
    eventName: string;
    description: string;
    start: string;
    end: string;
  }) => {
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomId,
          ...bookingData,
        }),
      });

      if (response.ok) {
        setToast({ message: 'Booking request submitted successfully!', type: 'success' });
        setShowBookingForm(false);
        setSelectedSlot(null);
        calendarRef.current?.clearSelection();
        fetchBookings(); // Refresh bookings
      } else {
        const data = await response.json();
        if (data.error === 'TIME_NOT_AVAILABLE') {
          setToast({ message: "That time isn't available.", type: 'error' });
        } else {
          setToast({ message: 'Failed to submit booking request.', type: 'error' });
        }
      }
    } catch (error) {
      setToast({ message: 'An error occurred. Please try again.', type: 'error' });
    }
  };

  const handleDateSelect = (selectInfo: any) => {
    const start = new Date(selectInfo.start);
    const end = new Date(selectInfo.end);
    
    setSelectedSlot({
      date: start.toISOString().split('T')[0], // YYYY-MM-DD format
      startTime: start.toTimeString().slice(0, 5), // HH:MM format
      endTime: end.toTimeString().slice(0, 5), // HH:MM format
    });
    setSelectedEvent(null); // Clear event details when creating new booking
    setShowBookingForm(true);
  };

  const handleEventClick = (event: Booking) => {
    setSelectedEvent(event);
    setShowBookingForm(false); // Close booking form when viewing event
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Room not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {room.name}
          </h1>
          <p className="text-gray-600">
            View availability and book this room
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <CalendarView 
              ref={calendarRef}
              bookings={bookings}
              currentUserId={session?.user?.id}
              isAdmin={session?.user?.isAdmin}
              onDateSelect={handleDateSelect}
              onEventClick={handleEventClick}
            />
          </div>
          
          <div className="lg:col-span-1">
            {showBookingForm ? (
              <BookingForm
                roomId={roomId}
                selectedSlot={selectedSlot}
                onSubmit={handleBookingSubmit}
                onCancel={() => {
                  setShowBookingForm(false);
                  setSelectedSlot(null);
                  calendarRef.current?.clearSelection();
                }}
              />
            ) : selectedEvent ? (
              <EventDetailsPanel
                event={selectedEvent}
                currentUserId={session?.user?.id}
                isAdmin={session?.user?.isAdmin}
                onClose={() => setSelectedEvent(null)}
              />
            ) : (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">Book This Room</h3>
                <p className="text-gray-600 mb-4">
                  Click on the calendar to select a time slot and create a booking request.
                </p>
                <button
                  onClick={() => setShowBookingForm(true)}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                >
                  Create Booking
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
