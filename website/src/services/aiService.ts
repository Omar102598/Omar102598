// GitHub Models API — powered by your GitHub Copilot subscription.
// Set VITE_GITHUB_TOKEN in your .env.local file to a GitHub Personal Access Token
// scoped to "models:read" only.
//
// ⚠️  Security note: because this is a purely client-side app the token will be
//    bundled into the JavaScript served to visitors' browsers.  To keep exposure
//    minimal, generate a fine-grained PAT with ONLY the "models:read" permission
//    and no other scopes.  This limits the token to read-only model inference and
//    makes it safe to revoke / rotate any time.  For higher-security deployments,
//    route the request through a server-side proxy that keeps the token secret.
const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN as string | undefined;
const GITHUB_MODELS_ENDPOINT = 'https://models.inference.ai.azure.com/chat/completions';

const SYSTEM_PROMPT =
  "You are an AI assistant for Omar's portfolio. Help visitors learn about Omar's skills, projects, and experience as a senior software engineer.";

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function sendChatMessage(messages: ChatMessage[]): Promise<string> {
  if (!GITHUB_TOKEN) {
    throw new Error('VITE_GITHUB_TOKEN is not set. Please add it to your .env.local file.');
  }

  const payload = {
    model: 'gpt-4o-mini',
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
