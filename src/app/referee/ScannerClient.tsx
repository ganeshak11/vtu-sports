'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  checkInAthlete, 
  updateCallRoomStatus, 
  substituteReserveAthlete, 
  getCallRoomRoster, 
  CallRoomStatus 
} from '@/app/actions/callroom';
import { Scanner } from '@yudiel/react-qr-scanner';

interface EventOption {
  id: string;
  name: string;
  gender: string;
  category: string;
}

interface RoundOption {
  id: string;
  round_type: string;
  scheduled_time: string | null;
  event_id?: string;
}

interface ScannerClientProps {
  initialEventId?: string;
  initialEventName?: string;
  events: EventOption[];
  rounds: RoundOption[];
}

const STATUS_COLORS: Record<CallRoomStatus, { bg: string; color: string; label: string }> = {
  NOT_REPORTED: { bg: 'rgba(156, 163, 175, 0.15)', color: 'var(--text-secondary)', label: 'Not Reported' },
  REPORTED: { bg: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)', label: 'Reported' },
  DNS: { bg: 'rgba(239, 68, 68, 0.15)', color: 'var(--danger)', label: 'DNS (Did Not Start)' },
  STARTED: { bg: 'rgba(59, 130, 246, 0.15)', color: 'var(--accent-primary)', label: 'Started' },
  FINISHED: { bg: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6', label: 'Finished' },
  DQ: { bg: 'rgba(245, 158, 11, 0.15)', color: 'var(--warning)', label: 'DQ (Disqualified)' }
};

export const ScannerClient: React.FC<ScannerClientProps> = ({ 
  initialEventId, 
  initialEventName, 
  events, 
  rounds 
}) => {
  const [selectedEventId, setSelectedEventId] = useState<string>(initialEventId || events[0]?.id || '');
  const [selectedRoundId, setSelectedRoundId] = useState<string>(rounds[0]?.id || '');
  
  // Call Room Roster State
  const [rosterData, setRosterData] = useState<any[]>([]);
  const [availableReserves, setAvailableReserves] = useState<any[]>([]);
  const [isLoadingRoster, setIsLoadingRoster] = useState(false);

  // Substitution Modal State
  const [substitutingAthlete, setSubstitutingAthlete] = useState<any | null>(null);
  const [selectedReserveId, setSelectedReserveId] = useState<string>('');
  const [isSubmittingSub, setIsSubmittingSub] = useState(false);

  // Scanner State
  const [scanResult, setScanResult] = useState<{ 
    type: 'success' | 'warning' | 'error'; 
    msg: string; 
    name?: string; 
    college?: string; 
    details?: string;
  } | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter rounds for the selected event
  const currentRounds = rounds.filter(r => !r.event_id || r.event_id === selectedEventId);

  // Sync selected round when event changes
  useEffect(() => {
    if (currentRounds.length > 0 && !currentRounds.some(r => r.id === selectedRoundId)) {
      setSelectedRoundId(currentRounds[0].id);
    }
  }, [selectedEventId, currentRounds]);

  // Load roster whenever selected round changes
  const loadRoster = async () => {
    if (!selectedRoundId) return;
    setIsLoadingRoster(true);
    const res = await getCallRoomRoster(selectedRoundId);
    if (res && !res.error) {
      setRosterData(res.roster || []);
      setAvailableReserves(res.availableReserves || []);
    }
    setIsLoadingRoster(false);
  };

  useEffect(() => {
    loadRoster();
  }, [selectedRoundId]);

  useEffect(() => {
    if (!isCameraActive && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isCameraActive, scanResult]);

  // Handle single-tap check-in
  const handleScan = async (identifier: string) => {
    if (!identifier.trim() || isScanning) return;
    if (!selectedRoundId) {
      alert("Please select an active round first.");
      return;
    }
    
    setIsScanning(true);
    const result = await checkInAthlete(identifier, selectedRoundId);
    
    if (result.success && result.profile) {
      setScanResult({
        type: 'success',
        msg: result.message || 'Reported to Call Room',
        name: result.profile.name,
        college: result.profile.college
      });
      await loadRoster();
    } else {
      setScanResult({
        type: 'error',
        msg: result.error || 'Check-in Failed',
        name: identifier,
        details: result.details || 'Athlete not accredited or not eligible.'
      });
    }

    if (inputRef.current) inputRef.current.value = '';
    
    setTimeout(() => {
      setScanResult(null);
      setIsScanning(false);
    }, 3500);
  };

  const handleManualSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const id = formData.get('identifier') as string;
    handleScan(id);
  };

  // Status Change Handler
  const handleStatusChange = async (athleteId: string, newStatus: CallRoomStatus) => {
    const res = await updateCallRoomStatus(athleteId, selectedRoundId, newStatus);
    if (res.success) {
      await loadRoster();
    } else {
      alert(res.error || 'Failed to update status');
    }
  };

  // Substitute Reserve Handler
  const handleConfirmSubstitution = async () => {
    if (!substitutingAthlete || !selectedReserveId) return;
    setIsSubmittingSub(true);
    const res = await substituteReserveAthlete(selectedRoundId, substitutingAthlete.id, selectedReserveId);
    if (res.success) {
      alert(res.message);
      setSubstitutingAthlete(null);
      setSelectedReserveId('');
      await loadRoster();
    } else {
      alert(res.error || 'Failed to substitute reserve');
    }
    setIsSubmittingSub(false);
  };

  // Group roster by Heat
  const heatGroups: Record<string, any[]> = {};
  rosterData.forEach(item => {
    const h = item.heatName || 'Heat 1';
    if (!heatGroups[h]) heatGroups[h] = [];
    heatGroups[h].push(item);
  });

  const selectedEvent = events.find(e => e.id === selectedEventId);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'inline-block', padding: '0.2rem 0.6rem', borderRadius: '4px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-primary)', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            Dr. ACS College of Engineering &bull; Official Meet Operations
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Call Room & Marshalling Desk</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Athlete reporting, marshalling verification, DNS management & reserve substitutions
          </p>
        </div>

        {/* Event & Round Selectors */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
              Event:
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
                fontWeight: 600,
                fontSize: '0.9rem'
              }}
            >
              {events.map(ev => (
                <option key={ev.id} value={ev.id}>
                  {ev.name} ({ev.gender.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
              Round:
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
                fontWeight: 600,
                fontSize: '0.9rem'
              }}
            >
              {currentRounds.length === 0 && <option value="">No Rounds</option>}
              {currentRounds.map(r => (
                <option key={r.id} value={r.id}>
                  {r.round_type.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Quick Scanner Card */}
      <Card>
        <CardContent style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
              ⏱️ Instant Marshalling Check-In: <span style={{ color: 'var(--accent-primary)' }}>{selectedEvent?.name}</span>
            </span>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsCameraActive(!isCameraActive)}
            >
              {isCameraActive ? '⌨️ Keyboard Input' : '📷 Camera Scanner'}
            </Button>
          </div>

          {!isCameraActive ? (
            <form onSubmit={handleManualSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                ref={inputRef}
                name="identifier"
                placeholder="Scan QR or enter Bib / Chest / Athlete ID..."
                autoComplete="off"
                disabled={isScanning}
                style={{
                  flex: 1,
                  padding: '0.85rem 1rem',
                  fontSize: '1.05rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '2px solid var(--accent-primary)',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  outline: 'none'
                }}
              />
              <Button type="submit" variant="primary" disabled={isScanning}>
                {isScanning ? 'Marking...' : 'Mark Reported'}
              </Button>
            </form>
          ) : (
            <div style={{ width: '100%', maxWidth: '500px', margin: '0 auto', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '2px solid var(--accent-primary)' }}>
              {isScanning ? (
                <div style={{ padding: '2rem', textAlign: 'center', background: 'var(--bg-tertiary)' }}>
                  Recording Check-In...
                </div>
              ) : (
                <Scanner 
                  onScan={(result) => handleScan(result[0].rawValue)} 
                  onError={(error) => setScanResult({ type: 'error', msg: 'Camera Error', details: error instanceof Error ? error.message : String(error) })}
                  styles={{ container: { width: '100%' } }}
                />
              )}
            </div>
          )}

          {scanResult && (
            <div style={{
              padding: '0.875rem 1.25rem',
              borderRadius: 'var(--radius-sm)',
              background: scanResult.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              border: `1px solid ${scanResult.type === 'success' ? 'var(--success)' : 'var(--danger)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <strong style={{ color: scanResult.type === 'success' ? 'var(--success)' : 'var(--danger)' }}>
                  {scanResult.msg}
                </strong>
                {scanResult.name && <span style={{ marginLeft: '0.5rem', fontWeight: 600 }}>{scanResult.name}</span>}
                {scanResult.college && <span style={{ marginLeft: '0.5rem', color: 'var(--text-secondary)' }}>({scanResult.college})</span>}
                {scanResult.details && <p style={{ fontSize: '0.8rem', color: 'var(--danger)', margin: '0.25rem 0 0' }}>{scanResult.details}</p>}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Roster & Marshalling Heats */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Heats Marshalling & Lineup</h2>
          <Button variant="ghost" size="sm" onClick={loadRoster} isLoading={isLoadingRoster}>
            🔄 Refresh Live Roster
          </Button>
        </div>

        {Object.keys(heatGroups).length === 0 ? (
          <Card>
            <CardContent style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No heats seeded yet for this round. Go to <strong>Heat Generation</strong> (/admin/events/heats) to seed accredited athletes into lanes.
            </CardContent>
          </Card>
        ) : (
          Object.entries(heatGroups).map(([heatName, entries]) => (
            <Card key={heatName}>
              <CardHeader style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-tertiary)' }}>
                <CardTitle style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span>🏁 {heatName}</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                    ({entries.filter(e => e.status === 'REPORTED').length}/{entries.length} Reported)
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent style={{ padding: 0 }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.02)' }}>
                        <th style={{ padding: '0.75rem 1rem', width: '70px' }}>Lane</th>
                        <th style={{ padding: '0.75rem 1rem', width: '90px' }}>Bib #</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Athlete</th>
                        <th style={{ padding: '0.75rem 1rem' }}>College</th>
                        <th style={{ padding: '0.75rem 1rem', width: '160px' }}>Status</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map((entry, idx) => {
                        const ath = entry.athlete;
                        const status = (entry.status || 'NOT_REPORTED') as CallRoomStatus;
                        const styleInfo = STATUS_COLORS[status] || STATUS_COLORS.NOT_REPORTED;

                        return (
                          <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            <td style={{ padding: '0.75rem 1rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
                              {entry.laneNumber ? `Lane ${entry.laneNumber}` : '-'}
                            </td>
                            <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>
                              {ath ? `#${ath.bibNumber}` : 'Vacant'}
                            </td>
                            <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>
                              {ath?.name || 'Unassigned'}
                            </td>
                            <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>
                              {ath?.college || '-'}
                            </td>
                            <td style={{ padding: '0.75rem 1rem' }}>
                              <select
                                value={status}
                                onChange={(e) => handleStatusChange(ath.id, e.target.value as CallRoomStatus)}
                                style={{
                                  padding: '0.35rem 0.5rem',
                                  borderRadius: 'var(--radius-sm)',
                                  background: styleInfo.bg,
                                  color: styleInfo.color,
                                  border: `1px solid ${styleInfo.color}`,
                                  fontWeight: 700,
                                  fontSize: '0.8rem',
                                  cursor: 'pointer',
                                  outline: 'none'
                                }}
                              >
                                <option value="NOT_REPORTED">Not Reported</option>
                                <option value="REPORTED">Reported</option>
                                <option value="DNS">DNS</option>
                                <option value="STARTED">Started</option>
                                <option value="FINISHED">Finished</option>
                                <option value="DQ">DQ</option>
                              </select>
                            </td>
                            <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                              {status === 'DNS' && ath && (
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => setSubstitutingAthlete(ath)}
                                  style={{
                                    fontSize: '0.75rem',
                                    color: 'var(--warning)',
                                    borderColor: 'var(--warning)'
                                  }}
                                >
                                  🔄 Substitute Reserve
                                </Button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Reserve Substitution Modal */}
      {substitutingAthlete && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <Card style={{ maxWidth: '520px', width: '100%', border: '2px solid var(--warning)' }}>
            <CardHeader>
              <CardTitle style={{ color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>⚠️ Substitute DNS Athlete</span>
              </CardTitle>
            </CardHeader>
            <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <p style={{ fontSize: '0.95rem' }}>
                Athlete <strong>{substitutingAthlete.name}</strong> (#{substitutingAthlete.bibNumber}) from{' '}
                <strong>{substitutingAthlete.college}</strong> did not report (DNS).
              </p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Under VTU Championship regulations, you can substitute an accredited college reserve athlete from the same delegation into this heat/lane.
              </p>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                  Select Accredited College Reserve:
                </label>
                {(() => {
                  const eligibleReserves = availableReserves.filter(r => r.college_id === substitutingAthlete.collegeId);
                  
                  if (eligibleReserves.length === 0) {
                    return (
                      <div style={{ padding: '0.75rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', color: 'var(--danger)', fontSize: '0.85rem' }}>
                        No accredited reserve athletes registered for {substitutingAthlete.college}.
                      </div>
                    );
                  }

                  return (
                    <select
                      value={selectedReserveId}
                      onChange={(e) => setSelectedReserveId(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: 'var(--bg-tertiary)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.95rem'
                      }}
                    >
                      <option value="">-- Choose Reserve Athlete --</option>
                      {eligibleReserves.map(res => (
                        <option key={res.id} value={res.id}>
                          {res.sslc_name || res.full_name} (#{res.bib_number || res.chest_number})
                        </option>
                      ))}
                    </select>
                  );
                })()}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSubstitutingAthlete(null);
                    setSelectedReserveId('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  disabled={!selectedReserveId || isSubmittingSub}
                  isLoading={isSubmittingSub}
                  onClick={handleConfirmSubstitution}
                  style={{ background: 'var(--warning)', borderColor: 'var(--warning)', color: '#000' }}
                >
                  Confirm Substitution
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

    </div>
  );
};
