'use client';

import { useState } from 'react';
import { formatDateTime } from '@/src/lib/time';
//the structure of the request row from the database and displayed in the admin requests page
interface Request {
  id: string;
  eventName: string;
  description: string;
  start: string;
  end: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requester: {
    firstName: string;
    lastName: string;
    email: string;
  };
  room: {
    name: string;
  };
}
//actions for the admin requests page
interface AdminRequestRowProps {
  request: Request;
  onApprove: (id: string) => void;
  onReject: (id: string, comment: string) => void;
}

export default function AdminRequestRow({ request, onApprove, onReject }: AdminRequestRowProps) {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectComment, setRejectComment] = useState('');

  const handleReject = () => {
    if (rejectComment.trim()) {
      onReject(request.id, rejectComment);
      setShowRejectModal(false);
      setRejectComment('');
    }
  };

  return (
    <>
      <tr className="border-b">
        <td className="px-4 py-2">
          {request.requester.firstName} {request.requester.lastName}
          <br />
          <span className="text-sm text-gray-500">{request.requester.email}</span>
        </td>
        <td className="px-4 py-2">{request.room.name}</td>
        <td className="px-4 py-2">
          {new Date(request.start).toLocaleDateString()}
        </td>
        <td className="px-4 py-2">
          {new Date(request.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </td>
        <td className="px-4 py-2">
          {new Date(request.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </td>
        <td className="px-4 py-2">{request.eventName}</td>
        <td className="px-4 py-2">
          <div className="max-w-xs truncate" title={request.description}>
            {request.description}
          </div>
        </td>
        <td className="px-4 py-2">
          {request.status === 'PENDING' && (
            <div className="flex space-x-2">
              <button
                onClick={() => onApprove(request.id)}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
              >
                Approve
              </button>
              <button
                onClick={() => setShowRejectModal(true)}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
              >
                Reject
              </button>
            </div>
          )}
          {request.status !== 'PENDING' && (
            <span className={`px-2 py-1 rounded text-sm ${
              request.status === 'APPROVED' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {request.status}
            </span>
          )}
        </td>
      </tr>

      {showRejectModal && (
        <tr>
          <td colSpan={8} className="px-4 py-4 bg-gray-50">
            <div className="max-w-md">
              <h4 className="font-semibold mb-2">Reject Booking</h4>
              <textarea
                value={rejectComment}
                onChange={(e) => setRejectComment(e.target.value)}
                placeholder="Please provide a reason for rejection..."
                className="w-full p-2 border rounded mb-2"
                rows={3}
                required
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleReject}
                  disabled={!rejectComment.trim()}
                  className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 disabled:bg-gray-400"
                >
                  Confirm Reject
                </button>
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectComment('');
                  }}
                  className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
