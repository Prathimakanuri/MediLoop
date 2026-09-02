'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/common/Header';
import { MobileNav } from '@/components/common/MobileNav';
import { Footer } from '@/components/common/Footer';
import { BookingCard } from '@/components/bookings/BookingCard';
import { Booking, User } from '@/types';
import { CalendarCheck, Search, RotateCcw, ShieldCheck } from 'lucide-react';

export default function MyBookingsPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'CONFIRMED' | 'ACTIVE' | 'COMPLETED'>('ALL');

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const [uRes, bRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/bookings'),
      ]);

      if (uRes.ok) {
        const uData = await uRes.json();
        setCurrentUser(uData.user);
      }

      if (bRes.ok) {
        const bData = await bRes.json();
        setBookings(bData.bookings || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'ALL') return true;
    return b.status === activeTab;
  });

  const countForTab = (tab: string) => {
    if (tab === 'ALL') return bookings.length;
    return bookings.filter((b) => b.status === tab).length;
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header user={currentUser} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              My Equipment Bookings
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Confirmed rentals, active equipment in facility, and completed returns
            </p>
          </div>

          <Link
            href="/search"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 text-white hover:bg-teal-700 shadow-sm transition-all self-start sm:self-auto"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Find Equipment</span>
          </Link>
        </div>

        {/* Tabs Bar */}
        <div className="flex border-b border-slate-200 gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'ALL', label: 'All Bookings' },
            { id: 'CONFIRMED', label: 'Upcoming / Confirmed' },
            { id: 'ACTIVE', label: 'Active Rentals' },
            { id: 'COMPLETED', label: 'Completed' },
          ].map((tab) => {
            const count = countForTab(tab.id);
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
                  isActive
                    ? 'border-teal-600 text-teal-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                    isActive ? 'bg-teal-100 text-teal-800' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse flex gap-4">
                <div className="w-32 h-24 bg-slate-200 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-1/4" />
                  <div className="h-5 bg-slate-200 rounded w-1/2" />
                  <div className="h-4 bg-slate-100 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white rounded-3xl border border-slate-200/80 shadow-soft max-w-md mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-3">
              <CalendarCheck className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No {activeTab.toLowerCase()} bookings</h3>
            <p className="text-xs text-slate-500 mt-1">
              Confirmed bookings will appear here once an equipment provider accepts your rental request.
            </p>
            <Link
              href="/search"
              className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 text-white hover:bg-teal-700 shadow-sm"
            >
              <Search className="w-3.5 h-3.5" />
              Browse Medical Equipment
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((b) => (
              <BookingCard key={b.id} booking={b} />
            ))}
          </div>
        )}
      </main>

      <Footer />
      <MobileNav isProvider={currentUser?.role === 'PROVIDER'} />
    </div>
  );
}
