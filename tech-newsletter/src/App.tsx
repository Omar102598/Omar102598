import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { useTheme } from './hooks/useTheme';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { CategorySection } from './components/CategorySection';
import { Footer } from './components/Footer';
import { StaleBanner } from './components/StaleBanner';
import { getNewsData } from './data/news';
import './styles/globals.css';

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const { categories, date, isStale } = getNewsData();
  const [activeCategory, setActiveCategory] = useState('technology');
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);

      // Update active category based on scroll position
      for (const cat of [...categories].reverse()) {
        const el = document.getElementById(cat.id);
        if (el && window.scrollY >= el.offsetTop - 120) {
          setActiveCategory(cat.id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const catColorMap: Record<string, string> = {
    technology: 'tech',
    science: 'science',
    quantum: 'quantum',
  };

  return (
    <div data-theme={theme}>
      <Navbar
        theme={theme}
        toggleTheme={toggleTheme}
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
      />

      <Hero date={date} categories={categories} />

      {isStale && <StaleBanner date={date} />}

      {/* Mobile category tabs */}
      <div className="mobile-tabs">
        {categories.map(cat => (
          <button
            key={cat.id}
            className={`mobile-tab${activeCategory === cat.id ? ` mobile-tab--active-${catColorMap[cat.id]}` : ''}`}
            onClick={() => {
              setActiveCategory(cat.id);
              document.getElementById(cat.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
          >
            <span>{cat.icon}</span>
            {cat.name}
          </button>
        ))}
      </div>

      <div className="section-divider" />

      <div className="categories">
        {categories.map(cat => (
          <CategorySection key={cat.id} category={cat} />
        ))}
      </div>

      <Footer />

      {showScrollTop && (
        <button className="scroll-top-btn" onClick={scrollToTop} aria-label="Scroll to top">
          <ArrowUp size={16} />
        </button>
      )}
    </div>
  );
}
