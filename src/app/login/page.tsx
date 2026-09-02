'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { HeartPulse, Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, Building2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your hospital email address or phone number.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Invalid email or password.');
        setLoading(false);
        return;
      }

      // Successful login
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError('Network connection failed. Please try again.');
      setLoading(false);
    }
  };

  const handleDemoFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50/40 via-white to-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <div className="w-12 h-12 rounded-2xl bg-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-600/20">
            <HeartPulse className="w-7 h-7" />
          </div>
          <div className="text-left">
            <span className="font-extrabold text-2xl text-slate-900 tracking-tight">MEDI<span className="text-teal-600">LOOP</span></span>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Share. Connect. Save Lives.</p>
          </div>
        </Link>
        <h2 className="mt-6 text-2xl font-black text-slate-900 tracking-tight">
          Hospital Portal Login
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Access shared medical equipment and manage rental requests
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        {/* Quick 1-Click Demo Credentials Card */}
        <div className="mb-6 p-4 rounded-2xl bg-teal-50/80 border border-teal-200/90 shadow-soft">
          <div className="flex items-center gap-1.5 text-xs font-bold text-teal-900 mb-2">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>Click to Autofill Demo Credentials:</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleDemoFill('demo@mediloop.com', 'demo123')}
              className="p-2.5 rounded-xl bg-white border border-teal-200 text-left hover:border-teal-400 hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-1 font-bold text-teal-800 text-[11px]">
                <Building2 className="w-3.5 h-3.5" />
                <span>Customer / Requester</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5 truncate">demo@mediloop.com</p>
              <p className="text-[9px] text-slate-400">Pass: demo123 (City Care Hospital)</p>
            </button>

            <button
              type="button"
              onClick={() => handleDemoFill('provider@mediloop.com', 'demo123')}
              className="p-2.5 rounded-xl bg-white border border-blue-200 text-left hover:border-blue-400 hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-1 font-bold text-blue-800 text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Equipment Provider</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5 truncate">provider@mediloop.com</p>
              <p className="text-[9px] text-slate-400">Pass: demo123 (City Hospital)</p>
            </button>
          </div>
        </div>

        {/* Login Form Box */}
        <div className="bg-white py-8 px-6 sm:px-8 shadow-card rounded-3xl border border-slate-200/80">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Email / Phone Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Hospital Email / Phone
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. demo@mediloop.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-slate-50/50"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('For this demo prototype, please use password: demo123'); }} className="text-xs text-teal-600 hover:text-teal-800 font-semibold">
                  Forgot Password?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-slate-50/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold bg-teal-600 text-white hover:bg-teal-700 shadow-md shadow-teal-600/20 active:scale-95 transition-all disabled:opacity-60"
            >
              {loading ? (
                <span>Verifying credentials...</span>
              ) : (
                <>
                  <span>Log In to Mediloop</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Switch to Signup */}
          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              New healthcare facility?{' '}
              <Link href="/signup" className="text-teal-600 hover:text-teal-800 font-bold">
                Register Your Hospital
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
