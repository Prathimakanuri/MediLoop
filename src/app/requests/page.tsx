'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/common/Header';
import { MobileNav } from '@/components/common/MobileNav';
import { Footer } from '@/components/common/Footer';
import { RequestCard } from '@/components/requests/RequestCard';
import { PaymentModal } from '@/components/bookings/PaymentModal';
import { EquipmentRequest, Booking, User } from '@/types';
import { FileText, PlusCircle, Search, Clock, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';

export default function RequestsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [requests, setRequests] = useState<EquipmentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'ACCEPTED' | 'REJECTED'>('ALL');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedBookingForPayment, setSelectedBookingForPayment] = useState<Booking | null>(null);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const uRes = await fetch('/api/auth/me');
      if (!uRes.ok) {
        router.push('/login');
        return;
      }
      const uData = await uRes.json();
      if (!uData.user) {
        router.push('/login');
        return;
      }
      setCurrentUser(uData.user);

      const isProvider = uData.user.role === 'PROVIDER';
      const reqRes = await fetch(isProvider ? '/api/requests?view=provider' : '/api/requests');

      if (reqRes.ok) {
        const reqData = await reqRes.json();
        setRequests(reqData.requests || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleCancelRequest = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this request?')) return;
    try {
      const res = await fetch(`/api/requests/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'CANCEL' }),
      });
      if (res.ok) {
        loadRequests();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAcceptRequest = async (id: string) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/requests/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ACCEPT' }),
      });
      if (res.ok) {
        await loadRequests();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectRequest = async (id: string) => {
    if (!confirm('Are you sure you want to decline this equipment request?')) return;
    setActionLoading(id);
    try {
      const res = await fetch(`/api/requests/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'REJECT' }),
      });
      if (res.ok) {
        await loadRequests();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const isProvider = currentUser?.role === 'PROVIDER';

  const filteredRequests = requests.filter((r) => {
    if (activeTab === 'PENDING') return r.status === 'PENDING';
    if (activeTab === 'ACCEPTED') return r.status === 'ACCEPTED';
    if (activeTab === 'REJECTED') return r.status === 'REJECTED';
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header user={currentUser} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-800 mb-2">
              <FileText className="w-3.5 h-3.5" />
              <span>{isProvider ? 'Incoming Rental Requests' : 'Hospital Equipment Requests'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {isProvider ? 'Booking Requests' : 'My Equipment Requests'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {isProvider
                ? 'Review customer rental requests and accept or decline equipment allocations'
                : 'Track submitted equipment requests. Once a provider accepts, click Pay Now to start online payment.'}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={loadRequests}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>

            {!isProvider && (
              <Link
                href="/search"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-teal-600 text-white hover:bg-teal-700 shadow-sm"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search Equipment</span>
              </Link>
            )}
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'ALL'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            All Requests ({requests.length})
          </button>

          <button
            onClick={() => setActiveTab('PENDING')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'PENDING'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-white text-amber-800 hover:bg-amber-50 border border-amber-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Pending ({requests.filter(r => r.status === 'PENDING').length})</span>
          </button>

          <button
            onClick={() => setActiveTab('ACCEPTED')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'ACCEPTED'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white text-emerald-800 hover:bg-emerald-50 border border-emerald-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Accepted ({requests.filter(r => r.status === 'ACCEPTED').length})</span>
          </button>

          <button
            onClick={() => setActiveTab('REJECTED')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'REJECTED'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-white text-rose-800 hover:bg-rose-50 border border-rose-200'
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Declined ({requests.filter(r => r.status === 'REJECTED').length})</span>
          </button>
        </div>

        {/* Requests List */}
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 animate-pulse bg-white rounded-3xl border border-slate-200">
            Loading requests...
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-6 space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-2">
              <FileText className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No requests found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {isProvider
                ? 'When customer hospitals submit rental requests for your equipment, they will appear here.'
                : 'Search available equipment in the marketplace and submit a rental request to get started.'}
            </p>
            {!isProvider && (
              <Link
                href="/search"
                className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-teal-600 text-white hover:bg-teal-700 shadow-md"
              >
                Search Available Equipment
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((r) => (
              <RequestCard
                key={r.id}
                request={r}
                isProviderView={isProvider}
                onCancel={handleCancelRequest}
                onAccept={handleAcceptRequest}
                onReject={handleRejectRequest}
                onPayNow={(booking) => setSelectedBookingForPayment(booking)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Online Payment Checkout Modal */}
      {selectedBookingForPayment && (
        <PaymentModal
          booking={selectedBookingForPayment}
          onClose={() => setSelectedBookingForPayment(null)}
          onSuccess={() => {
            setSelectedBookingForPayment(null);
            loadRequests();
          }}
        />
      )}

      <Footer />
      <MobileNav isProvider={isProvider} />
    </div>
  );
}
