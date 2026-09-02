'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { HeartPulse, Building2, Mail, Lock, Phone, MapPin, ArrowRight, ShieldCheck, AlertCircle, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function SignupPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [formData, setFormData] = useState({
    hospitalName: '',
    doctorName: '',
    facilityType: 'Community Hospital',
    tier: 'Tier-3',
    city: 'Yavatmal',
    address: '',
    email: '',
    phone: '',
    password: '',
    role: 'CUSTOMER',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.hospitalName.trim()) {
      setError('Please enter your hospital or facility name.');
      return;
    }

    if (!formData.doctorName.trim()) {
      setError('Please enter the administrator or doctor name.');
      return;
    }

    if (!formData.email.trim()) {
      setError('Please enter an official hospital email address.');
      return;
    }

    if (!formData.password || formData.password.length < 4) {
      setError('Password must be at least 4 characters.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed. Please try again.');
        setLoading(false);
        return;
      }

      // Refresh AuthContext with the newly created real user profile
      await refreshUser();

      // Route to role-specific dashboard
      if (formData.role === 'PROVIDER') {
        router.push('/provider');
      } else {
        router.push('/dashboard');
      }
      router.refresh();
    } catch (err) {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50/40 via-white to-slate-50 flex flex-col justify-center py-10 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg text-center">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <div className="w-12 h-12 rounded-2xl bg-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-600/20">
            <HeartPulse className="w-7 h-7" />
          </div>
          <div className="text-left">
            <span className="font-extrabold text-2xl text-slate-900 tracking-tight">MEDI<span className="text-teal-600">LOOP</span></span>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Share. Connect. Save Lives.</p>
          </div>
        </Link>
        <h2 className="mt-5 text-2xl font-black text-slate-900 tracking-tight">
          Register Your Healthcare Facility
        </h2>
        <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
          Create a dedicated hospital account for medical equipment sharing and emergency rental
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg px-4">
        <div className="bg-white py-8 px-6 sm:px-8 shadow-card rounded-3xl border border-slate-200/80">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Account Role Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Primary Account Function
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'CUSTOMER' })}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    formData.role === 'CUSTOMER'
                      ? 'bg-teal-50 border-teal-500 text-teal-900 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="block text-xs font-black">Healthcare Requester</span>
                  <span className="block text-[10px] text-slate-500 mt-0.5">Need equipment for ICU surges &amp; breakdowns</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'PROVIDER' })}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    formData.role === 'PROVIDER'
                      ? 'bg-blue-50 border-blue-500 text-blue-900 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="block text-xs font-black">Equipment Provider</span>
                  <span className="block text-[10px] text-slate-500 mt-0.5">Have idle medical units to rent out</span>
                </button>
              </div>
            </div>

            {/* Hospital Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Hospital / Facility Name
              </label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={formData.hospitalName}
                  onChange={(e) => setFormData({ ...formData, hospitalName: e.target.value })}
                  placeholder="e.g. LifeLine Rural Community Hospital"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-slate-50/50"
                />
              </div>
            </div>

            {/* Doctor / Contact Person Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Administrator / Medical Lead Name
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={formData.doctorName}
                  onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
                  placeholder="e.g. Dr. Suresh Kulkarni"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-slate-50/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Facility Type
                </label>
                <select
                  value={formData.facilityType}
                  onChange={(e) => setFormData({ ...formData, facilityType: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                >
                  <option value="Community Hospital">Community Hospital</option>
                  <option value="Multi-Specialty Hospital">Multi-Specialty Hospital</option>
                  <option value="Specialty Trauma Clinic">Specialty Trauma Clinic</option>
                  <option value="Diagnostic Imaging Hub">Diagnostic Imaging Hub</option>
                  <option value="Primary Health Center">Primary Health Center</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Region / Tier
                </label>
                <select
                  value={formData.tier}
                  onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                >
                  <option value="Tier-2">Tier-2 City</option>
                  <option value="Tier-3">Tier-3 District</option>
                  <option value="Semi-Urban">Semi-Urban</option>
                  <option value="Rural">Rural</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  City / District
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g. Yavatmal"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-slate-50/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98000 00000"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-slate-50/50"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Official Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="admin@hospital.org"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-slate-50/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Create Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Enter password"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-slate-50/50"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-sm font-bold bg-teal-600 text-white hover:bg-teal-700 shadow-md shadow-teal-600/20 active:scale-95 transition-all disabled:opacity-60"
            >
              <span>{loading ? 'Registering New Facility...' : 'Register Hospital Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Already registered?{' '}
              <Link href="/login" className="text-teal-600 hover:text-teal-800 font-bold">
                Log In Here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
