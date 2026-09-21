'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import './Navbar.css';

interface PortalOption {
  title: string;
  desc: string;
  href: string;
  icon: string;
  color: string;
  badge?: string;
}

const PORTAL_OPTIONS: PortalOption[] = [
  {
    title: 'College Delegations',
    desc: 'PEDs & Principals athlete registration & payment',
    href: '/principal',
    icon: '🏫',
    color: '#3b82f6',
    badge: 'Code: [CODE]-M/G'
  },
  {
    title: 'Participant Athlete App',
    desc: 'QR badge, registered events, schedule & food pass',
    href: '/athlete',
    icon: '🏃',
    color: '#10b981',
    badge: 'Login: Bib/USN'
  },
  {
    title: 'Official Results Engine',
    desc: 'Photo finish file import & 3-attempt field matrix',
    href: '/referee/results',
    icon: '⏱️',
    color: '#8b5cf6',
    badge: 'PIN: 1234'
  },
  {
    title: 'Call Room Marshalling',
    desc: 'Athlete check-in scanner & DNS reserve substitution',
    href: '/referee',
    icon: '📋',
    color: '#f59e0b',
    badge: 'PIN: 1234'
  },
  {
    title: 'Meet Administration',
    desc: 'Block bibs, ID card badges & accreditation desk',
    href: '/admin',
    icon: '🛡️',
    color: '#ec4899',
    badge: 'Admin'
  },
  {
    title: 'Hostel Accommodation',
    desc: 'Single-tap hostel campus check-in scanner',
    href: '/warden',
    icon: '🏢',
    color: '#06b6d4',
    badge: 'PIN: 2345'
  },
  {
    title: 'Canteen Food Operations',
    desc: 'Single-tap meal pass verification scanner',
    href: '/volunteer',
    icon: '🍽️',
    color: '#14b8a6',
    badge: 'PIN: 3456'
  }
];

export const Navbar: React.FC = () => {
  const [isPortalsOpen, setIsPortalsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsPortalsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setIsPortalsOpen(false);
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header className="global-navbar-wrapper">
      {/* Top University Brand Bar */}
      <div className="navbar-top-strip">
        <div className="navbar-top-content">
          <div className="top-brand-text">
            <span>Visvesvaraya Technological University (VTU) &bull; 24th Inter-Collegiate Athletics Meet 2026</span>
          </div>
          <div className="top-status-indicator">
            <span className="live-dot-pulse"></span>
            <span className="status-label">Host: Dr. ACS College of Engineering, Bengaluru</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <nav className="global-navbar glass-panel">
        <div className="navbar-left">
          <Link href="/" className="brand-link" title="VTU SportsOS Home">
            <div className="logos-group">
              <img 
                src="/vtu.png" 
                alt="VTU Logo" 
                className="brand-logo vtu-logo" 
              />
              <div className="brand-divider"></div>
              <img 
                src="/acsce-logo.png" 
                alt="Dr. ACS College of Engineering Logo" 
                className="brand-logo acsce-logo" 
              />
            </div>
            <div className="brand-titles">
              <span className="brand-name">VTU SportsOS</span>
              <span className="brand-sub">Dr. ACSCE Athletics</span>
            </div>
          </Link>
        </div>

        {/* Center / Desktop Links */}
        <div className="navbar-center">
          <Link 
            href="/" 
            className={`nav-link ${pathname === '/' ? 'active' : ''}`}
          >
            Home
          </Link>
          <Link 
            href="/live" 
            className={`nav-link live-link ${pathname === '/live' ? 'active' : ''}`}
          >
            <span className="live-beacon"></span>
            Live Results
          </Link>
          <Link 
            href="/leaderboard" 
            className={`nav-link ${pathname === '/leaderboard' ? 'active' : ''}`}
          >
            🏆 Leaderboard
          </Link>
          <Link 
            href="/athlete/schedule" 
            className={`nav-link ${pathname === '/athlete/schedule' ? 'active' : ''}`}
          >
            📅 Schedule
          </Link>
        </div>

        {/* Right Section: Portal Switcher & Login */}
        <div className="navbar-right">
          {/* Portals Launchpad Dropdown */}
          <div className="portals-dropdown-container" ref={dropdownRef}>
            <button
              type="button"
              className={`portals-trigger-btn ${isPortalsOpen ? 'active' : ''}`}
              onClick={() => setIsPortalsOpen(!isPortalsOpen)}
              aria-expanded={isPortalsOpen}
            >
              <span className="trigger-icon">🚀</span>
              <span className="trigger-text">Launch Portal</span>
              <span className={`trigger-chevron ${isPortalsOpen ? 'open' : ''}`}>▼</span>
            </button>

            {isPortalsOpen && (
              <div className="portals-dropdown-menu glass-panel animate-fade-in">
                <div className="dropdown-header">
                  <span className="dropdown-title">Select Operational Portal</span>
                  <span className="dropdown-hint">Instant access for meet officials & participants</span>
                </div>
                
                <div className="portals-grid-menu">
                  {PORTAL_OPTIONS.map((item) => (
                    <Link 
                      key={item.href}
                      href={item.href}
                      className="portal-menu-item"
                    >
                      <div className="item-icon-wrapper" style={{ backgroundColor: `${item.color}15`, color: item.color }}>
                        <span className="item-icon">{item.icon}</span>
                      </div>
                      <div className="item-details">
                        <div className="item-top">
                          <span className="item-title">{item.title}</span>
                          {item.badge && <span className="item-badge">{item.badge}</span>}
                        </div>
                        <p className="item-desc">{item.desc}</p>
                      </div>
                    </Link>
                  ))}
                </div>

                <div className="dropdown-footer">
                  <Link href="/login" className="dropdown-login-link">
                    <span>🔑 Direct PIN / Access Code Login Screen &rarr;</span>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Quick Login Button */}
          <Link href="/login" className="login-btn-header">
            <span>Login</span>
          </Link>

          {/* Mobile Hamburger Toggle */}
          <button 
            type="button" 
            className="mobile-toggle-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="mobile-drawer glass-panel animate-fade-in">
          <div className="mobile-links">
            <Link href="/" className="mobile-link">🏠 Home</Link>
            <Link href="/live" className="mobile-link">🔴 Live Results Feed</Link>
            <Link href="/leaderboard" className="mobile-link">🏆 Championship Leaderboard</Link>
            <Link href="/athlete/schedule" className="mobile-link">📅 4-Day Schedule</Link>
            <div className="mobile-divider"></div>
            <span className="mobile-section-heading">Operational Portals</span>
            {PORTAL_OPTIONS.map((item) => (
              <Link key={item.href} href={item.href} className="mobile-portal-link">
                <span>{item.icon}</span>
                <span>{item.title}</span>
              </Link>
            ))}
            <div className="mobile-divider"></div>
            <Link href="/login" className="mobile-login-btn">
              🔑 Portal Login / PIN Switcher
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
