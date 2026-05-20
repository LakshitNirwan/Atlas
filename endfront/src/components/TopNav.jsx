import { MapPin, Menu, X, Sun, Moon } from 'lucide-react';

const TopNav = ({ T, isDarkMode, setIsDarkMode, isSidebarOpen, setIsSidebarOpen, currentUser }) => (
  <div style={{
    backgroundColor: T.bg1,
    padding: '12px 24px',
    borderBottom: `1px solid ${T.border}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        style={{ background: T.bg2, border: `1px solid ${T.border}`, cursor: 'pointer', padding: '8px', borderRadius: '4px', color: T.cyan, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
      >
        {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <MapPin size={18} color={T.cyan} style={{ filter: `drop-shadow(0 0 6px ${T.cyan})` }} />
        <span style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 900, fontSize: '1.1rem', letterSpacing: '0.15em', backgroundImage: `linear-gradient(135deg, ${T.cyan} 0%, #a8d8ff 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          ATLAS
        </span>
      </div>

      <div style={{ width: 1, height: 20, background: T.border, marginLeft: 4 }} />

      <div style={{ fontWeight: '600', color: T.text1, fontFamily: "'Share Tech Mono', monospace", letterSpacing: '0.1em', fontSize: '0.75rem' }}>
        STATUS: <span style={{ color: T.cyan }}>AUTHORIZED</span> // OPERATOR: {currentUser.name.split(' ')[0].toUpperCase()}
      </div>
    </div>

    <button
      className="theme-toggle-btn"
      onClick={() => setIsDarkMode(!isDarkMode)}
      title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  </div>
);

export default TopNav;