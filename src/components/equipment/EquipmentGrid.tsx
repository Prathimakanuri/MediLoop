'use client';

import React from 'react';
import { Equipment } from '@/types';
import { EquipmentCard } from './EquipmentCard';
import { Stethoscope, RotateCcw } from 'lucide-react';

interface EquipmentGridProps {
  equipment: Equipment[];
  loading?: boolean;
  onResetFilters?: () => void;
}

export function EquipmentGrid({ equipment, loading = false, onResetFilters }: EquipmentGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 animate-pulse space-y-4">
            <div className="w-full aspect-[4/3] bg-slate-200 rounded-xl" />
            <div className="h-4 bg-slate-200 rounded w-1/3" />
            <div className="h-6 bg-slate-200 rounded w-3/4" />
            <div className="h-4 bg-slate-200 rounded w-1/2" />
            <div className="h-10 bg-slate-100 rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  if (equipment.length === 0) {
    return (
      <div className="text-center py-16 px-4 bg-white rounded-3xl border border-slate-200/80 shadow-soft max-w-xl mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-4 border border-teal-100">
          <Stethoscope className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-800">No medical equipment found</h3>
        <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
          We couldn&apos;t find any equipment matching your active search and filter criteria.
        </p>
        {onResetFilters && (
          <button
            onClick={onResetFilters}
            className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 text-white hover:bg-teal-700 shadow-sm transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset All Filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {equipment.map((item) => (
        <EquipmentCard key={item.id} equipment={item} />
      ))}
    </div>
  );
}
