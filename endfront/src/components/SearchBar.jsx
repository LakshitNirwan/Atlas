import { useRef } from 'react';
import { Building2, Navigation, MapPin } from 'lucide-react';

const SearchBar = ({
  T, isDarkMode,
  buildings, selectedBuilding, onBuildingChange,
  searchQueries, activeInput,
  sortedSearchResults, focusedResultIndex, focusedRowRef,
  startSectionRef, endSectionRef,
  onSearch, onKeyDown, onSelectRoom,
}) => {
  return (
    <div className="atlas-card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0, marginBottom: 20, overflow: 'visible' }}>
      <div className="corner-br" />

      {/* Building selector */}
      <div style={{ padding: '20px 24px', borderRight: `1px solid ${T.border}` }}>
        <div className="atlas-label"><Building2 size={10} /> SELECT BLOCK</div>
        <div style={{ position: 'relative' }}>
          <Building2 size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: selectedBuilding ? T.cyan : T.text2, pointerEvents: 'none' }} />
          <select className="atlas-control" value={selectedBuilding} onChange={(e) => onBuildingChange(e.target.value)}>
            <option value="">-- Choose a Building --</option>
            {buildings.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: T.cyanDim, fontSize: '0.7rem' }}>▾</div>
        </div>
      </div>

      {/* Origin input */}
      <div ref={startSectionRef} style={{ padding: '20px 24px', borderRight: `1px solid ${T.border}`, position: 'relative' }}>
        <div className="atlas-label" style={{ color: !selectedBuilding ? T.text2 : T.amber }}><Navigation size={10} /> ORIGIN</div>
        <div style={{ position: 'relative' }}>
          <Navigation size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: !selectedBuilding ? T.text2 : T.amber, pointerEvents: 'none' }} />
          <input
            type="text"
            className={`atlas-control ${activeInput === 'start' ? 'active' : ''}`}
            placeholder={selectedBuilding ? 'Search or click map...' : 'Lock pending block'}
            disabled={!selectedBuilding}
            value={searchQueries.start}
            onChange={(e) => onSearch('start', e.target.value)}
            onFocus={(e) => onSearch('start', e.target.value)}
            onKeyDown={onKeyDown}
          />
        </div>
        {activeInput === 'start' && sortedSearchResults.length > 0 && (
          <SearchDropdown T={T} isDarkMode={isDarkMode} results={sortedSearchResults} focusedIndex={focusedResultIndex} focusedRowRef={focusedRowRef} onSelect={onSelectRoom} />
        )}
      </div>

      {/* Destination input */}
      <div ref={endSectionRef} style={{ padding: '20px 24px', position: 'relative' }}>
        <div className="atlas-label" style={{ color: !selectedBuilding ? T.text2 : T.red }}><MapPin size={10} /> DESTINATION</div>
        <div style={{ position: 'relative' }}>
          <MapPin size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: !selectedBuilding ? T.text2 : T.red, pointerEvents: 'none' }} />
          <input
            type="text"
            className={`atlas-control ${activeInput === 'end' ? 'active' : ''}`}
            placeholder={selectedBuilding ? 'Search or click map...' : 'Lock pending block'}
            disabled={!selectedBuilding}
            value={searchQueries.end}
            onChange={(e) => onSearch('end', e.target.value)}
            onFocus={(e) => onSearch('end', e.target.value)}
            onKeyDown={onKeyDown}
          />
        </div>
        {activeInput === 'end' && sortedSearchResults.length > 0 && (
          <SearchDropdown T={T} isDarkMode={isDarkMode} results={sortedSearchResults} focusedIndex={focusedResultIndex} focusedRowRef={focusedRowRef} onSelect={onSelectRoom} />
        )}
      </div>
    </div>
  );
};

// ── Shared dropdown list ──────────────────────────────────────────────────────
const SearchDropdown = ({ T, isDarkMode, results, focusedIndex, focusedRowRef, onSelect }) => (
  <div className="atlas-dropdown" role="listbox" style={{ position: 'absolute', top: 'calc(100% - 8px)', left: 24, right: 24, zIndex: 50, background: T.bg1, border: `1px solid ${T.cyan}`, borderRadius: 4, boxShadow: `0 20px 40px ${isDarkMode ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.12)'}, 0 0 30px ${T.cyanGlow}`, maxHeight: 280, overflowY: 'auto', overflowX: 'hidden' }}>
    <div style={{ padding: '8px 20px', borderBottom: `1px solid ${T.border}`, fontFamily: "'Share Tech Mono', monospace", fontSize: '0.62rem', letterSpacing: '0.18em', color: T.cyanDim }}>
      {results.length} RESULTS FOUND
    </div>
    {results.map((room, i) => (
      <div
        key={room.id}
        ref={i === focusedIndex ? focusedRowRef : null}
        role="option"
        aria-selected={i === focusedIndex}
        className={`search-row${i === focusedIndex ? ' kbd-focused' : ''}`}
        onClick={() => onSelect(room)}
      >
        <div>
          <div style={{ fontWeight: 700, color: T.text0, fontSize: '0.9rem', fontFamily: "'Rajdhani', sans-serif" }}>{room.name}</div>
          <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '0.6rem', color: T.text2, marginTop: 2 }}>ID: {room.id}</div>
        </div>
        <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '0.65rem', background: T.cyanGlow, color: T.cyan, border: `1px solid ${T.cyanDim}`, padding: '4px 10px', borderRadius: 2, letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>
          FL {room.floor}
        </div>
      </div>
    ))}
  </div>
);

export default SearchBar;