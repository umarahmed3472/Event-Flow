'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import NavBar from '@/src/components/NavBar';
import UserRequestRow from '@/src/components/UserRequestRow';

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

export default function MyRequestsPage() {
  const { data: session } = useSession();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await fetch('/api/user/requests');
      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Requests</h1>
          <p className="text-gray-600">
            View the status of your booking requests
          </p>
        </div>

        {requests.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">No requests found</div>
            <p className="text-gray-400 mt-2">
              Your booking requests will appear here once you submit them.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <UserRequestRow key={request.id} request={request} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
