import React, { useState, useEffect } from 'react'
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom'
// import reactLogo from './assets/react.svg'
// import './App.css'
import StatsChart from './StatsChart'

async function checkDevicesAndPermissions() {
  let results = {
    devices: [],
    audioInput: 0,
    videoInput: 0,
    audioOutput: 0,
    permission: 'unknown',
    error: null, 
  };
  try {
    // Check permissions
    await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    results.permission = 'granted';
  } catch (err) {
    results.permission = 'denied';
    results.error = err.message;
    return results;
  }
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    results.devices = devices;
    results.audioInput = devices.filter(d => d.kind === 'audioinput').length;
    results.videoInput = devices.filter(d => d.kind === 'videoinput').length;
    results.audioOutput = devices.filter(d => d.kind === 'audiooutput').length;
  } catch (err) {
    results.error = err.message;
  }
  return results;
}

async function testStunConnectivity(stunUrl = "stun:stun.l.google.com:19302") {
  return new Promise((resolve) => {
    const pc = new RTCPeerConnection({ iceServers: [{ urls: stunUrl }] });
    let candidates = [];
    let timeout;

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        candidates.push(event.candidate);
      } else {
        // Gathering finished
        clearTimeout(timeout);
        pc.close();
        resolve({
          success: candidates.length > 0,
          candidates,
          types: Array.from(new Set(candidates.map(c => c.type)))
        });
      }
    };

    // Timeout in case ICE gathering hangs
    timeout = setTimeout(() => {
      pc.close();
      resolve({
        success: candidates.length > 0,
        candidates,
        types: Array.from(new Set(candidates.map(c => c.type))),
        error: candidates.length === 0 ? 'No ICE candidates gathered (possible network/STUN issue)' : null
      });
    }, 5000);

    // Create a dummy data channel to trigger ICE gathering
    pc.createDataChannel("test");
    pc.createOffer().then((offer) => pc.setLocalDescription(offer));
  });
}

const Info = ({ text }) => (
  <span style={{ marginLeft: 6, color: '#888', cursor: 'pointer' }} title={text}>ⓘ</span>
);

function CollapsibleCard({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="dashboard-card dashboard-collapsible">
      <div
        className="dashboard-collapsible-header"
        onClick={() => setOpen(o => !o)}
        tabIndex={0}
        role="button"
        aria-expanded={open}
        aria-label={typeof title === 'string' ? title : undefined}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setOpen(o => !o); }}
      >
        <span>{title}</span>
        <span className="dashboard-collapsible-arrow">{open ? '▲' : '▼'}</span>
      </div>
      {open && <div className="dashboard-collapsible-content">{children}</div>}
    </div>
  );
}

// --- Page Components ---
function Landing() {
  const navigate = useNavigate();
  return (
    <div className="fade-in">
      <div className="bg-dots" />
      <nav className="hero-nav hero-nav-centered" style={{ marginTop: '3.5rem', position: 'relative', zIndex: 2 }} aria-label="Main navigation">
        <ul>
          <li><Link to="/how">How it works</Link></li>
          <li><Link to="/faq">FAQ</Link></li>
        </ul>
        <ThemeToggle />
      </nav>
      <div className="hero-section hero-no-container">
        <div className="hero-center-content">
          <div className="hero-headline hero-headline-gray">Powerful WebRTC Diagnostics</div>
          <div className="hero-main-bold hero-main-white">Debug Calls, Fix Issues,<br />Deliver Quality Experiences</div>
          <div className="hero-headline hero-headline-gray">Instantly check device access, network connectivity, and real-time call quality.</div>
          <div className="hero-subtitle hero-subtitle-large">
            Visualize metrics, log events, and get actionable troubleshooting tips—all in one place.
          </div>
          <button className="hero-btn hero-btn-large hero-btn-glow" onClick={() => navigate('/dashboard')} aria-label="Start WebRTC Test">
            Start WebRTC Test
          </button>
        </div>
      </div>
    </div>
  );
}
function HowItWorks() {
  return (
    <div className="fade-in">
      <section style={{ maxWidth: 900, margin: '4rem auto', padding: '2rem', background: 'rgba(36,38,46,0.92)', borderRadius: 18, boxShadow: '0 2px 16px #0004' }}>
        <h2 style={{ color: '#7fd7e0', fontWeight: 800, fontSize: '2rem', marginBottom: 12 }}>How it works</h2>
        <p>Our diagnostics tool runs a series of automated checks on your browser and network to help you identify and fix WebRTC issues. It checks device permissions, network connectivity, and visualizes real-time connection stats. No installation required—just click "Start WebRTC Test" and get instant results.</p>
      </section>
    </div>
  )
}
function FAQ() {
  return (
    <div className="fade-in">
      <section style={{ maxWidth: 900, margin: '4rem auto', padding: '2rem', background: 'rgba(36,38,46,0.92)', borderRadius: 18, boxShadow: '0 2px 16px #0004' }}>
        <h2 style={{ color: '#7fd7e0', fontWeight: 800, fontSize: '2rem', marginBottom: 12 }}>FAQ</h2>
        <ul style={{ paddingLeft: 24 }}>
          <li><b>What is WebRTC?</b> WebRTC is a technology for real-time audio, video, and data communication in browsers.</li>
          <li><b>Is my data safe?</b> Yes, all diagnostics run locally in your browser. No data is sent to our servers.</li>
          <li><b>Do I need to install anything?</b> No, everything works in your browser.</li>
        </ul>
      </section>
    </div>
  )
}

