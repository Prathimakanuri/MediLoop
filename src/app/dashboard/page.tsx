import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

import { Header } from '@/components/common/Header';
import { MobileNav } from '@/components/common/MobileNav';
import { Footer } from '@/components/common/Footer';
import { EquipmentCard } from '@/components/equipment/EquipmentCard';
import { CategoryIcon } from '@/components/common/EquipmentImage';
import {
  Search,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  FileText,
  CalendarCheck,
  Zap,
  PhoneCall,
  MapPin,
  Building2,
  Stethoscope,
} from 'lucide-react';
import { Equipment, EquipmentCategory } from '@/types';

export default async function DashboardPage() {
  const user = await getCurrentUser();

  // If not logged in, redirect to login page
  if (!user) {
    redirect('/login');
  }

  const isProvider = user.role === 'PROVIDER';
  const facilityName = user.facility?.name || user.name;

  // Fetch categories with equipment counts
  const rawCategories = await prisma.equipmentCategory.findMany({
    include: {
      _count: {
        select: { equipment: true },
      },
    },
    orderBy: { name: 'asc' },
  });

  // Fetch nearby available equipment for the marketplace
  const rawEquipment = await prisma.equipment.findMany({
    where: { availability: 'AVAILABLE' },
    take: 6,
    orderBy: { distanceKm: 'asc' },
    include: {
      category: true,
      provider: true,
    },
  });

  // Fetch user active requests count strictly for THIS user
  const pendingRequestsCount = await prisma.equipmentRequest.count({
    where: {
      requesterId: user.id,
      status: 'PENDING',
    },
  });

  // Fetch active bookings count strictly for THIS user
  const activeBookingsCount = await prisma.booking.count({
    where: {
      requesterId: user.id,
    },
  });

  const categories = rawCategories as unknown as EquipmentCategory[];
  const equipment = rawEquipment as unknown as Equipment[];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header user={user as any} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        {/* Top Welcome Banner & Greeting */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-700 via-teal-800 to-slate-900 text-white p-6 sm:p-8 shadow-elevated">
          {/* Subtle background decorative shapes */}
          <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-teal-500/20 blur-2xl pointer-events-none" />
          <div className="absolute right-1/3 -top-12 w-48 h-48 rounded-full bg-emerald-400/15 blur-xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-600/60 backdrop-blur border border-teal-400/30 text-teal-100 mb-3">
              <Building2 className="w-3.5 h-3.5" />
              <span>{user.facility?.tier || 'Hospital'} • {user.facility?.type || 'Healthcare Facility'}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Hello, {facilityName} 👋
            </h1>

            <p className="text-sm text-teal-100/90 mt-1.5 leading-relaxed">
              Find and request verified medical equipment from partner facilities within minutes.
            </p>

            {/* Main Integrated Quick Search Bar */}
            <form action="/search" method="GET" className="mt-5 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  name="q"
                  placeholder="Search medical equipment (Ventilator, ECG, Monitor, Defibrillator)..."
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white text-slate-900 text-xs sm:text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 shadow-md"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center gap-1.5"
              >
                <span>Search</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <Link
            href="/search"
            className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-soft hover:shadow-card hover:border-teal-300 transition-all group flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-colors">
              <Search className="w-5 h-5" />
            </div>
            <div className="mt-3">
              <h4 className="text-xs font-bold text-slate-900">Browse Equipment</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Explore full catalog</p>
            </div>
          </Link>

          <Link
            href="/requests"
            className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-soft hover:shadow-card hover:border-teal-300 transition-all group flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <FileText className="w-5 h-5" />
            </div>
            <div className="mt-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900">My Requests</h4>
                {pendingRequestsCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800">
                    {pendingRequestsCount}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {pendingRequestsCount > 0 ? `${pendingRequestsCount} pending approval` : 'Track approvals'}
              </p>
            </div>
          </Link>

          <Link
            href="/bookings"
            className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-soft hover:shadow-card hover:border-teal-300 transition-all group flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div className="mt-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900">My Bookings</h4>
                {activeBookingsCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                    {activeBookingsCount}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">Rental passes &amp; receipts</p>
            </div>
          </Link>

          <Link
            href="/search?availability=AVAILABLE"
            className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-soft hover:shadow-card hover:border-teal-300 transition-all group flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-colors">
              <Zap className="w-5 h-5" />
            </div>
            <div className="mt-3">
              <h4 className="text-xs font-bold text-slate-900">Emergency Dispatch</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Available now in 2h</p>
            </div>
          </Link>
        </div>

        {/* Equipment Categories Carousel */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Equipment Categories</h2>
              <p className="text-xs text-slate-500">Select a clinical category to view available machines</p>
            </div>
            <Link
              href="/search"
              className="text-xs font-bold text-teal-600 hover:text-teal-800 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {categories.slice(0, 10).map((cat) => (
              <Link
                key={cat.id}
                href={`/search?category=${cat.slug}`}
                className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-soft hover:shadow-card hover:border-teal-400 hover:bg-teal-50/30 transition-all flex items-center gap-3 group"
              >
                <div className="p-2.5 rounded-xl bg-teal-50 text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors flex-shrink-0">
                  <CategoryIcon slug={cat.slug} className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-800 truncate">{cat.name}</h4>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {cat._count?.equipment || 0} units
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Nearby Equipment Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-teal-600" />
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">Nearby Medical Equipment</h2>
                <p className="text-xs text-slate-500">Verified equipment available within 10 km of your facility</p>
              </div>
            </div>

            <Link
              href="/search"
              className="text-xs font-bold text-teal-600 hover:text-teal-800 flex items-center gap-1"
            >
              <span>See All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Grid of Equipment Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {equipment.map((item) => (
              <EquipmentCard key={item.id} equipment={item} />
            ))}
          </div>
        </section>

        {/* Emergency ICU Surge Banner */}
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-teal-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-start gap-3.5 text-center sm:text-left">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm mx-auto sm:mx-0">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Facing an ICU Surge or Sudden Breakdown?</h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Our 24/7 clinical logistics coordinator can assist with rapid transport for ventilators, monitors, and defibrillators.
              </p>
            </div>
          </div>

          <Link
            href="/search?availability=AVAILABLE"
            className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm whitespace-nowrap"
          >
            Find Instant Equipment
          </Link>
        </div>
      </main>

      <Footer />
      <MobileNav isProvider={isProvider} />
    </div>
  );
}
