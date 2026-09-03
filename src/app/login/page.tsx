'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { HeartPulse, Eye, EyeOff, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registrationMessage, setRegistrationMessage] = useState('');

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('registered') === '1') {
      setRegistrationMessage('Registration successful. Please log in to continue.');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your hospital email address or username.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      const authenticated = await login(email.trim(), password);
      if (!authenticated) {
        setError('Invalid email or password.');
        setLoading(false);
        return;
      }

      // Successful login redirect based on role
      if (authenticated.role === 'PROVIDER') {
        router.push('/provider');
      } else {
        router.push('/dashboard');
      }
      router.refresh();
    } catch (err) {
      setError('Network connection failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50/40 via-white to-slate-50 flex flex-col justify-center py-10 sm:px-6 lg:px-8">
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
        <h2 className="mt-5 text-2xl font-black text-slate-900 tracking-tight">
          Member Hospital Login
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Sign in to your registered healthcare facility account
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 space-y-5">
        {/* Main Member Login Box */}
        <div className="bg-white py-7 px-6 sm:px-8 shadow-card rounded-3xl border border-slate-200/80">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {!error && (registrationMessage || '') && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs">
                {registrationMessage}
              </div>
            )}
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Hospital Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@yourhospital.org"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-slate-50/50"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Please use the password you registered your hospital with.'); }} className="text-xs text-teal-600 hover:text-teal-800 font-semibold">
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
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-slate-50/50"
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
              className="w-full mt-2 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-sm font-extrabold bg-teal-600 text-white hover:bg-teal-700 shadow-md shadow-teal-600/20 active:scale-95 transition-all disabled:opacity-60"
            >
              {loading ? (
                <span>Verifying credentials...</span>
              ) : (
                <>
                  <span>Log In to Hospital Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Registration Link */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-600 font-medium">
              New healthcare facility?{' '}
              <Link href="/signup" className="text-teal-600 hover:text-teal-800 font-black underline underline-offset-2">
                Register a fresh hospital account →
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
