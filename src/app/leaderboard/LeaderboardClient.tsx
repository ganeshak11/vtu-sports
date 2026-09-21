'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';

export interface CollegeStanding {
  rank: number;
  collegeName: string;
  gold: number;
  silver: number;
  bronze: number;
  totalPoints: number;
  menPoints: number;
  womenPoints: number;
}

export interface AthleteStanding {
  rank: number;
  id: string;
  name: string;
  college: string;
  gender: string;
  bib: string;
  gold: number;
  silver: number;
  bronze: number;
  points: number;
}

export interface ChampionshipAwards {
  overallChampion?: CollegeStanding | null;
  bestMensCollege?: CollegeStanding | null;
  bestWomensCollege?: CollegeStanding | null;
  bestMaleAthlete?: AthleteStanding | null;
  bestFemaleAthlete?: AthleteStanding | null;
}

interface Props {
  overallStandings: CollegeStanding[];
  mensStandings: CollegeStanding[];
  womensStandings: CollegeStanding[];
  athleteStandings: AthleteStanding[];
  awards: ChampionshipAwards;
}

export default function LeaderboardClient({
  overallStandings,
  mensStandings,
  womensStandings,
  athleteStandings,
  awards
}: Props) {
  const [activeTab, setActiveTab] = useState<'overall' | 'men' | 'women' | 'athletes'>('overall');
  const [search, setSearch] = useState('');

  const currentList = 
    activeTab === 'overall' ? overallStandings :
    activeTab === 'men' ? mensStandings :
    activeTab === 'women' ? womensStandings :
    athleteStandings;

  const filteredList = currentList.filter(item => {
    const term = search.toLowerCase();
    if ('collegeName' in item) {
      return !term || item.collegeName.toLowerCase().includes(term);
    } else {
      return !term || item.name.toLowerCase().includes(term) || item.college.toLowerCase().includes(term) || item.bib.toLowerCase().includes(term);
    }
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      
      {/* 5 Spotlight Championship Trophy Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        
        {/* Overall Champion */}
        <div style={{
          padding: '1.5rem',
          borderRadius: 'var(--radius-md)',
          background: 'linear-gradient(135deg, rgba(252, 211, 77, 0.15), rgba(245, 158, 11, 0.05))',
          border: '2px solid rgba(252, 211, 77, 0.5)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#FCD34D' }}>
                Overall Champion
              </span>
              <span style={{ fontSize: '1.5rem' }}>🏆</span>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>
              {awards.overallChampion?.collegeName || 'TBD'}
            </h3>
          </div>
          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              🥇 {awards.overallChampion?.gold || 0} &bull; 🥈 {awards.overallChampion?.silver || 0}
            </span>
            <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#FCD34D' }}>
              {awards.overallChampion?.totalPoints || 0} pts
            </span>
          </div>
        </div>

        {/* Best Men's College */}
        <div style={{
          padding: '1.5rem',
          borderRadius: 'var(--radius-md)',
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(37, 99, 235, 0.05))',
          border: '1px solid rgba(59, 130, 246, 0.4)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#60a5fa' }}>
                Best Men's College
              </span>
              <span style={{ fontSize: '1.5rem' }}>🏃‍♂️</span>
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>
              {awards.bestMensCollege?.collegeName || 'TBD'}
            </h3>
          </div>
          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Men's Division</span>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#60a5fa' }}>
              {awards.bestMensCollege?.menPoints || 0} pts
            </span>
          </div>
        </div>

        {/* Best Women's College */}
        <div style={{
          padding: '1.5rem',
          borderRadius: 'var(--radius-md)',
          background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(219, 39, 119, 0.05))',
          border: '1px solid rgba(236, 72, 153, 0.4)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#f472b6' }}>
                Best Women's College
              </span>
              <span style={{ fontSize: '1.5rem' }}>🏃‍♀️</span>
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>
              {awards.bestWomensCollege?.collegeName || 'TBD'}
            </h3>
          </div>
          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Women's Division</span>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f472b6' }}>
              {awards.bestWomensCollege?.womenPoints || 0} pts
            </span>
          </div>
        </div>

        {/* Best Male Athlete */}
        <div style={{
          padding: '1.5rem',
          borderRadius: 'var(--radius-md)',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.05))',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#34d399' }}>
                Best Male Athlete
              </span>
              <span style={{ fontSize: '1.5rem' }}>🏅</span>
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>
              {awards.bestMaleAthlete?.name || 'TBD'}
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {awards.bestMaleAthlete?.college || '-'}
            </span>
          </div>
          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              🥇 {awards.bestMaleAthlete?.gold || 0} Gold
            </span>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#34d399' }}>
              {awards.bestMaleAthlete?.points || 0} pts
            </span>
          </div>
        </div>

        {/* Best Female Athlete */}
        <div style={{
          padding: '1.5rem',
          borderRadius: 'var(--radius-md)',
          background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(147, 51, 234, 0.05))',
          border: '1px solid rgba(168, 85, 247, 0.4)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#c084fc' }}>
                Best Female Athlete
              </span>
              <span style={{ fontSize: '1.5rem' }}>🏅</span>
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>
              {awards.bestFemaleAthlete?.name || 'TBD'}
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {awards.bestFemaleAthlete?.college || '-'}
            </span>
          </div>
          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              🥇 {awards.bestFemaleAthlete?.gold || 0} Gold
            </span>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#c084fc' }}>
              {awards.bestFemaleAthlete?.points || 0} pts
            </span>
          </div>
        </div>

      </div>

      {/* Tabs and Filter Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', background: 'var(--bg-tertiary)', padding: '0.35rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', gap: '0.25rem' }}>
          <button
            onClick={() => setActiveTab('overall')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: activeTab === 'overall' ? 'var(--accent-primary)' : 'transparent',
              color: activeTab === 'overall' ? '#fff' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            🏆 Overall Championship
          </button>
          <button
            onClick={() => setActiveTab('men')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: activeTab === 'men' ? '#3b82f6' : 'transparent',
              color: activeTab === 'men' ? '#fff' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            Men's Section
          </button>
          <button
            onClick={() => setActiveTab('women')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: activeTab === 'women' ? '#ec4899' : 'transparent',
              color: activeTab === 'women' ? '#fff' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            Women's Section
          </button>
          <button
            onClick={() => setActiveTab('athletes')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: activeTab === 'athletes' ? '#8b5cf6' : 'transparent',
              color: activeTab === 'athletes' ? '#fff' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            Individual Athletes
          </button>
        </div>

        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter college or athlete..."
          style={{
            padding: '0.6rem 1rem',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-tertiary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
            fontSize: '0.9rem',
            outline: 'none',
            minWidth: '240px'
          }}
        />

      </div>

      {/* Standings Table */}
      <Card>
        <CardContent style={{ padding: 0 }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.02)' }}>
                  <th style={{ padding: '1.25rem 1rem', fontWeight: 600, width: '80px', textAlign: 'center' }}>Rank</th>
                  <th style={{ padding: '1.25rem 1rem', fontWeight: 600 }}>
                    {activeTab === 'athletes' ? 'Athlete & College' : 'College Delegation'}
                  </th>
                  <th style={{ padding: '1.25rem 1rem', fontWeight: 600, textAlign: 'center', color: '#FCD34D' }}>🥇 Gold</th>
                  <th style={{ padding: '1.25rem 1rem', fontWeight: 600, textAlign: 'center', color: '#E5E7EB' }}>🥈 Silver</th>
                  <th style={{ padding: '1.25rem 1rem', fontWeight: 600, textAlign: 'center', color: '#D97706' }}>🥉 Bronze</th>
                  <th style={{ padding: '1.25rem 1rem', fontWeight: 800, textAlign: 'right', color: 'var(--accent-primary)' }}>Total Points</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      No results have been finalized yet in this division. Results will update automatically once final rounds conclude.
                    </td>
                  </tr>
                ) : (
                  filteredList.map((item, idx) => {
                    const isAthlete = 'name' in item;
                    const points = isAthlete ? item.points : (activeTab === 'men' ? item.menPoints : activeTab === 'women' ? item.womenPoints : item.totalPoints);
                    const rank = idx + 1;

                    return (
                      <tr 
                        key={isAthlete ? item.id : item.collegeName} 
                        style={{ 
                          borderBottom: '1px solid rgba(255,255,255,0.05)',
                          background: rank === 1 ? 'rgba(252, 211, 77, 0.06)' : rank === 2 ? 'rgba(229, 231, 235, 0.04)' : rank === 3 ? 'rgba(217, 119, 6, 0.04)' : 'transparent',
                          transition: 'background 0.15s'
                        }}
                      >
                        <td style={{ padding: '1.25rem 1rem', fontWeight: 800, textAlign: 'center', fontSize: '1.15rem' }}>
                          {rank === 1 ? '🥇 1' : rank === 2 ? '🥈 2' : rank === 3 ? '🥉 3' : rank}
                        </td>
                        <td style={{ padding: '1.25rem 1rem' }}>
                          {isAthlete ? (
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>
                                {item.name} {item.bib && <span style={{ color: 'var(--accent-primary)', fontSize: '0.85rem' }}>(Bib #{item.bib})</span>}
                              </div>
                              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                {item.college} &bull; <span style={{ textTransform: 'capitalize' }}>{item.gender}</span>
                              </div>
                            </div>
                          ) : (
                            <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                              {item.collegeName}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '1.25rem 1rem', textAlign: 'center', fontWeight: 600, color: item.gold > 0 ? '#FCD34D' : 'var(--text-secondary)' }}>
                          {item.gold}
                        </td>
                        <td style={{ padding: '1.25rem 1rem', textAlign: 'center', fontWeight: 600, color: item.silver > 0 ? '#E5E7EB' : 'var(--text-secondary)' }}>
                          {item.silver}
                        </td>
                        <td style={{ padding: '1.25rem 1rem', textAlign: 'center', fontWeight: 600, color: item.bronze > 0 ? '#D97706' : 'var(--text-secondary)' }}>
                          {item.bronze}
                        </td>
                        <td style={{ padding: '1.25rem 1rem', textAlign: 'right', fontWeight: 800, fontSize: '1.25rem', color: 'var(--accent-primary)' }}>
                          {points}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
