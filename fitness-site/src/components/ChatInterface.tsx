import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Trash2, Loader2 } from 'lucide-react';
import { sendChatMessage } from '../services/aiService';
import { WorkoutCard } from './WorkoutCard';
import { MealPlanCard } from './MealPlanCard';
import { GroceryListCard } from './GroceryListCard';
import { PriceComparisonCard } from './PriceComparisonCard';
import { QuickActions } from './QuickActions';
import type { DisplayMessage, ChatMessage } from '../types';
import Markdown from 'react-markdown';

export function ChatInterface() {
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [conversationHistory, setConversationHistory] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleSend = useCallback(async (text?: string) => {
    const messageText = (text || input).trim();
    if (!messageText || isLoading) return;

    const userMessage: DisplayMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const updatedHistory: ChatMessage[] = [
      ...conversationHistory,
      { role: 'user', content: messageText },
    ];

    try {
      const response = await sendChatMessage(updatedHistory);

      const assistantMessage: DisplayMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response.content,
        toolResults: response.toolResults.length > 0 ? response.toolResults : undefined,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setConversationHistory([
        ...updatedHistory,
        { role: 'assistant', content: response.content },
      ]);
    } catch (error) {
      const errorMessage: DisplayMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content:
          error instanceof Error
            ? `Sorry, something went wrong: ${error.message}`
            : 'Sorry, something went wrong. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, conversationHistory]);

  const handleClear = () => {
    setMessages([]);
    setConversationHistory([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="chat-layout">
      <div className="chat-container">
        {isEmpty ? (
          <div className="chat-welcome">
            <div className="welcome-icon">💪</div>
            <h1>FitAI</h1>
            <p>Your AI-powered fitness coach, nutritionist, and grocery shopping assistant.</p>
            <p className="welcome-hint">
              Ask me to create workouts, meal plans, grocery lists with price comparisons across Amazon Grocery, Target, HEB, and Central Market — or try a quick action below!
            </p>
            <QuickActions onAction={(prompt) => handleSend(prompt)} disabled={isLoading} />
          </div>
        ) : (
          <div className="chat-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`chat-message ${msg.role}`}>
                {msg.role === 'assistant' && (
                  <div className="message-avatar">🤖</div>
                )}
                <div className="message-content">
                  {msg.toolResults && msg.toolResults.map((result, i) => (
                    <div key={i} className="tool-result">
                      {result.type === 'workout' && (
                        <WorkoutCard workout={result.data} />
                      )}
                      {result.type === 'meal_plan' && (
                        <MealPlanCard mealPlan={result.data} />
                      )}
                      {result.type === 'grocery_list' && (
                        <GroceryListCard groceryList={result.data} />
                      )}
                      {result.type === 'price_comparison' && (
                        <PriceComparisonCard comparison={result.data} />
                      )}
                    </div>
                  ))}
                  {msg.content && (
                    <div className={`message-text ${msg.role}`}>
                      {msg.role === 'assistant' ? (
                        <Markdown>{msg.content}</Markdown>
                      ) : (
                        msg.content
                      )}
                    </div>
                  )}
                </div>
                {msg.role === 'user' && (
                  <div className="message-avatar user-avatar">👤</div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="chat-message assistant">
                <div className="message-avatar">🤖</div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <Loader2 size={16} className="spinner" />
                    <span>Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        <div className="chat-input-area">
          {messages.length > 0 && (
            <button
              className="clear-btn"
              onClick={handleClear}
              aria-label="Clear conversation"
              title="Clear conversation"
            >
              <Trash2 size={16} />
            </button>
          )}
          <textarea
            ref={inputRef}
            className="chat-input"
            placeholder="Ask me about workouts, meal plans, grocery lists, or price comparisons..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            rows={1}
          />
          <button
            className="send-btn"
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim()}
            aria-label="Send message"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
