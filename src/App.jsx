import { useState } from 'react'
import './App.css'
import {
  FaEnvelope,
  FaWhatsapp,
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaGithub,
} from 'react-icons/fa'

const identities = [
  {
    number: '01',
    title: 'Software Developer',
    text: 'I think in systems, interfaces, user journeys, and practical digital solutions.',
  },
  {
    number: '02',
    title: 'Data Analyst',
    text: 'I use data thinking to understand problems, discover patterns, and support better decisions.',
  },
  {
    number: '03',
    title: 'AI & Automation Builder',
    text: 'I am interested in using AI tools and automation systems to save time and increase productivity.',
  },
  {
    number: '04',
    title: 'Founder & Strategist',
    text: 'I build ideas with purpose, structure, brand direction, and long-term impact in mind.',
  },
]

const projects = [
  {
    number: '01',
    status: 'Major Vision',
    title: 'Redemption City Smart Navigation Platform',
    text: 'A smart navigation and service discovery platform designed to help people find places, chalets, rooms, prices, streets, food points, parking areas, landmarks, and facilities within Redemption City.',
    problem:
      'Helps visitors and residents move around Redemption City with clearer, more accurate, institution-specific information.',
    tags: ['Navigation', 'Service Discovery', 'Concept'],
    featured: true,
  },
  {
    number: '02',
    status: 'Concept',
    title: 'Church Management System',
    text: 'A digital system for managing members, departments, attendance, follow-up, reports, activities, reminders, and church operations.',
    problem:
      'Helps churches become more organized, consistent, and effective in caring for members and managing activities.',
    tags: ['Church Tech', 'Operations', 'Planning'],
  },
  {
    number: '03',
    status: 'Concept',
    title: 'Smart Meter / Electricity Token App',
    text: 'An app idea for tracking meter readings, electricity token usage, payment records, and power consumption for homes or communities.',
    problem:
      'Helps users manage electricity usage, reduce confusion, and keep better records of token purchases and meter activity.',
    tags: ['Utility Tech', 'Tracking', 'Idea'],
  },
  {
    number: '04',
    status: 'In Development',
    title: 'Top G Global Platform',
    text: 'A transformational platform focused on mindset, leadership, discipline, spiritual intelligence, business, technology, media, and purpose development.',
    problem:
      'Helps people move from ordinary living into purpose, wisdom, leadership, discipline, and greatness.',
    tags: ['Personal Growth', 'Leadership', 'Movement'],
  },
  {
    number: '05',
    status: 'Concept',
    title: 'Content Creator Management Tool',
    text: 'A platform idea for helping content creators plan content, manage tasks, organize ideas, track performance, and collaborate better.',
    problem:
      'Helps creators stay organized, consistent, and strategic with their content and creative workflow.',
    tags: ['Creator Tools', 'Workflow', 'Concept'],
  },
  {
    number: '06',
    status: 'Exploring',
    title: 'AI Automation & Business Systems',
    text: 'AI-powered ideas for automating reminders, reports, customer communication, business operations, church activities, and digital workflows.',
    problem:
      'Saves time, reduces manual work, and helps people and organizations operate with more intelligence.',
    tags: ['AI', 'Automation', 'Systems'],
  },
]

const topGCards = [
  {
    number: '01',
    title: 'Mindset',
    text: 'Helping people think with strength, clarity, vision, and discipline.',
  },
  {
    number: '02',
    title: 'Leadership',
    text: 'Raising people who can influence families, churches, businesses, and communities.',
  },
  {
    number: '03',
    title: 'Purpose',
    text: 'Moving people from confusion into assignment, direction, and legacy.',
  },
  {
    number: '04',
    title: 'Kingdom Impact',
    text: 'Building a movement that carries wisdom, excellence, service, and transformation.',
  },
]

const skills = [
  {
    number: '01',
    title: 'Tech',
    items: [
      'Software Development',
      'App Development',
      'System Architecture',
      'AI Automation',
      'Data Analysis',
    ],
  },
  {
    number: '02',
    title: 'Strategy',
    items: [
      'Business Strategy',
      'Product Ideation',
      'Brand Development',
      'Digital Marketing',
      'Proposal Writing',
    ],
  },
  {
    number: '03',
    title: 'Creative',
    items: [
      'Content Strategy',
      'Cinematic Direction',
      'Visual Branding',
      'Script Writing',
      'Media Planning',
    ],
  },
  {
    number: '04',
    title: 'Spiritual / Leadership',
    items: [
      'Preaching',
      'Teaching',
      'Mentorship',
      'Leadership Communication',
      'Community Building',
    ],
  },
]

