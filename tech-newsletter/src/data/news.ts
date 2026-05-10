export interface Article {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  date: string;
  tag?: string;
}

export interface SubCategory {
  id: string;
  name: string;
  icon: string;
  articles: Article[];
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  gradient: string;
  description: string;
  subCategories: SubCategory[];
}

export interface NewsData {
  categories: Category[];
  date: string;
  isStale: boolean;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

const MAY_9_2026_CATEGORIES: Category[] = [
  {
    id: 'technology',
    name: 'Technology',
    icon: '💻',
    color: '#06b6d4',
    gradient: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
    description: 'Latest in software, hardware, AI, cybersecurity, cloud, and web development.',
    subCategories: [
      {
        id: 'ai-generative',
        name: 'Generative AI',
        icon: '🤖',
        articles: [
          {
            id: 'gen-ai-1',
            title: 'OpenAI GPT-5.5 Launches with "Agentic Coding" Superpowers',
            summary:
              'Launched April 23, 2026, GPT-5.5 boasts advanced agentic coding abilities, outperforming previous models in coding and reasoning benchmarks. It is now available to Plus, Pro, Business, and Enterprise users in ChatGPT and Codex. OpenAI is also advancing its "super app" strategy and workspace agents for teams.',
            url: 'https://aitoolsrecap.com/Blog/ai-news-may-2026',
            source: 'AI Tools Recap',
            date: 'May 9, 2026',
            tag: 'Model Release',
          },
          {
            id: 'gen-ai-2',
            title: 'Google Gemini 3.1 Ultra: 2 Million Token Context Window',
            summary:
              "Google's Gemini 3.1 Ultra features a groundbreaking 2-million token context window, enabling rich, long-form multimodal conversations (text, image, audio, video) natively, and ships with sandboxed code execution capabilities.",
            url: 'https://aitoolsrecap.com/Blog/ai-news-may-2026',
            source: 'AI Tools Recap',
            date: 'May 9, 2026',
            tag: 'Model Release',
          },
          {
            id: 'gen-ai-3',
            title: 'AI Video Goes Mainstream: From Netflix to OpenAI Sora Gen-4',
            summary:
              'AI models now generate consistent, high-quality video content for streaming platforms, with mainstream production use. Netflix is piloting AI-generated scenes while new tools like OpenAI Sora and Runway Gen-4 are enabling creators at scale.',
            url: 'https://www.artiba.org/blog/the-future-of-generative-ai-10-breakthroughs-defining-2026',
            source: 'Artiba',
            date: 'May 9, 2026',
            tag: 'Industry',
          },
          {
            id: 'gen-ai-4',
            title: 'DeepSeek V4: 1M Token Context, Open Weights, Enhanced Reasoning',
            summary:
              'DeepSeek V4 released with a 1-million token context window, open weights, and enhancements for code and reasoning tasks. Its fully open nature is accelerating third-party innovation.',
            url: 'https://theaitrack.com/ai-news-may-2026-in-depth-and-concise/',
            source: 'The AI Track',
            date: 'May 9, 2026',
            tag: 'Open Source',
          },
          {
            id: 'gen-ai-5',
            title: 'Anthropic Eyes $50B Funding at $900B Valuation; OpenAI Hits $25B Revenue',
            summary:
              "Anthropic is pursuing a $50B funding round targeting a $900B valuation, while OpenAI surpasses $25B in annual revenue and explores a late-2026 IPO—signaling immense investor confidence and rapid sector expansion.",
            url: 'https://aiflashreport.com/',
            source: 'AI Flash Report',
            date: 'May 9, 2026',
            tag: 'Business',
          },
        ],
      },
      {
        id: 'ai-vision',
        name: 'Visual Processing AI',
        icon: '👁️',
        articles: [
          {
            id: 'vision-1',
            title: 'Multimodal Models Blur the Line Between Text, Vision, and Audio',
            summary:
              'Models like GPT-5 and Gemini now integrate text, audio, visual, and video data for richer context and deeper comprehension. Real-world applications range from medical imaging analysis to retail visual search engines.',
            url: 'https://graffersid.com/advancements-in-natural-language-processing-nlp/',
            source: 'GraffersID',
            date: 'May 9, 2026',
            tag: 'Research',
          },
          {
            id: 'vision-2',
            title: 'AI-Powered Blood Test Detects Silent Liver Disease Before Symptoms',
            summary:
              'A new AI-powered blood test can now detect silent liver disease before symptoms appear, combining visual pathology pattern matching with biomarker analysis to offer hope for earlier diagnosis and intervention.',
            url: 'https://scitechdaily.com/',
            source: 'SciTechDaily',
            date: 'May 9, 2026',
            tag: 'Healthcare',
          },
        ],
      },
      {
        id: 'ai-nlp',
        name: 'NLP',
        icon: '💬',
        articles: [
          {
            id: 'nlp-1',
            title: 'Hugging Face Transformers v5.8.0: Faster, Leaner, More Modular',
            summary:
              'A significant update with new architectures for more efficient natural language tasks. This version accelerates open-source NLP innovation with improved tokenization, reduced memory footprint, and better support for domain-specific fine-tuning.',
            url: 'https://af.net/ar/realtime/latest-ai-innovations-from-hugging-face-github-and-arxiv-may-2026/',
            source: 'AF.net',
            date: 'May 9, 2026',
            tag: 'Open Source',
          },
          {
            id: 'nlp-2',
            title: 'Domain-Specific LLMs Outperform GPT-5 in Healthcare and Legal',
            summary:
              'Specialized models for healthcare, legal, finance, and e-commerce are now outperforming general-purpose models for critical tasks. Privacy-sensitive sectors are embracing fine-tuned, domain-locked models.',
            url: 'https://graffersid.com/advancements-in-natural-language-processing-nlp/',
            source: 'GraffersID',
            date: 'May 9, 2026',
            tag: 'Enterprise',
          },
          {
            id: 'nlp-3',
            title: 'AI Chat Logs Now Legally Discoverable in U.S. Courts',
            summary:
              'As of May 2026, AI chat interactions are now legally discoverable in litigation, raising the stakes for business and legal compliance in AI use. Organizations must now audit and retain AI interaction logs.',
            url: 'https://toolscompare.ai/news/may-2026',
            source: 'Tools Compare',
            date: 'May 9, 2026',
            tag: 'Policy',
          },
          {
            id: 'nlp-4',
            title: 'Edge NLP: Real-Time Processing Without the Cloud',
            summary:
              'Privacy and edge NLP—real-time, low-latency natural language processing on edge devices via federated learning—is reducing dependency on centralized cloud processing, enhancing both privacy and speed.',
            url: 'https://graffersid.com/advancements-in-natural-language-processing-nlp/',
            source: 'GraffersID',
            date: 'May 9, 2026',
            tag: 'Privacy',
          },
        ],
      },
      {
        id: 'cybersecurity',
        name: 'Cybersecurity',
        icon: '🔐',
        articles: [
          {
            id: 'cyber-1',
            title: 'Supply Chain Attacks Target SAP npm Packages and Google Gemini CLI',
            summary:
              'Major supply chain attack campaigns are targeting SAP npm packages and Google Gemini CLI, leading to credential theft and CI/CD pipeline risks. Developers are urged to audit dependencies and use lock files.',
            url: 'https://www.esecurityplanet.com/weekly-roundup/supply-chain-attacks-ai-security-and-major-breaches-define-this-week-in-cybersecurity-in-may-2026/',
            source: 'eSecurity Planet',
            date: 'May 9, 2026',
            tag: 'Threat',
          },
          {
            id: 'cyber-2',
            title: 'NVIDIA GeForce Now Breach Exposes User Personal Information',
            summary:
              "A major data breach at NVIDIA's GeForce Now cloud gaming service exposed personal information of millions of users, highlighting the growing attack surface of consumer cloud gaming platforms.",
            url: 'https://cybernews.com/',
            source: 'Cybernews',
            date: 'May 9, 2026',
            tag: 'Breach',
          },
          {
            id: 'cyber-3',
            title: 'CISA Issues "Careful Adoption" Guidance for AI Services',
            summary:
              "The U.S. Cybersecurity and Infrastructure Security Agency (CISA) released new guidance advising organizations on careful adoption of AI services in critical infrastructure, and continues to update its catalog of exploited vulnerabilities.",
            url: 'https://www.cisa.gov/news-events/cybersecurity-advisories',
            source: 'CISA',
            date: 'May 9, 2026',
            tag: 'Policy',
          },
          {
            id: 'cyber-4',
            title: 'Flaws Found in Microsoft 365 Copilot and Claude Browser Extensions',
            summary:
              'AI-based attack tools are being leveraged by less-skilled actors, and flaws in platforms like Microsoft 365 Copilot and Claude browser extensions continue to be found and patched. Prompt injection attacks remain a key concern.',
            url: 'https://www.securityweek.com/',
            source: 'SecurityWeek',
            date: 'May 9, 2026',
            tag: 'Vulnerability',
          },
        ],
      },
      {
        id: 'cloud',
        name: 'Cloud Computing',
        icon: '☁️',
        articles: [
          {
            id: 'cloud-1',
            title: "Google Cloud Revenue Surges as AI Demand Skyrockets",
            summary:
              "Google Cloud's quarterly revenue has surged dramatically, fueled by enterprise AI adoption. Google is betting heavily on its TPU infrastructure and Gemini integrations to outpace AWS and Azure.",
            url: 'https://www.ciodive.com/topic/cloud/',
            source: 'CIO Dive',
            date: 'May 9, 2026',
            tag: 'Industry',
          },
          {
            id: 'cloud-2',
            title: 'AWS Launches Agentic AI Desktop Apps and IBM Mainframe Partnership',
            summary:
              'AWS unveiled new agentic AI desktop application tools and announced a major partnership with IBM focused on mainframe-to-cloud interoperability, enabling hybrid enterprise workloads across legacy and modern systems.',
            url: 'https://www.ciodive.com/topic/cloud/',
            source: 'CIO Dive',
            date: 'May 9, 2026',
            tag: 'Product Launch',
          },
          {
            id: 'cloud-3',
            title: 'Global IT Spending to Hit $6.31 Trillion in 2026',
            summary:
              'Gartner projects global IT spending to reach $6.31 trillion in 2026, with cloud infrastructure and AI leading the charge. Hybrid cloud adoption continues to accelerate across enterprise sectors.',
            url: 'https://www.ciodive.com/topic/cloud/',
            source: 'CIO Dive',
            date: 'May 9, 2026',
            tag: 'Market',
          },
        ],
      },
      {
        id: 'webdev',
        name: 'Web Development',
        icon: '🌐',
        articles: [
          {
            id: 'webdev-1',
            title: 'Hardcoded API Keys and Dormant Backdoors Plague WordPress Plugins',
            summary:
              'Researchers continue to find hardcoded API keys and dormant backdoors in popular WordPress plugins, leaving millions of sites vulnerable. Developers are urged to enforce input validation, remove secrets from source code, and adopt MFA.',
            url: 'https://www.esecurityplanet.com/weekly-roundup/supply-chain-attacks-ai-security-and-major-breaches-define-this-week-in-cybersecurity-in-may-2026/',
            source: 'eSecurity Planet',
            date: 'May 9, 2026',
            tag: 'Security',
          },
          {
            id: 'webdev-2',
            title: 'Microsoft Agent 365 Now Generally Available for Enterprise Teams',
            summary:
              'Microsoft Agent 365 is now generally available, integrating identity, security, and governance tools for deploying AI agents in enterprise web environments. It aims to simplify agentic workflow deployment.',
            url: 'https://aitoolsrecap.com/Blog/ai-news-may-2026',
            source: 'AI Tools Recap',
            date: 'May 9, 2026',
            tag: 'Product Launch',
          },
        ],
      },
    ],
  },
  {
    id: 'science',
    name: 'Science',
    icon: '🔬',
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981, #06b6d4)',
    description: 'Breakthroughs in physics, biology, space exploration, and environmental science.',
    subCategories: [
      {
        id: 'physics',
        name: 'Physics',
        icon: '⚛️',
        articles: [
          {
            id: 'phys-1',
            title: 'New Quantum Particles Discovered That Defy Boson-Fermion Classification',
            summary:
              "Physicists have discovered new quantum particles that don't fit the usual categories of bosons or fermions, hinting at a hidden side of the quantum world. This could fundamentally change our understanding of quantum mechanics and particle physics.",
            url: 'https://www.sciencedaily.com/',
            source: 'ScienceDaily',
            date: 'May 9, 2026',
            tag: 'Discovery',
          },
          {
            id: 'phys-2',
            title: 'Muon Magnetic Moment Measured with Unprecedented Precision',
            summary:
              "The 2026 Breakthrough Prize in Fundamental Physics was awarded for the most precise measurement yet of the muon's magnetic moment—a result that could shake the Standard Model of particle physics and hint at new forces or particles.",
            url: 'https://breakthroughprize.org/News/98',
            source: 'Breakthrough Prize',
            date: 'May 9, 2026',
            tag: 'Award',
          },
          {
            id: 'phys-3',
            title: 'Time Crystals Linked to Real Quantum Devices for First Time',
            summary:
              'Scientists have linked "time crystals"—exotic states of matter that repeat forever without energy input—to real-world quantum devices, bringing these theoretical phenomena closer to technological use.',
            url: 'https://www.sciencedaily.com/news/matter_energy/quantum_computing/',
            source: 'ScienceDaily',
            date: 'May 9, 2026',
            tag: 'Research',
          },
          {
            id: 'phys-4',
            title: 'Oxford Physicists Demonstrate Rare "Quadsqueezing" Quantum Effect',
            summary:
              'Oxford physicists created a new way to control quantum systems by demonstrating a rare fourth-order quantum effect called quadsqueezing, opening new avenues for precision measurement and quantum state manipulation.',
            url: 'https://www.sciencedaily.com/news/matter_energy/quantum_computing/',
            source: 'ScienceDaily',
            date: 'May 9, 2026',
            tag: 'Research',
          },
        ],
      },
      {
        id: 'biology',
        name: 'Biology & Biotech',
        icon: '🧬',
        articles: [
          {
            id: 'bio-1',
            title: 'Genes Identified That Could Allow Humans to Regrow Limbs',
            summary:
              'Scientists identified genes that could one day allow humans to regrow lost limbs, inspired by studies in animals like axolotls and zebrafish. The discovery opens a new frontier in regenerative medicine.',
            url: 'https://www.sciencedaily.com/',
            source: 'ScienceDaily',
            date: 'May 9, 2026',
            tag: 'Discovery',
          },
          {
            id: 'bio-2',
            title: 'Fat Cell Protein HSL Has Far More Complex Role Than Thought',
            summary:
              'A major obesity discovery revealed that the protein HSL in fat cells has a much more complex role than previously thought, potentially rewriting decades of molecular biology science and opening new obesity treatment targets.',
            url: 'https://www.sciencedaily.com/',
            source: 'ScienceDaily',
            date: 'May 9, 2026',
            tag: 'Research',
          },
          {
            id: 'bio-3',
            title: 'Breakthrough Prize Celebrates Gene Therapies for Blindness, Sickle Cell, and ALS',
            summary:
              'The biggest life sciences awards of the year celebrated gene therapies for inherited blindness, sickle cell disease, and beta-thalassemia, as well as discoveries into ALS and dementia causes—marking a golden era for genetic medicine.',
            url: 'https://breakthroughprize.org/News/98',
            source: 'Breakthrough Prize',
            date: 'May 9, 2026',
            tag: 'Award',
          },
          {
            id: 'bio-4',
            title: 'IBM & Cleveland Clinic Simulate 12,635-Atom Protein on Quantum Computer',
            summary:
              'Cleveland Clinic, RIKEN, and IBM simulated a protein with 12,635 atoms—the largest biologically meaningful molecule simulated with quantum computers. This benchmark greatly expands what quantum-centric supercomputing can achieve for real-world biology and drug discovery.',
            url: 'https://newsroom.ibm.com/2026-05-05-cleveland-clinic,-riken,-and-ibm-model-a-12,635-atom-protein-the-largest-known-to-be-simulated-with-quantum-computers',
            source: 'IBM Newsroom',
            date: 'May 5, 2026',
            tag: 'Milestone',
          },
        ],
      },
      {
        id: 'space',
        name: 'Space & Astronomy',
        icon: '🚀',
        articles: [
          {
            id: 'space-1',
            title: "NASA's Perseverance Rover Explores 'Crocodile Bridge' Formation on Mars",
            summary:
              "NASA's Perseverance rover is currently exploring a formation nicknamed 'Crocodile Bridge' on Mars, examining rock layers that could hold clues to ancient Martian environments and potential biosignatures.",
            url: 'https://science.nasa.gov/',
            source: 'NASA Science',
            date: 'May 9, 2026',
            tag: 'Exploration',
          },
          {
            id: 'space-2',
            title: "Blue Origin's MK1 Lunar Lander Passes Key Test for Moon Missions",
            summary:
              "Blue Origin's new MK1 lunar lander passed a key qualification test, advancing NASA's Artemis program plans for returning humans to the Moon. The milestone sets the stage for crewed lunar landing preparation.",
            url: 'https://www.space.com/news/archive',
            source: 'Space.com',
            date: 'May 9, 2026',
            tag: 'Milestone',
          },
          {
            id: 'space-3',
            title: 'NASA Fires Up Record-Breaking Plasma Thruster for Mars Missions',
            summary:
              'NASA successfully tested a record-breaking plasma thruster that could dramatically cut travel time to Mars. The advanced electric propulsion system could enable future crewed missions to the red planet.',
            url: 'https://science.nasa.gov/',
            source: 'NASA Science',
            date: 'May 9, 2026',
            tag: 'Technology',
          },
          {
            id: 'space-4',
            title: '10,000 Potential New Exoplanets Discovered via NASA Data Reanalysis',
            summary:
              'Astronomers revealed 10,000 potential new exoplanets by reanalyzing NASA telescope data using advanced AI-driven transit detection algorithms, dramatically expanding the known catalog of worlds beyond our solar system.',
            url: 'https://www.space.com/news/archive',
            source: 'Space.com',
            date: 'May 9, 2026',
            tag: 'Discovery',
          },
          {
            id: 'space-5',
            title: 'Black Holes May Grow Primarily Through Cosmic Collisions, Not Collapse',
            summary:
              'Physicists proposed that black holes might grow primarily through cosmic collisions with other massive objects rather than just stellar collapse, challenging established models of black hole growth and galactic evolution.',
            url: 'https://www.sciencenewstoday.org/',
            source: 'Science News Today',
            date: 'May 9, 2026',
            tag: 'Research',
          },
        ],
      },
      {
        id: 'climate',
        name: 'Climate & Environment',
        icon: '🌍',
        articles: [
          {
            id: 'climate-1',
            title: 'Constipation Drug Shows Dramatic Kidney-Protective Effects in Trials',
            summary:
              'A new drug for chronic kidney disease was discovered from an unlikely source—a common constipation treatment showed dramatic kidney-protective effects in early trials, offering hope to millions with chronic kidney disease.',
            url: 'https://www.sciencedaily.com/',
            source: 'ScienceDaily',
            date: 'May 9, 2026',
            tag: 'Medical',
          },
          {
            id: 'climate-2',
            title: 'Global IT Sector Energy Demand Becomes Climate Concern as AI Scales',
            summary:
              'As AI model training and inference scale massively, the global IT sector\'s energy consumption is under scrutiny. The IEA reports data center electricity use doubled from 2022 to 2026, pressing for renewable energy integration.',
            url: 'https://www.iea.org/',
            source: 'IEA',
            date: 'May 9, 2026',
            tag: 'Energy',
          },
        ],
      },
      {
        id: 'materials',
        name: 'Materials Science',
        icon: '🧪',
        articles: [
          {
            id: 'mat-1',
            title: 'Atom Computing Neutral-Atom Machine Reaches 1,225 Qubits Using 3D Optical Tweezers',
            summary:
              'Atom Computing released a neutral-atom quantum machine with 1,225 qubits—currently the highest commercial qubit count—using optical tweezers to arrange atoms in 3D lattices. They plan to reach 5,000 qubits by 2027.',
            url: 'https://www.programming-helper.com/tech/quantum-computing-breakthrough-2026-ibm-google-qubit-race',
            source: 'Programming Helper',
            date: 'May 9, 2026',
            tag: 'Hardware',
          },
          {
            id: 'mat-2',
            title: 'Photon Quantum Teleportation Achieved Over 270-Meter Open-Air Link',
            summary:
              'Researchers successfully teleported a photon\'s quantum state between two separate quantum dots over a 270-meter open-air link, marking a breakthrough in quantum networking and long-distance quantum communication.',
            url: 'https://www.sciencedaily.com/news/matter_energy/quantum_computing/',
            source: 'ScienceDaily',
            date: 'May 9, 2026',
            tag: 'Breakthrough',
          },
        ],
      },
    ],
  },
  {
    id: 'quantum',
    name: 'Quantum Computing',
    icon: '⚡',
    color: '#a855f7',
    gradient: 'linear-gradient(135deg, #a855f7, #ec4899)',
    description: 'The frontier of computation — algorithms, hardware, cryptography, and networking.',
    subCategories: [
      {
        id: 'quantum-hardware',
        name: 'Quantum Hardware',
        icon: '🖥️',
        articles: [
          {
            id: 'qhw-1',
            title: "IBM's 433-Qubit Condor in Production With 40% Error Rate Reduction",
            summary:
              "IBM's 433-qubit Condor processor is now in real-world production environments with error rates reduced by 40% compared to 2024 systems, making it 10x more capable than IBM's 2023 processors. IBM is deploying these processors at multiple data centers.",
            url: 'https://www.programming-helper.com/tech/quantum-computing-breakthrough-2026-ibm-google-qubit-race',
            source: 'Programming Helper',
            date: 'May 9, 2026',
            tag: 'Hardware',
          },
          {
            id: 'qhw-2',
            title: "Google's 1000-Qubit Willow Shows Quantum Advantage in Portfolio Optimization",
            summary:
              "Google's 1000-qubit Willow system has demonstrated quantum advantage in applications such as portfolio optimization, completing calculations in minutes that would take classical supercomputers years. Willow is now available for early access research proposals.",
            url: 'https://www.programming-helper.com/tech/quantum-computing-breakthrough-2026-ibm-google-qubit-race',
            source: 'Programming Helper',
            date: 'May 9, 2026',
            tag: 'Milestone',
          },
          {
            id: 'qhw-3',
            title: 'Atom Computing Tops Commercial Qubit Count at 1,225 with Neutral Atoms',
            summary:
              'Atom Computing leads the commercial market with 1,225 neutral-atom qubits arranged in 3D optical tweezer lattices. Their road map targets 5,000 qubits by 2027, which would cement a significant lead in error-corrected quantum computing.',
            url: 'https://www.programming-helper.com/tech/quantum-computing-breakthrough-2026-ibm-google-qubit-race',
            source: 'Programming Helper',
            date: 'May 9, 2026',
            tag: 'Hardware',
          },
        ],
      },
      {
        id: 'quantum-algorithms',
        name: 'Quantum Algorithms',
        icon: '📐',
        articles: [
          {
            id: 'qalg-1',
            title: "Google Optimizes Shor's Algorithm: Fewer Qubits to Break Encryption",
            summary:
              "Google optimized Shor's algorithm for more efficient encryption cracking—meaning fewer qubits are now needed to challenge current cryptography standards. This is a major signal for post-quantum cryptography urgency.",
            url: 'https://www.spinquanta.com/news-detail/quantum-computing-advances',
            source: 'SpinQuanta',
            date: 'May 9, 2026',
            tag: 'Algorithm',
          },
          {
            id: 'qalg-2',
            title: 'Caltech qLDPC Error Correction Codes Double Fault-Tolerant Thresholds',
            summary:
              "Caltech's quantum low-density parity-check (qLDPC) error correction codes have dramatically reduced the number of physical qubits needed for robust fault-tolerant computing, doubling the error resistance limit and making high-performance quantum computers feasible at smaller scales.",
            url: 'https://www.spinquanta.com/news-detail/quantum-computing-advances',
            source: 'SpinQuanta',
            date: 'May 9, 2026',
            tag: 'Error Correction',
          },
          {
            id: 'qalg-3',
            title: 'Fault-Tolerant Quantum Computing Advances 5–10 Years Ahead of Schedule',
            summary:
              'Industry consensus is that fault-tolerant quantum computing has advanced by 5–10 years due to combined algorithm and hardware innovations. Hybrid quantum/classical supercomputing is now delivering results that matter for industrial applications.',
            url: 'https://www.spinquanta.com/news-detail/quantum-computing-advances',
            source: 'SpinQuanta',
            date: 'May 9, 2026',
            tag: 'Industry',
          },
        ],
      },
      {
        id: 'quantum-cryptography',
        name: 'Quantum Cryptography',
        icon: '🔑',
        articles: [
          {
            id: 'qcrypto-1',
            title: 'Post-Quantum Cryptography Urgency Grows as Shor Optimization Hits',
            summary:
              "As Google's optimized Shor's algorithm reduces the qubit barrier for cracking RSA/ECC encryption, NIST's post-quantum cryptography standards (CRYSTALS-Kyber, CRYSTALS-Dilithium) are becoming critical for organizations to adopt now.",
            url: 'https://quantumcomputingreport.com/news/',
            source: 'Quantum Computing Report',
            date: 'May 9, 2026',
            tag: 'Security',
          },
          {
            id: 'qcrypto-2',
            title: 'Quantum Key Distribution Moves From Lab to Enterprise Deployments',
            summary:
              'Quantum Key Distribution (QKD) systems are moving from laboratory demonstrations to commercial enterprise deployments in financial services and government sectors, providing theoretically unbreakable encryption channels.',
            url: 'https://quantumcomputingreport.com/news/',
            source: 'Quantum Computing Report',
            date: 'May 9, 2026',
            tag: 'Enterprise',
          },
        ],
      },
      {
        id: 'quantum-networking',
        name: 'Quantum Networking',
        icon: '🌐',
        articles: [
          {
            id: 'qnet-1',
            title: 'Quantum Teleportation Over 270-Meter Open-Air Link Between Quantum Dots',
            summary:
              'In a landmark experiment, researchers successfully teleported a photon\'s quantum state between two separate quantum dots over a 270-meter open-air link—a critical step toward a practical quantum internet.',
            url: 'https://www.sciencedaily.com/news/matter_energy/quantum_computing/',
            source: 'ScienceDaily',
            date: 'May 9, 2026',
            tag: 'Breakthrough',
          },
          {
            id: 'qnet-2',
            title: 'LightsynQ and CavilinQ Emerge to Commercialize Quantum Networking',
            summary:
              'Startups LightsynQ and quantum networking leader CavilinQ have emerged from university labs, pushing commercialization of quantum repeater networks faster than anticipated, with early pilot networks in select metro areas.',
            url: 'https://quantumcomputingreport.com/news/',
            source: 'Quantum Computing Report',
            date: 'May 9, 2026',
            tag: 'Startup',
          },
          {
            id: 'qnet-3',
            title: '$17.3B Global Quantum Investment in 2026: Up 65% Year-Over-Year',
            summary:
              'Global investment in quantum computing hit $17.3 billion in 2026, rising 65% year over year. Enterprises are moving from pilot programs to production deployments, with quantum networking, sensing, and simulation leading commercial demand.',
            url: 'https://www.programming-helper.com/tech/quantum-computing-breakthrough-2026-ibm-google-qubit-race',
            source: 'Programming Helper',
            date: 'May 9, 2026',
            tag: 'Market',
          },
        ],
      },
      {
        id: 'quantum-education',
        name: 'Quantum Education & Careers',
        icon: '🎓',
        articles: [
          {
            id: 'qedu-1',
            title: 'First Quantum Pre-Apprenticeship Program Launches in Chattanooga',
            summary:
              "Chattanooga's new quantum pre-apprenticeship program is building the next generation of quantum talent, offering hands-on training in quantum hardware operation, programming, and error correction. The program is the first of its kind in the U.S.",
            url: 'https://news.harvard.edu/gazette/story/2026/05/building-useful-quantum-computers-in-our-direct-line-of-sight/',
            source: 'Harvard Gazette',
            date: 'May 9, 2026',
            tag: 'Education',
          },
          {
            id: 'qedu-2',
            title: "Harvard: Useful Quantum Computers 'In Our Direct Line of Sight'",
            summary:
              "Harvard researchers argue that useful quantum computers—those solving problems beyond classical supercomputers in practical domains—are now in our direct line of sight, with key technical milestones falling faster than expected.",
            url: 'https://news.harvard.edu/gazette/story/2026/05/building-useful-quantum-computers-in-our-direct-line-of-sight/',
            source: 'Harvard Gazette',
            date: 'May 9, 2026',
            tag: 'Research',
          },
        ],
      },
    ],
  },
];

// All available newsletter data keyed by date string (add new dates here as they become available)
export const allNewsData: Record<string, Category[]> = {
  'May 9, 2026': MAY_9_2026_CATEGORIES,
};

// Precomputed so sorting doesn't happen on every getNewsData() call
const sortedDates = Object.keys(allNewsData).sort(
  (a, b) => new Date(b).getTime() - new Date(a).getTime(),
);

export function getNewsData(): NewsData {
  const today = formatDate(new Date());

  if (allNewsData[today]) {
    return { categories: allNewsData[today], date: today, isStale: false };
  }

  // Fall back to the most recent date we have data for
  const latestDate = sortedDates[0];
  return { categories: allNewsData[latestDate], date: latestDate, isStale: true };
}

// Kept for backward compatibility
export const categories = MAY_9_2026_CATEGORIES;
export const NEWSLETTER_DATE = 'May 9, 2026';
