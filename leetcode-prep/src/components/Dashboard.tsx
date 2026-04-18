import { motion } from 'framer-motion';
import { Trophy, Flame, Clock, Target, TrendingUp, Zap, BookOpen, Swords, GraduationCap } from 'lucide-react';
import type { UserProgress, AppView } from '../types';
import { topics } from '../data/topics';

interface DashboardProps {
  progress: UserProgress;
  onNavigate: (view: AppView) => void;
}

export default function Dashboard({ progress, onNavigate }: DashboardProps) {
  const totalSolved = Object.keys(progress.problemsSolved).length;
  const solvedByDifficulty = Object.values(progress.problemsSolved).reduce(
    (acc, p) => {
      acc[p.difficulty] = (acc[p.difficulty] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <div className="dashboard">
      <motion.div
        className="dashboard-header"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="gradient-text">Your Interview Prep Dashboard</h1>
        <p className="dashboard-subtitle">
          {progress.baselineCompleted
            ? 'Keep pushing! Consistency is key to acing your interview.'
            : 'Take the baseline assessment to get personalized problem recommendations.'}
        </p>
      </motion.div>

      {!progress.baselineCompleted && (
        <motion.div
          className="baseline-cta"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="cta-content">
            <Zap size={32} className="cta-icon" />
            <div>
              <h2>Start Your Assessment</h2>
              <p>Take a quick 5-problem assessment to determine your skill level and get personalized recommendations.</p>
            </div>
          </div>
          <button className="btn-primary" onClick={() => onNavigate('baseline')}>
            Begin Assessment
          </button>
        </motion.div>
      )}

      <div className="stats-grid">
        <motion.div
          className="stat-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Trophy size={24} className="stat-icon" />
          <div className="stat-value">{totalSolved}</div>
          <div className="stat-label">Problems Solved</div>
        </motion.div>

        <motion.div
          className="stat-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Flame size={24} className="stat-icon streak" />
          <div className="stat-value">{progress.streak}</div>
          <div className="stat-label">Day Streak</div>
        </motion.div>

        <motion.div
          className="stat-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Clock size={24} className="stat-icon" />
          <div className="stat-value">{Math.round(progress.totalTimeSpentMinutes)}</div>
          <div className="stat-label">Minutes Practiced</div>
        </motion.div>

        <motion.div
          className="stat-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Swords size={24} className="stat-icon" />
          <div className="stat-value">{progress.interviewsCompleted}</div>
          <div className="stat-label">Mock Interviews</div>
        </motion.div>
      </div>

      <div className="dashboard-sections">
        <motion.div
          className="difficulty-breakdown"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2><Target size={20} /> Difficulty Breakdown</h2>
          <div className="difficulty-bars">
            <div className="difficulty-bar-row">
              <span className="diff-label easy">Easy</span>
              <div className="diff-bar-track">
                <div
                  className="diff-bar-fill easy"
                  style={{ width: `${Math.min(((solvedByDifficulty['easy'] || 0) / Math.max(totalSolved, 1)) * 100, 100)}%` }}
                />
              </div>
              <span className="diff-count">{solvedByDifficulty['easy'] || 0}</span>
            </div>
            <div className="difficulty-bar-row">
              <span className="diff-label medium">Medium</span>
              <div className="diff-bar-track">
                <div
                  className="diff-bar-fill medium"
                  style={{ width: `${Math.min(((solvedByDifficulty['medium'] || 0) / Math.max(totalSolved, 1)) * 100, 100)}%` }}
                />
              </div>
              <span className="diff-count">{solvedByDifficulty['medium'] || 0}</span>
            </div>
            <div className="difficulty-bar-row">
              <span className="diff-label hard">Hard</span>
              <div className="diff-bar-track">
                <div
                  className="diff-bar-fill hard"
                  style={{ width: `${Math.min(((solvedByDifficulty['hard'] || 0) / Math.max(totalSolved, 1)) * 100, 100)}%` }}
                />
              </div>
              <span className="diff-count">{solvedByDifficulty['hard'] || 0}</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="topic-progress"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2><TrendingUp size={20} /> Topic Progress</h2>
          <div className="topic-grid">
            {topics.map((topic) => {
              const score = progress.topicScores[topic.id];
              const total = score ? score.easySolved + score.mediumSolved + score.hardSolved : 0;
              return (
                <div key={topic.id} className="topic-card-mini">
                  <span className="topic-emoji">{topic.icon}</span>
                  <span className="topic-name-mini">{topic.name}</span>
                  <span className={`topic-badge ${score?.proficiency || 'beginner'}`}>
                    {total > 0 ? score?.proficiency || 'beginner' : '—'}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      <motion.div
        className="quick-actions"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <button className="action-card" onClick={() => onNavigate('articles')}>
          <GraduationCap size={28} />
          <span>Learn DSA</span>
          <p>Articles, videos & visualizations for every topic</p>
        </button>
        <button className="action-card" onClick={() => onNavigate('problems')}>
          <BookOpen size={28} />
          <span>Practice Problems</span>
          <p>AI-generated problems tailored to your level</p>
        </button>
        <button className="action-card" onClick={() => onNavigate('interview')}>
          <Swords size={28} />
          <span>Mock Interview</span>
          <p>Simulate a real technical interview with AI</p>
        </button>
      </motion.div>
    </div>
  );
}
