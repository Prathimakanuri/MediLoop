'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, FileText, CalendarCheck, User, ShieldAlert } from 'lucide-react';

export function MobileNav({ isProvider = false }: { isProvider?: boolean }) {
  const pathname = usePathname();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 px-2 py-2 flex items-center justify-around shadow-lg">
      <Link
        href="/dashboard"
        className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-semibold transition-colors ${
          pathname === '/dashboard' ? 'text-teal-600' : 'text-slate-500'
        }`}
      >
        <Home className="w-5 h-5" />
        Home
      </Link>

      <Link
        href="/search"
        className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-semibold transition-colors ${
          pathname === '/search' ? 'text-teal-600' : 'text-slate-500'
        }`}
      >
        <Search className="w-5 h-5" />
        Search
      </Link>

      <Link
        href="/requests"
        className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-semibold transition-colors ${
          pathname === '/requests' ? 'text-teal-600' : 'text-slate-500'
        }`}
      >
        <FileText className="w-5 h-5" />
        Requests
      </Link>

      <Link
        href="/bookings"
        className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-semibold transition-colors ${
          pathname === '/bookings' ? 'text-teal-600' : 'text-slate-500'
        }`}
      >
        <CalendarCheck className="w-5 h-5" />
        Bookings
      </Link>

      {isProvider ? (
        <Link
          href="/provider"
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-semibold transition-colors ${
            pathname === '/provider' ? 'text-blue-600 font-bold' : 'text-slate-500'
          }`}
        >
          <ShieldAlert className="w-5 h-5 text-blue-600" />
          Provider
        </Link>
      ) : (
        <Link
          href="/profile"
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-semibold transition-colors ${
            pathname === '/profile' ? 'text-teal-600' : 'text-slate-500'
          }`}
        >
          <User className="w-5 h-5" />
          Profile
        </Link>
      )}
    </div>
  );
}
