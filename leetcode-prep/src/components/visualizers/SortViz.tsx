import { useState, useEffect, useMemo } from 'react';

type BarState = 'default' | 'comparing' | 'swapping' | 'sorted' | 'pivot';

interface BarFrame {
  bars: { value: number; state: BarState }[];
  description: string;
}

const INITIAL = [8, 3, 11, 5, 9, 1, 7, 12, 4, 10, 6, 2];
const MAX_VAL = Math.max(...INITIAL);

function snap(arr: number[], highlight: Map<number, BarState>, sorted: Set<number>, desc: string): BarFrame {
  return {
    bars: arr.map((v, i) => ({ value: v, state: sorted.has(i) ? 'sorted' : (highlight.get(i) ?? 'default') })),
    description: desc,
  };
}

function generateBubbleFrames(): BarFrame[] {
  const frames: BarFrame[] = [];
  const arr = [...INITIAL];
  const n = arr.length;
  const sorted = new Set<number>();

  frames.push(snap(arr, new Map(), sorted, 'Starting Bubble Sort — will compare adjacent pairs'));

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - 1 - i; j++) {
      frames.push(snap(arr, new Map<number, BarState>([[j, 'comparing'], [j + 1, 'comparing']]), sorted,
        `Compare arr[${j}]=${arr[j]} and arr[${j + 1}]=${arr[j + 1]}`));
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        frames.push(snap(arr, new Map<number, BarState>([[j, 'swapping'], [j + 1, 'swapping']]), sorted,
          `Swap! arr[${j}]=${arr[j]} ↔ arr[${j + 1}]=${arr[j + 1]}`));
      }
    }
    sorted.add(n - 1 - i);
    frames.push(snap(arr, new Map(), sorted, `Pass ${i + 1} complete — ${arr[n - 1 - i]} is in its final position`));
  }
  sorted.add(0);
  frames.push({ bars: arr.map((v) => ({ value: v, state: 'sorted' })), description: '✅ Array is fully sorted!' });
  return frames;
}

function generateSelectionFrames(): BarFrame[] {
  const frames: BarFrame[] = [];
  const arr = [...INITIAL];
  const n = arr.length;
  const sorted = new Set<number>();

  frames.push(snap(arr, new Map(), sorted, 'Starting Selection Sort — find minimum in unsorted region each pass'));

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      frames.push(snap(arr, new Map<number, BarState>([[minIdx, 'pivot'], [j, 'comparing']]), sorted,
        `Compare arr[${j}]=${arr[j]} with current min arr[${minIdx}]=${arr[minIdx]}`));
      if (arr[j] < arr[minIdx]) {
        minIdx = j;
        frames.push(snap(arr, new Map<number, BarState>([[minIdx, 'pivot']]), sorted,
          `New min found: arr[${minIdx}]=${arr[minIdx]}`));
      }
    }
    if (minIdx !== i) {
      frames.push(snap(arr, new Map<number, BarState>([[i, 'swapping'], [minIdx, 'swapping']]), sorted,
        `Swap min arr[${minIdx}]=${arr[minIdx]} → position ${i}`));
      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
    }
    sorted.add(i);
    frames.push(snap(arr, new Map(), sorted, `arr[${i}]=${arr[i]} is in its final position`));
  }
  sorted.add(n - 1);
  frames.push({ bars: arr.map((v) => ({ value: v, state: 'sorted' })), description: '✅ Array is fully sorted!' });
  return frames;
}

