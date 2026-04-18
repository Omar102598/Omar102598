export type Difficulty = 'easy' | 'medium' | 'hard';

export type TopicCategory =
  | 'arrays-strings'
  | 'hash-maps'
  | 'two-pointers'
  | 'sliding-window'
  | 'linked-lists'
  | 'trees'
  | 'graphs'
  | 'dynamic-programming'
  | 'recursion-backtracking'
  | 'sorting-searching'
  | 'stacks-queues'
  | 'math-logic'
  | 'system-design';

export interface Problem {
  id: string;
  title: string;
  difficulty: Difficulty;
  topic: TopicCategory;
  description: string;
  examples: ProblemExample[];
  constraints: string[];
  starterCode: string;
  hints: string[];
  solution?: string;
  explanation?: string;
  timeComplexity?: string;
  spaceComplexity?: string;
}

export interface ProblemExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface UserProgress {
  totalCompleted: number;
  problemsSolved: Record<string, SolvedProblem>;
  topicScores: Record<TopicCategory, TopicScore>;
  currentLevel: Difficulty;
  baselineCompleted: boolean;
  streak: number;
  lastPracticeDate: string | null;
  interviewsCompleted: number;
  totalTimeSpentMinutes: number;
}

export interface SolvedProblem {
  problemId: string;
  solvedAt: string;
  difficulty: Difficulty;
  topic: TopicCategory;
  timeSpentSeconds: number;
  hintsUsed: number;
  attempts: number;
}

export interface TopicScore {
  topic: TopicCategory;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  totalAttempted: number;
  averageTimeSeconds: number;
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface InterviewSession {
  id: string;
  startedAt: string;
  endedAt?: string;
  problems: InterviewProblem[];
  totalTimeMinutes: number;
  feedback?: string;
  overallScore?: number;
}

export interface InterviewProblem {
  problem: Problem;
  userCode: string;
  timeSpentSeconds: number;
  completed: boolean;
  feedback?: string;
  score?: number;
}

export type AppView =
  | 'dashboard'
  | 'baseline'
  | 'problems'
  | 'problem-solve'
  | 'interview'
  | 'interview-active'
  | 'articles'
  | 'article-view';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}
