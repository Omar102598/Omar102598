import { useState, useEffect, useMemo } from 'react';

// ─── Tree constants ───────────────────────────────────────────────────────────
//
//           1 (idx 0)
//          / \
//       2     3  (idx 1, 2)
//      / \   / \
//     4   5 6   7  (idx 3, 4, 5, 6)

const TREE_VALUES = [1, 2, 3, 4, 5, 6, 7];
const N = TREE_VALUES.length;
const LEFT_CHILD  = [1, 3, 5, -1, -1, -1, -1];
const RIGHT_CHILD = [2, 4, 6, -1, -1, -1, -1];

// SVG layout  (viewBox "0 0 400 210")
const R = 20; // node radius
const NODE_XY: [number, number][] = [
  [200, 32],  // 0 → val 1 (root)
  [105, 100], // 1 → val 2
  [295, 100], // 2 → val 3
  [55,  168], // 3 → val 4
  [155, 168], // 4 → val 5
  [245, 168], // 5 → val 6
  [345, 168], // 6 → val 7
];
const TREE_EDGES: [number, number][] = [
  [0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6],
];

type NodeState = 'default' | 'current' | 'visited' | 'queued';

interface TreeFrame {
  states: NodeState[];
  description: string;
  result: number[];
}

// ─── Frame generators ─────────────────────────────────────────────────────────

function allDefault(): NodeState[] { return Array(N).fill('default'); }

function stateMap(current: number, visited: Set<number>, queued?: Set<number>): NodeState[] {
  return TREE_VALUES.map((_, i) => {
    if (i === current) return 'current';
    if (visited.has(i)) return 'visited';
    if (queued?.has(i)) return 'queued';
    return 'default';
  });
}

function visitedMap(visited: Set<number>): NodeState[] {
  return TREE_VALUES.map((_, i) => (visited.has(i) ? 'visited' : 'default'));
}

function generateInorderFrames(): TreeFrame[] {
  const frames: TreeFrame[] = [];
  const visited = new Set<number>();
  const result: number[] = [];

  frames.push({ states: allDefault(), description: 'Inorder: Left → Root → Right. Press ▶ to begin.', result: [] });

  function inorder(node: number) {
    if (node === -1) return;

    // Arrive at node
    frames.push({
      states: stateMap(node, visited),
      description: LEFT_CHILD[node] !== -1
        ? `At node ${TREE_VALUES[node]}: go LEFT first (to node ${TREE_VALUES[LEFT_CHILD[node]]})`
        : `At node ${TREE_VALUES[node]}: leaf — no left child, visit now`,
      result: [...result],
    });

    inorder(LEFT_CHILD[node]);

    // Visit (output)
    result.push(TREE_VALUES[node]);
    visited.add(node);
    frames.push({
      states: visitedMap(visited),
      description: `✅ Visit node ${TREE_VALUES[node]} → Output: [${result.join(', ')}]`
        + (RIGHT_CHILD[node] !== -1 ? `, then go RIGHT (to node ${TREE_VALUES[RIGHT_CHILD[node]]})` : ''),
      result: [...result],
    });

    inorder(RIGHT_CHILD[node]);
  }

  inorder(0);

  frames.push({ states: Array(N).fill('visited'), description: `✅ Inorder complete! Output: [${result.join(', ')}]`, result: [...result] });
  return frames;
}

