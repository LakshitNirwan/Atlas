import { Navigation, Map as MapIcon, Layers, PartyPopper, ZoomIn, ZoomOut, Maximize, Copy, Check } from 'lucide-react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { CONFIG, FEST_EVENTS } from '../constants/theme';

const MapCanvas = ({
  T, isDarkMode,
  selectedBuilding, mapData,
  currentFloor, setCurrentFloor,
  availableFloors,
  isEventMode, setIsEventMode, setIsFestSidebarOpen,
  calculatedPath, routeStartId, routeEndId,
  hoveredNodeId, setHoveredNodeId,
  floorTransitions,
  onNodeClick,
  copiedLink, onCopyLink,
}) => {
  // ── Derived data ────────────────────────────────────────────────────────────
  const currentFloorNodes = mapData
    ? mapData.nodes.filter(n => String(n.floor).trim() === String(currentFloor).trim() || String(n.floor).trim() === 'All')
    : [];
  const currentFloorNodeIds = new Set(currentFloorNodes.map(n => n.id));
  const activeBlueprintEdges = mapData
    ? mapData.edges.filter(e => currentFloorNodeIds.has(e.source_node) && currentFloorNodeIds.has(e.target_node))
    : [];
  const renderNodes = mapData
    ? mapData.nodes.filter(n => currentFloorNodeIds.has(n.id) || calculatedPath.includes(n.id))
    : [];

  const pathEdgesToDraw = [];
  for (let i = 0; i < calculatedPath.length - 1; i++) {
    pathEdgesToDraw.push({ source: calculatedPath[i], target: calculatedPath[i + 1] });
  }

  const SPREAD_FACTOR = 4;
  const getX = (node) => Number(node.pos_x) * SPREAD_FACTOR;
  const getY = (node) => Number(node.pos_y) * SPREAD_FACTOR;

  const getViewBox = () => {
    if (!currentFloorNodes.length) return '0 0 100 100';
    const xs = currentFloorNodes.map(getX);
    const ys = currentFloorNodes.map(getY);
    const minX = Math.min(...xs); const maxX = Math.max(...xs);
    const minY = Math.min(...ys); const maxY = Math.max(...ys);
    const padding = 40;
    return `${minX - padding} ${minY - padding} ${maxX - minX + padding * 2} ${maxY - minY + padding * 2}`;
  };

  const getRoomLabel = (node) => {
    if (selectedBuilding === 'CAMPUS') return node.name.toUpperCase();
    return `${node.id.split('_').pop()} - ${node.name}`;
  };

  const totalNodes = currentFloorNodes.length;
  const totalEdges = activeBlueprintEdges.length;
  const isCampusView = selectedBuilding === 'CAMPUS';

  return (
    <div className="atlas-card" style={{ overflow: 'hidden' }}>
      <div className="corner-br" />

      {/* ── Map toolbar ── */}
      <div style={{ padding: '12px 20px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: T.bg1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 30, height: 30, background: T.cyanGlow, border: `1px solid ${T.cyanDim}`, borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MapIcon size={14} color={T.cyan} />
          </div>
          <div>
            <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '0.9rem', fontWeight: 700, color: T.text0, letterSpacing: '0.08em' }}>
              {selectedBuilding ? selectedBuilding.toUpperCase() : 'CAMPUS'}
            </div>
            <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '0.6rem', color: T.text2, letterSpacing: '0.15em' }}>FLOOR BLUEPRINT</div>
          </div>
        </div>

        {selectedBuilding && availableFloors.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button
              onClick={() => { const next = !isEventMode; setIsEventMode(next); setIsFestSidebarOpen(next); }}
              style={{ background: isEventMode ? 'rgba(122,45,169,0.15)' : 'transparent', border: `1px solid ${isEventMode ? '#7a2da9' : T.border}`, color: isEventMode ? '#7a2da9' : T.text2, padding: '4px 10px', borderRadius: '3px', cursor: 'pointer', fontFamily: "'Share Tech Mono', monospace", fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s', boxShadow: isEventMode ? '0 0 10px rgba(122,45,169,0.3)' : 'none' }}
            >
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

      {/* ── Map canvas ── */}
      <div style={{ height: 500, position: 'relative', background: T.mapBg, overflow: 'hidden' }}>
        {/* Grid overlay */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: `linear-gradient(${T.mapGrid} 1px, transparent 1px), linear-gradient(90deg, ${T.mapGrid} 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />

        {/* Fest mode dimmer */}
        {isEventMode && (
          <div style={{ position: 'absolute', inset: 0, background: isDarkMode ? 'rgba(6,12,26,0.6)' : 'rgba(210,228,245,0.55)', pointerEvents: 'none', zIndex: 1 }} />
        )}

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
                <TransformComponent wrapperStyle={{ width: '100%', height: '100%' }} contentStyle={{ width: '100%', height: '100%' }}>
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
                      return (
                        <line key={edge.id}
                          x1={getX(s)} y1={getY(s)} x2={getX(t)} y2={getY(t)}
                          stroke={T.corridorStroke}
                          strokeWidth={isCampusView ? '1.5' : '0.6'}
                          strokeLinecap="round"
                          opacity={isCampusView ? '0.7' : T.corridorOpacity}
                        />
                      );
                    })}

                    {/* Dijkstra path polylines */}
                    {(() => {
                      const onFloorPts = [], otherFloorPts = [], transSegs = [];
                      pathEdgesToDraw.forEach((edge) => {
                        const s = mapData.nodes.find(n => n.id === edge.source);
                        const t = mapData.nodes.find(n => n.id === edge.target);
                        if (!s || !t) return;
                        const sOn = String(s.floor).trim() === String(currentFloor).trim();
                        const tOn = String(t.floor).trim() === String(currentFloor).trim();
                        const sx = getX(s), sy = getY(s), tx = getX(t), ty = getY(t);
                        if (sOn && tOn) {
                          if (onFloorPts.length === 0 || onFloorPts[onFloorPts.length - 2] !== sx || onFloorPts[onFloorPts.length - 1] !== sy) onFloorPts.push(sx, sy);
                          onFloorPts.push(tx, ty);
                        } else if (!sOn && !tOn) {
                          if (otherFloorPts.length === 0 || otherFloorPts[otherFloorPts.length - 2] !== sx || otherFloorPts[otherFloorPts.length - 1] !== sy) otherFloorPts.push(sx, sy);
                          otherFloorPts.push(tx, ty);
                        } else {
                          transSegs.push({ sx, sy, tx, ty });
                        }
                      });
                      const toPoints = (pts) => { const pairs = []; for (let i = 0; i < pts.length; i += 2) pairs.push(`${pts[i]},${pts[i + 1]}`); return pairs.join(' '); };
                      const onFloorWidth = isCampusView ? '8' : CONFIG.pathThickness;
                      const otherFloorWidth = isCampusView ? '4' : CONFIG.xrayThickness;
                      const transWidth = isCampusView ? '6' : '3';
                      const dashOn = isCampusView ? '16 12' : '6 4';
                      const dashOther = isCampusView ? '8 8' : '4 4';
                      return (
                        <>
                          {onFloorPts.length >= 4 && <polyline points={toPoints(onFloorPts)} fill="none" stroke={T.amber} strokeWidth={onFloorWidth} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={dashOn} opacity={CONFIG.pathOpacity} filter="url(#path-glow)" style={{ animation: 'dash 1s linear infinite' }} />}
                          {otherFloorPts.length >= 4 && <polyline points={toPoints(otherFloorPts)} fill="none" stroke={T.green} strokeWidth={otherFloorWidth} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={dashOther} opacity={CONFIG.xrayOpacity} style={{ animation: 'dash 1s linear infinite' }} />}
                          {transSegs.map(({ sx, sy, tx, ty }, i) => (
                            <line key={`trans-${i}`} x1={sx} y1={sy} x2={tx} y2={ty} stroke={T.green} strokeWidth={transWidth} strokeLinecap="round" strokeDasharray="6 4" opacity={1} filter="url(#path-glow)" style={{ animation: 'dash 1s linear infinite' }} />
                          ))}
                        </>
                      );
                    })()}

                    {/* Nodes */}
                    {renderNodes.map(node => {
                      const isCampus = isCampusView;
                      const name = node.name.toLowerCase();
                      const isMajorNode = isCampus || name.includes('entrance') || name.includes('corridor') || name.includes('elevator') || name.includes('lobby');
                      const isStart  = routeStartId === node.id;
                      const isEnd    = routeEndId === node.id;
                      const isInPath = calculatedPath.includes(node.id);
                      const isCurrentFloor = String(node.floor).trim() === String(currentFloor).trim();
                      const isXRay = !isCurrentFloor && isInPath;
                      const nodeOpacity = isXRay ? CONFIG.xrayOpacity : 1;

                      const transition = floorTransitions[node.id];
                      const showTransitionBadge = transition && isInPath && transition.targetFloor === String(currentFloor).trim();

                      let nodeColor = isMajorNode ? T.cyan : (isDarkMode ? `${T.cyan}99` : `${T.cyan}dd`);
                      let ringColor = null;
                      if (isStart)       { nodeColor = T.amber; ringColor = T.amber; }
                      else if (isEnd)    { nodeColor = T.red;   ringColor = T.red;   }
                      else if (isInPath) { nodeColor = T.amber; }

                      const isFestEvent = isEventMode && FEST_EVENTS[node.id];
                      const circleOpacity = isCampus ? '1' : T.nodeOpacity;

                      const rTerminal = isCampus ? 20 : 5;
                      const rMajor   = isCampus ? 11 : 3.2;
                      const rMinor   = isCampus ? 11 : 2.5;
                      const nodeRadius = (isStart || isEnd) ? rTerminal : (isMajorNode ? rMajor : rMinor);

                      const labelFontSize       = isCampus ? '22' : (isMajorNode ? '2.5' : '2.2');
                      const rectWidthMultiplier = isCampus ? 7.5 : 1.7;
                      const rectXOffset         = isCampus ? 3.75 : 0.85;
                      const rectHeight          = isCampus ? 20 : 5.5;
                      const yOffsetBox          = isCampus ? 35 : 9;
                      const yOffsetText         = isCampus ? 20 : 5.5;

                      return (
                        <g key={node.id} style={{ opacity: nodeOpacity }}>
                          <g className="map-node-interactive"
                            onClick={() => onNodeClick(node.id)}
                            onMouseEnter={() => setHoveredNodeId(node.id)}
                            onMouseLeave={() => setHoveredNodeId(null)}
                          >
                            {ringColor && (
                              <>
                                <circle cx={getX(node)} cy={getY(node)} r={isCampus ? '30' : '8'} fill="none" stroke={ringColor} strokeWidth={isCampus ? '2' : '0.5'} opacity="0.6" />
                                <circle cx={getX(node)} cy={getY(node)} r={isCampus ? '20' : '5'} fill={ringColor} opacity="0.3" filter="url(#node-glow)" />
                              </>
                            )}
                            {isFestEvent && (
                              <circle cx={getX(node)} cy={getY(node)} r={isCampus ? '40' : '12'} fill="none" stroke={FEST_EVENTS[node.id].color} strokeWidth={isCampus ? '3' : '1'} style={{ animation: 'festGlow 2s infinite' }} />
                            )}
                            <circle
                              cx={getX(node)} cy={getY(node)}
                              r={nodeRadius}
                              fill={isFestEvent ? FEST_EVENTS[node.id].color : nodeColor}
                              stroke={isDarkMode ? T.bg0 : T.bg1}
                              strokeWidth={isCampus ? '2' : '0.5'}
                              opacity={circleOpacity}
                              filter={isInPath ? 'url(#node-glow)' : undefined}
                            />

                            {/* Permanent labels (start/end/major/fest) */}
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

                            {/* Hover tooltip */}
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
                            <g className="transition-badge"
                              transform={`translate(${getX(node)}, ${getY(node) - (isCampus ? 60 : 16)})`}
                              onClick={() => setCurrentFloor(transition.actionFloor)}
                              style={{ cursor: 'pointer', pointerEvents: 'all' }}
                            >
                              <rect x={isCampus ? '-60' : '-18'} y={isCampus ? '-10' : '-3.5'} width={isCampus ? '120' : '36'} height={isCampus ? '20' : '7'} fill={T.cyanDim} rx={isCampus ? '2' : '1'} />
                              <text x="0" y="0" fontSize={isCampus ? '10' : '3'} fontWeight="800" textAnchor="middle" alignmentBaseline="middle" fill={isDarkMode ? T.bg0 : '#ffffff'} style={{ fontFamily: 'Share Tech Mono, monospace' }}>
                                {transition.text}
                              </text>
                            </g>
                          )}
                        </g>
                      );
                    })}
                  </svg>
                </TransformComponent>

                {/* Route legend overlay */}
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
                        <line x1="0" y1="4" x2="30" y2="4" stroke={T.green} strokeWidth="2.5" strokeLinecap="round" strokeDasharray="4 4" style={{ animation: 'dash 1s linear infinite' }} />
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

      {/* ── Status bar ── */}
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
              <button onClick={onCopyLink} style={{ background: copiedLink ? T.green : T.cyanGlow2, border: `1px solid ${copiedLink ? T.green : T.cyanDim}`, color: copiedLink ? (isDarkMode ? T.bg0 : '#ffffff') : T.cyan, padding: '4px 10px', borderRadius: '3px', cursor: 'pointer', fontFamily: "'Share Tech Mono', monospace", fontSize: '0.6rem', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold', marginLeft: '10px' }}>
                {copiedLink ? <Check size={12} /> : <Copy size={12} />} {copiedLink ? 'LINK COPIED' : 'SHARE ROUTE'}
              </button>
            )}
          </span>
        )}
      </div>
    </div>
  );
};

export default MapCanvas;