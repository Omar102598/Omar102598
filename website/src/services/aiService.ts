const OPENAI_API_KEY = 'PLACEHOLDER_OPENAI_API_KEY';
const SYSTEM_PROMPT =
  "You are an AI assistant for Omar's portfolio. Help visitors learn about Omar's skills, projects, and experience as a senior software engineer.";

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function sendChatMessage(messages: ChatMessage[]): Promise<string> {
  const payload = {
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'system' as const, content: SYSTEM_PROMPT }, ...messages],
    max_tokens: 300,
    temperature: 0.7,
  };

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}
