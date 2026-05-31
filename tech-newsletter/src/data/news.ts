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

const MAY_13_2026_CATEGORIES: Category[] = [
  {
    "id": "technology",
    "name": "Technology",
    "icon": "💻",
    "color": "#06b6d4",
    "gradient": "linear-gradient(135deg, #06b6d4, #3b82f6)",
    "description": "Latest in software, hardware, AI, cybersecurity, cloud, and web development.",
    "subCategories": [
      {
        "id": "ai-generative",
        "name": "Generative AI",
        "icon": "🤖",
        "articles": [
          {
            "id": "gen-ai-1",
            "date": "May 13, 2026",
            "title": "Medicare&#8217;s new payment model is built for AI, and most of the tech world has no idea",
            "summary": "Medicare's latest payment model is designed to integrate AI technologies, potentially transforming healthcare delivery. However, many in the tech industry remain unaware of its implications and opportunities.",
            "tag": "Policy",
            "url": "https://techcrunch.com/2026/05/12/medicares-new-payment-model-is-built-for-ai-and-most-of-the-tech-world-has-no-idea/",
            "source": "techcrunch.com"
          },
          {
            "id": "gen-ai-2",
            "date": "May 13, 2026",
            "title": "Potholes cost cities millions: This company is using AI and trucks to fix them",
            "summary": "A new startup is leveraging AI and specialized trucks to tackle the persistent issue of potholes, aiming to save cities millions in repair costs. This innovative approach could redefine urban infrastructure maintenance.",
            "tag": "Startup",
            "url": "https://techcrunch.com/2026/05/12/potholes-cost-cities-millions-samsara-using-ai-trucks-fix/",
            "source": "techcrunch.com"
          }
        ]
      },
      {
        "id": "webdev",
        "name": "Web Development",
        "icon": "🌐",
        "articles": [
          {
            "id": "webdev-1",
            "date": "May 13, 2026",
            "title": "Everything Google announced at its Android Show, from Googlebooks to vibe-coded widgets",
            "summary": "Google's recent Android Show unveiled exciting new features, including the introduction of Googlebooks and innovative vibe-coded widgets. These updates promise to enhance user experience and interactivity across Android devices.",
            "tag": "Market",
            "url": "https://techcrunch.com/2026/05/12/everything-google-announced-at-its-android-show-from-googlebooks-to-vibe-coded-widgets/",
            "source": "techcrunch.com"
          },
          {
            "id": "webdev-2",
            "date": "May 13, 2026",
            "title": "Android is getting a big AI overhaul in 2026",
            "summary": "In a significant update, Android is set to undergo a major AI overhaul this year, promising smarter features and enhanced performance. This move reflects the growing trend of integrating AI into mobile operating systems.",
            "tag": "Algorithm",
            "url": "https://arstechnica.com/gadgets/2026/05/google-says-android-is-getting-a-big-ai-overhaul-in-2026/",
            "source": "arstechnica.com"
          }
        ]
      }
    ]
  },
  {
    "id": "science",
    "name": "Science",
    "icon": "🔬",
    "color": "#10b981",
    "gradient": "linear-gradient(135deg, #10b981, #06b6d4)",
    "description": "Breakthroughs in physics, biology, space exploration, and environmental science.",
    "subCategories": [
      {
        "id": "biology",
        "name": "Biology & Biotech",
        "icon": "🧬",
        "articles": [
          {
            "id": "bio-1",
            "date": "May 13, 2026",
            "title": "Scientists discover a weak spot shared by polio and common cold viruses",
            "summary": "Researchers have identified a common vulnerability in both polio and common cold viruses, opening new avenues for vaccine development and treatment strategies. This discovery could significantly impact public health initiatives.",
            "tag": "Discovery",
            "url": "https://www.sciencedaily.com/releases/2026/05/260512202320.htm",
            "source": "sciencedaily.com"
          },
          {
            "id": "bio-2",
            "date": "May 13, 2026",
            "title": "Scientists make old blood stem cells young again in major anti-aging breakthrough",
            "summary": "A groundbreaking study reveals that scientists have successfully rejuvenated old blood stem cells, potentially paving the way for new anti-aging therapies. This research could revolutionize how we approach age-related diseases.",
            "tag": "Research",
            "url": "https://www.sciencedaily.com/releases/2026/05/260511213204.htm",
            "source": "sciencedaily.com"
          }
        ]
      },
      {
        "id": "climate",
        "name": "Climate & Environment",
        "icon": "🌍",
        "articles": [
          {
            "id": "climate-1",
            "date": "May 13, 2026",
            "title": "Scientists say this algae could remove microplastics from drinking water",
            "summary": "A new study suggests that a specific type of algae could effectively filter microplastics from drinking water, offering a sustainable solution to a growing environmental crisis. This discovery highlights the potential of natural resources in combating pollution.",
            "tag": "Discovery",
            "url": "https://www.sciencedaily.com/releases/2026/05/260511213201.htm",
            "source": "sciencedaily.com"
          }
        ]
      }
    ]
  }
];

const MAY_14_2026_CATEGORIES: Category[] = [
  {
    "id": "technology",
    "name": "Technology",
    "icon": "💻",
    "color": "#06b6d4",
    "gradient": "linear-gradient(135deg, #06b6d4, #3b82f6)",
    "description": "Latest in software, hardware, AI, cybersecurity, cloud, and web development.",
    "subCategories": [
      {
        "id": "ai-generative",
        "name": "Generative AI",
        "icon": "🤖",
        "articles": [
          {
            "id": "ai-generative-1",
            "date": "May 14, 2026",
            "title": "Who decides what AI tells you? Campbell Brown, once Meta's news chief, has thoughts",
            "summary": "In a thought-provoking discussion, Campbell Brown reflects on the ethical implications of AI decision-making and the responsibilities of tech companies in shaping public discourse. As AI systems become more integrated into our daily lives, understanding who controls the narrative is crucial.",
            "tag": "Policy",
            "url": "https://techcrunch.com/2026/05/13/who-decides-what-ai-tells-you-campbell-brown-once-metas-news-chief-has-thoughts/",
            "source": "techcrunch.com"
          },
          {
            "id": "ai-generative-2",
            "date": "May 14, 2026",
            "title": "Anthropic's Cat Wu says that, in the future, AI will anticipate your needs before you know what they are",
            "summary": "Cat Wu from Anthropic discusses the future of AI, envisioning systems that can predict user needs with remarkable accuracy. This advancement could redefine user interaction and personalization in technology.",
            "tag": "Research",
            "url": "https://techcrunch.com/2026/05/13/anthropics-cat-wu-says-that-in-the-future-ai-will-anticipate-your-needs-before-you-know-what-they-are/",
            "source": "techcrunch.com"
          }
        ]
      },
      {
        "id": "cloud",
        "name": "Cloud Computing",
        "icon": "☁️",
        "articles": [
          {
            "id": "cloud-1",
            "date": "May 14, 2026",
            "title": "Geothermal startup Fervo Energy pops 33% in IPO debut fueled by AI data center demand",
            "summary": "Fervo Energy's IPO has seen a remarkable 33% increase, driven by the growing demand for sustainable energy solutions in AI data centers. This milestone highlights the intersection of renewable energy and technology, paving the way for greener cloud computing.",
            "tag": "Startup",
            "url": "https://techcrunch.com/2026/05/13/geothermal-startup-fervo-energy-pops-33-in-ipo-debut-fueled-by-ai-data-center-demand/",
            "source": "techcrunch.com"
          }
        ]
      }
    ]
  },
  {
    "id": "science",
    "name": "Science",
    "icon": "🔬",
    "color": "#10b981",
    "gradient": "linear-gradient(135deg, #10b981, #06b6d4)",
    "description": "Breakthroughs in physics, biology, space exploration, and environmental science.",
    "subCategories": [
      {
        "id": "physics",
        "name": "Physics",
        "icon": "⚛️",
        "articles": [
          {
            "id": "physics-1",
            "date": "May 14, 2026",
            "title": "Quantum breakthrough could revolutionize teleportation and computing",
            "summary": "A recent quantum breakthrough promises to transform the fields of teleportation and computing, potentially leading to unprecedented advancements in technology. Researchers are optimistic about the implications this could have for future applications.",
            "tag": "Discovery",
            "url": "https://www.sciencedaily.com/releases/2026/05/260513034640.htm",
            "source": "sciencedaily.com"
          }
        ]
      },
      {
        "id": "space",
        "name": "Space & Astronomy",
        "icon": "🚀",
        "articles": [
          {
            "id": "space-1",
            "date": "May 14, 2026",
            "title": "Earth is flying through ancient supernova debris and scientists found the evidence in Antarctic ice",
            "summary": "Scientists have discovered evidence of ancient supernova debris embedded in Antarctic ice, revealing that Earth is currently traversing through this cosmic material. This finding opens new avenues for understanding the history of our planet and the universe.",
            "tag": "Discovery",
            "url": "https://www.sciencedaily.com/releases/2026/05/260513221751.htm",
            "source": "sciencedaily.com"
          }
        ]
      }
    ]
  },
  {
    "id": "quantum",
    "name": "Quantum Computing",
    "icon": "⚡",
    "color": "#a855f7",
    "gradient": "linear-gradient(135deg, #a855f7, #ec4899)",
    "description": "The frontier of computation — algorithms, hardware, cryptography, and networking.",
    "subCategories": [
      {
        "id": "quantum-algorithms",
        "name": "Quantum Algorithms",
        "icon": "📐",
        "articles": [
          {
            "id": "quantum-algorithms-1",
            "date": "May 14, 2026",
            "title": "New quantum algorithm solves “impossible” materials problem in seconds",
            "summary": "A groundbreaking quantum algorithm has been developed that can solve complex materials problems in mere seconds, a feat previously thought impossible. This advancement could significantly accelerate research in materials science and engineering.",
            "tag": "Algorithm",
            "url": "https://www.sciencedaily.com/releases/2026/05/260512202355.htm",
            "source": "sciencedaily.com"
          }
        ]
      }
    ]
  }
];

