import { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import { MapPin, Building2, Navigation, Layers, Map as MapIcon, Menu, X, User, LogOut, ChevronRight, Copy, Check, ZoomIn, ZoomOut, Maximize, PartyPopper, Sun, Moon } from 'lucide-react';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/* ─── APP CONFIGURATION ─────────────────────────────────────────────────── */
const CONFIG = {
  pathThickness: "2",
  pathOpacity: 1,
  xrayThickness: "2.5",
  xrayOpacity: 0.6
};

/* ─── DUMMY FEST MODE DATA ──────────────────────────────────────────────── */
const FEST_EVENTS = {
  'PRP_101': { title: 'Creativity Club Design Sprint', color: '#7a2da9', time: '10:00 AM' },
  'PRP_210': { title: 'Debate Club Mock Trials', color: '#bb00ff', time: '1:00 PM' },
  'PRP_202': { title: 'VinnovateIT B3 ', color: '#0dc456', time: '9:00 AM' },
  'PRP_node_lobby_G': { title: 'BunkBuddies Promo Booth', color: '#00ffcc', time: 'All Day' },

  'SJT_211': { title: 'Hexa-thon', color: '#b3ea0e', time: '3:00 PM' },
  'SJT_311': { title: 'TAM Bidathon 3.0', color: '#9d5304', time: '8:00 AM' }
};

/* ─── DESIGN TOKENS: DARK ────────────────────────────────────────────────── */
const DARK = {
  bg0:             '#060c1a',
  bg1:             '#0b1428',
  bg2:             '#0f1e38',
  bg3:             '#142444',
  border:          '#1e3358',
  borderGlow:      '#1a4a8a',
  cyan:            '#00d4ff',
  cyanDim:         '#0090b3',
  cyanGlow:        'rgba(0,212,255,0.15)',
  cyanGlow2:       'rgba(0,212,255,0.08)',
  amber:           '#f59e0b',
  red:             '#ef4444',
  redGlow:         'rgba(239,68,68,0.3)',
  green:           '#10b981',
  text0:           '#e8f4ff',
  text1:           '#7aa3c8',
  text2:           '#3d6a9e',
  gridLine:        'rgba(0,212,255,0.04)',
  mapBg:           '#060c1a',
  mapGrid:         'rgba(0,212,255,0.03)',
  corridorStroke:  '#0090b3',
  corridorOpacity: '0.65',
  nodeOpacity:     '0.95',
  labelBg:         'rgba(6,12,26,0.88)',
  legendBg:        'rgba(11,20,40,0.92)',
  titleGradient:   'linear-gradient(135deg, #00d4ff 0%, #a8d8ff 50%, #00d4ff 100%)',
};

/* ─── DESIGN TOKENS: LIGHT ───────────────────────────────────────────────── */
const LIGHT = {
  bg0:             '#edf2f8',
  bg1:             '#ffffff',
  bg2:             '#f4f8fd',
  bg3:             '#e2eaf5',
  border:          '#bfcfe8',
  borderGlow:      '#7da4cc',
  cyan:            '#1a66cc',
  cyanDim:         '#2277dd',
  cyanGlow:        'rgba(26,102,204,0.14)',
  cyanGlow2:       'rgba(26,102,204,0.07)',
  amber:           '#b86a00',
  red:             '#c82020',
  redGlow:         'rgba(200,32,32,0.12)',
  green:           '#0a7a52',
  text0:           '#0b1a30',
  text1:           '#2a4568',
  text2:           '#5878a0',
  gridLine:        'rgba(26,102,204,0.06)',
  mapBg:           '#d8e8f5',
  mapGrid:         'rgba(26,102,204,0.08)',
  corridorStroke:  '#1a55aa',
  corridorOpacity: '0.45',
  nodeOpacity:     '0.9',
  labelBg:         'rgba(232,241,252,0.94)',
  legendBg:        'rgba(255,255,255,0.97)',
  titleGradient:   'linear-gradient(135deg, #0a50bb 0%, #1a66cc 50%, #0a50bb 100%)',
};

/* ─── GLOBAL STYLE TAG ───────────────────────────────────────────────────── */
const GlobalStyle = ({ T, isDark }) => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Rajdhani:wght@400;600;700&family=Orbitron:wght@700;900&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: ${T.bg0}; color: ${T.text0}; font-family: 'Rajdhani', sans-serif; transition: background 0.3s, color 0.3s; }
    .atlas-root { min-height: 100vh; background-color: ${T.bg0}; background-image: linear-gradient(${T.gridLine} 1px, transparent 1px), linear-gradient(90deg, ${T.gridLine} 1px, transparent 1px), linear-gradient(${isDark ? 'rgba(0,212,255,0.02)' : 'rgba(26,102,204,0.03)'} 1px, transparent 1px), linear-gradient(90deg, ${isDark ? 'rgba(0,212,255,0.02)' : 'rgba(26,102,204,0.03)'} 1px, transparent 1px); background-size: 80px 80px, 80px 80px, 20px 20px, 20px 20px; }
    @keyframes scan { 0% { transform: translateY(-100%); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translateY(800%); opacity: 0; } }
    @keyframes pulse-ring { 0% { transform: scale(1); opacity: 1; } 100% { transform: scale(2.2); opacity: 0; } }
    @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
    @keyframes dash { to { stroke-dashoffset: -20; } }
    @keyframes spin { 100% { transform: rotate(360deg); } }
    @keyframes pulseOpacity { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
    @keyframes festGlow { 0%, 100% { filter: drop-shadow(0 0 10px rgba(255,0,170,0.5)); } 50% { filter: drop-shadow(0 0 25px rgba(255,0,170,0.9)); } }
    .atlas-card { background: ${T.bg2}; border: 1px solid ${T.border}; border-radius: 4px; position: relative; transition: border-color 0.25s, box-shadow 0.25s, background 0.3s; }
    .atlas-card::before { content: ''; position: absolute; inset: 0; pointer-events: none; border-radius: 4px; box-shadow: inset 0 0 40px ${isDark ? 'rgba(0,212,255,0.03)' : 'rgba(26,102,204,0.04)'}; }
    .atlas-card::after { content: ''; position: absolute; top: -1px; left: -1px; width: 16px; height: 16px; border-top: 2px solid ${T.cyan}; border-left: 2px solid ${T.cyan}; pointer-events: none; }
    .corner-br { position: absolute; bottom: -1px; right: -1px; width: 16px; height: 16px; border-bottom: 2px solid ${T.cyanDim}; border-right: 2px solid ${T.cyanDim}; pointer-events: none; }
    .atlas-label { font-family: 'Share Tech Mono', monospace; font-size: 0.6rem; letter-spacing: 0.18em; text-transform: uppercase; color: ${T.cyanDim}; margin-bottom: 8px; display: flex; align-items: center; gap: 6px; }
    .atlas-label::before { content: '//'; opacity: 0.5; }
    .atlas-control { width: 100%; padding: 10px 10px 10px 36px; background: ${T.bg1}; border: 1px solid ${T.border}; border-radius: 3px; color: ${T.text0}; font-family: 'Rajdhani', sans-serif; font-size: 0.9rem; font-weight: 600; outline: none; transition: border-color 0.2s, box-shadow 0.2s, background 0.3s; appearance: none; -webkit-appearance: none; }
    .atlas-control::placeholder { color: ${T.text2}; font-weight: 500; }
    .atlas-control:focus, .atlas-control.active { border-color: ${T.cyan}; box-shadow: 0 0 0 3px ${T.cyanGlow}, 0 0 20px ${T.cyanGlow2}; }
    .atlas-control:disabled { opacity: 0.4; cursor: not-allowed; }
    .floor-tab { padding: 6px 14px; border-radius: 2px; font-family: 'Share Tech Mono', monospace; font-size: 0.7rem; letter-spacing: 0.1em; cursor: pointer; border: 1px solid transparent; transition: all 0.18s; background: transparent; color: ${T.text2}; }
    .floor-tab:hover { color: ${T.text1}; border-color: ${T.borderGlow}; }
    .floor-tab.active { background: ${T.bg0}; color: ${T.cyan}; border-color: ${T.cyan}; box-shadow: 0 0 12px ${T.cyanGlow}; }
    .search-row { padding: 10px 16px; border-bottom: 1px solid ${T.border}; cursor: pointer; display: flex; justify-content: space-between; align-items: center; transition: background 0.15s; }
    .search-row:hover { background: ${T.bg3}; }
    .search-row.kbd-focused { background: ${T.bg3}; outline: 1px solid ${T.cyanDim}; }
    .atlas-btn { background: ${T.cyanGlow2}; border: 1px solid ${T.cyanDim}; color: ${T.cyan}; font-family: 'Share Tech Mono', monospace; padding: 10px; border-radius: 3px; cursor: pointer; transition: all 0.2s; text-transform: uppercase; letter-spacing: 0.1em; font-weight: bold; display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 0.8rem; }
    .atlas-btn:hover { background: ${T.cyanGlow}; border-color: ${T.cyan}; box-shadow: 0 0 15px ${T.cyanGlow}; }
    .empty-state { display: flex; height: 100%; align-items: center; justify-content: center; flex-direction: column; gap: 16px; color: ${T.text2}; }
    .status-bar { font-family: 'Share Tech Mono', monospace; font-size: 0.65rem; letter-spacing: 0.12em; color: ${T.text2}; padding: 8px 20px; border-top: 1px solid ${T.border}; display: flex; justify-content: space-between; align-items: center; background: ${T.bg1}; }
    .status-dot { width: 6px; height: 6px; border-radius: 50%; background: ${T.cyan}; display: inline-block; margin-right: 8px; animation: blink 1.4s infinite; }
    .atlas-dropdown::-webkit-scrollbar { width: 4px; } .atlas-dropdown::-webkit-scrollbar-track { background: ${T.bg1}; } .atlas-dropdown::-webkit-scrollbar-thumb { background: ${T.borderGlow}; border-radius: 2px; }
    .transition-badge rect { transition: fill 0.2s ease; } .transition-badge:hover rect { fill: ${T.green}; }
    .sidebar-menu-item { display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; border-radius: 3px; border: 1px solid ${T.border}; cursor: pointer; color: ${T.text1}; background-color: ${T.bg1}; transition: all 0.2s; }
    .sidebar-menu-item:hover { border-color: ${T.cyan}; background-color: ${T.cyanGlow2}; color: ${T.cyan}; }
    .map-node-interactive { cursor: crosshair; transition: all 0.2s; }
    .map-node-interactive:hover circle { fill: ${T.cyan} !important; filter: drop-shadow(0 0 8px ${T.cyan}); }
    .zoom-btn { background: ${T.bg1}; border: 1px solid ${T.border}; color: ${T.cyanDim}; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 4px; cursor: pointer; transition: all 0.2s; }
    .zoom-btn:hover { background: ${T.cyanGlow2}; color: ${T.cyan}; border-color: ${T.cyanDim}; }
    .theme-toggle-btn { background: ${T.bg2}; border: 1px solid ${T.border}; cursor: pointer; padding: 8px; border-radius: 4px; color: ${T.cyanDim}; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
    .theme-toggle-btn:hover { background: ${T.cyanGlow2}; color: ${T.cyan}; border-color: ${T.cyanDim}; }
    select option { background: ${T.bg1}; color: ${T.text0}; }
  `}</style>
);

function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const T = isDarkMode ? DARK : LIGHT;

  const [isBooting, setIsBooting] = useState(true);
  const [bootText, setBootText] = useState("ESTABLISHING SECURE HANDSHAKE...");

  useEffect(() => {
    const texts = ["ESTABLISHING SECURE HANDSHAKE...", "DECRYPTING SPATIAL DATA...", "LOADING ATLAS BLUEPRINTS...", "CALIBRATING ROUTING ENGINE...", "ACCESS GRANTED."];
    let i = 0;
    const interval = setInterval(() => { i++; if (i < texts.length) setBootText(texts[i]); }, 450);
    setTimeout(() => setIsBooting(false), 2400);
    return () => clearInterval(interval);
  }, []);

  const [currentUser, setCurrentUser] = useState(null);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [authForm, setAuthForm] = useState({ name: '', reg_no: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [buildings, setBuildings] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [mapData, setMapData] = useState(null);
  const [currentFloor, setCurrentFloor] = useState('');
  const [isEventMode, setIsEventMode] = useState(false);
  const [isFestSidebarOpen, setIsFestSidebarOpen] = useState(false);
  const [festSidebarBuilding, setFestSidebarBuilding] = useState('');
  const [festEventSearch, setFestEventSearch] = useState('');

  const [activeInput, setActiveInput] = useState('end');
  const [searchQueries, setSearchQueries] = useState({ start: '', end: '' });
  const [searchResults, setSearchResults] = useState([]);

  const [routeStartId, setRouteStartId] = useState(null);
  const [routeEndId, setRouteEndId] = useState(null);
  const [calculatedPath, setCalculatedPath] = useState([]);
  const [hoveredNodeId, setHoveredNodeId] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const [focusedResultIndex, setFocusedResultIndex] = useState(-1);
  const startSectionRef = useRef(null);
  const endSectionRef = useRef(null);
  const focusedRowRef = useRef(null);

  useEffect(() => {
    axios.get(`${API_BASE}/api/buildings`)
      .then((res) => setBuildings(res.data))
      .catch((err) => console.error("Backend Unreachable.", err));
    const params = new URLSearchParams(window.location.search);
    const b = params.get('b');
    const s = params.get('start');
    const e = params.get('end');
    if (b) { setSelectedBuilding(b); } else { setSelectedBuilding('CAMPUS'); }
    if (s) setRouteStartId(s);
    if (e) setRouteEndId(e);
    if (b || s || e) window.history.replaceState(null, '', window.location.pathname);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      const clickedOutside =
        (!startSectionRef.current || !startSectionRef.current.contains(e.target)) &&
        (!endSectionRef.current   || !endSectionRef.current.contains(e.target));
      if (clickedOutside) { setSearchResults([]); setFocusedResultIndex(-1); }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!selectedBuilding) { setMapData(null); setCurrentFloor(''); return; }
    axios.get(`${API_BASE}/api/graph/${selectedBuilding}`)
      .then((res) => {
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
      .catch((err) => console.error("Graph download failed", err));
  }, [selectedBuilding]);

  useEffect(() => {
    if (!mapData || !routeStartId || !routeEndId) { setCalculatedPath([]); return; }
    const adjacencyList = {};
    mapData.nodes.forEach(n => adjacencyList[n.id] = []);
    mapData.edges.forEach(edge => {
      const n1 = mapData.nodes.find(n => n.id === edge.source_node);
      const n2 = mapData.nodes.find(n => n.id === edge.target_node);
      if (!n1 || !n2) return;
      let dist = Math.sqrt(Math.pow(n1.pos_x - n2.pos_x, 2) + Math.pow(n1.pos_y - n2.pos_y, 2));
      if (String(n1.floor).trim() !== String(n2.floor).trim()) {
        const isElevatorOrStair =
          n1.name.toLowerCase().includes('elevator') || n2.name.toLowerCase().includes('elevator') ||
          n1.name.toLowerCase().includes('stair') || n2.name.toLowerCase().includes('stair') ||
          n1.name.toLowerCase().includes('lobby') || n2.name.toLowerCase().includes('lobby') ||
          n1.floor === 'All' || n2.floor === 'All';
        if (!isElevatorOrStair) dist += 10000;
        else dist += 50;
      }
      adjacencyList[n1.id].push({ node: n2.id, weight: dist });
      adjacencyList[n2.id].push({ node: n1.id, weight: dist });
    });
    const distances = {};
    const previous = {};
    const unvisited = new Set(mapData.nodes.map(n => n.id));
    mapData.nodes.forEach(n => distances[n.id] = Infinity);
    distances[routeStartId] = 0;
    while (unvisited.size > 0) {
      let currNode = null;
      let minDistance = Infinity;
      unvisited.forEach(nodeId => {
        if (distances[nodeId] < minDistance) { minDistance = distances[nodeId]; currNode = nodeId; }
      });
      if (!currNode || currNode === routeEndId) break;
      unvisited.delete(currNode);
      adjacencyList[currNode].forEach(neighbor => {
        if (!unvisited.has(neighbor.node)) return;
        const newDist = distances[currNode] + neighbor.weight;
        if (newDist < distances[neighbor.node]) {
          distances[neighbor.node] = newDist;
          previous[neighbor.node] = currNode;
        }
      });
    }
    if (distances[routeEndId] === Infinity) { setCalculatedPath([]); return; }
    const path = [];
    let curr = routeEndId;
    while (curr) { path.unshift(curr); curr = previous[curr]; }
    setCalculatedPath(path);
    const startNodeData = mapData.nodes.find(n => n.id === routeStartId);
    if (startNodeData && startNodeData.floor) setCurrentFloor(String(startNodeData.floor).trim());
  }, [routeStartId, routeEndId, mapData]);

  const floorTransitions = useMemo(() => {
    const transitions = {};
    if (mapData && calculatedPath.length > 0) {
      const getFloorVal = (f) => String(f).trim() === 'G' ? 0 : parseInt(String(f).trim() || 0);
      let entryNode = null;
      for (let i = 0; i < calculatedPath.length - 1; i++) {
        const curr = mapData.nodes.find(n => n.id === calculatedPath[i]);
        const next = mapData.nodes.find(n => n.id === calculatedPath[i + 1]);
        if (curr && next && String(curr.floor).trim() !== String(next.floor).trim()) {
          if (!entryNode) entryNode = curr;
          const nextNext = calculatedPath[i + 2] ? mapData.nodes.find(n => n.id === calculatedPath[i + 2]) : null;
          const isSteppingOut = !nextNext || String(nextNext.floor).trim() === String(next.floor).trim();
          if (isSteppingOut) {
            const valCurr = getFloorVal(entryNode.floor);
            const valNext = getFloorVal(next.floor);
            const direction = valNext > valCurr ? '⬆ UP' : '⬇ DOWN';
            transitions[entryNode.id] = { type: 'departure', text: `${direction} TO FL ${next.floor}`, targetFloor: String(entryNode.floor).trim(), actionFloor: String(next.floor).trim() };
            transitions[next.id] = { type: 'arrival', text: `ARRIVED FROM FL ${entryNode.floor}`, targetFloor: String(next.floor).trim(), actionFloor: String(entryNode.floor).trim() };
            entryNode = null;
          }
        }
      }
    }
    return transitions;
  }, [calculatedPath, mapData]);

  const handleSearch = async (type, query) => {
    setActiveInput(type);
    setSearchQueries(prev => ({ ...prev, [type]: query }));
    setFocusedResultIndex(-1);
    try {
      const res = await axios.get(`${API_BASE}/api/search?q=${query}&b=${selectedBuilding}`);
      setSearchResults(res.data);
    } catch (err) { console.error("Search failed", err); }
  };

  const sortedSearchResults = useMemo(() => {
    return [...searchResults].sort((a, b) => {
      const numA = parseInt(a.id.match(/\d+/) ? a.id.match(/\d+/)[0] : 0);
      const numB = parseInt(b.id.match(/\d+/) ? b.id.match(/\d+/)[0] : 0);
      return numA - numB;
    });
  }, [searchResults]);

  // Fest sidebar: events filtered by building + search, sorted by room number ascending
  const festEventsForBuilding = useMemo(() => {
    return Object.entries(FEST_EVENTS)
      .filter(([nodeId]) => {
        if (!festSidebarBuilding) return true;
        const prefix = nodeId.split('_')[0].toUpperCase();
        return prefix === festSidebarBuilding.toUpperCase();
      })
      .filter(([, ev]) =>
        !festEventSearch || ev.title.toLowerCase().includes(festEventSearch.toLowerCase())
      )
      .sort(([a], [b]) => {
        // Extract the last numeric block from the node ID for ascending room sort
        const getNum = (id) => {
          const parts = id.match(/\d+/g);
          return parts ? parseInt(parts[parts.length - 1]) : 0;
        };
        return getNum(a) - getNum(b);
      });
  }, [festSidebarBuilding, festEventSearch]);

  const handleMapNodeClick = (nodeId) => {
    const targetInput = activeInput || 'end';
    if (targetInput === 'start') {
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

  const handleKeyDown = (e) => {
    if (!sortedSearchResults.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setFocusedResultIndex(prev => Math.min(prev + 1, sortedSearchResults.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setFocusedResultIndex(prev => Math.max(prev - 1, 0)); }
    else if (e.key === 'Enter') {
      e.preventDefault();
      if (focusedResultIndex >= 0 && focusedResultIndex < sortedSearchResults.length) {
        handleSelectRoom(sortedSearchResults[focusedResultIndex]);
        setFocusedResultIndex(-1);
      }
    } else if (e.key === 'Escape') { setSearchResults([]); setFocusedResultIndex(-1); }
  };

  useEffect(() => {
    if (focusedRowRef.current) focusedRowRef.current.scrollIntoView({ block: 'nearest' });
  }, [focusedResultIndex]);

  const handleSelectRoom = (room) => { handleMapNodeClick(room.id); };

  const copyShareLink = () => {
    const params = new URLSearchParams();
    params.set('b', selectedBuilding);
    if (routeStartId) params.set('start', routeStartId);
    if (routeEndId) params.set('end', routeEndId);
    const shareUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const availableFloors = mapData
    ? [...new Set(mapData.nodes.map(n => String(n.floor).trim()))].sort((a, b) => {
        if (a === 'G') return -1;
        if (b === 'G') return 1;
        return Number(a) - Number(b);
      })
    : [];

  useEffect(() => {
    if (availableFloors.length > 0 && (!currentFloor || !availableFloors.includes(String(currentFloor).trim()))) {
      setCurrentFloor(availableFloors[0]);
    }
  }, [availableFloors, currentFloor]);

  const currentFloorNodes = mapData ? mapData.nodes.filter(n => String(n.floor).trim() === String(currentFloor).trim() || String(n.floor).trim() === 'All') : [];
  const currentFloorNodeIds = new Set(currentFloorNodes.map(n => n.id));
  const activeBlueprintEdges = mapData ? mapData.edges.filter(e => currentFloorNodeIds.has(e.source_node) && currentFloorNodeIds.has(e.target_node)) : [];
  const renderNodes = mapData ? mapData.nodes.filter(n => currentFloorNodeIds.has(n.id) || calculatedPath.includes(n.id)) : [];

  const pathEdgesToDraw = [];
  for (let i = 0; i < calculatedPath.length - 1; i++) {
    pathEdgesToDraw.push({ source: calculatedPath[i], target: calculatedPath[i + 1] });
  }

  const SPREAD_FACTOR = 4;
  const getX = (node) => Number(node.pos_x) * SPREAD_FACTOR;
  const getY = (node) => Number(node.pos_y) * SPREAD_FACTOR;

  const getViewBox = () => {
    if (!currentFloorNodes.length) return "0 0 100 100";
    const xs = currentFloorNodes.map(getX);
    const ys = currentFloorNodes.map(getY);
    const minX = Math.min(...xs); const maxX = Math.max(...xs);
    const minY = Math.min(...ys); const maxY = Math.max(...ys);
    const padding = 40;
    return `${minX - padding} ${minY - padding} ${maxX - minX + padding * 2} ${maxY - minY + padding * 2}`;
  };

  const getRoomLabel = (node) => {
    if (selectedBuilding === 'CAMPUS') return node.name.toUpperCase();
    const roomNumber = node.id.split('_').pop();
    return `${roomNumber} - ${node.name}`;
  };

  const totalNodes = currentFloorNodes.length;
  const totalEdges = activeBlueprintEdges.length;

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      const endpoint = isLoginMode ? '/api/auth/login' : '/api/auth/register';
      const res = await axios.post(`${API_BASE}${endpoint}`, authForm);
      setCurrentUser(res.data.user);
    } catch (err) { setAuthError(err.response?.data?.error || "Error"); }
  };

  const logout = () => { setCurrentUser(null); setAuthForm({ name: '', reg_no: '', password: '' }); };

  const handleSidebarClick = (moduleName) => {
    alert(`[ SYSTEM NOTICE ]\n\nModule: ${moduleName}\nStatus: Under Construction\n\nThis feature will be deployed in the next minor patch update.`);
  };

  // ==========================================
  // VIEW 0: BOOT SEQUENCE
  // ==========================================
  if (isBooting) {
    return (
      <>
        <GlobalStyle T={T} isDark={isDarkMode} />
        <div className="atlas-root" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
          <div style={{ position: 'relative', width: 120, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 40 }}>
            <div style={{ position: 'absolute', inset: 0, border: `2px dashed ${T.cyanDim}`, borderRadius: '50%', animation: 'spin 8s linear infinite' }} />
            <div style={{ position: 'absolute', inset: 10, border: `2px solid ${T.cyan}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite' }} />
            <MapPin size={40} color={T.cyan} style={{ animation: 'pulseOpacity 2s ease-in-out infinite', filter: `drop-shadow(0 0 10px ${T.cyan})` }} />
          </div>
          <div style={{ textAlign: 'center', fontFamily: "'Share Tech Mono', monospace" }}>
            <h2 style={{ color: T.text0, fontSize: '1.8rem', letterSpacing: '0.2em', marginBottom: '15px' }}>ATLAS <span style={{ color: T.cyan }}>OS</span></h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', color: T.cyanDim, fontSize: '0.85rem', letterSpacing: '0.1em' }}>
              <span className="status-dot" /> {bootText}
            </div>
          </div>
        </div>
      </>
    );
  }

  // ==========================================
  // VIEW 1: LOGIN / SIGNUP
  // ==========================================
  if (!currentUser) {
    return (
      <>
        <GlobalStyle T={T} isDark={isDarkMode} />
        <div className="atlas-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, minHeight: '100vh', position: 'relative' }}>
          <button className="theme-toggle-btn" onClick={() => setIsDarkMode(!isDarkMode)} title={isDarkMode ? 'Light Mode' : 'Dark Mode'} style={{ position: 'absolute', top: 20, right: 20 }}>
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <div className="atlas-card" style={{ padding: '40px', width: '100%', maxWidth: '420px' }}>
            <div className="corner-br" />
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <MapPin size={48} color={T.cyan} style={{ margin: '0 auto 10px', filter: `drop-shadow(0 0 10px ${T.cyanDim})` }} />
              <h1 style={{ fontFamily: "'Orbitron', sans-serif", margin: 0, fontSize: '2.5rem', fontWeight: '900', color: T.text0, letterSpacing: '0.1em' }}>ATLAS</h1>
              <p style={{ fontFamily: "'Share Tech Mono', monospace", color: T.cyanDim, margin: 0, letterSpacing: '0.2em', textTransform: 'uppercase', fontSize: '0.8rem', marginTop: '5px' }}>Terminal Access</p>
            </div>
            {authError && (
              <div style={{ backgroundColor: isDarkMode ? 'rgba(239,68,68,0.1)' : 'rgba(200,32,32,0.08)', border: `1px solid ${T.red}`, color: T.red, padding: '12px', borderRadius: '3px', marginBottom: '20px', fontSize: '0.9rem', textAlign: 'center', fontFamily: "'Share Tech Mono', monospace" }}>
                {authError}
              </div>
            )}
            <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {!isLoginMode && (
                <div style={{ position: 'relative' }}>
                  <User size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: T.text2 }} />
                  <input type="text" placeholder="Full Name" required className="atlas-control" value={authForm.name} onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })} />
                </div>
              )}
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: T.text2, fontFamily: "'Share Tech Mono', monospace", fontSize: '12px' }}>ID</span>
                <input type="text" placeholder="VIT Reg No" required className="atlas-control" style={{ textTransform: 'uppercase' }} value={authForm.reg_no} onChange={(e) => setAuthForm({ ...authForm, reg_no: e.target.value })} />
              </div>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: T.text2, fontFamily: "'Share Tech Mono', monospace", fontSize: '12px' }}>PW</span>
                <input type="password" placeholder="Password" required className="atlas-control" value={authForm.password} onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })} />
              </div>
              <button type="submit" className="atlas-btn" style={{ marginTop: '10px' }}>{isLoginMode ? 'Authenticate' : 'Initialize Account'}</button>
            </form>
            <div style={{ textAlign: 'center', marginTop: '24px', color: T.text2, fontSize: '0.9rem' }}>
              {isLoginMode ? "Unregistered user? " : "Already initialized? "}
              <span onClick={() => { setIsLoginMode(!isLoginMode); setAuthError(''); }} style={{ color: T.cyan, cursor: 'pointer', fontFamily: "'Share Tech Mono', monospace" }}>
                {isLoginMode ? ' [CREATE PROFILE]' : '[ LOGIN ]'}
              </span>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ==========================================
  // VIEW 2: MAIN DASHBOARD
  // ==========================================
  return (
    <>
      <GlobalStyle T={T} isDark={isDarkMode} />
      <div style={{ display: 'flex', height: '100vh', backgroundColor: T.bg0, overflow: 'hidden' }}>

        {/* ── SIDEBAR ── */}
        <div style={{ width: isSidebarOpen ? '250px' : '0px', backgroundColor: T.bg1, borderRight: isSidebarOpen ? `1px solid ${T.border}` : 'none', transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: isSidebarOpen ? `4px 0 24px ${isDarkMode ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.08)'}` : 'none', zIndex: 20 }}>
          <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: `1px solid ${T.border}`, minWidth: '250px' }}>
            <MapPin size={24} color={T.cyan} />
            <h2 style={{ margin: 0, fontSize: '1.3rem', fontFamily: "'Orbitron', sans-serif", letterSpacing: '0.1em', color: T.text0 }}>ATLAS</h2>
          </div>
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
                <div key={item} className="sidebar-menu-item" onClick={() => handleSidebarClick(item)}>
                  <span style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: '600', fontSize: '0.9rem' }}>{item}</span>
                  <ChevronRight size={14} />
                </div>
              ))}
            </div>
          </div>
          <div style={{ padding: '20px 24px', minWidth: '250px', borderTop: `1px solid ${T.border}` }}>
            <button onClick={logout} className="atlas-btn" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: T.red, borderColor: T.red, background: T.redGlow, padding: '10px' }}>
              <LogOut size={16} /> TERMINATE
            </button>
          </div>
        </div>

        {/* ── FEST MODE SIDEBAR (right-side panel) ── */}
        <div style={{
          width: isFestSidebarOpen ? '300px' : '0px',
          minWidth: isFestSidebarOpen ? '300px' : '0px',
          backgroundColor: T.bg1,
          borderRight: isFestSidebarOpen ? `1px solid rgba(218, 127, 15, 0.3)` : 'none',
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1), min-width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 20,
          boxShadow: isFestSidebarOpen ? `4px 0 32px rgba(255,0,170,0.08)` : 'none',
          order: -1,
        }}>
          {/* Header */}
          <div style={{ minWidth: '300px', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,0,170,0.25)', background: 'rgba(255,0,170,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <PartyPopper size={18} color="#7a2da9" />
              <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '0.9rem', fontWeight: 700, color: '#7a2da9', letterSpacing: '0.12em' }}>FEST MODE</span>
            </div>
            <button
              onClick={() => { setIsFestSidebarOpen(false); setIsEventMode(false); setFestEventSearch(''); }}
              style={{ background: 'transparent', border: '1px solid #7a2da9', borderRadius: 3, cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', color: '#7a2da9', transition: 'all 0.2s' }}
            >
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
                <select
                  value={festSidebarBuilding}
                  onChange={(e) => { setFestSidebarBuilding(e.target.value); setFestEventSearch(''); }}
                  style={{ width: '100%', padding: '9px 10px 9px 32px', background: T.bg2, border: `1px solid ${festSidebarBuilding ? '#7a2da9' : T.border}`, borderRadius: 3, color: T.text0, fontFamily: "'Rajdhani', sans-serif", fontSize: '0.9rem', fontWeight: 600, outline: 'none', appearance: 'none', WebkitAppearance: 'none', cursor: 'pointer', transition: 'border-color 0.2s', boxShadow: festSidebarBuilding ? '0 0 0 2px rgba(255,0,170,0.12)' : 'none' }}
                >
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
                <input
                  type="text"
                  placeholder="Type event name..."
                  value={festEventSearch}
                  onChange={(e) => setFestEventSearch(e.target.value)}
                  style={{ width: '100%', padding: '9px 10px 9px 28px', background: T.bg2, border: `1px solid ${festEventSearch ? '#7a2da9' : T.border}`, borderRadius: 3, color: T.text0, fontFamily: "'Rajdhani', sans-serif", fontSize: '0.9rem', fontWeight: 600, outline: 'none', transition: 'border-color 0.2s', boxShadow: festEventSearch ? '0 0 0 2px rgba(255,0,170,0.12)' : 'none', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            {/* Divider + count */}
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
                    <div key={nodeId} style={{ background: T.bg2, border: `1px solid rgba(255,0,170,0.18)`, borderLeft: `3px solid ${ev.color}`, borderRadius: 3, padding: '10px 12px', transition: 'all 0.2s', cursor: 'default' }}
                      onMouseEnter={e => e.currentTarget.style.background = isDarkMode ? 'rgba(255,0,170,0.07)' : 'rgba(255,0,170,0.04)'}
                      onMouseLeave={e => e.currentTarget.style.background = T.bg2}
                    >
                      {/* Event title */}
                      <div style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: '0.9rem', color: T.text0, marginBottom: 6, lineHeight: 1.2 }}>
                        {ev.title}
                      </div>
                      {/* Meta row */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                        {/* Room badge */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '0.58rem', background: `${ev.color}22`, color: ev.color, border: `1px solid ${ev.color}55`, padding: '2px 7px', borderRadius: 2, letterSpacing: '0.1em' }}>
                            {building} · {roomPart.toUpperCase()}
                          </span>
                        </div>
                        {/* Time badge */}
                        <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '0.58rem', color: T.text2, letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>
                          {ev.time}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{ minWidth: '300px', padding: '12px 20px', borderTop: '1px solid #7a2da9)', background: 'rgba(255,0,170,0.04)' }}>
            <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '0.55rem', color: '#7a2da9', letterSpacing: '0.12em', textAlign: 'center' }}>
              // FEST MODE ACTIVE — MAP OVERLAY ON
            </div>
          </div>
        </div>

        {/* ── MAIN CONTENT ── */}
        <div className="atlas-root" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', padding: 0 }}>

          {/* Top nav */}
          <div style={{ backgroundColor: T.bg1, padding: '12px 24px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} style={{ background: T.bg2, border: `1px solid ${T.border}`, cursor: 'pointer', padding: '8px', borderRadius: '4px', color: T.cyan, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <MapPin size={18} color={T.cyan} style={{ filter: `drop-shadow(0 0 6px ${T.cyan})` }} />
                {/* FIX: Replaced background shorthand with backgroundImage */}
                <span style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 900, fontSize: '1.1rem', letterSpacing: '0.15em', backgroundImage: `linear-gradient(135deg, ${T.cyan} 0%, #a8d8ff 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>ATLAS</span>
              </div>
              <div style={{ width: 1, height: 20, background: T.border, marginLeft: 4 }} />
              <div style={{ fontWeight: '600', color: T.text1, fontFamily: "'Share Tech Mono', monospace", letterSpacing: '0.1em', fontSize: '0.75rem' }}>
                STATUS: <span style={{ color: T.cyan }}>AUTHORIZED</span> // OPERATOR: {currentUser.name.split(' ')[0].toUpperCase()}
              </div>
            </div>
            <button className="theme-toggle-btn" onClick={() => setIsDarkMode(!isDarkMode)} title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
              {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>

          <div style={{ padding: '32px 24px', maxWidth: 1240, margin: '0 auto', width: '100%' }}>

            {/* ── HEADER ── */}
            <header style={{ textAlign: 'center', marginBottom: 32, position: 'relative' }}>
              <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: '1px', background: `linear-gradient(90deg, transparent, ${T.cyan}, transparent)`, animation: 'scan 4s linear infinite', pointerEvents: 'none' }} />
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: T.cyanGlow2, border: `1px solid ${T.cyanDim}`, borderRadius: 2, padding: '3px 12px', marginBottom: 12 }}>
                <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '0.6rem', letterSpacing: '0.25em', color: T.cyanDim }}>SYSTEM ACTIVE</span>
                <span className="status-dot" style={{ width: 4, height: 4 }} />
              </div>
              {/* FIX: Replaced background shorthand with backgroundImage */}
              <h1 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, letterSpacing: '0.12em', lineHeight: 1, backgroundImage: T.titleGradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: 8, position: 'relative' }}>
                ATLAS
              </h1>
              <p style={{ fontFamily: "'Share Tech Mono', monospace", color: T.text2, fontSize: '0.7rem', letterSpacing: '0.3em', textTransform: 'uppercase' }}>Intra-Academic Block Visualizer</p>
              <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'center' }}>
                <div style={{ flex: 1, maxWidth: 150, height: 1, background: `linear-gradient(90deg, transparent, ${T.border})` }} />
                <MapPin size={12} color={T.cyanDim} />
                <div style={{ flex: 1, maxWidth: 150, height: 1, background: `linear-gradient(90deg, ${T.border}, transparent)` }} />
              </div>
            </header>

            {/* ── SEARCH BAR ── */}
            <div className="atlas-card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0, marginBottom: 20, overflow: 'visible' }}>
              <div className="corner-br" />

              <div style={{ padding: '20px 24px', borderRight: `1px solid ${T.border}` }}>
                <div className="atlas-label"><Building2 size={10} /> SELECT BLOCK</div>
                <div style={{ position: 'relative' }}>
                  <Building2 size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: selectedBuilding ? T.cyan : T.text2, pointerEvents: 'none' }} />
                  <select className="atlas-control" value={selectedBuilding} onChange={(e) => { setSelectedBuilding(e.target.value); setRouteStartId(null); setRouteEndId(null); setSearchQueries({ start: '', end: '' }); setIsEventMode(false); }}>
                    <option value="">-- Choose a Building --</option>
                    {buildings.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                  <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: T.cyanDim, fontSize: '0.7rem' }}>▾</div>
                </div>
              </div>

              <div ref={startSectionRef} style={{ padding: '20px 24px', borderRight: `1px solid ${T.border}`, position: 'relative' }}>
                <div className="atlas-label" style={{ color: !selectedBuilding ? T.text2 : T.amber }}><Navigation size={10} /> ORIGIN</div>
                <div style={{ position: 'relative' }}>
                  <Navigation size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: !selectedBuilding ? T.text2 : T.amber, pointerEvents: 'none' }} />
                  <input type="text" className={`atlas-control ${activeInput === 'start' ? 'active' : ''}`} placeholder={selectedBuilding ? "Search or click map..." : "Lock pending block"} disabled={!selectedBuilding} value={searchQueries.start} onChange={(e) => handleSearch('start', e.target.value)} onFocus={(e) => handleSearch('start', e.target.value)} onKeyDown={handleKeyDown} />
                </div>
                {activeInput === 'start' && sortedSearchResults.length > 0 && (
                  <div className="atlas-dropdown" role="listbox" style={{ position: 'absolute', top: 'calc(100% - 8px)', left: 24, right: 24, zIndex: 50, background: T.bg1, border: `1px solid ${T.cyan}`, borderRadius: 4, boxShadow: `0 20px 40px ${isDarkMode ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.12)'}, 0 0 30px ${T.cyanGlow}`, maxHeight: 280, overflowY: 'auto', overflowX: 'hidden' }}>
                    <div style={{ padding: '8px 20px', borderBottom: `1px solid ${T.border}`, fontFamily: "'Share Tech Mono', monospace", fontSize: '0.62rem', letterSpacing: '0.18em', color: T.cyanDim }}>{sortedSearchResults.length} RESULTS FOUND</div>
                    {sortedSearchResults.map((room, i) => (
                      <div key={room.id} ref={i === focusedResultIndex ? focusedRowRef : null} role="option" aria-selected={i === focusedResultIndex} className={`search-row${i === focusedResultIndex ? ' kbd-focused' : ''}`} onClick={() => handleSelectRoom(room)}>
                        <div>
                          <div style={{ fontWeight: 700, color: T.text0, fontSize: '0.9rem', fontFamily: "'Rajdhani', sans-serif" }}>{room.name}</div>
                          <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '0.6rem', color: T.text2, marginTop: 2 }}>ID: {room.id}</div>
                        </div>
                        <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '0.65rem', background: T.cyanGlow, color: T.cyan, border: `1px solid ${T.cyanDim}`, padding: '4px 10px', borderRadius: 2, letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>FL {room.floor}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div ref={endSectionRef} style={{ padding: '20px 24px', position: 'relative' }}>
                <div className="atlas-label" style={{ color: !selectedBuilding ? T.text2 : T.red }}><MapPin size={10} /> DESTINATION</div>
                <div style={{ position: 'relative' }}>
                  <MapPin size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: !selectedBuilding ? T.text2 : T.red, pointerEvents: 'none' }} />
                  <input type="text" className={`atlas-control ${activeInput === 'end' ? 'active' : ''}`} placeholder={selectedBuilding ? "Search or click map..." : "Lock pending block"} disabled={!selectedBuilding} value={searchQueries.end} onChange={(e) => handleSearch('end', e.target.value)} onFocus={(e) => handleSearch('end', e.target.value)} onKeyDown={handleKeyDown} />
                </div>
                {activeInput === 'end' && sortedSearchResults.length > 0 && (
                  <div className="atlas-dropdown" role="listbox" style={{ position: 'absolute', top: 'calc(100% - 8px)', left: 24, right: 24, zIndex: 50, background: T.bg1, border: `1px solid ${T.cyan}`, borderRadius: 4, boxShadow: `0 20px 40px ${isDarkMode ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.12)'}, 0 0 30px ${T.cyanGlow}`, maxHeight: 280, overflowY: 'auto', overflowX: 'hidden' }}>
                    <div style={{ padding: '8px 20px', borderBottom: `1px solid ${T.border}`, fontFamily: "'Share Tech Mono', monospace", fontSize: '0.62rem', letterSpacing: '0.18em', color: T.cyanDim }}>{sortedSearchResults.length} RESULTS FOUND</div>
                    {sortedSearchResults.map((room, i) => (
                      <div key={room.id} ref={i === focusedResultIndex ? focusedRowRef : null} role="option" aria-selected={i === focusedResultIndex} className={`search-row${i === focusedResultIndex ? ' kbd-focused' : ''}`} onClick={() => handleSelectRoom(room)}>
                        <div>
                          <div style={{ fontWeight: 700, color: T.text0, fontSize: '0.9rem', fontFamily: "'Rajdhani', sans-serif" }}>{room.name}</div>
                          <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '0.6rem', color: T.text2, marginTop: 2 }}>ID: {room.id}</div>
                        </div>
                        <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '0.65rem', background: T.cyanGlow, color: T.cyan, border: `1px solid ${T.cyanDim}`, padding: '4px 10px', borderRadius: 2, letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>FL {room.floor}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ── MAP CARD ── */}
            <div className="atlas-card" style={{ overflow: 'hidden' }}>
              <div className="corner-br" />

              {/* Map toolbar */}
              <div style={{ padding: '12px 20px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: T.bg1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 30, height: 30, background: T.cyanGlow, border: `1px solid ${T.cyanDim}`, borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <MapIcon size={14} color={T.cyan} />
                  </div>
                  <div>
                    <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '0.9rem', fontWeight: 700, color: T.text0, letterSpacing: '0.08em' }}>{selectedBuilding ? selectedBuilding.toUpperCase() : 'CAMPUS'}</div>
                    <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '0.6rem', color: T.text2, letterSpacing: '0.15em' }}>FLOOR BLUEPRINT</div>
                  </div>
                </div>
                {selectedBuilding && availableFloors.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <button onClick={() => { const next = !isEventMode; setIsEventMode(next); setIsFestSidebarOpen(next); }} style={{ background: isEventMode ? 'rgba(122,45,169,0.15)' : 'transparent', border: `1px solid ${isEventMode ? '#7a2da9' : T.border}`, color: isEventMode ? '#7a2da9' : T.text2, padding: '4px 10px', borderRadius: '3px', cursor: 'pointer', fontFamily: "'Share Tech Mono', monospace", fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s', boxShadow: isEventMode ? '0 0 10px rgba(122,45,169,0.3)' : 'none' }}>
                      <PartyPopper size={12} /> {isEventMode ? 'FEST MODE : ON' : 'FEST MODE'}
                    </button>
                    <div style={{ width: 1, height: 20, background: T.border }} />
                    <Layers size={13} color={T.text2} />
                    <div style={{ display: 'flex', gap: 4 }}>
                      {availableFloors.map(floor => (
                        <button key={floor} className={`floor-tab ${currentFloor === floor ? 'active' : ''}`} onClick={() => setCurrentFloor(floor)}>
                          {floor === 'G' ? 'FG' : `F${floor}`}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Map canvas */}
              <div style={{ height: 500, position: 'relative', background: T.mapBg, overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: `linear-gradient(${T.mapGrid} 1px, transparent 1px), linear-gradient(90deg, ${T.mapGrid} 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
                {isEventMode && <div style={{ position: 'absolute', inset: 0, background: isDarkMode ? 'rgba(6,12,26,0.6)' : 'rgba(210,228,245,0.55)', pointerEvents: 'none', zIndex: 1 }} />}

                {!selectedBuilding ? (
                  <div className="empty-state">
                    <div style={{ position: 'relative' }}>
                      <Navigation size={48} color={T.cyanDim} style={{ opacity: 0.4 }} />
                      <div style={{ position: 'absolute', inset: -8, border: `1px solid ${T.cyanDim}`, borderRadius: '50%', animation: 'pulse-ring 2s ease-out infinite', opacity: 0 }} />
                    </div>
                    <p style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: T.text2 }}>AWAITING BLOCK SELECTION</p>
                  </div>
                ) : (
                  <TransformWrapper initialScale={1} minScale={0.5} maxScale={6} wheel={{ step: 0.4 }} panning={{ velocityMultiplier: 2 }}>
                    {({ zoomIn, zoomOut, resetTransform }) => (
                      <>
                        <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }} contentStyle={{ width: "100%", height: "100%" }}>
                          <svg width="100%" height="100%" viewBox={getViewBox()} style={{ display: 'block' }}>
                            <defs>
                              <filter id="node-glow"><feGaussianBlur stdDeviation="2" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
                              <filter id="path-glow"><feGaussianBlur stdDeviation="3" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
                            </defs>

                            {/* Blueprint corridors */}
                            {activeBlueprintEdges.map(edge => {
                              const s = mapData.nodes.find(n => n.id === edge.source_node);
                              const t = mapData.nodes.find(n => n.id === edge.target_node);
                              if (!s || !t) return null;
                              const isCampus = selectedBuilding === 'CAMPUS';
                              return (
                                <line key={edge.id} x1={getX(s)} y1={getY(s)} x2={getX(t)} y2={getY(t)}
                                  stroke={T.corridorStroke}
                                  strokeWidth={isCampus ? "1.5" : "0.6"}
                                  strokeLinecap="round"
                                  opacity={isCampus ? "0.7" : T.corridorOpacity}
                                />
                              );
                            })}

                            {/* Dijkstra path — polylines eliminate phase-drift animation gaps */}
                            {(() => {
                              const onFloorPts    = [];
                              const otherFloorPts = [];
                              const transSegs     = [];
                              const isCampus = selectedBuilding === 'CAMPUS';

                              pathEdgesToDraw.forEach((edge) => {
                                const s = mapData.nodes.find(n => n.id === edge.source);
                                const t = mapData.nodes.find(n => n.id === edge.target);
                                if (!s || !t) return;
                                const sOn = String(s.floor).trim() === String(currentFloor).trim();
                                const tOn = String(t.floor).trim() === String(currentFloor).trim();
                                const sx = getX(s), sy = getY(s), tx = getX(t), ty = getY(t);
                                if (sOn && tOn) {
                                  if (onFloorPts.length === 0 || onFloorPts[onFloorPts.length-2] !== sx || onFloorPts[onFloorPts.length-1] !== sy) onFloorPts.push(sx, sy);
                                  onFloorPts.push(tx, ty);
                                } else if (!sOn && !tOn) {
                                  if (otherFloorPts.length === 0 || otherFloorPts[otherFloorPts.length-2] !== sx || otherFloorPts[otherFloorPts.length-1] !== sy) otherFloorPts.push(sx, sy);
                                  otherFloorPts.push(tx, ty);
                                } else {
                                  transSegs.push({ sx, sy, tx, ty });
                                }
                              });

                              const toPoints = (pts) => {
                                const pairs = [];
                                for (let i = 0; i < pts.length; i += 2) pairs.push(`${pts[i]},${pts[i+1]}`);
                                return pairs.join(' ');
                              };

                              let onFloorWidth = isCampus ? "7" : CONFIG.pathThickness;
                              let otherFloorWidth = isCampus ? "4" : CONFIG.xrayThickness;
                              let transWidth = isCampus ? "6" : "3";
                              
                              let dashPatternOn = isCampus ? "8 14" : "6 4";
                              let dashPatternOther = isCampus ? "8 8" : "4 4";

                              return (
                                <>
                                  {onFloorPts.length >= 4 && (
                                    <polyline points={toPoints(onFloorPts)} fill="none" stroke={T.amber} strokeWidth={onFloorWidth} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={dashPatternOn} opacity={CONFIG.pathOpacity} filter="url(#path-glow)" style={{ animation: 'dash 1s linear infinite' }} />
                                  )}
                                  {otherFloorPts.length >= 4 && (
                                    <polyline points={toPoints(otherFloorPts)} fill="none" stroke={T.red} strokeWidth={otherFloorWidth} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={dashPatternOther} opacity={CONFIG.xrayOpacity} style={{ animation: 'dash 1s linear infinite' }} />
                                  )}
                                  {transSegs.map(({ sx, sy, tx, ty }, i) => (
                                    <line key={`trans-${i}`} x1={sx} y1={sy} x2={tx} y2={ty} stroke={T.green} strokeWidth={transWidth} strokeLinecap="round" strokeDasharray="6 4" opacity={1} filter="url(#path-glow)" style={{ animation: 'dash 1s linear infinite' }} />
                                  ))}
                                </>
                              );
                            })()}

                            {/* Nodes */}
                            {renderNodes.map(node => {
                              const isCampus = selectedBuilding === 'CAMPUS';
                              const name = node.name.toLowerCase();
                              const isMajorNode = isCampus || name.includes('entrance') || name.includes('corridor') || name.includes('elevator') || name.includes('lobby');
                              const isStart  = routeStartId === node.id;
                              const isEnd    = routeEndId === node.id;
                              const isInPath = calculatedPath.includes(node.id);
                              const isCurrentFloor = String(node.floor).trim() === String(currentFloor).trim();
                              const isXRay   = !isCurrentFloor && isInPath;
                              const nodeOpacity = isXRay ? CONFIG.xrayOpacity : 1;

                              const transition = floorTransitions[node.id];
                              const showTransitionBadge = transition && isInPath && transition.targetFloor === String(currentFloor).trim();

                              // Node fill
                              let nodeColor = isMajorNode ? T.cyan : (isDarkMode ? `${T.cyan}99` : `${T.cyan}dd`);
                              let ringColor = null;
                              if (isStart)       { nodeColor = T.amber; ringColor = T.amber; }
                              else if (isEnd)    { nodeColor = T.red;   ringColor = T.red; }
                              else if (isInPath) { nodeColor = T.amber; }
                  

                              const isFestEvent = isEventMode && FEST_EVENTS[node.id];
                              const circleOpacity = isCampus ? "1" : T.nodeOpacity;

                              // Dynamic Macro Scaling
                              const rTerminal = isCampus ? 15 : 5;
                              const rMajor = isCampus ? 11 : 3.2;
                              const rMinor = isCampus ? 11 : 2.5;
                              const nodeRadius = (isStart || isEnd) ? rTerminal : (isMajorNode ? rMajor : rMinor);
                              
                              const labelFontSize = isCampus ? "22" : (isMajorNode ? "2.5" : "2.2");
                              const rectWidthMultiplier = isCampus ? 7.5 : 1.7;
                              const rectXOffset = isCampus ? 3.75 : 0.85;
                              const rectHeight = isCampus ? 20 : 5.5;
                              const yOffsetBox = isCampus ? 35 : 9;
                              const yOffsetText = isCampus ? 20 : 5.5;

                              return (
                                <g key={node.id} style={{ opacity: nodeOpacity }}>
                                  <g className="map-node-interactive" onClick={() => handleMapNodeClick(node.id)} onMouseEnter={() => setHoveredNodeId(node.id)} onMouseLeave={() => setHoveredNodeId(null)}>
                                    {ringColor && (
                                      <>
                                        <circle cx={getX(node)} cy={getY(node)} r={isCampus ? "30" : "8"} fill="none" stroke={ringColor} strokeWidth={isCampus ? "2" : "0.5"} opacity="0.6" />
                                        <circle cx={getX(node)} cy={getY(node)} r={isCampus ? "20" : "5"} fill={ringColor} opacity="0.3" filter="url(#node-glow)" />
                                      </>
                                    )}
                                    {isFestEvent && (
                                      <circle cx={getX(node)} cy={getY(node)} r={isCampus ? "40" : "12"} fill="none" stroke={FEST_EVENTS[node.id].color} strokeWidth={isCampus ? "3" : "1"} style={{ animation: 'festGlow 2s infinite' }} />
                                    )}
                                    <circle
                                      cx={getX(node)} cy={getY(node)}
                                      r={nodeRadius}
                                      fill={isFestEvent ? FEST_EVENTS[node.id].color : nodeColor}
                                      stroke={isDarkMode ? T.bg0 : T.bg1}
                                      strokeWidth={isCampus ? "2" : "0.5"}
                                      opacity={circleOpacity}
                                      filter={isInPath ? 'url(#node-glow)' : undefined}
                                    />
                                    {/* Node labels */}
                                    {(isStart || isEnd || isMajorNode || isFestEvent) && (
                                      <>
                                        <rect
                                          x={getX(node) - getRoomLabel(node).length * rectXOffset}
                                          y={getY(node) - yOffsetBox}
                                          width={getRoomLabel(node).length * rectWidthMultiplier}
                                          height={rectHeight}
                                          fill={T.labelBg}
                                          rx="1"
                                        />
                                        <text
                                          x={getX(node)} y={getY(node) - yOffsetText}
                                          fontSize={labelFontSize}
                                          fontWeight="700" textAnchor="middle"
                                          fill={isStart ? T.amber : isEnd ? T.red : (isFestEvent ? FEST_EVENTS[node.id].color : T.cyan)}
                                          style={{ fontFamily: 'Share Tech Mono, monospace' }}
                                        >
                                          {isFestEvent ? FEST_EVENTS[node.id].title : getRoomLabel(node)}
                                        </text>
                                      </>
                                    )}

                                    {/* Hover tooltip — room number pill above node */}
                                    {!isCampus && hoveredNodeId === node.id && (() => {
                                      const roomNo = node.id.split('_').pop();
                                      const pw = roomNo.length * 2.4 + 8;
                                      return (
                                        <g style={{ pointerEvents: 'none' }}>
                                          <rect x={getX(node) - pw / 2} y={getY(node) - 16} width={pw} height={7} fill={T.bg0} stroke={T.cyan} strokeWidth="0.5" rx="1.5" opacity="0.97" />
                                          <text x={getX(node)} y={getY(node) - 10.8} fontSize="3" fontWeight="800" textAnchor="middle" fill={T.cyan} style={{ fontFamily: 'Share Tech Mono, monospace' }}>{roomNo}</text>
                                        </g>
                                      );
                                    })()}
                                  </g>

                                  {/* Floor transition badge */}
                                  {showTransitionBadge && (
                                    <g className="transition-badge" transform={`translate(${getX(node)}, ${getY(node) - (isCampus ? 60 : 16)})`} onClick={() => setCurrentFloor(transition.actionFloor)} style={{ cursor: 'pointer', pointerEvents: 'all' }}>
                                      <rect x={isCampus ? "-60" : "-18"} y={isCampus ? "-10" : "-3.5"} width={isCampus ? "120" : "36"} height={isCampus ? "20" : "7"} fill={T.cyanDim} rx={isCampus ? "2" : "1"} />
                                      <text x="0" y="0" fontSize={isCampus ? "10" : "3"} fontWeight="800" textAnchor="middle" alignmentBaseline="middle" fill={isDarkMode ? T.bg0 : '#ffffff'} style={{ fontFamily: 'Share Tech Mono, monospace' }}>
                                        {transition.text}
                                      </text>
                                    </g>
                                  )}
                                </g>
                              );
                            })}
                          </svg>
                        </TransformComponent>

                        {/* Route legend */}
                        {calculatedPath.length > 0 && !isEventMode && (
                          <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 10, background: T.legendBg, border: `1px solid ${T.border}`, borderRadius: 3, padding: '10px 14px', backdropFilter: 'blur(6px)', minWidth: 170 }}>
                            <div style={{ position: 'absolute', top: -1, left: -1, width: 10, height: 10, borderTop: `2px solid ${T.cyan}`, borderLeft: `2px solid ${T.cyan}` }} />
                            <div style={{ position: 'absolute', bottom: -1, right: -1, width: 10, height: 10, borderBottom: `2px solid ${T.cyanDim}`, borderRight: `2px solid ${T.cyanDim}` }} />
                            <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '0.55rem', letterSpacing: '0.18em', color: T.cyanDim, marginBottom: 9, paddingBottom: 7, borderBottom: `1px solid ${T.border}` }}>
                              // ROUTE LEGEND
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 7 }}>
                              <svg width="30" height="8" style={{ flexShrink: 0, overflow: 'visible' }}>
                                <line x1="0" y1="4" x2="30" y2="4" stroke={T.amber} strokeWidth="2.5" strokeLinecap="round" strokeDasharray="6 4" style={{ animation: 'dash 1s linear infinite' }} />
                              </svg>
                              <div>
                                <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '0.8rem', fontWeight: 700, color: T.text0, lineHeight: 1 }}>Current floor</div>
                                <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '0.55rem', color: T.text2, marginTop: 2 }}>Active floor path</div>
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                              <svg width="30" height="8" style={{ flexShrink: 0, overflow: 'visible' }}>
                                <line x1="0" y1="4" x2="30" y2="4" stroke={T.red} strokeWidth="2.5" strokeLinecap="round" strokeDasharray="4 4" style={{ animation: 'dash 1s linear infinite' }} />
                              </svg>
                              <div>
                                <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '0.8rem', fontWeight: 700, color: T.text0, lineHeight: 1 }}>Other floors</div>
                                <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '0.55rem', color: T.text2, marginTop: 2 }}>Route continues above/below</div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Zoom controls */}
                        <div style={{ position: 'absolute', right: 20, bottom: 20, display: 'flex', flexDirection: 'column', gap: 8, zIndex: 10 }}>
                          <button className="zoom-btn" onClick={() => zoomIn()} title="Zoom In"><ZoomIn size={16} /></button>
                          <button className="zoom-btn" onClick={() => zoomOut()} title="Zoom Out"><ZoomOut size={16} /></button>
                          <button className="zoom-btn" onClick={() => resetTransform()} title="Reset View"><Maximize size={16} /></button>
                        </div>
                      </>
                    )}
                  </TransformWrapper>
                )}
              </div>

              {/* Status bar */}
              <div className="status-bar">
                <span>
                  <span className="status-dot" style={{ background: calculatedPath.length > 0 ? T.amber : T.cyan }} />
                  ATLAS v2.0 — {calculatedPath.length > 0 ? 'ROUTING ENGINE ACTIVE' : 'RENDER ENGINE ACTIVE'}
                </span>
                {selectedBuilding && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                    <span>NODES: <span style={{ color: T.cyan }}>{totalNodes}</span></span>
                    <span>EDGES: <span style={{ color: T.cyan }}>{totalEdges}</span></span>
                    <span>FLOOR: <span style={{ color: T.cyan }}>{currentFloor || '—'}</span></span>
                    {calculatedPath.length > 0 && <span>WAYPOINTS: <span style={{ color: T.amber }}>{calculatedPath.length}</span></span>}
                    {calculatedPath.length > 0 && (
                      <button onClick={copyShareLink} style={{ background: copiedLink ? T.green : T.cyanGlow2, border: `1px solid ${copiedLink ? T.green : T.cyanDim}`, color: copiedLink ? (isDarkMode ? T.bg0 : '#ffffff') : T.cyan, padding: '4px 10px', borderRadius: '3px', cursor: 'pointer', fontFamily: "'Share Tech Mono', monospace", fontSize: '0.6rem', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold', marginLeft: '10px' }}>
                        {copiedLink ? <Check size={12} /> : <Copy size={12} />} {copiedLink ? 'LINK COPIED' : 'SHARE ROUTE'}
                      </button>
                    )}
                  </span>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}

export default App;