const tools = [
  'Flutter',
  'Dart',
  'Next.js',
  'TypeScript',
  'Tailwind CSS',
  'Supabase',
  'PostgreSQL',
  'Firebase',
  'Google Maps',
  'Mapbox',
  'MapLibre',
  'ChatGPT',
  'Cursor',
  'Claude',
  'Google AI Studio',
  'Canva',
  'CapCut',
]

const services = [
  {
    number: '01',
    title: 'Website & App Idea Planning',
    text: 'Helping you turn an idea into a clear structure, feature list, user journey, and practical build direction.',
  },
  {
    number: '02',
    title: 'Business Strategy Consultation',
    text: 'Helping businesses think through offers, positioning, audience, growth direction, and execution plans.',
  },
  {
    number: '03',
    title: 'AI Automation Planning',
    text: 'Identifying repeated tasks that can be improved with AI tools, workflows, reminders, reports, and smart systems.',
  },
  {
    number: '04',
    title: 'Data Analysis',
    text: 'Organizing, reading, and interpreting data so people and businesses can make better decisions.',
  },
  {
    number: '05',
    title: 'Proposal Writing',
    text: 'Creating clear, persuasive, and professional proposals for projects, partnerships, business ideas, and digital solutions.',
  },
  {
    number: '06',
    title: 'Brand Strategy',
    text: 'Helping people and businesses define their message, identity, audience, values, tone, and visual direction.',
  },
  {
    number: '07',
    title: 'Content Strategy',
    text: 'Planning content ideas, campaign direction, storytelling angles, scripts, and media structure for creators and brands.',
  },
  {
    number: '08',
    title: 'Church System Planning',
    text: 'Helping churches plan digital systems for members, departments, reminders, follow-up, reports, and activities.',
  },
  {
    number: '09',
    title: 'Digital Product Strategy',
    text: 'Structuring digital products from idea to user problem, feature planning, positioning, and launch direction.',
  },
]

const values = [
  'Purpose',
  'Wisdom',
  'Excellence',
  'Discipline',
  'Spiritual Intelligence',
  'Innovation',
  'Leadership',
  'Kingdom Impact',
  'Transformation',
  'Legacy',
  'Wealth With Purpose',
  'Solving Real Problems',
]

