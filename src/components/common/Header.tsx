'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, FileText, CalendarCheck, ShieldCheck, HeartPulse, LogOut, User as UserIcon, Building2, ChevronDown, CreditCard, Layers } from 'lucide-react';
import { NotificationBell } from './NotificationBell';
import { useAuth } from '@/context/AuthContext';
import { User } from '@/types';

interface HeaderProps {
  user?: User | null;
}

export function Header({ user: propUser }: HeaderProps) {
  const pathname = usePathname();
  const { user: authUser, loading, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  // Prefer auth context user, fall back to propUser if provided
  const user = authUser || propUser;

  const isProvider = user?.role === 'PROVIDER';
  const facilityName = user?.facility?.name || '';

  // Helper to generate initials dynamically from actual user name (e.g. "John Doe" -> "JD")
  const getInitials = (name?: string) => {
    if (!name) return '';
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur border-b border-slate-200/80 shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2.5 group">
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

          {/* Role-Based Navigation */}
          {user && (
            <nav className="hidden md:flex items-center gap-1 text-xs font-semibold">
              {!isProvider ? (
                /* CUSTOMER NAVIGATION */
                <>
                  <Link
                    href="/dashboard"
                    className={`px-3 py-2 rounded-lg transition-colors ${
                      pathname === '/dashboard' ? 'bg-teal-50 text-teal-700 font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Home
                  </Link>
                  <Link
                    href="/search"
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors ${
                      pathname === '/search' ? 'bg-teal-50 text-teal-700 font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Search className="w-3.5 h-3.5" />
                    Browse Equipment
                  </Link>
                  <Link
                    href="/requests"
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors ${
                      pathname === '/requests' ? 'bg-teal-50 text-teal-700 font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    My Requests
                  </Link>
                  <Link
                    href="/bookings"
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors ${
                      pathname === '/bookings' ? 'bg-teal-50 text-teal-700 font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <CalendarCheck className="w-3.5 h-3.5" />
                    My Bookings
                  </Link>
                  <Link
                    href="/payments"
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors ${
                      pathname === '/payments' ? 'bg-teal-50 text-teal-700 font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    Payments
                  </Link>
                </>
              ) : (
                /* PROVIDER NAVIGATION */
                <>
                  <Link
                    href="/provider"
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-bold transition-colors ${
                      pathname === '/provider' ? 'bg-blue-100 text-blue-800' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5 text-blue-600" />
                    My Equipment
                  </Link>
                  <Link
                    href="/requests"
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-bold transition-colors ${
                      pathname === '/requests' ? 'bg-amber-100 text-amber-900' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5 text-amber-600" />
                    Booking Requests
                  </Link>
                  <Link
                    href="/bookings"
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors ${
                      pathname === '/bookings' ? 'bg-teal-50 text-teal-700 font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <CalendarCheck className="w-3.5 h-3.5" />
                    Confirmed Bookings
                  </Link>
                  <Link
                    href="/payments"
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors ${
                      pathname === '/payments' ? 'bg-teal-50 text-teal-700 font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    Payments
                  </Link>
                </>
              )}
            </nav>
          )}
        </div>

        {/* Right Section: Notifications & Dynamic Authenticated User Avatar */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          {user && <NotificationBell userId={user.id} />}

          {/* User Profile / Auth State */}
          {loading && !user ? (
            <div className="w-28 h-9 rounded-2xl bg-slate-100 animate-pulse" />
          ) : user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2.5 p-1.5 rounded-2xl hover:bg-slate-100 transition-colors border border-slate-200/80 bg-white"
              >
                {/* Dynamic Avatar: Profile image or generated initials from actual user name */}
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-xl object-cover shadow-sm" />
                ) : (
                  <div className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center shadow-sm text-white ${
                    isProvider ? 'bg-blue-600' : 'bg-teal-600'
                  }`}>
                    {getInitials(user.name)}
                  </div>
                )}

                <div className="hidden lg:block text-left pr-1">
                  <p className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[150px]">
                    {user.name}
                  </p>
                  <p className="text-[10px] text-teal-700 font-semibold truncate max-w-[150px]">
                    {isProvider ? 'Equipment Provider' : 'Customer'} {facilityName ? `• ${facilityName}` : ''}
                  </p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Profile Dropdown */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-elevated border border-slate-200 z-50 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-100">
                  <div className="p-3 bg-slate-50 rounded-xl mb-1 border border-slate-100">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {user.name}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    <p className="text-[10px] font-semibold text-teal-700 mt-0.5 truncate">
                      {isProvider ? 'Equipment Provider' : 'Customer'} {facilityName ? `• ${facilityName}` : ''}
                    </p>
                  </div>

                  <Link
                    href="/profile"
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    <Building2 className="w-4 h-4 text-teal-600" />
                    <span>My Profile &amp; Facility</span>
                  </Link>

                  <Link
                    href="/payments"
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    <CreditCard className="w-4 h-4 text-teal-600" />
                    <span>Payments History</span>
                  </Link>

                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50 rounded-xl transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4 text-rose-600" />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-teal-700 hover:bg-slate-100 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-teal-600 text-white hover:bg-teal-700 shadow-sm transition-all"
              >
                Register Hospital
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
