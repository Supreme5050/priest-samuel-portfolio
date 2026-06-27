import { useEffect, useState } from 'react'
import './App.css'
import {
  FaArrowRight,
  FaBars,
  FaBolt,
  FaChartLine,
  FaCheckCircle,
  FaDatabase,
  FaEnvelope,
  FaExternalLinkAlt,
  FaFacebookF,
  FaGithub,
  FaGlobe,
  FaInstagram,
  FaLayerGroup,
  FaLinkedinIn,
  FaMapMarkerAlt,
  FaMobileAlt,
  FaProjectDiagram,
  FaQuoteLeft,
  FaRocket,
  FaServer,
  FaShieldAlt,
  FaTimes,
  FaTools,
  FaUsers,
  FaWhatsapp,
} from 'react-icons/fa'

const heroNames = ['Priest Samuel']

const heroRoles = [
  'Software Engineer & Product Builder',
  'Systems Architect & API Builder',
  'Data Analyst & Sports Analytics Engineer',
  'Founder & CEO, TOP G',
  'Kingdom Ambassador & Transformational Leader',
]

const heroStatements = [
  'I do not just write code — I turn real problems into working products, systems, and digital solutions.',
  'I help businesses, communities, and founders move from raw ideas to clean, usable software.',
  'I combine engineering, backend logic, product thinking, data intelligence, and execution.',
  'I build with clarity, discipline, and excellence so ideas can become real impact.',
]

const proofItems = [
  'Problem Solver',
  'Product Builder',
  'Mobile Apps',
  'Backend APIs',
  'Data Systems',
  'Real-World Projects',
]

const hireReasons = [
  {
    title: 'I solve the whole problem, not just the screen',
    text: 'Many developers can build pages. I think through the user journey, backend logic, data flow, admin needs, and the real outcome the product must deliver.',
    icon: <FaLayerGroup />,
  },
  {
    title: 'I combine product, backend, and data thinking',
    text: 'Clients do not only need a beautiful interface. They need a system that can work, scale, store data, manage users, and support real operations.',
    icon: <FaServer />,
  },
  {
    title: 'I build from real-world understanding',
    text: 'My projects are built around real problems like navigation, safety reporting, service discovery, community systems, and operational dashboards.',
    icon: <FaUsers />,
  },
  {
    title: 'I think like a founder, not just a freelancer',
    text: 'I care about clarity, usefulness, speed, presentation, business value, and long-term direction — not just finishing a task and disappearing.',
    icon: <FaRocket />,
  },
]

const identities = [
  {
    number: '01',
    title: 'Software Engineer',
    text: 'I design and build mobile apps, web platforms, dashboards, backend-connected systems, and MVPs for real users.',
  },
  {
    number: '02',
    title: 'Systems Architect',
    text: 'I structure products with clear architecture, APIs, databases, authentication, workflows, and scalable technical direction.',
  },
  {
    number: '03',
    title: 'Data & Sports Analytics Engineer',
    text: 'I work with data, insights, dashboards, business intelligence, and sports analytics for football and basketball intelligence.',
  },
  {
    number: '04',
    title: 'Founder & Kingdom Builder',
    text: 'I lead TOP G as a purpose-driven movement focused on transformation, leadership, faith, mentorship, and raising people into greatness.',
  },
]

const engineeringStacks = [
  {
    title: 'Mobile Products',
    icon: <FaMobileAlt />,
    description:
      'Mobile-first applications with clean screens, clear flows, and practical user experiences.',
    items: ['React Native', 'Expo', 'Kotlin', 'Android Direction', 'iOS App Direction'],
  },
  {
    title: 'Backend & APIs',
    icon: <FaServer />,
    description:
      'Backend logic, authentication, databases, APIs, storage, and product workflows.',
    items: ['Node.js', 'REST APIs', 'Supabase', 'PostgreSQL', 'Firebase'],
  },
  {
    title: 'Data & Dashboards',
    icon: <FaChartLine />,
    description:
      'Data analytics, business intelligence, sports analytics, reporting, and insight-driven systems.',
    items: ['Python', 'Data Analytics', 'Sports Analytics', 'Dashboards', 'BI Thinking'],
  },
  {
    title: 'Product Systems',
    icon: <FaLayerGroup />,
    description:
      'Structured MVPs, product strategy, admin dashboards, automation, and scalable technical planning.',
    items: ['Next.js', 'TypeScript', 'System Design', 'Automation', 'MVP Planning'],
  },
]

