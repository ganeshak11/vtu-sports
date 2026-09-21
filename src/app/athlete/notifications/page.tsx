'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';

interface NotificationItem {
  id: string;
  category: 'call_room' | 'logistics' | 'results' | 'ceremony';
  title: string;
  message: string;
  time: string;
  priority: 'high' | 'normal';
  icon: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: '1',
    category: 'call_room',
    title: 'Call Room Reporting Summons',
    message: 'All athletes for 100M Men (Heats 1-4) must report to the Call Room Marshalling Desk immediately with their assigned Bib numbers.',
    time: '10 mins ago',
    priority: 'high',
    icon: '📢'
  },
  {
    id: '2',
    category: 'logistics',
    title: 'Accreditation Desk Live',
    message: 'Welcome to Dr. ACS College of Engineering! Present your digital QR code from your Dashboard at the Accreditation Desk to receive your physical ID and Bib.',
    time: '45 mins ago',
    priority: 'normal',
    icon: '🎟️'
  },
  {
    id: '3',
    category: 'logistics',
    title: 'Hostel Check-In Activated',
    message: 'Campus hostel desks are operational. Present your athlete QR badge to the warden for single-tap check-in. No room keys needed.',
    time: '2 hours ago',
    priority: 'normal',
    icon: '🏠'
  },
  {
    id: '4',
    category: 'results',
    title: 'Official Photo Finish Results Published',
    message: 'Official results and rankings for 400M Women Round 1 have been certified and published to the Live Results board.',
    time: '3 hours ago',
    priority: 'normal',
    icon: '⏱️'
  },
  {
    id: '5',
    category: 'ceremony',
    title: 'Medal Presentation Ceremony',
    message: 'Podium medal presentation for Shot Put Men and 1500M Women will take place at 04:30 PM at the Main Pavilion.',
    time: 'Today, 08:30 AM',
    priority: 'normal',
    icon: '🥇'
  },
  {
    id: '6',
    category: 'logistics',
    title: 'Canteen Meal Timings',
    message: 'Breakfast: 07:00 - 10:00 AM | Lunch: 12:30 - 03:00 PM | Dinner: 07:30 - 10:00 PM. Present your QR code at the scanner counters.',
    time: 'Yesterday',
    priority: 'normal',
    icon: '🍽️'
  }
];

export default function AthleteNotificationsPage() {
  const [filter, setFilter] = useState<'all' | 'call_room' | 'logistics' | 'results'>('all');
  const [notifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const filteredNotices = notifications.filter(n => filter === 'all' || n.category === filter);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      <div>
        <div style={{ display: 'inline-block', padding: '0.2rem 0.6rem', borderRadius: '4px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-primary)', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          Screen 4 of 4 &bull; Official Bulletins
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem' }}>Notifications & Alerts</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Live Call Room summons, timetable revisions, and logistics announcements
        </p>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
        {[
          { id: 'all', label: 'All Notices' },
          { id: 'call_room', label: '📢 Call Room' },
          { id: 'logistics', label: '🏠 Logistics & Meals' },
          { id: 'results', label: '⏱️ Results' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            style={{
              padding: '0.45rem 0.75rem',
              borderRadius: '999px',
              border: filter === tab.id ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
              background: filter === tab.id ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-tertiary)',
              color: filter === tab.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.75rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notification Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {filteredNotices.map((notice) => {
          const isHighPriority = notice.priority === 'high';

          return (
            <Card
              key={notice.id}
              style={{
                border: isHighPriority ? '1.5px solid var(--danger)' : '1px solid var(--border-color)',
                background: isHighPriority ? 'rgba(239, 68, 68, 0.05)' : 'var(--bg-secondary)'
              }}
            >
              <CardContent style={{ padding: '1rem', display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>{notice.icon}</span>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <h3 style={{ 
                      fontSize: '0.95rem', 
                      fontWeight: 700, 
                      color: isHighPriority ? 'var(--danger)' : 'var(--text-primary)',
                      margin: 0
                    }}>
                      {notice.title}
                    </h3>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                      {notice.time}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                    {notice.message}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

    </div>
  );
}
