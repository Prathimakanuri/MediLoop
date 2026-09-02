import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { HeartPulse, ShieldCheck, ArrowRight, Activity, Clock, Zap, CheckCircle2, Building2, Sparkles } from 'lucide-react';
import { EquipmentImage } from '@/components/common/EquipmentImage';

export default function SplashOnboardingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-teal-50/30 to-slate-50 flex flex-col justify-between">
      {/* Top Simple Navigation */}
      <header className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-600/20">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div>
            <span className="font-extrabold text-xl text-slate-900 tracking-tight">MEDI<span className="text-teal-600">LOOP</span></span>
            <p className="text-[9px] font-bold text-teal-700 uppercase tracking-widest hidden sm:block">Healthcare Equipment Exchange</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-teal-700 hover:bg-teal-50/80 transition-colors"
          >
            Hospital Login
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold bg-teal-600 text-white hover:bg-teal-700 shadow-sm shadow-teal-600/20 transition-all active:scale-95"
          >
            <span>Register Hospital</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-16 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Mission, Tagline, CTAs */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-teal-100/70 text-teal-800 border border-teal-200/80 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>B2B Medical Equipment Sharing Network</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
              Share. Connect.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-600">
                Save Lives.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Share underutilised medical equipment between healthcare facilities easily, reliably and affordably. Built for Tier-2, Tier-3, and rural hospitals facing emergency ICU surges or breakdowns.
            </p>

            {/* Impact Metric Pills */}
            <div className="grid grid-cols-3 gap-3 pt-2 max-w-md mx-auto lg:mx-0">
              <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-soft text-center">
                <span className="block text-lg font-black text-teal-600">150+</span>
                <span className="text-[11px] font-semibold text-slate-500">Hospitals Connected</span>
              </div>
              <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-soft text-center">
                <span className="block text-lg font-black text-teal-600">65%</span>
                <span className="text-[11px] font-semibold text-slate-500">CapEx Cost Saved</span>
              </div>
              <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-soft text-center">
                <span className="block text-lg font-black text-teal-600">&lt; 4 hrs</span>
                <span className="text-[11px] font-semibold text-slate-500">Emergency Dispatch</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-center lg:justify-start">
              <Link
                href="/signup"
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-extrabold bg-teal-600 text-white hover:bg-teal-700 shadow-md shadow-teal-600/30 hover:shadow-lg transition-all active:scale-95"
              >
                <span>Register Your Hospital</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/login"
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-sm transition-all"
              >
                <span>Log In</span>
              </Link>
            </div>

            {/* Verified Trust Statement */}
            <div className="flex items-center gap-2 text-xs text-slate-500 justify-center lg:justify-start pt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Biomedically calibrated • Verified hospital partners • Express logistics</span>
            </div>
          </div>

          {/* Right Column: Professional Medical Equipment Showcase Card Grid */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-4">
            {/* Ventilator Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-soft hover:shadow-card transition-all">
              <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 mb-2.5">
                <EquipmentImage
                  src="/equipment/ventilator.svg"
                  alt="ICU Ventilator"
                  categorySlug="ventilator"
                  className="w-full h-full"
                />
                <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-600 text-white">
                  Available Now
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 truncate">Hamilton-C6 Ventilator</h4>
              <p className="text-[11px] text-teal-600 font-bold mt-0.5">₹1,500/day • 2 km</p>
            </div>

            {/* Patient Monitor Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-soft hover:shadow-card transition-all">
              <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 mb-2.5">
                <EquipmentImage
                  src="/equipment/patient-monitor.svg"
                  alt="Patient Monitor"
                  categorySlug="patient-monitor"
                  className="w-full h-full"
                />
                <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-600 text-white">
                  Available Now
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 truncate">IntelliVue MX750 Monitor</h4>
              <p className="text-[11px] text-teal-600 font-bold mt-0.5">₹900/day • 4 km</p>
            </div>

            {/* Defibrillator Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-soft hover:shadow-card transition-all">
              <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 mb-2.5">
                <EquipmentImage
                  src="/equipment/defibrillator.svg"
                  alt="Defibrillator"
                  categorySlug="defibrillator"
                  className="w-full h-full"
                />
                <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-600 text-white">
                  Code Ready
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 truncate">ZOLL R Series Defibrillator</h4>
              <p className="text-[11px] text-teal-600 font-bold mt-0.5">₹1,200/day • 4 km</p>
            </div>

            {/* 12-Lead ECG Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-soft hover:shadow-card transition-all">
              <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 mb-2.5">
                <EquipmentImage
                  src="/equipment/ecg-machine.svg"
                  alt="ECG Machine"
                  categorySlug="ecg"
                  className="w-full h-full"
                />
                <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-600 text-white">
                  Available Now
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 truncate">Schiller 12-Lead ECG</h4>
              <p className="text-[11px] text-teal-600 font-bold mt-0.5">₹700/day • 3 km</p>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Features Strip */}
      <footer className="border-t border-slate-200/70 bg-white/80 backdrop-blur py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 font-medium text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
              1. Discover &amp; Search
            </span>
            <span className="flex items-center gap-1.5 font-medium text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
              2. Request Equipment
            </span>
            <span className="flex items-center gap-1.5 font-medium text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
              3. Instant Confirmation &amp; Payment
            </span>
          </div>
          <p>© {new Date().getFullYear()} MEDILOOP • Share. Connect. Save Lives.</p>
        </div>
      </footer>
    </div>
  );
}
