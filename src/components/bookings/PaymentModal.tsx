'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Booking } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  CreditCard,
  QrCode,
  Building2,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  FileCheck,
  ArrowRight,
  Clock,
  Lock,
  Loader2,
  RefreshCw,
  XCircle,
} from 'lucide-react';

interface PaymentModalProps {
  booking: Booking;
  onClose: () => void;
  onSuccess: (updatedBooking: Booking) => void;
}

type PaymentScreen = 'CHECKOUT' | 'PROCESSING' | 'SUCCESS' | 'FAILED';

export function PaymentModal({ booking, onClose, onSuccess }: PaymentModalProps) {
  const router = useRouter();

  // Screen State Machine
  const [screen, setScreen] = useState<PaymentScreen>('CHECKOUT');
  const [method, setMethod] = useState<'UPI' | 'CARD' | 'NET_BANKING'>('UPI');

  // Method Inputs (Safe Dummy/Prototype Data)
  const [upiMode, setUpiMode] = useState<'VPA' | 'QR'>('VPA');
  const [vpaId, setVpaId] = useState('hospital@okhdfcbank');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8910');
  const [cardHolder, setCardHolder] = useState('Dr. Authorized Signatory');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvv, setCardCvv] = useState('•••');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');

  // Processing Progression
  const [processingStep, setProcessingStep] = useState('Connecting to secure banking gateway...');
  const [errorMessage, setErrorMessage] = useState('');

  // Result details on success
  const [transactionId, setTransactionId] = useState('');
  const [paymentTimestamp, setPaymentTimestamp] = useState('');
  const [updatedBookingRecord, setUpdatedBookingRecord] = useState<Booking | null>(null);

  // Financial Breakdown
  const rentalFee = booking.totalAmount;
  const gstAmount = Math.round(rentalFee * 0.18);
  const deposit = booking.deposit || 0;
  const grandTotal = rentalFee + gstAmount + deposit;

  // Handler: Customer clicks [ PROCEED TO PAY ]
  const handleProceedToPay = async (simulateFailure: boolean = false) => {
    setErrorMessage('');
    setScreen('PROCESSING');

    try {
      // Step 1: Connecting
      setProcessingStep('Connecting to secure banking gateway...');
      await new Promise((r) => setTimeout(r, 600));

      // Step 2: Verifying
      setProcessingStep('Verifying payment credentials with issuing bank...');
      await new Promise((r) => setTimeout(r, 700));

      // Step 3: Authorizing & Executing Backend Settlement
      setProcessingStep('Confirming transaction and updating hospital booking...');

      // Generate realistic transaction ID (Requirement 13: Format MLTX-2026-XXXXXX)
      const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
      const clientTxnId = `MLTX-2026-${randomSuffix}`;

      const res = await fetch(`/api/bookings/${booking.id}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethod: method === 'CARD' ? 'Credit/Debit Card' : method === 'NET_BANKING' ? `Net Banking (${selectedBank})` : 'UPI',
          transactionId: clientTxnId,
          simulateFailure: simulateFailure,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Payment was declined by the bank. Please retry.');
        setScreen('FAILED');
        return;
      }

      // Success: Save details and transition to Success Screen
      setTransactionId(data.payment?.transactionId || clientTxnId);
      setPaymentTimestamp(new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }));
      setUpdatedBookingRecord(data.booking);

      await new Promise((r) => setTimeout(r, 500));
      setScreen('SUCCESS');

      // Inform parent component
      onSuccess(data.booking);
    } catch (err: any) {
      setErrorMessage('A network error occurred while communicating with the banking gateway.');
      setScreen('FAILED');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-elevated border border-slate-200 animate-in fade-in zoom-in-95 duration-150">

        {/* ========================================================= */}
        {/* SCREEN 1: CHECKOUT (SELECT METHOD & ENTER DETAILS)        */}
        {/* ========================================================= */}
        {screen === 'CHECKOUT' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200 mb-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                  <span>Secure Online Payment</span>
                </div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                  Complete Payment to Confirm Booking
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 font-bold transition-colors"
                title="Cancel and Go Back"
              >
                ✕
              </button>
            </div>

            {/* Equipment & Provider Summary */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
              <div className="flex justify-between items-center text-slate-600">
                <span className="font-semibold text-slate-500">Equipment:</span>
                <span className="font-bold text-slate-900">{booking.equipment?.name}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span className="font-semibold text-slate-500">Provider:</span>
                <span className="font-bold text-slate-900">{booking.provider?.name}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span className="font-semibold text-slate-500">Rental Duration:</span>
                <span className="font-medium text-slate-800">{booking.totalDays} Days ({formatDate(booking.startDate)} - {formatDate(booking.endDate)})</span>
              </div>

              <div className="pt-2 border-t border-slate-200 space-y-1 text-slate-600">
                <div className="flex justify-between">
                  <span>Base Rental ({booking.totalDays} days @ {formatCurrency(booking.pricePerDay)}):</span>
                  <span>{formatCurrency(rentalFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (18% Healthcare Equipment Lease):</span>
                  <span>{formatCurrency(gstAmount)}</span>
                </div>
                {deposit > 0 && (
                  <div className="flex justify-between">
                    <span>Refundable Security Deposit:</span>
                    <span>{formatCurrency(deposit)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline font-bold text-sm">
                  <span className="text-slate-900 font-black">Amount to Pay:</span>
                  <span className="text-teal-700 font-black text-lg">{formatCurrency(grandTotal)}</span>
                </div>
              </div>
            </div>

            {/* Payment Method Selector (Online Payment ONLY - No COD) */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Select Online Payment Method
              </label>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setMethod('UPI')}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                    method === 'UPI'
                      ? 'bg-teal-50 border-teal-500 text-teal-900 font-bold shadow-sm ring-1 ring-teal-500'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <QrCode className="w-5 h-5 text-teal-600" />
                  <span>UPI</span>
                  <span className="text-[10px] text-slate-400 font-normal">GPay / PhonePe</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('CARD')}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                    method === 'CARD'
                      ? 'bg-teal-50 border-teal-500 text-teal-900 font-bold shadow-sm ring-1 ring-teal-500'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-teal-600" />
                  <span>Card</span>
                  <span className="text-[10px] text-slate-400 font-normal">Credit / Debit</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('NET_BANKING')}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                    method === 'NET_BANKING'
                      ? 'bg-teal-50 border-teal-500 text-teal-900 font-bold shadow-sm ring-1 ring-teal-500'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Building2 className="w-5 h-5 text-teal-600" />
                  <span>Net Banking</span>
                  <span className="text-[10px] text-slate-400 font-normal">Direct Bank</span>
                </button>
              </div>
            </div>

            {/* Dynamic Details Inputs */}
            {method === 'UPI' && (
              <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200 space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-teal-100">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setUpiMode('VPA')}
                      className={`px-3 py-1 rounded-xl text-xs font-bold ${
                        upiMode === 'VPA' ? 'bg-teal-600 text-white shadow-sm' : 'bg-white text-teal-800'
                      }`}
                    >
                      Enter UPI ID
                    </button>
                    <button
                      type="button"
                      onClick={() => setUpiMode('QR')}
                      className={`px-3 py-1 rounded-xl text-xs font-bold ${
                        upiMode === 'QR' ? 'bg-teal-600 text-white shadow-sm' : 'bg-white text-teal-800'
                      }`}
                    >
                      Scan QR Code
                    </button>
                  </div>

                  <span className="text-[10px] font-mono text-teal-700 font-bold">mediloop@icici</span>
                </div>

                {upiMode === 'VPA' ? (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Enter UPI ID / VPA
                    </label>
                    <input
                      type="text"
                      value={vpaId}
                      onChange={(e) => setVpaId(e.target.value)}
                      placeholder="e.g. hospital@upi or doctor@okhdfcbank"
                      className="w-full p-2.5 rounded-xl border border-teal-300 text-xs bg-white font-mono focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      A payment request will be sent to your UPI app for authorization.
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-2 space-y-2">
                    <div className="w-32 h-32 mx-auto bg-white p-2 rounded-xl border border-teal-200 shadow-sm flex items-center justify-center">
                      <QrCode className="w-24 h-24 text-slate-800" />
                    </div>
                    <p className="text-[11px] text-slate-600 font-medium">
                      Scan using Google Pay, PhonePe, Paytm, or BHIM
                    </p>
                  </div>
                )}
              </div>
            )}

            {method === 'CARD' && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                <div className="text-[10px] text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-2 font-medium">
                  🔒 Prototype Demo Fields — Safe test inputs only. Real cards are not charged.
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="4532 •••• •••• 8910"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white font-mono focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Name on Card</label>
                  <input
                    type="text"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    placeholder="Doctor or Facility Name"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Expiry</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="MM/YY"
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white font-mono focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">CVV</label>
                    <input
                      type="password"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      placeholder="•••"
                      maxLength={4}
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white font-mono focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                    />
                  </div>
                </div>
              </div>
            )}

            {method === 'NET_BANKING' && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Select Your Bank
                  </label>
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                  >
                    <option value="HDFC Bank">HDFC Bank</option>
                    <option value="ICICI Bank">ICICI Bank</option>
                    <option value="State Bank of India">State Bank of India (SBI)</option>
                    <option value="Axis Bank">Axis Bank</option>
                    <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                    <option value="Punjab National Bank">Punjab National Bank</option>
                    <option value="Bank of Baroda">Bank of Baroda</option>
                  </select>
                </div>

                <div className="p-2.5 rounded-xl bg-teal-50 text-teal-800 text-[11px]">
                  You will be redirected to {selectedBank}&apos;s secure corporate login portal for 2-factor authentication.
                </div>
              </div>
            )}

            {/* Action CTA Buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => handleProceedToPay(false)}
                className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl text-sm font-extrabold bg-teal-600 hover:bg-teal-700 text-white shadow-elevated transition-all active:scale-95"
              >
                <Lock className="w-4 h-4" />
                <span>PROCEED TO PAY {formatCurrency(grandTotal)}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-between text-xs pt-1 px-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="text-slate-500 hover:text-slate-800 font-semibold"
                >
                  Cancel &amp; Return
                </button>

                {/* Simulated Payment Failure Test */}
                <button
                  type="button"
                  onClick={() => handleProceedToPay(true)}
                  className="text-[10px] text-slate-400 hover:text-rose-600 font-bold"
                >
                  [ Simulate Gateway Failure ]
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SCREEN 2: PAYMENT PROCESSING                              */}
        {/* ========================================================= */}
        {screen === 'PROCESSING' && (
          <div className="py-8 px-4 text-center space-y-6 animate-in fade-in duration-200">
            <div className="relative w-20 h-20 mx-auto">
              <div className="w-20 h-20 rounded-3xl bg-teal-50 border border-teal-200 flex items-center justify-center shadow-soft">
                <Loader2 className="w-10 h-10 text-teal-600 animate-spin" />
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                PROCESSING PAYMENT
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-2">
                Processing your online payment...
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Please wait while we confirm your transaction. Do not refresh or press back.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 max-w-xs mx-auto text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Amount:</span>
                <span className="font-black text-slate-900">{formatCurrency(grandTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Method:</span>
                <span className="font-bold text-slate-800">{method === 'CARD' ? 'Credit/Debit Card' : method === 'NET_BANKING' ? 'Net Banking' : 'UPI'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Status:</span>
                <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  Processing
                </span>
              </div>
            </div>

            <div className="text-xs font-semibold text-teal-800 bg-teal-50/80 p-3 rounded-xl border border-teal-100 flex items-center justify-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-teal-600" />
              <span>{processingStep}</span>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SCREEN 3: PAYMENT SUCCESSFUL ✓                            */}
        {/* ========================================================= */}
        {screen === 'SUCCESS' && (
          <div className="py-4 space-y-6 text-center animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-elevated animate-bounce">
              <CheckCircle2 className="w-11 h-11 text-emerald-600" />
            </div>

            <div>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                PAYMENT SUCCESSFUL ✓
              </span>
              <h3 className="text-2xl font-black text-slate-900 mt-2 tracking-tight">
                Payment Completed Successfully!
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Your payment has been received and verified. Your equipment booking is now confirmed.
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2.5 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-semibold">Amount Paid:</span>
                <span className="text-lg font-black text-teal-700">{formatCurrency(grandTotal)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-semibold">Payment Method:</span>
                <span className="font-bold text-slate-800">
                  {method === 'CARD' ? 'Credit/Debit Card' : method === 'NET_BANKING' ? `Net Banking (${selectedBank})` : 'UPI'}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-semibold">Transaction ID:</span>
                <span className="font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  {transactionId}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-semibold">Payment Date:</span>
                <span className="text-slate-700 font-medium">{paymentTimestamp}</span>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                <span className="text-slate-500 font-semibold">Payment Status:</span>
                <span className="font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                  PAID ✓
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-semibold">Booking Status:</span>
                <span className="font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                  CONFIRMED
                </span>
              </div>
            </div>

            {/* Navigation Actions */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  router.push(`/bookings/${booking.id}`);
                }}
                className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl text-sm font-extrabold bg-teal-600 hover:bg-teal-700 text-white shadow-elevated transition-all active:scale-95"
              >
                <FileCheck className="w-4 h-4" />
                <span>VIEW RENTAL PASS &amp; TAX INVOICE</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  router.push('/bookings');
                }}
                className="w-full py-3 px-4 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                View My Bookings
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SCREEN 4: PAYMENT FAILED                                  */}
        {/* ========================================================= */}
        {screen === 'FAILED' && (
          <div className="py-6 space-y-6 text-center animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 rounded-3xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-soft">
              <XCircle className="w-11 h-11 text-rose-600" />
            </div>

            <div>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-800 border border-rose-300">
                PAYMENT FAILED
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-2 tracking-tight">
                We Could Not Complete Your Payment
              </h3>
              <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200 p-3 rounded-xl mt-3 text-left">
                {errorMessage || 'The payment gateway could not authorize this transaction. Your booking remains in Awaiting Payment status and no funds were deducted.'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Status:</span>
                <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                  FAILED
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Booking Status:</span>
                <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  AWAITING_PAYMENT (Unconfirmed)
                </span>
              </div>
            </div>

            {/* Retry CTA */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => setScreen('CHECKOUT')}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl text-sm font-extrabold bg-teal-600 hover:bg-teal-700 text-white shadow-elevated transition-all active:scale-95"
              >
                <RefreshCw className="w-4 h-4" />
                <span>RETRY PAYMENT</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
              >
                Cancel &amp; Try Later
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
