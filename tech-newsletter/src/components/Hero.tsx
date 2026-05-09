import { NEWSLETTER_DATE, categories } from '../data/news';

export function Hero() {
  const totalArticles = categories.reduce(
    (acc, cat) => acc + cat.subCategories.reduce((a, sub) => a + sub.articles.length, 0),
    0,
  );
  const totalSubCats = categories.reduce((acc, cat) => acc + cat.subCategories.length, 0);

  return (
    <section className="hero">
      <div className="hero__eyebrow">
        <span>📡</span>
        Daily Digest — {NEWSLETTER_DATE}
      </div>
      <h1 className="hero__title">
        Stay Ahead of the Curve.<br />
        Every Day.
      </h1>
      <p className="hero__subtitle">
        Curated daily news across Technology, Science, and Quantum Computing — with direct links to
        the research, blogs, and documentation so you can go as deep as you want.
      </p>
      <div className="hero__stats">
        <div className="hero__stat">
          <span className="hero__stat-value">{categories.length}</span>
          <span className="hero__stat-label">Umbrellas</span>
        </div>
        <div className="hero__stat">
          <span className="hero__stat-value">{totalSubCats}</span>
          <span className="hero__stat-label">Topics</span>
        </div>
        <div className="hero__stat">
          <span className="hero__stat-value">{totalArticles}</span>
          <span className="hero__stat-label">Stories Today</span>
        </div>
      </div>
    </section>
  );
}
