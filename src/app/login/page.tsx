'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { loginWithId } from '../actions/auth';

interface DemoShortcut {
  label: string;
  code: string;
  role: string;
  icon: string;
  color: string;
}

const DEMO_SHORTCUTS: DemoShortcut[] = [
  { label: 'Dr. ACSCE Boys Squad', code: 'ACSCE-M', role: 'Principal / PED', icon: '🏫', color: '#2563eb' },
  { label: 'Dr. ACSCE Girls Squad', code: 'ACSCE-G', role: 'Principal / PED', icon: '🏫', color: '#7c3aed' },
  { label: 'MIT Mysore Boys Squad', code: 'MITM-M', role: 'Principal / PED', icon: '🏫', color: '#0284c7' },
  { label: 'RVCE Bangalore Squad', code: 'RVCE-M', role: 'Principal / PED', icon: '🏫', color: '#059669' },
  { label: 'Chief Referee / Timing', code: '1234', role: 'Results & Call Room', icon: '⏱️', color: '#8b5cf6' },
  { label: 'Meet Director / Admin', code: 'ADMIN', role: 'Administration', icon: '🛡️', color: '#db2777' },
  { label: 'Campus Hostel Warden', code: '2345', role: 'Accommodation', icon: '🏢', color: '#0891b2' },
  { label: 'Canteen Meal Pass Desk', code: '3456', role: 'Food Operations', icon: '🍽️', color: '#d97706' },
  { label: 'Athlete (Nitin Patil)', code: '151', role: 'Bib #151 (Men Long Jump)', icon: '🏃', color: '#16a34a' },
  { label: 'Athlete (Neha Singh)', code: '2001', role: 'Bib #2001 (Women Heptathlon)', icon: '🏃', color: '#9333ea' },
];

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    const result = await loginWithId(formData);
    
    if (result && result.error) {
      setError(result.error);
      setIsLoading(false);
    }
  };

  const handleShortcutClick = (code: string) => {
    setInputValue(code);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col justify-between py-8 px-4">
      {/* Top Header Back Link */}
      <div className="max-w-xl mx-auto w-full flex justify-between items-center mb-6">
        <Link href="/" className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 transition-colors">
          <span>&larr; Back to Home & Live Results</span>
        </Link>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
          VTU Athletics 2026
        </span>
      </div>

      {/* Main Login Card */}
      <div className="max-w-xl mx-auto w-full">
        <Card className="shadow-2xl border-slate-200 bg-white">
          <CardHeader className="text-center pb-4 pt-8 px-6">
            {/* Dual Logos */}
            <div className="flex items-center justify-center gap-6 mb-4">
              <img src="/vtu.png" alt="VTU Logo" className="h-12 w-auto object-contain" />
              <div className="h-8 w-px bg-slate-200"></div>
              <img src="/acsce-logo.png" alt="Dr. ACSCE Logo" className="h-11 w-auto object-contain" />
            </div>

            <CardTitle className="text-xl font-extrabold text-slate-900">
              Dr. ACS College of Engineering
            </CardTitle>
            <p className="text-xs font-medium text-slate-500 mt-1">
              Official Portal Access &bull; 24th VTU Athletics Meet 2026
            </p>
          </CardHeader>

          <CardContent className="px-6 sm:px-8 pb-8">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label htmlFor="userId" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Enter Identifier, College Access Code, Bib #, or PIN:
                </label>
                <div className="relative">
                  <input
                    id="userId"
                    name="userId"
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="e.g. ACSCE-M, 1234, ADMIN, 151, WARDEN"
                    required
                    className="w-full px-4 py-3 rounded-xl border-2 border-blue-500 bg-slate-50 text-slate-900 font-bold text-base focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all uppercase tracking-wider placeholder:normal-case placeholder:font-normal placeholder:text-slate-400"
                  />
                  {inputValue && (
                    <button
                      type="button"
                      onClick={() => setInputValue('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {error && (
                <div className="text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-xl p-3 animate-fade-in">
                  ⚠️ {error}
                </div>
              )}

              <Button 
                type="submit" 
                variant="primary" 
                size="lg" 
                isLoading={isLoading} 
                className="w-full justify-center py-3.5 text-base font-bold shadow-md shadow-blue-500/20"
              >
                Sign In to Portal &rarr;
              </Button>
            </form>

            {/* Quick Demo Shortcuts Launchpad */}
            <div className="mt-8 pt-6 border-t border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  ⚡ 1-Click Presentation Launchpad
                </span>
                <span className="text-[11px] text-blue-600 font-semibold">
                  Click any card to fill
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 max-h-[260px] overflow-y-auto pr-1">
                {DEMO_SHORTCUTS.map((item) => (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => handleShortcutClick(item.code)}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-blue-400 text-left transition-all group"
                  >
                    <span className="text-lg group-hover:scale-110 transition-transform">{item.icon}</span>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-900 truncate">{item.label}</div>
                      <div className="text-[10px] text-slate-500 font-mono font-bold truncate">
                        Code: <span style={{ color: item.color }}>{item.code}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer Info */}
      <div className="text-center text-xs text-slate-500 mt-6">
        Host Institution: Dr. ACS College of Engineering &bull; Kambipura, Mysore Road, Bengaluru
      </div>
    </div>
  );
}
