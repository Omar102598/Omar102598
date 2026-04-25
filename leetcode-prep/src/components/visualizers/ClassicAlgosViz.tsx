import { useState, useEffect, useMemo } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// KADANE'S ALGORITHM — Maximum Subarray
// ─────────────────────────────────────────────────────────────────────────────

const KADANE_ARRAY = [-2, 1, -3, 4, -1, 2, 1, -5, 4];

type KadaneState = 'default' | 'current' | 'in-window' | 'max-window';

interface KadaneFrame {
  states: KadaneState[];
  currentSum: number;
  maxSum: number;
  currentStart: number;
  currentEnd: number;
  maxStart: number;
  maxEnd: number;
  description: string;
}

function generateKadaneFrames(): KadaneFrame[] {
  const frames: KadaneFrame[] = [];
  const arr = KADANE_ARRAY;
  const n = arr.length;

  let maxEndingHere = arr[0];
  let maxSoFar = arr[0];
  let curStart = 0;
  let maxStart = 0;
  let maxEnd = 0;

  const mkStates = (cur: number, cs: number, ce: number, ms: number, me: number): KadaneState[] =>
    arr.map((_, i) => {
      if (i === cur) return 'current';
      if (i >= ms && i <= me) return 'max-window';
      if (i >= cs && i <= ce) return 'in-window';
      return 'default';
    });

  frames.push({
    states: arr.map((_, i) => (i === 0 ? 'current' : 'default')),
    currentSum: arr[0], maxSum: arr[0],
    currentStart: 0, currentEnd: 0, maxStart: 0, maxEnd: 0,
    description: `Initialize: currentSum = arr[0] = ${arr[0]}, maxSum = ${arr[0]}`,
  });

  for (let i = 1; i < n; i++) {
    const extendSum = maxEndingHere + arr[i];

    if (arr[i] > extendSum) {
      // Start fresh subarray at i
      maxEndingHere = arr[i];
      curStart = i;
    } else {
      maxEndingHere = extendSum;
    }

    const prevMax = maxSoFar;
    const prevMaxStart = maxStart;
    const prevMaxEnd = maxEnd;

    if (maxEndingHere > maxSoFar) {
      maxSoFar = maxEndingHere;
      maxStart = curStart;
      maxEnd = i;
    }

    const startedFresh = curStart === i;

    frames.push({
      states: mkStates(i, curStart, i, maxStart, maxEnd),
      currentSum: maxEndingHere, maxSum: maxSoFar,
      currentStart: curStart, currentEnd: i,
      maxStart, maxEnd,
      description: startedFresh
        ? `i=${i}: arr[i]=${arr[i]} > extend(${extendSum}) → start fresh here. currentSum=${maxEndingHere}`
          + (maxEndingHere > prevMax ? ` 🏆 New max! maxSum=${maxSoFar}` : '')
        : `i=${i}: arr[i]=${arr[i]}, extend → currentSum=${maxEndingHere} (prev ${maxEndingHere - arr[i]} + ${arr[i]})`
          + (maxEndingHere > prevMax ? ` 🏆 New max! maxSum=${maxSoFar} [${prevMaxStart}..${i}→${maxStart}..${maxEnd}]` : ''),
    });

    // Extra "new max" highlight frame
    if (maxEndingHere > prevMax) {
      frames.push({
        states: arr.map((_, j) => (j >= maxStart && j <= maxEnd ? 'max-window' : 'default')),
        currentSum: maxEndingHere, maxSum: maxSoFar,
        currentStart: maxStart, currentEnd: maxEnd,
        maxStart, maxEnd,
        description: `🏆 Max subarray updated: [${arr.slice(maxStart, maxEnd + 1).join(', ')}] = ${maxSoFar}`,
      });
    }
  }

  frames.push({
    states: arr.map((_, i) => (i >= maxStart && i <= maxEnd ? 'max-window' : 'default')),
    currentSum: maxSoFar, maxSum: maxSoFar,
    currentStart: maxStart, currentEnd: maxEnd,
    maxStart, maxEnd,
    description: `✅ Done! Max subarray = [${arr.slice(maxStart, maxEnd + 1).join(', ')}], sum = ${maxSoFar}`,
  });

  return frames;
}

