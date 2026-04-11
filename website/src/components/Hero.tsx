import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';

export function Hero() {
  return (
    <section className="hero" id="hero">
      <motion.div
        className="hero-content"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <p className="hero-greeting">Hello, I&#39;m</p>
        <h1 className="hero-name">Omar</h1>
        <p className="hero-title">
          Senior Software Engineer · Cloud &amp; AI Enthusiast
        </p>
        <div className="hero-cta">
          <a href="#projects" className="btn btn-primary">
            View Projects <ArrowDown size={16} />
          </a>
          <a
            href="https://github.com/Omar102598"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline"
          >
            <FaGithub size={16} /> GitHub
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline"
          >
            <FaLinkedin size={16} /> LinkedIn
          </a>
        </div>
      </motion.div>
    </section>
  );
}