const projects = [
  {
    number: '01',
    status: 'Mobile Navigation Product',
    title: 'Redemption City Navigator',
    summary:
      'A mobile navigation and service discovery product for helping residents, visitors, and worshippers move smarter inside Redemption City.',
    problem:
      'Redemption City is large, and many people struggle to locate roads, landmarks, estates, markets, chalets, services, and key facilities quickly.',
    built:
      'I built a mobile-first navigation concept with local search, map-based discovery, Market Hub, delivery ideas, chalets, and Sunday Shuttle mobility direction.',
    impact:
      'Gives visitors and residents a clearer way to find places, access services, discover vendors, and move around a large community with more confidence.',
    stack: ['React Native', 'Expo', 'TypeScript', 'Maps API', 'Offline Data'],
    features: [
      'Offline-first place discovery',
      'Map-based navigation experience',
      'Market Hub inside the app',
      'Chalet and service discovery',
      'Sunday Shuttle mobility concept',
    ],
    icon: <FaMapMarkerAlt />,
    proofImage: '/media/navigator-proof-1.png',
    proofLabel: 'Product Proof',
    actionNote: 'Demo available on request',
    featured: true,
  },
  {
    number: '02',
    status: 'Safety & Operations Platform',
    title: 'Redemption City Incident Management System',
    summary:
      'A safety reporting and response coordination platform for submitting incidents, tracking reports, assigning responders, and giving administrators operational visibility.',
    problem:
      'Communities need a faster and more organized way to report incidents, verify cases, assign responders, and track resolution.',
    built:
      'I built the product direction for mobile incident reporting, live report tracking, severity levels, responder coordination, and an admin dashboard experience.',
    impact:
      'Improves structure around safety reporting by helping reports move from submission to verification, assignment, response, and resolution.',
    stack: ['React Native', 'Next.js', 'Supabase', 'Dashboard', 'Auth'],
    features: [
      'Incident reporting workflow',
      'Live report tracking',
      'Severity and status management',
      'Admin dashboard interface',
      'Responder coordination system',
    ],
    icon: <FaShieldAlt />,
    proofImage: '/media/incident-proof-1.png',
    proofLabel: 'Product Proof',
    actionNote: 'Demo available on request',
    featured: true,
  },
  {
    number: '03',
    status: 'Transformation Brand',
    title: 'TOP G Global',
    summary:
      'A Kingdom-focused transformation brand built around mindset, leadership, discipline, wisdom, purpose, business, technology, and raising ordinary people into giants.',
    problem:
      'Many people need structure, purpose, leadership, teaching, and direction for personal transformation.',
    built:
      'I created the brand direction, message, movement positioning, and digital platform vision around transformation, purpose, leadership, and Kingdom impact.',
    impact:
      'Creates a clear foundation for mentorship, teaching, digital products, community building, and purpose-driven leadership.',
    stack: ['Brand Strategy', 'Leadership', 'Purpose', 'Community', 'Kingdom'],
    features: [
      'Purpose-driven brand direction',
      'Leadership and mindset content',
      'Community transformation vision',
      'Digital platform concept',
      'Kingdom impact positioning',
    ],
    icon: <FaRocket />,
    actionNote: 'Brand platform in progress',
  },
  {
    number: '04',
    status: 'Automation & Systems',
    title: 'AI Automation & Business Systems',
    summary:
      'AI-powered workflow ideas for automating reports, reminders, customer communication, business operations, church activities, and digital processes.',
    problem:
      'Many organizations lose time through repeated manual tasks and disconnected workflows.',
    built:
      'I design automation flows, reporting systems, reminders, data workflows, and AI-assisted business process improvements.',
    impact:
      'Helps teams save time, reduce manual repetition, communicate better, and operate with more structure.',
    stack: ['AI', 'Automation', 'Systems', 'Workflow', 'Productivity'],
    features: [
      'Workflow planning',
      'AI-assisted productivity',
      'Automated reports and reminders',
      'Business process improvement',
      'System thinking and strategy',
    ],
    icon: <FaProjectDiagram />,
    actionNote: 'Workflow planning available',
  },
]

