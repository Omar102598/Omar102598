import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink, Play, Globe, BookOpen } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import type { Article, ArticleResource } from '../data/articles';

interface ArticleViewProps {
  article: Article;
  onBack: () => void;
}

function ArticleViewHeroImage({ article }: { article: Article }) {
  const [imgFailed, setImgFailed] = useState(false);

  const handleError = useCallback(() => setImgFailed(true), []);

  if (imgFailed) {
    return (
      <div className="article-view-hero-fallback">
        <span className="article-view-hero-emoji">{article.icon}</span>
        <span className="article-view-hero-title">{article.title}</span>
      </div>
    );
  }

  return <img src={article.heroImage} alt={article.title} onError={handleError} />;
}

interface ArticleViewProps {
  article: Article;
  onBack: () => void;
}

function ResourceIcon({ type }: { type: ArticleResource['type'] }) {
  switch (type) {
    case 'video':
      return <Play size={16} />;
    case 'visualizer':
      return <Globe size={16} />;
    case 'link':
      return <BookOpen size={16} />;
    default:
      return <ExternalLink size={16} />;
  }
}

function ResourceBadge({ type }: { type: ArticleResource['type'] }) {
  return <span className={`resource-badge resource-badge--${type}`}>{type}</span>;
}

export default function ArticleView({ article, onBack }: ArticleViewProps) {
  const videos = article.resources.filter((r) => r.type === 'video' && r.youtubeId);

  return (
    <div className="article-view">
      {/* Header */}
      <motion.div
        className="article-view-header"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <button className="btn-secondary" onClick={onBack}>
          <ArrowLeft size={18} />
          Back to Articles
        </button>

        <div className="article-view-title-block">
          <span className="article-view-icon">{article.icon}</span>
          <div>
            <h1 className="gradient-text">{article.title}</h1>
            <p className="article-view-tagline">{article.tagline}</p>
          </div>
        </div>
      </motion.div>

      {/* Hero image */}
      <motion.div
        className="article-view-hero"
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15 }}
      >
        <ArticleViewHeroImage article={article} />
      </motion.div>

      {/* Overview */}
      <motion.section
        className="article-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h2>Overview</h2>
        <p className="article-overview-text">{article.overview}</p>
      </motion.section>

      {/* Complexity table */}
      <motion.section
        className="article-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
      >
        <h2>Complexity at a Glance</h2>
        <div className="complexity-table-wrapper">
          <table className="complexity-table">
            <thead>
              <tr>
                {article.complexity.best && <th>Best</th>}
                <th>Average</th>
                <th>Worst</th>
                <th>Space</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                {article.complexity.best && <td><code>{article.complexity.best}</code></td>}
                <td><code>{article.complexity.average}</code></td>
                <td><code>{article.complexity.worst}</code></td>
                <td><code>{article.complexity.space}</code></td>
              </tr>
            </tbody>
          </table>
        </div>
      </motion.section>

      {/* Content sections */}
      {article.sections.map((section, i) => (
        <motion.section
          key={section.heading}
          className="article-section"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 + i * 0.08 }}
        >
          <h2>{section.heading}</h2>
          <div className="article-markdown">
            <ReactMarkdown>{section.content}</ReactMarkdown>
          </div>
        </motion.section>
      ))}

      {/* Embedded videos */}
      {videos.length > 0 && (
        <motion.section
          className="article-section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h2>
            <Play size={22} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8 }} />
            Video Tutorials
          </h2>
          <div className="article-videos-grid">
            {videos.map((v) => (
              <div key={v.youtubeId} className="article-video-card">
                <div className="article-video-embed">
                  <iframe
                    src={`https://www.youtube.com/embed/${v.youtubeId}`}
                    title={v.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <p className="article-video-title">{v.title}</p>
              </div>
            ))}
          </div>
        </motion.section>
      )}

      {/* External resources */}
      <motion.section
        className="article-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <h2>
          <ExternalLink size={22} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8 }} />
          Additional Resources
        </h2>
        <div className="article-resources-list">
          {article.resources.map((r, i) => (
            <a
              key={i}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="article-resource-link"
            >
              <ResourceIcon type={r.type} />
              <span className="article-resource-title">{r.title}</span>
              <ResourceBadge type={r.type} />
            </a>
          ))}
        </div>
      </motion.section>
    </div>
  );
}
