import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import './admin.css';
import { getSession } from '@/lib/session';
import AdminLogin from './AdminLogin';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // Intercept the entire layout if not authenticated as admin
  if (!session.id || session.role !== 'admin') {
    return <AdminLogin />;
  }

  return (
    <div className="admin-layout">
      <Navbar />
      <div className="admin-container">
        <Sidebar />
        <main className="admin-main">
          {children}
        </main>
      </div>
    </div>
  );
}
