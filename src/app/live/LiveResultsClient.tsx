'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { getLiveResults } from '@/app/actions/live';

export function LiveResultsClient() {
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [secondsUntilRefresh, setSecondsUntilRefresh] = useState(15);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedGender, setSelectedGender] = useState<string>('all');

  const fetchResults = async (manual = false) => {
    if (manual) setIsRefreshing(true);
    try {
      const res = await getLiveResults();
      if (res.data) {
        setEvents(res.data);
      }
      setLastRefreshed(new Date());
      setSecondsUntilRefresh(15);
    } catch (err) {
      console.error('Error refreshing live results:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchResults();

    // Auto-refresh interval every 15s
    const pollInterval = setInterval(() => {
      fetchResults();
    }, 15000);

    // Countdown ticker
    const timer = setInterval(() => {
      setSecondsUntilRefresh((prev) => (prev > 1 ? prev - 1 : 15));
    }, 1000);

    return () => {
      clearInterval(pollInterval);
      clearInterval(timer);
    };
  }, []);

  // Filtered events
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      // Category filter
      if (selectedCategory !== 'all') {
        const cat = (ev.category || '').toLowerCase();
        if (selectedCategory === 'relay' && !cat.includes('relay') && !ev.name.toLowerCase().includes('relay')) {
          return false;
        } else if (selectedCategory !== 'relay' && cat !== selectedCategory) {
          return false;
        }
      }

      // Gender filter
      if (selectedGender !== 'all') {
        const g = (ev.gender || '').toLowerCase();
        if (g !== selectedGender) return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesEventName = ev.name.toLowerCase().includes(q) || ev.rawName?.toLowerCase().includes(q);
        const matchesAthlete = ev.results.some((r: any) =>
          r.athlete_name.toLowerCase().includes(q) ||
          r.college_name.toLowerCase().includes(q) ||
          (r.bib_number && String(r.bib_number).includes(q))
        );
        if (!matchesEventName && !matchesAthlete) return false;
      }

      return true;
    });
  }, [events, selectedCategory, selectedGender, searchQuery]);

  // Quick stats
  const totalRounds = events.length;
  const totalMedals = useMemo(() => {
    return events.reduce((acc, ev) => {
      const top3 = ev.results.filter((r: any) => r.rank >= 1 && r.rank <= 3).length;
      return acc + top3;
    }, 0);
  }, [events]);

  if (isLoading) {
    return (
      <div className="live-loading-state">
        <div className="loading-spinner"></div>
        <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Connecting to Lynx Timing & Live Results Feed...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Broadcast Header Banner */}
      <div className="live-broadcast-banner">
        <div className="live-ambient-glow" />
        
        <div className="live-top-meta">
          <div className="live-badge-pulse">
            <span className="pulse-dot" />
            <span>Official VTU Live Results Broadcast</span>
          </div>
          <div className="host-badge-text">
            Visvesvaraya Technological University &bull; Host: Dr. ACS College of Engineering, Bengaluru
          </div>
        </div>

        <h1 className="live-title">
          Real-Time Championship <br />
          <span className="live-title-highlight">Results & Field Standings</span>
        </h1>

        <p className="live-subtitle">
          Synchronized feed directly from FinishLynx photo-finish timing towers and certified field measurement desks.
          All marks verified by VTU Chief Athletics Referees.
        </p>

        {/* Quick Metrics Bar */}
        <div className="live-metrics-row">
          <div className="live-metric-pill">
            <span className="metric-number" style={{ color: '#60a5fa' }}>{totalRounds}</span>
            <span className="metric-label">Rounds Finalized</span>
          </div>

          <div className="live-metric-pill">
            <span className="metric-number" style={{ color: '#f59e0b' }}>{totalMedals}</span>
            <span className="metric-label">Medals Decided</span>
          </div>

          <div className="live-metric-pill">
            <span className="metric-number" style={{ color: '#34d399' }}>● Active</span>
            <span className="metric-label">Auto-sync ({secondsUntilRefresh}s)</span>
          </div>

          <Link href="/leaderboard" className="btn-standings-link">
            <span>🏆 View Championship Standings &rarr;</span>
          </Link>
        </div>
      </div>

      {/* Interactive Controls & Filters */}
      <div className="live-controls-panel">
        {/* Search Field */}
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by event (e.g. 100m, Long Jump), athlete name, bib #, or college..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input-field"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Filters Row */}
        <div className="filters-row">
          {/* Category Tabs */}
          <div className="category-filter-tabs">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`filter-tab-btn ${selectedCategory === 'all' ? 'active' : ''}`}
            >
              All Events ({events.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('track')}
              className={`filter-tab-btn ${selectedCategory === 'track' ? 'active' : ''}`}
            >
              🏃 Track & Sprints
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('field')}
              className={`filter-tab-btn ${selectedCategory === 'field' ? 'active' : ''}`}
            >
              👟 Field (Jumps/Throws)
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('relay')}
              className={`filter-tab-btn ${selectedCategory === 'relay' ? 'active' : ''}`}
            >
              🎽 Relays
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('combined')}
              className={`filter-tab-btn ${selectedCategory === 'combined' ? 'active' : ''}`}
            >
              🏅 Combined
            </button>
          </div>

          {/* Gender Filter Switcher */}
          <div className="gender-filter-group">
            <button
              type="button"
              onClick={() => setSelectedGender('all')}
              className={`gender-btn ${selectedGender === 'all' ? 'active' : ''}`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setSelectedGender('men')}
              className={`gender-btn ${selectedGender === 'men' ? 'active' : ''}`}
            >
              🚹 Men&apos;s
            </button>
            <button
              type="button"
              onClick={() => setSelectedGender('women')}
              className={`gender-btn ${selectedGender === 'women' ? 'active' : ''}`}
            >
              🚺 Women&apos;s
            </button>
          </div>

          {/* Refresh Control */}
          <div className="refresh-control">
            <button
              type="button"
              onClick={() => fetchResults(true)}
              disabled={isRefreshing}
              className="btn-manual-refresh"
            >
              <span>{isRefreshing ? '⏳' : '🔄'}</span>
              <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
            <span style={{ color: '#94a3b8' }}>
              {lastRefreshed ? `Updated: ${lastRefreshed.toLocaleTimeString()}` : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Events Results Stream */}
      {filteredEvents.length === 0 ? (
        <div className="live-empty-state">
          <div className="empty-icon">🔍</div>
          <h3 className="empty-title">No events match your criteria</h3>
          <p className="empty-desc">
            Try adjusting your search terms, gender filter, or discipline categories.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setSelectedGender('all');
            }}
            className="filter-tab-btn active"
            style={{ marginTop: '1.25rem', padding: '0.6rem 1.25rem' }}
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="events-list-container">
          {filteredEvents.map((event) => {
            const topThree = event.results.slice(0, 3);
            const remaining = event.results.slice(3);
            const roundTypeClass = event.roundType.toLowerCase().includes('semi')
              ? 'semi'
              : event.roundType.toLowerCase().includes('heat')
              ? 'heat'
              : 'final';

            return (
              <div key={event.id} className="event-card">
                {/* Event Card Header */}
                <div className="event-card-header">
                  <div className="event-headline-group">
                    <h2 className="event-card-title">{event.rawName || event.name}</h2>
                    <span className={`badge-round-type ${roundTypeClass}`}>
                      {event.roundType}
                    </span>
                  </div>

                  <div className="event-meta-pills">
                    <span className={`pill-gender ${event.gender === 'women' ? 'women' : 'men'}`}>
                      {event.gender === 'women' ? 'Women' : 'Men'}
                    </span>
                    <span className="pill-category">
                      {event.category}
                    </span>
                  </div>
                </div>

                {/* Podium Strip (Top 3 Finishers) */}
                {topThree.length > 0 && (
                  <div className="event-podium-strip">
                    {topThree.map((res: any) => {
                      const medalClass = res.rank === 1 ? 'gold' : res.rank === 2 ? 'silver' : 'bronze';
                      const medalLabel = res.rank === 1 ? '🥇 1st Place' : res.rank === 2 ? '🥈 2nd Place' : '🥉 3rd Place';

                      return (
                        <div key={res.id} className={`podium-slot-card ${medalClass}`}>
                          <div>
                            <div className="slot-top-row">
                              <span className="slot-medal-badge">
                                {medalLabel}
                              </span>
                              <span className="slot-points-tag">
                                +{res.points} PTS
                              </span>
                            </div>

                            <div className="slot-mark-time">
                              {res.result_value}
                            </div>

                            <div className="slot-athlete-name">
                              {res.athlete_name}
                              {res.bib_number && (
                                <span className="slot-bib-tag">#{res.bib_number}</span>
                              )}
                            </div>
                          </div>

                          <div className="slot-college-name">
                            🏫 {res.college_name}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Extended Standings Table (Places 4 to 8+) */}
                {remaining.length > 0 && (
                  <div className="event-table-wrapper">
                    <table className="results-table">
                      <thead>
                        <tr>
                          <th style={{ width: '80px' }}>Rank</th>
                          <th style={{ width: '90px' }}>Bib #</th>
                          <th>Athlete Name</th>
                          <th>College / Delegation</th>
                          <th style={{ textAlign: 'right' }}>Official Result</th>
                          <th style={{ textAlign: 'right', width: '100px' }}>Points</th>
                        </tr>
                      </thead>
                      <tbody>
                        {remaining.map((res: any) => (
                          <tr key={res.id}>
                            <td>
                              <span className="rank-cell-pill other">
                                {res.rank}
                              </span>
                            </td>
                            <td>
                              {res.bib_number ? (
                                <span className="table-bib-badge">#{res.bib_number}</span>
                              ) : (
                                <span style={{ color: '#94a3b8' }}>-</span>
                              )}
                            </td>
                            <td>
                              <span className="table-athlete-name">{res.athlete_name}</span>
                            </td>
                            <td>
                              <span style={{ color: '#64748b' }}>{res.college_name}</span>
                            </td>
                            <td className="table-result-mark">
                              {res.result_value}
                            </td>
                            <td className="table-points-awarded">
                              {res.points > 0 ? `+${res.points} pts` : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
