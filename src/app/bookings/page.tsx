'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/common/Header';
import { MobileNav } from '@/components/common/MobileNav';
import { Footer } from '@/components/common/Footer';
import { BookingCard } from '@/components/bookings/BookingCard';
import { Booking, User } from '@/types';
import { CalendarCheck, ShieldCheck, CreditCard, Clock, CheckCircle2, Sparkles, Filter } from 'lucide-react';

export default function BookingsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'PAYMENT_REQUIRED' | 'CONFIRMED'>('ALL');

  const loadBookings = async () => {
    setLoading(true);
    try {
      const uRes = await fetch('/api/auth/me');
      if (!uRes.ok) {
        router.push('/login');
        return;
      }
      const uData = await uRes.json();
      if (!uData.user) {
        router.push('/login');
        return;
      }
      setCurrentUser(uData.user);

      const isProvider = uData.user.role === 'PROVIDER';
      const bRes = await fetch(isProvider ? '/api/bookings?view=provider' : '/api/bookings');

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
    loadBookings();
  }, []);

  const isProvider = currentUser?.role === 'PROVIDER';

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'PAYMENT_REQUIRED') {
      return b.paymentStatus === 'PAYMENT_REQUIRED' || b.paymentStatus === 'FAILED' || b.status === 'AWAITING_PAYMENT';
    }
    if (activeTab === 'CONFIRMED') {
      return b.status === 'CONFIRMED' || b.paymentStatus === 'PAID';
    }
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header user={currentUser} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-800 mb-2">
              <CalendarCheck className="w-3.5 h-3.5" />
              <span>{isProvider ? 'Provider Confirmed Rentals' : 'Hospital Rental Reservations'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {isProvider ? 'Confirmed Equipment Rentals' : 'My Equipment Bookings'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {isProvider
                ? 'View active rental passes and payment confirmations for your equipment'
                : 'Complete payment after provider acceptance to issue confirmed digital passes'}
            </p>
          </div>

          <Link
            href="/search"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-teal-600 text-white hover:bg-teal-700 shadow-sm self-start sm:self-auto"
          >
            <span>Browse Equipment Marketplace</span>
          </Link>
        </div>

        {/* Tabbed Filter Pills */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'ALL'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            All Bookings ({bookings.length})
          </button>

          <button
            onClick={() => setActiveTab('PAYMENT_REQUIRED')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'PAYMENT_REQUIRED'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-white text-amber-800 hover:bg-amber-50 border border-amber-200'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Awaiting Payment ({bookings.filter(b => b.paymentStatus === 'PAYMENT_REQUIRED' || b.paymentStatus === 'FAILED').length})</span>
          </button>

          <button
            onClick={() => setActiveTab('CONFIRMED')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'CONFIRMED'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white text-emerald-800 hover:bg-emerald-50 border border-emerald-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Confirmed &amp; Paid ({bookings.filter(b => b.paymentStatus === 'PAID').length})</span>
          </button>
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 animate-pulse bg-white rounded-3xl border border-slate-200">
            Loading bookings...
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-6 space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-2">
              <CalendarCheck className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No bookings found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {isProvider
                ? 'When you accept incoming customer equipment requests, confirmed bookings will appear here.'
                : 'Once an equipment provider accepts your rental request, you can complete payment here to issue your confirmed booking pass.'}
            </p>
            <Link
              href="/search"
              className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-teal-600 text-white hover:bg-teal-700 shadow-md"
            >
              Search Available Equipment
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((b) => (
              <BookingCard
                key={b.id}
                booking={b}
                isProviderView={isProvider}
                onPaymentSuccess={loadBookings}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />
      <MobileNav isProvider={isProvider} />
    </div>
  );
}
