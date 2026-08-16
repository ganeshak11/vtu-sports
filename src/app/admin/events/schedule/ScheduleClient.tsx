'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { scheduleEventRound } from '@/app/actions/admin';

export default function ScheduleClient({ events }: { events: any[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempTime, setTempTime] = useState('');
  const [tempLocation, setTempLocation] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Flatten events and rounds
  const rounds = events.flatMap(e => 
    e.event_rounds.map((r: any) => ({
      ...r,
      eventName: e.name,
      gender: e.gender,
      category: e.category
    }))
  ).sort((a, b) => {
    if (!a.scheduled_time && b.scheduled_time) return -1;
    if (a.scheduled_time && !b.scheduled_time) return 1;
    if (a.scheduled_time && b.scheduled_time) {
      return new Date(a.scheduled_time).getTime() - new Date(b.scheduled_time).getTime();
    }
    return 0;
  });

  const startEditing = (round: any) => {
    setEditingId(round.id);
    if (round.scheduled_time) {
      // Format to YYYY-MM-DDThh:mm for datetime-local input
      const date = new Date(round.scheduled_time);
      // We need to pad properly
      const tzoffset = date.getTimezoneOffset() * 60000; // offset in milliseconds
      const localISOTime = (new Date(date.getTime() - tzoffset)).toISOString().slice(0, -1);
      setTempTime(localISOTime.substring(0, 16));
    } else {
      setTempTime('');
    }
    setTempLocation(round.location || '');
  };

  const handleSave = async (roundId: string) => {
    setIsLoading(true);
    let isoTime = null;
    if (tempTime) {
      // convert local datetime-local to true ISO
      isoTime = new Date(tempTime).toISOString();
    }
    const res = await scheduleEventRound(roundId, isoTime, tempLocation);
    if (res.success) {
      setEditingId(null);
    } else {
      alert(res.error);
    }
    setIsLoading(false);
  };

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
            <th style={{ padding: '1rem', fontWeight: 500 }}>Event</th>
            <th style={{ padding: '1rem', fontWeight: 500 }}>Round</th>
            <th style={{ padding: '1rem', fontWeight: 500 }}>Scheduled Time</th>
            <th style={{ padding: '1rem', fontWeight: 500 }}>Location</th>
            <th style={{ padding: '1rem', fontWeight: 500, textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rounds.map((round) => (
            <tr key={round.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <td style={{ padding: '1rem', fontWeight: 600 }}>
                {round.eventName} <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 400 }}>({round.gender})</span>
              </td>
              <td style={{ padding: '1rem', color: 'var(--accent-secondary)' }}>{round.round_type}</td>
              
              {editingId === round.id ? (
                <>
                  <td style={{ padding: '1rem' }}>
                    <input 
                      type="datetime-local" 
                      value={tempTime}
                      onChange={(e) => setTempTime(e.target.value)}
                      style={{ padding: '0.5rem', background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                    />
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <input 
                      type="text" 
                      value={tempLocation}
                      placeholder="e.g. Main Track"
                      onChange={(e) => setTempLocation(e.target.value)}
                      style={{ padding: '0.5rem', background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                    />
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <Button variant="secondary" size="sm" onClick={() => setEditingId(null)}>Cancel</Button>
                      <Button variant="primary" size="sm" isLoading={isLoading} onClick={() => handleSave(round.id)}>Save</Button>
                    </div>
                  </td>
                </>
              ) : (
                <>
                  <td style={{ padding: '1rem', fontWeight: 500 }}>
                    {round.scheduled_time ? new Date(round.scheduled_time).toLocaleString() : <span style={{ color: 'var(--warning)' }}>Unscheduled</span>}
                  </td>
                  <td style={{ padding: '1rem' }}>{round.location || '-'}</td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <Button variant="ghost" size="sm" onClick={() => startEditing(round)}>Edit</Button>
                  </td>
                </>
              )}
            </tr>
          ))}
          {rounds.length === 0 && (
            <tr>
              <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                No event rounds found. Create an event first.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
