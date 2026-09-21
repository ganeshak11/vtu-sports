'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { toggleAccommodationCheckIn } from '@/app/actions/warden';

interface Athlete {
  id: string;
  full_name?: string;
  sslc_name?: string;
  bib_number?: string;
  chest_number?: string;
  college_name?: string;
  gender?: string;
  accommodation_checked_in?: boolean;
  accommodation_checked_in_at?: string;
  payment_status?: string;
}

interface Props {
  athletes: Athlete[];
}

export default function AccommodationAssignmentClient({ athletes }: Props) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'checked_in' | 'pending'>('all');
  const [filterGender, setFilterGender] = useState<'all' | 'men' | 'women'>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filteredAthletes = athletes.filter((athlete) => {
    const name = (athlete.sslc_name || athlete.full_name || '').toLowerCase();
    const college = (athlete.college_name || '').toLowerCase();
    const bib = (athlete.bib_number || athlete.chest_number || '').toLowerCase();
    const q = search.toLowerCase();

    const matchesSearch = !q || name.includes(q) || college.includes(q) || bib.includes(q);

    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'checked_in' && athlete.accommodation_checked_in) ||
      (filterStatus === 'pending' && !athlete.accommodation_checked_in);

    const matchesGender =
      filterGender === 'all' ||
      (filterGender === 'men' && (athlete.gender === 'male' || athlete.gender === 'men')) ||
      (filterGender === 'women' && (athlete.gender === 'female' || athlete.gender === 'women'));

    return matchesSearch && matchesStatus && matchesGender;
  });

  const handleToggle = async (athleteId: string, currentStatus: boolean) => {
    setUpdatingId(athleteId);
    await toggleAccommodationCheckIn(athleteId, !currentStatus);
    setUpdatingId(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Controls Bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'space-between', alignItems: 'center' }}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, college, or bib..."
          style={{
            minWidth: '280px',
            flex: 1,
            padding: '0.65rem 1rem',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-primary)',
            fontSize: '0.9rem',
            outline: 'none'
          }}
        />

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            style={{
              padding: '0.65rem 0.85rem',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              outline: 'none'
            }}
          >
            <option value="all">All Statuses ({athletes.length})</option>
            <option value="checked_in">Checked In ({athletes.filter(a => a.accommodation_checked_in).length})</option>
            <option value="pending">Pending Check-In ({athletes.filter(a => !a.accommodation_checked_in).length})</option>
          </select>

          <select
            value={filterGender}
            onChange={(e) => setFilterGender(e.target.value as any)}
            style={{
              padding: '0.65rem 0.85rem',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              outline: 'none'
            }}
          >
            <option value="all">All Genders</option>
            <option value="men">Men</option>
            <option value="women">Women</option>
          </select>
        </div>
      </div>

      {/* Athletes List */}
      <div style={{ overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '0.875rem 1rem', fontWeight: 600 }}>Bib #</th>
              <th style={{ padding: '0.875rem 1rem', fontWeight: 600 }}>Athlete Name</th>
              <th style={{ padding: '0.875rem 1rem', fontWeight: 600 }}>College</th>
              <th style={{ padding: '0.875rem 1rem', fontWeight: 600 }}>Gender</th>
              <th style={{ padding: '0.875rem 1rem', fontWeight: 600 }}>Hostel Status</th>
              <th style={{ padding: '0.875rem 1rem', fontWeight: 600, textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredAthletes.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No athletes match current filters.
                </td>
              </tr>
            ) : (
              filteredAthletes.map((athlete) => {
                const isCheckedIn = Boolean(athlete.accommodation_checked_in);
                const isUpdating = updatingId === athlete.id;
                const timeStr = athlete.accommodation_checked_in_at
                  ? new Date(athlete.accommodation_checked_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : '';

                return (
                  <tr key={athlete.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    <td style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                      {athlete.bib_number ? `#${athlete.bib_number}` : athlete.chest_number || 'N/A'}
                    </td>
                    <td style={{ padding: '0.875rem 1rem', fontWeight: 600 }}>
                      {athlete.sslc_name || athlete.full_name}
                    </td>
                    <td style={{ padding: '0.875rem 1rem', color: 'var(--text-secondary)' }}>
                      {athlete.college_name || 'N/A'}
                    </td>
                    <td style={{ padding: '0.875rem 1rem', textTransform: 'capitalize' }}>
                      {athlete.gender}
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      {isCheckedIn ? (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Badge variant="success">Checked In</Badge>
                          {timeStr && <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{timeStr}</span>}
                        </div>
                      ) : (
                        <Badge variant="default">Pending</Badge>
                      )}
                    </td>
                    <td style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>
                      <Button
                        size="sm"
                        variant={isCheckedIn ? 'ghost' : 'primary'}
                        disabled={isUpdating}
                        onClick={() => handleToggle(athlete.id, isCheckedIn)}
                        style={{ fontSize: '0.75rem' }}
                      >
                        {isUpdating ? 'Updating...' : isCheckedIn ? 'Undo Check-In' : 'Mark Checked In'}
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
