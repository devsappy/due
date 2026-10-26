import React, { useState, useMemo } from 'react';
import dueLogo from '@/assets/due-logo-white.png';
import GlassFolder from '@/components/ui/glass-folder-cards';
import ActivityHeatmap, { type ActivityDay } from '@/components/ui/activity-heatmap';
import UserTable, { type User } from '@/components/ui/user-table';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  RotateCcw,
  MessageSquare,
  Cpu,
  Database,
  Lock,
  Download,
  Check,
  Zap,
} from 'lucide-react';

function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

function generateActivityDays(): ActivityDay[] {
  const days: ActivityDay[] = [];
  const end = new Date();
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - 364);
  let seed = 73;
  const rand = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  for (let t = start.getTime(); t <= end.getTime(); t += 86_400_000) {
    const roll = rand();
    const count = roll > 0.75 ? Math.floor(roll * 8) : roll > 0.45 ? Math.floor(roll * 3) : 0;
    days.push({ date: new Date(t).toISOString().slice(0, 10), count });
  }
  return days;
}

const sampleUsers: User[] = [
  { id: "rahul.sharma@craft.dev", name: "Rahul Sharma", email: "rahul.sharma@craft.dev", role: "VP Product", status: "Due Friday", lastSeen: "2m ago" },
  { id: "sarah.jenkins@acme.design", name: "Sarah Jenkins", email: "sarah.jenkins@acme.design", role: "Design Lead", status: "Kept", lastSeen: "18m ago" },
  { id: "mateo.alvarado@stripe.com", name: "Mateo Alvarado", email: "m.alvarado@stripe.com", role: "Staff Engineer", status: "Pending", lastSeen: "1h ago" },
  { id: "priya.patel@sequoia.vc", name: "Priya Patel", email: "priya.patel@sequoia.vc", role: "Partner", status: "Due tonight", lastSeen: "3h ago" },
];

