import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';
import type { PriceComparison } from '../types';

interface PriceComparisonCardProps {
  comparison: PriceComparison;
}

const storeLabels: Record<string, string> = {
  amazon: '🛒 Amazon',
  target: '🎯 Target',
  heb: '🏪 HEB',
  centralMarket: '🏬 Central Market',
};

const storeKeys = ['amazon', 'target', 'heb', 'centralMarket'] as const;

export function PriceComparisonCard({ comparison }: PriceComparisonCardProps) {
  const totals = comparison.storeTotals;
  const maxTotal = Math.max(
    ...(storeKeys.map((k) => totals[k]).filter((v): v is number => v != null)),
  );

  const getCheapestStore = (prices: Record<string, number | undefined>) => {
    let min = Infinity;
    let store = '';
    for (const [key, val] of Object.entries(prices)) {
      if (val != null && val < min) {
        min = val;
        store = key;
      }
    }
    return store;
  };

  return (
    <motion.div
      className="tool-card comparison-card"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="tool-card-header comparison-header">
        <BarChart3 size={20} />
        <h3>{comparison.title}</h3>
      </div>

      {/* Visual Bar Chart */}
      <div className="comparison-chart">
        {storeKeys.map((key) => {
          const total = totals[key];
          if (total == null) return null;
          const widthPct = maxTotal > 0 ? (total / maxTotal) * 100 : 0;
          const isMin = total === Math.min(
            ...(storeKeys.map((k) => totals[k]).filter((v): v is number => v != null)),
          );
          return (
            <div className="comparison-bar-row" key={key}>
              <span className="comparison-store-label">{storeLabels[key]}</span>
              <div className="comparison-bar-track">
                <motion.div
                  className={`comparison-bar-fill ${isMin ? 'best' : ''}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${widthPct}%` }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                />
              </div>
              <span className={`comparison-bar-value ${isMin ? 'best' : ''}`}>
                ${total.toFixed(2)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Item-level Comparison */}
      <div className="comparison-table">
        <div className="grocery-table-header">
          <span className="gi-name">Item</span>
          {storeKeys.map((key) => (
            <span className="gi-price" key={key}>
              {storeLabels[key].split(' ')[0]}
            </span>
          ))}
        </div>
        {comparison.items.map((item, idx) => {
          const cheapest = getCheapestStore(item.estimatedPrices);
          return (
            <div className="grocery-table-row" key={idx}>
              <span className="gi-name">{item.name}</span>
              {storeKeys.map((key) => {
                const price = item.estimatedPrices[key];
                return (
                  <span
                    className={`gi-price ${key === cheapest ? 'cheapest' : ''}`}
                    key={key}
                  >
                    {price != null ? `$${price.toFixed(2)}` : '—'}
                  </span>
                );
              })}
            </div>
          );
        })}
      </div>

      <div className="comparison-recommendation">
        <h4>📊 Recommendation</h4>
        <p>{comparison.recommendation}</p>
      </div>

      {comparison.breakdown && (
        <div className="comparison-breakdown">
          <h4>📋 Breakdown</h4>
          <p>{comparison.breakdown}</p>
        </div>
      )}

      <div className="grocery-disclaimer">
        ⚠️ {comparison.disclaimer}
      </div>
    </motion.div>
  );
}
