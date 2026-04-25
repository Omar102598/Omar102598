import { useState, useEffect, useMemo } from 'react';

const ROWS = 6;
const COLS = 9;
const WALLS = new Set(['1,3', '1,4', '1,5', '2,5', '3,5', '3,6', '3,7', '4,2', '4,3', '0,6', '0,7']);
const START_R = 0;
const START_C = 0;

type CellState = 'unvisited' | 'queued' | 'current' | 'visited' | 'wall' | 'start';

interface GridEvent {
  row: number;
  col: number;
  state: CellState;
  description: string;
}

const DIRS: [number, number][] = [[0, 1], [1, 0], [0, -1], [-1, 0]];

function generateBFSEvents(): GridEvent[] {
  const events: GridEvent[] = [];
  const visited = new Set<string>();
  const queue: [number, number][] = [[START_R, START_C]];
  let head = 0;
  visited.add(`${START_R},${START_C}`);

  events.push({ row: START_R, col: START_C, state: 'queued', description: 'Enqueue start node (0,0)' });

  while (head < queue.length) {
    const [r, c] = queue[head++]; // O(1) dequeue using head pointer
    events.push({ row: r, col: c, state: 'current', description: `Dequeue (${r},${c}) — explore all neighbors` });

    for (const [dr, dc] of DIRS) {
      const nr = r + dr;
      const nc = c + dc;
      const key = `${nr},${nc}`;
      if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && !visited.has(key) && !WALLS.has(key)) {
        visited.add(key);
        queue.push([nr, nc]);
        events.push({ row: nr, col: nc, state: 'queued', description: `Enqueue neighbor (${nr},${nc})` });
      }
    }
    events.push({ row: r, col: c, state: 'visited', description: `Mark (${r},${c}) as visited` });
  }
  return events;
}

function generateDFSEvents(): GridEvent[] {
  const events: GridEvent[] = [];
  const visited = new Set<string>();
  const stack: [number, number][] = [[START_R, START_C]];

  while (stack.length > 0) {
    const [r, c] = stack.pop()!;
    const key = `${r},${c}`;
    if (visited.has(key) || WALLS.has(key)) continue;
    visited.add(key);

    events.push({ row: r, col: c, state: 'current', description: `Pop (${r},${c}) from stack` });

    for (const [dr, dc] of [...DIRS].reverse()) {
      const nr = r + dr;
      const nc = c + dc;
      const nkey = `${nr},${nc}`;
      if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && !visited.has(nkey) && !WALLS.has(nkey)) {
        stack.push([nr, nc]);
        events.push({ row: nr, col: nc, state: 'queued', description: `Push (${nr},${nc}) to stack` });
      }
    }
    events.push({ row: r, col: c, state: 'visited', description: `Backtrack from (${r},${c})` });
  }
  return events;
}

const SPEEDS: Record<string, number> = { slow: 400, normal: 180, fast: 60 };

const ALGO_INFO = {
  bfs: {
    time: 'O(V + E)',
    space: 'O(V)',
    dataStructure: 'Queue (FIFO)',
    use: 'Shortest path in unweighted graphs, level-order traversal',
    key: 'Explores neighbors level-by-level before going deeper',
  },
  dfs: {
    time: 'O(V + E)',
    space: 'O(V)',
    dataStructure: 'Stack (LIFO) / Recursion',
    use: 'Cycle detection, topological sort, maze solving',
    key: 'Explores as deep as possible before backtracking',
  },
};

interface GridVizCoreProps {
  algo: 'bfs' | 'dfs';
}

