'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  submitResults, 
  submitFieldAttempts, 
  importPhotoFinishResults,
  FieldAttemptPayload,
  ResultPayload 
} from '@/app/actions/results';

interface EventData {
  id: string;
  name: string;
  gender: string;
  category: string;
  measurement_metric: string;
}

interface RoundData {
  id: string;
  event_id: string;
  round_type: string;
  scheduled_time: string | null;
  sequence_number: number;
}

interface HeatData {
  id: string;
  round_id: string;
  heat_name: string;
  start_time: string | null;
}

interface ResultRecord {
  id: string;
  round_id: string;
  event_id: string;
  heat_id: string | null;
  profile_id: string;
  lane_number: number | null;
  status: string | null;
  attempt_1: number | null;
  attempt_2: number | null;
  attempt_3: number | null;
  best_mark: number | null;
  final_result: number | null;
  rank: number | null;
  qualified: boolean | null;
  event_heats?: {
    id: string;
    heat_name: string;
  } | null;
  profiles: {
    id: string;
    sslc_name?: string;
    full_name: string;
    bib_number?: string;
    chest_number?: string;
    college_name?: string;
  } | null;
}

interface Props {
  initialEventId?: string;
  events: EventData[];
  rounds: RoundData[];
  heats: HeatData[];
  results: ResultRecord[];
}

