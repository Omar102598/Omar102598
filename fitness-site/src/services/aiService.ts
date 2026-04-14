import { toolDefinitions } from '../tools/definitions';
import type { ChatMessage, ToolResult } from '../types';

const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN as string | undefined;
const GITHUB_MODELS_ENDPOINT = 'https://models.inference.ai.azure.com/chat/completions';
const MODEL = 'gpt-4o-mini';

const SYSTEM_PROMPT = `You are FitAI, an expert fitness coach, nutritionist, and grocery shopping assistant. You help users with:

1. **Workout Plans**: Create detailed, structured workout routines tailored to goals (muscle building, fat loss, endurance, strength, flexibility), fitness levels, equipment availability, and time constraints.

2. **Meal Plans**: Design nutrition plans with complete macros, recipes, and ingredient lists based on calorie targets, dietary restrictions, and goals.

3. **Grocery Lists**: Generate shopping lists with estimated prices from Amazon Grocery, Target, HEB, and Central Market. Help users stay within budget.

4. **Price Comparisons**: Compare grocery prices across stores to find the best deals. Provide category-by-category breakdowns.

IMPORTANT RULES:
- Always use the provided tools to return structured data. Do NOT just describe workouts or meal plans in plain text—call the appropriate tool.
- When generating grocery prices, provide realistic estimates based on typical US grocery prices. Amazon Grocery tends to be mid-range, Target is competitive on packaged goods, HEB is known for great value especially on store brands and produce in Texas, and Central Market is a premium store with higher prices but better quality specialty items.
- When a user asks for a grocery list or meal plan with a budget, factor the budget into your recommendations.
- Be encouraging, knowledgeable, and specific. Use proper exercise form cues and nutrition science.
- If the user asks a general fitness or nutrition question without needing structured data, respond conversationally without calling tools.
- For price estimates, always include the disclaimer that these are AI estimates.`;

interface ApiMessage {
  role: string;
  content: string | null;
  tool_calls?: Array<{
    id: string;
    type: string;
    function: { name: string; arguments: string };
  }>;
  tool_call_id?: string;
}

export interface AiResponse {
  content: string;
  toolResults: ToolResult[];
}

export async function sendChatMessage(
  messages: ChatMessage[],
): Promise<AiResponse> {
  if (!GITHUB_TOKEN) {
    throw new Error(
      'GitHub token is not configured. Please set VITE_GITHUB_TOKEN in your .env file.',
    );
  }

  const apiMessages: ApiMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...messages.map((m) => {
      const msg: ApiMessage = { role: m.role, content: m.content };
      if (m.tool_call_id) msg.tool_call_id = m.tool_call_id;
      if (m.tool_calls) msg.tool_calls = m.tool_calls;
      return msg;
    }),
  ];

  const payload = {
    model: MODEL,
    messages: apiMessages,
    tools: toolDefinitions,
    tool_choice: 'auto',
    max_tokens: 4096,
    temperature: 0.7,
  };

  const response = await fetch(GITHUB_MODELS_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GITHUB_TOKEN}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API request failed (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const choice = data.choices[0];
  const assistantMessage = choice.message;

  // If the model wants to call tools, process them
  if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
    const toolResults: ToolResult[] = [];
    const toolResponseMessages: ApiMessage[] = [];

    for (const toolCall of assistantMessage.tool_calls) {
      const { name, arguments: argsStr } = toolCall.function;
      let parsed: unknown;
      try {
        parsed = JSON.parse(argsStr);
      } catch {
        parsed = {};
      }

      let result: ToolResult | null = null;
      switch (name) {
        case 'generate_workout':
          result = { type: 'workout', data: parsed as ToolResult extends { type: 'workout'; data: infer D } ? D : never };
          break;
        case 'generate_meal_plan':
          result = { type: 'meal_plan', data: parsed as ToolResult extends { type: 'meal_plan'; data: infer D } ? D : never };
          break;
        case 'generate_grocery_list':
          result = { type: 'grocery_list', data: parsed as ToolResult extends { type: 'grocery_list'; data: infer D } ? D : never };
          break;
        case 'compare_store_prices':
          result = { type: 'price_comparison', data: parsed as ToolResult extends { type: 'price_comparison'; data: infer D } ? D : never };
          break;
      }

      if (result) {
        toolResults.push(result);
      }

      // Send tool result back to the model
      toolResponseMessages.push({
        role: 'tool',
        content: JSON.stringify(parsed),
        tool_call_id: toolCall.id,
      });
    }

    // Make a follow-up call to get the assistant's summary
    const followUpMessages: ApiMessage[] = [
      ...apiMessages,
      {
        role: 'assistant',
        content: assistantMessage.content,
        tool_calls: assistantMessage.tool_calls,
      },
      ...toolResponseMessages,
    ];

    const followUpPayload = {
      model: MODEL,
      messages: followUpMessages,
      max_tokens: 1024,
      temperature: 0.7,
    };

    const followUpResponse = await fetch(GITHUB_MODELS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GITHUB_TOKEN}`,
      },
      body: JSON.stringify(followUpPayload),
    });

    if (followUpResponse.ok) {
      const followUpData = await followUpResponse.json();
      const summary = followUpData.choices[0].message.content || '';
      return { content: summary, toolResults };
    }

    // If follow-up fails, return tool results with a generic message
    return {
      content: 'Here\'s what I put together for you! Check out the details below.',
      toolResults,
    };
  }

  // No tool calls — just a text response
  return {
    content: assistantMessage.content || '',
    toolResults: [],
  };
}
