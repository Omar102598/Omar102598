export interface Project {
  id: number;
  title: string;
  description: string;
  tags: string[];
  icon: string;
}

export const projects: Project[] = [
  {
    id: 1,
    title: 'Cloud Infrastructure Manager',
    description:
      'Multi-cloud Infrastructure-as-Code platform using Terraform and Azure Bicep for AWS & Azure. Automated provisioning of VMs, networking, databases, and monitoring with full CI/CD pipelines.',
    tags: ['Azure', 'AWS', 'Terraform', 'Bicep', 'CI/CD'],
    icon: '☁️',
  },
  {
    id: 2,
    title: 'Enterprise Microservices Platform',
    description:
      'Spring Boot microservices architecture with multi-database support (MySQL, SQL Server, PostgreSQL). Includes service discovery, API gateway, circuit breaker patterns, and distributed tracing.',
    tags: ['Java', 'Spring Boot', 'MySQL', 'PostgreSQL', 'SQL Server', 'Docker'],
    icon: '🏗️',
  },
  {
    id: 3,
    title: 'AI-Powered ETL Pipeline',
    description:
      'Python ETL pipeline with AI-driven data quality checks, anomaly detection, and automated schema mapping. Orchestrated with Apache Airflow for reliable, scalable data processing.',
    tags: ['Python', 'Apache Airflow', 'OpenAI', 'pandas', 'PostgreSQL'],
    icon: '🤖',
  },
  {
    id: 4,
    title: 'BPMN Workflow Automation',
    description:
      'Enterprise workflow engine using Camunda BPM with Spring Boot. Features a visual process designer, task management dashboard, and AI-assisted decision nodes for intelligent routing.',
    tags: ['Java', 'Spring Boot', 'Camunda', 'BPMN', 'Angular'],
    icon: '⚙️',
  },
  {
    id: 5,
    title: 'Full-Stack Project Management',
    description:
      'Angular frontend, Spring Boot backend, and React dashboard for project management. Real-time collaboration via WebSockets, Kanban boards, and AI-powered sprint planning.',
    tags: ['Angular', 'React', 'Spring Boot', 'TypeScript', 'WebSocket'],
    icon: '📋',
  },
  {
    id: 6,
    title: 'Kotlin AI Microservice',
    description:
      'Kotlin-based intelligent service with ML model serving, natural language processing, and predictive analytics. Built with Ktor for high-performance async request handling.',
    tags: ['Kotlin', 'Ktor', 'OpenAI', 'TensorFlow', 'Docker'],
    icon: '🧠',
  },
];
