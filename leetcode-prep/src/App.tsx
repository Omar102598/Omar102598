import { useState } from 'react';
import { useTheme } from './hooks/useTheme';
import { useProgress } from './hooks/useProgress';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';
import BaselineAssessment from './components/BaselineAssessment';
import ProblemList from './components/ProblemList';
import ProblemView from './components/ProblemView';
import InterviewMode from './components/InterviewMode';
import ArticleList from './components/ArticleList';
import ArticleView from './components/ArticleView';
import { articleMap } from './data/articles';
import type { AppView, Problem, TopicCategory } from './types';

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const { progress, saveProgress } = useProgress();
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [selectedArticleId, setSelectedArticleId] = useState<TopicCategory | null>(null);

  const handleNavigate = (view: AppView) => {
    setCurrentView(view);
    setSelectedProblem(null);
    if (view !== 'article-view') setSelectedArticleId(null);
    window.scrollTo(0, 0);
  };

  const handleSelectProblem = (problem: Problem) => {
    setSelectedProblem(problem);
    setCurrentView('problem-solve');
  };

  const handleSelectArticle = (id: TopicCategory) => {
    setSelectedArticleId(id);
    setCurrentView('article-view');
    window.scrollTo(0, 0);
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard progress={progress} onNavigate={handleNavigate} />;
      case 'baseline':
        return (
          <BaselineAssessment
            progress={progress}
            onComplete={(updated) => {
              saveProgress(updated);
              handleNavigate('dashboard');
            }}
            onBack={() => handleNavigate('dashboard')}
          />
        );
      case 'problems':
        return (
          <ProblemList
            progress={progress}
            onSelectProblem={handleSelectProblem}
            onNavigate={handleNavigate}
          />
        );
      case 'problem-solve':
        if (!selectedProblem) {
          handleNavigate('problems');
          return null;
        }
        return (
          <ProblemView
            problem={selectedProblem}
            progress={progress}
            onBack={() => handleNavigate('problems')}
            onSave={saveProgress}
          />
        );
      case 'interview':
        return (
          <InterviewMode
            progress={progress}
            onBack={() => handleNavigate('dashboard')}
            onSave={saveProgress}
          />
        );
      case 'articles':
        return (
          <ArticleList
            onNavigate={handleNavigate}
            onSelectArticle={handleSelectArticle}
          />
        );
      case 'article-view': {
        const article = selectedArticleId ? articleMap.get(selectedArticleId) : undefined;
        if (!article) {
          handleNavigate('articles');
          return null;
        }
        return (
          <ArticleView
            article={article}
            onBack={() => handleNavigate('articles')}
          />
        );
      }
      default:
        return <Dashboard progress={progress} onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="app">
      <Navbar
        theme={theme}
        toggleTheme={toggleTheme}
        currentView={currentView}
        onNavigate={handleNavigate}
      />
      <main className="main-content">
        {renderView()}
      </main>
      <Footer />
    </div>
  );
}
