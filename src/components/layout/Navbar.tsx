import React from 'react';
import Link from 'next/link';
import './Navbar.css';

export const Navbar: React.FC = () => {
  return (
    <nav className="navbar glass-panel">
      <div className="navbar-brand">
        <Link href="/" className="navbar-logo hover-lift" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <img src="/vtu.png" alt="VTU Logo" style={{ height: '30px', width: 'auto', objectFit: 'contain' }} />
          <img src="/mit.png" alt="MIT Logo" style={{ height: '30px', width: 'auto', objectFit: 'contain' }} />
        </Link>
      </div>
      
      <div className="navbar-menu">
        <Link href="/admin" className="navbar-link hover-lift">Dashboard</Link>
        <Link href="/live" className="navbar-link hover-lift">Live Results</Link>
        <div className="navbar-profile">
          <div className="avatar hover-lift">A</div>
        </div>
      </div>
    </nav>
  );
};
