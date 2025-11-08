'use client';

interface EventDetailsPanelProps {
  event: {
    id: string;
    eventName: string;
    description: string;
    start: string;
    end: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    requesterId: string;
  } | null;
  currentUserId?: string;
  isAdmin?: boolean;
  onClose: () => void;
}

export default function EventDetailsPanel({ event, currentUserId, isAdmin, onClose }: EventDetailsPanelProps) {
  if (!event) return null;

  const canSeeFullDetails = isAdmin || event.requesterId === currentUserId;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'text-green-600 bg-green-100';
      case 'REJECTED':
        return 'text-red-600 bg-red-100';
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Event Details</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="space-y-4">
        {canSeeFullDetails && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Name
              </label>
              <p className="text-gray-900">{event.eventName}</p>
            </div>

            {event.description && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <p className="text-gray-900">{event.description}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <span className={`inline-flex px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(event.status)}`}>
                {event.status}
              </span>
            </div>
          </>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <p className="text-gray-900">{formatDate(event.start)}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Time
            </label>
            <p className="text-gray-900">{formatTime(event.start)}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Time
            </label>
            <p className="text-gray-900">{formatTime(event.end)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
