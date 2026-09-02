'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, Building2, Clock, CheckCircle2, XCircle, AlertCircle, ArrowRight, ShieldCheck, CreditCard } from 'lucide-react';
import { EquipmentRequest, Booking } from '@/types';
import { EquipmentImage } from '@/components/common/EquipmentImage';
import { formatDate, formatCurrency, getStatusColor } from '@/lib/utils';

interface RequestCardProps {
  request: EquipmentRequest;
  onCancel?: (id: string) => void;
  isProviderView?: boolean;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  onPayNow?: (booking: Booking) => void;
}

export function RequestCard({
  request,
  onCancel,
  isProviderView = false,
  onAccept,
  onReject,
  onPayNow,
}: RequestCardProps) {
  const statusInfo = getStatusColor(request.status);
  const isAccepted = request.status === 'ACCEPTED';
  const isPending = request.status === 'PENDING';
  const isRejected = request.status === 'REJECTED';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-soft hover:shadow-card transition-all flex flex-col md:flex-row gap-5 items-start justify-between">
      {/* Left: Thumbnail & Main Info */}
      <div className="flex flex-col sm:flex-row gap-4 flex-1">
        <div className="relative w-full sm:w-36 h-28 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-100">
          <EquipmentImage
            src={request.equipment?.imageUrl || '/equipment/ventilator.svg'}
            alt={request.equipment?.name || 'Equipment'}
            categorySlug={request.equipment?.category?.slug || 'ventilator'}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}>
              {statusInfo.label}
            </span>

            {isAccepted && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1 animate-pulse">
                <Clock className="w-3 h-3 text-amber-700" /> Payment Required (Unpaid)
              </span>
            )}

            {request.urgency === 'CRITICAL_EMERGENCY' && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-rose-100 text-rose-800 animate-pulse">
                CRITICAL EMERGENCY
              </span>
            )}

            <span className="text-xs font-medium text-slate-500">
              ID: #{request.id.slice(-6).toUpperCase()}
            </span>
          </div>

          <Link href={`/equipment/${request.equipmentId}`} className="block hover:text-teal-600 transition-colors">
            <h3 className="text-base font-bold text-slate-900 leading-tight">
              {request.equipment?.name || 'Medical Equipment'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Model: {request.equipment?.model}
            </p>
          </Link>

          {/* Facility Info */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Building2 className="w-3.5 h-3.5 text-teal-600" />
            <span className="font-semibold">
              {isProviderView
                ? `Requester: ${request.requester?.facility?.name || request.requester?.name || 'Hospital'}`
                : `Provider: ${request.provider?.name || 'Healthcare Facility'}`}
            </span>
          </div>

          {/* Rental Duration & Purpose */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {formatDate(request.startDate)} - {formatDate(request.endDate)} ({request.totalDays} {request.totalDays === 1 ? 'day' : 'days'})
              </span>
            </div>

            <div className="flex items-center gap-1">
              <span className="font-semibold text-slate-700">Purpose:</span>
              <span className="px-2 py-0.5 rounded bg-slate-100 font-medium text-slate-800">
                {request.purpose}
              </span>
            </div>
          </div>

          {/* Optional Message */}
          {request.message && (
            <p className="text-xs bg-slate-50 p-2.5 rounded-xl text-slate-600 italic border border-slate-100">
              &ldquo;{request.message}&rdquo;
            </p>
          )}
        </div>
      </div>

      {/* Right: Cost & Action Controls */}
      <div className="w-full md:w-auto flex md:flex-col justify-between items-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 flex-shrink-0">
        <div className="text-left md:text-right">
          <span className="text-[11px] text-slate-500 block">Estimated Cost</span>
          <span className="text-base font-extrabold text-slate-900">
            {formatCurrency(request.estimatedCost)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Provider side Actions */}
          {isProviderView && isPending && onAccept && onReject && (
            <>
              <button
                onClick={() => onAccept(request.id)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition-all"
              >
                Accept Request
              </button>
              <button
                onClick={() => onReject(request.id)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-all"
              >
                Decline
              </button>
            </>
          )}

          {/* Requester Side Actions */}
          {!isProviderView && isAccepted && (
            onPayNow && request.booking ? (
              <button
                onClick={() => onPayNow(request.booking!)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold bg-teal-600 text-white hover:bg-teal-700 shadow-md shadow-teal-600/20 active:scale-95 transition-all"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Pay Now ({formatCurrency(request.estimatedCost)})</span>
              </button>
            ) : (
              <Link
                href={request.booking ? `/bookings/${request.booking.id}` : "/bookings"}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold bg-teal-600 text-white hover:bg-teal-700 shadow-md shadow-teal-600/20 active:scale-95 transition-all"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Pay Now ({formatCurrency(request.estimatedCost)})</span>
              </Link>
            )
          )}

          {!isProviderView && isPending && onCancel && (
            <button
              onClick={() => onCancel(request.id)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
            >
              Cancel Request
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
