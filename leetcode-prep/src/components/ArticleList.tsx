import { motion } from 'framer-motion';
import { ArrowLeft, BookOpenText, Clock, ExternalLink } from 'lucide-react';
import { articles } from '../data/articles';
import type { Article } from '../data/articles';
import type { AppView, TopicCategory } from '../types';

interface ArticleListProps {
  onNavigate: (view: AppView) => void;
  onSelectArticle: (id: TopicCategory) => void;
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
            Learn Data Structures &amp; Algorithms
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
              <img src={article.heroImage} alt={article.title} loading="lazy" />
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