const MAY_15_2026_CATEGORIES: Category[] = [
  {
    "id": "technology",
    "name": "Technology",
    "icon": "💻",
    "color": "#06b6d4",
    "gradient": "linear-gradient(135deg, #06b6d4, #3b82f6)",
    "description": "Latest in software, hardware, AI, cybersecurity, cloud, and web development.",
    "subCategories": [
      {
        "id": "ai-generative",
        "name": "Generative AI",
        "icon": "🤖",
        "articles": [
          {
            "id": "ai-generative-1",
            "date": "May 15, 2026",
            "title": "OpenAI says Codex is coming to your phone",
            "summary": "OpenAI is expanding the accessibility of its Codex model by integrating it into mobile devices, allowing users to leverage AI-driven coding assistance on the go. This move is expected to enhance productivity for developers and non-developers alike.",
            "tag": "Model Release",
            "url": "https://techcrunch.com/2026/05/14/openai-says-codex-is-coming-to-your-phone/",
            "source": "techcrunch.com"
          },
          {
            "id": "ai-generative-2",
            "date": "May 15, 2026",
            "title": "OpenAI’s Codex is now in the ChatGPT mobile app",
            "summary": "The integration of Codex into the ChatGPT mobile app marks a significant step in making AI-assisted coding more accessible. Users can now utilize Codex's capabilities directly from their smartphones, streamlining the coding process.",
            "tag": "Model Release",
            "url": "https://www.theverge.com/ai-artificial-intelligence/930763/openai-codex-chatgpt-ios-android-app-preview",
            "source": "theverge.com"
          }
        ]
      },
      {
        "id": "cybersecurity",
        "name": "Cybersecurity",
        "icon": "🔐",
        "articles": [
          {
            "id": "cybersecurity-1",
            "date": "May 15, 2026",
            "title": "Zero-day exploit completely defeats default Windows 11 BitLocker protections",
            "summary": "A newly discovered zero-day exploit has raised alarms as it bypasses the default protections of Windows 11's BitLocker encryption. This vulnerability poses significant risks for users relying on BitLocker for data security.",
            "tag": "Breach",
            "url": "https://arstechnica.com/security/2026/05/zero-day-exploit-completely-defeats-default-windows-11-bitlocker-protections/",
            "source": "feeds.arstechnica.com"
          }
        ]
      }
    ]
  },
  {
    "id": "science",
    "name": "Science",
    "icon": "🔬",
    "color": "#10b981",
    "gradient": "linear-gradient(135deg, #10b981, #06b6d4)",
    "description": "Breakthroughs in physics, biology, space exploration, and environmental science.",
    "subCategories": [
      {
        "id": "biology",
        "name": "Biology & Biotech",
        "icon": "🧬",
        "articles": [
          {
            "id": "biology-1",
            "date": "May 15, 2026",
            "title": "A grad student’s wild idea sparks a major aging breakthrough",
            "summary": "A groundbreaking study led by a graduate student has unveiled new insights into the aging process, potentially paving the way for innovative treatments. This research could revolutionize how we understand and address age-related diseases.",
            "tag": "Discovery",
            "url": "https://www.sciencedaily.com/releases/2026/05/260515001733.htm",
            "source": "sciencedaily.com"
          }
        ]
      },
      {
        "id": "space",
        "name": "Space & Astronomy",
        "icon": "🚀",
        "articles": [
          {
            "id": "space-1",
            "date": "May 15, 2026",
            "title": "Scientists discover a mysterious asteroid breaking apart near the Sun",
            "summary": "Astronomers have observed an unusual asteroid disintegrating as it approaches the Sun, raising questions about its origin and composition. This discovery could provide valuable insights into the dynamics of solar system bodies.",
            "tag": "Discovery",
            "url": "https://www.sciencedaily.com/releases/2026/05/260513221812.htm",
            "source": "sciencedaily.com"
          }
        ]
      }
    ]
  }
];

const MAY_16_2026_CATEGORIES: Category[] = [
  {
    "id": "technology",
    "name": "Technology",
    "icon": "💻",
    "color": "#06b6d4",
    "gradient": "linear-gradient(135deg, #06b6d4, #3b82f6)",
    "description": "Latest in software, hardware, AI, cybersecurity, cloud, and web development.",
    "subCategories": [
      {
        "id": "ai-generative",
        "name": "Generative AI",
        "icon": "🤖",
        "articles": [
          {
            "id": "ai-generative-1",
            "date": "May 16, 2026",
            "title": "OpenAI launches ChatGPT for personal finance, will let you connect bank accounts",
            "summary": "OpenAI has unveiled a new version of ChatGPT tailored for personal finance, allowing users to connect their bank accounts for personalized financial advice. This move aims to enhance user engagement and provide actionable insights into financial management.",
            "tag": "Startup",
            "url": "https://techcrunch.com/2026/05/15/openai-launches-chatgpt-for-personal-finance-will-let-you-connect-bank-accounts/",
            "source": "techcrunch.com"
          },
          {
            "id": "ai-generative-2",
            "date": "May 16, 2026",
            "title": "YouTube is expanding its AI deepfake detection tool to all adult users",
            "summary": "YouTube is rolling out its AI-driven deepfake detection tool to all adult users, aiming to combat misinformation and enhance content authenticity. This expansion reflects the platform's commitment to maintaining trust and safety in its community.",
            "tag": "Policy",
            "url": "https://www.theverge.com/news/931884/youtube-likeness-detection-ai-deepfake-expansion-all-adults",
            "source": "theverge.com"
          }
        ]
      },
      {
        "id": "cybersecurity",
        "name": "Cybersecurity",
        "icon": "🔐",
        "articles": [
          {
            "id": "cybersecurity-1",
            "date": "May 16, 2026",
            "title": "A hotel check-in system left a million passports and driver's licenses open for anyone to see",
            "summary": "A significant data breach involving a hotel check-in system has exposed the personal information of over a million guests, including passports and driver's licenses. This incident raises serious concerns about data security practices in the hospitality industry.",
            "tag": "Breach",
            "url": "https://techcrunch.com/2026/05/15/a-hotel-check-in-system-left-a-million-passports-and-drivers-licenses-open-for-anyone-to-see/",
            "source": "techcrunch.com"
          }
        ]
      }
    ]
  },
  {
    "id": "science",
    "name": "Science",
    "icon": "🔬",
    "color": "#10b981",
    "gradient": "linear-gradient(135deg, #10b981, #06b6d4)",
    "description": "Breakthroughs in physics, biology, space exploration, and environmental science.",
    "subCategories": [
      {
        "id": "space",
        "name": "Space & Astronomy",
        "icon": "🚀",
        "articles": [
          {
            "id": "space-1",
            "date": "May 16, 2026",
            "title": "NASA’s new AI space chip could let spacecraft think for themselves",
            "summary": "NASA has developed a groundbreaking AI space chip designed to enable spacecraft to make autonomous decisions. This innovation could revolutionize space exploration by allowing missions to adapt in real-time to unforeseen challenges.",
            "tag": "Hardware",
            "url": "https://www.sciencedaily.com/releases/2026/05/260515002134.htm",
            "source": "sciencedaily.com"
          },
          {
            "id": "space-2",
            "date": "May 16, 2026",
            "title": "NASA’s Roman Space Telescope could reveal millions of invisible neutron stars",
            "summary": "The upcoming Roman Space Telescope is set to uncover millions of invisible neutron stars, providing new insights into the universe's most enigmatic objects. This mission promises to enhance our understanding of stellar evolution and cosmic phenomena.",
            "tag": "Discovery",
            "url": "https://www.sciencedaily.com/releases/2026/05/260515002130.htm",
            "source": "sciencedaily.com"
          }
        ]
      }
    ]
  }
];

const MAY_17_2026_CATEGORIES: Category[] = [
  {
    "id": "technology",
    "name": "Technology",
    "icon": "💻",
    "color": "#06b6d4",
    "gradient": "linear-gradient(135deg, #06b6d4, #3b82f6)",
    "description": "Latest in software, hardware, AI, cybersecurity, cloud, and web development.",
    "subCategories": [
      {
        "id": "ai-generative",
        "name": "Generative AI",
        "icon": "🤖",
        "articles": [
          {
            "id": "ai-generative-1",
            "date": "May 17, 2026",
            "title": "The haves and have nots of the AI gold rush",
            "summary": "A new analysis explores the disparities in the AI industry, highlighting how access to resources and funding can create a divide between successful startups and those struggling to gain traction. The report emphasizes the need for equitable opportunities in this rapidly evolving field.",
            "tag": "Market",
            "url": "https://techcrunch.com/2026/05/16/the-haves-and-have-nots-of-the-ai-gold-rush/",
            "source": "techcrunch.com"
          },
          {
            "id": "ai-generative-2",
            "date": "May 17, 2026",
            "title": "Research repository ArXiv will ban authors for a year if they let AI do all the work",
            "summary": "In a bold move to maintain academic integrity, ArXiv has announced that it will impose a one-year ban on authors who submit papers generated entirely by AI. This decision aims to encourage genuine human contribution in research and uphold the quality of scholarly work.",
            "tag": "Policy",
            "url": "https://techcrunch.com/2026/05/16/research-repository-arxiv-will-ban-authors-for-a-year-if-they-let-ai-do-all-the-work/",
            "source": "techcrunch.com"
          }
        ]
      },
      {
        "id": "cybersecurity",
        "name": "Cybersecurity",
        "icon": "🔐",
        "articles": [
          {
            "id": "cyber-1",
            "date": "May 17, 2026",
            "title": "The US is betting on AI to catch insider trading in prediction markets",
            "summary": "The U.S. government is leveraging AI technology to enhance its capabilities in detecting insider trading within prediction markets. This initiative aims to improve market integrity and ensure fair trading practices in the evolving landscape of financial technology.",
            "tag": "Policy",
            "url": "https://arstechnica.com/tech-policy/2026/05/the-us-is-betting-on-ai-to-catch-insider-trading-in-prediction-markets/",
            "source": "feeds.arstechnica.com"
          },
          {
            "id": "cyber-2",
            "date": "May 17, 2026",
            "title": "Anthropic’s $1.5B copyright settlement is getting messy as judge delays approval",
            "summary": "The ongoing legal battle surrounding Anthropic's $1.5 billion copyright settlement has hit a snag as a judge has delayed approval. This case highlights the complexities of copyright in the age of AI and raises questions about fair compensation for creators.",
            "tag": "Breach",
            "url": "https://arstechnica.com/tech-policy/2026/05/authors-fight-for-higher-payouts-from-anthropics-1-5b-copyright-settlement/",
            "source": "feeds.arstechnica.com"
          }
        ]
      }
    ]
  },
  {
    "id": "science",
    "name": "Science",
    "icon": "🔬",
    "color": "#10b981",
    "gradient": "linear-gradient(135deg, #10b981, #06b6d4)",
    "description": "Breakthroughs in physics, biology, space exploration, and environmental science.",
    "subCategories": [
      {
        "id": "space",
        "name": "Space & Astronomy",
        "icon": "🚀",
        "articles": [
          {
            "id": "space-1",
            "date": "May 17, 2026",
            "title": "First-ever direct image of the cosmic web reveals the Universe’s hidden highways",
            "summary": "For the first time, scientists have captured a direct image of the cosmic web, unveiling the vast network of filaments that connect galaxies across the universe. This groundbreaking discovery enhances our understanding of cosmic structure and the evolution of the universe.",
            "tag": "Discovery",
            "url": "https://www.sciencedaily.com/releases/2026/05/260516034136.htm",
            "source": "sciencedaily.com"
          }
        ]
      },
      {
        "id": "biology",
        "name": "Biology & Biotech",
        "icon": "🧬",
        "articles": [
          {
            "id": "biology-1",
            "date": "May 17, 2026",
            "title": "Scientists reversed memory loss by recharging the brain’s tiny engines",
            "summary": "Researchers have made a significant breakthrough by successfully reversing memory loss in subjects by recharging the brain's mitochondria, the tiny engines responsible for energy production. This discovery could pave the way for new treatments for neurodegenerative diseases.",
            "tag": "Research",
            "url": "https://www.sciencedaily.com/releases/2026/05/260515234803.htm",
            "source": "sciencedaily.com"
          },
          {
            "id": "biology-2",
            "date": "May 17, 2026",
            "title": "Scientists find hidden brain nutrient deficit that may fuel anxiety",
            "summary": "A new study has identified a previously overlooked nutrient deficit in the brain that may contribute to anxiety disorders. This finding opens up potential avenues for targeted nutritional interventions in mental health treatment.",
            "tag": "Discovery",
            "url": "https://www.sciencedaily.com/releases/2026/05/260515234759.htm",
            "source": "sciencedaily.com"
          }
        ]
      }
    ]
  }
];

