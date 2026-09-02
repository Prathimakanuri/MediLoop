import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';
import { Header } from '@/components/common/Header';
import { MobileNav } from '@/components/common/MobileNav';
import { Footer } from '@/components/common/Footer';
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  FileText,
  CalendarCheck,
  Layers,
  Bell,
  LogOut,
  ArrowLeftRight,
  Sparkles,
  Bed,
} from 'lucide-react';

export default async function ProfilePage() {
  const user = await getCurrentUser();

  const isProvider = user?.role === 'PROVIDER';
  const facility = user?.facility;

  // Requests and bookings stats
  const requestsCount = await prisma.equipmentRequest.count({
    where: { requesterId: user?.id || 'usr_customer_demo' },
  });

  const bookingsCount = await prisma.booking.count({
    where: { requesterId: user?.id || 'usr_customer_demo' },
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header user={user as any} />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Profile Card Header */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-extrabold text-2xl shadow-elevated">
              {facility?.name?.slice(0, 2).toUpperCase() || 'CC'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                  {facility?.name || 'City Care Hospital'}
                </h1>
                {facility?.verified && (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Verified Facility
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {facility?.type || 'Primary & Secondary Care Hospital'} • {facility?.tier || 'Tier-3'} Region
              </p>
            </div>
          </div>
        </div>

        {/* Facility Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Facility Contact Info Card */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-soft space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Facility Information
            </h2>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block font-medium">Registered Address:</span>
                  <span className="font-semibold text-slate-800">{facility?.address || 'Civil Lines, Yavatmal, Maharashtra - 445001'}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block font-medium">Emergency Contact:</span>
                  <span className="font-semibold text-slate-800">{facility?.contactPhone || '+91 91580 11223'}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block font-medium">Official Dispatch Email:</span>
                  <span className="font-semibold text-slate-800">{facility?.contactEmail || 'director@citycarehospital.in'}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Bed className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block font-medium">Capacity &amp; Rating:</span>
                  <span className="font-semibold text-slate-800">{facility?.bedCapacity || 60} Inpatient Beds • ★ {facility?.rating || 4.6} / 5.0</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Navigation Card */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-soft space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Equipment Activity
            </h2>

            <div className="space-y-2">
              <Link
                href="/requests"
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-teal-50/50 hover:border-teal-200 border border-slate-100 transition-all text-xs font-bold text-slate-800"
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-teal-600" />
                  <span>My Equipment Requests</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px]">
                  {requestsCount} requests
                </span>
              </Link>

              <Link
                href="/bookings"
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-teal-50/50 hover:border-teal-200 border border-slate-100 transition-all text-xs font-bold text-slate-800"
              >
                <div className="flex items-center gap-2.5">
                  <CalendarCheck className="w-4 h-4 text-teal-600" />
                  <span>Confirmed Bookings</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px]">
                  {bookingsCount} bookings
                </span>
              </Link>

              <Link
                href="/provider"
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-blue-50/50 hover:border-blue-200 border border-slate-100 transition-all text-xs font-bold text-slate-800"
              >
                <div className="flex items-center gap-2.5">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <span>Equipment Provider Hub</span>
                </div>
                <span className="text-[10px] text-blue-700 font-bold">
                  Manage Listings →
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* Demo Switcher Help Box */}
        <div className="p-5 rounded-3xl bg-teal-50/70 border border-teal-200 text-xs text-teal-900 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Need to test Provider Acceptance Workflow?</span>
              <p className="text-teal-700 text-[11px] mt-0.5">
                Use the &ldquo;Simulating&rdquo; dropdown in the top header or click below to switch to City Hospital (Equipment Provider).
              </p>
            </div>
          </div>

          <Link
            href="/provider"
            className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs whitespace-nowrap shadow-sm"
          >
            Open Provider Hub
          </Link>
        </div>
      </main>

      <Footer />
      <MobileNav isProvider={isProvider} />
    </div>
  );
}
