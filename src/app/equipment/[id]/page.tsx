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
import { formatCurrency, getStatusColor } from '@/lib/utils';
import {
  ShieldCheck,
  MapPin,
  Calendar,
  CheckCircle2,
  Truck,
  Zap,
  Clock,
  ArrowLeft,
  Building2,
  Phone,
  Mail,
  AlertCircle,
  FileCheck,
  Star,
  Layers,
  ArrowRight,
} from 'lucide-react';

export default async function EquipmentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();

  const equipment = await prisma.equipment.findUnique({
    where: { id: params.id },
    include: {
      category: true,
      provider: true,
    },
  });

  if (!equipment) {
    notFound();
  }

  const statusInfo = getStatusColor(equipment.availability);
  let accessoriesList: string[] = [];
  try {
    accessoriesList = JSON.parse(equipment.accessories || '[]');
  } catch {
    accessoriesList = [];
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header user={user as any} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Breadcrumb & Back Link */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link href="/search" className="inline-flex items-center gap-1 hover:text-teal-600 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Search Catalog
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-bold">{equipment.category?.name}</span>
          <span>/</span>
          <span className="text-slate-400 truncate max-w-xs">{equipment.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Large Image & Clinical Gallery */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-white border border-slate-200/90 shadow-soft">
              <EquipmentImage
                src={equipment.imageUrl}
                alt={equipment.name}
                categorySlug={equipment.category?.slug || 'ventilator'}
                className="w-full h-full object-cover"
                priority
              />

              {/* Status Pill Badge */}
              <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-white/95 backdrop-blur shadow-sm border border-slate-100">
                <span className={`w-2 h-2 rounded-full ${equipment.availability === 'AVAILABLE' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                <span className={statusInfo.text}>{statusInfo.label}</span>
              </div>

              {/* Distance Pill */}
              <div className="absolute bottom-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900/85 backdrop-blur text-white shadow-md">
                <MapPin className="w-4 h-4 text-teal-400" />
                <span>{equipment.distanceKm} km away from your hospital</span>
              </div>
            </div>

            {/* Description Card */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-soft space-y-3">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Clinical Description &amp; Scope</h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {equipment.description}
              </p>
            </div>

            {/* Technical Specifications Sheet */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-soft space-y-4">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Technical Specifications</h2>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block font-medium">Model / Series</span>
                  <span className="font-bold text-slate-900 text-sm mt-0.5 block">{equipment.model}</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block font-medium">Usage Type</span>
                  <span className="font-bold text-teal-700 text-sm mt-0.5 block">{equipment.usageType}</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block font-medium">Condition</span>
                  <span className="font-bold text-slate-900 text-sm mt-0.5 block">{equipment.condition}</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block font-medium">Year of Make</span>
                  <span className="font-bold text-slate-900 text-sm mt-0.5 block">{equipment.yearOfManufacture}</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block font-medium">Last Calibrated</span>
                  <span className="font-bold text-slate-900 text-sm mt-0.5 block">{equipment.lastServiceDate}</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block font-medium">Delivery</span>
                  <span className="font-bold text-emerald-700 text-sm mt-0.5 block">
                    {equipment.deliveryAvailable ? 'Express Available' : 'Facility Pickup'}
                  </span>
                </div>
              </div>

              {/* Power & Backup */}
              <div className="p-3.5 rounded-2xl bg-teal-50/50 border border-teal-100 flex items-center gap-3 text-xs">
                <Zap className="w-5 h-5 text-teal-600 flex-shrink-0" />
                <div>
                  <span className="font-bold text-teal-900">Power &amp; Backup Requirements: </span>
                  <span className="text-teal-700">{equipment.powerRequirements}</span>
                </div>
              </div>
            </div>

            {/* Included Accessories */}
            {accessoriesList.length > 0 && (
              <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-soft space-y-3">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Included Accessories &amp; Harnesses</h2>
                <div className="flex flex-wrap gap-2">
                  {accessoriesList.map((acc, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                      {acc}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Pricing, Request Action, Provider Info */}
          <div className="lg:col-span-5 space-y-6">
            {/* Request Card */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-card space-y-6 sticky top-20">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-100">
                    {equipment.category?.name}
                  </span>
                  {equipment.verified && (
                    <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      Biomedical Verified
                    </span>
                  )}
                </div>

                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                  {equipment.name}
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Located at {equipment.provider?.name} ({equipment.location})
                </p>
              </div>

              {/* Price Callout */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200/80 flex items-baseline justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-500 block">Daily Rental Rate</span>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900">
                    {formatCurrency(equipment.pricePerDay)}
                    <span className="text-xs font-normal text-slate-500 ml-1">/ day</span>
                  </div>
                </div>

                {equipment.depositAmount > 0 && (
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Refundable Deposit</span>
                    <span className="text-xs font-bold text-slate-700">
                      {formatCurrency(equipment.depositAmount)}
                    </span>
                  </div>
                )}
              </div>

              {/* Request CTA Button */}
              <Link
                href={`/equipment/${equipment.id}/request`}
                className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl text-sm font-extrabold bg-teal-600 text-white hover:bg-teal-700 shadow-elevated transition-all active:scale-95"
              >
                <span>Request Equipment</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              {/* Guarantee Points */}
              <div className="space-y-2.5 pt-4 border-t border-slate-100 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Verified biomedical calibration certificate included</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-teal-600 flex-shrink-0" />
                  <span>Express transport available within 2-4 hours</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span>Pre-tested with spare patient circuits &amp; battery</span>
                </div>
              </div>

              {/* Provider Info Card */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Equipment Provider Facility
                </h3>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-teal-600" />
                      <span className="font-bold text-slate-900 text-xs">{equipment.provider?.name}</span>
                    </div>
                    <span className="flex items-center gap-1 text-xs font-bold text-amber-600">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      {equipment.provider?.rating || 4.8}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500">
                    {equipment.provider?.type} • {equipment.provider?.tier} ({equipment.provider?.bedCapacity} Beds)
                  </p>

                  <div className="flex items-center gap-1 text-[11px] text-slate-500 pt-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{equipment.provider?.address}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <MobileNav isProvider={user?.role === 'PROVIDER'} />
    </div>
  );
}