const MAY_18_2026_CATEGORIES: Category[] = [
  {
    "id": "technology",
    "name": "Technology",
    "icon": "💻",
    "color": "#06b6d4",
    "gradient": "linear-gradient(135deg, #06b6d4, #3b82f6)",
    "description": "Latest in software, hardware, AI, cybersecurity, cloud, and web development.",
    "subCategories": [
      {
        "id": "ai-generative",
        "name": "Generative AI",
        "icon": "🤖",
        "articles": [
          {
            "id": "ai-gen-1",
            "date": "May 18, 2026",
            "title": "Apple’s Siri revamp could include auto-deleting chats",
            "summary": "Apple is reportedly planning a significant revamp of Siri, which may include features like auto-deleting chats to enhance user privacy. This move reflects a growing trend among tech companies to prioritize data security and user control.",
            "tag": "Policy",
            "url": "https://techcrunch.com/2026/05/17/apples-siri-revamp-could-include-auto-deleting-chats/",
            "source": "techcrunch.com"
          },
          {
            "id": "ai-gen-2",
            "date": "May 18, 2026",
            "title": "Why trust is a big question at the Elon Musk-OpenAI trial",
            "summary": "The ongoing trial involving Elon Musk and OpenAI raises critical questions about trust in AI technologies. As the case unfolds, it highlights the complexities of accountability and ethical considerations in the rapidly evolving AI landscape.",
            "tag": "Policy",
            "url": "https://techcrunch.com/2026/05/17/why-trust-is-a-big-question-at-the-elon-musk-openai-trial/",
            "source": "techcrunch.com"
          },
          {
            "id": "ai-gen-3",
            "date": "May 18, 2026",
            "title": "Research repository ArXiv will ban authors for a year if they let AI do all the work",
            "summary": "In a bold move, ArXiv has announced that authors who rely solely on AI for their submissions will face a one-year ban. This policy aims to maintain academic integrity and encourage genuine human contribution in research.",
            "tag": "Policy",
            "url": "https://techcrunch.com/2026/05/16/research-repository-arxiv-will-ban-authors-for-a-year-if-they-let-ai-do-all-the-work/",
            "source": "techcrunch.com"
          }
        ]
      }
    ]
  },
  {
    "id": "science",
    "name": "Science",
    "icon": "🔬",
    "color": "#10b981",
    "gradient": "linear-gradient(135deg, #10b981, #06b6d4)",
    "description": "Breakthroughs in physics, biology, space exploration, and environmental science.",
    "subCategories": [
      {
        "id": "physics",
        "name": "Physics",
        "icon": "⚛️",
        "articles": [
          {
            "id": "physics-1",
            "date": "May 18, 2026",
            "title": "AI reveals the invisible magnetic chaos wasting energy inside electric motors",
            "summary": "Recent advancements in AI have enabled scientists to visualize the chaotic magnetic fields that lead to energy loss in electric motors. This breakthrough could pave the way for more efficient motor designs, significantly impacting energy consumption.",
            "tag": "Research",
            "url": "https://www.sciencedaily.com/releases/2026/05/260517211433.htm",
            "source": "sciencedaily.com"
          }
        ]
      },
      {
        "id": "materials",
        "name": "Materials Science",
        "icon": "🧪",
        "articles": [
          {
            "id": "materials-1",
            "date": "May 18, 2026",
            "title": "The “impossible” LED that could change everything",
            "summary": "A new type of LED, once thought impossible to create, has been developed, promising to revolutionize lighting technology. This innovation could lead to more energy-efficient solutions and a significant reduction in electricity consumption.",
            "tag": "Discovery",
            "url": "https://www.sciencedaily.com/releases/2026/05/260518011222.htm",
            "source": "sciencedaily.com"
          }
        ]
      }
    ]
  },
  {
    "id": "quantum",
    "name": "Quantum Computing",
    "icon": "⚡",
    "color": "#a855f7",
    "gradient": "linear-gradient(135deg, #a855f7, #ec4899)",
    "description": "The frontier of computation — algorithms, hardware, cryptography, and networking.",
    "subCategories": [
      {
        "id": "quantum-hardware",
        "name": "Quantum Hardware",
        "icon": "🖥️",
        "articles": [
          {
            "id": "quantum-hardware-1",
            "date": "May 18, 2026",
            "title": "Quantum ghost imaging works using only sunlight in stunning new experiment",
            "summary": "Researchers have successfully demonstrated quantum ghost imaging using only sunlight, marking a significant advancement in quantum optics. This technique could have far-reaching applications in imaging technologies and environmental monitoring.",
            "tag": "Discovery",
            "url": "https://www.sciencedaily.com/releases/2026/05/260517211424.htm",
            "source": "sciencedaily.com"
          }
        ]
      }
    ]
  }
];

const MAY_19_2026_CATEGORIES: Category[] = [
  {
    "id": "technology",
    "name": "Technology",
    "icon": "💻",
    "color": "#06b6d4",
    "gradient": "linear-gradient(135deg, #06b6d4, #3b82f6)",
    "description": "Latest in software, hardware, AI, cybersecurity, cloud, and web development.",
    "subCategories": [
      {
        "id": "ai-generative",
        "name": "Generative AI",
        "icon": "🤖",
        "articles": [
          {
            "id": "ai-generative-1",
            "date": "May 19, 2026",
            "title": "SandboxAQ brings its drug discovery models to Claude — no PhD in computing required",
            "summary": "SandboxAQ is democratizing drug discovery by integrating its advanced models with Claude, making it accessible for users without a PhD in computing. This move could significantly accelerate the pace of pharmaceutical innovation.",
            "url": "https://techcrunch.com/2026/05/18/sandboxaq-brings-its-drug-discovery-models-to-claude-no-phd-in-computing-required/",
            "source": "techcrunch.com",
            "tag": "Startup"
          },
          {
            "id": "ai-generative-2",
            "date": "May 19, 2026",
            "title": "Amazon's new Alexa+ powered feature can generate podcast episodes",
            "summary": "Amazon has unveiled a new feature for Alexa+ that allows users to generate podcast episodes effortlessly. This innovation aims to enhance user engagement and expand the capabilities of voice-activated technology.",
            "url": "https://techcrunch.com/2026/05/18/amazons-new-alexa-powered-feature-can-generate-podcast-episodes/",
            "source": "techcrunch.com",
            "tag": "Feature"
          }
        ]
      },
      {
        "id": "cybersecurity",
        "name": "Cybersecurity",
        "icon": "🔐",
        "articles": [
          {
            "id": "cybersecurity-1",
            "date": "May 19, 2026",
            "title": "NYC Health + Hospitals says hackers stole medical data and fingerprints during breach affecting at least 1.8 million people",
            "summary": "A significant data breach at NYC Health + Hospitals has compromised sensitive medical data and fingerprints of approximately 1.8 million individuals. This incident raises serious concerns about data security in healthcare institutions.",
            "url": "https://techcrunch.com/2026/05/18/nyc-health-and-hospitals-says-hackers-stole-medical-data-and-fingerprints-during-breach-affecting-at-least-1-8-million-people/",
            "source": "techcrunch.com",
            "tag": "Breach"
          }
        ]
      }
    ]
  },
  {
    "id": "science",
    "name": "Science",
    "icon": "🔬",
    "color": "#10b981",
    "gradient": "linear-gradient(135deg, #10b981, #06b6d4)",
    "description": "Breakthroughs in physics, biology, space exploration, and environmental science.",
    "subCategories": [
      {
        "id": "physics",
        "name": "Physics",
        "icon": "⚛️",
        "articles": [
          {
            "id": "physics-1",
            "date": "May 19, 2026",
            "title": "String theory suddenly emerged from simple physics rules",
            "summary": "Recent research suggests that string theory, a complex framework in theoretical physics, can be derived from basic physical principles. This breakthrough could reshape our understanding of fundamental forces in the universe.",
            "url": "https://www.sciencedaily.com/releases/2026/05/260518041424.htm",
            "source": "sciencedaily.com",
            "tag": "Discovery"
          }
        ]
      },
      {
        "id": "space",
        "name": "Space & Astronomy",
        "icon": "🚀",
        "articles": [
          {
            "id": "space-1",
            "date": "May 19, 2026",
            "title": "NASA’s powerful Roman Space Telescope is about to transform astronomy",
            "summary": "NASA's upcoming Roman Space Telescope is set to revolutionize our understanding of the cosmos with its advanced capabilities. This telescope will enable unprecedented observations, potentially uncovering new celestial phenomena.",
            "url": "https://www.sciencedaily.com/releases/2026/05/260518041345.htm",
            "source": "sciencedaily.com",
            "tag": "Milestone"
          }
        ]
      },
      {
        "id": "climate",
        "name": "Climate & Environment",
        "icon": "🌍",
        "articles": [
          {
            "id": "climate-1",
            "date": "May 19, 2026",
            "title": "Antarctic glacier collapses at record speed as Hektoria retreats 15 miles in just 15 months",
            "summary": "The rapid retreat of the Hektoria glacier in Antarctica, which has moved 15 miles in just over a year, highlights the alarming pace of climate change. This event raises concerns about rising sea levels and global warming impacts.",
            "url": "https://www.sciencedaily.com/releases/2026/05/260518041417.htm",
            "source": "sciencedaily.com",
            "tag": "Discovery"
          }
        ]
      }
    ]
  }
];

