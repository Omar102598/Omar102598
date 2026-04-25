import { useState, useEffect } from 'react';

// ─── Two Pointers ────────────────────────────────────────────────────────────

const TP_ARRAY = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const TP_TARGET = 9;

type TPState = 'default' | 'left' | 'right' | 'found' | 'used';

interface TPFrame {
  states: TPState[];
  description: string;
  left: number;
  right: number;
  pairs: [number, number][];
  sum: number | null;
}

function generateTPFrames(): TPFrame[] {
  const frames: TPFrame[] = [];
  const n = TP_ARRAY.length;
  let left = 0;
  let right = n - 1;
  const foundPairs: [number, number][] = [];

  const mkStates = (l: number, r: number, extra: Map<number, TPState>): TPState[] =>
    TP_ARRAY.map((_, i) => {
      if (extra.has(i)) return extra.get(i)!;
      if (i === l) return 'left';
      if (i === r) return 'right';
      return 'default';
    });

  frames.push({
    states: mkStates(left, right, new Map()),
    description: `Find all pairs summing to ${TP_TARGET}. Start: left=0, right=${n - 1}`,
    left, right, pairs: [], sum: null,
  });

  while (left < right) {
    const sum = TP_ARRAY[left] + TP_ARRAY[right];

    frames.push({
      states: mkStates(left, right, new Map()),
      description: `arr[${left}]=${TP_ARRAY[left]} + arr[${right}]=${TP_ARRAY[right]} = ${sum}`,
      left, right, pairs: [...foundPairs], sum,
    });

    if (sum === TP_TARGET) {
      foundPairs.push([left, right]);
      const used = new Map<number, TPState>();
      foundPairs.flat().forEach((idx) => used.set(idx, 'used'));
      used.set(left, 'found');
      used.set(right, 'found');
      frames.push({
        states: mkStates(left + 1, right - 1, used),
        description: `✅ Pair found! (${TP_ARRAY[left]}, ${TP_ARRAY[right]}) sums to ${TP_TARGET}. Move both pointers inward.`,
        left: left + 1, right: right - 1, pairs: [...foundPairs], sum,
      });
      left++;
      right--;
    } else if (sum < TP_TARGET) {
      frames.push({
        states: mkStates(left + 1, right, new Map()),
        description: `${sum} < ${TP_TARGET} — sum too small, move left pointer right`,
        left: left + 1, right, pairs: [...foundPairs], sum,
      });
      left++;
    } else {
      frames.push({
        states: mkStates(left, right - 1, new Map()),
        description: `${sum} > ${TP_TARGET} — sum too large, move right pointer left`,
        left, right: right - 1, pairs: [...foundPairs], sum,
      });
      right--;
    }
  }

  frames.push({
    states: TP_ARRAY.map((_, i) => (foundPairs.flat().includes(i) ? 'used' : 'default')),
    description: `✅ Done! Found ${foundPairs.length} pairs: ${foundPairs.map(([a, b]) => `(${TP_ARRAY[a]},${TP_ARRAY[b]})`).join(', ')}`,
    left, right, pairs: foundPairs, sum: null,
  });

  return frames;
}

const TP_FRAMES = generateTPFrames();

// ─── Sliding Window ───────────────────────────────────────────────────────────

const SW_ARRAY = [2, 1, 5, 1, 3, 2, 1, 4, 3];
const SW_K = 3;

type SWState = 'default' | 'window' | 'max-window' | 'removed' | 'added';

interface SWFrame {
  states: SWState[];
  windowSum: number;
  maxSum: number;
  maxStart: number;
  description: string;
}

