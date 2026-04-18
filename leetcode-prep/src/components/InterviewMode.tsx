import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2, ArrowLeft, Clock, Send, Play,
  StopCircle, AlertTriangle, MessageSquare,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import type { Problem, UserProgress, ChatMessage, TopicCategory, Difficulty, SupportedLanguage } from '../types';
import { generateProblem, conductInterview } from '../services/aiService';
import { useTimer } from '../hooks/useTimer';
import { topics } from '../data/topics';
import CodeEditor from './CodeEditor';

interface InterviewModeProps {
  progress: UserProgress;
  onBack: () => void;
  onSave: (progress: UserProgress) => void;
}

type InterviewPhase = 'setup' | 'active' | 'complete';

interface InterviewConfig {
  duration: number;
  difficulty: Difficulty;
  topic: TopicCategory;
  problemCount: number;
}

export default function InterviewMode({ progress, onBack, onSave }: InterviewModeProps) {
  const [phase, setPhase] = useState<InterviewPhase>('setup');
  const [config, setConfig] = useState<InterviewConfig>({
    duration: 45,
    difficulty: progress.currentLevel || 'medium',
    topic: 'arrays-strings',
    problemCount: 1,
  });
  const [problem, setProblem] = useState<Problem | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userCode, setUserCode] = useState('');
  const [interviewLang] = useState<SupportedLanguage>('python');
  const [chatInput, setChatInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const handleExpire = useCallback(() => {
    setPhase('complete');
  }, []);
  const timer = useTimer(config.duration * 60, true, handleExpire);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Derive warning state from timer rather than using setState in effect
  const showWarning = timer.seconds <= 300 && timer.seconds > 0 && phase === 'active';

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startInterview = async () => {
    setLoading(true);
    try {
      const generatedProblem = await generateProblem(config.difficulty, config.topic);
      setProblem(generatedProblem);
      setUserCode(generatedProblem.starterCode);

      const initialMessage: ChatMessage = {
        role: 'assistant',
        content: `Welcome to your mock technical interview! I'll be your interviewer today.\n\nHere's your problem:\n\n**${generatedProblem.title}**\n\n${generatedProblem.description}\n\n${generatedProblem.examples.map((e, i) => `**Example ${i + 1}:**\nInput: \`${e.input}\`\nOutput: \`${e.output}\`${e.explanation ? `\nExplanation: ${e.explanation}` : ''}`).join('\n\n')}\n\n**Constraints:**\n${generatedProblem.constraints.map((c) => `- \`${c}\``).join('\n')}\n\nPlease start by sharing your initial thoughts on how you'd approach this problem. Think out loud — I want to understand your thought process.`,
      };

      setMessages([initialMessage]);
      setPhase('active');
      timer.reset(config.duration * 60);
      timer.start();
    } catch (err) {
      console.error('Failed to start interview:', err);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!chatInput.trim() || !problem) return;

    const userMessage: ChatMessage = { role: 'user', content: chatInput };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setChatInput('');
    setSendingMessage(true);

    try {
      const response = await conductInterview(updatedMessages);
      const assistantMessage: ChatMessage = { role: 'assistant', content: response };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Failed to get interviewer response:', err);
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: 'I apologize, I had a brief technical difficulty. Please continue with your solution.',
      }]);
    } finally {
      setSendingMessage(false);
    }
  };

  const submitCode = async () => {
    if (!problem) return;

    const codeMessage: ChatMessage = {
      role: 'user',
      content: `Here's my solution:\n\n\`\`\`python\n${userCode}\n\`\`\`\n\nCan you review it and provide feedback?`,
    };
    const updatedMessages = [...messages, codeMessage];
    setMessages(updatedMessages);
    setSendingMessage(true);

    try {
      const response = await conductInterview(updatedMessages);
      const assistantMessage: ChatMessage = { role: 'assistant', content: response };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Failed to get code review:', err);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleEndInterview = useCallback(() => {
    timer.pause();
    setPhase('complete');

    const updatedProgress = { ...progress };
    updatedProgress.interviewsCompleted += 1;
    updatedProgress.totalTimeSpentMinutes += (config.duration * 60 - timer.seconds) / 60;
    onSave(updatedProgress);
  }, [timer, config.duration, progress, onSave]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (phase === 'setup') {
    return (
      <div className="interview-setup">
        <motion.div
          className="setup-container"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <button className="btn-ghost back-btn" onClick={onBack}>
            <ArrowLeft size={18} /> Back
          </button>

          <h1 className="gradient-text">Mock Interview</h1>
          <p className="setup-subtitle">
            Simulate a real technical interview with an AI interviewer.
            Practice thinking out loud and communicating your approach.
          </p>

          <div className="setup-options">
            <div className="setup-field">
              <label>Duration</label>
              <div className="duration-options">
                {[30, 45, 60, 90].map((min) => (
                  <button
                    key={min}
                    className={`duration-btn ${config.duration === min ? 'active' : ''}`}
                    onClick={() => setConfig({ ...config, duration: min })}
                  >
                    {min} min
                  </button>
                ))}
              </div>
            </div>

            <div className="setup-field">
              <label>Difficulty</label>
              <div className="duration-options">
                {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
                  <button
                    key={d}
                    className={`duration-btn ${d} ${config.difficulty === d ? 'active' : ''}`}
                    onClick={() => setConfig({ ...config, difficulty: d })}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="setup-field">
              <label>Topic</label>
              <select
                className="filter-select"
                value={config.topic}
                onChange={(e) => setConfig({ ...config, topic: e.target.value as TopicCategory })}
              >
                {topics.map((t) => (
                  <option key={t.id} value={t.id}>{t.icon} {t.name}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            className="btn-primary btn-lg"
            onClick={startInterview}
            disabled={loading}
          >
            {loading ? <><Loader2 size={20} className="spinner" /> Preparing Interview...</> : <><Play size={20} /> Start Interview</>}
          </button>
        </motion.div>
      </div>
    );
  }

  if (phase === 'complete') {
    return (
      <div className="interview-complete">
        <motion.div
          className="complete-container"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <h1 className="gradient-text">Interview Complete!</h1>
          <p>Great job completing the mock interview session.</p>

          <div className="interview-summary">
            <div className="summary-stat">
              <span className="summary-value">{config.duration} min</span>
              <span className="summary-label">Duration</span>
            </div>
            <div className="summary-stat">
              <span className="summary-value capitalize">{config.difficulty}</span>
              <span className="summary-label">Difficulty</span>
            </div>
            <div className="summary-stat">
              <span className="summary-value">{messages.filter((m) => m.role === 'user').length}</span>
              <span className="summary-label">Messages Sent</span>
            </div>
          </div>

          <div className="interview-transcript">
            <h3><MessageSquare size={18} /> Interview Transcript</h3>
            <div className="transcript-messages">
              {messages.map((msg, i) => (
                <div key={i} className={`transcript-msg ${msg.role}`}>
                  <span className="msg-role">{msg.role === 'assistant' ? 'Interviewer' : 'You'}</span>
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ))}
            </div>
          </div>

          <div className="complete-actions">
            <button className="btn-secondary" onClick={onBack}>Back to Dashboard</button>
            <button className="btn-primary" onClick={() => {
              setPhase('setup');
              setMessages([]);
              setProblem(null);
              setUserCode('');
            }}>
              Start New Interview
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="interview-active">
      <div className="interview-toolbar">
        <div className="toolbar-left">
          <span className="interview-badge">🎤 Interview Mode</span>
          {problem && <span className={`diff-badge ${problem.difficulty}`}>{problem.difficulty}</span>}
        </div>
        <div className="toolbar-center">
          <div className={`interview-timer ${timer.seconds <= 300 ? 'warning' : ''}`}>
            <Clock size={18} />
            <span>{timer.formatTime()}</span>
          </div>
        </div>
        <div className="toolbar-right">
          <button className="btn-danger btn-sm" onClick={handleEndInterview}>
            <StopCircle size={16} /> End Interview
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showWarning && timer.seconds <= 300 && timer.seconds > 295 && (
          <motion.div
            className="time-warning"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <AlertTriangle size={18} />
            <span>5 minutes remaining! Wrap up your solution.</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="interview-layout">
        <div className="interview-chat">
          <div className="chat-messages">
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                className={`chat-message ${msg.role}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="message-author">
                  {msg.role === 'assistant' ? '🎤 Interviewer' : '👤 You'}
                </div>
                <div className="message-content">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </motion.div>
            ))}
            {sendingMessage && (
              <div className="chat-message assistant">
                <div className="message-author">🎤 Interviewer</div>
                <div className="message-content typing">
                  <Loader2 size={16} className="spinner" /> Thinking...
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="chat-input-area">
            <textarea
              className="chat-input"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Share your thoughts, ask questions, discuss your approach..."
              rows={2}
            />
            <button
              className="btn-primary btn-send"
              onClick={sendMessage}
              disabled={!chatInput.trim() || sendingMessage}
            >
              <Send size={18} />
            </button>
          </div>
        </div>

        <div className="interview-editor">
          <div className="editor-header">
            <span>Your Code (Python)</span>
            <button className="btn-secondary btn-sm" onClick={submitCode} disabled={sendingMessage}>
              Submit for Review
            </button>
          </div>
          <div className="interview-code-editor-container">
            <CodeEditor
              value={userCode}
              onChange={setUserCode}
              language={interviewLang}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
