import { Sun, Moon } from 'lucide-react';
import type { Theme } from '../hooks/useTheme';
import { NEWSLETTER_DATE, categories } from '../data/news';

interface NavbarProps {
  theme: Theme;
  toggleTheme: () => void;
  activeCategory: string;
  onSelectCategory: (id: string) => void;
}

export function Navbar({ theme, toggleTheme, activeCategory, onSelectCategory }: NavbarProps) {
  const categoryColors: Record<string, string> = {
    technology: 'tech',
    science: 'science',
    quantum: 'quantum',
  };

  return (
    <nav className="navbar">
      <a className="navbar__brand" href="#">
        <span className="navbar__brand-icon">📡</span>
        TechPulse
      </a>
      <span className="navbar__date">{NEWSLETTER_DATE}</span>

      <div className="navbar__spacer" />

      <div className="navbar__tabs">
        {categories.map(cat => (
          <button
            key={cat.id}
            className={`navbar__tab navbar__tab--${categoryColors[cat.id]}${activeCategory === cat.id ? ` navbar__tab--active` : ''}`}
            onClick={() => {
              onSelectCategory(cat.id);
              document.getElementById(cat.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
          >
            <span>{cat.icon}</span>
            {cat.name}
          </button>
        ))}
      </div>

      <button
        className="navbar__theme-btn"
        onClick={toggleTheme}
        aria-label="Toggle theme"
        title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
      </button>
    </nav>
  );
}
