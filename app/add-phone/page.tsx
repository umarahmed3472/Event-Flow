'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AddPhonePage() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { update } = useSession();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('Form submitted with phone:', phone);

    try {
      const response = await fetch('/api/user/phone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ phone }),
      });

      console.log('API response status:', response.status);

      if (!response.ok) {
        const data = await response.json();
        console.log('API error response:', data);
        throw new Error(data.error || 'Failed to update phone number');
      }

      const result = await response.json();
      console.log('API success response:', result);
      
      // Update the session to reflect the new phone number
      console.log('Updating session...');
      await update();
      console.log('Session updated');
      
      // Redirect to rooms page
      console.log('Redirecting to rooms...');
      router.push('/rooms');
    } catch (error) {
      console.error('Error submitting phone:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Add Your Phone Number
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please add your phone number to complete your profile
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="phone" className="sr-only">
              Phone Number
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Enter your phone number (e.g., (555) 123-4567)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Adding Phone Number...' : 'Add Phone Number'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