const MAY_20_2026_CATEGORIES: Category[] = [
  {
    "id": "technology",
    "name": "Technology",
    "icon": "💻",
    "color": "#06b6d4",
    "gradient": "linear-gradient(135deg, #06b6d4, #3b82f6)",
    "description": "Latest in software, hardware, AI, cybersecurity, cloud, and web development.",
    "subCategories": [
      {
        "id": "ai-generative",
        "name": "Generative AI",
        "icon": "🤖",
        "articles": [
          {
            "id": "ai-generative-1",
            "date": "May 20, 2026",
            "title": "Show HN: How to analyze your LLM output – A behavioural health monitor for LLMs",
            "summary": "A new tool has emerged that allows users to analyze the outputs of large language models (LLMs) through a behavioral health monitor. This innovative approach aims to enhance the understanding of LLM behavior and improve their applications in various fields.",
            "tag": "Research",
            "url": "https://splabs.io",
            "source": "splabs.io"
          },
          {
            "id": "ai-generative-2",
            "date": "May 20, 2026",
            "title": "Google just declared itself a contender in AI design at IO 2026",
            "summary": "At Google I/O 2026, the tech giant unveiled its ambitious plans to dominate the AI design space, showcasing new tools and features that promise to revolutionize how designers and developers interact with AI technologies.",
            "tag": "Milestone",
            "url": "https://techcrunch.com/2026/05/19/ai-design-tools-are-the-next-big-battleground-and-google-is-going-all-in-at-io-2026/",
            "source": "techcrunch.com"
          },
          {
            "id": "ai-generative-3",
            "date": "May 20, 2026",
            "title": "You can now talk to your Gmail inbox, as seen at Google IO 2026",
            "summary": "Google has introduced a groundbreaking feature that allows users to interact with their Gmail inbox using voice commands. This innovation aims to streamline email management and enhance user experience.",
            "tag": "Milestone",
            "url": "https://techcrunch.com/2026/05/19/you-can-now-talk-to-your-gmail-inbox-as-seen-at-google-io-2026/",
            "source": "techcrunch.com"
          }
        ]
      },
      {
        "id": "cybersecurity",
        "name": "Cybersecurity",
        "icon": "🔐",
        "articles": [
          {
            "id": "cybersecurity-1",
            "date": "May 20, 2026",
            "title": "FBI seeks US-wide access to license plate cameras, wants 'data in near real time'",
            "summary": "The FBI is pushing for nationwide access to license plate recognition cameras, aiming to obtain data in near real time. This controversial request raises significant privacy concerns and highlights the ongoing debate over surveillance and civil liberties.",
            "tag": "Policy",
            "url": "https://arstechnica.com/tech-policy/2026/05/fbi-seeks-us-wide-access-to-license-plate-cameras-wants-data-in-near-real-time/",
            "source": "feeds.arstechnica.com"
          },
          {
            "id": "cybersecurity-2",
            "date": "May 20, 2026",
            "title": "From teen hacker to Iron Dome researcher, this founder raised $28M to fight AI phishing",
            "summary": "A young entrepreneur has successfully raised $28 million to develop solutions aimed at combating AI-driven phishing attacks. This initiative reflects the growing need for advanced cybersecurity measures in an increasingly digital landscape.",
            "tag": "Startup",
            "url": "https://techcrunch.com/2026/05/19/from-teen-hacker-to-iron-dome-researcher-this-founder-raised-28m-to-fight-ai-phishing/",
            "source": "techcrunch.com"
          }
        ]
      }
    ]
  },
  {
    "id": "science",
    "name": "Science",
    "icon": "🔬",
    "color": "#10b981",
    "gradient": "linear-gradient(135deg, #10b981, #06b6d4)",
    "description": "Breakthroughs in physics, biology, space exploration, and environmental science.",
    "subCategories": [
      {
        "id": "biology",
        "name": "Biology & Biotech",
        "icon": "🧬",
        "articles": [
          {
            "id": "biology-1",
            "date": "May 20, 2026",
            "title": "Scientists use DNA from poop to save the world’s rarest marsupial",
            "summary": "In a groundbreaking effort, scientists are utilizing DNA extracted from feces to aid in the conservation of the world's rarest marsupial. This innovative approach highlights the potential of genetic research in wildlife preservation.",
            "tag": "Discovery",
            "url": "https://www.sciencedaily.com/releases/2026/05/260519224319.htm",
            "source": "sciencedaily.com"
          },
          {
            "id": "biology-2",
            "date": "May 20, 2026",
            "title": "Breakthrough drug reverses aging in skin and dramatically speeds healing",
            "summary": "A new drug has shown promise in reversing skin aging and significantly accelerating the healing process. This breakthrough could have profound implications for dermatology and regenerative medicine.",
            "tag": "Discovery",
            "url": "https://www.sciencedaily.com/releases/2026/05/260519003215.htm",
            "source": "sciencedaily.com"
          }
        ]
      }
    ]
  }
];

const MAY_21_2026_CATEGORIES: Category[] = [
  {
    "id": "technology",
    "name": "Technology",
    "icon": "💻",
    "color": "#06b6d4",
    "gradient": "linear-gradient(135deg, #06b6d4, #3b82f6)",
    "description": "Latest in software, hardware, AI, cybersecurity, cloud, and web development.",
    "subCategories": [
      {
        "id": "ai-generative",
        "name": "Generative AI",
        "icon": "🤖",
        "articles": [
          {
            "id": "ai-generative-1",
            "date": "May 21, 2026",
            "title": "Show HN: How to analyze your LLM output – A behavioural health monitor for LLMs",
            "summary": "A new tool has emerged that allows developers to analyze the outputs of their large language models (LLMs) effectively. This behavioral health monitor aims to enhance the reliability and safety of AI-generated content, making it a significant step forward in responsible AI deployment.",
            "url": "https://splabs.io",
            "source": "splabs.io",
            "tag": "Research"
          }
        ]
      },
      {
        "id": "cybersecurity",
        "name": "Cybersecurity",
        "icon": "🔐",
        "articles": [
          {
            "id": "cyber-1",
            "date": "May 21, 2026",
            "title": "Google publishes exploit code threatening millions of Chromium users",
            "summary": "In a controversial move, Google has released exploit code that could potentially compromise millions of users of Chromium-based browsers. This decision raises significant concerns about security practices and the implications for user safety in the digital landscape.",
            "url": "https://arstechnica.com/security/2026/05/google-publishes-exploit-code-threatening-millions-of-chromium-users/",
            "source": "arstechnica.com",
            "tag": "Breach"
          }
        ]
      }
    ]
  },
  {
    "id": "science",
    "name": "Science",
    "icon": "🔬",
    "color": "#10b981",
    "gradient": "linear-gradient(135deg, #10b981, #06b6d4)",
    "description": "Breakthroughs in physics, biology, space exploration, and environmental science.",
    "subCategories": [
      {
        "id": "biology",
        "name": "Biology & Biotech",
        "icon": "🧬",
        "articles": [
          {
            "id": "biology-1",
            "date": "May 21, 2026",
            "title": "MIT scientists discover amino acid that helps the gut heal itself",
            "summary": "Researchers at MIT have identified a specific amino acid that plays a crucial role in gut healing. This discovery could pave the way for new treatments for gastrointestinal diseases and improve overall gut health.",
            "url": "https://www.sciencedaily.com/releases/2026/05/260520233223.htm",
            "source": "sciencedaily.com",
            "tag": "Discovery"
          },
          {
            "id": "biology-2",
            "date": "May 21, 2026",
            "title": "Scientists discover the nutrient that can supercharge cellular energy",
            "summary": "A groundbreaking study has revealed a nutrient that significantly boosts cellular energy production. This finding has potential implications for enhancing physical performance and combating fatigue-related disorders.",
            "url": "https://www.sciencedaily.com/releases/2026/05/260520233221.htm",
            "source": "sciencedaily.com",
            "tag": "Discovery"
          },
          {
            "id": "biology-3",
            "date": "May 21, 2026",
            "title": "Scientists found a hidden Alzheimer’s trigger and shut it down",
            "summary": "In a significant breakthrough, scientists have identified and successfully neutralized a previously unknown trigger for Alzheimer's disease. This discovery opens new avenues for therapeutic interventions aimed at preventing or slowing the progression of this debilitating condition.",
            "url": "https://www.sciencedaily.com/releases/2026/05/260519224334.htm",
            "source": "sciencedaily.com",
            "tag": "Discovery"
          }
        ]
      }
    ]
  },
  {
    "id": "quantum",
    "name": "Quantum Computing",
    "icon": "⚡",
    "color": "#a855f7",
    "gradient": "linear-gradient(135deg, #a855f7, #ec4899)",
    "description": "The frontier of computation — algorithms, hardware, cryptography, and networking.",
    "subCategories": [
      {
        "id": "quantum-hardware",
        "name": "Quantum Hardware",
        "icon": "🖥️",
        "articles": [
          {
            "id": "quantum-hardware-1",
            "date": "May 21, 2026",
            "title": "New quantum sensor could count individual photons and hunt dark matter",
            "summary": "A novel quantum sensor has been developed that can count individual photons, providing a powerful tool for researchers in the quest to detect dark matter. This advancement could significantly enhance our understanding of the universe's fundamental components.",
            "url": "https://www.sciencedaily.com/releases/2026/05/260520093654.htm",
            "source": "sciencedaily.com",
            "tag": "Discovery"
          }
        ]
      }
    ]
  }
];

