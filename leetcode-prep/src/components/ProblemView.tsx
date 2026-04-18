import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2, ArrowLeft, Lightbulb, BookOpen, CheckCircle,
  Clock, RotateCcw,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import type { Problem, UserProgress, SolvedProblem, TopicScore, SupportedLanguage, TestCase, RunResult } from '../types';
import { evaluateSolution, getHint, getDetailedExplanation, runTestCases, getStarterCodeForLanguage } from '../services/aiService';
import { useTimer } from '../hooks/useTimer';
import { getTopicName } from '../data/topics';
import CodeEditor from './CodeEditor';
import TestCasePanel from './TestCasePanel';

const LANGUAGES: { value: SupportedLanguage; label: string }[] = [
  { value: 'python', label: 'Python' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'go', label: 'Go' },
];

interface ProblemViewProps {
  problem: Problem;
  progress: UserProgress;
  onBack: () => void;
  onSave: (progress: UserProgress) => void;
}

function buildDefaultTestCases(problem: Problem): TestCase[] {
  if (problem.testCases && problem.testCases.length > 0) {
    return problem.testCases;
  }
  // Build from examples
  return problem.examples.map((ex, i) => ({
    id: `example-${i + 1}`,
    input: ex.input,
    expectedOutput: ex.output,
  }));
}

