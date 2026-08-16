'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import './Sidebar.css';

const menuItems = [
  { name: 'Dashboard', path: '/admin' },
  { name: 'Arrivals Tracker', path: '/admin/arrivals' },
  { name: 'Events', path: '/admin/events' },
  { name: 'Event Scheduler', path: '/admin/events/schedule' },
  { name: 'Heat Generation', path: '/admin/events/heats' },
  { name: 'Athletes', path: '/admin/athletes' },
  { name: 'Accommodations', path: '/admin/accommodations' },
  { name: 'Food Analytics', path: '/admin/food' },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <aside className="sidebar glass-panel">
      <div className="sidebar-header" style={{ padding: '2rem 1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <img src="/vtu.png" alt="VTU Logo" style={{ height: '40px', width: 'auto', objectFit: 'contain' }} />
          <img src="/mit.png" alt="MIT Logo" style={{ height: '40px', width: 'auto', objectFit: 'contain' }} />
        </div>
        <h2 className="sidebar-title" style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>Admin Hub</h2>
      </div>
      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const isActive = pathname === item.path || (pathname.startsWith(item.path) && item.path !== '/admin');
          return (
            <Link 
              key={item.name} 
              href={item.path}
              className={`sidebar-link ${isActive ? 'active' : ''} hover-lift`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
