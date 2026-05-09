import { NEWSLETTER_DATE } from '../data/news';

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer__links">
        <a className="footer__link" href="https://aitoolsrecap.com/Blog/ai-news-may-2026" target="_blank" rel="noopener noreferrer">AI Tools Recap</a>
        <a className="footer__link" href="https://www.sciencedaily.com/" target="_blank" rel="noopener noreferrer">ScienceDaily</a>
        <a className="footer__link" href="https://quantumcomputingreport.com/news/" target="_blank" rel="noopener noreferrer">Quantum Computing Report</a>
        <a className="footer__link" href="https://www.securityweek.com/" target="_blank" rel="noopener noreferrer">SecurityWeek</a>
        <a className="footer__link" href="https://www.space.com/" target="_blank" rel="noopener noreferrer">Space.com</a>
      </div>
      <p>TechPulse Newsletter — {NEWSLETTER_DATE} &nbsp;·&nbsp; Built with React &amp; Vite</p>
      <p style={{ marginTop: '6px', fontSize: '0.75rem', opacity: 0.7 }}>
        Content sourced from public news outlets and research publications. All links open to original sources.
      </p>
    </footer>
  );
}
