export const toolDefinitions = [
  {
    type: 'function' as const,
    function: {
      name: 'generate_workout',
      description:
        'Generate a structured workout plan based on the user\'s goals, available equipment, fitness level, target muscle groups, and desired duration. Always use this tool when the user asks for a workout, exercise routine, or training plan.',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'A descriptive title for the workout' },
          goal: {
            type: 'string',
            description: 'Primary fitness goal (e.g., muscle building, fat loss, endurance, strength, flexibility)',
          },
          difficulty: {
            type: 'string',
            enum: ['Beginner', 'Intermediate', 'Advanced'],
            description: 'Difficulty level',
          },
          durationMinutes: { type: 'number', description: 'Total workout duration in minutes' },
          muscleGroups: {
            type: 'array',
            items: { type: 'string' },
            description: 'Target muscle groups',
          },
          warmup: {
            type: 'array',
            items: { type: 'string' },
            description: 'List of warm-up exercises/stretches',
          },
          sections: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string', description: 'Section name (e.g., Compound Movements, Isolation Work, Circuit)' },
                exercises: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                      sets: { type: 'number' },
                      reps: { type: 'string', description: 'Rep range or duration (e.g., "8-12", "30 seconds")' },
                      restSeconds: { type: 'number' },
                      notes: { type: 'string' },
                    },
                    required: ['name', 'sets', 'reps', 'restSeconds'],
                  },
                },
              },
              required: ['name', 'exercises'],
            },
          },
          cooldown: {
            type: 'array',
            items: { type: 'string' },
            description: 'List of cool-down stretches/exercises',
          },
          tips: {
            type: 'array',
            items: { type: 'string' },
            description: 'Helpful tips for the workout',
          },
        },
        required: ['title', 'goal', 'difficulty', 'durationMinutes', 'muscleGroups', 'warmup', 'sections', 'cooldown', 'tips'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'generate_meal_plan',
      description:
        'Generate a structured meal plan with recipes, macros, and ingredients. Always use this tool when the user asks for meal plans, diet plans, nutrition advice, or what to eat.',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'A descriptive title for the meal plan' },
          goal: { type: 'string', description: 'Nutrition goal (e.g., muscle gain, weight loss, maintenance)' },
          dailyCalorieTarget: { type: 'number', description: 'Target daily calorie intake' },
          dietaryNotes: {
            type: 'array',
            items: { type: 'string' },
            description: 'Dietary notes, restrictions, or preferences',
          },
          days: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                day: { type: 'string' },
                meals: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      name: { type: 'string', description: 'Meal name (e.g., Breakfast, Lunch, Dinner, Snack)' },
                      description: { type: 'string', description: 'Brief description of the meal' },
                      calories: { type: 'number' },
                      protein: { type: 'number', description: 'Protein in grams' },
                      carbs: { type: 'number', description: 'Carbs in grams' },
                      fat: { type: 'number', description: 'Fat in grams' },
                      ingredients: { type: 'array', items: { type: 'string' } },
                      instructions: { type: 'array', items: { type: 'string' } },
                    },
                    required: ['name', 'description', 'calories', 'protein', 'carbs', 'fat', 'ingredients', 'instructions'],
                  },
                },
                totalCalories: { type: 'number' },
                totalProtein: { type: 'number' },
                totalCarbs: { type: 'number' },
                totalFat: { type: 'number' },
              },
              required: ['day', 'meals', 'totalCalories', 'totalProtein', 'totalCarbs', 'totalFat'],
            },
          },
          shoppingTip: { type: 'string', description: 'Optional shopping or meal prep tip' },
        },
        required: ['title', 'goal', 'dailyCalorieTarget', 'dietaryNotes', 'days'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'generate_grocery_list',
      description:
        'Generate a grocery list with estimated prices from Amazon Grocery, Target, HEB, and Central Market. Always use this tool when the user asks for a grocery list, shopping list, or what to buy. Include price estimates per store and identify the best deal.',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'A descriptive title for the grocery list' },
          budget: { type: 'number', description: 'Target budget in USD' },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                quantity: { type: 'string', description: 'Quantity with unit (e.g., "2 lbs", "1 dozen", "16 oz")' },
                category: {
                  type: 'string',
                  description: 'Category (e.g., Produce, Protein, Dairy, Grains, Pantry, Frozen, Snacks)',
                },
                estimatedPrices: {
                  type: 'object',
                  properties: {
                    amazon: { type: 'number', description: 'Estimated price at Amazon Grocery in USD' },
                    target: { type: 'number', description: 'Estimated price at Target in USD' },
                    heb: { type: 'number', description: 'Estimated price at HEB in USD' },
                    centralMarket: { type: 'number', description: 'Estimated price at Central Market in USD' },
                  },
                },
              },
              required: ['name', 'quantity', 'category', 'estimatedPrices'],
            },
          },
          storeTotals: {
            type: 'object',
            properties: {
              amazon: { type: 'number' },
              target: { type: 'number' },
              heb: { type: 'number' },
              centralMarket: { type: 'number' },
            },
            description: 'Total estimated cost at each store',
          },
          bestValueStore: { type: 'string', description: 'The store with the lowest total cost' },
          savings: { type: 'string', description: 'How much you save by shopping at the best value store' },
          disclaimer: {
            type: 'string',
            description: 'Always include: Prices are AI estimates based on typical pricing and may vary. Check store websites or apps for current prices.',
          },
        },
        required: ['title', 'budget', 'items', 'storeTotals', 'bestValueStore', 'savings', 'disclaimer'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'compare_store_prices',
      description:
        'Compare prices for specific grocery items across Amazon Grocery, Target, HEB, and Central Market. Use this tool when the user asks to compare prices, find the cheapest store, or find the best deal for specific items.',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'A descriptive title for the comparison' },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                quantity: { type: 'string' },
                category: { type: 'string' },
                estimatedPrices: {
                  type: 'object',
                  properties: {
                    amazon: { type: 'number' },
                    target: { type: 'number' },
                    heb: { type: 'number' },
                    centralMarket: { type: 'number' },
                  },
                },
              },
              required: ['name', 'quantity', 'category', 'estimatedPrices'],
            },
          },
          storeTotals: {
            type: 'object',
            properties: {
              amazon: { type: 'number' },
              target: { type: 'number' },
              heb: { type: 'number' },
              centralMarket: { type: 'number' },
            },
          },
          recommendation: { type: 'string', description: 'Detailed recommendation on where to shop and why' },
          breakdown: { type: 'string', description: 'Category-by-category breakdown of which store wins' },
          disclaimer: { type: 'string' },
        },
        required: ['title', 'items', 'storeTotals', 'recommendation', 'breakdown', 'disclaimer'],
      },
    },
  },
];
