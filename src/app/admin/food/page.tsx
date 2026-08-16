import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { supabase } from '@/lib/supabase';
import { TOTAL_DAYS } from '@/lib/event-constants';

export default async function FoodAnalyticsPage() {
  // Fetch all food logs
  const { data: logs, error } = await supabase
    .from('food_logs')
    .select('meal_type');

  if (error) {
    console.error('Error fetching food logs:', error);
  }

  const mealCounts: Record<string, number> = {};
  if (logs) {
    logs.forEach(log => {
      mealCounts[log.meal_type] = (mealCounts[log.meal_type] || 0) + 1;
    });
  }

  const mealTypes = ['breakfast', 'lunch', 'dinner'];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Food Analytics</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Track meal consumption across all days.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {Array.from({ length: TOTAL_DAYS }).map((_, i) => {
          const dayNum = i + 1;
          return (
            <Card key={dayNum}>
              <CardHeader>
                <CardTitle>Day {dayNum} Consumption</CardTitle>
              </CardHeader>
              <CardContent>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  {mealTypes.map(meal => {
                    const id = `day${dayNum}_${meal}`;
                    const count = mealCounts[id] || 0;
                    return (
                      <div key={meal} style={{ 
                        background: 'var(--bg-tertiary)', 
                        padding: '1.5rem', 
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid var(--border-color)'
                      }}>
                        <span style={{ textTransform: 'capitalize', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '0.5rem' }}>
                          {meal}
                        </span>
                        <span style={{ fontSize: '2.5rem', fontWeight: 800, color: count > 0 ? 'var(--accent-primary)' : 'var(--text-primary)' }}>
                          {count}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                          meals served
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
