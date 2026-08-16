'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { assignRoom } from '@/app/actions/admin';

interface Athlete {
  id: string;
  full_name: string;
  chest_number: string;
  college_name: string;
  gender: string;
  accommodation_id?: string;
  room_number?: string;
  accommodations?: { name: string };
}

interface Accommodation {
  id: string;
  name: string;
  capacity: number;
  current_occupancy: number;
  gender_allowed: string;
}

interface Props {
  athletes: Athlete[];
  accommodations: Accommodation[];
}

export default function AccommodationAssignmentClient({ athletes, accommodations }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedAcc, setSelectedAcc] = useState<string>('');
  const [roomNum, setRoomNum] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const startEditing = (athlete: Athlete) => {
    setEditingId(athlete.id);
    setSelectedAcc(athlete.accommodation_id || accommodations[0]?.id || '');
    setRoomNum(athlete.room_number || '');
  };

  const handleSave = async (athleteId: string) => {
    if (!selectedAcc || !roomNum) {
      alert("Please select a hostel and enter a room number.");
      return;
    }
    
    setIsLoading(true);
    const res = await assignRoom(athleteId, selectedAcc, roomNum);
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
            <th style={{ padding: '1rem', fontWeight: 500 }}>Chest No.</th>
            <th style={{ padding: '1rem', fontWeight: 500 }}>Name</th>
            <th style={{ padding: '1rem', fontWeight: 500 }}>College</th>
            <th style={{ padding: '1rem', fontWeight: 500 }}>Hostel</th>
            <th style={{ padding: '1rem', fontWeight: 500 }}>Room</th>
            <th style={{ padding: '1rem', fontWeight: 500, textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {athletes.map((athlete) => (
            <tr key={athlete.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--accent-primary)' }}>{athlete.chest_number}</td>
              <td style={{ padding: '1rem', fontWeight: 500 }}>{athlete.full_name}</td>
              <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{athlete.college_name}</td>
              
              {editingId === athlete.id ? (
                <>
                  <td style={{ padding: '1rem' }}>
                    <select 
                      value={selectedAcc} 
                      onChange={(e) => setSelectedAcc(e.target.value)}
                      style={{ padding: '0.5rem', background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                    >
                      <option value="" disabled>Select Hostel</option>
                      {accommodations.map(a => {
                        const isFull = a.current_occupancy >= a.capacity;
                        const isWrongGender = a.gender_allowed !== 'mixed' && a.gender_allowed !== athlete.gender;
                        const isDisabled = isFull || isWrongGender;
                        
                        let label = a.name;
                        if (isFull) label += " (FULL)";
                        else if (isWrongGender) label += ` (${a.gender_allowed} only)`;
                        
                        return (
                          <option key={a.id} value={a.id} disabled={isDisabled}>
                            {label}
                          </option>
                        );
                      })}
                    </select>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <input 
                      type="text" 
                      value={roomNum} 
                      onChange={(e) => setRoomNum(e.target.value)} 
                      placeholder="Room #"
                      style={{ padding: '0.5rem', width: '80px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                    />
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <Button variant="secondary" size="sm" onClick={() => setEditingId(null)}>Cancel</Button>
                      <Button variant="primary" size="sm" isLoading={isLoading} onClick={() => handleSave(athlete.id)}>Save</Button>
                    </div>
                  </td>
                </>
              ) : (
                <>
                  <td style={{ padding: '1rem' }}>
                    {athlete.accommodations?.name ? (
                      <span style={{ fontWeight: 500 }}>{athlete.accommodations.name}</span>
                    ) : (
                      <Badge variant="default">Unassigned</Badge>
                    )}
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 600 }}>{athlete.room_number || '-'}</td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <Button variant="ghost" size="sm" onClick={() => startEditing(athlete)}>Assign</Button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
