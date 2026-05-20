import { useEffect } from 'react';

const GlobalStyle = ({ T, isDark }) => {
  useEffect(() => {
    const styleId = 'atlas-global-styles';
    
    // Remove existing style if present
    const existing = document.getElementById(styleId);
    if (existing) existing.remove();
    
    // Create new style element
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
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
    `;
    
    document.head.appendChild(style);
    
    return () => {
      const existing = document.getElementById(styleId);
      if (existing) existing.remove();
    };
  }, [T, isDark]);
  
  return null; // No JSX needed since styles are injected into head
};

export default GlobalStyle;