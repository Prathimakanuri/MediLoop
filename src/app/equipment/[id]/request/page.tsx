'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { Header } from '@/components/common/Header';
import { MobileNav } from '@/components/common/MobileNav';
import { Footer } from '@/components/common/Footer';
import { EquipmentImage } from '@/components/common/EquipmentImage';
import { Equipment, User } from '@/types';
import { formatCurrency, calculateDays } from '@/lib/utils';
import {
  ArrowLeft,
  Calendar,
  Building2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Send,
  Sparkles,
  Info,
  CheckCircle2,
} from 'lucide-react';

export default function RequestEquipmentPage() {
  const router = useRouter();
  const params = useParams();
  const equipmentId = params.id as string;

  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Default to tomorrow and 4 days later
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultStart = tomorrow.toISOString().split('T')[0];

  const fourDaysLater = new Date();
  fourDaysLater.setDate(fourDaysLater.getDate() + 4);
  const defaultEnd = fourDaysLater.toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(defaultEnd);
  const [purpose, setPurpose] = useState('ICU Support');
  const [urgency, setUrgency] = useState<'CRITICAL_EMERGENCY' | 'HIGH' | 'STANDARD'>('STANDARD');
  const [message, setMessage] = useState('');

  // Fetch equipment and user
  useEffect(() => {
    async function loadData() {
      try {
        const [eqRes, userRes] = await Promise.all([
          fetch(`/api/equipment/${equipmentId}`),
          fetch('/api/auth/me'),
        ]);

        if (eqRes.ok) {
          const eqData = await eqRes.json();
          setEquipment(eqData.equipment);
        }
        if (userRes.ok) {
          const uData = await userRes.json();
          setCurrentUser(uData.user);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [equipmentId]);

  const daysCount = calculateDays(startDate, endDate);
  const estimatedTotal = equipment ? daysCount * equipment.pricePerDay : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!startDate || !endDate) {
      setError('Please select both rental start and end dates.');
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start < today) {
      setError('Start date cannot be in the past.');
      return;
    }

    if (end < start) {
      setError('End date must be on or after the start date.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          equipmentId,
          startDate,
          endDate,
          totalDays: daysCount,
          estimatedCost: estimatedTotal,
          purpose,
          urgency,
          message: message.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to submit request.');
        setSubmitting(false);
        return;
      }

      // Redirect to Confirmation Screen 8
      router.push(`/request-sent/${data.request.id}`);
    } catch (err) {
      setError('Network error occurred. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!equipment) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <h2 className="text-lg font-bold text-slate-900">Equipment Not Found</h2>
        <Link href="/search" className="mt-4 text-teal-600 font-bold text-sm">
          Return to Catalog
        </Link>
      </div>
    );
  }

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header user={currentUser} />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Breadcrumb Back Link */}
        <Link
          href={`/equipment/${equipment.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-teal-600 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to {equipment.name}
        </Link>

        {/* Page Title */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Request Medical Equipment
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Submit your rental requirement to {equipment.provider?.name} for prompt verification and dispatch.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Left: Request Form */}
          <div className="md:col-span-7 bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-card">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Date Selection Range */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Rental Start Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      min={todayStr}
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-slate-50/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Rental End Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      min={startDate || todayStr}
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-slate-50/50"
                    />
                  </div>
                </div>
              </div>

              {/* Clinical Purpose Dropdown */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Clinical Purpose / Requirement
                </label>
                <select
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                >
                  <option value="ICU Support">ICU Support / Critical Care Surge</option>
                  <option value="Emergency Care">Emergency Care / Trauma Response</option>
                  <option value="Patient Surge">Seasonal Patient Influx / Epidemic</option>
                  <option value="Equipment Breakdown">Equipment Breakdown Replacement</option>
                  <option value="Temporary Requirement">Temporary Procedure / OT Requirement</option>
                  <option value="Other">Other Clinical Need</option>
                </select>
              </div>

              {/* Urgency Level */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Urgency Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setUrgency('STANDARD')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                      urgency === 'STANDARD'
                        ? 'bg-teal-50 border-teal-500 text-teal-800'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Standard
                  </button>
                  <button
                    type="button"
                    onClick={() => setUrgency('HIGH')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                      urgency === 'HIGH'
                        ? 'bg-amber-50 border-amber-500 text-amber-800'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    High Priority
                  </button>
                  <button
                    type="button"
                    onClick={() => setUrgency('CRITICAL_EMERGENCY')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                      urgency === 'CRITICAL_EMERGENCY'
                        ? 'bg-rose-50 border-rose-500 text-rose-800 animate-pulse'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Emergency 🚨
                  </button>
                </div>
              </div>

              {/* Optional Message / Instructions */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Message / Special Clinical Requirements (Optional)
                </label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="e.g. Please include pediatric masks and adult dual-limb circuits if possible."
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs sm:text-sm bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl text-sm font-extrabold bg-teal-600 text-white hover:bg-teal-700 shadow-elevated active:scale-95 transition-all disabled:opacity-60"
              >
                {submitting ? (
                  <span>Transmitting Request...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Equipment Request</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right: Equipment Summary & Cost Breakdown Card */}
          <div className="md:col-span-5 space-y-4">
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-soft space-y-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Equipment Summary
              </h3>

              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-100">
                  <EquipmentImage
                    src={equipment.imageUrl}
                    alt={equipment.name}
                    categorySlug={equipment.category?.slug || 'ventilator'}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm leading-tight">{equipment.name}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{equipment.model}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-teal-600" />
                    Provider Facility:
                  </span>
                  <span className="font-bold text-slate-800">{equipment.provider?.name}</span>
                </div>

                <div className="flex items-center justify-between text-slate-600">
                  <span>Daily Rate:</span>
                  <span className="font-bold text-slate-800">{formatCurrency(equipment.pricePerDay)} / day</span>
                </div>

                <div className="flex items-center justify-between text-slate-600">
                  <span>Rental Duration:</span>
                  <span className="font-bold text-teal-700">{daysCount} {daysCount === 1 ? 'day' : 'days'}</span>
                </div>
              </div>

              {/* Cost Calculation Callout */}
              <div className="pt-3 border-t border-slate-100 p-3 rounded-2xl bg-teal-50/70 border border-teal-100">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-semibold text-slate-700">Estimated Total:</span>
                  <span className="text-xl font-black text-teal-800">
                    {formatCurrency(estimatedTotal)}
                  </span>
                </div>
                <span className="text-[10px] text-teal-600 block mt-0.5">
                  ({daysCount} days × {formatCurrency(equipment.pricePerDay)})
                </span>
              </div>

              <div className="flex items-start gap-2 text-[11px] text-slate-500 pt-2">
                <Info className="w-3.5 h-3.5 text-teal-600 flex-shrink-0 mt-0.5" />
                <span>
                  No immediate payment required. Billing occurs after provider confirmation and delivery.
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <MobileNav isProvider={currentUser?.role === 'PROVIDER'} />
    </div>
  );
}
