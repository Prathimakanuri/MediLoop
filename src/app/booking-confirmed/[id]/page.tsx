'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import confetti from 'canvas-confetti';
import { Header } from '@/components/common/Header';
import { MobileNav } from '@/components/common/MobileNav';
import { Footer } from '@/components/common/Footer';
import { EquipmentImage } from '@/components/common/EquipmentImage';
import { PaymentModal } from '@/components/bookings/PaymentModal';
import { Booking, User } from '@/types';
import { formatDate, formatCurrency, getStatusColor } from '@/lib/utils';
import {
  CheckCircle2,
  CalendarCheck,
  Building2,
  Calendar,
  FileCheck,
  ArrowRight,
  Truck,
  Sparkles,
  Printer,
  CreditCard,
  ShieldCheck,
} from 'lucide-react';

export default function BookingConfirmedPage() {
  const params = useParams();
  const bookingId = params.id as string;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0d9488', '#10b981', '#0284c7', '#38bdf8'],
      });
    } catch (e) {
      console.log('Confetti effect');
    }

    async function loadBooking() {
      try {
        const [bRes, uRes] = await Promise.all([
          fetch(`/api/bookings/${bookingId}`),
          fetch('/api/auth/me'),
        ]);

        if (bRes.ok) {
          const bData = await bRes.json();
          setBooking(bData.booking);
        }
        if (uRes.ok) {
          const uData = await uRes.json();
          setCurrentUser(uData.user);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadBooking();
  }, [bookingId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <h2 className="text-lg font-bold text-slate-900">Booking Record Not Found</h2>
        <Link href="/bookings" className="mt-4 text-teal-600 font-bold text-sm">
          Go to My Bookings
        </Link>
      </div>
    );
  }

  const statusInfo = getStatusColor(booking.status);
  const isPaid = (booking as any).paymentStatus === 'PAID';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header user={currentUser} />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-16 flex flex-col items-center justify-center text-center">
        {/* Success Icon */}
        <div className="w-20 h-20 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shadow-elevated mb-6 animate-pulse">
          <CheckCircle2 className="w-11 h-11 text-emerald-600" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Verified Healthcare Reservation</span>
        </div>

        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Booking Confirmed!
        </h1>

        <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto leading-relaxed">
          Your equipment has been confirmed by <strong className="text-slate-800">{booking.provider?.name}</strong> and is queued for medical logistics dispatch.
        </p>

        {/* Confirmed Booking Summary Card */}
        <div className="mt-8 w-full bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-card text-left space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Booking ID
              </span>
              <span className="text-sm font-black font-mono text-teal-800">
                {booking.bookingNumber}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}>
                <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" />
                {statusInfo.label}
              </span>

              {isPaid ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Payment Paid ✓
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                  Payment Pending
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-100">
              <EquipmentImage
                src={booking.equipment?.imageUrl || '/equipment/ventilator.svg'}
                alt={booking.equipment?.name || 'Equipment'}
                categorySlug={booking.equipment?.category?.slug || 'ventilator'}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base leading-tight">
                {booking.equipment?.name}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Model: {booking.equipment?.model}</p>
              <div className="flex items-center gap-1 text-xs text-teal-700 font-semibold mt-1">
                <Building2 className="w-3.5 h-3.5" />
                <span>From: {booking.provider?.name}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-teal-600" />
              <span>
                Dates: <strong>{formatDate(booking.startDate)} - {formatDate(booking.endDate)}</strong>
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span>Duration: <strong>{booking.totalDays} days</strong></span>
            </div>

            <div className="flex items-center gap-1.5">
              <span>Daily Rate: <strong>{formatCurrency(booking.pricePerDay)}/day</strong></span>
            </div>

            <div className="flex items-center gap-1.5">
              <span>Total Price: <strong className="text-teal-700 text-base font-black">{formatCurrency(booking.totalAmount)}</strong></span>
            </div>
          </div>

          {/* Payment CTA Box */}
          <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-bold text-slate-900 block">
                {isPaid ? 'Payment Received & Verified' : 'Payment Status: Pending Payment'}
              </span>
              <p className="text-slate-600 text-[11px]">
                {isPaid
                  ? `Paid via ${(booking as any).paymentMethod} (Txn: ${(booking as any).transactionId})`
                  : 'Complete payment via UPI, NEFT, or Corporate Card to issue official tax invoice.'}
              </p>
            </div>

            {!isPaid && (
              <button
                onClick={() => setShowPaymentModal(true)}
                className="px-4 py-2 rounded-xl text-xs font-extrabold bg-teal-600 text-white hover:bg-teal-700 shadow-md whitespace-nowrap active:scale-95 transition-all"
              >
                Pay Now ({formatCurrency(booking.totalAmount)})
              </button>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3 w-full justify-center">
          <Link
            href="/bookings"
            className="flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl text-sm font-bold bg-teal-600 text-white hover:bg-teal-700 shadow-md shadow-teal-600/20 transition-all active:scale-95"
          >
            <CalendarCheck className="w-4 h-4" />
            <span>View My Bookings</span>
          </Link>

          <Link
            href={`/bookings/${booking.id}`}
            className="flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl text-sm font-bold bg-slate-900 text-white hover:bg-slate-800 shadow-sm transition-all"
          >
            <FileCheck className="w-4 h-4" />
            <span>View Rental Pass &amp; Invoice</span>
          </Link>
        </div>
      </main>

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          booking={booking}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={(updated) => {
            setBooking(updated);
            setShowPaymentModal(false);
          }}
        />
      )}

      <Footer />
      <MobileNav isProvider={currentUser?.role === 'PROVIDER'} />
    </div>
  );
}