function NotFound() {
  return (
    <div className="fade-in">
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#7fd7e0', background: 'rgba(36,38,46,0.92)', borderRadius: 18, margin: '4rem auto', maxWidth: 600, boxShadow: '0 2px 16px #0004', padding: '3rem 2rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: 16 }}>404</h1>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 12 }}>Page Not Found</h2>
        <p style={{ color: '#b0b3c0', marginBottom: 24 }}>Sorry, the page you're looking for doesn't exist.<br/>You can return to the home page below.</p>
        <Link to="/" style={{ background: 'linear-gradient(90deg, #23252b 0%, #1fa2ff 100%)', color: '#fff', fontWeight: 700, padding: '0.8em 2.2em', borderRadius: 12, textDecoration: 'none', fontSize: '1.1rem', boxShadow: '0 2px 8px 0 #1fa2ff22' }}>Go Home</Link>
      </div>
    </div>
  )
}

function ThemeToggle() {
  const [mode, setMode] = React.useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'dark';
    }
    return 'dark';
  });
  React.useEffect(() => {
    document.body.classList.toggle('light-mode', mode === 'light');
    localStorage.setItem('theme', mode);
  }, [mode]);
  return (
    <button
      aria-label={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      style={{
        background: 'none',
        border: 'none',
        fontSize: '1.7rem',
        position: 'absolute',
        top: 24,
        right: 32,
        zIndex: 10,
        cursor: 'pointer',
        color: mode === 'light' ? '#2563eb' : '#ffe066',
        padding: 0,
      }}
      onClick={() => setMode(m => (m === 'light' ? 'dark' : 'light'))}
    >
      {mode === 'light' ? (
        // Crescent moon SVG
        <svg width="28" height="28" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true"><path d="M16 .5C7.4.5.5 7.4.5 16S7.4 31.5 16 31.5 31.5 24.6 31.5 16 24.6.5 16 .5zm0 28.1V3.4C23 3.4 28.6 9 28.6 16S23 28.6 16 28.6z"/></svg>
      ) : (
        // Sun SVG
        <svg width="28" height="28" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true"><clipPath id="theme-toggle__classic__cutout"><path d="M0-5h30a1 1 0 0 0 9 13v24H0Z" /></clipPath><g clipPath="url(#theme-toggle__classic__cutout)"><circle cx="16" cy="16" r="9.34" /><g stroke="currentColor" strokeWidth="1.5"><path d="M16 5.5v-4" /><path d="M16 30.5v-4" /><path d="M1.5 16h4" /><path d="M26.5 16h4" /><path d="m23.4 8.6 2.8-2.8" /><path d="m5.7 26.3 2.9-2.9" /><path d="m5.8 5.8 2.8 2.8" /><path d="m23.4 23.4 2.9 2.9" /></g></g></svg>
      )}
    </button>
  );
}

function BackArrow() {
  const navigate = useNavigate();
  const location = useLocation();
  if (location.pathname === '/') return null;
  return (
    <button
      onClick={() => {
        if (window.history.length > 1) {
          window.history.back();
        } else {
          navigate('/');
        }
      }}
      aria-label="Back to home"
      style={{
        position: 'absolute',
        top: 24,
        left: 24,
        background: 'none',
        border: 'none',
        fontSize: '2rem',
        color: '#7fd7e0',
        cursor: 'pointer',
        zIndex: 10,
      }}
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
    </button>
  );
}

function DashboardPage({
  deviceResults,
  stunResults,
  stats,
  advancedStats,
  handleExport,
  handleExportCSV,
  handleCopy,
  startDiagnostics,
  loading,
}) {
  const navigate = useNavigate();
  useEffect(() => {
    startDiagnostics();
    // eslint-disable-next-line
  }, []);
  return (
    <div className="dashboard-main-row">
      <div className="dashboard-sidebar-cards">
        <div className="dashboard-cards dashboard-cards-single">
          <CollapsibleCard title={<><b>Device Check</b> <Info text="Checks if your browser can access your microphone and camera, and lists all detected devices." /></>}>
            {typeof deviceResults === 'string' && deviceResults}
            {deviceResults && typeof deviceResults === 'object' && (
              <div>
                <div><b>Permissions:</b> <span className={deviceResults.permission === 'granted' ? 'success-accent' : 'error-accent'}>{deviceResults.permission}</span> <Info text="Shows if your browser has permission to use your microphone and camera." /></div>
                {deviceResults.error && <div className="error-accent"><b>Error:</b> {deviceResults.error}</div>}
                <div><b>Audio Inputs:</b> <span className="info-accent">{deviceResults.audioInput}</span> <Info text="Number of microphones detected." /></div>
                <div><b>Video Inputs:</b> <span className="info-accent">{deviceResults.videoInput}</span> <Info text="Number of cameras detected." /></div>
                <div><b>Audio Outputs:</b> <span className="info-accent">{deviceResults.audioOutput}</span> <Info text="Number of speakers or audio output devices detected." /></div>
                <details style={{ marginTop: 8 }}>
                  <summary>Show all devices</summary>
                  <ul>
                    {deviceResults.devices.map((d, i) => (
                      <li key={i}>{d.kind}: {d.label || '(no label)'} ({d.deviceId})</li>
                    ))}
                  </ul>
                </details>
              </div>
            )}
          </CollapsibleCard>
          <CollapsibleCard title={<><b>STUN Connectivity</b> <Info text="Tests if your browser can connect to a public STUN server, which is needed for WebRTC to work across networks." /></>}>
            {typeof stunResults === 'string' && stunResults}
            {stunResults && typeof stunResults === 'object' && (
              <div>
                <div><b>Success:</b> <span className={stunResults.success ? 'success-accent' : 'error-accent'}>{stunResults.success ? 'Yes' : 'No'}</span> <Info text="Indicates if ICE candidates were found. If 'No', your network may block WebRTC." /></div>
                {stunResults.error && <div className="error-accent"><b>Error:</b> {stunResults.error}</div>}
                <div><b>Candidate Types:</b> <span className="info-accent">{stunResults.types && stunResults.types.length > 0 ? stunResults.types.join(', ') : 'None'}</span> <Info text="Types of network paths found: host (local), srflx (public IP via STUN), relay (via TURN)." /></div>
                <details style={{ marginTop: 8 }}>
                  <summary>Show all ICE candidates</summary>
                  <ul>
                    {stunResults.candidates.map((c, i) => (
                      <li key={i}>{c.candidate}</li>
                    ))}
                  </ul>
                </details>
              </div>
            )}
          </CollapsibleCard>
          <CollapsibleCard title={<><b>Real-time Stats</b> <Info text="Shows live connection quality metrics from a test WebRTC connection." /></>}>
            {stats.timestamps.length > 0 ? (
              <></>
            ) : (
              <div>Stats will appear here after the test starts.</div>
            )}
          </CollapsibleCard>
          <CollapsibleCard title={<><b>Advanced Stats</b> <Info text="Codec info, bandwidth estimation, and ICE candidate details." /></>}>
            <div style={{ marginBottom: 12 }}>
              <b>Codecs:</b>
              <ul style={{ margin: '0.5em 0 0 1.2em' }}>
                {advancedStats.codecs.map((c, i) => (
                  <li key={i}>{c.mimeType} (PT={c.payloadType}, {c.clockRate}Hz{c.channels ? `, ${c.channels}ch` : ''})</li>
                ))}
              </ul>
            </div>
            <div style={{ marginBottom: 12 }}>
              <b>Bandwidth Estimation:</b>
              <div>Outgoing: <span className="info-accent">{(advancedStats.bandwidth.availableOutgoingBitrate/1000).toLocaleString()} kbps</span></div>
              <div>Incoming: <span className="info-accent">{(advancedStats.bandwidth.availableIncomingBitrate/1000).toLocaleString()} kbps</span></div>
            </div>
            <div>
              <b>ICE Candidates:</b>
              <ul style={{ margin: '0.5em 0 0 1.2em' }}>
                {advancedStats.iceCandidates.map((c, i) => (
                  <li key={i}>{c.type} ({c.protocol}) - {c.ip} (priority {c.priority})</li>
                ))}
              </ul>
            </div>
          </CollapsibleCard>
          <button className="export-btn" onClick={handleExport}>Export Results (JSON)</button>
          <button className="export-btn" onClick={handleExportCSV}>Export Stats (CSV)</button>
          <button className="copy-btn" onClick={handleCopy}>Copy Results</button>
        </div>
      </div>
      <div className="dashboard-container dashboard-container-with-sidebar">
        <div className="dashboard-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
          <h1 style={{ margin: 0 }}>WebRTC Diagnostic & Debugging Suite</h1>
          <button onClick={() => navigate('/')} className="dashboard-back-btn" style={{ margin: 0, height: 40, alignSelf: 'flex-start' }}>Back Home</button>
        </div>
        <p style={{ marginTop: 0, marginBottom: '1.2rem', color: '#b0b3c0', fontSize: '1.08rem', fontWeight: 500, textAlign: 'left' }}>
          This tool helps you debug WebRTC issues by checking device access, network connectivity, and visualizing real-time connection stats.
        </p>
        <div className="dashboard-main-split">
          {loading && (
            <div style={{ color: '#7fd7e0', fontWeight: 600, fontSize: '1.2rem', margin: '2rem auto' }}>Running diagnostics, please allow permissions...</div>
          )}
          {stats.timestamps.length > 0 && !loading && (
            <div className="dashboard-charts-row dashboard-charts-row-large">
              <div className="dashboard-chart-col dashboard-chart-col-large">
                <b>Bitrate (kbps)</b> <Info text="How much data is sent per second. Higher is better for video quality." />
                <StatsChart title="Bitrate (kbps)" labels={stats.timestamps} data={stats.bitrate} ylabel="kbps" />
              </div>
              <div className="dashboard-chart-col dashboard-chart-col-large">
                <b>Packet Loss</b> <Info text="Number of lost data packets. Should be close to zero for a good connection." />
                <StatsChart title="Packet Loss" labels={stats.timestamps} data={stats.packetLoss} ylabel="packets" />
              </div>
              <div className="dashboard-chart-col dashboard-chart-col-large">
                <b>Jitter (ms)</b> <Info text="Variation in packet arrival time. Lower is better; high jitter can cause glitches." />
                <StatsChart title="Jitter (ms)" labels={stats.timestamps} data={stats.jitter} ylabel="ms" />
              </div>
              <div className="dashboard-chart-col dashboard-chart-col-large">
                <b>RTT (ms)</b> <Info text="Round-trip time for data. Lower is better; high RTT means more delay." />
                <StatsChart title="RTT (ms)" labels={stats.timestamps} data={stats.rtt} ylabel="ms" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function App() {
  const [deviceResults, setDeviceResults] = useState(null);
  const [stunResults, setStunResults] = useState(null);
  const [stats, setStats] = useState({
    timestamps: [],
    bitrate: [],
    packetLoss: [],
    jitter: [],
    rtt: [],
  });
  const [advancedStats, setAdvancedStats] = useState({
    codecs: [
      { payloadType: 111, mimeType: 'audio/opus', clockRate: 48000, channels: 2 },
      { payloadType: 96, mimeType: 'video/VP8', clockRate: 90000 }
    ],
    bandwidth: { availableOutgoingBitrate: 1200000, availableIncomingBitrate: 950000 },
    iceCandidates: [
      { foundation: '1234', ip: '192.168.1.2', protocol: 'udp', type: 'host', priority: 12345678 },
      { foundation: '5678', ip: '203.0.113.5', protocol: 'udp', type: 'srflx', priority: 87654321 }
    ]
  });
  const statsIntervalRef = React.useRef(null);
  const pcRef = React.useRef(null);
  const [loading, setLoading] = useState(false);

  // Helper to start a dummy peer connection and poll getStats
  const startStatsTest = async () => {
    setStats({ timestamps: [], bitrate: [], packetLoss: [], jitter: [], rtt: [] })
    // Create a dummy peer connection (loopback)
    const pc = new RTCPeerConnection()
    pcRef.current = pc
    pc.createDataChannel('stats')
    const offer = await pc.createOffer()
    await pc.setLocalDescription(offer)
    // Poll getStats every second
    let lastBytes = 0
    let lastTimestamp = 0
    statsIntervalRef.current = setInterval(async () => {
      const statsReport = await pc.getStats()
      let now = new Date().toLocaleTimeString()
      let bitrate = null, packetLoss = null, jitter = null, rtt = null
      statsReport.forEach(report => {
        if (report.type === 'outbound-rtp' && report.kind === 'video') {
          if (lastTimestamp && lastBytes) {
            const timeDiff = (report.timestamp - lastTimestamp) / 1000
            const bytesDiff = report.bytesSent - lastBytes
            bitrate = timeDiff > 0 ? (8 * bytesDiff) / timeDiff / 1000 : 0 // kbps
          }
          lastBytes = report.bytesSent
          lastTimestamp = report.timestamp
          packetLoss = report.packetsLost || 0
        }
        if (report.type === 'remote-inbound-rtp' && report.kind === 'video') {
          jitter = report.jitter ? report.jitter * 1000 : 0 // ms
          rtt = report.roundTripTime ? report.roundTripTime * 1000 : 0 // ms
        }
      })
      setStats(prev => ({
        timestamps: [...prev.timestamps, now],
        bitrate: [...prev.bitrate, bitrate ?? 0],
        packetLoss: [...prev.packetLoss, packetLoss ?? 0],
        jitter: [...prev.jitter, jitter ?? 0],
        rtt: [...prev.rtt, rtt ?? 0],
      }))
    }, 1000)
  }

  // Cleanup on unmount or when test stops
  React.useEffect(() => {
    return () => {
      if (statsIntervalRef.current) clearInterval(statsIntervalRef.current)
      if (pcRef.current) pcRef.current.close()
    }
  }, [])

  // Move test logic to a reusable function
  const startDiagnostics = async () => {
    setLoading(true);
    setDeviceResults('Running device checks...');
    setStunResults(null);
    setStats({ timestamps: [], bitrate: [], packetLoss: [], jitter: [], rtt: [] });
    if (statsIntervalRef.current) clearInterval(statsIntervalRef.current);
    if (pcRef.current) pcRef.current.close();
    const results = await checkDevicesAndPermissions();
    setDeviceResults(results);
    // Start stats test as soon as permissions are granted
    startStatsTest();
    setStunResults('Testing STUN connectivity...');
    const stun = await testStunConnectivity();
    setStunResults(stun);
    setLoading(false);
  };

  // Export handler
  function handleExport() {
    const exportData = {
      deviceResults,
      stunResults,
      stats,
      advancedStats,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'webrtc-diagnostics-results.json';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }

  // CSV Export for real-time stats
  function handleExportCSV() {
    if (!stats || !stats.timestamps || stats.timestamps.length === 0) return;
    const headers = ['Timestamp', 'Bitrate (kbps)', 'Packet Loss', 'Jitter (ms)', 'RTT (ms)'];
    const rows = stats.timestamps.map((t, i) => [
      t,
      stats.bitrate[i] ?? '',
      stats.packetLoss[i] ?? '',
      stats.jitter[i] ?? '',
      stats.rtt[i] ?? ''
    ]);
    const csv = [headers, ...rows].map(r => r.map(x => `"${x}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'webrtc-realtime-stats.csv';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }

  // Copy to clipboard
  function handleCopy() {
    const exportData = {
      deviceResults,
      stunResults,
      stats,
      advancedStats,
      exportedAt: new Date().toISOString(),
    };
    navigator.clipboard.writeText(JSON.stringify(exportData, null, 2));
  }

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/dashboard" element={<DashboardPage
        deviceResults={deviceResults}
        stunResults={stunResults}
        stats={stats}
        advancedStats={advancedStats}
        handleExport={handleExport}
        handleExportCSV={handleExportCSV}
        handleCopy={handleCopy}
        startDiagnostics={startDiagnostics}
        loading={loading}
      />} />
      <Route path="/how" element={<HowItWorks />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App
