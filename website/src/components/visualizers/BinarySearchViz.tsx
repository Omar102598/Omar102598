import { useState, useEffect } from 'react';

const ARRAY = [2, 5, 8, 12, 16, 23, 27, 35, 42, 48, 56, 63, 71, 79, 86];
const TARGET = 42;
const TARGET_IDX = ARRAY.indexOf(TARGET);

type CellState = 'default' | 'left' | 'right' | 'mid' | 'found' | 'eliminated';

interface SearchFrame {
  states: CellState[];
  description: string;
  left: number;
  right: number;
  mid: number;
}

function generateFrames(): { frames: SearchFrame[]; comparisons: number } {
  const frames: SearchFrame[] = [];
  let left = 0;
  let right = ARRAY.length - 1;
  let comparisons = 0;

  const buildStates = (l: number, r: number, m: number, override?: Map<number, CellState>): CellState[] =>
    ARRAY.map((_, i) => {
      if (override?.has(i)) return override.get(i)!;
      if (i < l || i > r) return 'eliminated';
      if (i === m) return 'mid';
      if (i === l) return 'left';
      if (i === r) return 'right';
      return 'default';
    });

  frames.push({
    states: ARRAY.map((_, i) => (i === 0 ? 'left' : i === ARRAY.length - 1 ? 'right' : 'default')),
    description: `Initialize: left=0, right=${ARRAY.length - 1}. Searching for target = ${TARGET}`,
    left, right, mid: -1,
  });

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    comparisons++;

    frames.push({
      states: buildStates(left, right, mid),
      description: `mid = (${left}+${right})÷2 = ${mid} → arr[${mid}] = ${ARRAY[mid]}`,
      left, right, mid,
    });

    if (ARRAY[mid] === TARGET) {
      const override = new Map<number, CellState>([[mid, 'found']]);
      frames.push({
        states: buildStates(left, right, mid, override),
        description: `🎯 Found ${TARGET} at index ${mid}! Took ${comparisons} comparison${comparisons !== 1 ? 's' : ''}`,
        left, right, mid,
      });
      break;
    } else if (ARRAY[mid] < TARGET) {
      frames.push({
        states: buildStates(left, right, mid),
        description: `arr[${mid}]=${ARRAY[mid]} < ${TARGET} → eliminate left half, set left = ${mid + 1}`,
        left, right, mid,
      });
      left = mid + 1;
    } else {
      frames.push({
        states: buildStates(left, right, mid),
        description: `arr[${mid}]=${ARRAY[mid]} > ${TARGET} → eliminate right half, set right = ${mid - 1}`,
        left, right, mid,
      });
      right = mid - 1;
    }
  }

  return { frames, comparisons };
}

const { frames: FRAMES, comparisons: ACTUAL_COMPARISONS } = generateFrames();
const SPEEDS: Record<string, number> = { slow: 1200, normal: 600, fast: 200 };

export function BinarySearchViz() {
  const [frameIdx, setFrameIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<'slow' | 'normal' | 'fast'>('normal');

  const isDone = frameIdx >= FRAMES.length - 1;
  const current = FRAMES[Math.min(frameIdx, FRAMES.length - 1)];
  const progress = FRAMES.length > 1 ? Math.round((frameIdx / (FRAMES.length - 1)) * 100) : 0;

  useEffect(() => {
    if (!playing || isDone) return;
    const timer = setTimeout(() => {
      const next = frameIdx + 1;
      setFrameIdx(next);
      if (next >= FRAMES.length - 1) setPlaying(false);
    }, SPEEDS[speed]);
    return () => clearTimeout(timer);
  }, [playing, frameIdx, speed, isDone]);

  const cellClass = (state: CellState) => {
    switch (state) {
      case 'left': return 'bsearch-left';
      case 'right': return 'bsearch-right';
      case 'mid': return 'bsearch-mid';
      case 'found': return 'bsearch-found';
      case 'eliminated': return 'bsearch-eliminated';
      default: return 'bsearch-default';
    }
  };

  const getPointerLabel = (i: number): string => {
    const { left, right, mid } = current;
    const labels: string[] = [];
    if (i === left && i === right) labels.push('L=R');
    else if (i === left) labels.push('L');
    else if (i === right) labels.push('R');
    if (i === mid) labels.push('M');
    return labels.join('/');
  };

  return (
    <div className="viz-container">
      <div className="viz-algo-selector">
        <button className="viz-algo-btn active">Binary Search</button>
      </div>
      <div className="viz-inner">
        <div className="bsearch-target">
          <span className="bsearch-target-label">🎯 Target:</span>
          <span className="bsearch-target-val">{TARGET}</span>
          <span className="bsearch-target-label">  Array (sorted, {ARRAY.length} elements)</span>
        </div>

        <div className="viz-description">
          <p className="viz-desc-text">{current.description}</p>
          <span className="viz-step-count">{frameIdx} / {FRAMES.length - 1} steps</span>
        </div>

        <div className="bsearch-array-wrap">
          <div className="bsearch-array">
            {ARRAY.map((val, i) => (
              <div key={i} className="bsearch-cell-wrap">
                <div className={`bsearch-cell ${cellClass(current.states[i])}`}>
                  {val}
                </div>
                <div className="bsearch-index">{i}</div>
                <div className={`bsearch-pointer ${getPointerLabel(i) ? 'bsearch-pointer-visible' : ''}`}>
                  {getPointerLabel(i) && (
                    <>
                      <span className="bsearch-arrow">↑</span>
                      <span className={`bsearch-pointer-label bsearch-ptr-${getPointerLabel(i).toLowerCase().replace('=', '')}`}>
                        {getPointerLabel(i)}
                      </span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="viz-progress-bar">
          <div className="viz-progress-fill" style={{ width: `${progress}%` }} />
        </div>

        <div className="viz-legend">
          {[
            { cls: 'bsearch-left', label: 'Left ptr' },
            { cls: 'bsearch-right', label: 'Right ptr' },
            { cls: 'bsearch-mid', label: 'Mid (check)' },
            { cls: 'bsearch-found', label: 'Found!' },
            { cls: 'bsearch-eliminated', label: 'Eliminated' },
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
            <div className="algo-info-item"><strong>⏱ Time:</strong> O(log n)</div>
            <div className="algo-info-item"><strong>💾 Space:</strong> O(1)</div>
            <div className="algo-info-item"><strong>📋 Prerequisite:</strong> Sorted array</div>
          </div>
          <div className="algo-info-desc">
            <strong>🔑 Key Insight:</strong> Each comparison eliminates half the search space, achieving logarithmic time complexity
          </div>
          <div className="algo-info-desc">
            <strong>🎯 Found at index:</strong> {TARGET_IDX} — took only {ACTUAL_COMPARISONS} comparison{ACTUAL_COMPARISONS !== 1 ? 's' : ''} vs {ARRAY.length} for linear search
          </div>
        </div>
      </div>
    </div>
  );
}