const MAY_22_2026_CATEGORIES: Category[] = [
  {
    "id": "technology",
    "name": "Technology",
    "icon": "💻",
    "color": "#06b6d4",
    "gradient": "linear-gradient(135deg, #06b6d4, #3b82f6)",
    "description": "Latest in software, hardware, AI, cybersecurity, cloud, and web development.",
    "subCategories": [
      {
        "id": "ai-generative",
        "name": "Generative AI",
        "icon": "🤖",
        "articles": [
          {
            "id": "gen-ai-1",
            "date": "May 22, 2026",
            "title": "Show HN: How to analyze your LLM output – A behavioural health monitor for LLMs",
            "summary": "A new tool has emerged that allows users to analyze the outputs of large language models (LLMs) through a behavioral health monitor. This innovative approach aims to enhance the understanding of LLM behavior and improve their applications in various fields.",
            "tag": "Research",
            "url": "https://splabs.io",
            "source": "splabs.io"
          }
        ]
      },
      {
        "id": "cybersecurity",
        "name": "Cybersecurity",
        "icon": "🔐",
        "articles": []
      },
      {
        "id": "cloud",
        "name": "Cloud Computing",
        "icon": "☁️",
        "articles": []
      },
      {
        "id": "webdev",
        "name": "Web Development",
        "icon": "🌐",
        "articles": []
      }
    ]
  },
  {
    "id": "science",
    "name": "Science",
    "icon": "🔬",
    "color": "#10b981",
    "gradient": "linear-gradient(135deg, #10b981, #06b6d4)",
    "description": "Breakthroughs in physics, biology, space exploration, and environmental science.",
    "subCategories": [
      {
        "id": "biology",
        "name": "Biology & Biotech",
        "icon": "🧬",
        "articles": [
          {
            "id": "bio-1",
            "date": "May 22, 2026",
            "title": "Scientists discover a two-stage aging process that may cause cancer and arthritis",
            "summary": "Researchers have identified a two-stage aging process that could be linked to the development of cancer and arthritis. This discovery opens new avenues for understanding age-related diseases and potential therapeutic interventions.",
            "tag": "Discovery",
            "url": "https://www.sciencedaily.com/releases/2026/05/260521072420.htm",
            "source": "sciencedaily.com"
          },
          {
            "id": "bio-2",
            "date": "May 22, 2026",
            "title": "“Zombie cells” aren’t always bad and that could transform anti-aging medicine",
            "summary": "New research suggests that 'zombie cells', often associated with aging, may not always be detrimental. This finding could revolutionize anti-aging treatments by shifting the focus on how these cells can be managed rather than eliminated.",
            "tag": "Discovery",
            "url": "https://www.sciencedaily.com/releases/2026/05/260521072402.htm",
            "source": "sciencedaily.com"
          }
        ]
      },
      {
        "id": "space",
        "name": "Space & Astronomy",
        "icon": "🚀",
        "articles": [
          {
            "id": "space-1",
            "date": "May 22, 2026",
            "title": "James Webb discovers a rare giant planet with surprisingly Earth-like temperatures",
            "summary": "The James Webb Space Telescope has made a groundbreaking discovery of a giant planet exhibiting Earth-like temperatures, raising questions about the potential for life beyond our planet. This finding could reshape our understanding of habitable zones in the universe.",
            "tag": "Discovery",
            "url": "https://www.sciencedaily.com/releases/2026/05/260521072355.htm",
            "source": "sciencedaily.com"
          }
        ]
      }
    ]
  }
];

const MAY_23_2026_CATEGORIES: Category[] = [
  {
    "id": "technology",
    "name": "Technology",
    "icon": "💻",
    "color": "#06b6d4",
    "gradient": "linear-gradient(135deg, #06b6d4, #3b82f6)",
    "description": "Latest in software, hardware, AI, cybersecurity, cloud, and web development.",
    "subCategories": [
      {
        "id": "ai-generative",
        "name": "Generative AI",
        "icon": "🤖",
        "articles": [
          {
            "id": "ai-generative-1",
            "date": "May 23, 2026",
            "title": "AI is being used to resurrect the voices of dead pilots",
            "summary": "A groundbreaking application of AI technology is enabling the recreation of voices from deceased pilots, raising both ethical and technological questions. This innovation could have significant implications for aviation safety and historical documentation.",
            "tag": "Startup",
            "url": "https://techcrunch.com/2026/05/22/ai-is-being-used-to-resurrect-the-voices-of-dead-pilots/",
            "source": "techcrunch.com"
          },
          {
            "id": "ai-generative-2",
            "date": "May 23, 2026",
            "title": "US scrambles to stop Internet users re-creating dead pilots’ voices",
            "summary": "In response to the rising trend of using AI to recreate the voices of deceased pilots, U.S. authorities are taking steps to regulate this technology. The move highlights the challenges of balancing innovation with ethical considerations in AI applications.",
            "tag": "Policy",
            "url": "https://arstechnica.com/ai/2026/05/ai-users-re-create-dead-pilots-voices-from-crash-investigation-docs/",
            "source": "arstechnica.com"
          }
        ]
      },
      {
        "id": "cybersecurity",
        "name": "Cybersecurity",
        "icon": "🔐",
        "articles": [
          {
            "id": "cybersecurity-1",
            "date": "May 23, 2026",
            "title": "Kash Patel's clothing brand website shut down after reports it was hacked",
            "summary": "The website of Kash Patel's clothing brand has been taken offline following a reported hacking incident. This breach raises concerns about cybersecurity measures in e-commerce and the potential risks for consumers.",
            "tag": "Breach",
            "url": "https://techcrunch.com/2026/05/22/kash-patels-clothing-brand-website-shut-down-after-reports-it-was-hacked/",
            "source": "techcrunch.com"
          },
          {
            "id": "cybersecurity-2",
            "date": "May 23, 2026",
            "title": "Police boast of hacking VPN where criminals 'believed themselves to be safe'",
            "summary": "Law enforcement agencies have announced the successful hacking of a VPN service used by criminals, showcasing the ongoing battle between cybersecurity and law enforcement. This incident raises questions about privacy and the effectiveness of VPNs.",
            "tag": "Breach",
            "url": "https://arstechnica.com/tech-policy/2026/05/police-boast-of-hacking-vpn-where-criminals-believed-themselves-to-be-safe/",
            "source": "arstechnica.com"
          }
        ]
      }
    ]
  },
  {
    "id": "science",
    "name": "Science",
    "icon": "🔬",
    "color": "#10b981",
    "gradient": "linear-gradient(135deg, #10b981, #06b6d4)",
    "description": "Breakthroughs in physics, biology, space exploration, and environmental science.",
    "subCategories": [
      {
        "id": "biology",
        "name": "Biology & Biotech",
        "icon": "🧬",
        "articles": [
          {
            "id": "biology-1",
            "date": "May 23, 2026",
            "title": "Scientists discover simple way to relieve arthritis pain without pills or surgery",
            "summary": "Researchers have unveiled a novel approach to alleviating arthritis pain that does not involve medication or surgical procedures. This breakthrough could significantly improve the quality of life for millions suffering from this chronic condition.",
            "tag": "Discovery",
            "url": "https://www.sciencedaily.com/releases/2026/05/260522031135.htm",
            "source": "sciencedaily.com"
          },
          {
            "id": "biology-2",
            "date": "May 23, 2026",
            "title": "Scientists uncover cancer-causing chemicals hidden in everyday foods",
            "summary": "A new study has identified harmful chemicals in common foods that may contribute to cancer risk. This discovery emphasizes the importance of food safety and could lead to changes in dietary recommendations.",
            "tag": "Discovery",
            "url": "https://www.sciencedaily.com/releases/2026/05/260522030853.htm",
            "source": "sciencedaily.com"
          }
        ]
      }
    ]
  }
];

