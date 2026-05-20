import { MapPin, User, LogOut, ChevronRight } from 'lucide-react';

const Sidebar = ({ T, isDarkMode, isOpen, currentUser, onLogout, onMenuClick }) => (
  <div style={{
    width: isOpen ? '250px' : '0px',
    backgroundColor: T.bg1,
    borderRight: isOpen ? `1px solid ${T.border}` : 'none',
    transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: isOpen ? `4px 0 24px ${isDarkMode ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.08)'}` : 'none',
    zIndex: 20,
  }}>
    {/* Header */}
    <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: `1px solid ${T.border}`, minWidth: '250px' }}>
      <MapPin size={24} color={T.cyan} />
      <h2 style={{ margin: 0, fontSize: '1.3rem', fontFamily: "'Orbitron', sans-serif", letterSpacing: '0.1em', color: T.text0 }}>ATLAS</h2>
    </div>

    {/* Body */}
    <div style={{ padding: '24px', minWidth: '250px', flex: 1 }}>
      <div className="atlas-label">USER PROFILE</div>
      <div className="atlas-card" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: T.cyanGlow2, border: `1px solid ${T.cyanDim}`, padding: '6px', borderRadius: '4px' }}>
          <User size={18} color={T.cyan} />
        </div>
        <div>
          <div style={{ fontWeight: '700', fontSize: '0.9rem', color: T.text0 }}>{currentUser.name}</div>
          <div style={{ fontFamily: "'Share Tech Mono', monospace", color: T.text2, fontSize: '0.7rem' }}>{currentUser.reg_no}</div>
        </div>
      </div>

      <div className="atlas-label">SYSTEM MODULES</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {['Saved Routes', 'My Schedule', 'Report Map Error'].map(item => (
          <div key={item} className="sidebar-menu-item" onClick={() => onMenuClick(item)}>
            <span style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: '600', fontSize: '0.9rem' }}>{item}</span>
            <ChevronRight size={14} />
          </div>
        ))}
      </div>
    </div>

    {/* Footer */}
    <div style={{ padding: '20px 24px', minWidth: '250px', borderTop: `1px solid ${T.border}` }}>
      <button onClick={onLogout} className="atlas-btn" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: T.red, borderColor: T.red, background: T.redGlow, padding: '10px' }}>
        <LogOut size={16} /> TERMINATE
      </button>
    </div>
  </div>
);

export default Sidebar;