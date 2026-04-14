import { motion } from 'framer-motion';
import { ShoppingCart, TrendingDown } from 'lucide-react';
import type { GroceryList } from '../types';

interface GroceryListCardProps {
  groceryList: GroceryList;
}

const storeLabels: Record<string, string> = {
  amazon: '🛒 Amazon',
  target: '🎯 Target',
  heb: '🏪 HEB',
  centralMarket: '🏬 Central Market',
};

const storeKeys = ['amazon', 'target', 'heb', 'centralMarket'] as const;

export function GroceryListCard({ groceryList }: GroceryListCardProps) {
  // Group items by category
  const categories = groceryList.items.reduce<Record<string, typeof groceryList.items>>(
    (acc, item) => {
      const cat = item.category || 'Other';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    },
    {},
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
      className="tool-card grocery-card"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="tool-card-header grocery-header">
        <ShoppingCart size={20} />
        <h3>{groceryList.title}</h3>
      </div>

      <div className="grocery-budget">
        <span>💰 Budget: ${groceryList.budget.toFixed(2)}</span>
        <span className="grocery-best-value">
          <TrendingDown size={14} /> Best Value: {groceryList.bestValueStore}
        </span>
      </div>

      {groceryList.savings && (
        <div className="grocery-savings">
          🏷️ {groceryList.savings}
        </div>
      )}

      {/* Store Totals */}
      <div className="store-totals">
        {storeKeys.map((key) => {
          const total = groceryList.storeTotals[key];
          if (total == null) return null;
          const isBest = groceryList.bestValueStore.toLowerCase().includes(key.toLowerCase()) ||
            (key === 'centralMarket' && groceryList.bestValueStore.toLowerCase().includes('central'));
          return (
            <div className={`store-total ${isBest ? 'best' : ''}`} key={key}>
              <span className="store-name">{storeLabels[key]}</span>
              <span className="store-price">${total.toFixed(2)}</span>
            </div>
          );
        })}
      </div>

      {/* Items by Category */}
      {Object.entries(categories).map(([category, items]) => (
        <div className="grocery-category" key={category}>
          <h4>{category}</h4>
          <div className="grocery-items-table">
            <div className="grocery-table-header">
              <span className="gi-name">Item</span>
              <span className="gi-qty">Qty</span>
              {storeKeys.map((key) => (
                <span className="gi-price" key={key}>
                  {storeLabels[key].split(' ')[0]}
                </span>
              ))}
            </div>
            {items.map((item, idx) => {
              const cheapest = getCheapestStore(item.estimatedPrices);
              return (
                <div className="grocery-table-row" key={idx}>
                  <span className="gi-name">{item.name}</span>
                  <span className="gi-qty">{item.quantity}</span>
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
        </div>
      ))}

      <div className="grocery-disclaimer">
        ⚠️ {groceryList.disclaimer}
      </div>
    </motion.div>
  );
}
