import { Dumbbell, UtensilsCrossed, ShoppingCart, BarChart3, Zap, Scale, Heart, Timer } from 'lucide-react';

interface QuickActionsProps {
  onAction: (prompt: string) => void;
  disabled: boolean;
}

const actions = [
  {
    icon: <Dumbbell size={16} />,
    label: 'Full Body Workout',
    prompt: 'Create a 45-minute full body workout for intermediate level with dumbbells and a bench.',
    color: 'workout',
  },
  {
    icon: <Zap size={16} />,
    label: 'HIIT Session',
    prompt: 'Create a 20-minute high-intensity interval training (HIIT) workout that requires no equipment.',
    color: 'workout',
  },
  {
    icon: <Heart size={16} />,
    label: 'Push/Pull/Legs',
    prompt: 'Create a push day workout for muscle building, intermediate level, about 60 minutes with full gym equipment.',
    color: 'workout',
  },
  {
    icon: <Timer size={16} />,
    label: 'Quick Morning Routine',
    prompt: 'Create a quick 15-minute morning workout routine that I can do at home with no equipment to start my day with energy.',
    color: 'workout',
  },
  {
    icon: <UtensilsCrossed size={16} />,
    label: 'Muscle Gain Meal Plan',
    prompt: 'Create a 3-day high protein meal plan for muscle gain targeting 2,500 calories per day with at least 180g protein.',
    color: 'meal',
  },
  {
    icon: <Scale size={16} />,
    label: 'Weight Loss Meal Plan',
    prompt: 'Create a 3-day meal plan for weight loss targeting 1,800 calories per day. Focus on high protein, moderate carbs, and healthy fats.',
    color: 'meal',
  },
  {
    icon: <ShoppingCart size={16} />,
    label: 'Weekly Grocery List ($75)',
    prompt: 'Create a weekly grocery list for a healthy, high-protein diet with a $75 budget. Compare prices at Amazon Grocery, Target, HEB, and Central Market.',
    color: 'grocery',
  },
  {
    icon: <BarChart3 size={16} />,
    label: 'Compare Store Prices',
    prompt: 'Compare prices for these items across Amazon Grocery, Target, HEB, and Central Market: chicken breast (3 lbs), brown rice (2 lbs), broccoli (2 lbs), eggs (1 dozen), Greek yogurt (32 oz), sweet potatoes (3 lbs), olive oil (16 oz), and oats (42 oz).',
    color: 'compare',
  },
];

export function QuickActions({ onAction, disabled }: QuickActionsProps) {
  return (
    <div className="quick-actions">
      <h3 className="quick-actions-title">Quick Actions</h3>
      <div className="quick-actions-grid">
        {actions.map((action, i) => (
          <button
            key={i}
            className={`quick-action-btn ${action.color}`}
            onClick={() => onAction(action.prompt)}
            disabled={disabled}
            title={action.prompt}
          >
            {action.icon}
            <span>{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
