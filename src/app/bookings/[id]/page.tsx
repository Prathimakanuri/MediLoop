import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';
import { Header } from '@/components/common/Header';
import { MobileNav } from '@/components/common/MobileNav';
import { Footer } from '@/components/common/Footer';
import { EquipmentImage } from '@/components/common/EquipmentImage';
import { formatDate, formatCurrency, getStatusColor } from '@/lib/utils';
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  FileText,
  Printer,
  ShieldCheck,
  Truck,
  Phone,
  QrCode,
  HeartPulse,
} from 'lucide-react';

export default async function SingleBookingPassPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();

  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
    include: {
      equipment: {
        include: { category: true, provider: true },
      },
      provider: true,
      requester: {
        include: { facility: true },
      },
      request: true,
    },
  });

  if (!booking) {
    notFound();
  }

  const statusInfo = getStatusColor(booking.status);

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      <Header user={user as any} />

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
        </div>

        {/* Official Printable Medical Equipment Rental Pass */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card overflow-hidden">
          {/* Top Header Strip */}
          <div className="bg-teal-700 text-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white text-teal-700 flex items-center justify-center font-black shadow-md">
                <HeartPulse className="w-7 h-7" />
              </div>
              <div>
                <span className="font-black text-xl tracking-tight">MEDI<span className="text-teal-200">LOOP</span></span>
                <p className="text-[10px] uppercase font-bold text-teal-100 tracking-wider">
                  Official Healthcare Rental Pass &amp; Delivery Pass
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[10px] uppercase tracking-wider text-teal-200 block font-semibold">
                Pass Number
              </span>
              <span className="font-mono text-lg font-black text-white">
                {booking.bookingNumber}
              </span>
            </div>
          </div>

          {/* Pass Body Content */}
          <div className="p-6 sm:p-8 space-y-6">
            {/* Status & Validation Badge */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-teal-50 border border-teal-200 text-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-teal-600 flex-shrink-0" />
                <div>
                  <span className="font-bold text-teal-900 block">Biomedical Safety &amp; Legal Authorization Active</span>
                  <span className="text-[11px] text-teal-700">Calibrated for clinical operation • Insured under Mediloop Transit Guarantee</span>
                </div>
              </div>

              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}>
                {statusInfo.label}
              </span>
            </div>

            {/* Equipment Spotlight */}
            <div className="flex flex-col sm:flex-row gap-5 items-start">
              <div className="w-full sm:w-48 h-36 rounded-2xl overflow-hidden bg-slate-100 border border-slate-100 flex-shrink-0">
                <EquipmentImage
                  src={booking.equipment.imageUrl}
                  alt={booking.equipment.name}
                  categorySlug={booking.equipment.category?.slug || 'ventilator'}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-100">
                  {booking.equipment.category?.name}
                </span>
                <h2 className="text-xl font-black text-slate-900 leading-tight">
                  {booking.equipment.name}
                </h2>
                <p className="text-xs text-slate-500">
                  Model: {booking.equipment.model} • Condition: {booking.equipment.condition}
                </p>
                <p className="text-xs text-slate-600 line-clamp-2 pt-1">
                  {booking.equipment.description}
                </p>
              </div>
            </div>

            {/* Facility Parties Involved Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              {/* Provider Facility */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Equipment Provider
                </span>
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-teal-600" />
                  <span className="font-bold text-slate-900 text-xs">{booking.provider.name}</span>
                </div>
                <p className="text-[11px] text-slate-500">{booking.provider.address}</p>
                <div className="flex items-center gap-1 text-[11px] text-teal-700 font-semibold pt-1">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{booking.provider.contactPhone}</span>
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
                    {booking.requester.facility?.name || booking.requester.name}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  {booking.requester.facility?.address || booking.deliveryAddress || 'Civil Lines'}
                </p>
                <div className="flex items-center gap-1 text-[11px] text-teal-700 font-semibold pt-1">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{booking.requester.facility?.contactPhone || '+91 91580 11223'}</span>
                </div>
              </div>
            </div>

            {/* Dates & Billing Breakdown */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Rental Period</span>
                  <span className="font-bold text-slate-900 text-xs sm:text-sm mt-0.5 block">
                    {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block font-medium">Total Days</span>
                  <span className="font-bold text-slate-900 text-xs sm:text-sm mt-0.5 block">
                    {booking.totalDays} {booking.totalDays === 1 ? 'day' : 'days'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block font-medium">Daily Rate</span>
                  <span className="font-bold text-slate-900 text-xs sm:text-sm mt-0.5 block">
                    {formatCurrency(booking.pricePerDay)} / day
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block font-medium">Total Rental Amount</span>
                  <span className="font-black text-teal-700 text-sm sm:text-base mt-0.5 block">
                    {formatCurrency(booking.totalAmount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Logistics & Tracking Notes */}
            {booking.trackingNotes && (
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-blue-50 border border-blue-100 text-xs text-blue-900">
                <Truck className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <div>
                  <span className="font-bold block">Logistics Status:</span>
                  <p className="text-blue-700 text-[11px] mt-0.5">{booking.trackingNotes}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
      <MobileNav isProvider={user?.role === 'PROVIDER'} />
    </div>
  );
}
