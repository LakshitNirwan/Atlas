import { MapPin } from 'lucide-react';

const DashboardHeader = ({ T }) => (
  <header style={{ textAlign: 'center', marginBottom: 32, position: 'relative' }}>
    <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: '1px', background: `linear-gradient(90deg, transparent, ${T.cyan}, transparent)`, animation: 'scan 4s linear infinite', pointerEvents: 'none' }} />

    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: T.cyanGlow2, border: `1px solid ${T.cyanDim}`, borderRadius: 2, padding: '3px 12px', marginBottom: 12 }}>
      <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '0.6rem', letterSpacing: '0.25em', color: T.cyanDim }}>SYSTEM ACTIVE</span>
      <span className="status-dot" style={{ width: 4, height: 4 }} />
    </div>

    <h1 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, letterSpacing: '0.12em', lineHeight: 1, backgroundImage: T.titleGradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: 8, position: 'relative' }}>
      ATLAS
    </h1>

    <p style={{ fontFamily: "'Share Tech Mono', monospace", color: T.text2, fontSize: '0.7rem', letterSpacing: '0.3em', textTransform: 'uppercase' }}>
      Intra-Academic Block Visualizer
    </p>

    <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'center' }}>
      <div style={{ flex: 1, maxWidth: 150, height: 1, background: `linear-gradient(90deg, transparent, ${T.border})` }} />
      <MapPin size={12} color={T.cyanDim} />
      <div style={{ flex: 1, maxWidth: 150, height: 1, background: `linear-gradient(90deg, ${T.border}, transparent)` }} />
    </div>
  </header>
);

export default DashboardHeader;