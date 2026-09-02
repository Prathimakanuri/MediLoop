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
  CheckCircle2,
  Clock,
  Building2,
  Calendar,
  FileText,
  Search,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export default async function RequestSentPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();

  const request = await prisma.equipmentRequest.findUnique({
    where: { id: params.id },
    include: {
      equipment: {
        include: { category: true },
      },
      provider: true,
      requester: {
        include: { facility: true },
      },
    },
  });

  if (!request) {
    notFound();
  }

  const statusInfo = getStatusColor(request.status);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header user={user as any} />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-16 flex flex-col items-center justify-center text-center">
        {/* Animated Green Checkmark Header */}
        <div className="w-20 h-20 rounded-3xl bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center shadow-elevated mb-6 animate-bounce">
          <CheckCircle2 className="w-10 h-10 text-teal-600" />
        </div>

        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Request Sent Successfully!
        </h1>

        <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto leading-relaxed">
          <strong className="text-slate-800">{request.provider.name}</strong> will review your requirement and get back to you shortly.
        </p>

        {/* Request Details Breakdown Card */}
        <div className="mt-8 w-full bg-white rounded-3xl border border-slate-200/90 p-6 shadow-card text-left space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Request Details
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}>
              <Clock className="w-3.5 h-3.5 inline mr-1" />
              {statusInfo.label}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-100">
              <EquipmentImage
                src={request.equipment.imageUrl}
                alt={request.equipment.name}
                categorySlug={request.equipment.category?.slug || 'ventilator'}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-100">
                {request.equipment.category?.name}
              </span>
              <h3 className="font-bold text-slate-900 text-base mt-1 leading-tight">
                {request.equipment.name}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Model: {request.equipment.model}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-teal-600" />
              <span>Provider: <strong>{request.provider.name}</strong></span>
            </div>

            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-teal-600" />
              <span>Duration: <strong>{formatDate(request.startDate)} - {formatDate(request.endDate)}</strong> ({request.totalDays} days)</span>
            </div>

            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>Purpose: <strong>{request.purpose}</strong></span>
            </div>

            <div className="flex items-center gap-1.5">
              <span>Estimated Cost: <strong className="text-teal-700 text-sm font-black">{formatCurrency(request.estimatedCost)}</strong></span>
            </div>
          </div>

          {request.message && (
            <div className="pt-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100 italic text-slate-600">
              Note: &ldquo;{request.message}&rdquo;
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3 w-full justify-center">
          <Link
            href="/requests"
            className="flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl text-sm font-bold bg-teal-600 text-white hover:bg-teal-700 shadow-md shadow-teal-600/20 transition-all active:scale-95"
          >
            <FileText className="w-4 h-4" />
            <span>Go to My Requests</span>
          </Link>

          <Link
            href="/search"
            className="flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl text-sm font-bold bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-sm transition-all"
          >
            <Search className="w-4 h-4" />
            <span>Browse More Equipment</span>
          </Link>
        </div>
      </main>

      <Footer />
      <MobileNav isProvider={user?.role === 'PROVIDER'} />
    </div>
  );
}
