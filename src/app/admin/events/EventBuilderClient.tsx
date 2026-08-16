'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { createDynamicEvent } from '@/app/actions/admin';

interface Rule {
  id: string;
  name: string;
}

export const EventBuilderClient: React.FC<{ qualificationRules: Rule[] }> = ({ qualificationRules }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [category, setCategory] = useState('track');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await createDynamicEvent(formData);

    if (result.error) {
      alert(result.error);
    } else {
      alert("Event dynamically created!");
      (e.target as HTMLFormElement).reset();
    }
    
    setIsLoading(false);
  };

  return (
    <Card className="hover-lift" style={{ border: '1px solid var(--accent-primary)' }}>
      <CardHeader>
        <CardTitle style={{ color: 'var(--accent-primary)' }}>No-Code Event Builder</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Event Name</label>
              <input name="name" required placeholder="e.g. 300m Sprint" style={inputStyle} />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Event Code (Unique)</label>
              <input name="code" required placeholder="e.g. T-300M-MEN" style={inputStyle} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Category</label>
              <select name="category" value={category} onChange={e => setCategory(e.target.value)} style={inputStyle}>
                <option value="track">Track Event</option>
                <option value="field">Field Event</option>
                <option value="relay">Relay Event</option>
                <option value="combined">Combined Event</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Gender</label>
              <select name="gender" style={inputStyle}>
                <option value="men">Men</option>
                <option value="women">Women</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Measurement</label>
              <select name="measurement_metric" style={inputStyle}>
                <option value="time">Time (Stopwatch)</option>
                <option value="distance">Distance (Meters)</option>
                <option value="height">Height (Meters)</option>
                <option value="points">Points</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Qualification Rule</label>
              <select name="qualification_rule_id" style={inputStyle}>
                {qualificationRules.map(rule => (
                  <option key={rule.id} value={rule.id}>{rule.name}</option>
                ))}
              </select>
            </div>
            
            {category === 'track' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Lanes Required</label>
                <input name="lanes_required" type="number" defaultValue="8" style={inputStyle} />
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Rounds Progression</label>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Configure rounds to auto-generate heats.</p>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <label><input type="checkbox" name="rounds" value="heat" defaultChecked /> Heat</label>
              <label><input type="checkbox" name="rounds" value="semi" /> Semi-Final</label>
              <label><input type="checkbox" name="rounds" value="final" defaultChecked /> Final</label>
            </div>
          </div>

          <Button type="submit" variant="primary" isLoading={isLoading}>
            Deploy Dynamic Event
          </Button>

        </form>
      </CardContent>
    </Card>
  );
}

const inputStyle = {
  padding: '0.75rem',
  background: 'var(--bg-secondary)',
  color: 'var(--text-primary)',
  border: '1px solid var(--border-color)',
  borderRadius: 'var(--radius-sm)',
  outline: 'none'
};
