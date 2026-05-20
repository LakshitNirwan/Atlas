import { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';

// ── Constants & theme 
import { DARK, LIGHT } from './constants/theme';

// ── Global CSS injector 
import GlobalStyle from './components/GlobalStyle';

// ── Page-level screens 
import BootScreen    from './components/BootScreen';
import LoginScreen   from './components/LoginScreen';

// ── Layout / shell 
import TopNav        from './components/TopNav';
import Sidebar       from './components/Sidebar';
import FestSidebar   from './components/FestSidebar';
import DashboardHeader from './components/DashboardHeader';

// ── Feature components 
import SearchBar     from './components/SearchBar';
import MapCanvas     from './components/MapCanvas';

// ── Custom hooks 
import usePathfinder from './hooks/usePathfinder';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// 
function App() {
  // ── Theme 
  const [isDarkMode, setIsDarkMode] = useState(true);
  const T = isDarkMode ? DARK : LIGHT;

  // ── Boot sequence 
  const [isBooting, setIsBooting] = useState(true);
  const [bootText, setBootText]   = useState('ESTABLISHING SECURE HANDSHAKE...');

  useEffect(() => {
    const texts = [
      'ESTABLISHING SECURE HANDSHAKE...',
      'DECRYPTING SPATIAL DATA...',
      'LOADING ATLAS BLUEPRINTS...',
      'CALIBRATING ROUTING ENGINE...',
      'ACCESS GRANTED.',
    ];
    let i = 0;
    const interval = setInterval(() => { i++; if (i < texts.length) setBootText(texts[i]); }, 450);
    setTimeout(() => setIsBooting(false), 2400);
    return () => clearInterval(interval);
  }, []);

  // ── Auth 
  const [currentUser, setCurrentUser] = useState(null);

  const handleLogin = async (isLoginMode, authForm) => {
    const endpoint = isLoginMode ? '/api/auth/login' : '/api/auth/register';
    try {
      const res = await axios.post(`${API_BASE}${endpoint}`, authForm);
      setCurrentUser(res.data.user);
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Error');
    }
  };

  const handleLogout = () => setCurrentUser(null);

  // ── Layout state 
  const [isSidebarOpen, setIsSidebarOpen]       = useState(false);
  const [isFestSidebarOpen, setIsFestSidebarOpen] = useState(false);

  // ── Map / building data 
  const [buildings, setBuildings]         = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [mapData, setMapData]             = useState(null);
  const [currentFloor, setCurrentFloor]   = useState('');
  const [isEventMode, setIsEventMode]     = useState(false);

  // ── Route selection 
  const [routeStartId, setRouteStartId] = useState(null);
  const [routeEndId,   setRouteEndId]   = useState(null);
  const [hoveredNodeId, setHoveredNodeId] = useState(null);
  const [copiedLink, setCopiedLink]     = useState(false);

  // ── Search / keyboard nav 
  const [activeInput, setActiveInput]         = useState('end');
  const [searchQueries, setSearchQueries]     = useState({ start: '', end: '' });
  const [searchResults, setSearchResults]     = useState([]);
  const [focusedResultIndex, setFocusedResultIndex] = useState(-1);
  const startSectionRef = useRef(null);
  const endSectionRef   = useRef(null);
  const focusedRowRef   = useRef(null);

  // ── Pathfinding (Dijkstra + floor transitions) 
  const { calculatedPath, setCalculatedPath, floorTransitions } = usePathfinder(
    mapData, routeStartId, routeEndId, setCurrentFloor
  );

  // Effects

  // On mount: load buildings + read share-link params
  useEffect(() => {
    axios.get(`${API_BASE}/api/buildings`)
      .then(res => setBuildings(res.data))
      .catch(err => console.error('Backend Unreachable.', err));

    const params = new URLSearchParams(window.location.search);
    const b = params.get('b');
    const s = params.get('start');
    const e = params.get('end');
    setSelectedBuilding(b || 'CAMPUS');
    if (s) setRouteStartId(s);
    if (e) setRouteEndId(e);
    if (b || s || e) window.history.replaceState(null, '', window.location.pathname);
  }, []);

  // Close search dropdown when clicking outside both search sections
  useEffect(() => {
    const handle = (e) => {
      const outside =
        (!startSectionRef.current || !startSectionRef.current.contains(e.target)) &&
        (!endSectionRef.current   || !endSectionRef.current.contains(e.target));
      if (outside) { setSearchResults([]); setFocusedResultIndex(-1); }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  // Load graph when building changes
  useEffect(() => {
    if (!selectedBuilding) { setMapData(null); setCurrentFloor(''); return; }
    axios.get(`${API_BASE}/api/graph/${selectedBuilding}`)
      .then(res => {
        setMapData(res.data);
        if (routeStartId) {
          const sNode = res.data.nodes.find(n => n.id === routeStartId);
          if (sNode) setSearchQueries(prev => ({ ...prev, start: sNode.id }));
        }
        if (routeEndId) {
          const eNode = res.data.nodes.find(n => n.id === routeEndId);
          if (eNode) setSearchQueries(prev => ({ ...prev, end: eNode.id }));
        }
      })
      .catch(err => console.error('Graph download failed', err));
  }, [selectedBuilding]);

  // Sync floor tabs when mapData arrives
  const availableFloors = useMemo(() => {
    if (!mapData) return [];
    return [...new Set(mapData.nodes.map(n => String(n.floor).trim()))].sort((a, b) => {
      if (a === 'G') return -1;
      if (b === 'G') return  1;
      return Number(a) - Number(b);
    });
  }, [mapData]);

  useEffect(() => {
    if (availableFloors.length > 0 && (!currentFloor || !availableFloors.includes(String(currentFloor).trim()))) {
      setCurrentFloor(availableFloors[0]);
    }
  }, [availableFloors, currentFloor]);

  // Scroll focused dropdown row into view
  useEffect(() => {
    if (focusedRowRef.current) focusedRowRef.current.scrollIntoView({ block: 'nearest' });
  }, [focusedResultIndex]);

  // Handlers

  const handleBuildingChange = (building) => {
    setSelectedBuilding(building);
    setRouteStartId(null);
    setRouteEndId(null);
    setSearchQueries({ start: '', end: '' });
    setIsEventMode(false);
    setIsFestSidebarOpen(false);
  };

  const handleMapNodeClick = (nodeId) => {
    const target = activeInput || 'end';
    if (target === 'start') {
      setRouteStartId(nodeId);
      setSearchQueries(prev => ({ ...prev, start: nodeId }));
      setActiveInput('end');
    } else {
      setRouteEndId(nodeId);
      setSearchQueries(prev => ({ ...prev, end: nodeId }));
      setActiveInput(null);
    }
    setSearchResults([]);
  };

  const handleSearch = async (type, query) => {
    setActiveInput(type);
    setSearchQueries(prev => ({ ...prev, [type]: query }));
    setFocusedResultIndex(-1);
    try {
      const res = await axios.get(`${API_BASE}/api/search?q=${query}&b=${selectedBuilding}`);
      setSearchResults(res.data);
    } catch (err) { console.error('Search failed', err); }
  };

  const sortedSearchResults = useMemo(() => (
    [...searchResults].sort((a, b) => {
      const numA = parseInt(a.id.match(/\d+/)?.[0] ?? 0);
      const numB = parseInt(b.id.match(/\d+/)?.[0] ?? 0);
      return numA - numB;
    })
  ), [searchResults]);

  const handleKeyDown = (e) => {
    if (!sortedSearchResults.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setFocusedResultIndex(prev => Math.min(prev + 1, sortedSearchResults.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setFocusedResultIndex(prev => Math.max(prev - 1, 0)); }
    else if (e.key === 'Enter') {
      e.preventDefault();
      if (focusedResultIndex >= 0) { handleMapNodeClick(sortedSearchResults[focusedResultIndex].id); setFocusedResultIndex(-1); }
    } else if (e.key === 'Escape') { setSearchResults([]); setFocusedResultIndex(-1); }
  };

  const handleSelectRoom = (room) => handleMapNodeClick(room.id);

  const copyShareLink = () => {
    const params = new URLSearchParams();
    params.set('b', selectedBuilding);
    if (routeStartId) params.set('start', routeStartId);
    if (routeEndId)   params.set('end',   routeEndId);
    navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}?${params.toString()}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSidebarMenuClick = (moduleName) => {
    alert(`[ SYSTEM NOTICE ]\n\nModule: ${moduleName}\nStatus: Under Construction\n\nThis feature will be deployed in the next minor patch update.`);
  };

  // Views

  // VIEW 0 — Boot
  if (isBooting) {
    return (
      <>
        <GlobalStyle T={T} isDark={isDarkMode} />
        <BootScreen T={T} bootText={bootText} />
      </>
    );
  }

  // VIEW 1 — Login / Register
  if (!currentUser) {
    return (
      <>
        <GlobalStyle T={T} isDark={isDarkMode} />
        <LoginScreen
          T={T}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          onLogin={handleLogin}
        />
      </>
    );
  }

  // VIEW 2 — Main dashboard
  return (
    <>
      <GlobalStyle T={T} isDark={isDarkMode} />
      <div style={{ display: 'flex', height: '100vh', backgroundColor: T.bg0, overflow: 'hidden' }}>

        {/* Left sidebar */}
        <Sidebar
          T={T}
          isDarkMode={isDarkMode}
          isOpen={isSidebarOpen}
          currentUser={currentUser}
          onLogout={handleLogout}
          onMenuClick={handleSidebarMenuClick}
        />

        {/* Fest event sidebar (slides in from left, order: -1) */}
        <FestSidebar
          T={T}
          isDarkMode={isDarkMode}
          isOpen={isFestSidebarOpen}
          buildings={buildings}
          onClose={() => { setIsFestSidebarOpen(false); setIsEventMode(false); }}
        />

        {/* Main content area */}
        <div className="atlas-root" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', padding: 0 }}>

          <TopNav
            T={T}
            isDarkMode={isDarkMode}
            setIsDarkMode={setIsDarkMode}
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
            currentUser={currentUser}
          />

          <div style={{ padding: '32px 24px', maxWidth: 1240, margin: '0 auto', width: '100%' }}>

            <DashboardHeader T={T} />

            <SearchBar
              T={T}
              isDarkMode={isDarkMode}
              buildings={buildings}
              selectedBuilding={selectedBuilding}
              onBuildingChange={handleBuildingChange}
              searchQueries={searchQueries}
              activeInput={activeInput}
              sortedSearchResults={sortedSearchResults}
              focusedResultIndex={focusedResultIndex}
              focusedRowRef={focusedRowRef}
              startSectionRef={startSectionRef}
              endSectionRef={endSectionRef}
              onSearch={handleSearch}
              onKeyDown={handleKeyDown}
              onSelectRoom={handleSelectRoom}
            />

            <MapCanvas
              T={T}
              isDarkMode={isDarkMode}
              selectedBuilding={selectedBuilding}
              mapData={mapData}
              currentFloor={currentFloor}
              setCurrentFloor={setCurrentFloor}
              availableFloors={availableFloors}
              isEventMode={isEventMode}
              setIsEventMode={setIsEventMode}
              setIsFestSidebarOpen={setIsFestSidebarOpen}
              calculatedPath={calculatedPath}
              routeStartId={routeStartId}
              routeEndId={routeEndId}
              hoveredNodeId={hoveredNodeId}
              setHoveredNodeId={setHoveredNodeId}
              floorTransitions={floorTransitions}
              onNodeClick={handleMapNodeClick}
              copiedLink={copiedLink}
              onCopyLink={copyShareLink}
            />

          </div>
        </div>
      </div>
    </>
  );
}

export default App;