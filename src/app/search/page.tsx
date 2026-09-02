'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/common/Header';
import { MobileNav } from '@/components/common/MobileNav';
import { Footer } from '@/components/common/Footer';
import { EquipmentFilter } from '@/components/equipment/EquipmentFilter';
import { EquipmentGrid } from '@/components/equipment/EquipmentGrid';
import { Equipment, EquipmentCategory, User } from '@/types';
import { Search, Sparkles } from 'lucide-react';

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQ = searchParams.get('q') || '';
  const initialCategory = searchParams.get('category') || '';
  const initialAvailability = searchParams.get('availability') || 'ALL';

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [categories, setCategories] = useState<EquipmentCategory[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [searchQuery, setSearchQuery] = useState(initialQ);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [maxDistance, setMaxDistance] = useState(50);
  const [availability, setAvailability] = useState(initialAvailability);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [sortBy, setSortBy] = useState('distance');

  // Load User & Categories on mount
  useEffect(() => {
    async function loadInit() {
      try {
        const [userRes, catRes] = await Promise.all([
          fetch('/api/auth/me'),
          fetch('/api/categories'),
        ]);

        if (userRes.ok) {
          const userData = await userRes.json();
          setCurrentUser(userData.user);
        }

        if (catRes.ok) {
          const catData = await catRes.json();
          setCategories(catData.categories || []);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadInit();
  }, []);

  // Fetch Equipment based on filters
  const fetchEquipment = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set('q', searchQuery.trim());
      if (selectedCategory) params.set('category', selectedCategory);
      if (availability && availability !== 'ALL') params.set('availability', availability);
      if (maxDistance) params.set('maxDistance', maxDistance.toString());
      if (maxPrice) params.set('maxPrice', maxPrice.toString());
      if (sortBy) params.set('sortBy', sortBy);

      const res = await fetch(`/api/equipment?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setEquipment(data.equipment || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, availability, maxDistance, maxPrice, sortBy]);

  // Trigger search on filter changes with debounce for search query
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchEquipment();
    }, 200);

    return () => clearTimeout(handler);
  }, [fetchEquipment]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setMaxDistance(50);
    setAvailability('ALL');
    setMaxPrice(10000);
    setSortBy('distance');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header user={currentUser} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Search Equipment
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800">
                {equipment.length} {equipment.length === 1 ? 'result' : 'results'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Browse available medical devices across verified Tier-2, Tier-3 and regional hospitals
            </p>
          </div>
        </div>

        {/* Dynamic Filters Component */}
        <EquipmentFilter
          categories={categories}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          maxDistance={maxDistance}
          onDistanceChange={setMaxDistance}
          availability={availability}
          onAvailabilityChange={setAvailability}
          maxPrice={maxPrice}
          onPriceChange={setMaxPrice}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onReset={handleResetFilters}
          totalResults={equipment.length}
        />

        {/* Results Grid */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-700">
              {searchQuery ? `Results for "${searchQuery}"` : selectedCategory ? `Category: ${selectedCategory}` : 'Available Equipment Listings'}
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              Showing {equipment.length} medical devices
            </span>
          </div>

          <EquipmentGrid
            equipment={equipment}
            loading={loading}
            onResetFilters={handleResetFilters}
          />
        </section>
      </main>

      <Footer />
      <MobileNav isProvider={currentUser?.role === 'PROVIDER'} />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
