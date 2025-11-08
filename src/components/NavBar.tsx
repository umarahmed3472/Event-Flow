'use client';

import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';

export default function NavBar() {
  const { data: session } = useSession();

  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <Link href="/rooms" className="text-xl font-bold">
            Room Booker
          </Link>
          <Link href="/rooms" className="hover:text-blue-200 text-sm sm:text-base">
            Rooms
          </Link>
          <Link href="/my-requests" className="hover:text-blue-200 text-sm sm:text-base">
            My Requests
          </Link>
          {session?.user?.isAdmin && (
            <Link href="/requests" className="hover:text-blue-200 text-sm sm:text-base">
              Admin
            </Link>
          )}
          {session?.user?.isOwner && (
            <Link href="/settings" className="hover:text-blue-200 text-sm sm:text-base">
              Settings
            </Link>
          )}
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
          <span className="text-sm sm:text-base">
            Welcome, {session?.user?.firstName} {session?.user?.lastName}
          </span>
          <button
            onClick={handleLogout}
            className="bg-blue-700 hover:bg-blue-800 px-3 py-1 rounded text-sm sm:text-base w-full sm:w-auto"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
