import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { LiveResultsClient } from './LiveResultsClient';
import './live.css';

export const revalidate = 15; // Revalidate every 15 seconds

export default async function LivePage() {
  return (
    <div className="live-page-container">
      <Navbar />
      <main className="live-main-content">
        <LiveResultsClient />
      </main>
    </div>
  );
}
