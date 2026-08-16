'use client';

import React, { useEffect, useState } from 'react';
import { getLiveResults } from '@/app/actions/live';
import { Card, CardContent } from '@/components/ui/Card';

export function LiveResultsClient() {
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const fetchResults = async () => {
    const res = await getLiveResults();
    if (res.data) {
      setEvents(res.data);
    }
    setLastRefreshed(new Date());
    setIsLoading(false);
  };

  useEffect(() => {
    fetchResults();

    // Poll every 15 seconds
    const interval = setInterval(() => {
      fetchResults();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-8 w-8 rounded-full border-4 border-t-red-500 border-red-500/30 animate-spin"></div>
          <p className="text-[var(--text-secondary)]">Loading live feeds...</p>
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center text-[var(--text-secondary)]">
          <p className="text-xl">No results have been published yet.</p>
          <p className="mt-2 text-sm">Stay tuned! Results will appear here automatically once entered by referees.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end text-sm text-[var(--text-secondary)]">
        Last updated: {lastRefreshed?.toLocaleTimeString()}
      </div>
      
      {events.map(event => (
        <Card key={event.id} className="overflow-hidden border-t-4" style={{ borderTopColor: 'var(--accent-primary)' }}>
          <div className="p-6 bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
            <h2 className="text-2xl font-bold">{event.name}</h2>
            <p className="text-[var(--text-secondary)] mt-1 capitalize">
              {event.gender} &bull; {event.category}
            </p>
          </div>
          <CardContent className="p-0">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[var(--bg-tertiary)] text-[var(--text-secondary)] text-sm border-b border-[var(--border-color)]">
                  <th className="px-6 py-4 font-semibold w-24">Rank</th>
                  <th className="px-6 py-4 font-semibold">Athlete</th>
                  <th className="px-6 py-4 font-semibold">College</th>
                  <th className="px-6 py-4 font-semibold text-right">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {event.results.map((res: any, idx: number) => {
                  
                  let rankColor = 'text-[var(--text-primary)]';
                  let rankBg = 'bg-transparent';
                  
                  if (res.rank === 1) {
                    rankColor = 'text-yellow-500';
                    rankBg = 'bg-yellow-500/10';
                  } else if (res.rank === 2) {
                    rankColor = 'text-gray-400';
                    rankBg = 'bg-gray-400/10';
                  } else if (res.rank === 3) {
                    rankColor = 'text-amber-700';
                    rankBg = 'bg-amber-700/10';
                  }

                  return (
                    <tr key={res.id} className="hover:bg-[var(--bg-secondary)] transition-colors">
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${rankColor} ${rankBg}`}>
                          {res.rank}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-[var(--text-primary)]">
                        {res.athlete_name}
                      </td>
                      <td className="px-6 py-4 text-[var(--text-secondary)]">
                        {res.college_name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-lg text-[var(--accent-primary)]">
                        {res.result_value || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
