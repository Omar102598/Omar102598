import { motion } from 'framer-motion';
import { UtensilsCrossed, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import type { MealPlan } from '../types';

interface MealPlanCardProps {
  mealPlan: MealPlan;
}

export function MealPlanCard({ mealPlan }: MealPlanCardProps) {
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set([0]));
  const [expandedMeals, setExpandedMeals] = useState<Set<string>>(new Set());

  const toggleDay = (index: number) => {
    setExpandedDays((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const toggleMeal = (key: string) => {
    setExpandedMeals((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <motion.div
      className="tool-card meal-plan-card"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="tool-card-header meal-header">
        <UtensilsCrossed size={20} />
        <h3>{mealPlan.title}</h3>
      </div>

      <div className="meal-plan-meta">
        <span>🎯 {mealPlan.goal}</span>
        <span>🔥 {mealPlan.dailyCalorieTarget} cal/day</span>
      </div>

      {mealPlan.dietaryNotes && mealPlan.dietaryNotes.length > 0 && (
        <div className="meal-plan-notes">
          {mealPlan.dietaryNotes.map((note, i) => (
            <span className="meal-note-chip" key={i}>{note}</span>
          ))}
        </div>
      )}

      {mealPlan.days.map((day, dIdx) => (
        <div className="meal-day" key={dIdx}>
          <button className="meal-day-toggle" onClick={() => toggleDay(dIdx)}>
            <div className="meal-day-header">
              <h4>{day.day}</h4>
              <span className="meal-day-macros">
                {day.totalCalories} cal · {day.totalProtein}g P · {day.totalCarbs}g C · {day.totalFat}g F
              </span>
            </div>
            {expandedDays.has(dIdx) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {expandedDays.has(dIdx) && (
            <div className="meal-day-meals">
              {day.meals.map((meal, mIdx) => {
                const mealKey = `${dIdx}-${mIdx}`;
                return (
                  <div className="meal-item" key={mIdx}>
                    <button
                      className="meal-item-toggle"
                      onClick={() => toggleMeal(mealKey)}
                    >
                      <div>
                        <strong>{meal.name}</strong>
                        <span className="meal-item-desc">{meal.description}</span>
                      </div>
                      <div className="meal-item-macros">
                        {meal.calories} cal
                        {expandedMeals.has(mealKey) ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </div>
                    </button>

                    {expandedMeals.has(mealKey) && (
                      <div className="meal-item-details">
                        <div className="meal-macros-bar">
                          <span className="macro protein">P: {meal.protein}g</span>
                          <span className="macro carbs">C: {meal.carbs}g</span>
                          <span className="macro fat">F: {meal.fat}g</span>
                        </div>
                        <div className="meal-ingredients">
                          <h5>Ingredients</h5>
                          <ul>
                            {meal.ingredients.map((ing, i) => (
                              <li key={i}>{ing}</li>
                            ))}
                          </ul>
                        </div>
                        {meal.instructions && meal.instructions.length > 0 && (
                          <div className="meal-instructions">
                            <h5>Instructions</h5>
                            <ol>
                              {meal.instructions.map((step, i) => (
                                <li key={i}>{step}</li>
                              ))}
                            </ol>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}

      {mealPlan.shoppingTip && (
        <div className="meal-plan-tip">
          💡 {mealPlan.shoppingTip}
        </div>
      )}
    </motion.div>
  );
}
