import type { ChatMessage, Problem, Difficulty, TopicCategory, UserProgress } from '../types';

const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN as string | undefined;
const GITHUB_MODELS_ENDPOINT = 'https://models.inference.ai.azure.com/chat/completions';
const MODEL = 'claude-sonnet-4';

function buildSystemPrompt(): string {
  return `You are CodePrep AI, an expert coding interview coach specializing in preparing candidates for Software Engineer II positions at fintech companies like Affirm. You create LeetCode-style coding problems, evaluate solutions, and provide detailed explanations.

IMPORTANT RULES:
- When generating problems, ALWAYS return valid JSON in the exact format requested.
- Create realistic, interview-quality problems that test genuine understanding.
- Progressively increase difficulty based on user performance.
- Provide hints that guide thinking without giving away the solution.
- Give detailed explanations covering approach, time/space complexity, and edge cases.
- When acting as an interviewer, behave like a real technical interviewer: ask clarifying questions, give subtle hints, and evaluate problem-solving approach.
- Focus on topics relevant to fintech: data processing, financial calculations, string manipulation, hash maps, dynamic programming, and system design.
- Always use Python as the default language for starter code and solutions.
- Make problems practical and related to real-world scenarios when possible.`;
}

interface ApiMessage {
  role: string;
  content: string;
}

async function callApi(messages: ApiMessage[], maxTokens: number = 4096): Promise<string> {
  if (!GITHUB_TOKEN) {
    throw new Error(
      'GitHub token is not configured. Please set VITE_GITHUB_TOKEN in your .env file.',
    );
  }

  const payload = {
    model: MODEL,
    messages,
    max_tokens: maxTokens,
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
  return data.choices[0].message.content || '';
}

export async function generateProblem(
  difficulty: Difficulty,
  topic: TopicCategory,
  previousProblems: string[] = [],
): Promise<Problem> {
  const avoidList = previousProblems.length > 0
    ? `\nDo NOT generate any of these problems (already seen): ${previousProblems.join(', ')}`
    : '';

  const messages: ApiMessage[] = [
    { role: 'system', content: buildSystemPrompt() },
    {
      role: 'user',
      content: `Generate a ${difficulty} difficulty coding problem about "${topic}".${avoidList}

Return ONLY a valid JSON object with this exact structure (no markdown, no code fences):
{
  "id": "unique-kebab-case-id",
  "title": "Problem Title",
  "difficulty": "${difficulty}",
  "topic": "${topic}",
  "description": "Full problem description with context",
  "examples": [
    { "input": "example input", "output": "expected output", "explanation": "why this is the answer" }
  ],
  "constraints": ["constraint 1", "constraint 2"],
  "starterCode": "def solution(params):\\n    # Your code here\\n    pass",
  "hints": ["hint 1 (gentle nudge)", "hint 2 (approach suggestion)", "hint 3 (detailed guidance)"],
  "solution": "def solution(params):\\n    # Complete solution code",
  "explanation": "Detailed explanation of the approach, why it works, and how to think about it",
  "timeComplexity": "O(n)",
  "spaceComplexity": "O(1)"
}`,
    },
  ];

  const response = await callApi(messages);
  try {
    const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned) as Problem;
  } catch {
    throw new Error('Failed to parse problem from AI response. Please try again.');
  }
}

export async function generateBaselineProblems(): Promise<Problem[]> {
  const baselineConfig: Array<{ difficulty: Difficulty; topic: TopicCategory }> = [
    { difficulty: 'easy', topic: 'arrays-strings' },
    { difficulty: 'easy', topic: 'hash-maps' },
    { difficulty: 'medium', topic: 'two-pointers' },
    { difficulty: 'medium', topic: 'trees' },
    { difficulty: 'hard', topic: 'dynamic-programming' },
  ];

  const problems: Problem[] = [];
  for (const config of baselineConfig) {
    const problem = await generateProblem(config.difficulty, config.topic);
    problems.push(problem);
  }
  return problems;
}

