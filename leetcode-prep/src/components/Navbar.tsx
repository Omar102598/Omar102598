import { Code2, BarChart3, Swords, BookOpen, GraduationCap, GitBranch } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import type { AppView } from '../types';

interface NavbarProps {
  theme: string;
  toggleTheme: () => void;
  currentView: AppView;
  onNavigate: (view: AppView) => void;
}

export default function Navbar({ theme, toggleTheme, currentView, onNavigate }: NavbarProps) {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <button className="navbar-brand" onClick={() => onNavigate('dashboard')}>
          <Code2 size={28} className="brand-icon" />
          <span className="brand-text">CodePrep AI</span>
        </button>

        <div className="navbar-links">
          <button
            className={`nav-link ${currentView === 'dashboard' ? 'active' : ''}`}
            onClick={() => onNavigate('dashboard')}
          >
            <BarChart3 size={18} />
            <span>Dashboard</span>
          </button>
          <button
            className={`nav-link ${currentView === 'articles' || currentView === 'article-view' ? 'active' : ''}`}
            onClick={() => onNavigate('articles')}
          >
            <GraduationCap size={18} />
            <span>Learn</span>
          </button>
          <button
            className={`nav-link ${currentView === 'problems' ? 'active' : ''}`}
            onClick={() => onNavigate('problems')}
          >
            <BookOpen size={18} />
            <span>Practice</span>
          </button>
          <button
            className={`nav-link ${currentView === 'interview' ? 'active' : ''}`}
            onClick={() => onNavigate('interview')}
          >
            <Swords size={18} />
            <span>Interview</span>
          </button>
          <button
            className={`nav-link ${currentView === 'visualizer' ? 'active' : ''}`}
            onClick={() => onNavigate('visualizer')}
          >
            <GitBranch size={18} />
            <span>Visualizer</span>
          </button>
        </div>

        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
      </div>
    </nav>
  );
}
