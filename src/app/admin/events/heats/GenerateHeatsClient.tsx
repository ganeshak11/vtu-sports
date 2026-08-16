'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { generateHeats, getHeatsForEvent } from '@/app/actions/heats';

export function GenerateHeatsClient({ events }: { events: any[] }) {
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);
  
  const [heats, setHeats] = useState<any[]>([]);
  const [isLoadingHeats, setIsLoadingHeats] = useState(false);
  const [expandedHeat, setExpandedHeat] = useState<string | null>(null);

  const selectedEvent = events.find(e => e.id === selectedEventId);

  const fetchHeats = async (eventId: string) => {
    setIsLoadingHeats(true);
    const res = await getHeatsForEvent(eventId);
    if (res.heats) {
      setHeats(res.heats);
    } else {
      setHeats([]);
    }
    setIsLoadingHeats(false);
  };

  useEffect(() => {
    const loadData = async () => {
      if (selectedEventId) {
        await fetchHeats(selectedEventId);
        setExpandedHeat(null);
      } else {
        setHeats([]);
      }
    };
    loadData();
  }, [selectedEventId]);

  const handleGenerate = async () => {
    if (!selectedEventId) return;
    
    setIsLoading(true);
    setMessage(null);

    const res = await generateHeats(selectedEventId);
    
    if (res.success) {
      setMessage({ type: 'success', text: res.message || 'Heats generated successfully.' });
      await fetchHeats(selectedEventId);
    } else {
      setMessage({ type: 'error', text: res.error || 'Failed to generate heats.' });
    }
    
    setIsLoading(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <Card>
        <CardHeader>
          <CardTitle>Generate Track Heats</CardTitle>
        </CardHeader>
        <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {message && (
            <div style={{ 
              padding: '1rem', 
              borderRadius: 'var(--radius-sm)', 
              background: message.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
              color: message.type === 'success' ? 'var(--success)' : 'var(--danger)',
              border: `1px solid ${message.type === 'success' ? 'var(--success)' : 'var(--danger)'}`
            }}>
              {message.text}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Select Track Event</label>
            <select 
              value={selectedEventId} 
              onChange={(e) => {
                setSelectedEventId(e.target.value);
                setMessage(null);
              }}
              style={{ 
                padding: '0.75rem', 
                borderRadius: 'var(--radius-sm)', 
                background: 'var(--bg-secondary)', 
                color: 'var(--text-primary)', 
                border: '1px solid var(--border-color)',
                maxWidth: '400px'
              }}
            >
              <option value="" disabled>-- Select Event --</option>
              {events.map(ev => (
                <option key={ev.id} value={ev.id}>
                  {ev.name} ({ev.gender}) - {ev.registeredAthletes} Athletes
                </option>
              ))}
            </select>
            {selectedEvent && (
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                Registered Athletes: <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{selectedEvent.registeredAthletes}</span> 
                &nbsp;&nbsp;&bull;&nbsp;&nbsp; 
                Estimated Heats: <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{Math.ceil(selectedEvent.registeredAthletes / 8)}</span>
              </p>
            )}
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', margin: '0.5rem 0' }} />

          <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '1rem' }}>
            <Button 
              variant="primary" 
              onClick={handleGenerate} 
              isLoading={isLoading}
              disabled={!selectedEventId || selectedEvent?.registeredAthletes === 0}
            >
              Generate Heats
            </Button>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Warning: This will overwrite any existing heats and results for this event&apos;s first round.
            </span>
          </div>

        </CardContent>
      </Card>

      {/* Generated Heats Display */}
      {selectedEventId && (
        <Card>
          <CardHeader>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <CardTitle>Current Heats</CardTitle>
              {isLoadingHeats && <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Loading...</span>}
            </div>
          </CardHeader>
          <CardContent>
            {heats.length === 0 && !isLoadingHeats ? (
              <p style={{ color: 'var(--text-secondary)' }}>No heats generated for this event yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {heats.map(heat => (
                  <div key={heat.id} style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                    <div 
                      onClick={() => setExpandedHeat(expandedHeat === heat.id ? null : heat.id)}
                      style={{ 
                        padding: '1rem', 
                        background: 'var(--bg-tertiary)', 
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontWeight: 600
                      }}
                      className="hover-bg-secondary"
                    >
                      <span>{heat.name} ({heat.athletes?.length || 0} Athletes)</span>
                      <span>{expandedHeat === heat.id ? '▲' : '▼'}</span>
                    </div>
                    {expandedHeat === heat.id && (
                      <div style={{ padding: '1rem', background: 'var(--bg-primary)' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                              <th style={{ padding: '0.5rem' }}>Lane</th>
                              <th style={{ padding: '0.5rem' }}>Chest Number</th>
                              <th style={{ padding: '0.5rem' }}>College</th>
                            </tr>
                          </thead>
                          <tbody>
                            {heat.athletes?.map((ath: any, idx: number) => (
                              <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                <td style={{ padding: '0.5rem', fontWeight: 700, color: 'var(--accent-primary)' }}>{ath.lane_number}</td>
                                <td style={{ padding: '0.5rem', fontWeight: 600 }}>{ath.chest_number}</td>
                                <td style={{ padding: '0.5rem' }}>{ath.college_name || 'N/A'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
