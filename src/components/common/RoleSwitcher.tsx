'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftRight, Building2, Check, ShieldCheck, Sparkles } from 'lucide-react';

interface RoleSwitcherProps {
  currentEmail?: string;
  currentRole?: string;
  facilityName?: string;
}

export function RoleSwitcher({ currentEmail = 'demo@mediloop.com', currentRole = 'CUSTOMER', facilityName = 'Hospital Account' }: RoleSwitcherProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const isDemoCustomer = currentEmail === 'demo@mediloop.com';
  const isDemoProvider = currentEmail === 'provider@mediloop.com';
  const isDemoAccount = isDemoCustomer || isDemoProvider;

  const switchAccount = async (targetEmail: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/switch-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail }),
      });
      if (res.ok) {
        setIsOpen(false);
        router.refresh();
        if (targetEmail === 'provider@mediloop.com') {
          router.push('/provider');
        } else {
          router.push('/dashboard');
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all shadow-sm ${
          isDemoAccount
            ? 'bg-amber-50 border border-amber-200 text-amber-900 hover:bg-amber-100'
            : 'bg-emerald-50 border border-emerald-200 text-emerald-900 hover:bg-emerald-100'
        }`}
      >
        <span className={`w-2 h-2 rounded-full ${isDemoAccount ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
        <Building2 className="w-3.5 h-3.5 text-slate-600" />
        <span className="hidden sm:inline font-medium text-slate-500">Facility:</span>
        <span className="font-bold max-w-[130px] truncate">{facilityName}</span>
        {isDemoAccount && (
          <span className="px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider bg-amber-200 text-amber-900 font-extrabold">
            Demo Mode
          </span>
        )}
        <ArrowLeftRight className="w-3 h-3 text-slate-400 ml-0.5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-elevated border border-slate-200 z-50 p-2 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3 py-2 border-b border-slate-100 mb-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Demo Account Tester</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">
              Switch to pre-seeded demo accounts to test the two-sided marketplace flow:
            </p>
          </div>

          {/* Customer Demo Account */}
          <button
            onClick={() => switchAccount('demo@mediloop.com')}
            disabled={loading}
            className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition-all ${
              isDemoCustomer ? 'bg-teal-50 border border-teal-200' : 'hover:bg-slate-50'
            }`}
          >
            <div className="p-2 rounded-lg bg-teal-100 text-teal-700 mt-0.5">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-900">City Care Hospital (Demo)</p>
                {isDemoCustomer && <Check className="w-4 h-4 text-teal-600" />}
              </div>
              <p className="text-[11px] text-teal-700 font-semibold">Customer Demo Account</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Contains sample requests &amp; bookings</p>
            </div>
          </button>

          {/* Provider Demo Account */}
          <button
            onClick={() => switchAccount('provider@mediloop.com')}
            disabled={loading}
            className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition-all mt-1 ${
              isDemoProvider ? 'bg-blue-50 border border-blue-200' : 'hover:bg-slate-50'
            }`}
          >
            <div className="p-2 rounded-lg bg-blue-100 text-blue-700 mt-0.5">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-900">City Hospital (Demo)</p>
                {isDemoProvider && <Check className="w-4 h-4 text-blue-600" />}
              </div>
              <p className="text-[11px] text-blue-700 font-semibold">Provider Demo Account</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Contains sample listings &amp; incoming requests</p>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
