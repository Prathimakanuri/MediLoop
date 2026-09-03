'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/common/Header';
import { MobileNav } from '@/components/common/MobileNav';
import { Footer } from '@/components/common/Footer';
import { PaymentModal } from '@/components/bookings/PaymentModal';
import { Booking, User } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Building2,
  FileCheck,
  ArrowRight,
  RefreshCw,
  Search,
  FileText,
} from 'lucide-react';

export default function PaymentsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'PAID' | 'AWAITING_PAYMENT'>('ALL');
  const [selectedBookingForPayment, setSelectedBookingForPayment] = useState<Booking | null>(null);

  const loadPaymentData = async () => {
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
      const [bRes, pRes] = await Promise.all([
        fetch(isProvider ? '/api/bookings?view=provider' : '/api/bookings'),
        fetch('/api/payments'),
      ]);

      if (bRes.ok) {
        const bData = await bRes.json();
        setBookings(bData.bookings || []);
      }

      if (pRes.ok) {
        const pData = await pRes.json();
        setPayments(pData.payments || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPaymentData();
  }, []);

  const isProvider = currentUser?.role === 'PROVIDER';

  const paidBookings = bookings.filter((b) => b.paymentStatus === 'PAID');
  const unpaidBookings = bookings.filter((b) => b.paymentStatus === 'PAYMENT_REQUIRED' || b.paymentStatus === 'FAILED' || b.paymentStatus === 'PENDING');

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'PAID') return b.paymentStatus === 'PAID';
    if (activeTab === 'AWAITING_PAYMENT') return b.paymentStatus === 'PAYMENT_REQUIRED' || b.paymentStatus === 'FAILED' || b.paymentStatus === 'PENDING';
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
              <CreditCard className="w-3.5 h-3.5" />
              <span>Financial Ledger &amp; B2B Settlements</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Payments &amp; Invoice Ledger
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {isProvider
                ? 'Track equipment rental earnings, verified receipts, and pending payouts'
                : 'Manage online payments, settled tax receipts, and outstanding invoices'}
            </p>
          </div>

          <button
            onClick={loadPaymentData}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 shadow-sm self-start sm:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Ledger</span>
          </button>
        </div>

        {/* Payment Summary Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-soft">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              {isProvider ? 'Total Settled Earnings' : 'Total Paid Rental Amount'}
            </span>
            <p className="text-2xl font-black text-teal-700 mt-2">
              {formatCurrency(paidBookings.reduce((sum, b) => sum + b.totalAmount, 0))}
            </p>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              {paidBookings.length} completed paid transaction(s)
            </span>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-soft">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Outstanding / Awaiting Payment
            </span>
            <p className="text-2xl font-black text-amber-600 mt-2">
              {formatCurrency(unpaidBookings.reduce((sum, b) => sum + b.totalAmount, 0))}
            </p>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              {unpaidBookings.length} invoice(s) awaiting online payment
            </span>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-soft">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Online Gateway Security
            </span>
            <div className="flex items-center gap-2 mt-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-bold text-slate-800">100% Encrypted B2B Gateway</span>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">UPI • Credit/Debit Card • Net Banking</span>
          </div>
        </div>

        {/* Tab Filter Pills */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'ALL'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            All Statements ({bookings.length})
          </button>

          <button
            onClick={() => setActiveTab('PAID')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'PAID'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white text-emerald-800 hover:bg-emerald-50 border border-emerald-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Paid &amp; Settled ({paidBookings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('AWAITING_PAYMENT')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                              activeTab === 'AWAITING_PAYMENT'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-white text-amber-800 hover:bg-amber-50 border border-amber-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Awaiting Payment ({unpaidBookings.length})</span>
          </button>
        </div>

        {/* Detailed Payment Table */}
        <section className="bg-white rounded-3xl border border-slate-200/90 shadow-soft overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              Transaction Statements &amp; Tax Receipts
            </h2>
            <span className="text-xs font-medium text-slate-500">
              Showing {filteredBookings.length} record(s)
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400 animate-pulse">
              Loading payment statements...
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="p-16 text-center space-y-3 bg-white">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-2">
                <CreditCard className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">No payment statements found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {isProvider
                  ? 'When customers complete online payment for accepted equipment requests, settlements will appear here.'
                  : 'Once an equipment provider accepts your rental request, you can complete online payment here.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="py-3.5 px-5">Equipment &amp; Pass #</th>
                    <th className="py-3.5 px-4">{isProvider ? 'Customer Facility' : 'Provider Facility'}</th>
                    <th className="py-3.5 px-4">Amount</th>
                    <th className="py-3.5 px-4">Payment Method</th>
                    <th className="py-3.5 px-4">Txn Ref ID</th>
                    <th className="py-3.5 px-4">Payment Status</th>
                    <th className="py-3.5 px-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {filteredBookings.map((b) => {
                    const isPaid = b.paymentStatus === 'PAID';

                    return (
                      <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-5 font-bold text-slate-900">
                          <div>{b.equipment?.name}</div>
                          <span className="text-[10px] font-mono text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-100 mt-0.5 inline-block">
                            #{b.bookingNumber}
                          </span>
                        </td>

                        <td className="py-4 px-4 text-slate-600">
                          {isProvider
                            ? b.requester?.facility?.name || b.requester?.name
                            : b.provider?.name}
                        </td>

                        <td className="py-4 px-4 font-black text-teal-700 text-sm">
                          {formatCurrency(b.totalAmount)}
                        </td>

                        <td className="py-4 px-4 text-slate-600">
                          {isPaid ? (
                            <span className="font-semibold text-slate-800">
                              {b.paymentMethod || 'UPI Online'}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">Online Checkout</span>
                          )}
                        </td>

                        <td className="py-4 px-4 font-mono text-[11px]">
                          {isPaid && b.transactionId ? (
                            <span className="text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                              {b.transactionId}
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>

                        <td className="py-4 px-4">
                          {isPaid ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1 w-max">
                              <CheckCircle2 className="w-3 h-3" /> Paid ✓
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1 w-max animate-pulse">
                              <Clock className="w-3 h-3 text-amber-700" /> Payment Required
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-5 text-right">
                          {!isPaid && !isProvider ? (
                            <button
                              onClick={() => setSelectedBookingForPayment(b)}
                              className="px-4 py-2 rounded-xl text-xs font-extrabold bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/20 transition-all active:scale-95 whitespace-nowrap"
                            >
                              Pay Now
                            </button>
                          ) : (
                            <Link
                              href={`/bookings/${b.id}`}
                              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors inline-block whitespace-nowrap"
                            >
                              {isPaid ? 'View Tax Receipt' : 'View Pass (Payment Pending)'}
                            </Link>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {/* Payment Modal */}
      {selectedBookingForPayment && (
        <PaymentModal
          booking={selectedBookingForPayment}
          onClose={() => setSelectedBookingForPayment(null)}
          onSuccess={() => {
            setSelectedBookingForPayment(null);
            loadPaymentData();
          }}
        />
      )}

      <Footer />
      <MobileNav isProvider={isProvider} />
    </div>
  );
}