export async function evaluateSolution(
  problem: Problem,
  userCode: string,
): Promise<{ feedback: string; score: number; passed: boolean }> {
  const messages: ApiMessage[] = [
    { role: 'system', content: buildSystemPrompt() },
    {
      role: 'user',
      content: `Evaluate this solution for the following problem:

PROBLEM: ${problem.title}
${problem.description}

Examples:
${problem.examples.map((e) => `Input: ${e.input} → Output: ${e.output}`).join('\n')}

USER'S CODE:
\`\`\`python
${userCode}
\`\`\`

Return ONLY a valid JSON object (no markdown, no code fences):
{
  "feedback": "Detailed feedback on the solution including correctness, efficiency, code quality, and edge cases",
  "score": 85,
  "passed": true
}

Score from 0-100. passed=true if the solution is functionally correct for all cases.`,
    },
  ];

  const response = await callApi(messages, 2048);
  try {
    const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return {
      feedback: 'Unable to evaluate your solution automatically. Please review it manually.',
      score: 0,
      passed: false,
    };
  }
}

export async function getHint(
  problem: Problem,
  hintLevel: number,
  userCode: string,
): Promise<string> {
  const levels = ['a gentle nudge in the right direction', 'a suggested approach or pattern to use', 'detailed step-by-step guidance'];
  const levelDesc = levels[Math.min(hintLevel, 2)];

  const messages: ApiMessage[] = [
    { role: 'system', content: buildSystemPrompt() },
    {
      role: 'user',
      content: `For this problem, provide ${levelDesc}:

PROBLEM: ${problem.title}
${problem.description}

User's current code:
\`\`\`python
${userCode}
\`\`\`

Provide a helpful hint without giving away the full solution. Be concise and encouraging.`,
    },
  ];

  return await callApi(messages, 1024);
}

export async function getDetailedExplanation(problem: Problem): Promise<string> {
  const messages: ApiMessage[] = [
    { role: 'system', content: buildSystemPrompt() },
    {
      role: 'user',
      content: `Provide a detailed explanation for this problem:

PROBLEM: ${problem.title}
${problem.description}

SOLUTION:
\`\`\`python
${problem.solution || 'No solution available'}
\`\`\`

Include:
1. Intuition behind the approach
2. Step-by-step walkthrough with an example
3. Why this approach is optimal
4. Common mistakes and edge cases
5. Related problems and patterns
6. Time and space complexity analysis`,
    },
  ];

  return await callApi(messages, 3000);
}

export async function conductInterview(
  messages: ChatMessage[],
): Promise<string> {
  const apiMessages: ApiMessage[] = [
    {
      role: 'system',
      content: `${buildSystemPrompt()}

You are now in INTERVIEW MODE. Act as a real technical interviewer at a fintech company.
- Start by presenting the problem clearly
- Ask the candidate to think out loud
- If they're stuck, provide subtle hints (not solutions)
- Ask follow-up questions about time/space complexity
- Ask about edge cases
- Be professional but encouraging
- At the end, provide constructive feedback on their approach
- Keep responses concise, like a real interviewer would`,
    },
    ...messages.map((m) => ({ role: m.role, content: m.content })),
  ];

  return await callApi(apiMessages, 2048);
}

export async function getNextDifficulty(progress: UserProgress): Promise<Difficulty> {
  const totalSolved = Object.keys(progress.problemsSolved).length;
  if (totalSolved < 5) return 'easy';
  if (totalSolved < 15) return 'medium';

  const recentProblems = Object.values(progress.problemsSolved)
    .sort((a, b) => new Date(b.solvedAt).getTime() - new Date(a.solvedAt).getTime())
    .slice(0, 5);

  const avgHints = recentProblems.reduce((sum, p) => sum + p.hintsUsed, 0) / recentProblems.length;
  const avgAttempts = recentProblems.reduce((sum, p) => sum + p.attempts, 0) / recentProblems.length;

  if (avgHints < 1 && avgAttempts <= 1.5) return 'hard';
  if (avgHints < 2 && avgAttempts <= 2) return 'medium';
  return 'easy';
}

export async function getWeakestTopic(progress: UserProgress): Promise<TopicCategory> {
  const topicEntries = Object.entries(progress.topicScores) as Array<[TopicCategory, { totalAttempted: number; proficiency: string }]>;

  if (topicEntries.length === 0) return 'arrays-strings';

  const weakest = topicEntries
    .filter(([, score]) => score.totalAttempted > 0)
    .sort((a, b) => {
      const profOrder = { beginner: 0, intermediate: 1, advanced: 2, expert: 3 };
      const aOrder = profOrder[a[1].proficiency as keyof typeof profOrder] ?? 0;
      const bOrder = profOrder[b[1].proficiency as keyof typeof profOrder] ?? 0;
      return aOrder - bOrder;
    });

  return weakest.length > 0 ? weakest[0][0] : 'arrays-strings';
}