const validationItems = [
  {
    title: 'Real product proof',
    text: 'Redemption City Navigator and the Incident Management System are built around real community problems, not random portfolio mockups.',
    icon: <FaCheckCircle />,
  },
  {
    title: 'Client-ready thinking',
    text: 'Each project is structured around the problem, what was built, the tools used, and the expected impact.',
    icon: <FaQuoteLeft />,
  },
  {
    title: 'Fast contact path',
    text: 'The portfolio pushes visitors toward WhatsApp and email quickly, without unnecessary steps.',
    icon: <FaWhatsapp />,
  },
]

const topGCards = [
  {
    number: '01',
    title: 'Mindset',
    text: 'Helping people think with clarity, courage, discipline, purpose, and long-term vision.',
  },
  {
    number: '02',
    title: 'Leadership',
    text: 'Raising people who can influence families, churches, businesses, communities, and nations with wisdom.',
  },
  {
    number: '03',
    title: 'Purpose',
    text: 'Moving people from confusion into assignment, direction, responsibility, and legacy.',
  },
  {
    number: '04',
    title: 'Kingdom Impact',
    text: 'Building a movement that carries excellence, service, wisdom, spiritual intelligence, and transformation.',
  },
]

const skillGroups = [
  {
    title: 'Mobile',
    icon: <FaMobileAlt />,
    items: ['React Native', 'Expo', 'Kotlin', 'Mobile UI', 'App Prototypes'],
  },
  {
    title: 'Backend',
    icon: <FaServer />,
    items: ['Node.js', 'REST APIs', 'Supabase', 'PostgreSQL', 'Firebase'],
  },
  {
    title: 'Data',
    icon: <FaDatabase />,
    items: ['Python', 'Data Analytics', 'Dashboards', 'Sports Analytics', 'Business Intelligence'],
  },
  {
    title: 'Tools',
    icon: <FaTools />,
    items: ['Git', 'GitHub', 'Vercel', 'Figma', 'VS Code'],
  },
]

const services = [
  {
    number: '01',
    title: 'Mobile App Development',
    text: 'Clean mobile applications for businesses, communities, startups, churches, and client ideas.',
    icon: <FaMobileAlt />,
  },
  {
    number: '02',
    title: 'Websites & Web Platforms',
    text: 'Professional websites, landing pages, web apps, dashboards, and business platforms.',
    icon: <FaGlobe />,
  },
  {
    number: '03',
    title: 'Backend & API Systems',
    text: 'Authentication, databases, storage, APIs, backend workflows, and scalable product logic.',
    icon: <FaServer />,
  },
  {
    number: '04',
    title: 'Data & Analytics Solutions',
    text: 'Dashboards, business intelligence, data reporting, sports analytics, and insight-driven systems.',
    icon: <FaDatabase />,
  },
  {
    number: '05',
    title: 'MVP & Prototype Development',
    text: 'Client-ready prototypes and MVPs that can be tested, pitched, presented, and improved.',
    icon: <FaRocket />,
  },
  {
    number: '06',
    title: 'AI & Automation Planning',
    text: 'Smarter workflows using AI tools, automation, reminders, reporting, and system thinking.',
    icon: <FaBolt />,
  },
]

const process = [
  {
    number: '01',
    title: 'Understand',
    text: 'Clarify the client goal, user need, business problem, target audience, and expected outcome.',
  },
  {
    number: '02',
    title: 'Structure',
    text: 'Organize the idea into features, user journeys, screens, data needs, architecture, and development stages.',
  },
  {
    number: '03',
    title: 'Build',
    text: 'Develop clean interfaces, backend systems, data flows, and functional products ready for presentation.',
  },
  {
    number: '04',
    title: 'Launch',
    text: 'Package the project for demo, deployment, client review, user testing, and continuous improvement.',
  },
]

const values = [
  'Faith First',
  'Purpose Always',
  'Excellence Without Limits',
  'Wisdom',
  'Discipline',
  'Innovation',
  'Leadership',
  'Kingdom Impact',
  'Transformation',
  'Legacy',
  'Solving Real Problems',
  'Building With Purpose',
]

