import { Code2, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <Code2 size={20} />
          <span>CodePrep AI</span>
        </div>
        <p className="footer-text">
          AI-powered interview preparation for Software Engineers
        </p>
        <div className="footer-links">
          <a
            href="https://github.com/Omar102598"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            <ExternalLink size={18} />
            <span>GitHub</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