function GridVizCore({ algo }: GridVizCoreProps) {
  const events = useMemo(() => (algo === 'bfs' ? generateBFSEvents() : generateDFSEvents()), [algo]);
  const [cellStates, setCellStates] = useState<Map<string, CellState>>(new Map());
  const [playing, setPlaying] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [description, setDescription] = useState('Press ▶ Play to start');
  const [speed, setSpeed] = useState<'slow' | 'normal' | 'fast'>('normal');

  const isDone = stepIdx >= events.length;

  useEffect(() => {
    if (!playing || isDone) return;
    const timer = setTimeout(() => {
      const ev = events[stepIdx];
      setCellStates((prev) => {
        const next = new Map(prev);
        next.set(`${ev.row},${ev.col}`, ev.state);
        return next;
      });
      const nextStep = stepIdx + 1;
      setStepIdx(nextStep);
      setDescription(nextStep >= events.length ? '✅ Traversal complete!' : ev.description);
      if (nextStep >= events.length) setPlaying(false);
    }, SPEEDS[speed]);
    return () => clearTimeout(timer);
  }, [playing, stepIdx, events, speed, isDone]);

  const getCellState = (r: number, c: number): CellState => {
    if (WALLS.has(`${r},${c}`)) return 'wall';
    if (r === START_R && c === START_C) {
      const s = cellStates.get(`${r},${c}`);
      return s === 'visited' ? 'visited' : s === 'current' ? 'current' : 'start';
    }
    return cellStates.get(`${r},${c}`) ?? 'unvisited';
  };

  const info = ALGO_INFO[algo];
  const progress = events.length > 0 ? Math.round((stepIdx / events.length) * 100) : 0;

  return (
    <div className="viz-inner">
      <div className="viz-description">
        <p className="viz-desc-text">{description}</p>
        <span className="viz-step-count">{stepIdx} / {events.length} steps</span>
      </div>

      <div className="grid-viz">
        {Array.from({ length: ROWS }, (_, r) => (
          <div key={r} className="grid-row">
            {Array.from({ length: COLS }, (_, c) => (
              <div key={c} className={`grid-cell cell-${getCellState(r, c)}`} />
            ))}
          </div>
        ))}
      </div>

      <div className="viz-progress-bar">
        <div className="viz-progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="viz-legend">
        {[
          { cls: 'cell-start', label: 'Start' },
          { cls: 'cell-queued', label: algo === 'bfs' ? 'In Queue' : 'In Stack' },
          { cls: 'cell-current', label: 'Current' },
          { cls: 'cell-visited', label: 'Visited' },
          { cls: 'cell-wall', label: 'Wall' },
          { cls: 'cell-unvisited', label: 'Unvisited' },
        ].map(({ cls, label }) => (
          <span key={cls} className="legend-item">
            <span className={`legend-dot ${cls}`} />
            {label}
          </span>
        ))}
      </div>

      <div className="viz-controls">
        <button
          className="viz-btn viz-btn-primary"
          onClick={() => setPlaying((p) => !p)}
          disabled={isDone}
        >
          {playing ? '⏸ Pause' : isDone ? '✅ Done' : stepIdx === 0 ? '▶ Play' : '▶ Resume'}
        </button>
        <button
          className="viz-btn"
          onClick={() => {
            setStepIdx(0);
            setPlaying(false);
            setCellStates(new Map());
            setDescription('Press ▶ Play to start');
          }}
        >
          ↺ Reset
        </button>
        <div className="viz-speed">
          <span>Speed:</span>
          {(['slow', 'normal', 'fast'] as const).map((s) => (
            <button
              key={s}
              className={`viz-speed-btn ${speed === s ? 'active' : ''}`}
              onClick={() => setSpeed(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="algo-info-box">
        <div className="algo-info-row">
          <div className="algo-info-item"><strong>⏱ Time:</strong> {info.time}</div>
          <div className="algo-info-item"><strong>💾 Space:</strong> {info.space}</div>
          <div className="algo-info-item"><strong>📦 Structure:</strong> {info.dataStructure}</div>
        </div>
        <div className="algo-info-desc">
          <strong>🔑 Key Insight:</strong> {info.key}
        </div>
        <div className="algo-info-desc">
          <strong>🎯 Use Cases:</strong> {info.use}
        </div>
      </div>
    </div>
  );
}

export function GridTraversalViz() {
  const [algo, setAlgo] = useState<'bfs' | 'dfs'>('bfs');

  return (
    <div className="viz-container">
      <div className="viz-algo-selector">
        <button
          className={`viz-algo-btn ${algo === 'bfs' ? 'active' : ''}`}
          onClick={() => setAlgo('bfs')}
        >
          BFS — Breadth-First Search
        </button>
        <button
          className={`viz-algo-btn ${algo === 'dfs' ? 'active' : ''}`}
          onClick={() => setAlgo('dfs')}
        >
          DFS — Depth-First Search
        </button>
      </div>
      <GridVizCore key={algo} algo={algo} />
    </div>
  );
}
