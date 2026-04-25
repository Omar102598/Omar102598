import { useState } from 'react';
import { motion } from 'framer-motion';
import { GridTraversalViz } from './visualizers/GridTraversalViz';
import { SortViz } from './visualizers/SortViz';
import { BinarySearchViz } from './visualizers/BinarySearchViz';
import { ArrayTechniquesViz } from './visualizers/ArrayTechniquesViz';

type Category = 'graph' | 'sort' | 'search' | 'techniques';

const categories: { id: Category; emoji: string; label: string; desc: string }[] = [
  { id: 'graph', emoji: '🔍', label: 'Graph Traversal', desc: 'BFS & DFS' },
  { id: 'sort', emoji: '📊', label: 'Sorting', desc: 'Bubble · Selection · Insertion' },
  { id: 'search', emoji: '🎯', label: 'Binary Search', desc: 'Divide & Conquer' },
  { id: 'techniques', emoji: '🪟', label: 'Array Techniques', desc: 'Two Pointers · Sliding Window' },
];

export function AlgoVisualizer() {
  const [active, setActive] = useState<Category>('graph');

  return (
    <section className="section" id="algorithms">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="section-title">Algorithm Visualizer</h2>
        <p className="section-subtitle">
          Interactive step-by-step animations of common interview algorithms
        </p>
      </motion.div>

      <motion.div
        className="algo-categories"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`algo-cat-btn ${active === cat.id ? 'active' : ''}`}
            onClick={() => setActive(cat.id)}
          >
            <span className="algo-cat-emoji">{cat.emoji}</span>
            <span className="algo-cat-label">{cat.label}</span>
            <span className="algo-cat-desc">{cat.desc}</span>
          </button>
        ))}
      </motion.div>

      <motion.div
        key={active}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        {active === 'graph' && <GridTraversalViz />}
        {active === 'sort' && <SortViz />}
        {active === 'search' && <BinarySearchViz />}
        {active === 'techniques' && <ArrayTechniquesViz />}
      </motion.div>
    </section>
  );
}