const MAY_24_2026_CATEGORIES: Category[] = [
  {
    "id": "technology",
    "name": "Technology",
    "icon": "💻",
    "color": "#06b6d4",
    "gradient": "linear-gradient(135deg, #06b6d4, #3b82f6)",
    "description": "Latest in software, hardware, AI, cybersecurity, cloud, and web development.",
    "subCategories": [
      {
        "id": "ai-generative",
        "name": "Generative AI",
        "icon": "🤖",
        "articles": [
          {
            "id": "ai-generative-1",
            "date": "May 24, 2026",
            "title": "Show HN: How to analyze your LLM output – A behavioural health monitor for LLMs",
            "summary": "A new tool has emerged that allows users to analyze the outputs of large language models (LLMs) effectively. This behavioral health monitor aims to enhance the understanding of LLM behavior and improve their reliability in various applications.",
            "url": "https://splabs.io",
            "source": "splabs.io",
            "tag": "Research"
          },
          {
            "id": "ai-generative-2",
            "date": "May 24, 2026",
            "title": "Google’s new anything-to-anything AI model is wild",
            "summary": "Google has unveiled a groundbreaking AI model capable of transforming any input into any desired output, showcasing unprecedented versatility. This innovation could redefine content creation and interaction across various platforms.",
            "url": "https://www.theverge.com/tech/936507/gemini-omni-hands-on-deepfake-ai-video",
            "source": "theverge.com",
            "tag": "Model Release"
          }
        ]
      },
      {
        "id": "cybersecurity",
        "name": "Cybersecurity",
        "icon": "🔐",
        "articles": [
          {
            "id": "cybersecurity-1",
            "date": "May 24, 2026",
            "title": "These special phone and app features can help protect you from spyware",
            "summary": "As spyware threats become more sophisticated, new phone and app features are emerging to help users safeguard their privacy. This article explores the latest tools and practices to enhance personal cybersecurity.",
            "url": "https://techcrunch.com/2026/05/23/you-dont-have-to-click-anything-to-get-hacked-anymore-heres-how-to-fight-back/",
            "source": "techcrunch.com",
            "tag": "Policy"
          },
          {
            "id": "cybersecurity-2",
            "date": "May 24, 2026",
            "title": "US scrambles to stop Internet users re-creating dead pilots’ voices",
            "summary": "In a controversial move, U.S. authorities are attempting to regulate the use of AI technologies that allow users to recreate the voices of deceased pilots. This raises ethical questions about consent and the implications of AI in sensitive contexts.",
            "url": "https://arstechnica.com/ai/2026/05/ai-users-re-create-dead-pilots-voices-from-crash-investigation-docs",
            "source": "arstechnica.com",
            "tag": "Policy"
          }
        ]
      }
    ]
  },
  {
    "id": "science",
    "name": "Science",
    "icon": "🔬",
    "color": "#10b981",
    "gradient": "linear-gradient(135deg, #10b981, #06b6d4)",
    "description": "Breakthroughs in physics, biology, space exploration, and environmental science.",
    "subCategories": [
      {
        "id": "biology",
        "name": "Biology & Biotech",
        "icon": "🧬",
        "articles": [
          {
            "id": "biology-1",
            "date": "May 24, 2026",
            "title": "Scientists discover hidden driver of aging — Simple supplement reversed brain decline",
            "summary": "Researchers have identified a simple supplement that may reverse brain decline, offering new hope in the fight against aging. This discovery could lead to significant advancements in age-related health interventions.",
            "url": "https://www.sciencedaily.com/releases/2026/05/260524012959.htm",
            "source": "sciencedaily.com",
            "tag": "Discovery"
          },
          {
            "id": "biology-2",
            "date": "May 24, 2026",
            "title": "Scientists warn popular vitamin D supplement may have a “previously unknown” downside",
            "summary": "A new study raises concerns about the widespread use of vitamin D supplements, suggesting they may carry previously unrecognized risks. This finding could prompt a reevaluation of dietary recommendations.",
            "url": "https://www.sciencedaily.com/releases/2026/05/260523021820.htm",
            "source": "sciencedaily.com",
            "tag": "Research"
          }
        ]
      }
    ]
  }
];

const MAY_25_2026_CATEGORIES: Category[] = [
  {
    "id": "technology",
    "name": "Technology",
    "icon": "💻",
    "color": "#06b6d4",
    "gradient": "linear-gradient(135deg, #06b6d4, #3b82f6)",
    "description": "Latest in software, hardware, AI, cybersecurity, cloud, and web development.",
    "subCategories": [
      {
        "id": "ai-generative",
        "name": "Generative AI",
        "icon": "🤖",
        "articles": [
          {
            "id": "gen-ai-1",
            "date": "May 25, 2026",
            "title": "Show HN: How to analyze your LLM output – A behavioural health monitor for LLMs",
            "summary": "A new tool has emerged that allows users to analyze the output of large language models (LLMs) through a behavioral health monitor. This innovative approach aims to enhance the understanding of LLM behavior and improve their applications in various fields.",
            "url": "https://splabs.io",
            "source": "splabs.io",
            "tag": "Research"
          }
        ]
      },
      {
        "id": "cybersecurity",
        "name": "Cybersecurity",
        "icon": "🔐",
        "articles": [
          {
            "id": "cyber-1",
            "date": "May 25, 2026",
            "title": "Everyone is navigating AI security in real time — even Google",
            "summary": "As AI technologies proliferate, companies like Google are grappling with real-time security challenges posed by AI systems. This article explores the evolving landscape of AI security and the measures being taken to safeguard against potential threats.",
            "url": "https://techcrunch.com/2026/05/24/everyone-is-navigating-ai-security-in-real-time-even-google/",
            "source": "techcrunch.com",
            "tag": "Policy"
          },
          {
            "id": "cyber-2",
            "date": "May 25, 2026",
            "title": "These special phone and app features can help protect you from spyware",
            "summary": "With the rise of spyware threats, new phone and app features are being developed to enhance user security. This article highlights practical tools and strategies that can help individuals protect their devices from unwanted surveillance.",
            "url": "https://techcrunch.com/2026/05/23/you-dont-have-to-click-anything-to-get-hacked-anymore-heres-how-to-fight-back/",
            "source": "techcrunch.com",
            "tag": "Breach"
          },
          {
            "id": "cyber-3",
            "date": "May 25, 2026",
            "title": "Hackers are learning to exploit chatbot ‘personalities’",
            "summary": "As chatbots become more sophisticated, hackers are finding ways to exploit their personalities for malicious purposes. This article delves into the implications of this trend and what it means for the future of AI interactions.",
            "url": "https://www.theverge.com/column/935545/hackers-ai-chatbots",
            "source": "theverge.com",
            "tag": "Breach"
          }
        ]
      }
    ]
  },
  {
    "id": "science",
    "name": "Science",
    "icon": "🔬",
    "color": "#10b981",
    "gradient": "linear-gradient(135deg, #10b981, #06b6d4)",
    "description": "Breakthroughs in physics, biology, space exploration, and environmental science.",
    "subCategories": [
      {
        "id": "biology",
        "name": "Biology & Biotech",
        "icon": "🧬",
        "articles": [
          {
            "id": "bio-1",
            "date": "May 25, 2026",
            "title": "Scientists discover hidden driver of aging — Simple supplement reversed brain decline",
            "summary": "Researchers have identified a previously unknown factor in the aging process that can be influenced by a simple supplement, showing promise in reversing cognitive decline. This discovery could pave the way for new treatments aimed at enhancing brain health in older adults.",
            "url": "https://www.sciencedaily.com/releases/2026/05/260524012959.htm",
            "source": "sciencedaily.com",
            "tag": "Discovery"
          },
          {
            "id": "bio-2",
            "date": "May 25, 2026",
            "title": "Scientists say house cats could help unlock new cancer treatments for humans",
            "summary": "A fascinating study suggests that the biology of house cats may hold clues to developing new cancer therapies for humans. This research highlights the potential of cross-species insights in advancing medical science.",
            "url": "https://www.sciencedaily.com/releases/2026/05/260523103943.htm",
            "source": "sciencedaily.com",
            "tag": "Discovery"
          }
        ]
      },
      {
        "id": "space",
        "name": "Space & Astronomy",
        "icon": "🚀",
        "articles": [
          {
            "id": "space-1",
            "date": "May 25, 2026",
            "title": "SpaceX's Starship V3—still a work in progress—mostly successful on first flight",
            "summary": "SpaceX's latest iteration of the Starship, V3, has completed its first flight, showcasing significant advancements despite being a work in progress. This milestone marks another step forward in SpaceX's ambitious plans for space exploration.",
            "url": "https://arstechnica.com/space/2026/05/spacexs-starship-v3-still-a-work-in-progress-mostly-successful-on-first-flight/",
            "source": "feeds.arstechnica.com",
            "tag": "Milestone"
          }
        ]
      }
    ]
  }
];

const MAY_26_2026_CATEGORIES: Category[] = [
  {
    "id": "technology",
    "name": "Technology",
    "icon": "💻",
    "color": "#06b6d4",
    "gradient": "linear-gradient(135deg, #06b6d4, #3b82f6)",
    "description": "Latest in software, hardware, AI, cybersecurity, cloud, and web development.",
    "subCategories": [
      {
        "id": "ai-generative",
        "name": "Generative AI",
        "icon": "🤖",
        "articles": [
          {
            "id": "ai-generative-1",
            "date": "May 26, 2026",
            "title": "Show HN: How to analyze your LLM output – A behavioural health monitor for LLMs",
            "summary": "A new tool has emerged that allows users to analyze the output of large language models (LLMs) through a behavioral health monitor. This innovative approach aims to enhance the understanding of LLM behavior and improve their applications in various fields.",
            "tag": "Research",
            "url": "https://splabs.io",
            "source": "splabs.io"
          },
          {
            "id": "ai-generative-2",
            "date": "May 26, 2026",
            "title": "AI won’t replace you but someone using AI might",
            "summary": "A recent article discusses the implications of AI in the workforce, emphasizing that while AI may not directly replace jobs, those who leverage AI tools will have a competitive edge. This highlights the importance of adapting to technological advancements in the job market.",
            "tag": "Market",
            "url": "https://www.sciencedaily.com/releases/2026/05/260525000448.htm",
            "source": "sciencedaily.com"
          }
        ]
      },
      {
        "id": "cybersecurity",
        "name": "Cybersecurity",
        "icon": "🔐",
        "articles": [
          {
            "id": "cybersecurity-1",
            "date": "May 26, 2026",
            "title": "Cox Media fined after bragging it spied on users through their phones",
            "summary": "Cox Media has faced legal repercussions after boasting about its ability to spy on users via their phones, leading to a significant fine. This incident raises critical questions about user privacy and the ethical boundaries of data collection in the media industry.",
            "tag": "Breach",
            "url": "https://www.theverge.com/policy/937027/cox-media-marketing-ai-powered-phone-spying-ads-ftc-fine",
            "source": "theverge.com"
          }
        ]
      },
      {
        "id": "startup",
        "name": "Startup",
        "icon": "🚀",
        "articles": [
          {
            "id": "startup-1",
            "date": "May 26, 2026",
            "title": "The pitch trick that helped an eSports startup raise $20M when VCs only wanted AI",
            "summary": "An eSports startup successfully raised $20 million by employing a unique pitching strategy that captured the interest of venture capitalists focused on AI. This case study illustrates the evolving landscape of startup funding and the importance of adaptability in securing investment.",
            "tag": "Funding",
            "url": "https://techcrunch.com/2026/05/25/the-pitch-trick-that-helped-an-esports-startup-raise-20m-when-vcs-only-wanted-ai/",
            "source": "techcrunch.com"
          },
          {
            "id": "startup-2",
            "date": "May 26, 2026",
            "title": "Startup Battlefield 200 applications close in days: Apply before May 27",
            "summary": "Aspiring entrepreneurs have just days left to apply for the Startup Battlefield 200, a prestigious competition that showcases innovative startups. This event offers a unique platform for startups to gain visibility and connect with potential investors.",
            "tag": "Event",
            "url": "https://techcrunch.com/2026/05/25/startup-battlefield-200-applications-close-in-days-apply-before-may-27/",
            "source": "techcrunch.com"
          }
        ]
      }
    ]
  },
  {
    "id": "science",
    "name": "Science",
    "icon": "🔬",
    "color": "#10b981",
    "gradient": "linear-gradient(135deg, #10b981, #06b6d4)",
    "description": "Breakthroughs in physics, biology, space exploration, and environmental science.",
    "subCategories": [
      {
        "id": "space",
        "name": "Space & Astronomy",
        "icon": "🚀",
        "articles": [
          {
            "id": "space-1",
            "date": "May 26, 2026",
            "title": "NASA’s Psyche spacecraft uses Mars as a giant slingshot toward a mysterious metal world",
            "summary": "NASA's Psyche spacecraft is utilizing a gravity assist from Mars to propel itself toward a unique metal-rich asteroid. This innovative maneuver highlights the agency's ongoing efforts to explore the solar system and unlock the secrets of planetary formation.",
            "tag": "Mission",
            "url": "https://www.sciencedaily.com/releases/2026/05/260525040421.htm",
            "source": "sciencedaily.com"
          }
        ]
      },
      {
        "id": "biology",
        "name": "Biology & Biotech",
        "icon": "🧬",
        "articles": [
          {
            "id": "biology-1",
            "date": "May 26, 2026",
            "title": "USC scientists discover a hidden Alzheimer’s trigger and a possible way to shut it down",
            "summary": "Researchers at USC have identified a previously unknown trigger for Alzheimer's disease, along with a potential method to inhibit its effects. This groundbreaking discovery could pave the way for new therapeutic strategies in combating this devastating condition.",
            "tag": "Discovery",
            "url": "https://www.sciencedaily.com/releases/2026/05/260525000504.htm",
            "source": "sciencedaily.com"
          }
        ]
      }
    ]
  }
];