const socialLinks = [
  {
    name: 'Email',
    label: 'Send me an email',
    icon: <FaEnvelope />,
    link: 'mailto:priesthack504@gmail.com',
  },
  {
    name: 'WhatsApp',
    label: 'Message me on WhatsApp',
    icon: <FaWhatsapp />,
    link: 'https://wa.me/2349158474822',
  },
  {
    name: 'Facebook',
    label: 'Visit my Facebook',
    icon: <FaFacebookF />,
    link: 'https://www.facebook.com/share/17DJacEgTL/?mibextid=wwXIfr',
  },
  {
    name: 'Instagram',
    label: 'Visit my Instagram',
    icon: <FaInstagram />,
    link: 'https://instagram.com/The_Priest5050',
  },
  {
    name: 'LinkedIn',
    label: 'Visit my LinkedIn',
    icon: <FaLinkedinIn />,
    link: 'https://www.linkedin.com/in/priest-samuel-276757236/',
  },
  {
    name: 'GitHub',
    label: 'Visit my GitHub',
    icon: <FaGithub />,
    link: 'https://github.com/Supreme5050',
  },
]

function TypewriterText({
  phrases,
  speed = 46,
  pause = 1500,
  className = '',
  erase = true,
}) {
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [text, setText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const currentPhrase = phrases[phraseIndex]
    const isComplete = text === currentPhrase
    const isEmpty = text === ''

    if (isComplete && !isDeleting && !erase) {
      return undefined
    }

    let timeoutDelay = isDeleting ? speed / 2 : speed

    if (isComplete && !isDeleting) {
      timeoutDelay = pause
    }

    if (isEmpty && isDeleting) {
      timeoutDelay = 300
    }

    const timeout = setTimeout(() => {
      if (!isDeleting && text.length < currentPhrase.length) {
        setText(currentPhrase.slice(0, text.length + 1))
        return
      }

      if (!isDeleting && text.length === currentPhrase.length) {
        setIsDeleting(true)
        return
      }

      if (isDeleting && text.length > 0) {
        setText(currentPhrase.slice(0, text.length - 1))
        return
      }

      if (isDeleting && text.length === 0) {
        setIsDeleting(false)
        setPhraseIndex((currentIndex) => (currentIndex + 1) % phrases.length)
      }
    }, timeoutDelay)

    return () => clearTimeout(timeout)
  }, [text, isDeleting, phraseIndex, phrases, speed, pause, erase])

  return (
    <span className={`typewriter ${className}`}>
      <span>{text}</span>
      <span className="typewriter-cursor">|</span>
    </span>
  )
}

function ProjectProofImage({ image, label, title }) {
  return (
    <div className="project-proof">
      <div className="project-proof-head">
        <span>{label}</span>
        <strong>{title}</strong>
      </div>

      <div className="project-proof-image-wrap">
        <img src={image} alt={`${title} proof`} className="project-proof-image" />
      </div>
    </div>
  )
}

function ProjectCompactVisual({ title, status, icon }) {
  return (
    <div className="project-compact-visual">
      <div className="compact-icon">{icon}</div>
      <div>
        <span>{status}</span>
        <strong>{title}</strong>
      </div>
    </div>
  )
}

