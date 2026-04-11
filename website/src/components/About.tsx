import { motion } from 'framer-motion';

export function About() {
  return (
    <section className="section" id="about">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="section-title">About Me</h2>
        <p className="section-subtitle">A little background on who I am</p>
      </motion.div>

      <div className="about-grid">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="about-avatar">👨‍💻</div>
        </motion.div>

        <motion.div
          className="about-text"
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <p>
            I&#39;m a Senior Software Engineer with a passion for building scalable, cloud-native
            applications. I specialize in full-stack development across Java, Kotlin, Python,
            TypeScript, and modern frontend frameworks like Angular and React.
          </p>
          <p>
            My expertise spans multi-cloud infrastructure (Azure &amp; AWS), microservices
            architecture, AI/ML integration, and enterprise workflow automation. I thrive on
            solving complex problems and delivering high-quality software that makes a real
            impact.
          </p>
          <p>
            When I&#39;m not coding, I enjoy exploring new technologies, contributing to open
            source, and mentoring junior developers.
          </p>

          <div className="about-stats">
            <div className="about-stat">
              <div className="about-stat-number">5+</div>
              <div className="about-stat-label">Years Experience</div>
            </div>
            <div className="about-stat">
              <div className="about-stat-number">20+</div>
              <div className="about-stat-label">Projects Delivered</div>
            </div>
            <div className="about-stat">
              <div className="about-stat-number">7+</div>
              <div className="about-stat-label">Technologies</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
