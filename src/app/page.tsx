import React from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export const revalidate = 30; // Revalidate every 30s

export default async function Home() {
  // Fetch dynamic podium data for the live widget
  const { data: results } = await supabase
    .from('event_results')
    .select(`
      rank,
      profiles:profile_id ( college_name ),
      event_rounds:round_id ( round_type )
    `)
    .not('rank', 'is', null);

  // Compute standings
  const collegeMap: Record<string, { name: string; gold: number; silver: number; bronze: number; points: number }> = {};
  
  (results || []).forEach((r: any) => {
    if (r.event_rounds?.round_type !== 'final') return;
    const cName = r.profiles?.college_name;
    if (!cName) return;

    if (!collegeMap[cName]) {
      collegeMap[cName] = { name: cName, gold: 0, silver: 0, bronze: 0, points: 0 };
    }

    const rank = r.rank;
    const pts = rank === 1 ? 10 : rank === 2 ? 8 : rank === 3 ? 6 : rank === 4 ? 5 : rank === 5 ? 4 : rank === 6 ? 3 : rank === 7 ? 2 : rank === 8 ? 1 : 0;
    collegeMap[cName].points += pts;
    if (rank === 1) collegeMap[cName].gold += 1;
    else if (rank === 2) collegeMap[cName].silver += 1;
    else if (rank === 3) collegeMap[cName].bronze += 1;
  });

  const topThree = Object.values(collegeMap)
    .sort((a, b) => b.points - a.points || b.gold - a.gold)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 px-4 border-b border-[var(--border-color)] bg-gradient-to-b from-[var(--bg-secondary)] via-[var(--bg-primary)] to-[var(--bg-primary)]">
        {/* Glow ambient background elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[350px] bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-emerald-500/10 blur-[100px] pointer-events-none" />

        <div className="max-w-6xl mx-auto text-center relative z-10">
          
          {/* Institutional Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs sm:text-sm font-semibold mb-6 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-ping"></span>
            <span>Visvesvaraya Technological University (VTU) &bull; Host: Dr. ACS College of Engineering, Bengaluru</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1] mb-6">
            The Digital Operating System for <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Collegiate Athletics
            </span>
          </h1>

          <p className="max-w-3xl mx-auto text-lg sm:text-xl text-slate-600 font-normal leading-relaxed mb-10">
            Official platform for the <strong>24th VTU Inter-Collegiate Athletics Meet 2026</strong>. 
            Paperless delegation registrations, Lynx photo finish timing, biometric accreditation, 
            and real-time university championship standings.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/live">
              <button className="flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold text-base shadow-lg shadow-red-500/25 hover:shadow-red-500/40 hover:-translate-y-0.5 transition-all">
                <span className="flex h-3 w-3 rounded-full bg-white animate-pulse"></span>
                <span>Watch Live Results Feed</span>
              </button>
            </Link>

            <Link href="/leaderboard">
              <button className="flex items-center gap-2.5 px-8 py-4 rounded-xl bg-slate-900 text-white font-bold text-base shadow-md hover:bg-slate-800 hover:-translate-y-0.5 transition-all">
                <span>🏆 Championship Standings</span>
              </button>
            </Link>

            <Link href="/login">
              <button className="flex items-center gap-2 px-6 py-4 rounded-xl bg-white border border-slate-300 text-slate-700 font-bold text-base hover:bg-slate-50 hover:border-blue-500 hover:text-blue-600 transition-all">
                <span>🔑 Portal Login</span>
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Live Statistics Ribbon */}
      <section className="bg-white border-b border-slate-200 py-6 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
          <div className="p-3">
            <div className="text-3xl font-extrabold text-blue-600">10</div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-1">Institutions</div>
          </div>
          <div className="p-3">
            <div className="text-3xl font-extrabold text-indigo-600">504</div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-1">Student Athletes</div>
          </div>
          <div className="p-3">
            <div className="text-3xl font-extrabold text-violet-600">46</div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-1">Championship Events</div>
          </div>
          <div className="p-3">
            <div className="text-3xl font-extrabold text-emerald-600">77</div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-1">Rounds Populated</div>
          </div>
          <div className="p-3 col-span-2 md:col-span-1">
            <div className="text-3xl font-extrabold text-rose-600">100%</div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-1">Digital & Real-time</div>
          </div>
        </div>
      </section>

      {/* Live Podium Snapshot Section */}
      {topThree.length > 0 && (
        <section className="py-12 px-4 max-w-6xl mx-auto w-full">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600">
                <span className="inline-block w-2 h-2 rounded-full bg-blue-600"></span>
                <span>Current Championship Race</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                Live Podium Standings
              </h2>
            </div>
            <Link href="/leaderboard" className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              <span>View All 10 Colleges Standings &rarr;</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topThree.map((col, idx) => {
              const medal = idx === 0 ? '🥇 1st Place' : idx === 1 ? '🥈 2nd Place' : '🥉 3rd Place';
              const medalBg = idx === 0 ? 'bg-amber-50 border-amber-200 text-amber-900' : idx === 1 ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-orange-50 border-orange-200 text-orange-900';
              const badgeColor = idx === 0 ? 'bg-amber-400 text-amber-950' : idx === 1 ? 'bg-slate-300 text-slate-900' : 'bg-orange-400 text-orange-950';

              return (
                <Card key={col.name} className={`overflow-hidden border-2 hover:-translate-y-1 transition-all ${medalBg}`}>
                  <CardContent className="p-6 flex flex-col justify-between h-full">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${badgeColor}`}>
                          {medal}
                        </span>
                        <span className="text-2xl font-black">{col.points} <span className="text-xs font-semibold text-slate-500">PTS</span></span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 leading-snug mb-4">
                        {col.name}
                      </h3>
                    </div>

                    <div className="pt-4 border-t border-slate-200/80 flex justify-between items-center text-sm font-medium">
                      <span className="text-slate-600">Medals:</span>
                      <div className="flex items-center gap-3">
                        <span title="Gold" className="font-bold text-amber-600">🥇 {col.gold}</span>
                        <span title="Silver" className="font-bold text-slate-600">🥈 {col.silver}</span>
                        <span title="Bronze" className="font-bold text-orange-600">🥉 {col.bronze}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* Direct Operational Portals Hub */}
      <section id="portals" className="py-16 px-4 bg-slate-100 border-y border-slate-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              Role-Based Access
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3 mb-3">
              Operational Portals & Desks
            </h2>
            <p className="text-slate-600">
              Direct access for meet directors, timing officials, institutional leaders, and participating athletes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Card 1: Principals / PEDs */}
            <Card className="hover:shadow-lg transition-all border border-slate-200 bg-white">
              <CardContent className="p-6 flex flex-col justify-between h-full">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl mb-4">
                    🏫
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">College Delegations</h3>
                  <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                    Principals and Physical Education Directors (PEDs) register athlete squads, manage regular & reserve events, and complete online fee checkout.
                  </p>
                  <ul className="text-xs text-slate-500 space-y-1.5 mb-6">
                    <li>&bull; Strict 2-regular event constraint</li>
                    <li>&bull; 1 Reserve & Relay squad allocations</li>
                    <li>&bull; Razorpay checkout & invoice simulator</li>
                  </ul>
                </div>
                <Link href="/principal">
                  <Button variant="primary" className="w-full justify-center">
                    Enter Delegation Portal &rarr;
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Card 2: Student Athletes */}
            <Card className="hover:shadow-lg transition-all border border-slate-200 bg-white">
              <CardContent className="p-6 flex flex-col justify-between h-full">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl mb-4">
                    🏃
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Participant Athlete App</h3>
                  <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                    Personalized 4-screen mobile web app for competitors. Digital QR accreditation badge, heat & lane notifications, and dining pass.
                  </p>
                  <ul className="text-xs text-slate-500 space-y-1.5 mb-6">
                    <li>&bull; Digital QR Accreditation badge</li>
                    <li>&bull; Assigned heat, lane & report times</li>
                    <li>&bull; Central canteen digital food pass</li>
                  </ul>
                </div>
                <Link href="/athlete">
                  <Button variant="secondary" className="w-full justify-center bg-emerald-600 text-white hover:bg-emerald-700">
                    Open Athlete App &rarr;
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Card 3: Results Engine */}
            <Card className="hover:shadow-lg transition-all border border-slate-200 bg-white">
              <CardContent className="p-6 flex flex-col justify-between h-full">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-2xl mb-4">
                    ⏱️
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Official Results Engine</h3>
                  <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                    Official timing system for referees. FinishLynx/Omega photo finish file importer for track and 3-attempt entry matrix for field disciplines.
                  </p>
                  <ul className="text-xs text-slate-500 space-y-1.5 mb-6">
                    <li>&bull; LIF / CSV Photo finish auto-import</li>
                    <li>&bull; 3-Attempt field best mark calculator</li>
                    <li>&bull; Instant live broadcast syncing</li>
                  </ul>
                </div>
                <Link href="/referee/results">
                  <Button variant="secondary" className="w-full justify-center bg-purple-600 text-white hover:bg-purple-700">
                    Launch Results Engine &rarr;
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Card 4: Call Room Marshalling */}
            <Card className="hover:shadow-lg transition-all border border-slate-200 bg-white">
              <CardContent className="p-6 flex flex-col justify-between h-full">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-2xl mb-4">
                    📋
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Call Room & Marshalling</h3>
                  <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                    Track athlete reporting windows before each heat. Scan QR bibs, manage DNS calls, and perform 1-tap accredited reserve athlete substitutions.
                  </p>
                  <ul className="text-xs text-slate-500 space-y-1.5 mb-6">
                    <li>&bull; Camera QR & manual bib lookup</li>
                    <li>&bull; 6 Live marshalling statuses</li>
                    <li>&bull; 1-Tap DNS Reserve substitution</li>
                  </ul>
                </div>
                <Link href="/referee">
                  <Button variant="secondary" className="w-full justify-center bg-amber-600 text-white hover:bg-amber-700">
                    Open Call Room &rarr;
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Card 5: Central Meet Administration */}
            <Card className="hover:shadow-lg transition-all border border-slate-200 bg-white">
              <CardContent className="p-6 flex flex-col justify-between h-full">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center text-2xl mb-4">
                    🛡️
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Meet Administration</h3>
                  <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                    Central command desk for university organizers. Close registrations, generate sequential Block Bib numbers, and print high-res athlete ID cards.
                  </p>
                  <ul className="text-xs text-slate-500 space-y-1.5 mb-6">
                    <li>&bull; Boys 100+ & Girls 2001+ Block Bibs</li>
                    <li>&bull; High-res printable ID badges</li>
                    <li>&bull; Single-scan Accreditation Desk</li>
                  </ul>
                </div>
                <Link href="/admin">
                  <Button variant="secondary" className="w-full justify-center bg-pink-600 text-white hover:bg-pink-700">
                    Open Admin Center &rarr;
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Card 6: Hostel & Canteen Logistics */}
            <Card className="hover:shadow-lg transition-all border border-slate-200 bg-white">
              <CardContent className="p-6 flex flex-col justify-between h-full">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center text-2xl mb-4">
                    🏢
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Hostel & Dining Logistics</h3>
                  <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                    Simplified athlete arrival and meal management. Single-tap campus hostel check-in and QR meal pass scanning with duplicate prevention.
                  </p>
                  <ul className="text-xs text-slate-500 space-y-1.5 mb-6">
                    <li>&bull; Single-tap Campus Hostel check-in</li>
                    <li>&bull; Canteen Breakfast/Lunch/Dinner scanner</li>
                    <li>&bull; Zero paper coupons required</li>
                  </ul>
                </div>
                <div className="flex gap-2">
                  <Link href="/warden" className="flex-1">
                    <Button variant="ghost" className="w-full justify-center text-xs border border-cyan-300 text-cyan-800 hover:bg-cyan-50">
                      Warden Desk
                    </Button>
                  </Link>
                  <Link href="/volunteer" className="flex-1">
                    <Button variant="ghost" className="w-full justify-center text-xs border border-teal-300 text-teal-800 hover:bg-teal-50">
                      Canteen Desk
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </section>

      {/* Host Institution Showcase */}
      <section className="py-20 px-4 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-4 border border-blue-200">
                🏛️ Official Host Institution
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight mb-6">
                Dr. ACS College of Engineering, Bengaluru
              </h2>
              <p className="text-slate-600 leading-relaxed mb-6">
                Established under the visionary leadership of <strong>Dr. A. C. Shanmugam</strong>, 
                Dr. ACS College of Engineering stands as a beacon of academic and sporting excellence in Karnataka. 
                Affiliated with <strong>Visvesvaraya Technological University (VTU)</strong>, approved by AICTE, and 
                accredited with <strong>NAAC &lsquo;A&rsquo; Grade & NBA</strong>.
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-2xl font-black text-blue-600">35+ Acres</div>
                  <div className="text-xs font-semibold text-slate-600 mt-1">Lush Green Campus & Sports Complex</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-2xl font-black text-indigo-600">NAAC &lsquo;A&rsquo;</div>
                  <div className="text-xs font-semibold text-slate-600 mt-1">Grade Accredited & NBA Approved</div>
                </div>
              </div>

              <blockquote className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-600 text-slate-700 text-sm italic">
                &ldquo;To Create Job creators not job seekers &mdash; nurturing champions in engineering and athletics.&rdquo;
              </blockquote>
            </div>

            <div className="relative">
              <div className="rounded-2xl p-8 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute -right-10 -bottom-10 opacity-10 text-9xl">🏛️</div>
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-6">
                    <img src="/acsce-crest.jpg" alt="ACSCE Crest" className="h-16 w-16 rounded-xl object-contain bg-white p-1" />
                    <div>
                      <h4 className="text-xl font-bold">Dr. ACSCE Athletics Arena</h4>
                      <p className="text-xs text-blue-200">Kambipura, Mysore Road, Bengaluru - 560074</p>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm text-slate-300">
                    <div className="flex items-center gap-3">
                      <span className="text-emerald-400">✓</span>
                      <span>Olympic standard 8-lane synthetic track facilities</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-emerald-400">✓</span>
                      <span>Dedicated Call Room marshalling area with biometric check-in</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-emerald-400">✓</span>
                      <span>High-speed FinishLynx photo finish timing tower</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-emerald-400">✓</span>
                      <span>Campus hostel accommodation for 1000+ athletes & coaches</span>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center text-xs text-slate-400">
                    <span>VTU SportsOS Partner</span>
                    <span className="text-emerald-400 font-bold">● Operations Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Day Meet Schedule Overview */}
      <section className="py-16 px-4 bg-slate-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-2">4-Day Meet Timetable</h2>
            <p className="text-slate-600 text-sm">Synchronized competition schedule across track, field, and combined disciplines.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-black">DAY 1</span>
              <h4 className="font-bold text-slate-900 mt-3 mb-2">Inauguration & Sprints</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Opening March Past &bull; 100m Heats & Semis &bull; Shot Put Finals &bull; Long Jump Finals &bull; 10,000m Final.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <span className="px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-black">DAY 2</span>
              <h4 className="font-bold text-slate-900 mt-3 mb-2">Hurdles & Middle Distance</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                110m / 100m Hurdles &bull; 400m Heats &bull; High Jump Finals &bull; Discus Throw Finals &bull; 1500m Finals.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-black">DAY 3</span>
              <h4 className="font-bold text-slate-900 mt-3 mb-2">Relays & Decathlon</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                4x100m Relay Heats & Finals &bull; Javelin Throw Finals &bull; Triple Jump Finals &bull; Decathlon Day 1 & 2.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black">DAY 4</span>
              <h4 className="font-bold text-slate-900 mt-3 mb-2">Marathon & Grand Finale</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                21 km Half Marathon &bull; 4x400m Mixed Relay Final &bull; Medal Ceremony &bull; Valedictory Trophies.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Executive Footer */}
      <footer className="bg-slate-950 text-slate-400 py-12 px-4 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-4">
            <img src="/vtu.png" alt="VTU" className="h-10 w-auto opacity-80" />
            <div className="h-6 w-px bg-slate-800"></div>
            <img src="/acsce-logo.png" alt="ACSCE" className="h-10 w-auto opacity-80" />
            <div className="text-xs">
              <div className="font-bold text-white">VTU SportsOS &bull; Meet 2026</div>
              <div className="text-slate-500">Dr. ACS College of Engineering, Bengaluru</div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-xs">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/live" className="hover:text-white transition-colors">Live Results Feed</Link>
            <Link href="/leaderboard" className="hover:text-white transition-colors">Championship Standings</Link>
            <Link href="/athlete/schedule" className="hover:text-white transition-colors">4-Day Timetable</Link>
            <Link href="/login" className="hover:text-white transition-colors">Login / Access</Link>
          </div>

          <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/50 border border-emerald-800 px-3 py-1.5 rounded-full">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>All 77 Event Rounds Active</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