export const ResultsEntryClient: React.FC<Props> = ({
  initialEventId,
  events,
  rounds,
  heats,
  results
}) => {
  const [selectedEventId, setSelectedEventId] = useState<string>(initialEventId || events[0]?.id || '');
  const [selectedRoundId, setSelectedRoundId] = useState<string>('');
  const [selectedHeatId, setSelectedHeatId] = useState<string>('');
  
  // Track State
  const [photoFinishText, setPhotoFinishText] = useState('');
  const [manualTimes, setManualTimes] = useState<Record<string, string>>({});
  const [athleteStatuses, setAthleteStatuses] = useState<Record<string, 'FINISHED' | 'DNS' | 'DNF' | 'DQ'>>({});
  
  // Field State
  const [attemptsData, setAttemptsData] = useState<Record<string, { att1: string; att2: string; att3: string }>>({});
  
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string; details?: string[] } | null>(null);

  const selectedEvent = events.find(e => e.id === selectedEventId);
  const currentRounds = rounds.filter(r => r.event_id === selectedEventId);

  // Sync selected round when event changes
  useEffect(() => {
    if (currentRounds.length > 0 && !currentRounds.some(r => r.id === selectedRoundId)) {
      setSelectedRoundId(currentRounds[0].id);
    }
  }, [selectedEventId, currentRounds]);

  // Current heats for the active round
  const currentHeats = heats.filter(h => h.round_id === selectedRoundId);

  // Sync selected heat when round changes
  useEffect(() => {
    if (currentHeats.length > 0) {
      if (!currentHeats.some(h => h.id === selectedHeatId)) {
        setSelectedHeatId(currentHeats[0].id);
      }
    } else {
      setSelectedHeatId('');
    }
  }, [selectedRoundId, currentHeats.length]);

  // All results for the selected round
  const roundResults = results.filter(r => r.round_id === selectedRoundId);

  // Initialize input state and statuses when round changes
  useEffect(() => {
    const timesMap: Record<string, string> = {};
    const statusMap: Record<string, 'FINISHED' | 'DNS' | 'DNF' | 'DQ'> = {};
    const attMap: Record<string, { att1: string; att2: string; att3: string }> = {};

    roundResults.forEach(r => {
      if (r.final_result !== null) {
        timesMap[r.profile_id] = r.final_result.toString();
      }
      
      const st = (r.status as any) || 'FINISHED';
      if (st === 'DNS' || st === 'DNF' || st === 'DQ') {
        statusMap[r.profile_id] = st;
      } else {
        statusMap[r.profile_id] = 'FINISHED';
      }

      attMap[r.profile_id] = {
        att1: r.attempt_1 !== null ? r.attempt_1.toString() : '',
        att2: r.attempt_2 !== null ? r.attempt_2.toString() : '',
        att3: r.attempt_3 !== null ? r.attempt_3.toString() : ''
      };
    });

    setManualTimes(timesMap);
    setAthleteStatuses(statusMap);
    setAttemptsData(attMap);
    setMessage(null);
  }, [selectedRoundId]);

  const isTrack = selectedEvent?.category === 'track' || selectedEvent?.measurement_metric === 'time';

  // Filter athletes strictly for the active heat (or all if selected or field)
  const activeResults = React.useMemo(() => {
    if (currentHeats.length > 0 && selectedHeatId && selectedHeatId !== 'ALL') {
      return roundResults.filter(r => r.heat_id === selectedHeatId);
    }
    return roundResults;
  }, [roundResults, selectedHeatId, currentHeats.length]);

  const activeHeat = currentHeats.find(h => h.id === selectedHeatId);

  // Handle Photo Finish File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setPhotoFinishText(content || '');
    };
    reader.readAsText(file);
  };

  // Insert Sample Photo Finish Data (strictly for athletes in the selected heat!)
  const handleInsertSamplePhotoFinish = () => {
    if (activeResults.length === 0) {
      alert('No seeded athletes in this heat.');
      return;
    }

    const sampleLines = activeResults.map((r, i) => {
      const lane = r.lane_number || (i + 1);
      const bib = r.profiles?.bib_number || r.profiles?.chest_number || `${100 + i}`;
      const time = (10.20 + i * 0.15 + (Math.random() * 0.08)).toFixed(3);
      return `${lane}, ${bib}, ${time}`;
    });

    const heatTitle = activeHeat ? activeHeat.heat_name : 'Heat 1';
    setPhotoFinishText(`# FinishLynx / Omega LIF File (${heatTitle})\n# Lane, Bib, Time(s)\n` + sampleLines.join('\n'));
  };

  // Submit Photo Finish File (scoped to the selected heat!)
  const handleImportPhotoFinish = async () => {
    if (!photoFinishText.trim()) {
      setMessage({ type: 'error', text: 'Please paste photo finish data or upload a timing file.' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    const heatScope = selectedHeatId && selectedHeatId !== 'ALL' ? selectedHeatId : undefined;
    const res = await importPhotoFinishResults(selectedRoundId, photoFinishText, heatScope);
    if (res.success) {
      setMessage({
        type: 'success',
        text: res.message || 'Photo finish results imported successfully!'
      });
      setPhotoFinishText('');
    } else {
      setMessage({
        type: 'error',
        text: res.error || 'Failed to import photo finish file.',
        details: res.unmatchedDetails
      });
    }

    setIsLoading(false);
  };

  // Submit Manual Track Times
  const handleManualTrackSubmit = async () => {
    setIsLoading(true);
    setMessage(null);

    const payload: ResultPayload[] = activeResults.map(r => {
      const st = athleteStatuses[r.profile_id] || 'FINISHED';
      const timeVal = parseFloat(manualTimes[r.profile_id]);
      return {
        athleteId: r.profile_id,
        result: st === 'FINISHED' && !isNaN(timeVal) ? timeVal : null,
        status: st
      };
    });

    const hasAnyInput = payload.some(p => p.result !== null || p.status !== 'FINISHED');
    if (!hasAnyInput) {
      setMessage({ type: 'error', text: 'Please enter at least one timing result or status change.' });
      setIsLoading(false);
      return;
    }

    const heatScope = selectedHeatId && selectedHeatId !== 'ALL' ? selectedHeatId : undefined;
    const res = await submitResults(selectedRoundId, payload, heatScope);
    if (res.success) {
      setMessage({ 
        type: 'success', 
        text: `Results saved & ranks updated for ${activeHeat ? activeHeat.heat_name : 'this round'}!` 
      });
    } else {
      setMessage({ type: 'error', text: res.error || 'Failed to submit results' });
    }

    setIsLoading(false);
  };

  // Handle Field Attempt Change
  const handleAttemptChange = (athleteId: string, field: 'att1' | 'att2' | 'att3', value: string) => {
    setAttemptsData(prev => ({
      ...prev,
      [athleteId]: {
        ...(prev[athleteId] || { att1: '', att2: '', att3: '' }),
        [field]: value
      }
    }));
  };

  // Submit Field Attempts
  const handleSubmitFieldAttempts = async () => {
    setIsLoading(true);
    setMessage(null);

    const payload: FieldAttemptPayload[] = roundResults.map(r => {
      const data = attemptsData[r.profile_id] || { att1: '', att2: '', att3: '' };
      const att1 = parseFloat(data.att1);
      const att2 = parseFloat(data.att2);
      const att3 = parseFloat(data.att3);

      return {
        athleteId: r.profile_id,
        attempt1: !isNaN(att1) && att1 > 0 ? att1 : null,
        attempt2: !isNaN(att2) && att2 > 0 ? att2 : null,
        attempt3: !isNaN(att3) && att3 > 0 ? att3 : null,
      };
    });

    const hasAnyAttempt = payload.some(p => p.attempt1 !== null || p.attempt2 !== null || p.attempt3 !== null);
    if (!hasAnyAttempt) {
      setMessage({ type: 'error', text: 'Please enter at least one valid attempt mark.' });
      setIsLoading(false);
      return;
    }

    const res = await submitFieldAttempts(selectedRoundId, payload);
    if (res.success) {
      setMessage({ type: 'success', text: res.message || 'Field attempts submitted successfully!' });
    } else {
      setMessage({ type: 'error', text: res.error || 'Failed to submit field results' });
    }

    setIsLoading(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Event and Round Selector */}
      <Card>
        <CardContent style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>
          <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Select Event
              </label>
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                style={{
                  padding: '0.65rem 0.95rem',
                  background: '#ffffff',
                  color: 'var(--text-primary)',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  minWidth: '240px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                  cursor: 'pointer'
                }}
              >
                {events.map(ev => (
                  <option key={ev.id} value={ev.id}>
                    {ev.name} ({ev.gender.toUpperCase()} - {ev.category.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Select Round
              </label>
              <select
                value={selectedRoundId}
                onChange={(e) => setSelectedRoundId(e.target.value)}
                style={{
                  padding: '0.65rem 0.95rem',
                  background: '#ffffff',
                  color: 'var(--text-primary)',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  minWidth: '160px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                  cursor: 'pointer'
                }}
              >
                {currentRounds.length === 0 && <option value="">No Rounds Configured</option>}
                {currentRounds.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.round_type.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ 
              padding: '0.4rem 0.85rem', 
              borderRadius: '999px', 
              fontSize: '0.75rem', 
              fontWeight: 800, 
              letterSpacing: '0.04em',
              background: isTrack ? '#eff6ff' : '#fdf2f8',
              color: isTrack ? '#1d4ed8' : '#be185d',
              border: `1px solid ${isTrack ? '#bfdbfe' : '#fbcfe8'}`
            }}>
              {isTrack ? '🏃 TRACK EVENT (PHOTO FINISH)' : '🏋️ FIELD EVENT (3 ATTEMPTS)'}
            </span>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
              ({roundResults.length} seeded)
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Heat Tabs Bar (for Track Rounds with Multiple Heats) */}
      {isTrack && currentHeats.length > 0 && (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem', 
          flexWrap: 'wrap', 
          padding: '0.75rem 1.25rem', 
          background: '#ffffff', 
          borderRadius: 'var(--radius-md)', 
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b', marginRight: '0.5rem', letterSpacing: '0.05em' }}>
            SELECT ACTIVE HEAT:
          </span>

          {currentHeats.map((h) => {
            const heatAthletes = roundResults.filter(r => r.heat_id === h.id);
            const completedCount = heatAthletes.filter(r => r.final_result !== null || r.status === 'DNS' || r.status === 'DNF' || r.status === 'DQ').length;
            const isCompleted = completedCount > 0 && completedCount === heatAthletes.length;
            const isSelected = selectedHeatId === h.id;

            return (
              <button
                key={h.id}
                type="button"
                onClick={() => setSelectedHeatId(h.id)}
                style={{
                  padding: '0.45rem 0.95rem',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  border: isSelected ? '2px solid #2563eb' : '1px solid #cbd5e1',
                  background: isSelected ? '#2563eb' : '#f8fafc',
                  color: isSelected ? '#ffffff' : '#0f172a',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>⚡ {h.heat_name}</span>
                <span style={{ 
                  fontSize: '0.7rem', 
                  padding: '0.1rem 0.45rem', 
                  borderRadius: '999px', 
                  background: isSelected ? 'rgba(255,255,255,0.25)' : (isCompleted ? '#dcfce7' : '#e2e8f0'),
                  color: isSelected ? '#ffffff' : (isCompleted ? '#166534' : '#475569'),
                  fontWeight: 800
                }}>
                  {isCompleted ? '✓ Timed' : `${heatAthletes.length} lanes`}
                </span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setSelectedHeatId('ALL')}
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 600,
              border: selectedHeatId === 'ALL' ? '2px solid #475569' : '1px solid #e2e8f0',
              background: selectedHeatId === 'ALL' ? '#475569' : '#ffffff',
              color: selectedHeatId === 'ALL' ? '#ffffff' : '#64748b',
              cursor: 'pointer'
            }}
          >
            All Heats (Overview)
          </button>
        </div>
      )}

      {/* Status Messages */}
      {message && (
        <div style={{
          padding: '1rem 1.25rem',
          borderRadius: 'var(--radius-sm)',
          background: message.type === 'success' ? '#ecfdf5' : '#fef2f2',
          border: `1px solid ${message.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
          color: message.type === 'success' ? '#065f46' : '#991b1b',
          fontSize: '0.9rem'
        }}>
          <strong>{message.text}</strong>
          {message.details && (
            <ul style={{ marginTop: '0.5rem', fontSize: '0.85rem', paddingLeft: '1.25rem' }}>
              {message.details.map((d, i) => <li key={i}>{d}</li>)}
            </ul>
          )}
        </div>
      )}

      {/* TRACK EVENTS: Photo Finish Importer & Manual Lane Entry */}
      {isTrack ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Photo Finish File Box (Scoped to Active Heat) */}
          <Card>
            <CardHeader style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem' }}>
              <CardTitle style={{ fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>📷 Photo Finish File Importer</span>
                {activeHeat && (
                  <span style={{ fontSize: '0.8rem', padding: '0.15rem 0.5rem', borderRadius: '4px', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}>
                    Target: {activeHeat.heat_name}
                  </span>
                )}
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleInsertSamplePhotoFinish}
                style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: 700 }}
              >
                ⚡ Insert Sample Timing Data ({activeHeat ? activeHeat.heat_name : 'Current View'})
              </Button>
            </CardHeader>
            <CardContent style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Upload or paste Lynx LIF / Omega CSV timing file. Format: <code>Lane, Bib, Time</code> or <code>Place, Lane, Bib, Time</code>.
                {activeHeat && <strong> Times will be matched strictly to {activeHeat.heat_name}.</strong>}
              </p>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <input
                  type="file"
                  accept=".csv,.txt,.lif"
                  onChange={handleFileUpload}
                  style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}
                />
              </div>

              <textarea
                value={photoFinishText}
                onChange={(e) => setPhotoFinishText(e.target.value)}
                placeholder="Lane, Bib, Time&#10;1, 102, 10.45&#10;2, 105, 10.52&#10;3, 108, 10.89"
                rows={4}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  background: '#ffffff',
                  color: 'var(--text-primary)',
                  border: '1.5px solid #cbd5e1',
                  fontFamily: 'monospace',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04)'
                }}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button 
                  variant="primary" 
                  disabled={!photoFinishText.trim() || isLoading}
                  isLoading={isLoading}
                  onClick={handleImportPhotoFinish}
                >
                  📥 Import Photo Finish for {activeHeat ? activeHeat.heat_name : 'Round'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Lane Timing Table */}
          <Card>
            <CardHeader style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <CardTitle style={{ fontSize: '1.05rem', fontWeight: 800 }}>
                  Seeded Heat Lanes & Timing Roster
                </CardTitle>
                <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.15rem' }}>
                  {activeHeat ? `Viewing ${activeHeat.heat_name} (${activeResults.length} athletes)` : `All Heats Combined (${activeResults.length} athletes)`}
                </div>
              </div>
              {activeHeat && (
                <span style={{ fontSize: '0.75rem', fontWeight: 800, background: '#eff6ff', color: '#1d4ed8', padding: '0.25rem 0.65rem', borderRadius: '4px', border: '1px solid #bfdbfe' }}>
                  ACTIVE TRACK: {activeHeat.heat_name.toUpperCase()}
                </span>
              )}
            </CardHeader>
            <CardContent style={{ padding: 0 }}>
              <div style={{ overflowX: 'auto' }}>
                <table className="timing-roster-table">
                  <thead>
                    <tr>
                      <th style={{ width: '80px' }}>Rank</th>
                      <th style={{ width: '90px' }}>Lane</th>
                      {selectedHeatId === 'ALL' && <th style={{ width: '90px' }}>Heat</th>}
                      <th style={{ width: '100px' }}>Bib #</th>
                      <th>Athlete Name</th>
                      <th>College</th>
                      <th style={{ width: '130px', textAlign: 'center' }}>Status</th>
                      <th style={{ width: '150px', textAlign: 'right' }}>Time (Seconds)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeResults.length === 0 ? (
                      <tr>
                        <td colSpan={selectedHeatId === 'ALL' ? 8 : 7} style={{ padding: '3.5rem 1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                          No seeded athletes in this {activeHeat ? activeHeat.heat_name : 'round'}. Seed heats first under <strong>Heat Generation</strong>.
                        </td>
                      </tr>
                    ) : (
                      activeResults
                        .sort((a, b) => {
                          if (selectedHeatId === 'ALL' && a.heat_id !== b.heat_id) {
                            return (a.event_heats?.heat_name || '').localeCompare(b.event_heats?.heat_name || '');
                          }
                          return (a.lane_number || 0) - (b.lane_number || 0);
                        })
                        .map((res) => {
                          const ath = res.profiles;
                          const currentVal = manualTimes[res.profile_id] ?? (res.final_result !== null ? res.final_result.toString() : '');
                          const currentStatus = athleteStatuses[res.profile_id] || 'FINISHED';
                          const isFinished = currentStatus === 'FINISHED';

                          return (
                            <tr key={res.id}>
                              <td style={{ fontWeight: 800 }}>
                                {res.rank ? (
                                  <span style={{ 
                                    display: 'inline-block',
                                    padding: '0.2rem 0.55rem', 
                                    borderRadius: '6px', 
                                    background: res.rank === 1 ? '#fef3c7' : res.rank === 2 ? '#f1f5f9' : res.rank === 3 ? '#ffedd5' : '#f8fafc',
                                    color: res.rank === 1 ? '#92400e' : res.rank === 2 ? '#334155' : res.rank === 3 ? '#9a3412' : '#64748b',
                                    border: `1px solid ${res.rank === 1 ? '#fde68a' : res.rank === 2 ? '#cbd5e1' : res.rank === 3 ? '#fed7aa' : '#e2e8f0'}`,
                                    fontSize: '0.75rem',
                                    fontWeight: 800
                                  }}>
                                    {res.rank === 1 ? '🥇 1st' : res.rank === 2 ? '🥈 2nd' : res.rank === 3 ? '🥉 3rd' : `${res.rank}th`}
                                  </span>
                                ) : (
                                  <span style={{ color: '#94a3b8' }}>-</span>
                                )}
                              </td>
                              <td>
                                {res.lane_number ? (
                                  <span className="timing-lane-badge">
                                    Lane {res.lane_number}
                                  </span>
                                ) : (
                                  <span style={{ color: '#94a3b8' }}>-</span>
                                )}
                              </td>
                              {selectedHeatId === 'ALL' && (
                                <td>
                                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>
                                    {res.event_heats?.heat_name || 'Heat 1'}
                                  </span>
                                </td>
                              )}
                              <td>
                                <span className="timing-bib-badge">
                                  #{ath?.bib_number || ath?.chest_number || 'N/A'}
                                </span>
                              </td>
                              <td>
                                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                                  {ath?.sslc_name || ath?.full_name || 'Athlete'}
                                </span>
                              </td>
                              <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                {ath?.college_name || 'N/A'}
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <select
                                  value={currentStatus}
                                  onChange={(e) => {
                                    const nextSt = e.target.value as any;
                                    setAthleteStatuses(prev => ({ ...prev, [res.profile_id]: nextSt }));
                                    if (nextSt !== 'FINISHED') {
                                      setManualTimes(prev => ({ ...prev, [res.profile_id]: '' }));
                                    }
                                  }}
                                  style={{
                                    padding: '0.35rem 0.55rem',
                                    borderRadius: '6px',
                                    border: '1.5px solid #cbd5e1',
                                    fontSize: '0.75rem',
                                    fontWeight: 800,
                                    background: 
                                      currentStatus === 'DNS' ? '#fee2e2' :
                                      currentStatus === 'DNF' ? '#fef3c7' :
                                      currentStatus === 'DQ' ? '#f3e8ff' : '#f0fdf4',
                                    color: 
                                      currentStatus === 'DNS' ? '#991b1b' :
                                      currentStatus === 'DNF' ? '#92400e' :
                                      currentStatus === 'DQ' ? '#6b21a8' : '#166534',
                                    cursor: 'pointer'
                                  }}
                                >
                                  <option value="FINISHED">✓ FINISH</option>
                                  <option value="DNS">⛔ DNS</option>
                                  <option value="DNF">⚠️ DNF</option>
                                  <option value="DQ">🚫 DQ</option>
                                </select>
                              </td>
                              <td style={{ textAlign: 'right' }}>
                                {isFinished ? (
                                  <input
                                    type="number"
                                    step="0.001"
                                    placeholder="00.000"
                                    value={currentVal}
                                    onChange={(e) => setManualTimes(prev => ({ ...prev, [res.profile_id]: e.target.value }))}
                                    className="timing-time-input"
                                  />
                                ) : (
                                  <span style={{ 
                                    display: 'inline-block',
                                    padding: '0.4rem 0.8rem',
                                    borderRadius: '6px',
                                    fontWeight: 800,
                                    fontSize: '0.85rem',
                                    fontFamily: 'monospace',
                                    background: currentStatus === 'DNS' ? '#fef2f2' : currentStatus === 'DNF' ? '#fffbeb' : '#faf5ff',
                                    color: currentStatus === 'DNS' ? '#dc2626' : currentStatus === 'DNF' ? '#d97706' : '#9333ea',
                                    border: `1px solid ${currentStatus === 'DNS' ? '#fecaca' : currentStatus === 'DNF' ? '#fde68a' : '#e9d5ff'}`
                                  }}>
                                    {currentStatus}
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                    )}
                  </tbody>
                </table>
              </div>

              {activeResults.length > 0 && (
                <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    Entering results for: <strong>{activeHeat ? activeHeat.heat_name : 'All Heats'}</strong> ({activeResults.length} lanes)
                  </div>
                  <Button variant="primary" onClick={handleManualTrackSubmit} isLoading={isLoading}>
                    💾 Save {activeHeat ? activeHeat.heat_name : 'Track'} Results & Recalculate Ranks
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        /* FIELD EVENTS: 3-Attempt Entry Matrix */
        <Card>
          <CardHeader style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc', padding: '1rem 1.5rem' }}>
            <CardTitle style={{ fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>📏 3-Attempt Entry Matrix: {selectedEvent?.name}</span>
            </CardTitle>
          </CardHeader>
          <CardContent style={{ padding: 0 }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="timing-roster-table">
                <thead>
                  <tr>
                    <th style={{ width: '80px' }}>Rank</th>
                    <th style={{ width: '110px' }}>Bib #</th>
                    <th>Athlete Name</th>
                    <th>College</th>
                    <th style={{ textAlign: 'center', width: '120px' }}>Attempt 1 (m)</th>
                    <th style={{ textAlign: 'center', width: '120px' }}>Attempt 2 (m)</th>
                    <th style={{ textAlign: 'center', width: '120px' }}>Attempt 3 (m)</th>
                    <th style={{ textAlign: 'right', width: '130px' }}>Best Mark</th>
                  </tr>
                </thead>
                <tbody>
                  {roundResults.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ padding: '3.5rem 1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        No athletes assigned to this field round. Seed athletes first.
                      </td>
                    </tr>
                  ) : (
                    roundResults.map((res) => {
                      const ath = res.profiles;
                      const userAtts = attemptsData[res.profile_id] || { att1: '', att2: '', att3: '' };

                      // Calculate live best mark
                      const nums = [parseFloat(userAtts.att1), parseFloat(userAtts.att2), parseFloat(userAtts.att3)].filter(
                        n => !isNaN(n) && n > 0
                      );
                      const liveBest = nums.length > 0 ? Math.max(...nums).toFixed(2) : (res.best_mark ? res.best_mark.toFixed(2) : '-');

                      return (
                        <tr key={res.id}>
                          <td style={{ fontWeight: 800 }}>
                            {res.rank ? (
                              <span style={{ 
                                display: 'inline-block',
                                padding: '0.2rem 0.55rem', 
                                borderRadius: '6px', 
                                background: res.rank === 1 ? '#fef3c7' : res.rank === 2 ? '#f1f5f9' : res.rank === 3 ? '#ffedd5' : '#f8fafc',
                                color: res.rank === 1 ? '#92400e' : res.rank === 2 ? '#334155' : res.rank === 3 ? '#9a3412' : '#64748b',
                                border: `1px solid ${res.rank === 1 ? '#fde68a' : res.rank === 2 ? '#cbd5e1' : res.rank === 3 ? '#fed7aa' : '#e2e8f0'}`,
                                fontSize: '0.75rem',
                                fontWeight: 800
                              }}>
                                {res.rank === 1 ? '🥇 1st' : res.rank === 2 ? '🥈 2nd' : res.rank === 3 ? '🥉 3rd' : `${res.rank}th`}
                              </span>
                            ) : (
                              <span style={{ color: '#94a3b8' }}>-</span>
                            )}
                          </td>
                          <td>
                            <span className="timing-bib-badge">
                              #{ath?.bib_number || ath?.chest_number || 'N/A'}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                              {ath?.sslc_name || ath?.full_name}
                            </span>
                          </td>
                          <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                            {ath?.college_name || 'N/A'}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              value={userAtts.att1}
                              onChange={(e) => handleAttemptChange(res.profile_id, 'att1', e.target.value)}
                              style={{
                                width: '85px',
                                padding: '0.45rem 0.5rem',
                                borderRadius: '6px',
                                background: '#ffffff',
                                color: 'var(--text-primary)',
                                border: '1.5px solid #cbd5e1',
                                textAlign: 'center',
                                fontFamily: 'monospace',
                                fontWeight: 700,
                                fontSize: '0.9rem',
                                outline: 'none'
                              }}
                            />
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              value={userAtts.att2}
                              onChange={(e) => handleAttemptChange(res.profile_id, 'att2', e.target.value)}
                              style={{
                                width: '85px',
                                padding: '0.45rem 0.5rem',
                                borderRadius: '6px',
                                background: '#ffffff',
                                color: 'var(--text-primary)',
                                border: '1.5px solid #cbd5e1',
                                textAlign: 'center',
                                fontFamily: 'monospace',
                                fontWeight: 700,
                                fontSize: '0.9rem',
                                outline: 'none'
                              }}
                            />
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              value={userAtts.att3}
                              onChange={(e) => handleAttemptChange(res.profile_id, 'att3', e.target.value)}
                              style={{
                                width: '85px',
                                padding: '0.45rem 0.5rem',
                                borderRadius: '6px',
                                background: '#ffffff',
                                color: 'var(--text-primary)',
                                border: '1.5px solid #cbd5e1',
                                textAlign: 'center',
                                fontFamily: 'monospace',
                                fontWeight: 700,
                                fontSize: '0.9rem',
                                outline: 'none'
                              }}
                            />
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 800, color: 'var(--accent-primary)', fontSize: '1rem', fontFamily: 'monospace' }}>
                            {liveBest !== '-' ? `${liveBest} m` : '-'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {roundResults.length > 0 && (
              <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="primary" onClick={handleSubmitFieldAttempts} isLoading={isLoading}>
                  💾 Compute Best Marks & Finalize Podium
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

    </div>
  );
};

