'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Search, FileText, CalendarCheck, UserCheck, ShieldCheck, HeartPulse, LogOut } from 'lucide-react';
import { NotificationBell } from './NotificationBell';
import { RoleSwitcher } from './RoleSwitcher';
import { User } from '@/types';

interface HeaderProps {
  user?: User | null;
}

export function Header({ user }: HeaderProps) {
  const pathname = usePathname();

  const isProvider = user?.role === 'PROVIDER';
  const facilityName = user?.facility?.name || (isProvider ? 'City Hospital' : 'City Care Hospital');

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur border-b border-slate-200/80 shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-600/20 group-hover:bg-teal-700 transition-colors">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-baseline">
                <span className="font-extrabold text-lg text-slate-900 tracking-tight">MEDI</span>
                <span className="font-extrabold text-lg text-teal-600 tracking-tight">LOOP</span>
              </div>
              <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider hidden sm:block">
                Equipment Sharing
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/dashboard"
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                pathname === '/dashboard' ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Home
            </Link>
            <Link
              href="/search"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                pathname === '/search' ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              Browse Equipment
            </Link>
            <Link
              href="/requests"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                pathname === '/requests' ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              My Requests
            </Link>
            <Link
              href="/bookings"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                pathname === '/bookings' ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <CalendarCheck className="w-3.5 h-3.5" />
              Bookings
            </Link>
            {isProvider && (
              <Link
                href="/provider"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                  pathname === '/provider' ? 'bg-blue-100 text-blue-800' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                Provider Hub
              </Link>
            )}
          </nav>
        </div>

        {/* Right Section: Role Switcher, Notification, Profile */}
        <div className="flex items-center gap-3">
          {/* Quick Interactive Role Switcher Pill for Investor / Mentor Demo */}
          <RoleSwitcher
            currentEmail={user?.email || 'demo@mediloop.com'}
            currentRole={user?.role || 'CUSTOMER'}
            facilityName={facilityName}
          />

          {/* Notifications */}
          <NotificationBell userId={user?.id} />

          {/* User Profile / Menu */}
          <Link
            href="/profile"
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
          >
            <div className="w-8 h-8 rounded-full bg-teal-100 border border-teal-300 text-teal-800 font-bold text-xs flex items-center justify-center">
              {user?.name?.slice(0, 2).toUpperCase() || 'DR'}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[120px]">{user?.name || 'Dr. Deshmukh'}</p>
              <p className="text-[10px] text-teal-600 font-medium">Verified Facility</p>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
