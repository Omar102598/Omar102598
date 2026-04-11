import { motion } from 'framer-motion';
import { Mail, ExternalLink } from 'lucide-react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';

export function Contact() {
  return (
    <section className="section" id="contact">
      <motion.div
        className="contact-content"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="section-title">Get In Touch</h2>
        <p className="section-subtitle">
          I&#39;m always open to new opportunities and interesting projects.
        </p>
        <p>
          Whether you have a question, a project idea, or just want to say hello — feel free to
          reach out!
        </p>
        <div className="contact-links">
          <a href="mailto:omar@example.com" className="contact-link">
            <Mail size={18} /> Email
          </a>
          <a
            href="https://github.com/Omar102598"
            target="_blank"
            rel="noopener noreferrer"
            className="contact-link"
          >
            <FaGithub size={18} /> GitHub
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="contact-link"
          >
            <FaLinkedin size={18} /> LinkedIn
          </a>
          <a
            href="#"
            className="contact-link"
          >
            <ExternalLink size={18} /> Resume
          </a>
        </div>
      </motion.div>
    </section>
  );
}
