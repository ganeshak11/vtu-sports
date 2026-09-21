'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
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

interface ResultRecord {
  id: string;
  round_id: string;
  event_id: string;
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
  results: ResultRecord[];
}

export const ResultsEntryClient: React.FC<Props> = ({
  initialEventId,
  events,
  rounds,
  results
}) => {
  const [selectedEventId, setSelectedEventId] = useState<string>(initialEventId || events[0]?.id || '');
  const [selectedRoundId, setSelectedRoundId] = useState<string>('');
  
  // Track State
  const [photoFinishText, setPhotoFinishText] = useState('');
  const [manualTimes, setManualTimes] = useState<Record<string, string>>({});
  
  // Field State
  const [attemptsData, setAttemptsData] = useState<Record<string, { att1: string; att2: string; att3: string }>>({});
  
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string; details?: string[] } | null>(null);

  const selectedEvent = events.find(e => e.id === selectedEventId);
  const currentRounds = rounds.filter(r => r.event_id === selectedEventId);

  // Sync selected round
  useEffect(() => {
    if (currentRounds.length > 0 && !currentRounds.some(r => r.id === selectedRoundId)) {
      setSelectedRoundId(currentRounds[0].id);
    }
  }, [selectedEventId, currentRounds]);

  // Seeded athletes for the selected round
  const roundResults = results.filter(r => r.round_id === selectedRoundId);

  // Initialize input state when round changes
  useEffect(() => {
    const timesMap: Record<string, string> = {};
    const attMap: Record<string, { att1: string; att2: string; att3: string }> = {};

    roundResults.forEach(r => {
      if (r.final_result !== null) {
        timesMap[r.profile_id] = r.final_result.toString();
      }
      attMap[r.profile_id] = {
        att1: r.attempt_1 !== null ? r.attempt_1.toString() : '',
        att2: r.attempt_2 !== null ? r.attempt_2.toString() : '',
        att3: r.attempt_3 !== null ? r.attempt_3.toString() : ''
      };
    });

    setManualTimes(timesMap);
    setAttemptsData(attMap);
    setMessage(null);
  }, [selectedRoundId]);

  const isTrack = selectedEvent?.category === 'track' || selectedEvent?.measurement_metric === 'time';

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

  // Insert Sample Photo Finish Data
  const handleInsertSamplePhotoFinish = () => {
    if (roundResults.length === 0) {
      alert('No seeded athletes in this round. Generate heats first!');
      return;
    }

    // Generate sample times for athletes in this round
    const sampleLines = roundResults.map((r, i) => {
      const lane = r.lane_number || (i + 1);
      const bib = r.profiles?.bib_number || r.profiles?.chest_number || `${100 + i}`;
      const time = (10.20 + i * 0.15 + (Math.random() * 0.08)).toFixed(3);
      return `${lane}, ${bib}, ${time}`;
    });

    setPhotoFinishText(`# FinishLynx / VTU Timing Output Format\n# Lane, Bib, Time(s)\n` + sampleLines.join('\n'));
  };

  // Submit Photo Finish File
  const handleImportPhotoFinish = async () => {
    if (!photoFinishText.trim()) {
      setMessage({ type: 'error', text: 'Please paste photo finish data or upload a timing file.' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    const res = await importPhotoFinishResults(selectedRoundId, photoFinishText);
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

    const payload: ResultPayload[] = roundResults.map(r => {
      const val = parseFloat(manualTimes[r.profile_id]);
      return {
        athleteId: r.profile_id,
        result: isNaN(val) ? null : val
      } as any;
    }).filter(p => p.result !== null);

    if (payload.length === 0) {
      setMessage({ type: 'error', text: 'Please enter at least one valid timing result.' });
      setIsLoading(false);
      return;
    }

    const res = await submitResults(selectedRoundId, payload);
    if (res.success) {
      setMessage({ type: 'success', text: 'Manual track results submitted & rankings updated!' });
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
        <CardContent style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                Select Event:
              </label>
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                style={{
                  padding: '0.6rem 0.85rem',
                  background: 'var(--bg-tertiary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: 600
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
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                Select Round:
              </label>
              <select
                value={selectedRoundId}
                onChange={(e) => setSelectedRoundId(e.target.value)}
                style={{
                  padding: '0.6rem 0.85rem',
                  background: 'var(--bg-tertiary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: 600
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ 
              padding: '0.35rem 0.75rem', 
              borderRadius: '999px', 
              fontSize: '0.75rem', 
              fontWeight: 700, 
              background: isTrack ? 'rgba(59, 130, 246, 0.15)' : 'rgba(236, 72, 153, 0.15)',
              color: isTrack ? 'var(--accent-primary)' : '#ec4899'
            }}>
              {isTrack ? '🏃 TRACK EVENT (PHOTO FINISH)' : '🏋️ FIELD EVENT (3 ATTEMPTS)'}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Status Messages */}
      {message && (
        <div style={{
          padding: '1rem 1.25rem',
          borderRadius: 'var(--radius-sm)',
          background: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          border: `1px solid ${message.type === 'success' ? 'var(--success)' : 'var(--danger)'}`,
          color: message.type === 'success' ? 'var(--success)' : 'var(--danger)'
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
          
          {/* Photo Finish File Box */}
          <Card>
            <CardHeader style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--bg-tertiary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <CardTitle style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>📷 Photo Finish File Importer</span>
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleInsertSamplePhotoFinish}
                style={{ fontSize: '0.8rem', color: 'var(--accent-primary)' }}
              >
                ⚡ Insert Sample Timing Data
              </Button>
            </CardHeader>
            <CardContent style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Upload or paste Lynx LIF / Omega CSV timing file. Accepted format: <code>Lane, Bib, Time</code> or <code>Place, Lane, Bib, Time</code>.
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
                rows={5}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  fontFamily: 'monospace',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button 
                  variant="primary" 
                  disabled={!photoFinishText.trim() || isLoading}
                  isLoading={isLoading}
                  onClick={handleImportPhotoFinish}
                >
                  📥 Import Photo Finish & Compute Ranks
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Lane Timing Table */}
          <Card>
            <CardHeader style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--bg-tertiary)' }}>
              <CardTitle style={{ fontSize: '1.1rem' }}>Seeded Heat Lanes & Timing Roster</CardTitle>
            </CardHeader>
            <CardContent style={{ padding: 0 }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.02)' }}>
                      <th style={{ padding: '0.875rem 1rem', width: '70px' }}>Rank</th>
                      <th style={{ padding: '0.875rem 1rem', width: '80px' }}>Lane</th>
                      <th style={{ padding: '0.875rem 1rem', width: '90px' }}>Bib #</th>
                      <th style={{ padding: '0.875rem 1rem' }}>Athlete Name</th>
                      <th style={{ padding: '0.875rem 1rem' }}>College</th>
                      <th style={{ padding: '0.875rem 1rem', width: '140px', textAlign: 'right' }}>Time (Seconds)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roundResults.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                          No seeded athletes in this round. Seed heats first under <strong>Heat Generation</strong>.
                        </td>
                      </tr>
                    ) : (
                      roundResults
                        .sort((a, b) => (a.lane_number || 0) - (b.lane_number || 0))
                        .map((res) => {
                          const ath = res.profiles;
                          const currentVal = manualTimes[res.profile_id] ?? (res.final_result !== null ? res.final_result.toString() : '');

                          return (
                            <tr key={res.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                              <td style={{ padding: '0.875rem 1rem', fontWeight: 800 }}>
                                {res.rank ? (
                                  <span style={{ 
                                    padding: '0.2rem 0.5rem', 
                                    borderRadius: '4px', 
                                    background: res.rank === 1 ? '#FCD34D' : res.rank === 2 ? '#E5E7EB' : res.rank === 3 ? '#D97706' : 'var(--bg-tertiary)',
                                    color: res.rank <= 3 ? '#000' : 'var(--text-secondary)',
                                    fontSize: '0.75rem',
                                    fontWeight: 800
                                  }}>
                                    {res.rank === 1 ? '🥇 1st' : res.rank === 2 ? '🥈 2nd' : res.rank === 3 ? '🥉 3rd' : `${res.rank}th`}
                                  </span>
                                ) : '-'}
                              </td>
                              <td style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                                {res.lane_number ? `Lane ${res.lane_number}` : '-'}
                              </td>
                              <td style={{ padding: '0.875rem 1rem', fontWeight: 700 }}>
                                #{ath?.bib_number || ath?.chest_number || 'N/A'}
                              </td>
                              <td style={{ padding: '0.875rem 1rem', fontWeight: 600 }}>
                                {ath?.sslc_name || ath?.full_name || 'Athlete'}
                              </td>
                              <td style={{ padding: '0.875rem 1rem', color: 'var(--text-secondary)' }}>
                                {ath?.college_name || 'N/A'}
                              </td>
                              <td style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>
                                <input
                                  type="number"
                                  step="0.001"
                                  placeholder="00.000"
                                  value={currentVal}
                                  onChange={(e) => setManualTimes(prev => ({ ...prev, [res.profile_id]: e.target.value }))}
                                  style={{
                                    width: '110px',
                                    padding: '0.45rem 0.6rem',
                                    borderRadius: 'var(--radius-sm)',
                                    background: 'var(--bg-tertiary)',
                                    color: 'var(--text-primary)',
                                    border: '1px solid var(--border-color)',
                                    textAlign: 'right',
                                    fontFamily: 'monospace',
                                    fontWeight: 700
                                  }}
                                />
                              </td>
                            </tr>
                          );
                        })
                    )}
                  </tbody>
                </table>
              </div>

              {roundResults.length > 0 && (
                <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
                  <Button variant="primary" onClick={handleManualTrackSubmit} isLoading={isLoading}>
                    Save Track Times & Recalculate
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        /* FIELD EVENTS: 3-Attempt Entry Matrix */
        <Card>
          <CardHeader style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--bg-tertiary)' }}>
            <CardTitle style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>📏 3-Attempt Entry Matrix: {selectedEvent?.name}</span>
            </CardTitle>
          </CardHeader>
          <CardContent style={{ padding: 0 }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.02)' }}>
                    <th style={{ padding: '0.875rem 1rem', width: '70px' }}>Rank</th>
                    <th style={{ padding: '0.875rem 1rem', width: '90px' }}>Bib #</th>
                    <th style={{ padding: '0.875rem 1rem' }}>Athlete Name</th>
                    <th style={{ padding: '0.875rem 1rem' }}>College</th>
                    <th style={{ padding: '0.875rem 1rem', textAlign: 'center', width: '110px' }}>Attempt 1 (m)</th>
                    <th style={{ padding: '0.875rem 1rem', textAlign: 'center', width: '110px' }}>Attempt 2 (m)</th>
                    <th style={{ padding: '0.875rem 1rem', textAlign: 'center', width: '110px' }}>Attempt 3 (m)</th>
                    <th style={{ padding: '0.875rem 1rem', textAlign: 'right', width: '120px' }}>Best Mark</th>
                  </tr>
                </thead>
                <tbody>
                  {roundResults.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
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
                        <tr key={res.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <td style={{ padding: '0.875rem 1rem', fontWeight: 800 }}>
                            {res.rank ? (
                              <span style={{ 
                                padding: '0.2rem 0.5rem', 
                                borderRadius: '4px', 
                                background: res.rank === 1 ? '#FCD34D' : res.rank === 2 ? '#E5E7EB' : res.rank === 3 ? '#D97706' : 'var(--bg-tertiary)',
                                color: res.rank <= 3 ? '#000' : 'var(--text-secondary)',
                                fontSize: '0.75rem',
                                fontWeight: 800
                              }}>
                                {res.rank === 1 ? '🥇 1st' : res.rank === 2 ? '🥈 2nd' : res.rank === 3 ? '🥉 3rd' : `${res.rank}th`}
                              </span>
                            ) : '-'}
                          </td>
                          <td style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                            #{ath?.bib_number || ath?.chest_number || 'N/A'}
                          </td>
                          <td style={{ padding: '0.875rem 1rem', fontWeight: 600 }}>
                            {ath?.sslc_name || ath?.full_name}
                          </td>
                          <td style={{ padding: '0.875rem 1rem', color: 'var(--text-secondary)' }}>
                            {ath?.college_name || 'N/A'}
                          </td>
                          <td style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>
                            <input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              value={userAtts.att1}
                              onChange={(e) => handleAttemptChange(res.profile_id, 'att1', e.target.value)}
                              style={{
                                width: '80px',
                                padding: '0.4rem',
                                borderRadius: 'var(--radius-sm)',
                                background: 'var(--bg-tertiary)',
                                color: 'var(--text-primary)',
                                border: '1px solid var(--border-color)',
                                textAlign: 'center',
                                fontWeight: 600
                              }}
                            />
                          </td>
                          <td style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>
                            <input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              value={userAtts.att2}
                              onChange={(e) => handleAttemptChange(res.profile_id, 'att2', e.target.value)}
                              style={{
                                width: '80px',
                                padding: '0.4rem',
                                borderRadius: 'var(--radius-sm)',
                                background: 'var(--bg-tertiary)',
                                color: 'var(--text-primary)',
                                border: '1px solid var(--border-color)',
                                textAlign: 'center',
                                fontWeight: 600
                              }}
                            />
                          </td>
                          <td style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>
                            <input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              value={userAtts.att3}
                              onChange={(e) => handleAttemptChange(res.profile_id, 'att3', e.target.value)}
                              style={{
                                width: '80px',
                                padding: '0.4rem',
                                borderRadius: 'var(--radius-sm)',
                                background: 'var(--bg-tertiary)',
                                color: 'var(--text-primary)',
                                border: '1px solid var(--border-color)',
                                textAlign: 'center',
                                fontWeight: 600
                              }}
                            />
                          </td>
                          <td style={{ padding: '0.875rem 1rem', textAlign: 'right', fontWeight: 800, color: 'var(--accent-primary)', fontSize: '1rem' }}>
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
              <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
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
