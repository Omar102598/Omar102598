// GitHub Models API — powered by your GitHub Copilot subscription.
// Set VITE_GITHUB_TOKEN in a local .env file (never commit the real token).
//
// ⚠️  Security note: Vite embeds VITE_* variables in the client-side bundle.
// To minimise exposure, use a Fine-grained PAT with ONLY the `models:read`
// permission so it cannot be used to access repositories or other resources.
// For a production site that needs tighter security, move this call to a
// serverless function / backend proxy so the token stays server-side.
const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN as string | undefined;
const GITHUB_MODELS_ENDPOINT = 'https://models.inference.ai.azure.com/chat/completions';
const MODEL = 'gpt-4o-mini';

const SYSTEM_PROMPT =
  "You are an AI assistant for Omar's portfolio. Help visitors learn about Omar's skills, projects, and experience as a senior software engineer.";

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function sendChatMessage(messages: ChatMessage[]): Promise<string> {
  if (!GITHUB_TOKEN) {
    throw new Error('GitHub token is not configured. Please set VITE_GITHUB_TOKEN in your .env file.');
  }

  const payload = {
    model: MODEL,
    messages: [{ role: 'system' as const, content: SYSTEM_PROMPT }, ...messages],
    max_tokens: 300,
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
    throw new Error(`API request failed: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}
