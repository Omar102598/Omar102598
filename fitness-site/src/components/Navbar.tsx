import { ThemeToggle } from './ThemeToggle';
import { Dumbbell } from 'lucide-react';

interface NavbarProps {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

export function Navbar({ theme, toggleTheme }: NavbarProps) {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="navbar-brand">
          <Dumbbell size={24} className="navbar-icon" />
          <span className="navbar-logo">FitAI</span>
        </div>
        <div className="navbar-right">
          <span className="navbar-tagline">Fitness &amp; Nutrition Assistant</span>
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
        </div>
      </div>
    </nav>
  );
}
