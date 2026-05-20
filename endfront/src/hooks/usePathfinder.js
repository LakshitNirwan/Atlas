import { useState, useEffect, useMemo } from 'react';

/**
 * usePathfinder
 * Runs Dijkstra's algorithm whenever routeStartId, routeEndId, or mapData changes.
 * Also computes floor-transition badges for the calculated path.
 */
const usePathfinder = (mapData, routeStartId, routeEndId, setCurrentFloor) => {
  const [calculatedPath, setCalculatedPath] = useState([]);

  useEffect(() => {
    if (!mapData || !routeStartId || !routeEndId) { setCalculatedPath([]); return; }

    // Build adjacency list
    const adjacencyList = {};
    mapData.nodes.forEach(n => { adjacencyList[n.id] = []; });
    mapData.edges.forEach(edge => {
      const n1 = mapData.nodes.find(n => n.id === edge.source_node);
      const n2 = mapData.nodes.find(n => n.id === edge.target_node);
      if (!n1 || !n2) return;
      let dist = Math.sqrt(Math.pow(n1.pos_x - n2.pos_x, 2) + Math.pow(n1.pos_y - n2.pos_y, 2));
      if (String(n1.floor).trim() !== String(n2.floor).trim()) {
        const isElevatorOrStair =
          n1.name.toLowerCase().includes('elevator') || n2.name.toLowerCase().includes('elevator') ||
          n1.name.toLowerCase().includes('stair')    || n2.name.toLowerCase().includes('stair')    ||
          n1.name.toLowerCase().includes('lobby')    || n2.name.toLowerCase().includes('lobby')    ||
          n1.floor === 'All' || n2.floor === 'All';
        dist += isElevatorOrStair ? 50 : 10000;
      }
      adjacencyList[n1.id].push({ node: n2.id, weight: dist });
      adjacencyList[n2.id].push({ node: n1.id, weight: dist });
    });

    // Dijkstra
    const distances = {};
    const previous  = {};
    const unvisited = new Set(mapData.nodes.map(n => n.id));
    mapData.nodes.forEach(n => { distances[n.id] = Infinity; });
    distances[routeStartId] = 0;

    while (unvisited.size > 0) {
      let currNode = null, minDist = Infinity;
      unvisited.forEach(id => { if (distances[id] < minDist) { minDist = distances[id]; currNode = id; } });
      if (!currNode || currNode === routeEndId) break;
      unvisited.delete(currNode);
      adjacencyList[currNode].forEach(neighbor => {
        if (!unvisited.has(neighbor.node)) return;
        const newDist = distances[currNode] + neighbor.weight;
        if (newDist < distances[neighbor.node]) { distances[neighbor.node] = newDist; previous[neighbor.node] = currNode; }
      });
    }

    if (distances[routeEndId] === Infinity) { setCalculatedPath([]); return; }

    // Reconstruct path
    const path = [];
    let curr = routeEndId;
    while (curr) { path.unshift(curr); curr = previous[curr]; }
    setCalculatedPath(path);

    // Jump camera to start node's floor
    const startNodeData = mapData.nodes.find(n => n.id === routeStartId);
    if (startNodeData?.floor) setCurrentFloor(String(startNodeData.floor).trim());
  }, [routeStartId, routeEndId, mapData]);

  // Floor-transition badges
  const floorTransitions = useMemo(() => {
    const transitions = {};
    if (!mapData || calculatedPath.length === 0) return transitions;

    const getFloorVal = (f) => String(f).trim() === 'G' ? 0 : parseInt(String(f).trim() || 0);
    let entryNode = null;

    for (let i = 0; i < calculatedPath.length - 1; i++) {
      const curr = mapData.nodes.find(n => n.id === calculatedPath[i]);
      const next = mapData.nodes.find(n => n.id === calculatedPath[i + 1]);
      if (!curr || !next) continue;
      if (String(curr.floor).trim() !== String(next.floor).trim()) {
        if (!entryNode) entryNode = curr;
        const nextNext = calculatedPath[i + 2] ? mapData.nodes.find(n => n.id === calculatedPath[i + 2]) : null;
        const isSteppingOut = !nextNext || String(nextNext.floor).trim() === String(next.floor).trim();
        if (isSteppingOut) {
          const direction = getFloorVal(next.floor) > getFloorVal(entryNode.floor) ? '⬆ UP' : '⬇ DOWN';
          transitions[entryNode.id] = { type: 'departure', text: `${direction} TO FL ${next.floor}`,   targetFloor: String(entryNode.floor).trim(), actionFloor: String(next.floor).trim() };
          transitions[next.id]      = { type: 'arrival',   text: `ARRIVED FROM FL ${entryNode.floor}`, targetFloor: String(next.floor).trim(),    actionFloor: String(entryNode.floor).trim() };
          entryNode = null;
        }
      }
    }
    return transitions;
  }, [calculatedPath, mapData]);

  return { calculatedPath, setCalculatedPath, floorTransitions };
};

export default usePathfinder;