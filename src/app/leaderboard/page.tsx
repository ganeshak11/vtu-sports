import React from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import LeaderboardClient, { 
  CollegeStanding, 
  AthleteStanding, 
  ChampionshipAwards 
} from './LeaderboardClient';

export const revalidate = 0;

export default async function LeaderboardPage() {
  // Fetch all results where round_type = 'final' and rank is not null
  const { data: finalResults, error } = await supabase
    .from('event_results')
    .select(`
      id,
      rank,
      final_result,
      profile:profile_id (
        id,
        sslc_name,
        full_name,
        college_name,
        gender,
        bib_number,
        chest_number
      ),
      event:event_id (
        id,
        name,
        gender,
        category
      ),
      round:round_id (
        id,
        round_type
      )
    `)
    .not('rank', 'is', null);

  if (error) {
    console.error('Error fetching final results:', error);
  }

  // Filter only final rounds
  const finalsOnly = (finalResults || []).filter(r => (r.round as any)?.round_type === 'final');

  // Points mapping
  const getPointsForRank = (rank: number) => {
    switch (rank) {
      case 1: return 10;
      case 2: return 8;
      case 3: return 6;
      case 4: return 5;
      case 5: return 4;
      case 6: return 3;
      case 7: return 2;
      case 8: return 1;
      default: return 0;
    }
  };

  // Aggregation maps
  const collegeMap: Record<string, {
    collegeName: string;
    gold: number;
    silver: number;
    bronze: number;
    totalPoints: number;
    menPoints: number;
    womenPoints: number;
  }> = {};

  const athleteMap: Record<string, {
    id: string;
    name: string;
    college: string;
    gender: string;
    bib: string;
    gold: number;
    silver: number;
    bronze: number;
    points: number;
  }> = {};

  finalsOnly.forEach(item => {
    const p = item.profile as any;
    const ev = item.event as any;
    const rank = item.rank || 0;
    const points = getPointsForRank(rank);

    if (!p?.college_name) return;

    // College Aggregation
    const cName = p.college_name;
    if (!collegeMap[cName]) {
      collegeMap[cName] = {
        collegeName: cName,
        gold: 0,
        silver: 0,
        bronze: 0,
        totalPoints: 0,
        menPoints: 0,
        womenPoints: 0
      };
    }

    if (rank === 1) collegeMap[cName].gold += 1;
    else if (rank === 2) collegeMap[cName].silver += 1;
    else if (rank === 3) collegeMap[cName].bronze += 1;

    collegeMap[cName].totalPoints += points;
    if (ev?.gender === 'men' || p?.gender === 'men' || p?.gender === 'male') {
      collegeMap[cName].menPoints += points;
    } else if (ev?.gender === 'women' || p?.gender === 'women' || p?.gender === 'female') {
      collegeMap[cName].womenPoints += points;
    }

    // Athlete Aggregation
    const athId = p.id;
    if (!athleteMap[athId]) {
      athleteMap[athId] = {
        id: athId,
        name: p.sslc_name || p.full_name,
        college: p.college_name,
        gender: p.gender || 'male',
        bib: p.bib_number || p.chest_number || '',
        gold: 0,
        silver: 0,
        bronze: 0,
        points: 0
      };
    }

    if (rank === 1) athleteMap[athId].gold += 1;
    else if (rank === 2) athleteMap[athId].silver += 1;
    else if (rank === 3) athleteMap[athId].bronze += 1;
    athleteMap[athId].points += points;
  });

  // Sort overall standings
  const overallStandings: CollegeStanding[] = Object.values(collegeMap)
    .sort((a, b) => b.totalPoints - a.totalPoints || b.gold - a.gold || b.silver - a.silver || b.bronze - a.bronze)
    .map((c, idx) => ({ ...c, rank: idx + 1 }));

  // Sort men standings
  const mensStandings: CollegeStanding[] = Object.values(collegeMap)
    .filter(c => c.menPoints > 0)
    .sort((a, b) => b.menPoints - a.menPoints || b.gold - a.gold)
    .map((c, idx) => ({ ...c, rank: idx + 1 }));

  // Sort women standings
  const womensStandings: CollegeStanding[] = Object.values(collegeMap)
    .filter(c => c.womenPoints > 0)
    .sort((a, b) => b.womenPoints - a.womenPoints || b.gold - a.gold)
    .map((c, idx) => ({ ...c, rank: idx + 1 }));

  // Sort athlete standings
  const athleteStandings: AthleteStanding[] = Object.values(athleteMap)
    .filter(a => a.points > 0)
    .sort((a, b) => b.points - a.points || b.gold - a.gold || b.silver - a.silver)
    .map((a, idx) => ({ ...a, rank: idx + 1 }));

  // Awards
  const overallChampion = overallStandings[0] || null;
  const bestMensCollege = mensStandings[0] || null;
  const bestWomensCollege = womensStandings[0] || null;
  const bestMaleAthlete = athleteStandings.find(a => a.gender === 'male' || a.gender === 'men') || null;
  const bestFemaleAthlete = athleteStandings.find(a => a.gender === 'female' || a.gender === 'women') || null;

  const awards: ChampionshipAwards = {
    overallChampion,
    bestMensCollege,
    bestWomensCollege,
    bestMaleAthlete,
    bestFemaleAthlete
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
      <header style={{ 
        padding: '1.25rem 2rem', 
        background: 'rgba(255, 255, 255, 0.02)', 
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <img src="/vtu.png" alt="VTU Logo" style={{ height: '36px', width: 'auto' }} />
            <img src="/mit.png" alt="ACSCE Logo" style={{ height: '36px', width: 'auto' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.1rem', fontWeight: 800, lineHeight: 1.1 }}>VTU Inter-Collegiate Athletics Meet 2026</h1>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Host Institution: Dr. ACS College of Engineering</span>
          </div>
        </div>
        <nav style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
          <Link href="/" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>Home</Link>
          <Link href="/live" style={{ color: 'var(--accent-primary)', fontSize: '0.9rem', fontWeight: 600 }}>🔴 Live Events</Link>
          <Link href="/login" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>Portal Login</Link>
        </nav>
      </header>

      {/* Main Content */}
      <main style={{ padding: '3rem 1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ display: 'inline-block', padding: '0.25rem 0.85rem', borderRadius: '999px', background: 'rgba(252, 211, 77, 0.1)', color: '#FCD34D', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.75rem', border: '1px solid rgba(252, 211, 77, 0.3)' }}>
            VTU Official Championship Standings
          </div>
          <h2 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '0.5rem', letterSpacing: '-0.02em', background: 'linear-gradient(to right, #FCD34D, #60a5fa, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Championship Leaderboard
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.15rem', maxWidth: '600px', margin: '0 auto' }}>
            Live aggregate medal standings, section winners, and individual athlete honors
          </p>
        </div>

        <LeaderboardClient
          overallStandings={overallStandings}
          mensStandings={mensStandings}
          womensStandings={womensStandings}
          athleteStandings={athleteStandings}
          awards={awards}
        />

      </main>
    </div>
  );
}
