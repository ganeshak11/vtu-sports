'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { importAthletesCSV } from '@/app/actions/import';

export const AthleteImport: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);

    const formData = new FormData(e.currentTarget);
    const response = await importAthletesCSV(formData);

    if (response.error) {
      setResult({ type: 'error', msg: response.error });
    } else if (response.success) {
      setResult({ type: 'success', msg: `Successfully imported ${response.count} athletes. Chest numbers have been automatically generated.` });
      (e.target as HTMLFormElement).reset();
    }
    
    setIsLoading(false);
  };

  const downloadSample = () => {
    const csvContent = "data:text/csv;charset=utf-8,Name,College,Gender\nRahul Sharma,MIT Mysore,Male\nPriya K,PES University,Female";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "sample_athletes.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card style={{ border: '1px solid var(--accent-primary)' }}>
      <CardHeader>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <CardTitle style={{ color: 'var(--accent-primary)' }}>Bulk Import Athletes</CardTitle>
          <Button type="button" variant="ghost" onClick={downloadSample} className="text-sm">
            Download Sample CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div style={{ 
            border: '2px dashed var(--border-color)', 
            padding: '2rem', 
            borderRadius: 'var(--radius-md)', 
            textAlign: 'center',
            background: 'var(--bg-tertiary)'
          }}>
            <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
              Upload a CSV file containing <b>Name</b>, <b>College</b>, and <b>Gender</b>.
            </p>
            <input 
              type="file" 
              name="file" 
              accept=".csv" 
              required 
              style={{ display: 'block', margin: '0 auto', color: 'var(--text-primary)' }} 
            />
          </div>

          {result && (
            <div style={{ 
              padding: '1rem', 
              borderRadius: 'var(--radius-sm)',
              background: result.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              border: `1px solid ${result.type === 'success' ? 'var(--success)' : 'var(--danger)'}`,
              color: result.type === 'success' ? 'var(--success)' : 'var(--danger)'
            }}>
              {result.msg}
            </div>
          )}

          <Button type="submit" variant="primary" isLoading={isLoading} style={{ alignSelf: 'flex-start' }}>
            {isLoading ? 'Importing...' : 'Upload & Process CSV'}
          </Button>

        </form>
      </CardContent>
    </Card>
  );
}