function generatePreorderFrames(): TreeFrame[] {
  const frames: TreeFrame[] = [];
  const visited = new Set<number>();
  const result: number[] = [];

  frames.push({ states: allDefault(), description: 'Preorder: Root → Left → Right. Press ▶ to begin.', result: [] });

  function preorder(node: number) {
    if (node === -1) return;

    // Visit immediately upon arrival
    result.push(TREE_VALUES[node]);
    visited.add(node);
    frames.push({
      states: visitedMap(visited),
      description: `✅ Visit node ${TREE_VALUES[node]} first → Output: [${result.join(', ')}]`
        + (LEFT_CHILD[node] !== -1 ? `, then go LEFT` : RIGHT_CHILD[node] !== -1 ? `, then go RIGHT` : ''),
      result: [...result],
    });

    if (LEFT_CHILD[node] !== -1) {
      frames.push({
        states: stateMap(LEFT_CHILD[node], visited),
        description: `Go LEFT from node ${TREE_VALUES[node]} → arrive at node ${TREE_VALUES[LEFT_CHILD[node]]}`,
        result: [...result],
      });
    }
    preorder(LEFT_CHILD[node]);

    if (RIGHT_CHILD[node] !== -1) {
      frames.push({
        states: stateMap(RIGHT_CHILD[node], visited),
        description: `Go RIGHT from node ${TREE_VALUES[node]} → arrive at node ${TREE_VALUES[RIGHT_CHILD[node]]}`,
        result: [...result],
      });
    }
    preorder(RIGHT_CHILD[node]);
  }

  preorder(0);

  frames.push({ states: Array(N).fill('visited'), description: `✅ Preorder complete! Output: [${result.join(', ')}]`, result: [...result] });
  return frames;
}

function generatePostorderFrames(): TreeFrame[] {
  const frames: TreeFrame[] = [];
  const visited = new Set<number>();
  const result: number[] = [];

  frames.push({ states: allDefault(), description: 'Postorder: Left → Right → Root. Press ▶ to begin.', result: [] });

  function postorder(node: number) {
    if (node === -1) return;

    frames.push({
      states: stateMap(node, visited),
      description: LEFT_CHILD[node] !== -1
        ? `At node ${TREE_VALUES[node]}: go LEFT first (visit children before root)`
        : `At node ${TREE_VALUES[node]}: leaf — no children, will visit now`,
      result: [...result],
    });

    postorder(LEFT_CHILD[node]);

    if (RIGHT_CHILD[node] !== -1) {
      frames.push({
        states: stateMap(RIGHT_CHILD[node], visited),
        description: `Node ${TREE_VALUES[node]}: left done, go RIGHT (to node ${TREE_VALUES[RIGHT_CHILD[node]]})`,
        result: [...result],
      });
    }

    postorder(RIGHT_CHILD[node]);

    // Visit after both subtrees
    result.push(TREE_VALUES[node]);
    visited.add(node);
    frames.push({
      states: visitedMap(visited),
      description: `✅ Visit node ${TREE_VALUES[node]} (both subtrees done) → Output: [${result.join(', ')}]`,
      result: [...result],
    });
  }

  postorder(0);

  frames.push({ states: Array(N).fill('visited'), description: `✅ Postorder complete! Output: [${result.join(', ')}]`, result: [...result] });
  return frames;
}

function generateLevelOrderFrames(): TreeFrame[] {
  const frames: TreeFrame[] = [];
  const visited = new Set<number>();
  const result: number[] = [];
  const queue: number[] = [0];
  const queued = new Set<number>([0]);

  frames.push({
    states: TREE_VALUES.map((_, i) => (i === 0 ? 'queued' : 'default')),
    description: 'Level-order (BFS): process nodes level by level using a queue. Root enqueued.',
    result: [],
  });

  while (queue.length > 0) {
    const node = queue.shift()!;
    queued.delete(node);

    result.push(TREE_VALUES[node]);
    visited.add(node);

    const children: number[] = [];
    if (LEFT_CHILD[node] !== -1) children.push(LEFT_CHILD[node]);
    if (RIGHT_CHILD[node] !== -1) children.push(RIGHT_CHILD[node]);
    children.forEach((c) => { queue.push(c); queued.add(c); });

    frames.push({
      states: TREE_VALUES.map((_, i) => {
        if (visited.has(i)) return 'visited';
        if (queued.has(i)) return 'queued';
        return 'default';
      }),
      description: `Dequeue node ${TREE_VALUES[node]} → Output: [${result.join(', ')}]`
        + (children.length > 0 ? `. Enqueue children [${children.map((c) => TREE_VALUES[c]).join(', ')}]. Queue: [${queue.map((q) => TREE_VALUES[q]).join(', ')}]` : '. Queue empty.'),
      result: [...result],
    });
  }

  frames.push({ states: Array(N).fill('visited'), description: `✅ Level-order complete! Output: [${result.join(', ')}]`, result: [...result] });
  return frames;
}

