'use client';

import { useState } from 'react';

interface Request {
  id: string;
  eventName: string;
  description: string;
  start: string;
  end: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  comment?: string;
  createdAt: string;
  room: {
    name: string;
  };
}

interface UserRequestRowProps {
  request: Request;
}

export default function UserRequestRow({ request }: UserRequestRowProps) {
  const [showComment, setShowComment] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
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
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{request.eventName}</h3>
          <p className="text-sm text-gray-600">{request.room.name}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
          {request.status}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Date:</span>
          <span className="font-medium">{formatDate(request.start)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Time:</span>
          <span className="font-medium">
            {formatTime(request.start)} - {formatTime(request.end)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Submitted:</span>
          <span className="font-medium">{formatDate(request.createdAt)}</span>
        </div>
      </div>

      {request.description && (
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Description:</span> {request.description}
          </p>
        </div>
      )}

      {request.status === 'REJECTED' && request.comment && (
        <div className="mt-4">
          <button
            onClick={() => setShowComment(!showComment)}
            className="flex items-center text-sm text-red-600 hover:text-red-800"
          >
            <span>View rejection reason</span>
            <svg
              className={`ml-1 h-4 w-4 transform transition-transform ${showComment ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showComment && (
            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded">
              <p className="text-sm text-red-800">{request.comment}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
