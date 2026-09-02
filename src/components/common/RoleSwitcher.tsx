'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftRight, Building2, Check, ShieldCheck } from 'lucide-react';

interface RoleSwitcherProps {
  currentEmail?: string;
  currentRole?: string;
  facilityName?: string;
}

export function RoleSwitcher({ currentEmail = 'demo@mediloop.com', currentRole = 'CUSTOMER', facilityName = 'City Care Hospital' }: RoleSwitcherProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const isCustomer = currentRole === 'CUSTOMER' || currentEmail === 'demo@mediloop.com';

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
        className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100 transition-all shadow-sm"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <Building2 className="w-3.5 h-3.5 text-emerald-600" />
        <span className="hidden sm:inline font-medium text-slate-600">Simulating:</span>
        <span className="font-bold max-w-[140px] truncate">{facilityName}</span>
        <span className="px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider bg-emerald-200 text-emerald-900 font-extrabold">
          {isCustomer ? 'Requester' : 'Provider'}
        </span>
        <ArrowLeftRight className="w-3 h-3 text-emerald-600 ml-0.5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-elevated border border-slate-200 z-50 p-2 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3 py-2 border-b border-slate-100 mb-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Demo Role Simulator</p>
            <p className="text-xs text-slate-600 mt-0.5">Switch perspective to test the full B2B loop:</p>
          </div>

          {/* Option 1: Customer / Requester */}
          <button
            onClick={() => switchAccount('demo@mediloop.com')}
            disabled={loading}
            className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition-all ${
              isCustomer ? 'bg-teal-50 border border-teal-200' : 'hover:bg-slate-50'
            }`}
          >
            <div className="p-2 rounded-lg bg-teal-100 text-teal-700 mt-0.5">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-900">City Care Hospital</p>
                {isCustomer && <Check className="w-4 h-4 text-teal-600" />}
              </div>
              <p className="text-[11px] text-teal-700 font-semibold">Tier-3 Requester Hospital</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Search, book &amp; track emergency equipment</p>
            </div>
          </button>

          {/* Option 2: Provider / Equipment Owner */}
          <button
            onClick={() => switchAccount('provider@mediloop.com')}
            disabled={loading}
            className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition-all mt-1 ${
              !isCustomer ? 'bg-blue-50 border border-blue-200' : 'hover:bg-slate-50'
            }`}
          >
            <div className="p-2 rounded-lg bg-blue-100 text-blue-700 mt-0.5">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-900">City Hospital &amp; Research</p>
                {!isCustomer && <Check className="w-4 h-4 text-blue-600" />}
              </div>
              <p className="text-[11px] text-blue-700 font-semibold">Tier-2 Equipment Provider</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Accept requests, list equipment &amp; earn revenue</p>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
