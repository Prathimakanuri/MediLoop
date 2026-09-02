'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Heart, MapPin, ShieldCheck, CheckCircle2, AlertCircle, ArrowRight, Clock } from 'lucide-react';
import { Equipment } from '@/types';
import { EquipmentImage } from '@/components/common/EquipmentImage';
import { formatCurrency, getStatusColor } from '@/lib/utils';

interface EquipmentCardProps {
  equipment: Equipment;
}

export function EquipmentCard({ equipment }: EquipmentCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const statusInfo = getStatusColor(equipment.availability);

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/90 shadow-soft hover:shadow-card transition-all duration-300 flex flex-col overflow-hidden">
      {/* Top Image Container */}
      <div className="relative aspect-[4/3] w-full bg-slate-100 overflow-hidden">
        <EquipmentImage
          src={equipment.imageUrl}
          alt={equipment.name}
          categorySlug={equipment.category?.slug || 'ventilator'}
          className="w-full h-full"
        />

        {/* Status Pill Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/95 backdrop-blur shadow-sm border border-slate-100">
          <span className={`w-2 h-2 rounded-full ${equipment.availability === 'AVAILABLE' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
          <span className={statusInfo.text}>{statusInfo.label}</span>
        </div>

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            setIsFavorite(!isFavorite);
          }}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur text-slate-400 hover:text-rose-500 hover:bg-white shadow-sm transition-all"
          aria-label="Save to favorites"
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>

        {/* Distance Pill */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-900/80 backdrop-blur text-white shadow-sm">
          <MapPin className="w-3.5 h-3.5 text-teal-400" />
          <span>{equipment.distanceKm} km away</span>
        </div>
      </div>

      {/* Content Details */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Verified Tag */}
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100">
              {equipment.category?.name || 'Medical Equipment'}
            </span>
            {equipment.verified && (
              <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Verified
              </span>
            )}
          </div>

          {/* Title & Model */}
          <Link href={`/equipment/${equipment.id}`} className="block group-hover:text-teal-600 transition-colors">
            <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-1">
              {equipment.name}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
              Model: {equipment.model} • {equipment.condition}
            </p>
          </Link>

          {/* Provider Hospital */}
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span className="truncate font-medium text-slate-700">
              {equipment.provider?.name || 'Healthcare Facility'}
            </span>
            <span className="text-[11px] text-slate-400 whitespace-nowrap">
              {equipment.location.split(',')[0]}
            </span>
          </div>
        </div>

        {/* Price & Action Button */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
          <div>
            <span className="text-[11px] text-slate-500 block">Daily Rental</span>
            <span className="text-base font-extrabold text-slate-900">
              {formatCurrency(equipment.pricePerDay)}
              <span className="text-xs font-normal text-slate-500">/day</span>
            </span>
          </div>

          <Link
            href={`/equipment/${equipment.id}`}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-teal-600 text-white hover:bg-teal-700 shadow-sm shadow-teal-600/20 active:scale-95 transition-all"
          >
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