const socialLinks = [
  {
    name: 'Email',
    label: 'Send me an email',
    icon: <FaEnvelope />,
    link: 'mailto:priestsamuel56@gmail.com',
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

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  return (
    <main className="page">
      <section className="videoIntro">
        <video className="introVideo" autoPlay muted loop playsInline>
          <source src="/media/intro-video.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        <div className="videoOverlay"></div>
        <div className="videoGrain"></div>

        <div className="introContent">
          <p className="introKicker">Welcome to the world of</p>

          <h1 className="introTitle">Priest Samuel</h1>

          <p className="introSubtitle">
            Tech Visionary • Kingdom Builder • Creative Strategist
          </p>

          <p className="introText">
            Building systems, brands, and movements that transform ordinary
            people into giants.
          </p>

          <a className="introButton" href="#home">
            Explore My World
          </a>
        </div>

        <a className="scrollCue" href="#home" aria-label="Scroll to portfolio">
          <span></span>
        </a>
      </section>

      <nav className={isMenuOpen ? 'navbar menuOpen' : 'navbar'}>
        <div className="navTop">
          <a className="brand" href="#home" onClick={closeMenu}>
            Priest Samuel
          </a>

          <button
            className={isMenuOpen ? 'menuButton menuButtonOpen' : 'menuButton'}
            type="button"
            aria-label="Toggle navigation menu"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>

        <div className={isMenuOpen ? 'navLinks showMenu' : 'navLinks'}>
          <a href="#about" onClick={closeMenu}>
            About
          </a>
          <a href="#vision" onClick={closeMenu}>
            Vision
          </a>
          <a href="#projects" onClick={closeMenu}>
            Projects
          </a>
          <a href="#topg" onClick={closeMenu}>
            Top G Global
          </a>
          <a href="#skills" onClick={closeMenu}>
            Skills
          </a>
          <a href="#services" onClick={closeMenu}>
            Services
          </a>
          <a href="#philosophy" onClick={closeMenu}>
            Philosophy
          </a>
          <a href="#contact" onClick={closeMenu}>
            Contact
          </a>
        </div>
      </nav>

      <section id="home" className="hero">
        <div className="heroContent">
          <p className="eyebrow">
            Tech Visionary • Kingdom Builder • Creative Strategist
          </p>

          <h1>
            Building Systems, Brands, and Movements That Transform People.
          </h1>

          <p className="heroText">
            I combine technology, spiritual intelligence, strategy, and creativity
            to build solutions that solve real problems, empower communities,
            and raise people into purpose.
          </p>

          <div className="heroButtons">
            <a className="btn primaryBtn" href="#projects">
              View My Projects
            </a>

            <a className="btn secondaryBtn" href="#contact">
              Work With Me
            </a>
          </div>
        </div>
      </section>

      <section id="about" className="aboutSection">
        <div className="sectionLabel">About Me</div>

        <div className="aboutGrid">
          <div>
            <h2>
              I am a visionary builder combining technology, wisdom, faith, and
              strategy.
            </h2>
          </div>

          <div className="aboutText">
            <p>
              My name is Priest Samuel. I am a software developer, certified data
              analyst, AI and automation enthusiast, tech visionary, founder,
              strategist, preacher, and creative builder.
            </p>

            <p>
              I am passionate about using technology, spiritual intelligence,
              creativity, and leadership to solve real problems and build systems
              that help people, churches, businesses, and communities grow.
            </p>

            <p>
              The name Priest carries spiritual weight for me. It represents
              purpose, wisdom, service, leadership, discipline, and divine
              assignment. My life and work are centered around impact,
              transformation, excellence, and helping people become better
              versions of themselves.
            </p>
          </div>
        </div>

        <div className="photoShowcase">
          <div className="photoFrame">
            <img src="/media/priest-photo.jpeg" alt="Priest Samuel speaking" />
          </div>

          <div className="photoContent">
            <span>Founder • Builder • Voice</span>

            <h3>
              A builder with a voice, a mission, and a responsibility to create
              lasting impact.
            </h3>

            <p>
              This portfolio represents more than skills. It represents purpose,
              leadership, technology, spiritual intelligence, creativity, and the
              desire to build solutions that help people rise.
            </p>
          </div>
        </div>

        <div className="identityCards">
          {identities.map((identity) => (
            <div className="identityCard" key={identity.number}>
              <span>{identity.number}</span>
              <h3>{identity.title}</h3>
              <p>{identity.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="vision" className="visionSection">
        <div className="visionContent">
          <div>
            <div className="sectionLabel">My Vision</div>

            <h2>
              To build systems, platforms, and communities that raise people into
              purpose.
            </h2>
          </div>

          <div className="visionPanel">
            <p>
              My goal is to build digital solutions, transformational platforms,
              and strategic systems that help people become wiser, stronger, more
              organized, and more impactful.
            </p>

            <p>
              I believe technology should not only make life easier. It should
              help people think better, work better, serve better, lead better,
              and live with stronger purpose.
            </p>

            <p>
              From church systems to navigation platforms, AI automation,
              business tools, and personal development communities, my vision is
              to create solutions that carry both intelligence and impact.
            </p>
          </div>
        </div>

        <div className="visionCards">
          <div className="visionCard">
            <h3>Build Systems</h3>
            <p>
              Create practical digital tools that organize people, processes,
              information, and services.
            </p>
          </div>

          <div className="visionCard">
            <h3>Raise Leaders</h3>
            <p>
              Use wisdom, teaching, communication, and strategy to help people
              grow into stronger versions of themselves.
            </p>
          </div>

          <div className="visionCard">
            <h3>Solve Real Problems</h3>
            <p>
              Focus on ideas that serve churches, businesses, communities, and
              everyday people.
            </p>
          </div>
        </div>
      </section>

      <section id="projects" className="projectsSection">
        <div className="projectsHeader">
          <div>
            <div className="sectionLabel">Projects</div>

            <h2>
              Practical ideas, digital systems, and platforms designed for real
              impact.
            </h2>
          </div>

          <p>
            These projects represent my direction as a builder. Some are concepts,
            some are planned systems, and some are ideas I am developing as I grow
            in software development, data, AI, and product strategy.
          </p>
        </div>

        <div className="projectGrid">
          {projects.map((project) => (
            <div
              className={
                project.featured ? 'projectCard featuredProject' : 'projectCard'
              }
              key={project.number}
            >
              <div className="projectTop">
                <span className="projectNumber">{project.number}</span>
                <span className="projectStatus">{project.status}</span>
              </div>

              <h3>{project.title}</h3>
              <p>{project.text}</p>

              <div className="problemBox">
                <strong>Problem it solves:</strong>
                <span>{project.problem}</span>
              </div>

              <div className="projectFooter">
                {project.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="topg" className="topGSection">
        <div className="topGBackgroundText">TOP G</div>

        <div className="topGContent">
          <div>
            <div className="sectionLabel">Top G Global</div>

            <h2>Transforming Ordinary People into Giants.</h2>

            <p className="topGIntro">
              Top G Global is a transformational movement built to raise people
              from ordinary living into purpose, discipline, leadership, wisdom,
              and greatness.
            </p>
          </div>

          <div className="topGPanel">
            <p className="topGSlogan">
              Built in Spirit. Strong in Mind. Wealthy in Purpose.
            </p>

            <p>
              The mission is to build people spiritually, mentally, strategically,
              creatively, and financially, so they can live with discipline,
              leadership, impact, and purpose.
            </p>

            <p>
              Top G Global represents a future platform for teaching, media,
              mindset development, leadership, business, technology, and kingdom
              influence.
            </p>
          </div>
        </div>

        <div className="topGCards">
          {topGCards.map((card) => (
            <div className="topGCard" key={card.number}>
              <span>{card.number}</span>
              <h3>{card.title}</h3>
              <p>{card.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="skills" className="skillsSection">
        <div className="skillsHeader">
          <div>
            <div className="sectionLabel">Skills</div>

            <h2>A blend of technology, strategy, creativity, and leadership.</h2>
          </div>

          <p>
            My strength is not only in learning tools. It is in connecting ideas,
            people, systems, purpose, and execution into something useful.
          </p>
        </div>

        <div className="skillsGrid">
          {skills.map((skill) => (
            <div className="skillCategory" key={skill.number}>
              <div className="skillIcon">{skill.number}</div>
              <h3>{skill.title}</h3>

              <div className="skillList">
                {skill.items.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="toolsBox">
          <h3>Tools & Technologies I am learning or exploring</h3>

          <div className="toolsList">
            {tools.map((tool) => (
              <span key={tool}>{tool}</span>
            ))}
          </div>
        </div>
      </section>

      <section id="services" className="servicesSection">
        <div className="servicesHeader">
          <div>
            <div className="sectionLabel">Services</div>

            <h2>
              Strategic support for ideas, systems, brands, and digital growth.
            </h2>
          </div>

          <p>
            I help turn raw ideas into clearer plans, stronger systems, better
            brand direction, and practical digital solutions that can be built,
            tested, and improved.
          </p>
        </div>

        <div className="servicesGrid">
          {services.map((service) => (
            <div className="serviceCard" key={service.number}>
              <span>{service.number}</span>
              <h3>{service.title}</h3>
              <p>{service.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="philosophy" className="philosophySection">
        <div className="philosophyInner">
          <div className="sectionLabel">Personal Philosophy</div>

          <h2>I believe life should be lived intentionally.</h2>

          <p className="philosophyQuote">
            “Technology is not just for convenience. It is a tool for
            transformation.”
          </p>

          <div className="philosophyGrid">
            <div className="philosophyText">
              <p>
                I believe wisdom, discipline, faith, and innovation can change
                families, churches, businesses, communities, and nations.
              </p>

              <p>
                I believe people become powerful when they understand purpose,
                build discipline, think clearly, and use their gifts to serve
                others.
              </p>

              <p>
                My work is not only about building websites, apps, systems, or
                brands. It is about building tools and movements that help people
                live with greater order, clarity, impact, and legacy.
              </p>
            </div>

            <div className="philosophyValues">
              {values.map((value) => (
                <span key={value}>{value}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="contactSection">
        <div className="contactCenter">
          <div className="sectionLabel">Contact</div>

          <h2>
            Let us build systems, brands, and movements that create real
            transformation.
          </h2>

          <p className="contactIntro">
            Whether it is a website idea, app concept, business strategy, church
            system, automation plan, brand direction, or transformational project,
            I am open to meaningful conversations and purpose-driven work.
          </p>

          <div className="socialIcons">
            {socialLinks.map((social) => (
              <a
                className="socialIcon"
                href={social.link}
                target={
                  social.name === 'Email' || social.link === '#'
                    ? '_self'
                    : '_blank'
                }
                rel="noreferrer"
                aria-label={social.label}
                title={social.label}
                key={social.name}
              >
                {social.icon}
              </a>
            ))}
          </div>

          <p className="contactHint">
            Click any icon above to connect with me directly.
          </p>
        </div>
      </section>

      <footer className="footer">
        <p>Priest Samuel</p>
        <span>Tech Visionary • Kingdom Builder • Creative Strategist</span>
        <small>
          Building systems, brands, and movements that transform ordinary people
          into giants.
        </small>
      </footer>
    </main>
  )
}

export default App