// ─── SVG tree renderer ────────────────────────────────────────────────────────

const NODE_FILL: Record<NodeState, string> = {
  default: 'var(--bg-secondary)',
  current: '#ef4444',
  visited: '#22c55e',
  queued:  '#3b82f6',
};
const NODE_STROKE: Record<NodeState, string> = {
  default: 'var(--border)',
  current: '#ef4444',
  visited: '#22c55e',
  queued:  '#3b82f6',
};
const NODE_TEXT: Record<NodeState, string> = {
  default: 'var(--text-secondary)',
  current: '#fff',
  visited: '#fff',
  queued:  '#fff',
};

function TreeSVG({ states }: { states: NodeState[] }) {
  return (
    <svg
      viewBox="0 0 400 210"
      className="tree-svg"
      aria-label="Binary tree visualization"
      role="img"
    >
      {TREE_EDGES.map(([from, to]) => (
        <line
          key={`e-${from}-${to}`}
          x1={NODE_XY[from][0]} y1={NODE_XY[from][1]}
          x2={NODE_XY[to][0]}   y2={NODE_XY[to][1]}
          stroke="var(--border-light)"
          strokeWidth="2"
        />
      ))}
      {TREE_VALUES.map((val, i) => {
        const [x, y] = NODE_XY[i];
        const s = states[i];
        return (
          <g key={i}>
            <circle
              cx={x} cy={y} r={R}
              fill={NODE_FILL[s]}
              stroke={NODE_STROKE[s]}
              strokeWidth="2.5"
              style={{ transition: 'fill 0.25s ease, stroke 0.25s ease' }}
            />
            <text
              x={x} y={y}
              textAnchor="middle"
              dominantBaseline="central"
              fill={NODE_TEXT[s]}
              fontSize="13"
              fontWeight="700"
              style={{ transition: 'fill 0.25s ease', userSelect: 'none' }}
            >
              {val}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── Algo info ────────────────────────────────────────────────────────────────

type TraversalAlgo = 'inorder' | 'preorder' | 'postorder' | 'levelorder';

const ALGO_INFO: Record<TraversalAlgo, { time: string; space: string; order: string; use: string; key: string }> = {
  inorder: {
    time: 'O(n)', space: 'O(h) — call stack depth (h = tree height)',
    order: 'Left → Root → Right',
    use: 'BST inorder gives sorted output; expression tree evaluation',
    key: 'For a BST, inorder traversal produces elements in ascending order',
  },
  preorder: {
    time: 'O(n)', space: 'O(h)',
    order: 'Root → Left → Right',
    use: 'Serialize / clone a tree; prefix expression evaluation',
    key: 'Root is visited before its subtrees — useful to reconstruct the tree from a serialized form',
  },
  postorder: {
    time: 'O(n)', space: 'O(h)',
    order: 'Left → Right → Root',
    use: 'Delete a tree safely; evaluate postfix expressions; directory size',
    key: 'Children are always processed before their parent — safe for deletion or accumulation',
  },
  levelorder: {
    time: 'O(n)', space: 'O(w) — max queue width (w = max nodes in any level)',
    order: 'Level by level (BFS)',
    use: 'Shortest path in unweighted tree; level-by-level processing; min-depth',
    key: 'Uses a queue (FIFO) — closest nodes are always processed before deeper ones',
  },
};

const SPEEDS: Record<string, number> = { slow: 900, normal: 400, fast: 120 };

// ─── Core visualizer ─────────────────────────────────────────────────────────

function TreeVizCore({ algo }: { algo: TraversalAlgo }) {
  const frames = useMemo(() => {
    switch (algo) {
      case 'inorder':    return generateInorderFrames();
      case 'preorder':   return generatePreorderFrames();
      case 'postorder':  return generatePostorderFrames();
      case 'levelorder': return generateLevelOrderFrames();
    }
  }, [algo]);

  const [frameIdx, setFrameIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<'slow' | 'normal' | 'fast'>('normal');

  const isDone = frameIdx >= frames.length - 1;
  const current = frames[Math.min(frameIdx, frames.length - 1)];
  const info = ALGO_INFO[algo];
  const progress = frames.length > 1 ? Math.round((frameIdx / (frames.length - 1)) * 100) : 0;

  useEffect(() => {
    if (!playing || isDone) return;
    const timer = setTimeout(() => {
      const next = frameIdx + 1;
      setFrameIdx(next);
      if (next >= frames.length - 1) setPlaying(false);
    }, SPEEDS[speed]);
    return () => clearTimeout(timer);
  }, [playing, frameIdx, frames, speed, isDone]);

  return (
    <div className="viz-inner">
      <div className="viz-description">
        <p className="viz-desc-text">{current.description}</p>
        <span className="viz-step-count">{frameIdx} / {frames.length - 1} steps</span>
      </div>

      <div className="tree-svg-wrap">
        <TreeSVG states={current.states} />
      </div>

      {current.result.length > 0 && (
        <div className="tree-result-row">
          <span className="tree-result-label">Output:</span>
          {current.result.map((val, i) => (
            <span key={i} className="tree-result-val">{val}</span>
          ))}
        </div>
      )}

      <div className="viz-progress-bar">
        <div className="viz-progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="viz-legend">
        {[
          { color: '#ef4444', label: 'Current' },
          { color: '#22c55e', label: 'Visited (output)' },
          { color: '#3b82f6', label: algo === 'levelorder' ? 'In Queue' : 'Next target' },
          { color: 'var(--bg-secondary)', label: 'Unvisited', border: '1px solid var(--border)' },
        ].map(({ color, label, border }) => (
          <span key={label} className="legend-item">
            <span className="legend-dot" style={{ background: color, border: border ?? 'none' }} />
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
          {playing ? '⏸ Pause' : isDone ? '✅ Done' : frameIdx === 0 ? '▶ Play' : '▶ Resume'}
        </button>
        <button className="viz-btn" onClick={() => { setFrameIdx(0); setPlaying(false); }}>
          ↺ Reset
        </button>
        <div className="viz-speed">
          <span>Speed:</span>
          {(['slow', 'normal', 'fast'] as const).map((s) => (
            <button key={s} className={`viz-speed-btn ${speed === s ? 'active' : ''}`} onClick={() => setSpeed(s)}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="algo-info-box">
        <div className="algo-info-row">
          <div className="algo-info-item"><strong>⏱ Time:</strong> {info.time}</div>
          <div className="algo-info-item"><strong>💾 Space:</strong> {info.space}</div>
          <div className="algo-info-item"><strong>📋 Order:</strong> {info.order}</div>
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

// ─── Exported component ───────────────────────────────────────────────────────

const ALGOS: { id: TraversalAlgo; label: string }[] = [
  { id: 'inorder',    label: 'Inorder' },
  { id: 'preorder',   label: 'Preorder' },
  { id: 'postorder',  label: 'Postorder' },
  { id: 'levelorder', label: 'Level-Order (BFS)' },
];

export function TreeTraversalViz() {
  const [algo, setAlgo] = useState<TraversalAlgo>('inorder');

  return (
    <div className="viz-container">
      <div className="viz-algo-selector">
        {ALGOS.map(({ id, label }) => (
          <button
            key={id}
            className={`viz-algo-btn ${algo === id ? 'active' : ''}`}
            onClick={() => setAlgo(id)}
          >
            {label}
          </button>
        ))}
      </div>
      <TreeVizCore key={algo} algo={algo} />
    </div>
  );
}
