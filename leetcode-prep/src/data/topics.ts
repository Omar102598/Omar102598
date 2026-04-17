import type { TopicCategory } from '../types';

export interface TopicInfo {
  id: TopicCategory;
  name: string;
  description: string;
  icon: string;
  affirmRelevance: 'high' | 'medium' | 'low';
}

export const topics: TopicInfo[] = [
  {
    id: 'arrays-strings',
    name: 'Arrays & Strings',
    description: 'Array manipulation, string processing, and pattern matching',
    icon: '📊',
    affirmRelevance: 'high',
  },
  {
    id: 'hash-maps',
    name: 'Hash Maps & Sets',
    description: 'Hash-based data structures for efficient lookups and counting',
    icon: '🗂️',
    affirmRelevance: 'high',
  },
  {
    id: 'two-pointers',
    name: 'Two Pointers',
    description: 'Two-pointer techniques for sorted arrays and linked lists',
    icon: '👆',
    affirmRelevance: 'high',
  },
  {
    id: 'sliding-window',
    name: 'Sliding Window',
    description: 'Sliding window patterns for subarray/substring problems',
    icon: '🪟',
    affirmRelevance: 'high',
  },
  {
    id: 'linked-lists',
    name: 'Linked Lists',
    description: 'Singly and doubly linked list operations and algorithms',
    icon: '🔗',
    affirmRelevance: 'medium',
  },
  {
    id: 'trees',
    name: 'Trees & BSTs',
    description: 'Binary trees, BSTs, traversals, and tree-based algorithms',
    icon: '🌳',
    affirmRelevance: 'high',
  },
  {
    id: 'graphs',
    name: 'Graphs',
    description: 'Graph traversal, shortest paths, and connectivity problems',
    icon: '🕸️',
    affirmRelevance: 'medium',
  },
  {
    id: 'dynamic-programming',
    name: 'Dynamic Programming',
    description: 'Optimal substructure and overlapping subproblems',
    icon: '🧩',
    affirmRelevance: 'high',
  },
  {
    id: 'recursion-backtracking',
    name: 'Recursion & Backtracking',
    description: 'Recursive problem-solving and constraint satisfaction',
    icon: '🔄',
    affirmRelevance: 'medium',
  },
  {
    id: 'sorting-searching',
    name: 'Sorting & Searching',
    description: 'Sorting algorithms, binary search, and search strategies',
    icon: '🔍',
    affirmRelevance: 'high',
  },
  {
    id: 'stacks-queues',
    name: 'Stacks & Queues',
    description: 'Stack and queue-based problem solving, monotonic stacks',
    icon: '📚',
    affirmRelevance: 'medium',
  },
  {
    id: 'math-logic',
    name: 'Math & Logic',
    description: 'Mathematical reasoning, financial calculations, and number theory',
    icon: '🔢',
    affirmRelevance: 'high',
  },
  {
    id: 'system-design',
    name: 'System Design',
    description: 'High-level system design and architecture concepts',
    icon: '🏗️',
    affirmRelevance: 'medium',
  },
];

export const topicMap = new Map(topics.map((t) => [t.id, t]));

export function getTopicName(id: TopicCategory): string {
  return topicMap.get(id)?.name ?? id;
}
