'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { submitResults, ResultPayload } from '@/app/actions/results';

interface ResultsEntryClientProps {
  eventName: string;
  rounds: any[];
  checkIns: any[];
}

export const ResultsEntryClient: React.FC<ResultsEntryClientProps> = ({ eventName, rounds, checkIns }) => {
  const [selectedRoundId, setSelectedRoundId] = useState<string>(rounds[0]?.id || '');
  const [resultsData, setResultsData] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);

  // Filter athletes checked into the selected round
  const activeAthletes = checkIns
    .filter(log => log.round_id === selectedRoundId)
    .map(log => ({
      id: log.athlete_id,
      chest: log.profiles?.chest_number,
      name: log.profiles?.full_name,
      college: log.profiles?.college_name
    }));

  const activeRound = rounds.find(r => r.id === selectedRoundId);
  const metric = activeRound?.events?.measurement_metric || 'time';

  const handleInputChange = (athleteId: string, val: string) => {
    setResultsData(prev => ({ ...prev, [athleteId]: val }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setMessage(null);

    const payload: ResultPayload[] = activeAthletes.map(ath => {
      const val = parseFloat(resultsData[ath.id]);
      return {
        athleteId: ath.id,
        result: isNaN(val) ? null : val
      } as any;
    }).filter(r => r.result !== null);

    if (payload.length === 0) {
      setMessage({ type: 'error', text: 'No valid numeric results entered.' });
      setIsLoading(false);
      return;
    }

    const res = await submitResults(selectedRoundId, payload);
    if (res.success) {
      setMessage({ type: 'success', text: 'Results submitted and qualifications calculated successfully!' });
      // Clear inputs
      setResultsData({});
    } else {
      setMessage({ type: 'error', text: res.error || 'Failed to submit' });
    }
    
    setIsLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <CardTitle>Enter Results: {eventName}</CardTitle>
          <select 
            value={selectedRoundId} 
            onChange={(e) => {
              setSelectedRoundId(e.target.value);
              setResultsData({});
              setMessage(null);
            }}
            style={{ 
              padding: '0.5rem', 
              background: 'var(--bg-secondary)', 
              color: 'var(--text-primary)', 
              border: '1px solid var(--border-color)', 
              borderRadius: 'var(--radius-sm)'
            }}
          >
            {rounds.map(r => (
              <option key={r.id} value={r.id}>{r.round_type.toUpperCase()}</option>
            ))}
          </select>
        </div>
      </CardHeader>
      <CardContent>
        {message && (
          <div style={{ 
            padding: '1rem', 
            marginBottom: '1.5rem', 
            borderRadius: 'var(--radius-sm)', 
            background: message.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
            color: message.type === 'success' ? 'var(--success)' : 'var(--danger)',
            border: `1px solid ${message.type === 'success' ? 'var(--success)' : 'var(--danger)'}`
          }}>
            {message.text}
          </div>
        )}

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '1rem', fontWeight: 500 }}>Chest #</th>
                <th style={{ padding: '1rem', fontWeight: 500 }}>Athlete</th>
                <th style={{ padding: '1rem', fontWeight: 500 }}>College</th>
                <th style={{ padding: '1rem', fontWeight: 500, textAlign: 'right' }}>Result ({metric})</th>
              </tr>
            </thead>
            <tbody>
              {activeAthletes.map(ath => (
                <tr key={ath.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--accent-secondary)' }}>{ath.chest}</td>
                  <td style={{ padding: '1rem', fontWeight: 600 }}>{ath.name}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{ath.college}</td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <input 
                      type="number"
                      step="0.001"
                      placeholder={metric === 'time' ? 'e.g. 10.45' : 'e.g. 7.12'}
                      value={resultsData[ath.id] || ''}
                      onChange={(e) => handleInputChange(ath.id, e.target.value)}
                      style={{ 
                        padding: '0.5rem', 
                        width: '120px',
                        background: 'var(--bg-secondary)', 
                        color: 'var(--text-primary)', 
                        border: '1px solid var(--border-color)', 
                        borderRadius: 'var(--radius-sm)',
                        textAlign: 'right'
                      }}
                    />
                  </td>
                </tr>
              ))}
              {activeAthletes.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No athletes checked into this round yet. Use the Call Room scanner first.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {activeAthletes.length > 0 && (
          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="primary" onClick={handleSubmit} isLoading={isLoading}>
              Submit Results & Calculate Qualifiers
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
