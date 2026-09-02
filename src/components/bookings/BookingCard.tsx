'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, Building2, CheckCircle2, ShieldCheck, FileCheck, Truck, Phone, ArrowRight } from 'lucide-react';
import { Booking } from '@/types';
import { EquipmentImage } from '@/components/common/EquipmentImage';
import { formatDate, formatCurrency, getStatusColor } from '@/lib/utils';

interface BookingCardProps {
  booking: Booking;
  isProviderView?: boolean;
}

export function BookingCard({ booking, isProviderView = false }: BookingCardProps) {
  const statusInfo = getStatusColor(booking.status);

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
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}>
              <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" />
              {statusInfo.label}
            </span>

            <span className="text-xs font-bold font-mono text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-100">
              {booking.bookingNumber}
            </span>
          </div>

          <h3 className="text-base font-bold text-slate-900 leading-tight">
            {booking.equipment?.name || 'Medical Equipment'}
          </h3>

          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Building2 className="w-3.5 h-3.5 text-teal-600" />
            <span className="font-semibold">
              {isProviderView
                ? `Rented to: ${booking.requester?.facility?.name || booking.requester?.name || 'Hospital'}`
                : `Provider: ${booking.provider?.name || 'City Hospital'}`}
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

          {booking.trackingNotes && (
            <div className="flex items-center gap-1.5 text-xs text-teal-700 bg-teal-50/70 px-3 py-1.5 rounded-xl border border-teal-100/60">
              <Truck className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="line-clamp-1">{booking.trackingNotes}</span>
            </div>
          )}
        </div>
      </div>

      {/* Right Total & Actions */}
      <div className="w-full md:w-auto flex md:flex-col justify-between items-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 flex-shrink-0">
        <div className="text-left md:text-right">
          <span className="text-[11px] text-slate-500 block">Total Rental Amount</span>
          <span className="text-lg font-extrabold text-teal-700">
            {formatCurrency(booking.totalAmount)}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            {booking.totalDays} days × {formatCurrency(booking.pricePerDay)}
          </span>
        </div>

        <Link
          href={`/bookings/${booking.id}`}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 shadow-sm transition-all"
        >
          <FileCheck className="w-3.5 h-3.5" />
          <span>View Rental Pass</span>
        </Link>
      </div>
    </div>
  );
}
