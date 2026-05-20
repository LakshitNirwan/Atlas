import { useState } from 'react';
import { Building2, PartyPopper, X } from 'lucide-react';
import { FEST_EVENTS } from '../constants/theme';

const FestSidebar = ({ T, isDarkMode, isOpen, buildings, onClose }) => {
  const [festSidebarBuilding, setFestSidebarBuilding] = useState('');
  const [festEventSearch, setFestEventSearch] = useState('');

  const festEventsForBuilding = Object.entries(FEST_EVENTS)
    .filter(([nodeId]) => {
      if (!festSidebarBuilding) return true;
      return nodeId.split('_')[0].toUpperCase() === festSidebarBuilding.toUpperCase();
    })
    .filter(([, ev]) =>
      !festEventSearch || ev.title.toLowerCase().includes(festEventSearch.toLowerCase())
    )
    .sort(([a], [b]) => {
      const getNum = (id) => { const parts = id.match(/\d+/g); return parts ? parseInt(parts[parts.length - 1]) : 0; };
      return getNum(a) - getNum(b);
    });

  return (
    <div style={{
      width: isOpen ? '300px' : '0px',
      minWidth: isOpen ? '300px' : '0px',
      backgroundColor: T.bg1,
      borderRight: isOpen ? `1px solid rgba(218,127,15,0.3)` : 'none',
      transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1), min-width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 20,
      boxShadow: isOpen ? `4px 0 32px rgba(255,0,170,0.08)` : 'none',
      order: -1,
    }}>
      {/* Header */}
      <div style={{ minWidth: '300px', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,0,170,0.25)', background: 'rgba(255,0,170,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <PartyPopper size={18} color="#7a2da9" />
          <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '0.9rem', fontWeight: 700, color: '#7a2da9', letterSpacing: '0.12em' }}>FEST MODE</span>
        </div>
        <button onClick={() => { onClose(); setFestEventSearch(''); }} style={{ background: 'transparent', border: '1px solid #7a2da9', borderRadius: 3, cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', color: '#7a2da9' }}>
          <X size={14} />
        </button>
      </div>

      {/* Body */}
      <div style={{ minWidth: '300px', padding: '16px 20px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Building selector */}
        <div>
          <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '0.55rem', letterSpacing: '0.18em', color: '#7a2da9', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ opacity: 0.5 }}>//</span> SELECT VENUE
          </div>
          <div style={{ position: 'relative' }}>
            <Building2 size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: festSidebarBuilding ? '#7a2da9' : T.text2, pointerEvents: 'none' }} />
            <select value={festSidebarBuilding} onChange={(e) => { setFestSidebarBuilding(e.target.value); setFestEventSearch(''); }}
              style={{ width: '100%', padding: '9px 10px 9px 32px', background: T.bg2, border: `1px solid ${festSidebarBuilding ? '#7a2da9' : T.border}`, borderRadius: 3, color: T.text0, fontFamily: "'Rajdhani', sans-serif", fontSize: '0.9rem', fontWeight: 600, outline: 'none', appearance: 'none', WebkitAppearance: 'none', cursor: 'pointer' }}>
              <option value="">All Buildings</option>
              {buildings.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
            <div style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: T.text2, fontSize: '0.7rem' }}>▾</div>
          </div>
        </div>

        {/* Event search */}
        <div>
          <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '0.55rem', letterSpacing: '0.18em', color: '#7a2da9', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ opacity: 0.5 }}>//</span> SEARCH EVENTS
          </div>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: T.text2, fontFamily: "'Share Tech Mono', monospace", fontSize: '11px', pointerEvents: 'none' }}>⌕</span>
            <input type="text" placeholder="Type event name..." value={festEventSearch} onChange={(e) => setFestEventSearch(e.target.value)}
              style={{ width: '100%', padding: '9px 10px 9px 28px', background: T.bg2, border: `1px solid ${festEventSearch ? '#7a2da9' : T.border}`, borderRadius: 3, color: T.text0, fontFamily: "'Rajdhani', sans-serif", fontSize: '0.9rem', fontWeight: 600, outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        {/* Count divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,0,170,0.2)' }} />
          <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '0.55rem', color: '#7a2da9', letterSpacing: '0.12em', whiteSpace: 'nowrap' }}>
            {festEventsForBuilding.length} EVENT{festEventsForBuilding.length !== 1 ? 'S' : ''}
          </span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,0,170,0.2)' }} />
        </div>

        {/* Events list */}
        {festEventsForBuilding.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 0', gap: 10, color: T.text2 }}>
            <PartyPopper size={28} style={{ opacity: 0.25 }} />
            <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '0.65rem', letterSpacing: '0.12em', textAlign: 'center' }}>
              {festEventSearch ? 'NO MATCHING EVENTS' : festSidebarBuilding ? 'NO EVENTS IN THIS BLOCK' : 'NO EVENTS REGISTERED'}
            </span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {festEventsForBuilding.map(([nodeId, ev]) => {
              const roomPart = nodeId.split('_').pop();
              const building = nodeId.split('_')[0];
              return (
                <div key={nodeId}
                  style={{ background: T.bg2, border: `1px solid rgba(255,0,170,0.18)`, borderLeft: `3px solid ${ev.color}`, borderRadius: 3, padding: '10px 12px', transition: 'all 0.2s', cursor: 'default' }}
                  onMouseEnter={e => e.currentTarget.style.background = isDarkMode ? 'rgba(255,0,170,0.07)' : 'rgba(255,0,170,0.04)'}
                  onMouseLeave={e => e.currentTarget.style.background = T.bg2}
                >
                  <div style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: '0.9rem', color: T.text0, marginBottom: 6, lineHeight: 1.2 }}>{ev.title}</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '0.58rem', background: `${ev.color}22`, color: ev.color, border: `1px solid ${ev.color}55`, padding: '2px 7px', borderRadius: 2, letterSpacing: '0.1em' }}>
                      {building} · {roomPart.toUpperCase()}
                    </span>
                    <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '0.58rem', color: T.text2, letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>{ev.time}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ minWidth: '300px', padding: '12px 20px', borderTop: '1px solid rgba(122,45,169,0.3)', background: 'rgba(255,0,170,0.04)' }}>
        <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '0.55rem', color: '#7a2da9', letterSpacing: '0.12em', textAlign: 'center' }}>
          // FEST MODE ACTIVE — MAP OVERLAY ON
        </div>
      </div>
    </div>
  );
};

export default FestSidebar;