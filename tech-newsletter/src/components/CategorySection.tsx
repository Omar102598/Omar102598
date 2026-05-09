import { useState } from 'react';
import { ChevronDown, ExternalLink } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Category } from '../data/news';

interface CategorySectionProps {
  category: Category;
}

export function CategorySection({ category }: CategorySectionProps) {
  const [openSubs, setOpenSubs] = useState<Set<string>>(() => new Set(
    category.subCategories.map(s => s.id)
  ));

  const toggle = (id: string) => {
    setOpenSubs(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const totalArticles = category.subCategories.reduce((acc, sub) => acc + sub.articles.length, 0);

  const catClass =
    category.id === 'technology'
      ? 'tech'
      : category.id === 'science'
      ? 'science'
      : 'quantum';

  return (
    <section className="category" id={category.id}>
      <div className="category__header">
        <div
          className="category__icon-bg"
          style={{ background: category.gradient }}
        >
          {category.icon}
        </div>
        <div className="category__title-group">
          <h2
            className="category__title"
            style={{
              background: category.gradient,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {category.name}
          </h2>
          <p className="category__desc">{category.description}</p>
        </div>
        <span className="category__count">{totalArticles} stories</span>
      </div>

      {category.subCategories.map(sub => {
        const isOpen = openSubs.has(sub.id);
        return (
          <div className="subcategory" key={sub.id}>
            <div
              className="subcategory__header"
              onClick={() => toggle(sub.id)}
              role="button"
              aria-expanded={isOpen}
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && toggle(sub.id)}
            >
              <span className="subcategory__icon">{sub.icon}</span>
              <span className="subcategory__name">{sub.name}</span>
              <span className="subcategory__art-count">{sub.articles.length}</span>
              <ChevronDown
                size={16}
                className={`subcategory__chevron${isOpen ? ' subcategory__chevron--open' : ''}`}
              />
            </div>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  style={{ overflow: 'hidden' }}
                >
                  <div className="articles-grid">
                    {sub.articles.map(article => (
                      <article className={`article-card article-card--${catClass}`} key={article.id}>
                        <div className="article-card__meta">
                          <span className="article-card__source">{article.source}</span>
                          {article.tag && (
                            <span className="article-card__tag">{article.tag}</span>
                          )}
                        </div>
                        <h3 className="article-card__title">{article.title}</h3>
                        <p className="article-card__summary">{article.summary}</p>
                        <a
                          className="article-card__link"
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: `var(--${catClass === 'tech' ? 'accent' : catClass === 'science' ? 'green' : 'purple'})` }}
                        >
                          Read more <ExternalLink size={12} />
                        </a>
                      </article>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </section>
  );
}
