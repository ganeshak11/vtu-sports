import React from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Navbar } from '@/components/layout/Navbar';
import './home.css';

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
    <div className="landing-container">
      <Navbar />

      {/* Hero Section */}
      <section className="hero-section">
        {/* Glow ambient background elements */}
        <div className="hero-ambient-glow" />

        <div className="hero-content">
          {/* Institutional Pill Badge */}
          <div className="hero-pill-badge">
            <span className="hero-pill-dot" />
            <span>Visvesvaraya Technological University (VTU) &bull; Host: Dr. ACS College of Engineering, Bengaluru</span>
          </div>

          <h1 className="hero-title">
            The Digital Operating System for <br />
            <span className="hero-title-highlight">
              Collegiate Athletics
            </span>
          </h1>

          <p className="hero-subtitle">
            Official platform for the <strong>24th VTU Inter-Collegiate Athletics Meet 2026</strong>. 
            Paperless delegation registrations, Lynx photo finish timing, biometric accreditation, 
            and real-time university championship standings.
          </p>

          {/* Primary Action Buttons */}
          <div className="hero-actions">
            <Link href="/live" className="btn-hero-primary">
              <span className="hero-live-dot" />
              <span>Watch Live Results Feed</span>
            </Link>

            <Link href="/leaderboard" className="btn-hero-secondary">
              <span>🏆 Championship Standings</span>
            </Link>

            <Link href="/login" className="btn-hero-ghost">
              <span>🔑 Portal Login</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Live Statistics Ribbon */}
      <section className="stats-ribbon">
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-number" style={{ color: '#2563eb' }}>10</div>
            <div className="stat-label">Institutions</div>
          </div>
          <div className="stat-item">
            <div className="stat-number" style={{ color: '#4f46e5' }}>504</div>
            <div className="stat-label">Student Athletes</div>
          </div>
          <div className="stat-item">
            <div className="stat-number" style={{ color: '#7c3aed' }}>46</div>
            <div className="stat-label">Championship Events</div>
          </div>
          <div className="stat-item">
            <div className="stat-number" style={{ color: '#059669' }}>77</div>
            <div className="stat-label">Rounds Populated</div>
          </div>
          <div className="stat-item">
            <div className="stat-number" style={{ color: '#dc2626' }}>100%</div>
            <div className="stat-label">Digital & Real-time</div>
          </div>
        </div>
      </section>

      {/* Live Podium Snapshot Section */}
      {topThree.length > 0 && (
        <section className="podium-section">
          <div className="podium-header">
            <div>
              <div className="podium-tag">
                <span style={{ fontSize: '0.65rem' }}>●</span>
                <span>Current Championship Race</span>
              </div>
              <h2 className="podium-title">
                Live Podium Standings
              </h2>
            </div>
            <Link href="/leaderboard" className="podium-link">
              View All 10 Colleges Standings &rarr;
            </Link>
          </div>

          <div className="podium-grid">
            {topThree.map((col, idx) => {
              const medalLabel = idx === 0 ? '🥇 1st Place' : idx === 1 ? '🥈 2nd Place' : '🥉 3rd Place';

              return (
                <div key={col.name} className={`podium-card rank-${idx + 1}`}>
                  <div className="podium-card-top">
                    <span className="rank-badge">
                      {medalLabel}
                    </span>
                    <span className="podium-points">
                      {col.points} <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>PTS</span>
                    </span>
                  </div>
                  <h3 className="podium-college-name">
                    {col.name}
                  </h3>

                  <div className="podium-medals-row">
                    <span style={{ color: '#64748b' }}>Medals:</span>
                    <div className="medals-tally">
                      <span title="Gold" style={{ fontWeight: 800, color: '#b45309' }}>🥇 {col.gold}</span>
                      <span title="Silver" style={{ fontWeight: 800, color: '#475569' }}>🥈 {col.silver}</span>
                      <span title="Bronze" style={{ fontWeight: 800, color: '#c2410c' }}>🥉 {col.bronze}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Direct Operational Portals Hub */}
      <section id="portals" className="portals-section">
        <div className="portals-container">
          <div className="portals-section-header">
            <span className="section-pill">
              Role-Based Access
            </span>
            <h2 className="section-main-title">
              Operational Portals & Desks
            </h2>
            <p className="section-desc">
              Direct access for meet directors, timing officials, institutional leaders, and participating athletes.
            </p>
          </div>

          <div className="portals-grid">
            
            {/* Card 1: Principals / PEDs */}
            <div className="portal-box">
              <div>
                <div className="portal-box-icon" style={{ backgroundColor: '#eff6ff' }}>
                  🏫
                </div>
                <h3 className="portal-box-title">College Delegations</h3>
                <p className="portal-box-desc">
                  Principals and Physical Education Directors (PEDs) register athlete squads, manage regular & reserve events, and complete online fee checkout.
                </p>
                <ul className="portal-box-bullets">
                  <li>&bull; Strict 2-regular event constraint</li>
                  <li>&bull; 1 Reserve & Relay squad allocations</li>
                  <li>&bull; Razorpay checkout & invoice simulator</li>
                </ul>
              </div>
              <Link href="/principal" className="portal-box-btn blue">
                Enter Delegation Portal &rarr;
              </Link>
            </div>

            {/* Card 2: Student Athletes */}
            <div className="portal-box">
              <div>
                <div className="portal-box-icon" style={{ backgroundColor: '#ecfdf5' }}>
                  🏃
                </div>
                <h3 className="portal-box-title">Participant Athlete App</h3>
                <p className="portal-box-desc">
                  Personalized 4-screen mobile web app for competitors. Digital QR accreditation badge, heat & lane notifications, and dining pass.
                </p>
                <ul className="portal-box-bullets">
                  <li>&bull; Digital QR Accreditation badge</li>
                  <li>&bull; Assigned heat, lane & report times</li>
                  <li>&bull; Central canteen digital food pass</li>
                </ul>
              </div>
              <Link href="/athlete" className="portal-box-btn green">
                Open Athlete App &rarr;
              </Link>
            </div>

            {/* Card 3: Results Engine */}
            <div className="portal-box">
              <div>
                <div className="portal-box-icon" style={{ backgroundColor: '#f5f3ff' }}>
                  ⏱️
                </div>
                <h3 className="portal-box-title">Official Results Engine</h3>
                <p className="portal-box-desc">
                  Official timing system for referees. FinishLynx/Omega photo finish file importer for track and 3-attempt entry matrix for field disciplines.
                </p>
                <ul className="portal-box-bullets">
                  <li>&bull; LIF / CSV Photo finish auto-import</li>
                  <li>&bull; 3-Attempt field best mark calculator</li>
                  <li>&bull; Instant live broadcast syncing</li>
                </ul>
              </div>
              <Link href="/referee/results" className="portal-box-btn purple">
                Launch Results Engine &rarr;
              </Link>
            </div>

            {/* Card 4: Call Room Marshalling */}
            <div className="portal-box">
              <div>
                <div className="portal-box-icon" style={{ backgroundColor: '#fffbeb' }}>
                  📋
                </div>
                <h3 className="portal-box-title">Call Room & Marshalling</h3>
                <p className="portal-box-desc">
                  Track athlete reporting windows before each heat. Scan QR bibs, manage DNS calls, and perform 1-tap accredited reserve athlete substitutions.
                </p>
                <ul className="portal-box-bullets">
                  <li>&bull; Camera QR & manual bib lookup</li>
                  <li>&bull; 6 Live marshalling statuses</li>
                  <li>&bull; 1-Tap DNS Reserve substitution</li>
                </ul>
              </div>
              <Link href="/referee" className="portal-box-btn amber">
                Open Call Room &rarr;
              </Link>
            </div>

            {/* Card 5: Central Meet Administration */}
            <div className="portal-box">
              <div>
                <div className="portal-box-icon" style={{ backgroundColor: '#fdf2f8' }}>
                  🛡️
                </div>
                <h3 className="portal-box-title">Meet Administration</h3>
                <p className="portal-box-desc">
                  Central command desk for university organizers. Close registrations, generate sequential Block Bib numbers, and print high-res athlete ID cards.
                </p>
                <ul className="portal-box-bullets">
                  <li>&bull; Boys 100+ & Girls 2001+ Block Bibs</li>
                  <li>&bull; High-res printable ID badges</li>
                  <li>&bull; Single-scan Accreditation Desk</li>
                </ul>
              </div>
              <Link href="/admin" className="portal-box-btn pink">
                Open Admin Center &rarr;
              </Link>
            </div>

            {/* Card 6: Hostel & Canteen Logistics */}
            <div className="portal-box">
              <div>
                <div className="portal-box-icon" style={{ backgroundColor: '#ecfeff' }}>
                  🏢
                </div>
                <h3 className="portal-box-title">Hostel & Dining Logistics</h3>
                <p className="portal-box-desc">
                  Simplified athlete arrival and meal management. Single-tap campus hostel check-in and QR meal pass scanning with duplicate prevention.
                </p>
                <ul className="portal-box-bullets">
                  <li>&bull; Single-tap Campus Hostel check-in</li>
                  <li>&bull; Canteen Breakfast/Lunch/Dinner scanner</li>
                  <li>&bull; Zero paper coupons required</li>
                </ul>
              </div>
              <div className="portal-dual-btns">
                <Link href="/warden" className="portal-box-btn cyan">
                  Warden Desk
                </Link>
                <Link href="/volunteer" className="portal-box-btn cyan">
                  Canteen Desk
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Host Institution Showcase */}
      <section className="showcase-section">
        <div className="showcase-container">
          <div>
            <div className="showcase-tag">
              🏛️ Official Host Institution
            </div>
            <h2 className="showcase-title">
              Dr. ACS College of Engineering, Bengaluru
            </h2>
            <p className="showcase-text">
              Established under the visionary leadership of <strong>Dr. A. C. Shanmugam</strong>, 
              Dr. ACS College of Engineering stands as a beacon of academic and sporting excellence in Karnataka. 
              Affiliated with <strong>Visvesvaraya Technological University (VTU)</strong>, approved by AICTE, and 
              accredited with <strong>NAAC &lsquo;A&rsquo; Grade & NBA</strong>.
            </p>
            
            <div className="showcase-highlights">
              <div className="highlight-box">
                <div className="highlight-num">35+ Acres</div>
                <div className="highlight-label">Lush Green Campus & Sports Complex</div>
              </div>
              <div className="highlight-box">
                <div className="highlight-num">NAAC &lsquo;A&rsquo;</div>
                <div className="highlight-label">Grade Accredited & NBA Approved</div>
              </div>
            </div>

            <blockquote className="showcase-quote">
              &ldquo;To Create Job creators not job seekers &mdash; nurturing champions in engineering and athletics.&rdquo;
            </blockquote>
          </div>

          <div>
            <div className="arena-card">
              <div className="arena-header">
                <img src="/acsce-crest.jpg" alt="ACSCE Crest" className="arena-crest" />
                <div>
                  <h4 className="arena-name">Dr. ACSCE Athletics Arena</h4>
                  <p className="arena-loc">Kambipura, Mysore Road, Bengaluru - 560074</p>
                </div>
              </div>

              <div className="arena-features">
                <div className="arena-feature-item">
                  <span className="check-icon">✓</span>
                  <span>Olympic standard 8-lane synthetic track facilities</span>
                </div>
                <div className="arena-feature-item">
                  <span className="check-icon">✓</span>
                  <span>Dedicated Call Room marshalling area with biometric check-in</span>
                </div>
                <div className="arena-feature-item">
                  <span className="check-icon">✓</span>
                  <span>High-speed FinishLynx photo finish timing tower</span>
                </div>
                <div className="arena-feature-item">
                  <span className="check-icon">✓</span>
                  <span>Campus hostel accommodation for 1000+ athletes & coaches</span>
                </div>
              </div>

              <div className="arena-footer">
                <span>VTU SportsOS Partner</span>
                <span className="status-active-badge">● Operations Active</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Day Meet Schedule Overview */}
      <section className="timetable-section">
        <div className="timetable-container">
          <div className="portals-section-header">
            <h2 className="section-main-title">4-Day Meet Timetable</h2>
            <p className="section-desc">Synchronized competition schedule across track, field, and combined disciplines.</p>
          </div>

          <div className="timetable-grid">
            <div className="day-card">
              <span className="day-tag d1">DAY 1</span>
              <h4 className="day-title">Inauguration & Sprints</h4>
              <p className="day-desc">
                Opening March Past &bull; 100m Heats & Semis &bull; Shot Put Finals &bull; Long Jump Finals &bull; 10,000m Final.
              </p>
            </div>

            <div className="day-card">
              <span className="day-tag d2">DAY 2</span>
              <h4 className="day-title">Hurdles & Middle Distance</h4>
              <p className="day-desc">
                110m / 100m Hurdles &bull; 400m Heats &bull; High Jump Finals &bull; Discus Throw Finals &bull; 1500m Finals.
              </p>
            </div>

            <div className="day-card">
              <span className="day-tag d3">DAY 3</span>
              <h4 className="day-title">Relays & Decathlon</h4>
              <p className="day-desc">
                4x100m Relay Heats & Finals &bull; Javelin Throw Finals &bull; Triple Jump Finals &bull; Decathlon Day 1 & 2.
              </p>
            </div>

            <div className="day-card">
              <span className="day-tag d4">DAY 4</span>
              <h4 className="day-title">Marathon & Grand Finale</h4>
              <p className="day-desc">
                21 km Half Marathon &bull; 4x400m Mixed Relay Final &bull; Medal Ceremony &bull; Valedictory Trophies.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Executive Footer */}
      <footer className="landing-footer">
        <div className="footer-container">
          <div className="footer-brand">
            <img src="/vtu.png" alt="VTU" className="footer-logo" />
            <div className="footer-divider"></div>
            <img src="/acsce-logo.png" alt="ACSCE" className="footer-logo" />
            <div>
              <div className="footer-text-name">VTU SportsOS &bull; Meet 2026</div>
              <div className="footer-text-sub">Dr. ACS College of Engineering, Bengaluru</div>
            </div>
          </div>

          <div className="footer-links">
            <Link href="/" className="footer-link">Home</Link>
            <Link href="/live" className="footer-link">Live Results Feed</Link>
            <Link href="/leaderboard" className="footer-link">Championship Standings</Link>
            <Link href="/athlete/schedule" className="footer-link">4-Day Timetable</Link>
            <Link href="/login" className="footer-link">Login / Access</Link>
          </div>

          <div className="footer-badge">
            <span>●</span>
            <span>All 77 Event Rounds Active</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
