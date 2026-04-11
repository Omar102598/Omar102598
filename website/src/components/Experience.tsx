import { motion } from 'framer-motion';

interface ExperienceEntry {
  title: string;
  company: string;
  date: string;
  description: string;
}

const experiences: ExperienceEntry[] = [
  {
    title: 'Senior Software Engineer',
    company: 'Company Name',
    date: '2022 – Present',
    description:
      'Leading cloud-native application development on Azure and AWS. Architecting microservices platforms with Spring Boot and Kotlin. Driving AI/ML integration into enterprise workflows and mentoring engineering teams.',
  },
  {
    title: 'Full Stack Developer',
    company: 'Company Name',
    date: '2020 – 2022',
    description:
      'Built and maintained Angular + React frontends and Spring Boot APIs. Designed ETL pipelines with Python and Apache Airflow. Implemented CI/CD pipelines with Docker, Kubernetes, and GitHub Actions.',
  },
  {
    title: 'Software Engineer',
    company: 'Company Name',
    date: '2018 – 2020',
    description:
      'Developed RESTful services in Java and contributed to database design across MySQL, PostgreSQL, and SQL Server. Automated infrastructure provisioning with Terraform and wrote comprehensive test suites.',
  },
];

const itemVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
};

export function Experience() {
  return (
    <section className="section" id="experience">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="section-title">Experience</h2>
        <p className="section-subtitle">My professional journey</p>
      </motion.div>

      <div className="experience-timeline">
        {experiences.map((exp, i) => (
          <motion.div
            className="experience-item"
            key={i}
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ delay: i * 0.15 }}
          >
            <h3>{exp.title}</h3>
            <div className="experience-company">{exp.company}</div>
            <div className="experience-date">{exp.date}</div>
            <p>{exp.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