const MAY_28_2026_CATEGORIES: Category[] = [
  {
    "id": "technology",
    "name": "Technology",
    "icon": "💻",
    "color": "#06b6d4",
    "gradient": "linear-gradient(135deg, #06b6d4, #3b82f6)",
    "description": "Latest in software, hardware, AI, cybersecurity, cloud, and web development.",
    "subCategories": [
      {
        "id": "ai-generative",
        "name": "Generative AI",
        "icon": "🤖",
        "articles": []
      },
      {
        "id": "ai-vision",
        "name": "Visual Processing AI",
        "icon": "👁️",
        "articles": []
      },
      {
        "id": "ai-nlp",
        "name": "NLP",
        "icon": "💬",
        "articles": []
      },
      {
        "id": "cybersecurity",
        "name": "Cybersecurity",
        "icon": "🔐",
        "articles": [
          {
            "id": "cyber-1",
            "date": "May 28, 2026",
            "title": "Google engineer charged with insider trading after making $1.2M on Polymarket",
            "summary": "A Google engineer has been charged with insider trading after allegedly using confidential information to profit $1.2 million on the Polymarket prediction market. This case raises significant concerns about ethical practices within tech companies and the potential misuse of insider knowledge.",
            "tag": "Breach",
            "url": "https://techcrunch.com/2026/05/27/google-engineer-charged-with-insider-trading-after-making-1-2m-on-polymarket/",
            "source": "techcrunch.com"
          },
          {
            "id": "cyber-2",
            "date": "May 28, 2026",
            "title": "UK Visa Portal exposed thousands of applicants’ passports and selfies — then called the lawyers on us",
            "summary": "A significant data breach occurred at the UK Visa Portal, exposing thousands of applicants' personal information, including passports and selfies. The incident has raised alarms about data security practices and the handling of sensitive information by government services.",
            "tag": "Breach",
            "url": "https://techcrunch.com/2026/05/27/uk-visa-portal-spilled-thousands-of-applicants-passports-and-selfies-online-and-hasnt-fixed-the-leak/",
            "source": "techcrunch.com"
          }
        ]
      },
      {
        "id": "cloud",
        "name": "Cloud Computing",
        "icon": "☁️",
        "articles": [
          {
            "id": "cloud-1",
            "date": "May 28, 2026",
            "title": "In more good news for Amazon, Snowflake signs $6B deal with AWS for AI CPU chips",
            "summary": "Snowflake has signed a massive $6 billion deal with Amazon Web Services to supply AI CPU chips, marking a significant step in the cloud computing landscape. This partnership is expected to enhance AI capabilities and drive innovation across various sectors.",
            "tag": "Market",
            "url": "https://techcrunch.com/2026/05/27/in-more-good-news-for-amazon-snowflake-signs-6b-deal-with-aws-for-ai-cpu-chips/",
            "source": "techcrunch.com"
          }
        ]
      }
    ]
  },
  {
    "id": "science",
    "name": "Science",
    "icon": "🔬",
    "color": "#10b981",
    "gradient": "linear-gradient(135deg, #10b981, #06b6d4)",
    "description": "Breakthroughs in physics, biology, space exploration, and environmental science.",
    "subCategories": [
      {
        "id": "physics",
        "name": "Physics",
        "icon": "⚛️",
        "articles": [
          {
            "id": "physics-1",
            "date": "May 28, 2026",
            "title": "Scientists break 30-year superconductivity record at normal pressure",
            "summary": "Researchers have achieved a groundbreaking milestone by breaking a 30-year record in superconductivity at normal pressure. This discovery could pave the way for advancements in energy transmission and quantum computing technologies.",
            "tag": "Discovery",
            "url": "https://www.sciencedaily.com/releases/2026/05/260527023220.htm",
            "source": "sciencedaily.com"
          }
        ]
      },
      {
        "id": "biology",
        "name": "Biology & Biotech",
        "icon": "🧬",
        "articles": [
          {
            "id": "biology-1",
            "date": "May 28, 2026",
            "title": "Researchers block key protein that helps Parkinson’s spread through the brain",
            "summary": "A team of researchers has identified and successfully blocked a key protein that facilitates the spread of Parkinson's disease in the brain. This breakthrough could lead to new therapeutic strategies for managing this debilitating condition.",
            "tag": "Discovery",
            "url": "https://www.sciencedaily.com/releases/2026/05/260527023214.htm",
            "source": "sciencedaily.com"
          }
        ]
      },
      {
        "id": "space",
        "name": "Space & Astronomy",
        "icon": "🚀",
        "articles": [
          {
            "id": "space-1",
            "date": "May 28, 2026",
            "title": "NASA’s Webb telescope discovers a planet where rock clouds vanish every night",
            "summary": "NASA's Webb telescope has made a fascinating discovery of a planet where rock clouds disappear nightly, challenging our understanding of atmospheric phenomena on exoplanets. This finding opens new avenues for research in planetary science.",
            "tag": "Discovery",
            "url": "https://www.sciencedaily.com/releases/2026/05/260527023212.htm",
            "source": "sciencedaily.com"
          },
          {
            "id": "space-2",
            "date": "May 28, 2026",
            "title": "NASA’s Fermi telescope reveals the power source behind monster supernovae",
            "summary": "The Fermi telescope has unveiled the mystery behind the power sources of massive supernovae, providing insights into the life cycles of stars and the dynamics of the universe. This research enhances our understanding of cosmic events.",
            "tag": "Discovery",
            "url": "https://www.sciencedaily.com/releases/2026/05/260527023210.htm",
            "source": "sciencedaily.com"
          }
        ]
      }
    ]
  }
];

const MAY_29_2026_CATEGORIES: Category[] = [
  {
    "id": "technology",
    "name": "Technology",
    "icon": "💻",
    "color": "#06b6d4",
    "gradient": "linear-gradient(135deg, #06b6d4, #3b82f6)",
    "description": "Latest in software, hardware, AI, cybersecurity, cloud, and web development.",
    "subCategories": [
      {
        "id": "ai-generative",
        "name": "Generative AI",
        "icon": "🤖",
        "articles": [
          {
            "id": "ai-gen-1",
            "date": "May 29, 2026",
            "title": "Claude’s new model is more ‘honest’ when it messes up",
            "summary": "Anthropic's latest model, Claude 4.8, introduces a new approach to handling errors, aiming for greater transparency and honesty in its responses. This update is expected to enhance user trust and improve interactions with AI systems.",
            "tag": "Model Release",
            "url": "https://www.theverge.com/ai-artificial-intelligence/939094/anthropic-claude-4-8-opus-honesty-effort"
          }
        ]
      },
      {
        "id": "cybersecurity",
        "name": "Cybersecurity",
        "icon": "🔐",
        "articles": [
          {
            "id": "cyber-1",
            "date": "May 29, 2026",
            "title": "Fed up with vibe coders, dev sneaks data-nuking prompt injection into their code",
            "summary": "In a bold move against ineffective coding practices, a developer has embedded a prompt injection that could wipe data into their code. This incident raises significant concerns about security and the integrity of software development.",
            "tag": "Breach",
            "url": "https://arstechnica.com/security/2026/05/fed-up-with-vibe-coders-dev-sneaks-data-nuking-prompt-injection-into-their-code/"
          }
        ]
      },
      {
        "id": "cloud",
        "name": "Cloud Computing",
        "icon": "☁️",
        "articles": [
          {
            "id": "cloud-1",
            "date": "May 29, 2026",
            "title": "Microsoft 365 Copilot gets a speed boost and cleaner design",
            "summary": "Microsoft has rolled out significant updates to its 365 Copilot, enhancing performance and streamlining the user interface. These improvements aim to make productivity tools more efficient and user-friendly.",
            "tag": "Update",
            "url": "https://www.theverge.com/tech/939273/microsoft-365-copilot-redesign"
          }
        ]
      }
    ]
  },
  {
    "id": "science",
    "name": "Science",
    "icon": "🔬",
    "color": "#10b981",
    "gradient": "linear-gradient(135deg, #10b981, #06b6d4)",
    "description": "Breakthroughs in physics, biology, space exploration, and environmental science.",
    "subCategories": [
      {
        "id": "biology",
        "name": "Biology & Biotech",
        "icon": "🧬",
        "articles": [
          {
            "id": "bio-1",
            "date": "May 29, 2026",
            "title": "Human organoids reveal how to reverse “irreversible” nerve damage",
            "summary": "Recent research using human organoids has uncovered potential methods to reverse nerve damage previously deemed irreversible. This breakthrough could pave the way for new treatments in neuroregeneration.",
            "tag": "Discovery",
            "url": "https://www.sciencedaily.com/releases/2026/05/260528082459.htm"
          }
        ]
      },
      {
        "id": "climate",
        "name": "Climate & Environment",
        "icon": "🌍",
        "articles": [
          {
            "id": "climate-1",
            "date": "May 29, 2026",
            "title": "Arctic Ocean passed a tipping point and scientists say it may never recover",
            "summary": "Scientists have announced that the Arctic Ocean has crossed a critical tipping point, leading to irreversible changes in its ecosystem. This alarming finding highlights the urgent need for climate action.",
            "tag": "Research",
            "url": "https://www.sciencedaily.com/releases/2026/05/260528082457.htm"
          }
        ]
      }
    ]
  }
];