function generateInsertionFrames(): BarFrame[] {
  const frames: BarFrame[] = [];
  const arr = [...INITIAL];
  const n = arr.length;

  const snapAt = (highlight: Map<number, BarState>, sortedUpTo: number, desc: string): BarFrame => ({
    bars: arr.map((v, i) => ({
      value: v,
      state: i < sortedUpTo ? 'sorted' : highlight.get(i) ?? 'default',
    })),
    description: desc,
  });

  frames.push(snapAt(new Map([[0, 'sorted']]), 1, 'Start: first element is trivially sorted'));

  for (let i = 1; i < n; i++) {
    const key = arr[i];
    frames.push(snapAt(new Map<number, BarState>([[i, 'comparing']]), i,
      `Pick arr[${i}]=${key} — insert into sorted portion`));

    let j = i - 1;
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      frames.push(snapAt(new Map<number, BarState>([[j, 'comparing'], [j + 1, 'swapping']]), j,
        `Shift arr[${j}]=${arr[j]} right to make room`));
      j--;
    }
    arr[j + 1] = key;
    frames.push(snapAt(new Map<number, BarState>([[j + 1, 'pivot']]), i + 1,
      `Insert ${key} at position ${j + 1} — sorted region now has ${i + 1} elements`));
  }

  frames.push({ bars: arr.map((v) => ({ value: v, state: 'sorted' })), description: '✅ Array is fully sorted!' });
  return frames;
}

const SPEEDS: Record<string, number> = { slow: 600, normal: 200, fast: 60 };

type SortAlgo = 'bubble' | 'selection' | 'insertion';

const ALGO_INFO: Record<SortAlgo, { time: string; space: string; stable: string; key: string }> = {
  bubble: {
    time: 'O(n²) avg/worst, O(n) best',
    space: 'O(1)',
    stable: 'Yes',
    key: 'Largest element "bubbles" to the end each pass via adjacent swaps',
  },
  selection: {
    time: 'O(n²)',
    space: 'O(1)',
    stable: 'No (default)',
    key: 'Finds minimum of unsorted portion and places it at the sorted boundary',
  },
  insertion: {
    time: 'O(n²) worst, O(n) best',
    space: 'O(1)',
    stable: 'Yes',
    key: 'Builds sorted array one element at a time by inserting into correct position',
  },
};

interface SortVizCoreProps {
  algo: SortAlgo;
}

function SortVizCore({ algo }: SortVizCoreProps) {
  const frames = useMemo(() => {
    switch (algo) {
      case 'bubble': return generateBubbleFrames();
      case 'selection': return generateSelectionFrames();
      case 'insertion': return generateInsertionFrames();
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

      <div className="sort-bars-wrap">
        <div className="sort-bars">
          {current.bars.map((bar, i) => (
            <div key={i} className="sort-bar-col">
              <div
                className={`sort-bar bar-${bar.state}`}
                style={{ height: `${(bar.value / MAX_VAL) * 100}%` }}
              />
              <span className="sort-bar-val">{bar.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="viz-progress-bar">
        <div className="viz-progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="viz-legend">
        {[
          { cls: 'bar-comparing', label: 'Comparing' },
          { cls: 'bar-swapping', label: 'Swapping' },
          { cls: 'bar-pivot', label: 'Min / Key' },
          { cls: 'bar-sorted', label: 'Sorted' },
          { cls: 'bar-default', label: 'Unsorted' },
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
          <div className="algo-info-item"><strong>⏱ Time:</strong> {info.time}</div>
          <div className="algo-info-item"><strong>💾 Space:</strong> {info.space}</div>
          <div className="algo-info-item"><strong>🔄 Stable:</strong> {info.stable}</div>
        </div>
        <div className="algo-info-desc">
          <strong>🔑 Key Insight:</strong> {info.key}
        </div>
      </div>
    </div>
  );
}

export function SortViz() {
  const [algo, setAlgo] = useState<SortAlgo>('bubble');

  return (
    <div className="viz-container">
      <div className="viz-algo-selector">
        {(['bubble', 'selection', 'insertion'] as SortAlgo[]).map((a) => (
          <button
            key={a}
            className={`viz-algo-btn ${algo === a ? 'active' : ''}`}
            onClick={() => setAlgo(a)}
          >
            {a === 'bubble' ? 'Bubble Sort' : a === 'selection' ? 'Selection Sort' : 'Insertion Sort'}
          </button>
        ))}
      </div>
      <SortVizCore key={algo} algo={algo} />
    </div>
  );
}
