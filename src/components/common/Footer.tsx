import React from 'react';
import Link from 'next/link';
import { HeartPulse, ShieldCheck, Truck, Clock, PhoneCall } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-20 pb-20 md:pb-8 pt-12 text-slate-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Trust Badges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-10 border-b border-slate-100">
          <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-teal-50/50 border border-teal-100/80">
            <div className="p-2.5 rounded-xl bg-teal-600 text-white shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">100% Verified Equipment</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Biomedically calibrated, sterilized, and certified before dispatch.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-blue-50/50 border border-blue-100/80">
            <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-sm">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Express Medical Logistics</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Temperature-controlled, shock-dampened transport for critical machines.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100/80">
            <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-sm">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">24/7 Clinical Hotline</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Instant escalation for ICU surge and emergency breakdown situations.
              </p>
            </div>
          </div>
        </div>

        {/* Links & Brand */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white font-bold">
                <HeartPulse className="w-5 h-5" />
              </div>
              <span className="text-lg font-extrabold text-slate-900">MEDI<span className="text-teal-600">LOOP</span></span>
            </div>
            <p className="text-xs font-semibold text-teal-700 mt-1 italic">
              &ldquo;Share. Connect. Save Lives.&rdquo;
            </p>
            <p className="text-xs text-slate-500 mt-3 max-w-sm leading-relaxed">
              Mediloop is a B2B medical equipment sharing and rental network empowering Tier-2, Tier-3, semi-urban, and rural healthcare facilities to access life-saving equipment affordably and immediately.
            </p>
          </div>

          <div>
            <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Quick Navigation</h5>
            <ul className="space-y-2 text-xs">
              <li><Link href="/dashboard" className="hover:text-teal-600">Hospital Dashboard</Link></li>
              <li><Link href="/search" className="hover:text-teal-600">Browse Medical Equipment</Link></li>
              <li><Link href="/requests" className="hover:text-teal-600">Track Equipment Requests</Link></li>
              <li><Link href="/bookings" className="hover:text-teal-600">Active Bookings</Link></li>
              <li><Link href="/provider" className="hover:text-teal-600">List Equipment (Provider Hub)</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Emergency Support</h5>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <PhoneCall className="w-4 h-4 text-teal-600" />
              <span>1800-MED-LOOP (Toll Free)</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">support@mediloop.health</p>
            <p className="text-[11px] text-slate-400 mt-3">
              Serving Maharashtra, Madhya Pradesh &amp; Telangana Tier-2/3 Districts.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <p>© {new Date().getFullYear()} MEDILOOP HealthTech Technologies. All rights reserved.</p>
          <div className="flex gap-4">
            <span>HIPAA Compliant</span>
            <span>•</span>
            <span>Biomedical Certified</span>
            <span>•</span>
            <span>NABH Aligned</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
