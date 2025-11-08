'use client';

import { useRef, useImperativeHandle, forwardRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

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

interface CalendarViewProps {
  bookings: Booking[];
  currentUserId?: string;
  isAdmin?: boolean;
  onDateSelect?: (selectInfo: any) => void;
  onEventClick?: (event: Booking) => void;
}

export interface CalendarViewRef {
  clearSelection: () => void;
}

const CalendarView = forwardRef<CalendarViewRef, CalendarViewProps>(({ bookings, currentUserId, isAdmin, onDateSelect, onEventClick }, ref) => {
  const calendarRef = useRef<FullCalendar>(null);
  const events = bookings
    .filter(booking => booking.status !== 'REJECTED') // Don't show rejected bookings
    .map((booking) => {
      // Show event name if user is admin or the requestor
      const canSeeEventName = isAdmin || booking.requesterId === currentUserId;
      const displayTitle = canSeeEventName ? booking.eventName : 'Booking';
      
      return {
        id: booking.id,
        title: displayTitle,
        start: booking.start,
        end: booking.end,
        className: `fc-event-${booking.status.toLowerCase()}`,
        extendedProps: {
          status: booking.status,
          comment: booking.comment,
          canSeeEventName,
          booking: booking, // Store full booking data
        },
      };
    });

  useImperativeHandle(ref, () => ({
    clearSelection: () => {
      const calendarApi = calendarRef.current?.getApi();
      if (calendarApi) {
        calendarApi.unselect();
      }
    }
  }));

  // Handler to prevent past date selection
  const handleDateSelect = (selectInfo: any) => {
    const selectedStart = new Date(selectInfo.start);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset to start of today

    if (selectedStart < today) {
      // Don't allow selection of past dates
      return;
    }

    if (onDateSelect) {
      onDateSelect(selectInfo);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        events={events}
        selectable={!!onDateSelect}
        selectMirror={true}
        select={handleDateSelect}
        unselectAuto={false} // Prevent automatic deselection
        validRange={{
          start: new Date().toISOString().split('T')[0] // Disable past dates
        }}
        eventClick={(clickInfo) => {
          if (onEventClick) {
            onEventClick(clickInfo.event.extendedProps.booking);
          }
        }}
        height="auto"
        slotMinTime="06:00:00"
        slotMaxTime="22:00:00"
        allDaySlot={false}
        eventContent={(eventInfo) => {
          const { status, comment, canSeeEventName } = eventInfo.event.extendedProps;
          return (
            <div
              title={
                status === 'REJECTED' && comment
                  ? `Rejected: ${comment}`
                  : `${status}: ${eventInfo.event.title}`
              }
            >
              <div className="font-semibold">{eventInfo.event.title}</div>
              <div className="text-xs">
                {canSeeEventName && status === 'APPROVED' ? status : status}
              </div>
            </div>
          );
        }}
      />
    </div>
  );
});

CalendarView.displayName = 'CalendarView';

export default CalendarView;
