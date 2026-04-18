import { useState, useCallback } from 'react';
import type { UserProgress, TopicCategory, TopicScore } from '../types';

const STORAGE_KEY = 'leetcode-prep-progress';

function getDefaultProgress(): UserProgress {
  return {
    totalCompleted: 0,
    problemsSolved: {},
    topicScores: {} as Record<TopicCategory, TopicScore>,
    currentLevel: 'easy',
    baselineCompleted: false,
    streak: 0,
    lastPracticeDate: null,
    interviewsCompleted: 0,
    totalTimeSpentMinutes: 0,
  };
}

function loadProgress(): UserProgress {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored) as UserProgress;
  } catch {
    // Ignore parse errors
  }
  return getDefaultProgress();
}

export function useProgress() {
  const [progress, setProgress] = useState<UserProgress>(loadProgress);

  const saveProgress = useCallback((updated: UserProgress) => {
    // Update streak
    const today = new Date().toISOString().split('T')[0];
    if (updated.lastPracticeDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      if (updated.lastPracticeDate === yesterday) {
        updated.streak += 1;
      } else if (updated.lastPracticeDate !== today) {
        updated.streak = 1;
      }
      updated.lastPracticeDate = today;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setProgress(updated);
  }, []);

  const resetProgress = useCallback(() => {
    const defaultProgress = getDefaultProgress();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultProgress));
    setProgress(defaultProgress);
  }, []);

  return { progress, saveProgress, resetProgress };
}