const MAY_30_2026_CATEGORIES: Category[] = [
  {
    "id": "technology",
    "name": "Technology",
    "icon": "💻",
    "color": "#06b6d4",
    "gradient": "linear-gradient(135deg, #06b6d4, #3b82f6)",
    "description": "Latest in software, hardware, AI, cybersecurity, cloud, and web development.",
    "subCategories": [
      {
        "id": "ai-generative",
        "name": "Generative AI",
        "icon": "🤖",
        "articles": [
          {
            "id": "ai-gen-1",
            "date": "May 30, 2026",
            "title": "Coders are refusing to work without AI — and that could come back to bite them",
            "summary": "A growing trend among software developers is the refusal to work without AI assistance, raising concerns about dependency on these tools. Experts warn that this reliance could lead to significant challenges in the industry, particularly in terms of skill development and job security.",
            "tag": "Market",
            "url": "https://techcrunch.com/2026/05/29/coders-are-refusing-to-work-without-ai-and-that-could-come-back-to-bite-them/",
            "source": "techcrunch.com"
          },
          {
            "id": "ai-gen-2",
            "date": "May 30, 2026",
            "title": "What happens when companies become too AI-pilled?",
            "summary": "A new discussion emerges around the potential pitfalls of companies becoming overly reliant on AI technologies. This article explores the implications of such dependency, including the risk of losing human insight and creativity in decision-making processes.",
            "tag": "Policy",
            "url": "https://techcrunch.com/video/what-happens-when-companies-become-too-ai-pilled/",
            "source": "techcrunch.com"
          }
        ]
      },
      {
        "id": "cybersecurity",
        "name": "Cybersecurity",
        "icon": "🔐",
        "articles": [
          {
            "id": "cyber-1",
            "date": "May 30, 2026",
            "title": "Microsoft under fire for threatening security researcher with criminal investigation",
            "summary": "Microsoft faces backlash after reportedly threatening a security researcher with criminal charges for exposing vulnerabilities in its software. This incident raises critical questions about the relationship between tech companies and the security community.",
            "tag": "Breach",
            "url": "https://techcrunch.com/2026/05/29/microsoft-under-fire-for-threatening-security-researcher-with-criminal-investigation/",
            "source": "techcrunch.com"
          },
          {
            "id": "cyber-2",
            "date": "May 30, 2026",
            "title": "Botnet of more than 17 million devices dismantled",
            "summary": "A significant cybersecurity operation has successfully dismantled a massive botnet comprising over 17 million devices. This operation highlights ongoing efforts to combat cybercrime and protect internet users from malicious activities.",
            "tag": "Breach",
            "url": "https://arstechnica.com/security/2026/05/botnet-of-more-than-17-million-devices-dismantled/",
            "source": "feeds.arstechnica.com"
          }
        ]
      }
    ]
  },
  {
    "id": "science",
    "name": "Science",
    "icon": "🔬",
    "color": "#10b981",
    "gradient": "linear-gradient(135deg, #10b981, #06b6d4)",
    "description": "Breakthroughs in physics, biology, space exploration, and environmental science.",
    "subCategories": [
      {
        "id": "space",
        "name": "Space & Astronomy",
        "icon": "🚀",
        "articles": [
          {
            "id": "space-1",
            "date": "May 30, 2026",
            "title": "Astronomers finally solve Saturn’s decades-long spin mystery",
            "summary": "After years of research, astronomers have unraveled the mystery behind Saturn's unusual spin. This breakthrough not only enhances our understanding of the planet but also sheds light on the dynamics of planetary formation and evolution.",
            "tag": "Discovery",
            "url": "https://www.sciencedaily.com/releases/2026/05/260529043658.htm",
            "source": "sciencedaily.com"
          }
        ]
      }
    ]
  }
];

const MAY_31_2026_CATEGORIES: Category[] = [
  {
    "id": "technology",
    "name": "Technology",
    "icon": "💻",
    "color": "#06b6d4",
    "gradient": "linear-gradient(135deg, #06b6d4, #3b82f6)",
    "description": "Latest in software, hardware, AI, cybersecurity, cloud, and web development.",
    "subCategories": [
      {
        "id": "ai-generative",
        "name": "Generative AI",
        "icon": "🤖",
        "articles": [
          {
            "id": "ai-gen-1",
            "date": "May 31, 2026",
            "title": "Meta is reportedly developing an AI pendant",
            "summary": "Meta is reportedly working on a new AI pendant that aims to integrate seamlessly into daily life, providing users with personalized assistance and connectivity. This move highlights the growing trend of wearable AI technology.",
            "tag": "Startup",
            "url": "https://techcrunch.com/2026/05/30/meta-is-reportedly-developing-an-ai-pendant/",
            "source": "techcrunch.com"
          },
          {
            "id": "ai-gen-2",
            "date": "May 31, 2026",
            "title": "I put Google's 24/7 AI assistant Gemini Spark to work, and it's actually pretty useful",
            "summary": "A hands-on review of Google's Gemini Spark reveals its potential as a 24/7 AI assistant, showcasing its capabilities in managing tasks and providing information efficiently. Users are finding it to be a valuable addition to their daily routines.",
            "tag": "Research",
            "url": "https://techcrunch.com/2026/05/30/i-put-googles-24-7-ai-assistant-gemini-spark-to-work-and-its-actually-pretty-useful/",
            "source": "techcrunch.com"
          }
        ]
      },
      {
        "id": "cybersecurity",
        "name": "Cybersecurity",
        "icon": "🔐",
        "articles": [
          {
            "id": "cyber-1",
            "date": "May 31, 2026",
            "title": "Microsoft is threatening legal action for disclosing exploits",
            "summary": "Microsoft has issued a warning regarding the disclosure of exploits, threatening legal action against those who reveal vulnerabilities without proper channels. This move underscores the ongoing tension between security researchers and tech giants.",
            "tag": "Policy",
            "url": "https://www.theverge.com/tech/940416/microsoft-nightmare-eclipse-zero-day-vulnerability",
            "source": "theverge.com"
          },
          {
            "id": "cyber-2",
            "date": "May 31, 2026",
            "title": "Botnet of more than 17 million devices dismantled",
            "summary": "A significant cybersecurity operation has successfully dismantled a botnet comprising over 17 million devices, highlighting the ongoing battle against cybercrime. This operation is a major win for security agencies worldwide.",
            "tag": "Breach",
            "url": "https://arstechnica.com/security/2026/05/botnet-of-more-than-17-million-devices-dismantled/",
            "source": "feeds.arstechnica.com"
          }
        ]
      },
      {
        "id": "cloud",
        "name": "Cloud Computing",
        "icon": "☁️",
        "articles": [
          {
            "id": "cloud-1",
            "date": "May 31, 2026",
            "title": "SoftBank says it will invest up to €75 billion to build French data centers",
            "summary": "SoftBank has announced plans to invest up to €75 billion in building data centers across France, aiming to enhance cloud infrastructure and services in Europe. This investment is expected to significantly boost the region's tech landscape.",
            "tag": "Market",
            "url": "https://techcrunch.com/2026/05/30/softbank-says-it-will-invest-up-to-e75-billion-to-build-french-data-centers/",
            "source": "techcrunch.com"
          }
        ]
      }
    ]
  },
  {
    "id": "science",
    "name": "Science",
    "icon": "🔬",
    "color": "#10b981",
    "gradient": "linear-gradient(135deg, #10b981, #06b6d4)",
    "description": "Breakthroughs in physics, biology, space exploration, and environmental science.",
    "subCategories": [
      {
        "id": "physics",
        "name": "Physics",
        "icon": "⚛️",
        "articles": [
          {
            "id": "physics-1",
            "date": "May 31, 2026",
            "title": "New 3D silicon chip breakthrough could extend Moore’s Law for years",
            "summary": "Researchers have made a groundbreaking advancement in 3D silicon chip technology, potentially extending Moore's Law for several more years. This innovation could lead to significant improvements in computing power and efficiency.",
            "tag": "Discovery",
            "url": "https://www.sciencedaily.com/releases/2026/05/260530053412.htm",
            "source": "sciencedaily.com"
          }
        ]
      }
    ]
  }
];

// All available newsletter data keyed by date string (add new dates here as they become available)
export const allNewsData: Record<string, Category[]> = {
  'May 31, 2026': MAY_31_2026_CATEGORIES,
  'May 30, 2026': MAY_30_2026_CATEGORIES,
  'May 29, 2026': MAY_29_2026_CATEGORIES,
  'May 28, 2026': MAY_28_2026_CATEGORIES,
  'May 26, 2026': MAY_26_2026_CATEGORIES,
  'May 25, 2026': MAY_25_2026_CATEGORIES,
  'May 24, 2026': MAY_24_2026_CATEGORIES,
  'May 23, 2026': MAY_23_2026_CATEGORIES,
  'May 22, 2026': MAY_22_2026_CATEGORIES,
  'May 21, 2026': MAY_21_2026_CATEGORIES,
  'May 20, 2026': MAY_20_2026_CATEGORIES,
  'May 19, 2026': MAY_19_2026_CATEGORIES,
  'May 18, 2026': MAY_18_2026_CATEGORIES,
  'May 17, 2026': MAY_17_2026_CATEGORIES,
  'May 16, 2026': MAY_16_2026_CATEGORIES,
  'May 15, 2026': MAY_15_2026_CATEGORIES,
  'May 14, 2026': MAY_14_2026_CATEGORIES,
  'May 13, 2026': MAY_13_2026_CATEGORIES,
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