const KADANE_SPEEDS: Record<string, number> = { slow: 1200, normal: 500, fast: 150 };

function KadanesViz() {
  const frames = useMemo(generateKadaneFrames, []);
  const [frameIdx, setFrameIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<'slow' | 'normal' | 'fast'>('normal');

  const isDone = frameIdx >= frames.length - 1;
  const current = frames[Math.min(frameIdx, frames.length - 1)];
  const progress = frames.length > 1 ? Math.round((frameIdx / (frames.length - 1)) * 100) : 0;

  useEffect(() => {
    if (!playing || isDone) return;
    const t = setTimeout(() => {
      const next = frameIdx + 1;
      setFrameIdx(next);
      if (next >= frames.length - 1) setPlaying(false);
    }, KADANE_SPEEDS[speed]);
    return () => clearTimeout(t);
  }, [playing, frameIdx, frames, speed, isDone]);

  const cellClass = (s: KadaneState) => {
    switch (s) {
      case 'current':    return 'kadane-current';
      case 'in-window':  return 'kadane-in-window';
      case 'max-window': return 'kadane-max-window';
      default:           return 'kadane-default';
    }
  };

  return (
    <div className="viz-inner">
      <div className="kadane-stats">
        <div className="kadane-stat">
          <span className="kadane-stat-label">Current sum</span>
          <span className={`kadane-stat-val ${current.currentSum < 0 ? 'kadane-neg' : 'kadane-pos'}`}>
            {current.currentSum}
          </span>
        </div>
        <div className="kadane-stat">
          <span className="kadane-stat-label">Max sum (global)</span>
          <span className="kadane-stat-val kadane-max">{current.maxSum}</span>
        </div>
      </div>

      <div className="viz-description">
        <p className="viz-desc-text">{current.description}</p>
        <span className="viz-step-count">{frameIdx} / {frames.length - 1} steps</span>
      </div>

      <div className="bsearch-array-wrap">
        <div className="bsearch-array">
          {KADANE_ARRAY.map((val, i) => (
            <div key={i} className="bsearch-cell-wrap">
              <div className={`bsearch-cell ${cellClass(current.states[i])}`}>{val}</div>
              <div className="bsearch-index">{i}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="viz-progress-bar">
        <div className="viz-progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="viz-legend">
        {[
          { cls: 'kadane-current',    label: 'Current element' },
          { cls: 'kadane-in-window',  label: 'Current window' },
          { cls: 'kadane-max-window', label: 'Max subarray' },
          { cls: 'kadane-default',    label: 'Unused' },
        ].map(({ cls, label }) => (
          <span key={cls} className="legend-item">
            <span className={`legend-dot ${cls}`} />
            {label}
          </span>
        ))}
      </div>

      <div className="viz-controls">
        <button className="viz-btn viz-btn-primary" onClick={() => setPlaying((p) => !p)} disabled={isDone}>
          {playing ? '⏸ Pause' : isDone ? '✅ Done' : frameIdx === 0 ? '▶ Play' : '▶ Resume'}
        </button>
        <button className="viz-btn" onClick={() => { setFrameIdx(0); setPlaying(false); }}>↺ Reset</button>
        <div className="viz-speed">
          <span>Speed:</span>
          {(['slow', 'normal', 'fast'] as const).map((s) => (
            <button key={s} className={`viz-speed-btn ${speed === s ? 'active' : ''}`} onClick={() => setSpeed(s)}>{s}</button>
          ))}
        </div>
      </div>

      <div className="algo-info-box">
        <div className="algo-info-row">
          <div className="algo-info-item"><strong>⏱ Time:</strong> O(n)</div>
          <div className="algo-info-item"><strong>💾 Space:</strong> O(1)</div>
          <div className="algo-info-item"><strong>📋 Array:</strong> [{KADANE_ARRAY.join(', ')}]</div>
        </div>
        <div className="algo-info-desc">
          <strong>🔑 Key Insight:</strong> At each element decide: <em>extend</em> the current subarray (add element) or <em>restart</em> from this element — whichever is larger. Track the global maximum across all these decisions.
        </div>
        <div className="algo-info-desc">
          <strong>🎯 Use Cases:</strong> Maximum profit in stock prices, max rainfall window, any "best contiguous subarray" problem (LeetCode #53)
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DIJKSTRA'S ALGORITHM — Shortest Path
// ─────────────────────────────────────────────────────────────────────────────

// 5-node undirected weighted graph
// Nodes: A(0) B(1) C(2) D(3) E(4)
// Edges: A-B(4), A-C(2), B-C(1), B-D(5), C-D(8), C-E(10), D-E(2)
//
// Shortest paths from A:
//   A→A: 0
//   A→C: 2
//   A→C→B: 3
//   A→C→B→D: 8
//   A→C→B→D→E: 10

const DIJK_NODE_LABELS = ['A', 'B', 'C', 'D', 'E'];
const DIJK_EDGES: { from: number; to: number; weight: number }[] = [
  { from: 0, to: 1, weight: 4 },
  { from: 0, to: 2, weight: 2 },
  { from: 1, to: 2, weight: 1 },
  { from: 1, to: 3, weight: 5 },
  { from: 2, to: 3, weight: 8 },
  { from: 2, to: 4, weight: 10 },
  { from: 3, to: 4, weight: 2 },
];

// SVG layout (viewBox "0 0 380 220")
const DIJK_NODE_XY: [number, number][] = [
  [60, 110],  // A
  [180, 40],  // B
  [180, 180], // C
  [320, 40],  // D
  [320, 180], // E
];
const DIJK_R = 22;

type DijkNodeState = 'default' | 'current' | 'settled' | 'tentative';
type DijkEdgeState = 'default' | 'relaxing' | 'settled';

interface DijkFrame {
  nodeStates: DijkNodeState[];
  dist: number[];     // Infinity for unreached
  prev: (number | null)[];
  description: string;
  relaxedEdge: [number, number] | null;
}

const INF = Infinity;

function generateDijkstraFrames(): DijkFrame[] {
  const frames: DijkFrame[] = [];
  const n = DIJK_NODE_LABELS.length;

  // Build adjacency list
  const adj: { to: number; w: number }[][] = Array.from({ length: n }, () => []);
  DIJK_EDGES.forEach(({ from, to, weight }) => {
    adj[from].push({ to, w: weight });
    adj[to].push({ to: from, w: weight });
  });

  const dist = Array(n).fill(INF);
  const prev: (number | null)[] = Array(n).fill(null);
  const settled = new Set<number>();
  dist[0] = 0;

  const mkNodeStates = (current: number): DijkNodeState[] =>
    DIJK_NODE_LABELS.map((_, i) => {
      if (i === current) return 'current';
      if (settled.has(i)) return 'settled';
      if (dist[i] < INF) return 'tentative';
      return 'default';
    });

  frames.push({
    nodeStates: DIJK_NODE_LABELS.map((_, i) => (i === 0 ? 'tentative' : 'default')),
    dist: [...dist], prev: [...prev],
    description: `Initialize: dist[A]=0, all others=∞. Source is node A.`,
    relaxedEdge: null,
  });

  for (let iter = 0; iter < n; iter++) {
    // Pick unvisited node with min dist
    let u = -1;
    for (let i = 0; i < n; i++) {
      if (!settled.has(i) && dist[i] < INF) {
        if (u === -1 || dist[i] < dist[u]) u = i;
      }
    }
    if (u === -1) break;

    frames.push({
      nodeStates: mkNodeStates(u),
      dist: [...dist], prev: [...prev],
      description: `Pick min-dist unvisited node: ${DIJK_NODE_LABELS[u]} (dist=${dist[u]}). Settle it and relax edges.`,
      relaxedEdge: null,
    });

    settled.add(u);

    // Relax neighbors
    for (const { to: v, w } of adj[u]) {
      if (settled.has(v)) continue;
      const newDist = dist[u] + w;

      frames.push({
        nodeStates: mkNodeStates(u),
        dist: [...dist], prev: [...prev],
        description: `Relax edge ${DIJK_NODE_LABELS[u]}→${DIJK_NODE_LABELS[v]} (weight ${w}): ${dist[u]}+${w}=${newDist} ${newDist < dist[v] ? `< current dist[${DIJK_NODE_LABELS[v]}]=${dist[v] === INF ? '∞' : dist[v]} → update!` : `≥ dist[${DIJK_NODE_LABELS[v]}]=${dist[v]} → no update`}`,
        relaxedEdge: [u, v],
      });

      if (newDist < dist[v]) {
        dist[v] = newDist;
        prev[v] = u;
        frames.push({
          nodeStates: mkNodeStates(u),
          dist: [...dist], prev: [...prev],
          description: `✅ Updated dist[${DIJK_NODE_LABELS[v]}] = ${newDist}`,
          relaxedEdge: [u, v],
        });
      }
    }

    frames.push({
      nodeStates: DIJK_NODE_LABELS.map((_, i) => {
        if (settled.has(i)) return 'settled';
        if (dist[i] < INF) return 'tentative';
        return 'default';
      }),
      dist: [...dist], prev: [...prev],
      description: `Node ${DIJK_NODE_LABELS[u]} fully settled. Settled: {${[...settled].map((s) => DIJK_NODE_LABELS[s]).join(', ')}}`,
      relaxedEdge: null,
    });
  }

  // Build path descriptions
  const pathStr = DIJK_NODE_LABELS.map((label, i) => {
    if (dist[i] === INF) return `${label}: unreachable`;
    const path: string[] = [];
    let cur: number | null = i;
    while (cur !== null) { path.unshift(DIJK_NODE_LABELS[cur]); cur = prev[cur]; }
    return `${label}: ${path.join('→')} (${dist[i]})`;
  }).join(' | ');

  frames.push({
    nodeStates: Array(n).fill('settled'),
    dist: [...dist], prev: [...prev],
    description: `✅ Dijkstra complete! Shortest paths from A: ${pathStr}`,
    relaxedEdge: null,
  });

  return frames;
}

// ─── SVG graph renderer ───────────────────────────────────────────────────────

const DIJK_NODE_FILL: Record<DijkNodeState, string> = {
  default:   'var(--bg-secondary)',
  tentative: '#3b82f6',
  current:   '#f59e0b',
  settled:   '#22c55e',
};
const DIJK_NODE_STROKE: Record<DijkNodeState, string> = {
  default:   'var(--border)',
  tentative: '#3b82f6',
  current:   '#f59e0b',
  settled:   '#22c55e',
};
const DIJK_NODE_TEXT: Record<DijkNodeState, string> = {
  default: 'var(--text-secondary)',
  tentative: '#fff',
  current: '#fff',
  settled: '#fff',
};

function getEdgeState(from: number, to: number, relaxedEdge: [number, number] | null, settled: Set<number>): DijkEdgeState {
  if (relaxedEdge && ((relaxedEdge[0] === from && relaxedEdge[1] === to) || (relaxedEdge[0] === to && relaxedEdge[1] === from))) return 'relaxing';
  if (settled.has(from) && settled.has(to)) return 'settled';
  return 'default';
}

function DijkstraSVG({ frame }: { frame: DijkFrame }) {
  const settled = new Set(
    frame.nodeStates.map((s, i) => (s === 'settled' ? i : -1)).filter((i) => i !== -1)
  );

  // Midpoint for edge weight labels
  const edgeMid = (from: number, to: number): [number, number] => [
    (DIJK_NODE_XY[from][0] + DIJK_NODE_XY[to][0]) / 2,
    (DIJK_NODE_XY[from][1] + DIJK_NODE_XY[to][1]) / 2,
  ];

  return (
    <svg viewBox="0 0 380 220" className="dijkstra-svg" aria-label="Dijkstra graph" role="img">
      {/* Edges */}
      {DIJK_EDGES.map(({ from, to, weight }) => {
        const state = getEdgeState(from, to, frame.relaxedEdge, settled);
        const stroke = state === 'relaxing' ? '#f59e0b' : state === 'settled' ? '#22c55e' : 'var(--border-light)';
        const sw = state !== 'default' ? 2.5 : 1.5;
        const [mx, my] = edgeMid(from, to);
        return (
          <g key={`${from}-${to}`}>
            <line
              x1={DIJK_NODE_XY[from][0]} y1={DIJK_NODE_XY[from][1]}
              x2={DIJK_NODE_XY[to][0]}   y2={DIJK_NODE_XY[to][1]}
              stroke={stroke}
              strokeWidth={sw}
              style={{ transition: 'stroke 0.25s ease' }}
            />
            <rect x={mx - 10} y={my - 9} width={20} height={16} rx={3} fill="var(--bg-primary)" />
            <text x={mx} y={my + 1} textAnchor="middle" dominantBaseline="central" fontSize="11" fill={state === 'relaxing' ? '#f59e0b' : 'var(--text-secondary)'} fontWeight="600">
              {weight}
            </text>
          </g>
        );
      })}

      {/* Nodes */}
      {DIJK_NODE_LABELS.map((label, i) => {
        const [x, y] = DIJK_NODE_XY[i];
        const s = frame.nodeStates[i];
        const distVal = frame.dist[i];
        return (
          <g key={i}>
            <circle
              cx={x} cy={y} r={DIJK_R}
              fill={DIJK_NODE_FILL[s]}
              stroke={DIJK_NODE_STROKE[s]}
              strokeWidth="2.5"
              style={{ transition: 'fill 0.25s ease, stroke 0.25s ease' }}
            />
            <text x={x} y={y - 3} textAnchor="middle" dominantBaseline="central" fill={DIJK_NODE_TEXT[s]} fontSize="14" fontWeight="700" style={{ userSelect: 'none' }}>
              {label}
            </text>
            <text x={x} y={y + 11} textAnchor="middle" dominantBaseline="central" fill={DIJK_NODE_TEXT[s]} fontSize="10" style={{ userSelect: 'none' }}>
              {distVal === INF ? '∞' : distVal}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function DistanceTable({ frame }: { frame: DijkFrame }) {
  return (
    <div className="dijkstra-table-wrap">
      <table className="dijkstra-table">
        <thead>
          <tr>
            <th>Node</th>
            {DIJK_NODE_LABELS.map((l) => <th key={l}>{l}</th>)}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Dist</td>
            {frame.dist.map((d, i) => (
              <td key={i} className={`dijkstra-td ${frame.nodeStates[i] === 'settled' ? 'dijkstra-td-settled' : frame.nodeStates[i] === 'current' ? 'dijkstra-td-current' : ''}`}>
                {d === INF ? '∞' : d}
              </td>
            ))}
          </tr>
          <tr>
            <td>Via</td>
            {frame.prev.map((p, i) => (
              <td key={i}>{p !== null ? DIJK_NODE_LABELS[p] : '—'}</td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

const DIJK_SPEEDS: Record<string, number> = { slow: 1200, normal: 500, fast: 150 };

function DijkstraViz() {
  const frames = useMemo(generateDijkstraFrames, []);
  const [frameIdx, setFrameIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<'slow' | 'normal' | 'fast'>('normal');

  const isDone = frameIdx >= frames.length - 1;
  const current = frames[Math.min(frameIdx, frames.length - 1)];
  const progress = frames.length > 1 ? Math.round((frameIdx / (frames.length - 1)) * 100) : 0;

  useEffect(() => {
    if (!playing || isDone) return;
    const t = setTimeout(() => {
      const next = frameIdx + 1;
      setFrameIdx(next);
      if (next >= frames.length - 1) setPlaying(false);
    }, DIJK_SPEEDS[speed]);
    return () => clearTimeout(t);
  }, [playing, frameIdx, frames, speed, isDone]);

  return (
    <div className="viz-inner">
      <div className="viz-description">
        <p className="viz-desc-text">{current.description}</p>
        <span className="viz-step-count">{frameIdx} / {frames.length - 1} steps</span>
      </div>

      <div className="dijkstra-svg-wrap">
        <DijkstraSVG frame={current} />
      </div>

      <DistanceTable frame={current} />

      <div className="viz-progress-bar">
        <div className="viz-progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="viz-legend">
        {[
          { color: '#f59e0b', label: 'Current (processing)' },
          { color: '#22c55e', label: 'Settled (shortest found)' },
          { color: '#3b82f6', label: 'Tentative (dist known)' },
          { color: 'var(--bg-secondary)', label: 'Unvisited (∞)', border: '1px solid var(--border)' },
        ].map(({ color, label, border }) => (
          <span key={label} className="legend-item">
            <span className="legend-dot" style={{ background: color, border: border ?? 'none' }} />
            {label}
          </span>
        ))}
      </div>

      <div className="viz-controls">
        <button className="viz-btn viz-btn-primary" onClick={() => setPlaying((p) => !p)} disabled={isDone}>
          {playing ? '⏸ Pause' : isDone ? '✅ Done' : frameIdx === 0 ? '▶ Play' : '▶ Resume'}
        </button>
        <button className="viz-btn" onClick={() => { setFrameIdx(0); setPlaying(false); }}>↺ Reset</button>
        <div className="viz-speed">
          <span>Speed:</span>
          {(['slow', 'normal', 'fast'] as const).map((s) => (
            <button key={s} className={`viz-speed-btn ${speed === s ? 'active' : ''}`} onClick={() => setSpeed(s)}>{s}</button>
          ))}
        </div>
      </div>

      <div className="algo-info-box">
        <div className="algo-info-row">
          <div className="algo-info-item"><strong>⏱ Time:</strong> O((V+E) log V) with min-heap</div>
          <div className="algo-info-item"><strong>💾 Space:</strong> O(V)</div>
          <div className="algo-info-item"><strong>⚠️ Requires:</strong> Non-negative edge weights</div>
        </div>
        <div className="algo-info-desc">
          <strong>🔑 Key Insight:</strong> Greedily settle the unvisited node with the smallest known distance — once settled, that distance is final. Relax all outgoing edges to potentially improve neighbors' distances.
        </div>
        <div className="algo-info-desc">
          <strong>🎯 Use Cases:</strong> GPS navigation, network routing (OSPF), shortest path in maps, game pathfinding (A* is an informed variant)
        </div>
      </div>
    </div>
  );
}

// ─── Exported component ───────────────────────────────────────────────────────

type ClassicAlgo = 'kadane' | 'dijkstra';

export function ClassicAlgosViz() {
  const [algo, setAlgo] = useState<ClassicAlgo>('kadane');

  return (
    <div className="viz-container">
      <div className="viz-algo-selector">
        <button className={`viz-algo-btn ${algo === 'kadane' ? 'active' : ''}`} onClick={() => setAlgo('kadane')}>
          Kadane's Algorithm
        </button>
        <button className={`viz-algo-btn ${algo === 'dijkstra' ? 'active' : ''}`} onClick={() => setAlgo('dijkstra')}>
          Dijkstra's Algorithm
        </button>
      </div>
      {algo === 'kadane' ? <KadanesViz key="kadane" /> : <DijkstraViz key="dijkstra" />}
    </div>
  );
}
