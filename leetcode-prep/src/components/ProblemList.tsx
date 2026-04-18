import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Play, Filter } from 'lucide-react';
import type { Problem, Difficulty, TopicCategory, UserProgress, AppView } from '../types';
import { generateProblem, getNextDifficulty, getWeakestTopic } from '../services/aiService';
import { topics } from '../data/topics';

interface ProblemListProps {
  progress: UserProgress;
  onSelectProblem: (problem: Problem) => void;
  onNavigate: (view: AppView) => void;
}

export default function ProblemList({ progress, onSelectProblem, onNavigate }: ProblemListProps) {
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | 'all'>('all');
  const [selectedTopic, setSelectedTopic] = useState<TopicCategory | 'all'>('all');
  const [generatedProblems, setGeneratedProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateNewProblem = async (difficulty?: Difficulty, topic?: TopicCategory) => {
    setLoading(true);
    setError(null);
    try {
      const diff = difficulty || (selectedDifficulty !== 'all' ? selectedDifficulty : await getNextDifficulty(progress));
      const top = topic || (selectedTopic !== 'all' ? selectedTopic : await getWeakestTopic(progress));
      const existingTitles = generatedProblems.map((p) => p.title);
      const problem = await generateProblem(diff, top, existingTitles);
      setGeneratedProblems((prev) => [problem, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate problem');
    } finally {
      setLoading(false);
    }
  };

  const generateRecommended = async () => {
    const diff = await getNextDifficulty(progress);
    const topic = await getWeakestTopic(progress);
    await generateNewProblem(diff, topic);
  };

  const filteredProblems = generatedProblems.filter((p) => {
    if (selectedDifficulty !== 'all' && p.difficulty !== selectedDifficulty) return false;
    if (selectedTopic !== 'all' && p.topic !== selectedTopic) return false;
    return true;
  });

  return (
    <div className="problem-list-page">
      <motion.div
        className="problem-list-header"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="gradient-text">Practice Problems</h1>
        <p>Generate AI-powered coding problems tailored to your skill level</p>
      </motion.div>

      {!progress.baselineCompleted && (
        <div className="baseline-notice">
          <p>💡 Complete the baseline assessment for personalized recommendations.</p>
          <button className="btn-secondary btn-sm" onClick={() => onNavigate('baseline')}>
            Take Assessment
          </button>
        </div>
      )}

      <div className="problem-controls">
        <div className="filters">
          <div className="filter-group">
            <Filter size={16} />
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value as Difficulty | 'all')}
              className="filter-select"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div className="filter-group">
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value as TopicCategory | 'all')}
              className="filter-select"
            >
              <option value="all">All Topics</option>
              {topics.map((t) => (
                <option key={t.id} value={t.id}>{t.icon} {t.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="generate-actions">
          {progress.baselineCompleted && (
            <button
              className="btn-secondary"
              onClick={generateRecommended}
              disabled={loading}
            >
              🎯 Recommended
            </button>
          )}
          <button
            className="btn-primary"
            onClick={() => generateNewProblem()}
            disabled={loading}
          >
            {loading ? <><Loader2 size={18} className="spinner" /> Generating...</> : <><Play size={18} /> Generate Problem</>}
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      <div className="problems-container">
        {filteredProblems.length === 0 && !loading ? (
          <div className="empty-state">
            <h3>No problems yet</h3>
            <p>Click "Generate Problem" to create your first AI-generated coding challenge!</p>
          </div>
        ) : (
          filteredProblems.map((problem, index) => (
            <motion.div
              key={problem.id + index}
              className="problem-card"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSelectProblem(problem)}
            >
              <div className="problem-card-header">
                <h3>{problem.title}</h3>
                <span className={`diff-badge ${problem.difficulty}`}>{problem.difficulty}</span>
              </div>
              <p className="problem-card-desc">{problem.description.slice(0, 150)}...</p>
              <div className="problem-card-tags">
                <span className="topic-tag">{topics.find((t) => t.id === problem.topic)?.icon} {topics.find((t) => t.id === problem.topic)?.name}</span>
                {problem.hints.length > 0 && <span className="hint-count">{problem.hints.length} hints</span>}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
