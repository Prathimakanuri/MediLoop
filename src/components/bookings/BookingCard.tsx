'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Calendar, Building2, CheckCircle2, ShieldCheck, FileCheck, Truck, CreditCard, Clock, AlertCircle } from 'lucide-react';
import { Booking } from '@/types';
import { EquipmentImage } from '@/components/common/EquipmentImage';
import { PaymentModal } from '@/components/bookings/PaymentModal';
import { formatDate, formatCurrency, getStatusColor } from '@/lib/utils';

interface BookingCardProps {
  booking: Booking;
  isProviderView?: boolean;
  onPaymentSuccess?: () => void;
}

export function BookingCard({ booking: initialBooking, isProviderView = false, onPaymentSuccess }: BookingCardProps) {
  const [booking, setBooking] = useState<Booking>(initialBooking);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const statusInfo = getStatusColor(booking.status);
  const isPaid = (booking as any).paymentStatus === 'PAID';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-soft hover:shadow-card transition-all flex flex-col md:flex-row gap-5 items-start justify-between">
      {/* Left Thumbnail & Info */}
      <div className="flex flex-col sm:flex-row gap-4 flex-1">
        <div className="relative w-full sm:w-36 h-28 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-100">
          <EquipmentImage
            src={booking.equipment?.imageUrl || '/equipment/ventilator.svg'}
            alt={booking.equipment?.name || 'Equipment'}
            categorySlug={booking.equipment?.category?.slug || 'ventilator'}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold font-mono text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-lg border border-teal-100">
              #{booking.bookingNumber}
            </span>

            {/* Clean, unambiguous payment status badge */}
            {isPaid ? (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Paid &amp; Confirmed ✓
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1 animate-pulse">
                <Clock className="w-3 h-3 text-amber-700" /> Payment Required
              </span>
            )}

            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}>
              {statusInfo.label}
            </span>
          </div>

          <h3 className="text-base font-bold text-slate-900 leading-tight">
            {booking.equipment?.name || 'Medical Equipment'}
          </h3>

          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Building2 className="w-3.5 h-3.5 text-teal-600" />
            <span className="font-semibold">
              {isProviderView
                ? `Rented by: ${booking.requester?.facility?.name || booking.requester?.name || 'Hospital'}`
                : `Equipment Provider: ${booking.provider?.name || 'Healthcare Facility'}`}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {formatDate(booking.startDate)} - {formatDate(booking.endDate)} ({booking.totalDays} {booking.totalDays === 1 ? 'day' : 'days'})
              </span>
            </div>

            <div className="flex items-center gap-1 text-slate-500">
              <span>Rate: {formatCurrency(booking.pricePerDay)}/day</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Total & Actions */}
      <div className="w-full md:w-auto flex md:flex-col justify-between items-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 flex-shrink-0">
        <div className="text-left md:text-right">
          <span className="text-[11px] text-slate-500 block">Total Rental Fee</span>
          <span className="text-lg font-black text-teal-700">
            {formatCurrency(booking.totalAmount)}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            {booking.totalDays} days × {formatCurrency(booking.pricePerDay)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {!isPaid && !isProviderView && (
            <button
              onClick={() => setShowPaymentModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/20 active:scale-95 transition-all"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Pay Now</span>
            </button>
          )}

          <Link
            href={`/bookings/${booking.id}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>{isPaid ? 'View Invoice & Receipt' : 'View Pass (Payment Pending)'}</span>
          </Link>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          booking={booking}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={(updated) => {
            setBooking(updated);
            setShowPaymentModal(false);
            if (onPaymentSuccess) onPaymentSuccess();
          }}
        />
      )}
    </div>
  );
}