function generateSWFrames(): SWFrame[] {
  const frames: SWFrame[] = [];
  const n = SW_ARRAY.length;
  let maxSum = 0;
  let maxStart = 0;

  // Initial window
  let windowSum = SW_ARRAY.slice(0, SW_K).reduce((a, b) => a + b, 0);
  maxSum = windowSum;

  frames.push({
    states: SW_ARRAY.map((_, i) => (i < SW_K ? 'window' : 'default')),
    windowSum, maxSum, maxStart: 0,
    description: `Initial window [0..${SW_K - 1}]: sum = ${windowSum}`,
  });

  for (let end = SW_K; end < n; end++) {
    const start = end - SW_K + 1;
    const removed = end - SW_K;
    const added = end;

    // Show add/remove
    const transStates: SWState[] = SW_ARRAY.map((_, i) => {
      if (i === removed) return 'removed';
      if (i === added) return 'added';
      if (i >= start && i < end) return 'window';
      return 'default';
    });

    windowSum = windowSum - SW_ARRAY[removed] + SW_ARRAY[added];

    frames.push({
      states: transStates,
      windowSum, maxSum, maxStart,
      description: `Slide: remove arr[${removed}]=${SW_ARRAY[removed]}, add arr[${added}]=${SW_ARRAY[added]} → new sum = ${windowSum}`,
    });

    const windowStates: SWState[] = SW_ARRAY.map((_, i) => (i >= start && i <= end ? 'window' : 'default'));

    if (windowSum > maxSum) {
      maxSum = windowSum;
      maxStart = start;
      frames.push({
        states: windowStates.map((s, i) => (i >= start && i <= end ? 'max-window' : s)),
        windowSum, maxSum, maxStart,
        description: `🏆 New maximum! Window [${start}..${end}] sum = ${maxSum}`,
      });
    } else {
      frames.push({
        states: windowStates,
        windowSum, maxSum, maxStart,
        description: `Window [${start}..${end}]: sum = ${windowSum} (max is still ${maxSum})`,
      });
    }
  }

  // Final highlight
  frames.push({
    states: SW_ARRAY.map((_, i) => (i >= maxStart && i < maxStart + SW_K ? 'max-window' : 'default')),
    windowSum, maxSum, maxStart,
    description: `✅ Done! Maximum subarray of size ${SW_K} = [${SW_ARRAY.slice(maxStart, maxStart + SW_K).join(', ')}], sum = ${maxSum}`,
  });

  return frames;
}

const SW_FRAMES = generateSWFrames();
const SPEEDS: Record<string, number> = { slow: 1200, normal: 500, fast: 150 };
type Technique = 'twopointers' | 'slidingwindow';

// ─── Two Pointers Visualizer ──────────────────────────────────────────────────