function ProjectCard({ project }) {
  return (
    <article className={project.featured ? 'project-card featured' : 'project-card'}>
      {project.proofImage ? (
        <ProjectProofImage
          image={project.proofImage}
          label={project.proofLabel}
          title={project.title}
        />
      ) : (
        <ProjectCompactVisual
          title={project.title}
          status={project.status}
          icon={project.icon}
        />
      )}

      <div className="project-content">
        <div className="project-meta">
          <span>{project.number}</span>
          <small>{project.status}</small>
        </div>

        <h3>{project.title}</h3>
        <p>{project.summary}</p>

        <div className="case-study-grid">
          <div className="case-study-item">
            <strong>Problem</strong>
            <p>{project.problem}</p>
          </div>

          <div className="case-study-item">
            <strong>What I Built</strong>
            <p>{project.built}</p>
          </div>

          <div className="case-study-item">
            <strong>Impact</strong>
            <p>{project.impact}</p>
          </div>
        </div>

        <div className="feature-list">
          {project.features.map((feature) => (
            <span key={feature}>
              <FaCheckCircle /> {feature}
            </span>
          ))}
        </div>

        <div className="tag-list">
          {project.stack.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>

        <div className="project-action-row">
          <span>
            <FaExternalLinkAlt /> {project.actionNote}
          </span>
        </div>
      </div>
    </article>
  )
}

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  const contactSocials = socialLinks.filter((social) =>
    ['Facebook', 'Instagram', 'LinkedIn', 'GitHub'].includes(social.name)
  )

  return (
    <main className="site-wrapper">
      <nav className="navbar">
        <a href="#intro" className="nav-brand" onClick={closeMenu}>
          <span className="brand-mark">PS</span>
          <span>Priest Samuel</span>
        </a>

        <button
          className="menu-btn"
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </button>

        <div className={isMenuOpen ? 'nav-links open' : 'nav-links'}>
          <a href="#about" onClick={closeMenu}>About</a>
          <a href="#why-hire" onClick={closeMenu}>Why Me</a>
          <a href="#stack" onClick={closeMenu}>Stack</a>
          <a href="#projects" onClick={closeMenu}>Projects</a>
          <a href="#proof" onClick={closeMenu}>Proof</a>
          <a href="#topg" onClick={closeMenu}>TOP G</a>
          <a href="#contact" onClick={closeMenu}>Contact</a>
        </div>
      </nav>

      <section id="intro" className="video-intro">
        <video className="intro-video" autoPlay muted loop playsInline>
          <source src="/media/intro-video.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        <div className="intro-overlay"></div>

        <div className="intro-content">
          <h1 className="intro-title">
            <TypewriterText
              phrases={heroNames}
              speed={95}
              pause={1000}
              erase={false}
              className="intro-name-typewriter"
            />
          </h1>

          <p className="intro-role">
            <TypewriterText phrases={heroRoles} speed={42} pause={1400} />
          </p>

          <div className="intro-outcomes">
            <span>Problems</span>
            <i>·</i>
            <span>Products</span>
            <i>·</i>
            <span>Systems</span>
          </div>

          <p className="intro-text">
            <TypewriterText
              phrases={heroStatements}
              speed={28}
              pause={1800}
              className="intro-statement-typewriter"
            />
          </p>

          <div className="intro-actions">
            <a href="#contact" className="primary-btn">
              Work With Me <FaWhatsapp />
            </a>
            <a href="#why-hire" className="secondary-btn">
              Why Hire Me <FaArrowRight />
            </a>
          </div>
        </div>

        <a href="#main" className="scroll-indicator" aria-label="Scroll down">
          <span></span>
        </a>
      </section>

      <section className="proof-strip" aria-label="Portfolio proof">
        <div className="proof-strip-inner">
          <strong>Built around</strong>
          {proofItems.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </section>

      <section id="main" className="hero section-padding">
        <div className="hero-copy">
          <p className="eyebrow">
            Software Engineer • Systems Architect • Data Analyst • Sports Analytics Engineer
          </p>
          <h2>
            Hire me when you need more than a developer — you need someone who can think, structure, build, and deliver.
          </h2>
          <p>
            I help people and organisations turn unclear ideas into working software,
            clear systems, useful dashboards, and product experiences that solve
            real problems.
          </p>

          <div className="hero-actions">
            <a href="#contact" className="primary-btn">
              Have a Project? Let’s Build <FaArrowRight />
            </a>
            <a href="#projects" className="secondary-btn">
              View Case Studies
            </a>
          </div>

          <div className="hero-stats">
            <div>
              <strong>Product Thinking</strong>
              <span>I think through the problem, the users, the flow, and the business outcome.</span>
            </div>
            <div>
              <strong>System Building</strong>
              <span>I connect interfaces with backend logic, data, APIs, and admin workflows.</span>
            </div>
            <div>
              <strong>Real Execution</strong>
              <span>I build practical MVPs and product structures that can be tested, pitched, and improved.</span>
            </div>
          </div>
        </div>

        <div className="hero-profile">
          <div className="profile-card">
            <div className="profile-image">
              <img src="/media/priest-photo.jpeg" alt="Priest Samuel" />
            </div>

            <div className="profile-content">
              <span>Founder & CEO, TOP G</span>
              <h3>Priest Samuel</h3>
              <p>
                Software engineer, systems architect, data analyst, sports analytics
                engineer, product builder, entrepreneur, and Kingdom ambassador.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="about section-padding">
        <div className="about-value-grid">
          <div className="about-value-copy">
            <p className="eyebrow">Value Proposition</p>
            <h2>I help you move from idea to working product.</h2>
            <p>
              A client should hire me because I do not approach software as just
              code. I approach it as a complete system — the problem, the user,
              the interface, the backend, the data, the workflow, and the result.
            </p>
            <p>
              My strength is taking a raw idea and giving it structure: what the
              product should do, how users should move through it, what data it
              needs, what backend logic supports it, and how it can be presented
              professionally.
            </p>
            <p>
              That combination of engineering, systems architecture, product
              thinking, data intelligence, and real-world execution is what makes
              my work different.
            </p>
          </div>

          <div className="about-photo-card">
            <div className="about-photo">
              <img src="/media/priest-photo.jpeg" alt="Priest Samuel professional headshot" />
            </div>

            <div className="about-photo-content">
              <span>Available for serious builds</span>
              <h3>Priest Samuel</h3>
              <p>
                Mobile apps · Backend APIs · Data dashboards · MVP systems
              </p>
            </div>
          </div>
        </div>

        <div className="identity-grid">
          {identities.map((identity) => (
            <article className="identity-card" key={identity.title}>
              <span>{identity.number}</span>
              <h3>{identity.title}</h3>
              <p>{identity.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="why-hire" className="why-hire section-padding">
        <div className="why-hire-main">
          <p className="eyebrow">Why Hire Me?</p>
          <h2>Because I build like a problem-solver, not just a coder.</h2>
          <p>
            There are millions of developers, but clients do not only need someone
            who can write code. They need someone who can understand the problem,
            design the system, build the product, and think about the outcome.
          </p>

          <div className="difference-grid">
            <div className="difference-card muted-card">
              <span>Many developers</span>
              <p>
                Build what they are told, focus only on screens, and wait for the
                client to explain every product decision.
              </p>
            </div>

            <div className="difference-card strong-card">
              <span>What I bring</span>
              <p>
                I help shape the idea, structure the flow, think through the
                backend, connect the data, and build toward a product that can
                actually be used.
              </p>
            </div>
          </div>
        </div>

        <div className="hire-reasons-grid">
          {hireReasons.map((reason) => (
            <article className="hire-reason-card" key={reason.title}>
              <div className="hire-reason-icon">{reason.icon}</div>
              <h3>{reason.title}</h3>
              <p>{reason.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="stack" className="engineering section-padding">
        <div className="section-heading center">
          <p className="eyebrow">Professional Stack</p>
          <h2>Focused skills for the kind of work I want to be hired for.</h2>
          <p>
            Mobile apps, backend systems, APIs, dashboards, data analytics,
            sports intelligence, and practical MVP development.
          </p>
        </div>

        <div className="engineering-grid">
          {engineeringStacks.map((stack) => (
            <article className="engineering-card" key={stack.title}>
              <div className="engineering-icon">{stack.icon}</div>
              <h3>{stack.title}</h3>
              <p>{stack.description}</p>

              <div className="engineering-list">
                {stack.items.map((item) => (
                  <span key={item}>
                    <FaCheckCircle /> {item}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="projects" className="projects section-padding">
        <div className="section-heading center">
          <p className="eyebrow">Selected Case Studies</p>
          <h2>Real product work, presented around problem, build, stack, and impact.</h2>
          <p>
            Redemption City Navigator leads because it is the strongest
            community-impact product. The focus here is quality, not quantity.
          </p>
        </div>

        <div className="projects-grid">
          {projects.map((project) => (
            <ProjectCard project={project} key={project.title} />
          ))}
        </div>
      </section>

      <section id="proof" className="validation section-padding">
        <div className="section-heading center">
          <p className="eyebrow">Trust & Validation</p>
          <h2>Proof that the work is connected to real problems.</h2>
          <p>
            I will add real testimonials here as soon as clients and collaborators
            provide public feedback. For now, the proof is shown through real
            project direction, working product structure, and clear case studies.
          </p>
        </div>

        <div className="validation-grid">
          {validationItems.map((item) => (
            <article className="validation-card" key={item.title}>
              <div className="validation-icon">{item.icon}</div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="topg" className="topg section-padding">
        <div className="topg-main">
          <p className="eyebrow">TOP G Global</p>
          <h2>Transforming Ordinary People into Giants.</h2>
          <p>
            TOP G Global is a Kingdom-focused transformation movement built to
            raise people from ordinary living into purpose, discipline,
            leadership, wisdom, excellence, and greatness.
          </p>
          <p className="topg-line">
            Faith First. Purpose Always. Excellence Without Limits.
          </p>
        </div>

        <div className="topg-grid">
          {topGCards.map((card) => (
            <article className="topg-card" key={card.title}>
              <span>{card.number}</span>
              <h3>{card.title}</h3>
              <p>{card.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="skills" className="skills section-padding">
        <div className="section-heading center">
          <p className="eyebrow">Skills & Tools</p>
          <h2>Grouped for quick client scanning.</h2>
          <p>
            Organised by the work clients are likely to hire me for: mobile,
            backend, data, and delivery tools.
          </p>
        </div>

        <div className="skills-grid">
          {skillGroups.map((group) => (
            <article className="skill-card" key={group.title}>
              <div className="skill-icon">{group.icon}</div>
              <h3>{group.title}</h3>

              <div className="skill-items">
                {group.items.map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="services" className="services section-padding">
        <div className="section-heading center">
          <p className="eyebrow">Services</p>
          <h2>What I can help you build.</h2>
          <p>
            I help turn raw ideas into clearer plans, stronger systems, better
            digital products, useful data insights, and practical solutions that
            can be built, tested, presented, and improved.
          </p>
        </div>

        <div className="services-grid">
          {services.map((service) => (
            <article className="service-card" key={service.title}>
              <div className="service-icon">{service.icon}</div>
              <span>{service.number}</span>
              <h3>{service.title}</h3>
              <p>{service.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="process section-padding">
        <div className="section-heading center">
          <p className="eyebrow">My Process</p>
          <h2>How I approach client and product work.</h2>
        </div>

        <div className="process-grid">
          {process.map((item) => (
            <article className="process-card" key={item.title}>
              <span>{item.number}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="philosophy section-padding">
        <div className="philosophy-card">
          <p className="eyebrow">Personal Philosophy</p>
          <h2>Every giant was once ordinary.</h2>
          <blockquote>
            “Transformation is the bridge between potential and greatness.”
          </blockquote>
          <p>
            I believe technology is a tool for transformation, leadership is a
            responsibility, and every individual carries untapped greatness. My
            life’s work is dedicated to helping people, brands, communities, and
            organizations unlock that potential and build solutions that can
            impact generations.
          </p>

          <div className="values-wrap">
            {values.map((value) => (
              <span key={value}>{value}</span>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="contact section-padding">
        <div className="contact-card">
          <p className="eyebrow">Contact</p>
          <h2>Have a project in mind? Let’s build it.</h2>
          <p>
            If you need someone who can help you think through the idea, structure
            the system, build the product, and present it professionally, let’s
            talk.
          </p>

          <div className="contact-actions">
            <a href="https://wa.me/2349158474822" className="primary-btn">
              Message Me on WhatsApp <FaWhatsapp />
            </a>
            <a href="mailto:priesthack504@gmail.com" className="secondary-btn">
              Send Email <FaEnvelope />
            </a>
          </div>

          <div className="social-grid">
            {contactSocials.map((social) => (
              <a
                key={social.name}
                href={social.link}
                target="_blank"
                rel="noreferrer"
                aria-label={social.name}
              >
                {social.icon}
                <span>
                  <strong>{social.name}</strong>
                  <small>{social.label}</small>
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <footer className="footer">
        <h3>Priest Samuel</h3>
        <p>
          Founder & CEO, TOP G • Software Engineer • Systems Architect • Data Analyst • Sports Analytics Engineer
        </p>

        <div className="footer-socials">
          {socialLinks
            .filter((social) => ['Email', 'LinkedIn', 'GitHub', 'WhatsApp'].includes(social.name))
            .map((social) => (
              <a
                href={social.link}
                key={social.name}
                target="_blank"
                rel="noreferrer"
                aria-label={social.name}
              >
                {social.icon}
              </a>
            ))}
        </div>

        <small>
          © {new Date().getFullYear()} Priest Samuel. Built with purpose,
          excellence, and Kingdom impact.
        </small>
      </footer>
    </main>
  )
}

export default App