import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpenText, Clock, ExternalLink } from 'lucide-react';
import { articles } from '../data/articles';
import type { Article } from '../data/articles';
import type { AppView, TopicCategory } from '../types';

interface ArticleListProps {
  onNavigate: (view: AppView) => void;
  onSelectArticle: (id: TopicCategory) => void;
}

/** Map topic icons to gradient backgrounds for fallback display */
const topicGradients: Record<string, string> = {
  'arrays-strings': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'hash-maps': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'two-pointers': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'sliding-window': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linked-lists': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'trees': 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  'graphs': 'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
  'dynamic-programming': 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
  'recursion-backtracking': 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
  'sorting-searching': 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
  'stacks-queues': 'linear-gradient(135deg, #fddb92 0%, #d1fdff 100%)',
  'math-logic': 'linear-gradient(135deg, #96fbc4 0%, #f9f586 100%)',
  'system-design': 'linear-gradient(135deg, #cd9cf2 0%, #f6f3ff 100%)',
};

function ArticleHeroImage({ article }: { article: Article }) {
  const [imgFailed, setImgFailed] = useState(false);

  const handleError = useCallback(() => setImgFailed(true), []);

  if (imgFailed) {
    return (
      <div
        className="article-card-hero-fallback"
        style={{ background: topicGradients[article.id] || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
      >
        <span className="article-card-hero-emoji">{article.icon}</span>
      </div>
    );
  }

  return <img src={article.heroImage} alt={article.title} loading="lazy" onError={handleError} />;
}

export default function ArticleList({ onNavigate, onSelectArticle }: ArticleListProps) {
  return (
    <div className="articles-page">
      <motion.div
        className="articles-header"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <button className="btn-secondary" onClick={() => onNavigate('dashboard')}>
          <ArrowLeft size={18} />
          Dashboard
        </button>
        <div className="articles-header-text">
          <h1 className="gradient-text">
            <BookOpenText size={32} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 10 }} />
            Learn Data Structures & Algorithms
          </h1>
          <p className="articles-subtitle">
            Deep-dive articles with animations, videos, and visualizations to help you master every
            topic tested in coding interviews.
          </p>
        </div>
      </motion.div>

      <div className="articles-grid">
        {articles.map((article: Article, index: number) => (
          <motion.button
            key={article.id}
            className="article-card"
            onClick={() => onSelectArticle(article.id)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
            whileHover={{ y: -4 }}
          >
            <div className="article-card-hero">
              <ArticleHeroImage article={article} />
              <div className="article-card-overlay" />
            </div>
            <div className="article-card-body">
              <span className="article-card-icon">{article.icon}</span>
              <h3>{article.title}</h3>
              <p>{article.tagline}</p>
              <div className="article-card-meta">
                <span className="article-card-sections">
                  <Clock size={14} />
                  {article.sections.length} sections
                </span>
                <span className="article-card-resources">
                  <ExternalLink size={14} />
                  {article.resources.length} resources
                </span>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
