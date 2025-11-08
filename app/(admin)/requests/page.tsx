'use client';

import { useState, useEffect } from 'react';
import NavBar from '@/src/components/NavBar';
import AdminRequestRow from '@/src/components/AdminRequestRow';
import Toast from '@/src/components/Toast';

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

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await fetch('/api/admin/requests?status=PENDING');
      const data = await response.json();
      setRequests(data);
    } catch (error) {
      console.error('Error fetching requests:', error);
      setToast({ message: 'Failed to load requests', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/requests/${id}/approve`, {
        method: 'POST',
      });

      if (response.ok) {
        setToast({ message: 'Request approved successfully', type: 'success' });
        fetchRequests(); // Refresh the list
      } else {
        setToast({ message: 'Failed to approve request', type: 'error' });
      }
    } catch (error) {
      setToast({ message: 'An error occurred', type: 'error' });
    }
  };

  const handleReject = async (id: string, comment: string) => {
    try {
      const response = await fetch(`/api/admin/requests/${id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comment }),
      });

      if (response.ok) {
        setToast({ message: 'Request rejected successfully', type: 'success' });
        fetchRequests(); // Refresh the list
      } else {
        setToast({ message: 'Failed to reject request', type: 'error' });
      }
    } catch (error) {
      setToast({ message: 'An error occurred', type: 'error' });
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Pending Requests
          </h1>
          <p className="text-gray-600">
            Review and approve or reject room booking requests
          </p>
        </div>

        {requests.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600">No pending requests at this time.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Requestor
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Room
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Start
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    End
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requests.map((request) => (
                  <AdminRequestRow
                    key={request.id}
                    request={request}
                    onApprove={handleApprove}
                    onReject={handleReject}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
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
