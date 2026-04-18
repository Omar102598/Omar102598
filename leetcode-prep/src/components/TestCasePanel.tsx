import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, CheckCircle, XCircle, Clock, Loader2, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import type { TestCase, TestResult, RunResult } from '../types';

interface TestCasePanelProps {
  testCases: TestCase[];
  onTestCasesChange: (testCases: TestCase[]) => void;
  runResult: RunResult | null;
  isRunning: boolean;
  onRun: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export default function TestCasePanel({
  testCases,
  onTestCasesChange,
  runResult,
  isRunning,
  onRun,
  onSubmit,
  isSubmitting,
}: TestCasePanelProps) {
  const [activeTestCase, setActiveTestCase] = useState(0);
  const [activeResultTab, setActiveResultTab] = useState<'testcases' | 'results'>('testcases');
  const [isExpanded, setIsExpanded] = useState(true);

  const handleAddTestCase = () => {
    const newCase: TestCase = {
      id: `custom-${Date.now()}`,
      input: '',
      expectedOutput: '',
    };
    onTestCasesChange([...testCases, newCase]);
    setActiveTestCase(testCases.length);
  };

  const handleRemoveTestCase = (index: number) => {
    if (testCases.length <= 1) return;
    const updated = testCases.filter((_, i) => i !== index);
    onTestCasesChange(updated);
    if (activeTestCase >= updated.length) {
      setActiveTestCase(Math.max(0, updated.length - 1));
    }
  };

  const handleUpdateTestCase = (index: number, field: 'input' | 'expectedOutput', value: string) => {
    const updated = [...testCases];
    updated[index] = { ...updated[index], [field]: value };
    onTestCasesChange(updated);
  };

  const getResultForTest = (testCaseId: string): TestResult | undefined => {
    return runResult?.testResults.find(r => r.testCaseId === testCaseId);
  };

  const passedCount = runResult?.testResults.filter(r => r.passed).length ?? 0;
  const totalCount = runResult?.testResults.length ?? 0;

  return (
    <div className="test-case-panel">
      <div className="test-panel-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="test-panel-title">
          <span>Test Cases</span>
          {runResult && (
            <span className={`test-summary-badge ${runResult.allPassed ? 'passed' : 'failed'}`}>
              {passedCount}/{totalCount} passed
            </span>
          )}
        </div>
        <button className="btn-ghost btn-sm">
          {isExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="test-panel-body"
          >
            <div className="test-tabs-bar">
              <div className="test-tab-group">
                <button
                  className={`test-tab ${activeResultTab === 'testcases' ? 'active' : ''}`}
                  onClick={() => setActiveResultTab('testcases')}
                >
                  Test Cases
                </button>
                <button
                  className={`test-tab ${activeResultTab === 'results' ? 'active' : ''}`}
                  onClick={() => setActiveResultTab('results')}
                  disabled={!runResult}
                >
                  Results {runResult && `(${passedCount}/${totalCount})`}
                </button>
              </div>
            </div>

            {activeResultTab === 'testcases' && (
              <div className="test-cases-content">
                <div className="test-case-tabs">
                  {testCases.map((tc, i) => {
                    const result = getResultForTest(tc.id);
                    return (
                      <button
                        key={tc.id}
                        className={`test-case-tab ${activeTestCase === i ? 'active' : ''} ${result ? (result.passed ? 'passed' : 'failed') : ''}`}
                        onClick={() => setActiveTestCase(i)}
                      >
                        {result && (result.passed
                          ? <CheckCircle size={12} />
                          : <XCircle size={12} />
                        )}
                        Case {i + 1}
                        {testCases.length > 1 && (
                          <span
                            className="remove-case-btn"
                            onClick={(e) => { e.stopPropagation(); handleRemoveTestCase(i); }}
                          >
                            <Trash2 size={10} />
                          </span>
                        )}
                      </button>
                    );
                  })}
                  <button className="test-case-tab add-tab" onClick={handleAddTestCase}>
                    <Plus size={12} /> Add
                  </button>
                </div>

                {testCases[activeTestCase] && (
                  <div className="test-case-editor">
                    <div className="test-field">
                      <label>Input</label>
                      <textarea
                        value={testCases[activeTestCase].input}
                        onChange={(e) => handleUpdateTestCase(activeTestCase, 'input', e.target.value)}
                        placeholder="Enter test input..."
                        spellCheck={false}
                      />
                    </div>
                    <div className="test-field">
                      <label>Expected Output</label>
                      <textarea
                        value={testCases[activeTestCase].expectedOutput}
                        onChange={(e) => handleUpdateTestCase(activeTestCase, 'expectedOutput', e.target.value)}
                        placeholder="Enter expected output..."
                        spellCheck={false}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeResultTab === 'results' && runResult && (
              <div className="test-results-content">
                {runResult.timeComplexity && (
                  <div className="complexity-bar">
                    <span><Clock size={14} /> <strong>Time:</strong> {runResult.timeComplexity}</span>
                    <span><strong>Space:</strong> {runResult.spaceComplexity}</span>
                    {runResult.totalExecutionTimeMs !== undefined && (
                      <span className="exec-time">Runtime: {runResult.totalExecutionTimeMs}ms</span>
                    )}
                  </div>
                )}
                <div className="test-result-list">
                  {runResult.testResults.map((result, i) => (
                    <div key={result.testCaseId} className={`test-result-item ${result.passed ? 'passed' : 'failed'}`}>
                      <div className="test-result-header">
                        {result.passed
                          ? <CheckCircle size={16} className="result-icon passed" />
                          : <XCircle size={16} className="result-icon failed" />
                        }
                        <span className="result-label">Test Case {i + 1}</span>
                        {result.executionTimeMs !== undefined && (
                          <span className="result-time">{result.executionTimeMs}ms</span>
                        )}
                      </div>
                      <div className="test-result-details">
                        <div className="result-row">
                          <span className="result-key">Input:</span>
                          <code>{result.input}</code>
                        </div>
                        <div className="result-row">
                          <span className="result-key">Expected:</span>
                          <code>{result.expectedOutput}</code>
                        </div>
                        <div className="result-row">
                          <span className="result-key">Output:</span>
                          <code className={result.passed ? 'correct' : 'incorrect'}>{result.actualOutput}</code>
                        </div>
                        {result.error && (
                          <div className="result-row error">
                            <span className="result-key">Error:</span>
                            <code>{result.error}</code>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="test-panel-actions">
              <button
                className="btn-run"
                onClick={onRun}
                disabled={isRunning || isSubmitting}
              >
                {isRunning
                  ? <><Loader2 size={16} className="spinner" /> Running...</>
                  : <><Play size={16} /> Run</>
                }
              </button>
              <button
                className="btn-submit"
                onClick={onSubmit}
                disabled={isSubmitting || isRunning}
              >
                {isSubmitting
                  ? <><Loader2 size={16} className="spinner" /> Submitting...</>
                  : <><CheckCircle size={16} /> Submit</>
                }
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
