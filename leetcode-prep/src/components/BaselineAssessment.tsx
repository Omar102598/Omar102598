import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle, XCircle, ArrowRight, Brain } from 'lucide-react';
import type { Problem, UserProgress, TopicCategory, Difficulty } from '../types';
import { generateProblem, evaluateSolution } from '../services/aiService';

interface BaselineAssessmentProps {
  progress: UserProgress;
  onComplete: (progress: UserProgress) => void;
  onBack: () => void;
}

const baselineConfig: Array<{ difficulty: Difficulty; topic: TopicCategory; label: string }> = [
  { difficulty: 'easy', topic: 'arrays-strings', label: 'Arrays & Strings (Easy)' },
  { difficulty: 'easy', topic: 'hash-maps', label: 'Hash Maps (Easy)' },
  { difficulty: 'medium', topic: 'two-pointers', label: 'Two Pointers (Medium)' },
  { difficulty: 'medium', topic: 'trees', label: 'Trees (Medium)' },
  { difficulty: 'hard', topic: 'dynamic-programming', label: 'Dynamic Programming (Hard)' },
];

export default function BaselineAssessment({ progress, onComplete, onBack }: BaselineAssessmentProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
  const [userCode, setUserCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [results, setResults] = useState<Array<{ passed: boolean; score: number; topic: TopicCategory; difficulty: Difficulty }>>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [phase, setPhase] = useState<'intro' | 'solving' | 'feedback' | 'complete'>('intro');

  const loadProblem = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const config = baselineConfig[currentStep];
      const problem = await generateProblem(config.difficulty, config.topic);
      setCurrentProblem(problem);
      setUserCode(problem.starterCode);
      setPhase('solving');
    } catch (err) {
      console.error('Failed to generate problem:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!currentProblem) return;
    setEvaluating(true);
    try {
      const result = await evaluateSolution(currentProblem, userCode);
      const config = baselineConfig[currentStep];
      setResults((prev) => [...prev, {
        passed: result.passed,
        score: result.score,
        topic: config.topic,
        difficulty: config.difficulty,
      }]);
      setFeedback(result.feedback);
      setPhase('feedback');
    } catch (err) {
      console.error('Failed to evaluate:', err);
      setFeedback('Unable to evaluate your solution. Moving to the next problem.');
      setPhase('feedback');
    } finally {
      setEvaluating(false);
    }
  };

  const handleNext = () => {
    if (currentStep + 1 >= baselineConfig.length) {
      // Assessment complete
      const updatedProgress = { ...progress };
      updatedProgress.baselineCompleted = true;

      // Determine level based on results
      const avgScore = results.reduce((s, r) => s + r.score, 0) / results.length;
      if (avgScore >= 75) updatedProgress.currentLevel = 'hard';
      else if (avgScore >= 45) updatedProgress.currentLevel = 'medium';
      else updatedProgress.currentLevel = 'easy';

      // Update topic scores
      for (const result of results) {
        if (!updatedProgress.topicScores[result.topic]) {
          updatedProgress.topicScores[result.topic] = {
            topic: result.topic,
            easySolved: 0,
            mediumSolved: 0,
            hardSolved: 0,
            totalAttempted: 0,
            averageTimeSeconds: 0,
            proficiency: 'beginner',
          };
        }
        const ts = updatedProgress.topicScores[result.topic];
        ts.totalAttempted += 1;
        if (result.passed) {
          if (result.difficulty === 'easy') ts.easySolved += 1;
          else if (result.difficulty === 'medium') ts.mediumSolved += 1;
          else ts.hardSolved += 1;
        }
        if (result.score >= 75) ts.proficiency = 'advanced';
        else if (result.score >= 50) ts.proficiency = 'intermediate';
        else ts.proficiency = 'beginner';
      }

      setPhase('complete');
      onComplete(updatedProgress);
      return;
    }

    setCurrentStep((prev) => prev + 1);
    setCurrentProblem(null);
    setUserCode('');
    setFeedback(null);
    loadProblem();
  };

  const handleSkip = () => {
    const config = baselineConfig[currentStep];
    setResults((prev) => [...prev, {
      passed: false,
      score: 0,
      topic: config.topic,
      difficulty: config.difficulty,
    }]);
    handleNext();
  };

  if (phase === 'intro') {
    return (
      <div className="baseline">
        <motion.div
          className="baseline-intro"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Brain size={64} className="baseline-icon" />
          <h1 className="gradient-text">Baseline Assessment</h1>
          <p>
            We'll walk you through 5 problems of varying difficulty to understand your current skill level.
            This helps us tailor problems to your needs.
          </p>
          <div className="baseline-steps">
            {baselineConfig.map((config, i) => (
              <div key={i} className="baseline-step-preview">
                <span className={`diff-badge ${config.difficulty}`}>{config.difficulty}</span>
                <span>{config.label}</span>
              </div>
            ))}
          </div>
          <div className="baseline-actions">
            <button className="btn-secondary" onClick={onBack}>Back</button>
            <button className="btn-primary" onClick={loadProblem}>
              Start Assessment <ArrowRight size={18} />
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (phase === 'complete') {
    const avgScore = results.reduce((s, r) => s + r.score, 0) / results.length;
    const passed = results.filter((r) => r.passed).length;
    return (
      <div className="baseline">
        <motion.div
          className="baseline-complete"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <CheckCircle size={64} className="complete-icon" />
          <h1 className="gradient-text">Assessment Complete!</h1>
          <div className="assessment-results">
            <div className="result-stat">
              <span className="result-value">{passed}/{results.length}</span>
              <span className="result-label">Problems Passed</span>
            </div>
            <div className="result-stat">
              <span className="result-value">{Math.round(avgScore)}</span>
              <span className="result-label">Average Score</span>
            </div>
            <div className="result-stat">
              <span className="result-value capitalize">{progress.currentLevel}</span>
              <span className="result-label">Recommended Level</span>
            </div>
          </div>
          <div className="result-breakdown">
            {results.map((r, i) => (
              <div key={i} className="result-row">
                {r.passed ? <CheckCircle size={18} className="pass" /> : <XCircle size={18} className="fail" />}
                <span>{baselineConfig[i].label}</span>
                <span className="result-score">{r.score}%</span>
              </div>
            ))}
          </div>
          <button className="btn-primary" onClick={onBack}>
            Go to Dashboard <ArrowRight size={18} />
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="baseline">
      <div className="baseline-progress-bar">
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${((currentStep + 1) / baselineConfig.length) * 100}%` }}
          />
        </div>
        <span className="progress-text">
          Problem {currentStep + 1} of {baselineConfig.length}
        </span>
      </div>

      {loading ? (
        <div className="loading-state">
          <Loader2 size={40} className="spinner" />
          <p>Generating problem...</p>
        </div>
      ) : currentProblem ? (
        <motion.div
          className="baseline-problem"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="problem-header-row">
            <h2>{currentProblem.title}</h2>
            <span className={`diff-badge ${currentProblem.difficulty}`}>
              {currentProblem.difficulty}
            </span>
          </div>

          <div className="problem-description">
            <p>{currentProblem.description}</p>
          </div>

          {currentProblem.examples.length > 0 && (
            <div className="problem-examples">
              <h3>Examples</h3>
              {currentProblem.examples.map((ex, i) => (
                <div key={i} className="example-block">
                  <div><strong>Input:</strong> <code>{ex.input}</code></div>
                  <div><strong>Output:</strong> <code>{ex.output}</code></div>
                  {ex.explanation && <div><strong>Explanation:</strong> {ex.explanation}</div>}
                </div>
              ))}
            </div>
          )}

          {currentProblem.constraints.length > 0 && (
            <div className="problem-constraints">
              <h3>Constraints</h3>
              <ul>
                {currentProblem.constraints.map((c, i) => (
                  <li key={i}><code>{c}</code></li>
                ))}
              </ul>
            </div>
          )}

          <div className="code-editor-section">
            <h3>Your Solution</h3>
            <textarea
              className="code-editor"
              value={userCode}
              onChange={(e) => setUserCode(e.target.value)}
              spellCheck={false}
              rows={15}
            />
          </div>

          {phase === 'feedback' && feedback && (
            <motion.div
              className="feedback-panel"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h3>Feedback</h3>
              <p>{feedback}</p>
            </motion.div>
          )}

          <div className="problem-actions">
            {phase === 'solving' ? (
              <>
                <button className="btn-secondary" onClick={handleSkip}>Skip</button>
                <button className="btn-primary" onClick={handleSubmit} disabled={evaluating}>
                  {evaluating ? <><Loader2 size={18} className="spinner" /> Evaluating...</> : 'Submit Solution'}
                </button>
              </>
            ) : (
              <button className="btn-primary" onClick={handleNext}>
                {currentStep + 1 >= baselineConfig.length ? 'Finish Assessment' : 'Next Problem'} <ArrowRight size={18} />
              </button>
            )}
          </div>
        </motion.div>
      ) : null}
    </div>
  );
}