export default function App() {
  const heatmapDays = useMemo(generateActivityDays, []);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [simMessage, setSimMessage] = useState("I'll send the revised deck to Rahul by Friday 5 PM");
  const [chipVisible, setChipVisible] = useState(true);
  const [chipUndone, setChipUndone] = useState(false);
  const [trayCount, setTrayCount] = useState(2);

  const handleSimulate = (text: string) => { setSimMessage(text); setChipVisible(true); setChipUndone(false); };
  const handleUndo = () => { setChipUndone(true); setTimeout(() => setChipVisible(false), 400); };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#ededed]" style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>

      {/* ── Nav ─────────────────────────────────────────────────── */}
      <header style={{ borderBottom: '1px solid #1f1f1f', position: 'sticky', top: 0, zIndex: 50, background: '#0a0a0a' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src={dueLogo} alt="Due" style={{ height: 24, width: 'auto', display: 'block' }} />
          </div>

          <nav style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
            {['How it works', 'Privacy', 'Pricing'].map(link => (
              <a key={link} href={`#${link.toLowerCase().replace(/ /g, '-')}`} style={{ fontSize: 13, color: '#888', textDecoration: 'none', transition: 'color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = '#888')}>
                {link}
              </a>
            ))}
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <a href="https://github.com/devsappy/due" target="_blank" rel="noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', border: '1px solid #2e2e2e', borderRadius: 6, fontSize: 12, color: '#aaa', textDecoration: 'none', background: 'transparent', transition: 'border-color 0.15s, color 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#444'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#2e2e2e'; e.currentTarget.style.color = '#aaa'; }}>
              <GithubIcon style={{ width: 13, height: 13 }} />
              <span>GitHub</span>
            </a>
            <a href="#pricing"
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', background: '#fff', borderRadius: 6, fontSize: 12, fontWeight: 600, color: '#000', textDecoration: 'none', transition: 'background 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#e8e8e8')}
              onMouseLeave={e => (e.currentTarget.style.background = '#fff')}>
              Download
            </a>
          </div>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────── */}
      <section style={{ maxWidth: 680, margin: '0 auto', padding: '96px 24px 80px', textAlign: 'center' }}>
        <p style={{ fontSize: 12, fontFamily: 'monospace', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#555', marginBottom: 24 }}>
          macOS Menu Bar · Local-First · On-Device AI
        </p>

        <h1 style={{ fontSize: 'clamp(40px, 6vw, 64px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.05, color: '#fff', margin: '0 0 24px' }}>
          The promise tracker<br />that fills itself in.
        </h1>

        <p style={{ fontSize: 16, lineHeight: 1.7, color: '#777', margin: '0 0 40px', maxWidth: 480, marginLeft: 'auto', marginRight: 'auto' }}>
          Write <span style={{ color: '#bbb' }}>"I'll send the deck by Friday"</span> in Slack, WhatsApp, or Gmail. Due catches it, logs it, and reminds you — without you lifting a finger.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
          <a href="#pricing"
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 22px', background: '#fff', borderRadius: 8, fontSize: 14, fontWeight: 600, color: '#000', textDecoration: 'none', transition: 'background 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#e8e8e8')}
            onMouseLeave={e => (e.currentTarget.style.background = '#fff')}>
            <Download style={{ width: 15, height: 15 }} />
            Download for macOS
          </a>
          <a href="#how-it-works"
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', border: '1px solid #2e2e2e', borderRadius: 8, fontSize: 14, color: '#888', textDecoration: 'none', transition: 'border-color 0.15s, color 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#444'; e.currentTarget.style.color = '#ccc'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#2e2e2e'; e.currentTarget.style.color = '#888'; }}>
            See how it works
            <ArrowRight style={{ width: 14, height: 14 }} />
          </a>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, marginTop: 72, border: '1px solid #1f1f1f', borderRadius: 10, overflow: 'hidden', background: '#1f1f1f' }}>
          {[
            { value: '0 sec', label: 'Capture time' },
            { value: 'On-device', label: 'All processing' },
            { value: '>90%', label: 'Detection accuracy' },
          ].map(stat => (
            <div key={stat.label} style={{ padding: '24px 20px', background: '#0a0a0a', textAlign: 'left' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>{stat.value}</div>
              <div style={{ fontSize: 12, color: '#555', marginTop: 4 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────────── */}
      <section id="how-it-works" style={{ borderTop: '1px solid #1f1f1f', padding: '80px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ marginBottom: 56 }}>
            <p style={{ fontSize: 12, fontFamily: 'monospace', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#555', marginBottom: 12 }}>How it works</p>
            <h2 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', color: '#fff', margin: 0 }}>From message to reminder in one step.</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* Composer panel */}
            <div style={{ border: '1px solid #1f1f1f', borderRadius: 10, background: '#0d0d0d', overflow: 'hidden' }}>
              {/* Window chrome */}
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #1f1f1f', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#3a3a3a', display: 'inline-block' }} />
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#3a3a3a', display: 'inline-block' }} />
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#3a3a3a', display: 'inline-block' }} />
                <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#444', marginLeft: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <MessageSquare style={{ width: 11, height: 11, color: '#38bdf8' }} />
                  Slack — #product
                </span>
              </div>
              <div style={{ padding: 20 }}>
                {/* Preset chips */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                  <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#444', alignSelf: 'center' }}>Try:</span>
                  {[
                    "I'll send the revised deck to Rahul by Friday 5 PM",
                    "I'll review your PR this afternoon",
                    "I'll get back to you by EOD",
                  ].map(preset => (
                    <button key={preset} onClick={() => handleSimulate(preset)}
                      style={{ fontSize: 11, fontFamily: 'monospace', padding: '4px 9px', border: '1px solid #2a2a2a', borderRadius: 5, background: 'transparent', color: '#666', cursor: 'pointer', transition: 'border-color 0.15s, color 0.15s' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = '#444'; e.currentTarget.style.color = '#ccc'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.color = '#666'; }}>
                      "{preset.slice(0, 22)}…"
                    </button>
                  ))}
                </div>

                <textarea value={simMessage}
                  onChange={e => { setSimMessage(e.target.value); setChipVisible(true); setChipUndone(false); }}
                  rows={3}
                  style={{ width: '100%', boxSizing: 'border-box', background: '#111', border: '1px solid #222', borderRadius: 7, padding: '10px 12px', fontSize: 13, color: '#ddd', fontFamily: 'inherit', resize: 'none', outline: 'none', lineHeight: 1.6, transition: 'border-color 0.15s' }}
                  onFocus={e => (e.currentTarget.style.borderColor = '#38bdf8')}
                  onBlur={e => (e.currentTarget.style.borderColor = '#222')}
                  placeholder="Type a message with a promise…"
                />

                {/* Chip */}
                {chipVisible && (
                  <div style={{
                    marginTop: 10,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                    padding: '8px 12px',
                    border: `1px solid ${chipUndone ? '#3a1a1a' : '#0c3347'}`,
                    borderRadius: 7,
                    background: chipUndone ? '#140a0a' : '#050f18',
                    transition: 'all 0.2s',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontFamily: 'monospace', color: chipUndone ? '#c87171' : '#7cc8f0' }}>
                      {chipUndone
                        ? <><RotateCcw style={{ width: 12, height: 12 }} /><span>Discarded — not logged</span></>
                        : <><Check style={{ width: 12, height: 12 }} /><span><strong>Logged:</strong> {simMessage.toLowerCase().includes('deck') ? 'revised deck → Rahul · Fri 5 PM' : 'commitment detected'}</span></>
                      }
                    </div>
                    {!chipUndone && (
                      <button onClick={handleUndo}
                        style={{ fontSize: 11, fontFamily: 'monospace', padding: '3px 9px', border: '1px solid #0d3d55', borderRadius: 5, background: '#061420', color: '#38bdf8', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                        ⌘Z Undo
                      </button>
                    )}
                  </div>
                )}

                <p style={{ fontSize: 11, fontFamily: 'monospace', color: '#383838', marginTop: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Lock style={{ width: 11, height: 11, color: '#2e6b43' }} />
                  Parsed on-device with CoreML — nothing leaves your Mac
                </p>
              </div>
            </div>

            {/* Tray panel */}
            <div style={{ border: '1px solid #1f1f1f', borderRadius: 10, background: '#0d0d0d', overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #1f1f1f', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <img src={dueLogo} alt="Due" style={{ height: 16, width: 'auto', display: 'block', opacity: 0.9 }} />
                  <span style={{ fontSize: 12, color: '#888' }}>Due — Menu Bar</span>
                </div>
                <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#38bdf8', border: '1px solid #0c3347', background: '#050f18', padding: '2px 8px', borderRadius: 4 }}>
                  {trayCount} due today
                </span>
              </div>
              <div style={{ padding: 16 }}>
                <div style={{ marginBottom: 20 }}>
                  <p style={{ fontSize: 10, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#555', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Clock style={{ width: 10, height: 10, color: '#ca8a04' }} />Due today
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {[
                      { title: 'Send revised deck → Rahul', sub: 'Slack · Due 5:00 PM' },
                      { title: 'Share Figma link → Sarah', sub: 'Gmail · Tonight' },
                    ].map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '10px 12px', border: '1px solid #1a1a1a', borderRadius: 7, background: '#0a0a0a' }}>
                        <div>
                          <p style={{ fontSize: 12, color: '#ddd', margin: 0, fontWeight: 500 }}>{item.title}</p>
                          <p style={{ fontSize: 11, fontFamily: 'monospace', color: '#444', margin: '3px 0 0' }}>{item.sub}</p>
                        </div>
                        <button onClick={() => setTrayCount(Math.max(0, trayCount - 1))}
                          style={{ fontSize: 11, fontFamily: 'monospace', padding: '4px 9px', border: '1px solid #14452e', borderRadius: 5, background: '#071a10', color: '#4ade80', cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Check style={{ width: 10, height: 10 }} />
                          Kept
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p style={{ fontSize: 10, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#444', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <CheckCircle2 style={{ width: 10, height: 10 }} />Upcoming
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', border: '1px solid #1a1a1a', borderRadius: 7, background: '#0a0a0a' }}>
                    <div>
                      <p style={{ fontSize: 12, color: '#888', margin: 0, fontWeight: 500 }}>Review PR #42 → Mateo</p>
                      <p style={{ fontSize: 11, fontFamily: 'monospace', color: '#444', margin: '3px 0 0' }}>Slack · Thursday</p>
                    </div>
                    <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#383838' }}>2d</span>
                  </div>
                </div>

                <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid #1a1a1a', display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#444' }}>
                  <span>Monday digest ready</span>
                  <span style={{ color: '#38bdf8', cursor: 'pointer', fontFamily: 'monospace' }}>View →</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Glass Folders ───────────────────────────────────────── */}
      <section id="vault" style={{ borderTop: '1px solid #1f1f1f', padding: '80px 24px', background: '#080808' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ marginBottom: 56 }}>
            <p style={{ fontSize: 12, fontFamily: 'monospace', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#555', marginBottom: 12 }}>Commitment vault</p>
            <h2 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', color: '#fff', margin: '0 0 10px' }}>Your promises, organized.</h2>
            <p style={{ fontSize: 14, color: '#555', margin: 0, maxWidth: 440, lineHeight: 1.7 }}>Hover to lean the panel. Click to open and review every commitment inside.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 40, justifyItems: 'center', alignItems: 'end' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
              <GlassFolder label="Active" tone="dark" art="aurora" seed={7} appear={false}
                files={[
                  { name: 'Deck for Rahul', meta: 'Slack · Due Fri', art: 'aurora' },
                  { name: 'Figma link for Sarah', meta: 'Gmail · Tonight', art: 'dusk' },
                  { name: 'Review PR #42', meta: 'Slack · Thu', art: 'glacier' },
                ]}
                menu={[{ label: 'Sort by deadline' }, { label: 'Export to CSV' }]}
              />
              <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#666' }}>3 open</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
              <GlassFolder label="Fulfilled" tone="dark" art="verdant" seed={12} action="more" labelPlacement="top-left" appear={false}
                files={[
                  { name: 'Contract signed', meta: 'Oct 22', art: 'verdant' },
                  { name: 'Onboarding call', meta: 'Oct 20', art: 'glacier' },
                  { name: 'Design tokens', meta: 'Oct 18', art: 'ember' },
                ]}
                menu={[{ label: 'Weekly recap' }, { label: 'Filter by contact' }, { label: 'Clear archive', danger: true }]}
              />
              <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#666' }}>100% kept</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
              <GlassFolder label="Private" meta="On-device" tone="dark" art="ember" seed={15} action="none" labelPlacement="top-right" appear={false}
                files={[
                  { name: 'SQLite database', meta: '~/.due/due.db', art: 'ember' },
                  { name: 'CoreML models', meta: 'Zero cloud', art: 'glacier' },
                ]}
              />
              <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#666' }}>encrypted · local</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Heatmap ─────────────────────────────────────────────── */}
      <section id="rhythm" style={{ borderTop: '1px solid #1f1f1f', padding: '80px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ marginBottom: 40 }}>
            <p style={{ fontSize: 12, fontFamily: 'monospace', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#555', marginBottom: 12 }}>Consistency</p>
            <h2 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', color: '#fff', margin: '0 0 10px' }}>Your promise-keeping streak.</h2>
            <p style={{ fontSize: 14, color: '#555', margin: 0, lineHeight: 1.7 }}>See which weeks you followed through and which ones slipped.</p>
          </div>
          <div style={{ border: '1px solid #1f1f1f', borderRadius: 10, background: '#0d0d0d', padding: 28, overflowX: 'auto' }}>
            <ActivityHeatmap
              days={heatmapDays}
              label="Commitments kept over the last year"
              period="the last 365 days"
              unit={{ one: 'promise kept', other: 'promises kept' }}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              actions={
                <div style={{ display: 'flex', gap: 8 }}>
                  <span style={{ fontSize: 12, fontFamily: 'monospace', padding: '4px 10px', border: '1px solid #222', borderRadius: 5, color: '#888', background: '#111' }}>
                    Kept: <strong style={{ color: '#fff' }}>284</strong>
                  </span>
                  <span style={{ fontSize: 12, fontFamily: 'monospace', padding: '4px 10px', border: '1px solid #14452e', borderRadius: 5, color: '#4ade80', background: '#071a10' }}>
                    Rate: <strong>92.4%</strong>
                  </span>
                </div>
              }
            />
          </div>
        </div>
      </section>

      {/* ── User Table ──────────────────────────────────────────── */}
      <section id="contacts" style={{ borderTop: '1px solid #1f1f1f', padding: '80px 24px', background: '#080808' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ marginBottom: 40 }}>
            <p style={{ fontSize: 12, fontFamily: 'monospace', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#555', marginBottom: 12 }}>People</p>
            <h2 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', color: '#fff', margin: '0 0 10px' }}>Who's waiting on you.</h2>
            <p style={{ fontSize: 14, color: '#555', margin: 0, lineHeight: 1.7 }}>Every promise links back to the person you made it to.</p>
          </div>
          <div style={{ border: '1px solid #1f1f1f', borderRadius: 10, overflow: 'hidden' }}>
            <UserTable users={sampleUsers} caption="Collaborators and pending promises" />
          </div>
        </div>
      </section>

      {/* ── Privacy ─────────────────────────────────────────────── */}
      <section id="privacy" style={{ borderTop: '1px solid #1f1f1f', padding: '80px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ marginBottom: 56 }}>
            <p style={{ fontSize: 12, fontFamily: 'monospace', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#555', marginBottom: 12 }}>Privacy</p>
            <h2 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', color: '#fff', margin: '0 0 10px' }}>Nothing leaves your Mac.</h2>
            <p style={{ fontSize: 14, color: '#555', margin: 0, maxWidth: 480, lineHeight: 1.7 }}>Due reads only the outgoing text field when you press send. Incoming messages, screen content, and keystrokes are never touched.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, border: '1px solid #1f1f1f', borderRadius: 10, overflow: 'hidden', background: '#1f1f1f' }}>
            {[
              { icon: <Cpu style={{ width: 16, height: 16 }} />, title: 'On-device inference', body: 'Apple CoreML classifies messages entirely on your Mac. No API calls. No cloud billing.' },
              { icon: <ShieldCheck style={{ width: 16, height: 16 }} />, title: 'Outgoing text only', body: 'Only the active composer field is read when you submit. Nothing else on screen is accessed.' },
              { icon: <Database style={{ width: 16, height: 16 }} />, title: 'Local SQLite', body: 'All data lives in ~/.due/due.db. Open it with any SQLite client, or delete it any time.' },
            ].map(card => (
              <div key={card.title} style={{ padding: '28px 24px', background: '#0a0a0a' }}>
                <div style={{ width: 32, height: 32, border: '1px solid #2e2e2e', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', marginBottom: 16 }}>
                  {card.icon}
                </div>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: '#ddd', margin: '0 0 8px', letterSpacing: '-0.01em' }}>{card.title}</h3>
                <p style={{ fontSize: 13, color: '#555', margin: 0, lineHeight: 1.7 }}>{card.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ─────────────────────────────────────────────── */}
      <section id="pricing" style={{ borderTop: '1px solid #1f1f1f', padding: '80px 24px', background: '#080808' }}>
        <div style={{ maxWidth: 780, margin: '0 auto' }}>
          <div style={{ marginBottom: 56, textAlign: 'center' }}>
            <p style={{ fontSize: 12, fontFamily: 'monospace', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#555', marginBottom: 12 }}>Pricing</p>
            <h2 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', color: '#fff', margin: '0 0 10px' }}>Simple. No surprises.</h2>
            <p style={{ fontSize: 14, color: '#555', margin: 0, lineHeight: 1.7 }}>Start free with 20 automatically caught promises.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {/* Monthly */}
            <div style={{ padding: '32px 28px', border: '1px solid #1f1f1f', borderRadius: 10, background: '#0a0a0a', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <span style={{ fontSize: 12, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#555' }}>Monthly</span>
                <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#444' }}>Free 20-promise trial</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
                <span style={{ fontSize: 44, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1 }}>$5</span>
                <span style={{ fontSize: 13, color: '#555' }}>/mo</span>
              </div>
              <p style={{ fontSize: 13, color: '#555', margin: '0 0 24px', lineHeight: 1.6 }}>For professionals who need to stay accountable across multiple channels.</p>
              <div style={{ borderTop: '1px solid #1a1a1a', paddingTop: 20, marginBottom: 28, display: 'flex', flexDirection: 'column', gap: 10, flexGrow: 1 }}>
                {[
                  'Unlimited commitment capture',
                  'Slack, WhatsApp Desktop & Gmail',
                  'Menu-bar tray & ⌘Z undo',
                  'Monday weekly review',
                  'Source thread deep-links',
                  'Cancel anytime',
                ].map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 13, color: '#888' }}>
                    <Check style={{ width: 13, height: 13, color: '#38bdf8', flexShrink: 0 }} />
                    {f}
                  </div>
                ))}
              </div>
              <button style={{ width: '100%', padding: '11px 0', border: '1px solid #2e2e2e', borderRadius: 7, background: 'transparent', color: '#ccc', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'border-color 0.15s, color 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#444'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#2e2e2e'; e.currentTarget.style.color = '#ccc'; }}>
                Start Free Trial
              </button>
            </div>

            {/* Lifetime */}
            <div style={{ padding: '32px 28px', border: '1px solid #38bdf8', borderRadius: 10, background: '#0a0a0a', display: 'flex', flexDirection: 'column', position: 'relative' }}>
              <div style={{ position: 'absolute', top: -11, right: 20, fontSize: 10, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#38bdf8', border: '1px solid #38bdf8', background: '#0a0a0a', padding: '3px 9px', borderRadius: 20 }}>
                Popular
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <span style={{ fontSize: 12, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#38bdf8' }}>Perpetual</span>
                <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#38bdf8' }}>Pay once</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
                <span style={{ fontSize: 44, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1 }}>$49</span>
                <span style={{ fontSize: 13, color: '#555' }}>one-time</span>
              </div>
              <p style={{ fontSize: 13, color: '#555', margin: '0 0 24px', lineHeight: 1.6 }}>Own it forever. 1 year of updates included. Works fully offline.</p>
              <div style={{ borderTop: '1px solid #1a1a1a', paddingTop: 20, marginBottom: 28, display: 'flex', flexDirection: 'column', gap: 10, flexGrow: 1 }}>
                {[
                  'All monthly features',
                  '1 year of updates & patches',
                  'Direct SQLite access',
                  'Priority support',
                  'Optional iCloud sync',
                  'Works 100% offline',
                ].map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 13, color: '#888' }}>
                    <Check style={{ width: 13, height: 13, color: '#38bdf8', flexShrink: 0 }} />
                    {f}
                  </div>
                ))}
              </div>
              <button style={{ width: '100%', padding: '11px 0', border: 'none', borderRadius: 7, background: '#fff', color: '#000', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#e8e8e8')}
                onMouseLeave={e => (e.currentTarget.style.background = '#fff')}>
                Buy License — $49
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid #1f1f1f', padding: '36px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src={dueLogo} alt="Due" style={{ height: 20, width: 'auto', display: 'block', opacity: 0.8 }} />
            <div>
              <p style={{ fontSize: 11, color: '#444', margin: 0 }}>The promise tracker that fills itself in.</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            {[
              { label: 'GitHub', href: 'https://github.com/devsappy/due', external: true },
              { label: 'How it works', href: '#how-it-works' },
              { label: 'Privacy', href: '#privacy' },
              { label: 'Pricing', href: '#pricing' },
            ].map(link => (
              <a key={link.label} href={link.href} target={link.external ? '_blank' : undefined} rel={link.external ? 'noreferrer' : undefined}
                style={{ fontSize: 12, color: '#555', textDecoration: 'none', transition: 'color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = '#555')}>
                {link.label}
              </a>
            ))}
          </div>

          <p style={{ fontSize: 11, fontFamily: 'monospace', color: '#333', margin: 0 }}>macOS 14.0+ · Apple Silicon</p>
        </div>
      </footer>
    </div>
  );
}
