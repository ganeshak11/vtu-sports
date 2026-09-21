'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { loginWithId } from '../actions/auth';
import './login.css';

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
    <div className="login-container">
      {/* Top Header Back Link */}
      <div className="login-top-bar">
        <Link href="/" className="login-back-link">
          <span>&larr; Back to Home & Live Results</span>
        </Link>
        <span className="login-event-badge">
          VTU Athletics 2026
        </span>
      </div>

      {/* Main Login Card */}
      <div className="login-card-wrapper">
        <div className="login-card">
          <div className="login-header">
            {/* Dual Logos */}
            <div className="login-logos">
              <img src="/vtu.png" alt="VTU Logo" className="login-logo-img" />
              <div className="login-logo-divider"></div>
              <img src="/acsce-logo.png" alt="Dr. ACSCE Logo" className="login-logo-img" />
            </div>

            <h1 className="login-college-name">
              Dr. ACS College of Engineering
            </h1>
            <p className="login-subtitle">
              Official Portal Access &bull; 24th VTU Athletics Meet 2026
            </p>
          </div>

          <div className="login-body">
            <form onSubmit={handleSubmit} className="login-form">
              <div>
                <label htmlFor="userId" className="login-label">
                  Enter Identifier, College Access Code, Bib #, or PIN:
                </label>
                <div className="login-input-group">
                  <input
                    id="userId"
                    name="userId"
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="e.g. ACSCE-M, 1234, ADMIN, 151, WARDEN"
                    required
                    className="login-input"
                  />
                  {inputValue && (
                    <button
                      type="button"
                      onClick={() => setInputValue('')}
                      className="login-clear-btn"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {error && (
                <div className="login-error-alert">
                  ⚠️ {error}
                </div>
              )}

              <button 
                type="submit" 
                disabled={isLoading}
                className="login-submit-btn"
              >
                {isLoading ? 'Authenticating...' : 'Sign In to Portal →'}
              </button>
            </form>

            {/* Quick Demo Shortcuts Launchpad */}
            <div className="login-launchpad-section">
              <div className="login-launchpad-header">
                <span className="login-launchpad-title">
                  ⚡ 1-Click Presentation Launchpad
                </span>
                <span className="login-launchpad-hint">
                  Click any card to fill
                </span>
              </div>

              <div className="login-launchpad-grid">
                {DEMO_SHORTCUTS.map((item) => (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => handleShortcutClick(item.code)}
                    className="login-shortcut-card"
                  >
                    <span className="login-shortcut-icon">{item.icon}</span>
                    <div className="login-shortcut-info">
                      <div className="login-shortcut-name">{item.label}</div>
                      <div className="login-shortcut-code">
                        Code: <span style={{ color: item.color, fontWeight: 800 }}>{item.code}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="login-footer-text">
        Host Institution: Dr. ACS College of Engineering &bull; Kambipura, Mysore Road, Bengaluru
      </div>
    </div>
  );
}