function TwoPointersViz() {
  const [frameIdx, setFrameIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<'slow' | 'normal' | 'fast'>('normal');

  const isDone = frameIdx >= TP_FRAMES.length - 1;
  const current = TP_FRAMES[Math.min(frameIdx, TP_FRAMES.length - 1)];
  const progress = TP_FRAMES.length > 1 ? Math.round((frameIdx / (TP_FRAMES.length - 1)) * 100) : 0;

  useEffect(() => {
    if (!playing || isDone) return;
    const t = setTimeout(() => {
      const next = frameIdx + 1;
      setFrameIdx(next);
      if (next >= TP_FRAMES.length - 1) setPlaying(false);
    }, SPEEDS[speed]);
    return () => clearTimeout(t);
  }, [playing, frameIdx, speed, isDone]);

  const cellClass = (state: TPState) => {
    switch (state) {
      case 'left': return 'tp-left';
      case 'right': return 'tp-right';
      case 'found': return 'tp-found';
      case 'used': return 'tp-used';
      default: return 'tp-default';
    }
  };

  const getLabel = (i: number) => {
    const labels: string[] = [];
    if (i === current.left && current.left < current.right) labels.push('L');
    if (i === current.right && current.left < current.right) labels.push('R');
    return labels.join('/');
  };

  return (
    <div className="viz-inner">
      <div className="bsearch-target">
        <span className="bsearch-target-label">🎯 Target sum:</span>
        <span className="bsearch-target-val">{TP_TARGET}</span>
        {current.pairs.length > 0 && (
          <span className="tp-pairs-found">
            Found: {current.pairs.map(([a, b]) => `(${TP_ARRAY[a]},${TP_ARRAY[b]})`).join(' ')}
          </span>
        )}
      </div>

      {current.sum !== null && (
        <div className="tp-sum-display">
          <span className={`tp-sum ${current.sum === TP_TARGET ? 'tp-sum-match' : current.sum < TP_TARGET ? 'tp-sum-low' : 'tp-sum-high'}`}>
            Current sum: {current.sum}
            {current.sum < TP_TARGET && ' → move left ▶'}
            {current.sum > TP_TARGET && ' → move right ◀'}
            {current.sum === TP_TARGET && ' → MATCH! ✅'}
          </span>
        </div>
      )}

      <div className="viz-description">
        <p className="viz-desc-text">{current.description}</p>
        <span className="viz-step-count">{frameIdx} / {TP_FRAMES.length - 1} steps</span>
      </div>

      <div className="bsearch-array-wrap">
        <div className="bsearch-array">
          {TP_ARRAY.map((val, i) => (
            <div key={i} className="bsearch-cell-wrap">
              <div className={`bsearch-cell ${cellClass(current.states[i])}`}>{val}</div>
              <div className="bsearch-index">{i}</div>
              <div className={`bsearch-pointer ${getLabel(i) ? 'bsearch-pointer-visible' : ''}`}>
                {getLabel(i) && (
                  <>
                    <span className="bsearch-arrow">↑</span>
                    <span className={`bsearch-pointer-label bsearch-ptr-${getLabel(i).toLowerCase()}`}>
                      {getLabel(i)}
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
          { cls: 'tp-left', label: 'Left ptr' },
          { cls: 'tp-right', label: 'Right ptr' },
          { cls: 'tp-found', label: 'Pair found' },
          { cls: 'tp-used', label: 'Used pair' },
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
          <div className="algo-info-item"><strong>📋 Prereq:</strong> Sorted array</div>
        </div>
        <div className="algo-info-desc">
          <strong>🔑 Key Insight:</strong> Two pointers converge from both ends — if sum is too small move left forward, too large move right backward
        </div>
      </div>
    </div>
  );
}

// ─── Sliding Window Visualizer ────────────────────────────────────────────────

function SlidingWindowViz() {
  const [frameIdx, setFrameIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<'slow' | 'normal' | 'fast'>('normal');

  const isDone = frameIdx >= SW_FRAMES.length - 1;
  const current = SW_FRAMES[Math.min(frameIdx, SW_FRAMES.length - 1)];
  const progress = SW_FRAMES.length > 1 ? Math.round((frameIdx / (SW_FRAMES.length - 1)) * 100) : 0;

  useEffect(() => {
    if (!playing || isDone) return;
    const t = setTimeout(() => {
      const next = frameIdx + 1;
      setFrameIdx(next);
      if (next >= SW_FRAMES.length - 1) setPlaying(false);
    }, SPEEDS[speed]);
    return () => clearTimeout(t);
  }, [playing, frameIdx, speed, isDone]);

  const cellClass = (state: SWState) => {
    switch (state) {
      case 'window': return 'sw-window';
      case 'max-window': return 'sw-max-window';
      case 'removed': return 'sw-removed';
      case 'added': return 'sw-added';
      default: return 'sw-default';
    }
  };

  return (
    <div className="viz-inner">
      <div className="bsearch-target">
        <span className="bsearch-target-label">📐 Window size k =</span>
        <span className="bsearch-target-val">{SW_K}</span>
        <span className="bsearch-target-label">  |  Max sum so far:</span>
        <span className="bsearch-target-val sw-max-val">{current.maxSum}</span>
      </div>

      <div className="sw-sums">
        <span className="sw-sum-label">Window sum: <strong>{current.windowSum}</strong></span>
        <span className="sw-sum-label">Max sum: <strong className="sw-max-highlight">{current.maxSum}</strong></span>
      </div>

      <div className="viz-description">
        <p className="viz-desc-text">{current.description}</p>
        <span className="viz-step-count">{frameIdx} / {SW_FRAMES.length - 1} steps</span>
      </div>

      <div className="bsearch-array-wrap">
        <div className="bsearch-array">
          {SW_ARRAY.map((val, i) => (
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
          { cls: 'sw-window', label: 'Window' },
          { cls: 'sw-max-window', label: 'Max window' },
          { cls: 'sw-added', label: 'Added' },
          { cls: 'sw-removed', label: 'Removed' },
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
          <div className="algo-info-item"><strong>📐 Window:</strong> Fixed size k={SW_K}</div>
        </div>
        <div className="algo-info-desc">
          <strong>🔑 Key Insight:</strong> Maintain running sum by adding the incoming element and subtracting the outgoing element — O(1) per slide instead of O(k)
        </div>
      </div>
    </div>
  );
}

// ─── Exported Component ───────────────────────────────────────────────────────

export function ArrayTechniquesViz() {
  const [technique, setTechnique] = useState<Technique>('twopointers');

  return (
    <div className="viz-container">
      <div className="viz-algo-selector">
        <button
          className={`viz-algo-btn ${technique === 'twopointers' ? 'active' : ''}`}
          onClick={() => setTechnique('twopointers')}
        >
          Two Pointers
        </button>
        <button
          className={`viz-algo-btn ${technique === 'slidingwindow' ? 'active' : ''}`}
          onClick={() => setTechnique('slidingwindow')}
        >
          Sliding Window
        </button>
      </div>
      {technique === 'twopointers' ? (
        <TwoPointersViz key="tp" />
      ) : (
        <SlidingWindowViz key="sw" />
      )}
    </div>
  );
}
