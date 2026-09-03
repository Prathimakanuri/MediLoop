'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '../../../components/common/Header';
import { MobileNav } from '@/components/common/MobileNav';
import { Footer } from '@/components/common/Footer';
import { EquipmentImage } from '@/components/common/EquipmentImage';
import { PaymentModal } from '../../../components/bookings/PaymentModal';
import { Booking, User } from '@/types';
import { formatDate, formatCurrency, getStatusColor } from '../../../lib/utils';
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  FileCheck,
  HeartPulse,
  Phone,
  Printer,
  ShieldAlert,
  ShieldCheck,
  Truck,
  AlertCircle,
} from 'lucide-react';

export default function BookingPassPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id as string;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const loadBooking = async () => {
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
  };

  useEffect(() => {
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

  const isPaid = booking.paymentStatus === 'PAID';
  const isProvider = currentUser?.role === 'PROVIDER';
  const statusInfo = getStatusColor(booking.status);

  const rentalFee = booking.totalAmount;
  const gstAmount = Math.round(rentalFee * 0.18);
  const deposit = booking.deposit || 0;
  const grandTotal = rentalFee + gstAmount + deposit;

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      <Header user={currentUser} />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Navigation & Print Actions */}
        <div className="flex items-center justify-between">
          <Link
            href="/bookings"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-teal-700 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Bookings
          </Link>

          {isPaid && (
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Tax Receipt</span>
            </button>
          )}
        </div>

        {/* Unpaid Warning Banner */}
        {!isPaid && (
          <div className="p-4 sm:p-5 rounded-3xl bg-amber-50 border border-amber-300 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in duration-200">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-2xl bg-amber-100 text-amber-800 flex-shrink-0 mt-0.5">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-amber-950">
                  Payment Required — Reservation Not Yet Confirmed
                </h3>
                <p className="text-xs text-amber-800 mt-0.5">
                  The provider has accepted your equipment request. Complete payment of {formatCurrency(grandTotal)} to issue your official verified rental pass and dispatch logistics.
                </p>
              </div>
            </div>

            {!isProvider && (
              <button
                onClick={() => setShowPaymentModal(true)}
                className="px-5 py-2.5 rounded-2xl text-xs font-extrabold bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/20 active:scale-95 transition-all whitespace-nowrap self-stretch sm:self-auto text-center"
              >
                Pay Now ({formatCurrency(grandTotal)})
              </button>
            )}
          </div>
        )}

        {/* Printable Pass & Invoice Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card overflow-hidden">
          {/* Top Header Strip */}
          <div className={`text-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
            isPaid ? 'bg-teal-700' : 'bg-slate-800'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black shadow-md ${
                isPaid ? 'bg-white text-teal-700' : 'bg-amber-500 text-slate-900'
              }`}>
                <HeartPulse className="w-7 h-7" />
              </div>
              <div>
                <span className="font-black text-xl tracking-tight">MEDI<span className="text-teal-200">LOOP</span></span>
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-200">
                  {isPaid ? 'Official Healthcare Rental Pass & Verified Tax Invoice' : 'Provisional Rental Reservation (Payment Pending)'}
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[10px] uppercase tracking-wider text-slate-300 block font-semibold">
                Pass / Reservation Number
              </span>
              <span className="font-mono text-lg font-black text-white">
                {booking.bookingNumber}
              </span>
            </div>
          </div>

          {/* Pass Body Content */}
          <div className="p-6 sm:p-8 space-y-6">
            {/* Status & Payment Validation Bar */}
            <div className={`flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl border text-xs ${
              isPaid ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'
            }`}>
              <div className="flex items-center gap-2">
                {isPaid ? (
                  <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                ) : (
                  <Clock className="w-5 h-5 text-amber-600 flex-shrink-0" />
                )}
                <div>
                  <span className={`font-bold block ${isPaid ? 'text-emerald-950' : 'text-amber-950'}`}>
                    {isPaid ? 'Biomedical Safety & Legal Authorization ACTIVE' : 'RESERVATION PENDING PAYMENT'}
                  </span>
                  <span className={`text-[11px] ${isPaid ? 'text-emerald-800' : 'text-amber-800'}`}>
                    {isPaid
                      ? 'Biomedically certified for clinical operation • Insured under MediLoop Transit Guarantee'
                      : 'Equipment is reserved. Payment verification required before equipment hand-over.'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isPaid ? (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Paid &amp; Confirmed
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Payment Required
                  </span>
                )}
              </div>
            </div>

            {/* Equipment Spotlight */}
            <div className="flex flex-col sm:flex-row gap-5 items-start">
              <div className="w-full sm:w-48 h-36 rounded-2xl overflow-hidden bg-slate-100 border border-slate-100 flex-shrink-0">
                <EquipmentImage
                  src={booking.equipment?.imageUrl || '/equipment/ventilator.svg'}
                  alt={booking.equipment?.name || 'Equipment'}
                  categorySlug={booking.equipment?.category?.slug || 'ventilator'}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-100">
                  {booking.equipment?.category?.name || 'Medical Equipment'}
                </span>
                <h2 className="text-xl font-bold text-slate-900 leading-tight">
                  {booking.equipment?.name}
                </h2>
                <p className="text-xs text-slate-500">
                  Model: {booking.equipment?.model} • Condition: {booking.equipment?.condition}
                </p>
                <p className="text-xs text-slate-600 line-clamp-2 pt-1">
                  {booking.equipment?.description}
                </p>
              </div>
            </div>

            {/* Facility Parties Involved Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              {/* Provider Facility */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Equipment Provider Facility
                </span>
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-teal-600" />
                  <span className="font-bold text-slate-900 text-xs">{booking.provider?.name}</span>
                </div>
                <p className="text-[11px] text-slate-500">{booking.provider?.address}</p>
                <div className="flex items-center gap-1 text-[11px] text-teal-700 font-semibold pt-1">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{booking.provider?.contactPhone}</span>
                </div>
              </div>

              {/* Requester Hospital */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Renting Healthcare Facility
                </span>
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-teal-600" />
                  <span className="font-bold text-slate-900 text-xs">
                    {booking.requester?.facility?.name || booking.requester?.name}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  {booking.requester?.facility?.address || booking.deliveryAddress || 'District Hospital Campus'}
                </p>
                <div className="flex items-center gap-1 text-[11px] text-teal-700 font-semibold pt-1">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{booking.requester?.facility?.contactPhone || '+91 91580 11223'}</span>
                </div>
              </div>
            </div>

            {/* Rental Duration & Logistics Schedule */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Rental Start</span>
                <span className="font-bold text-slate-900 mt-0.5 block">{formatDate(booking.startDate)}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Rental End</span>
                <span className="font-bold text-slate-900 mt-0.5 block">{formatDate(booking.endDate)}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Duration</span>
                <span className="font-bold text-slate-900 mt-0.5 block">{booking.totalDays} Days</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Logistics Status</span>
                <span className={`font-bold mt-0.5 block ${isPaid ? 'text-teal-700' : 'text-slate-500'}`}>
                  {isPaid ? 'Queued for Dispatch' : 'Awaiting Payment'}
                </span>
              </div>
            </div>

            {/* Official Tax Invoice & Payment Receipt Section */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  {isPaid ? 'Official Tax Invoice & Payment Receipt' : 'Provisional Fee Estimate'}
                </h3>
                <span className="text-[11px] font-mono text-slate-500">
                  GSTIN: 27AAACM9941D1Z9
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Rental Fee ({booking.totalDays} days @ {formatCurrency(booking.pricePerDay)}/day):</span>
                  <span className="font-bold text-slate-800">{formatCurrency(rentalFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Medical Equipment GST (18% Healthcare Lease):</span>
                  <span className="font-bold text-slate-800">{formatCurrency(gstAmount)}</span>
                </div>
                {deposit > 0 && (
                  <div className="flex justify-between">
                    <span>Refundable Security Deposit:</span>
                    <span className="font-bold text-slate-800">{formatCurrency(deposit)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-200 flex justify-between text-sm">
                  <span className="font-extrabold text-slate-900">Total Billed Amount:</span>
                  <span className="font-black text-teal-700 text-base">{formatCurrency(grandTotal)}</span>
                </div>
              </div>

              {/* Verified Receipt or Payment Callout */}
              {isPaid ? (
                <div className="mt-3 p-3.5 rounded-xl bg-emerald-100/80 border border-emerald-200 text-xs text-emerald-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-extrabold flex items-center gap-1.5 text-emerald-900">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Payment Receipt Verified &amp; Settled
                    </span>
                    <span className="text-[11px] text-emerald-800 block mt-0.5">
                      Method: <strong>{(booking as any).paymentMethod || 'UPI'}</strong> • Txn Reference: <strong className="font-mono">{(booking as any).transactionId || 'TXN-SETTLED'}</strong>
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-800 bg-white px-2 py-1 rounded border border-emerald-200">
                    Paid: {formatDate((booking as any).paidAt || booking.createdAt)}
                  </span>
                </div>
              ) : (
                <div className="mt-3 p-4 rounded-xl bg-amber-100/80 border border-amber-200 text-xs text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <span className="font-extrabold text-amber-950 block">
                      Outstanding Invoice: {formatCurrency(grandTotal)}
                    </span>
                    <span className="text-[11px] text-amber-800 mt-0.5 block">
                      No payment has been received yet. Click Pay Now to settle via UPI, NEFT, or Corporate Card.
                    </span>
                  </div>

                  {!isProvider && (
                    <button
                      onClick={() => setShowPaymentModal(true)}
                      className="px-4 py-2 rounded-xl text-xs font-extrabold bg-teal-600 hover:bg-teal-700 text-white shadow-md active:scale-95 transition-all whitespace-nowrap"
                    >
                      Pay Now ({formatCurrency(grandTotal)})
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          booking={booking}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={(updatedBooking) => {
            setBooking(updatedBooking);
            setShowPaymentModal(false);
            loadBooking();
          }}
        />
      )}

      <Footer />
      <MobileNav isProvider={isProvider} />
    </div>
  );
}
