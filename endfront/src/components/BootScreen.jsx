import { MapPin } from 'lucide-react';

const BootScreen = ({ T, bootText }) => (
  <div className="atlas-root" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
    <div style={{ position: 'relative', width: 120, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 40 }}>
      <div style={{ position: 'absolute', inset: 0, border: `2px dashed ${T.cyanDim}`, borderRadius: '50%', animation: 'spin 8s linear infinite' }} />
      <div style={{ position: 'absolute', inset: 10, border: `2px solid ${T.cyan}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite' }} />
      <MapPin size={40} color={T.cyan} style={{ animation: 'pulseOpacity 2s ease-in-out infinite', filter: `drop-shadow(0 0 10px ${T.cyan})` }} />
    </div>
    <div style={{ textAlign: 'center', fontFamily: "'Share Tech Mono', monospace" }}>
      <h2 style={{ color: T.text0, fontSize: '1.8rem', letterSpacing: '0.2em', marginBottom: '15px' }}>
        ATLAS <span style={{ color: T.cyan }}>OS</span>
      </h2>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', color: T.cyanDim, fontSize: '0.85rem', letterSpacing: '0.1em' }}>
        <span className="status-dot" /> {bootText}
      </div>
    </div>
  </div>
);

export default BootScreen;