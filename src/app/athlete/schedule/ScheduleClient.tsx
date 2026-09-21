'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';

export interface ScheduleEvent {
  id: string;
  name: string;
  gender: string;
  category: string;
  roundType: string;
  time: string;
  day: number;
  venue: string;
  status: 'Upcoming' | 'Live' | 'Finished';
  isUserRegistered?: boolean;
}

interface Props {
  events: ScheduleEvent[];
  myEventIds: string[];
}

export default function ScheduleClient({ events, myEventIds }: Props) {
  const [activeDay, setActiveDay] = useState<number>(1);
  const [filterCategory, setFilterCategory] = useState<'all' | 'track' | 'field'>('all');
  const [onlyMyEvents, setOnlyMyEvents] = useState(false);

  const dayEvents = events.filter(e => {
    const matchesDay = e.day === activeDay;
    const matchesCat = filterCategory === 'all' || e.category === filterCategory;
    const matchesMine = !onlyMyEvents || e.isUserRegistered || myEventIds.includes(e.id);
    return matchesDay && matchesCat && matchesMine;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Day Switcher */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem' }}>
        {[1, 2, 3, 4].map(day => (
          <button
            key={day}
            onClick={() => setActiveDay(day)}
            style={{
              padding: '0.6rem 0.25rem',
              borderRadius: 'var(--radius-sm)',
              border: activeDay === day ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
              background: activeDay === day ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-tertiary)',
              color: activeDay === day ? 'var(--accent-primary)' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer',
              textAlign: 'center'
            }}
          >
            Day {day}
          </button>
        ))}
      </div>

      {/* Filter Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.8rem' }}>
        <div style={{ display: 'flex', gap: '0.35rem' }}>
          <button
            onClick={() => setFilterCategory('all')}
            style={{
              padding: '0.3rem 0.6rem',
              borderRadius: '999px',
              border: 'none',
              background: filterCategory === 'all' ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
              color: filterCategory === 'all' ? '#fff' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.75rem'
            }}
          >
            All
          </button>
          <button
            onClick={() => setFilterCategory('track')}
            style={{
              padding: '0.3rem 0.6rem',
              borderRadius: '999px',
              border: 'none',
              background: filterCategory === 'track' ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
              color: filterCategory === 'track' ? '#fff' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.75rem'
            }}
          >
            Track
          </button>
          <button
            onClick={() => setFilterCategory('field')}
            style={{
              padding: '0.3rem 0.6rem',
              borderRadius: '999px',
              border: 'none',
              background: filterCategory === 'field' ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
              color: filterCategory === 'field' ? '#fff' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.75rem'
            }}
          >
            Field
          </button>
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>
          <input
            type="checkbox"
            checked={onlyMyEvents}
            onChange={(e) => setOnlyMyEvents(e.target.checked)}
          />
          <span style={{ fontWeight: 600 }}>My Events Only</span>
        </label>
      </div>

      {/* Schedule Timetable List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {dayEvents.length === 0 ? (
          <Card>
            <CardContent style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              No events scheduled for Day {activeDay} matching current filters.
            </CardContent>
          </Card>
        ) : (
          dayEvents.map((item, idx) => {
            const isMine = item.isUserRegistered || myEventIds.includes(item.id);

            return (
              <Card 
                key={idx}
                style={{
                  border: isMine ? '1.5px solid var(--accent-primary)' : '1px solid var(--border-color)',
                  background: isMine ? 'rgba(59, 130, 246, 0.05)' : 'var(--bg-secondary)'
                }}
              >
                <CardContent style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                  
                  {/* Time & Venue */}
                  <div style={{ minWidth: '70px', textAlign: 'center', paddingRight: '0.75rem', borderRight: '1px solid var(--border-color)' }}>
                    <strong style={{ fontSize: '0.95rem', color: 'var(--accent-primary)', display: 'block' }}>
                      {item.time}
                    </strong>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                      {item.venue}
                    </span>
                  </div>

                  {/* Details */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                      <span style={{ 
                        fontSize: '0.65rem', 
                        padding: '0.1rem 0.4rem', 
                        borderRadius: '3px', 
                        background: item.category === 'track' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(236, 72, 153, 0.15)',
                        color: item.category === 'track' ? '#60a5fa' : '#f472b6',
                        fontWeight: 700,
                        textTransform: 'uppercase'
                      }}>
                        {item.category}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                        {item.gender} &bull; {item.roundType}
                      </span>
                      {isMine && (
                        <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: '3px', background: 'rgba(16, 185, 129, 0.2)', color: 'var(--success)', fontWeight: 700 }}>
                          ★ YOUR EVENT
                        </span>
                      )}
                    </div>

                    <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>
                      {item.name}
                    </h3>
                  </div>

                  {/* Status */}
                  <div>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      background: item.status === 'Live' ? 'rgba(239, 68, 68, 0.15)' : item.status === 'Finished' ? 'var(--bg-tertiary)' : 'rgba(59, 130, 246, 0.1)',
                      color: item.status === 'Live' ? 'var(--danger)' : item.status === 'Finished' ? 'var(--text-secondary)' : 'var(--accent-primary)'
                    }}>
                      {item.status === 'Live' ? '🔴 Live' : item.status}
                    </span>
                  </div>

                </CardContent>
              </Card>
            );
          })
        )}
      </div>

    </div>
  );
}