export default function ProblemView({ problem, progress, onBack, onSave }: ProblemViewProps) {
  const [language, setLanguage] = useState<SupportedLanguage>('python');
  const [userCode, setUserCode] = useState(problem.starterCode);
  const [codeByLang, setCodeByLang] = useState<Partial<Record<SupportedLanguage, string>>>({
    python: problem.starterCode,
  });
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [passed, setPassed] = useState<boolean | null>(null);
  const [hintsRevealed, setHintsRevealed] = useState(0);
  const [loadingHint, setLoadingHint] = useState(false);
  const [aiHints, setAiHints] = useState<string[]>([]);
  const [showSolution, setShowSolution] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loadingExplanation, setLoadingExplanation] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [activeTab, setActiveTab] = useState<'description' | 'hints' | 'solution'>('description');
  const [testCases, setTestCases] = useState<TestCase[]>(() => buildDefaultTestCases(problem));
  const [runResult, setRunResult] = useState<RunResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const timer = useTimer(0, false);

  useEffect(() => {
    timer.start();
    return () => timer.pause();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLanguageChange = (newLang: SupportedLanguage) => {
    // Save current code
    setCodeByLang(prev => ({ ...prev, [language]: userCode }));

    // Load code for new language
    const existingCode = codeByLang[newLang];
    if (existingCode) {
      setUserCode(existingCode);
    } else {
      const starter = getStarterCodeForLanguage(problem, newLang);
      setUserCode(starter);
      setCodeByLang(prev => ({ ...prev, [newLang]: starter }));
    }
    setLanguage(newLang);
  };

  const handleRunTests = async () => {
    setIsRunning(true);
    setRunResult(null);
    try {
      const result = await runTestCases(problem, userCode, testCases, language);
      setRunResult(result);
    } catch (err) {
      console.error('Failed to run tests:', err);
      setRunResult({
        testResults: testCases.map(tc => ({
          testCaseId: tc.id,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          actualOutput: 'Error running tests',
          passed: false,
          error: err instanceof Error ? err.message : 'Unknown error',
        })),
        allPassed: false,
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setAttempts((a) => a + 1);
    try {
      const result = await evaluateSolution(problem, userCode, language);
      setFeedback(result.feedback);
      setScore(result.score);
      setPassed(result.passed);

      if (result.passed) {
        timer.pause();
        const solved: SolvedProblem = {
          problemId: problem.id,
          solvedAt: new Date().toISOString(),
          difficulty: problem.difficulty,
          topic: problem.topic,
          timeSpentSeconds: timer.seconds,
          hintsUsed: hintsRevealed,
          attempts: attempts + 1,
        };

        const updatedProgress = { ...progress };
        updatedProgress.problemsSolved = {
          ...updatedProgress.problemsSolved,
          [problem.id]: solved,
        };
        updatedProgress.totalTimeSpentMinutes += timer.seconds / 60;

        if (!updatedProgress.topicScores[problem.topic]) {
          updatedProgress.topicScores[problem.topic] = {
            topic: problem.topic,
            easySolved: 0,
            mediumSolved: 0,
            hardSolved: 0,
            totalAttempted: 0,
            averageTimeSeconds: 0,
            proficiency: 'beginner',
          } as TopicScore;
        }

        const ts = updatedProgress.topicScores[problem.topic];
        ts.totalAttempted += 1;
        if (problem.difficulty === 'easy') ts.easySolved += 1;
        else if (problem.difficulty === 'medium') ts.mediumSolved += 1;
        else ts.hardSolved += 1;

        const totalSolved = ts.easySolved + ts.mediumSolved + ts.hardSolved;
        if (totalSolved >= 5 && ts.hardSolved >= 2) ts.proficiency = 'expert';
        else if (totalSolved >= 3 && ts.mediumSolved >= 1) ts.proficiency = 'advanced';
        else if (totalSolved >= 2) ts.proficiency = 'intermediate';

        onSave(updatedProgress);
      }
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : 'Failed to evaluate solution.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGetHint = async () => {
    setLoadingHint(true);
    try {
      const hint = await getHint(problem, hintsRevealed, userCode, language);
      setAiHints((prev) => [...prev, hint]);
      setHintsRevealed((h) => h + 1);
      setActiveTab('hints');
    } catch (err) {
      console.error('Failed to get hint:', err);
    } finally {
      setLoadingHint(false);
    }
  };

  const handleShowExplanation = async () => {
    if (explanation) {
      setShowSolution(true);
      setActiveTab('solution');
      return;
    }
    setLoadingExplanation(true);
    try {
      const detail = await getDetailedExplanation(problem);
      setExplanation(detail);
      setShowSolution(true);
      setActiveTab('solution');
    } catch (err) {
      console.error('Failed to get explanation:', err);
    } finally {
      setLoadingExplanation(false);
    }
  };

  const handleReset = () => {
    const starter = getStarterCodeForLanguage(problem, language);
    setUserCode(starter);
    setCodeByLang(prev => ({ ...prev, [language]: starter }));
    setFeedback(null);
    setScore(null);
    setPassed(null);
    setRunResult(null);
  };

  return (
    <div className="problem-view">
      <div className="problem-view-header">
        <button className="btn-ghost" onClick={onBack}>
          <ArrowLeft size={18} /> Back
        </button>
        <div className="problem-meta">
          <span className={`diff-badge ${problem.difficulty}`}>{problem.difficulty}</span>
          <span className="topic-label">{getTopicName(problem.topic)}</span>
        </div>
        <div className="timer-display">
          <Clock size={18} />
          <span>{timer.formatTime()}</span>
        </div>
      </div>

      <div className="problem-layout">
        <div className="problem-left">
          <div className="tab-bar">
            <button
              className={`tab ${activeTab === 'description' ? 'active' : ''}`}
              onClick={() => setActiveTab('description')}
            >
              📋 Description
            </button>
            <button
              className={`tab ${activeTab === 'hints' ? 'active' : ''}`}
              onClick={() => setActiveTab('hints')}
            >
              💡 Hints {aiHints.length > 0 && `(${aiHints.length})`}
            </button>
            <button
              className={`tab ${activeTab === 'solution' ? 'active' : ''}`}
              onClick={() => setActiveTab('solution')}
            >
              📖 Solution
            </button>
          </div>

          <div className="tab-content">
            <AnimatePresence mode="wait">
              {activeTab === 'description' && (
                <motion.div
                  key="description"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="problem-description-full"
                >
                  <h2>{problem.title}</h2>
                  <div className="description-text">
                    <ReactMarkdown>{problem.description}</ReactMarkdown>
                  </div>

                  {problem.examples.length > 0 && (
                    <div className="examples-section">
                      <h3>Examples</h3>
                      {problem.examples.map((ex, i) => (
                        <div key={i} className="example-block">
                          <div><strong>Input:</strong> <code>{ex.input}</code></div>
                          <div><strong>Output:</strong> <code>{ex.output}</code></div>
                          {ex.explanation && <div className="example-explanation"><strong>Explanation:</strong> {ex.explanation}</div>}
                        </div>
                      ))}
                    </div>
                  )}

                  {problem.constraints.length > 0 && (
                    <div className="constraints-section">
                      <h3>Constraints</h3>
                      <ul>
                        {problem.constraints.map((c, i) => (
                          <li key={i}><code>{c}</code></li>
                        ))}
                      </ul>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'hints' && (
                <motion.div
                  key="hints"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="hints-panel"
                >
                  <h3><Lightbulb size={20} /> Hints</h3>
                  {aiHints.length === 0 ? (
                    <div className="no-hints">
                      <p>No hints revealed yet. Click below to get a hint.</p>
                    </div>
                  ) : (
                    <div className="hints-list">
                      {aiHints.map((hint, i) => (
                        <motion.div
                          key={i}
                          className="hint-item"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <span className="hint-level">Hint {i + 1}</span>
                          <ReactMarkdown>{hint}</ReactMarkdown>
                        </motion.div>
                      ))}
                    </div>
                  )}
                  <button
                    className="btn-secondary"
                    onClick={handleGetHint}
                    disabled={loadingHint || hintsRevealed >= 3}
                  >
                    {loadingHint ? <><Loader2 size={16} className="spinner" /> Getting hint...</> : hintsRevealed >= 3 ? 'All hints revealed' : <><Lightbulb size={16} /> Get Hint ({3 - hintsRevealed} remaining)</>}
                  </button>
                </motion.div>
              )}

              {activeTab === 'solution' && (
                <motion.div
                  key="solution"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="solution-panel"
                >
                  {!showSolution ? (
                    <div className="solution-locked">
                      <BookOpen size={40} />
                      <h3>View Solution & Explanation</h3>
                      <p>Are you sure? Try solving it yourself first!</p>
                      <button
                        className="btn-secondary"
                        onClick={handleShowExplanation}
                        disabled={loadingExplanation}
                      >
                        {loadingExplanation ? <><Loader2 size={16} className="spinner" /> Loading...</> : 'Show Solution'}
                      </button>
                    </div>
                  ) : (
                    <div className="solution-content">
                      {problem.solution && (
                        <div className="solution-code-section">
                          <h3>Solution Code</h3>
                          <pre className="solution-code"><code>{problem.solution}</code></pre>
                        </div>
                      )}
                      {problem.timeComplexity && (
                        <div className="complexity-info">
                          <span><strong>Time:</strong> {problem.timeComplexity}</span>
                          <span><strong>Space:</strong> {problem.spaceComplexity}</span>
                        </div>
                      )}
                      {explanation && (
                        <div className="explanation-text">
                          <h3>Detailed Explanation</h3>
                          <ReactMarkdown>{explanation}</ReactMarkdown>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="problem-right">
          <div className="editor-header">
            <div className="editor-header-left">
              <select
                className="language-selector"
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value as SupportedLanguage)}
              >
                {LANGUAGES.map(lang => (
                  <option key={lang.value} value={lang.value}>{lang.label}</option>
                ))}
              </select>
            </div>
            <button className="btn-ghost btn-sm" onClick={handleReset}>
              <RotateCcw size={14} /> Reset
            </button>
          </div>

          <div className="code-editor-container">
            <CodeEditor
              value={userCode}
              onChange={setUserCode}
              language={language}
            />
          </div>

          <TestCasePanel
            testCases={testCases}
            onTestCasesChange={setTestCases}
            runResult={runResult}
            isRunning={isRunning}
            onRun={handleRunTests}
            onSubmit={handleSubmit}
            isSubmitting={submitting}
          />

          {feedback && (
            <motion.div
              className={`feedback-panel ${passed ? 'success' : score !== null && score > 0 ? 'partial' : 'error'}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="feedback-header">
                {passed ? (
                  <><CheckCircle size={20} /> <span>Accepted!</span></>
                ) : (
                  <><span>Score: {score}%</span></>
                )}
              </div>
              <ReactMarkdown>{feedback}</ReactMarkdown>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
