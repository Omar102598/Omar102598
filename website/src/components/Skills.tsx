import { motion } from 'framer-motion';
import { Cloud, Server, Monitor, Database, Container, BarChart3, Brain } from 'lucide-react';
import type { ReactNode } from 'react';

interface SkillCategory {
  title: string;
  icon: ReactNode;
  skills: string[];
}

const categories: SkillCategory[] = [
  { title: 'Cloud', icon: <Cloud size={18} />, skills: ['Azure', 'AWS', 'Terraform', 'Bicep'] },
  { title: 'Backend', icon: <Server size={18} />, skills: ['Java', 'Spring Boot', 'Kotlin', 'Python'] },
  { title: 'Frontend', icon: <Monitor size={18} />, skills: ['Angular', 'React', 'TypeScript'] },
  { title: 'Databases', icon: <Database size={18} />, skills: ['MySQL', 'PostgreSQL', 'SQL Server'] },
  { title: 'DevOps', icon: <Container size={18} />, skills: ['Docker', 'Kubernetes', 'CI/CD', 'GitHub Actions'] },
  { title: 'Data', icon: <BarChart3 size={18} />, skills: ['ETL', 'Apache Airflow', 'pandas'] },
  { title: 'AI / ML', icon: <Brain size={18} />, skills: ['OpenAI', 'TensorFlow', 'NLP'] },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function Skills() {
  return (
    <section className="section" id="skills">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="section-title">Skills &amp; Technologies</h2>
        <p className="section-subtitle">Tools and technologies I work with every day</p>
      </motion.div>

      <motion.div
        className="skills-grid"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        {categories.map((cat) => (
          <motion.div className="skill-category" key={cat.title} variants={cardVariants}>
            <div className="skill-category-title">
              {cat.icon} {cat.title}
            </div>
            <div className="skill-chips">
              {cat.skills.map((s) => (
                <span className="skill-chip" key={s}>
                  {s}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
