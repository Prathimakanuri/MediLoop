'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/common/Header';
import { MobileNav } from '@/components/common/MobileNav';
import { Footer } from '@/components/common/Footer';
import { EquipmentImage } from '@/components/common/EquipmentImage';
import { Equipment, EquipmentCategory, EquipmentRequest, Booking, User } from '@/types';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import {
  ShieldCheck,
  PlusCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  Building2,
  TrendingUp,
  Layers,
  CalendarCheck,
  AlertCircle,
  RotateCcw,
  Sparkles,
  Zap,
} from 'lucide-react';

export default function ProviderDashboardPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [categories, setCategories] = useState<EquipmentCategory[]>([]);
  const [listedEquipment, setListedEquipment] = useState<Equipment[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<EquipmentRequest[]>([]);
  const [providerBookings, setProviderBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Add Equipment Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEquipmentForm, setNewEquipmentForm] = useState({
    name: '',
    model: '',
    categoryId: '',
    description: '',
    pricePerDay: '1500',
    depositAmount: '4500',
    condition: 'Excellent',
    yearOfManufacture: '2023',
    usageType: 'ICU Support',
    powerRequirements: '220V AC, Battery Backup 4h',
  });

  const loadProviderData = async () => {
    setLoading(true);
    try {
      const [uRes, catRes, reqRes, bRes, eqRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/categories'),
        fetch('/api/requests?view=provider'),
        fetch('/api/bookings?view=provider'),
        fetch('/api/equipment'),
      ]);

      if (uRes.ok) {
        const uData = await uRes.json();
        setCurrentUser(uData.user);
      }

      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData.categories || []);
        if (catData.categories?.length > 0 && !newEquipmentForm.categoryId) {
          setNewEquipmentForm(prev => ({ ...prev, categoryId: catData.categories[0].id }));
        }
      }

      if (reqRes.ok) {
        const reqData = await reqRes.json();
        setIncomingRequests(reqData.requests || []);
      }

      if (bRes.ok) {
        const bData = await bRes.json();
        setProviderBookings(bData.bookings || []);
      }

      if (eqRes.ok) {
        const eqData = await eqRes.json();
        setListedEquipment(eqData.equipment || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProviderData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Request Acceptance Workflow
  const handleAcceptRequest = async (requestId: string) => {
    setActionLoading(requestId);
    try {
      const res = await fetch(`/api/requests/${requestId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ACCEPT' }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast('✅ Request accepted! Confirmed booking has been automatically generated.');
        loadProviderData();
      } else {
        alert(data.error || 'Failed to accept request');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  // Request Rejection Workflow
  const handleRejectRequest = async (requestId: string) => {
    if (!confirm('Are you sure you want to decline this request?')) return;
    setActionLoading(requestId);
    try {
      const res = await fetch(`/api/requests/${requestId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'REJECT' }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast('Request declined. Requester has been notified.');
        loadProviderData();
      } else {
        alert(data.error || 'Failed to decline request');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  // Toggle Equipment Availability
  const handleToggleAvailability = async (item: Equipment) => {
    const nextStatus = item.availability === 'AVAILABLE' ? 'IN_USE' : 'AVAILABLE';
    try {
      const res = await fetch(`/api/equipment/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availability: nextStatus }),
      });
      if (res.ok) {
        showToast(`Equipment marked as ${nextStatus === 'AVAILABLE' ? 'Available' : 'In Use'}`);
        loadProviderData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Add New Equipment
  const handleAddEquipmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/equipment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEquipmentForm),
      });

      const data = await res.json();
      if (res.ok) {
        setShowAddModal(false);
        showToast('🎉 New equipment listing published successfully!');
        loadProviderData();
      } else {
        alert(data.error || 'Failed to list equipment');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Calculate Metrics
  const pendingCount = incomingRequests.filter(r => r.status === 'PENDING').length;
  const totalRevenue = providerBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header user={currentUser} />

      {/* Floating Action Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-elevated border border-slate-700 text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Sparkles className="w-4 h-4 text-teal-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        {/* Provider Hub Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Equipment Provider Management Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              City Hospital Equipment Operations
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Review incoming emergency rental requests, accept bookings, and manage inventory
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-600/20 active:scale-95 transition-all self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>List New Equipment</span>
          </button>
        </div>

        {/* Metric Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-soft">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Equipment Listed</span>
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 mt-3">{listedEquipment.length}</p>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Active medical units</span>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-soft">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Requests</span>
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-amber-600 mt-3">{pendingCount}</p>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Awaiting your approval</span>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-soft">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Bookings</span>
              <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
                <CalendarCheck className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-teal-700 mt-3">{providerBookings.length}</p>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Confirmed rentals</span>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-soft">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rental Revenue</span>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-emerald-700 mt-3">{formatCurrency(totalRevenue)}</p>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Earned from idle equipment</span>
          </div>
        </div>

        {/* Section 1: Incoming Rental Requests Queue (With Accept & Reject) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">Incoming Rental Requests</h2>
                <p className="text-xs text-slate-500">Incoming requests from Tier-3 &amp; rural healthcare facilities</p>
              </div>
            </div>

            <button
              onClick={loadProviderData}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Refresh
            </button>
          </div>

          {incomingRequests.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-3xl border border-slate-200 p-6">
              <p className="text-xs text-slate-500">No incoming rental requests at this time.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {incomingRequests.map((req) => {
                const statusInfo = getStatusColor(req.status);
                const isPending = req.status === 'PENDING';

                return (
                  <div
                    key={req.id}
                    className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-100">
                        <EquipmentImage
                          src={req.equipment?.imageUrl || '/equipment/ventilator.svg'}
                          alt={req.equipment?.name || 'Equipment'}
                          categorySlug={req.equipment?.category?.slug || 'ventilator'}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}>
                            {statusInfo.label}
                          </span>
                          {req.urgency === 'CRITICAL_EMERGENCY' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 animate-pulse">
                              URGENT SURGE
                            </span>
                          )}
                        </div>

                        <h3 className="text-sm font-bold text-slate-900">
                          {req.equipment?.name}
                        </h3>

                        <div className="flex items-center gap-1.5 text-xs text-slate-600">
                          <Building2 className="w-3.5 h-3.5 text-teal-600" />
                          <span>Requester: <strong>{req.requester?.facility?.name || req.requester?.name}</strong></span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDate(req.startDate)} - {formatDate(req.endDate)} ({req.totalDays} days)
                          </span>
                          <span>• Purpose: {req.purpose}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 self-end md:self-center">
                      {isPending ? (
                        <>
                          <button
                            onClick={() => handleAcceptRequest(req.id)}
                            disabled={actionLoading === req.id}
                            className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all active:scale-95 disabled:opacity-60"
                          >
                            {actionLoading === req.id ? 'Processing...' : 'Accept Request ✓'}
                          </button>
                          <button
                            onClick={() => handleRejectRequest(req.id)}
                            disabled={actionLoading === req.id}
                            className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-all disabled:opacity-60"
                          >
                            Decline
                          </button>
                        </>
                      ) : req.status === 'ACCEPTED' ? (
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                          ✓ Confirmed &amp; Dispatched
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-xl">
                          Declined
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Section 2: Manage Equipment Inventory */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Listed Equipment Inventory</h2>
              <p className="text-xs text-slate-500">Toggle availability or add accessories</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listedEquipment.map((item) => (
              <div key={item.id} className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-soft space-y-3">
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100">
                  <EquipmentImage
                    src={item.imageUrl}
                    alt={item.name}
                    categorySlug={item.category?.slug || 'ventilator'}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      item.availability === 'AVAILABLE' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                    }`}>
                      {item.availability === 'AVAILABLE' ? 'Available' : 'In Use'}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{item.name}</h3>
                  <p className="text-xs text-slate-500">{item.model}</p>
                  <p className="text-xs font-bold text-teal-700 mt-1">{formatCurrency(item.pricePerDay)} / day</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => handleToggleAvailability(item)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800"
                  >
                    Mark {item.availability === 'AVAILABLE' ? 'Unavailable' : 'Available'}
                  </button>

                  <Link href={`/equipment/${item.id}`} className="text-xs font-medium text-slate-500 hover:text-slate-800">
                    View Specs →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Add Equipment Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-card border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-lg font-black text-slate-900">List Medical Equipment for Sharing</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddEquipmentSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Equipment Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Hamilton C6 Mechanical Ventilator"
                    value={newEquipmentForm.name}
                    onChange={(e) => setNewEquipmentForm({ ...newEquipmentForm, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Model / Series
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. C6 Adaptive"
                      value={newEquipmentForm.model}
                      onChange={(e) => setNewEquipmentForm({ ...newEquipmentForm, model: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Category
                    </label>
                    <select
                      value={newEquipmentForm.categoryId}
                      onChange={(e) => setNewEquipmentForm({ ...newEquipmentForm, categoryId: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Price / Day (₹)
                    </label>
                    <input
                      type="number"
                      required
                      value={newEquipmentForm.pricePerDay}
                      onChange={(e) => setNewEquipmentForm({ ...newEquipmentForm, pricePerDay: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Deposit Amount (₹)
                    </label>
                    <input
                      type="number"
                      value={newEquipmentForm.depositAmount}
                      onChange={(e) => setNewEquipmentForm({ ...newEquipmentForm, depositAmount: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Clinical Description
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide details about clinical applications, accessories, and maintenance status..."
                    value={newEquipmentForm.description}
                    onChange={(e) => setNewEquipmentForm({ ...newEquipmentForm, description: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-3 px-4 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-md"
                  >
                    Publish Listing
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="py-3 px-4 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <Footer />
      <MobileNav isProvider={true} />
    </div>
  );
}
