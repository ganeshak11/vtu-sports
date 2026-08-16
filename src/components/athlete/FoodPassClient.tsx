'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { TOTAL_DAYS, getMealStatus, MealStatus } from '@/lib/event-constants';

interface Props {
  foodLogs: { meal_type: string }[];
}

export const FoodPassClient: React.FC<Props> = ({ foodLogs }) => {
  const [activeDay, setActiveDay] = useState(1);

  const hasConsumed = (mealType: string) => foodLogs.some(log => log.meal_type === mealType);

  const renderMeal = (mealName: 'breakfast' | 'lunch' | 'dinner', label: string) => {
    const mealId = `day${activeDay}_${mealName}`;
    const isConsumed = hasConsumed(mealId);
    const status: MealStatus = getMealStatus(activeDay, mealName, isConsumed);

    let badgeVariant: 'success' | 'warning' | 'danger' | 'info' | 'default' = 'default';
    if (status === 'Consumed') badgeVariant = 'success';
    else if (status === 'Available') badgeVariant = 'info';
    else if (status === 'Expired') badgeVariant = 'danger';
    else if (status === 'Future') badgeVariant = 'default';

    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
        <span style={{ fontWeight: 500, color: status === 'Expired' ? 'var(--text-secondary)' : 'var(--text-primary)' }}>
          {label}
        </span>
        <Badge variant={badgeVariant}>{status}</Badge>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle style={{ fontSize: '1.125rem' }}>Digital Food Pass</CardTitle>
      </CardHeader>
      <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        
        {/* Day Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
          {Array.from({ length: TOTAL_DAYS }).map((_, i) => {
            const dayNum = i + 1;
            const isActive = dayNum === activeDay;
            return (
              <button
                key={dayNum}
                onClick={() => setActiveDay(dayNum)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '1rem',
                  border: 'none',
                  background: isActive ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                  color: isActive ? '#fff' : 'var(--text-primary)',
                  fontWeight: isActive ? 600 : 500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                Day {dayNum}
              </button>
            );
          })}
        </div>

        {/* Meals for active day */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {renderMeal('breakfast', 'Breakfast (07:00 - 10:00)')}
          {renderMeal('lunch', 'Lunch (12:30 - 15:00)')}
          {renderMeal('dinner', 'Dinner (19:30 - 22:00)')}
        </div>
        
      </CardContent>
    </Card>
  );
};
