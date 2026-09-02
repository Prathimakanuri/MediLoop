'use client';

import React from 'react';
import { Search, SlidersHorizontal, RotateCcw, Check } from 'lucide-react';
import { EquipmentCategory } from '@/types';

interface EquipmentFilterProps {
  categories: EquipmentCategory[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  maxDistance: number;
  onDistanceChange: (dist: number) => void;
  availability: string;
  onAvailabilityChange: (av: string) => void;
  maxPrice: number;
  onPriceChange: (p: number) => void;
  sortBy: string;
  onSortChange: (s: string) => void;
  onReset: () => void;
  totalResults: number;
}

export function EquipmentFilter({
  categories,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  maxDistance,
  onDistanceChange,
  availability,
  onAvailabilityChange,
  maxPrice,
  onPriceChange,
  sortBy,
  onSortChange,
  onReset,
  totalResults,
}: EquipmentFilterProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-soft space-y-5">
      {/* Top Search & Reset Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search ventilator, ECG, monitor, model..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <span className="text-xs font-bold text-slate-700 bg-teal-50 border border-teal-100 px-3 py-1.5 rounded-lg whitespace-nowrap">
            {totalResults} {totalResults === 1 ? 'result' : 'results'} found
          </span>

          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div>
        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2">
          Category
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onCategoryChange('')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedCategory === ''
                ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/20'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.slug)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === cat.slug
                  ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Filter Row (Distance, Availability, Max Price, Sort) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-3 border-t border-slate-100 text-xs">
        {/* Max Distance */}
        <div>
          <div className="flex justify-between items-center mb-1.5 font-semibold text-slate-700">
            <span>Max Distance:</span>
            <span className="text-teal-600 font-bold">{maxDistance} km</span>
          </div>
          <input
            type="range"
            min={1}
            max={50}
            step={1}
            value={maxDistance}
            onChange={(e) => onDistanceChange(Number(e.target.value))}
            className="w-full accent-teal-600 cursor-pointer"
          />
        </div>

        {/* Max Daily Rate */}
        <div>
          <div className="flex justify-between items-center mb-1.5 font-semibold text-slate-700">
            <span>Max Price / Day:</span>
            <span className="text-teal-600 font-bold">₹{maxPrice.toLocaleString('en-IN')}</span>
          </div>
          <input
            type="range"
            min={500}
            max={10000}
            step={500}
            value={maxPrice}
            onChange={(e) => onPriceChange(Number(e.target.value))}
            className="w-full accent-teal-600 cursor-pointer"
          />
        </div>

        {/* Availability Filter */}
        <div>
          <label className="font-semibold text-slate-700 block mb-1.5">Availability Status</label>
          <select
            value={availability}
            onChange={(e) => onAvailabilityChange(e.target.value)}
            className="w-full p-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          >
            <option value="ALL">All Equipment</option>
            <option value="AVAILABLE">Available Now Only</option>
            <option value="IN_USE">In Use</option>
          </select>
        </div>

        {/* Sort By */}
        <div>
          <label className="font-semibold text-slate-700 block mb-1.5">Sort Results</label>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="w-full p-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          >
            <option value="distance">Nearest First (Distance)</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
            <option value="newest">Recently Listed</option>
          </select>
        </div>
      </div>
    </div>
  );
}
