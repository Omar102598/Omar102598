export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string | null;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
}

export interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

export interface WorkoutExercise {
  name: string;
  sets: number;
  reps: string;
  restSeconds: number;
  notes?: string;
}

export interface WorkoutSection {
  name: string;
  exercises: WorkoutExercise[];
}

export interface Workout {
  title: string;
  goal: string;
  difficulty: string;
  durationMinutes: number;
  muscleGroups: string[];
  warmup: string[];
  sections: WorkoutSection[];
  cooldown: string[];
  tips: string[];
}

export interface Meal {
  name: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: string[];
  instructions: string[];
}

export interface DayMealPlan {
  day: string;
  meals: Meal[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

export interface MealPlan {
  title: string;
  goal: string;
  dailyCalorieTarget: number;
  dietaryNotes: string[];
  days: DayMealPlan[];
  shoppingTip?: string;
}

export interface GroceryItem {
  name: string;
  quantity: string;
  category: string;
  estimatedPrices: StorePrices;
}

export interface StorePrices {
  [key: string]: number | undefined;
  amazon?: number;
  target?: number;
  heb?: number;
  centralMarket?: number;
}

export interface GroceryList {
  title: string;
  budget: number;
  items: GroceryItem[];
  storeTotals: StorePrices;
  bestValueStore: string;
  savings: string;
  disclaimer: string;
}

export interface PriceComparison {
  title: string;
  items: GroceryItem[];
  storeTotals: StorePrices;
  recommendation: string;
  breakdown: string;
  disclaimer: string;
}

export type ToolResult =
  | { type: 'workout'; data: Workout }
  | { type: 'meal_plan'; data: MealPlan }
  | { type: 'grocery_list'; data: GroceryList }
  | { type: 'price_comparison'; data: PriceComparison };

export interface DisplayMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  toolResults?: ToolResult[];
  timestamp: Date;
}
