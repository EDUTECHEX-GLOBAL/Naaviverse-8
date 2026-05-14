import React, { Fragment, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import Footer from '../../../../components/footernew/index';
import './AboutPage.scss';
const HEADER_OFFSET = 80;
/* SVG Icons */
const CompassIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M12 16L8 8L16 12L12 16Z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
  </svg>
);
                    
const TargetIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="12" cy="12" r="2" fill="currentColor"/>
  </svg>
);

const GlobeIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M2 12H22" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M12 2C14.5013 4.73835 15.9228 8.29203 16 12C15.9228 15.708 14.5013 19.2617 12 22C9.49872 19.2617 8.07725 15.708 8 12C8.07725 8.29203 9.49872 4.73835 12 2Z" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

const BrainIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 4C9.5 4 8 6 8 8C8 10 9.5 11 11 12C8.5 12.5 7 14 7 16.5C7 19 9 20 12 20C15 20 17 19 17 16.5C17 14 15.5 12.5 13 12C14.5 11 16 10 16 8C16 6 14.5 4 12 4Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    <path d="M12 8V12" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

const NetworkIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="4" r="2" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="4" cy="20" r="2" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="20" cy="20" r="2" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M12 6V10" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M6 18L10 14" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M18 18L14 14" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

const ChartIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 21H3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M7 15V21" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M12 10V21" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M17 5V21" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

const RocketIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L12 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M12 19L12 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M5 5L7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M17 17L19 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M16 16L21 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

/* ════════════════════════════════════
   ABOUT PAGE — Single Long Page
════════════════════════════════════ */

const AboutPage = () => {
  // Scroll to section based on URL hash
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const id = hash.replace('#', '');
      setTimeout(() => {
        const element = document.getElementById(id);
       if (element) {
          const top = element.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      }, 120);
    } else {
      window.scrollTo({ top: 0 });
    }
  }, []);

const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
    window.scrollTo({ top, behavior: 'smooth' });
  };
  return (
    <Fragment>
      <Helmet>
        <title>About Naavi — AI-Powered Path Engine</title>
      </Helmet>

     <div className="ab-page" style={{ paddingTop: '80px' }}>

        {/* ── HERO ── */}
        {/* <section className="ab-hero">
          <svg className="ab-grid-bg" aria-hidden="true">
            <defs>
              <pattern id="abgrid" width="56" height="56" patternUnits="userSpaceOnUse">
                <path d="M56 0L0 0 0 56" fill="none" stroke="rgba(45,182,125,0.07)" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#abgrid)" />
          </svg>
          <div className="ab-glow ab-glow-1" />
          <div className="ab-glow ab-glow-2" />

          <div className="ab-hero-inner">
            <div className="ab-hero-text">
              <nav className="ab-breadcrumb">
                <Link to="/">Home</Link>
                <span>/</span>
                <span>About</span>
              </nav>

              <div className="ab-badge">
                <span className="ab-pulse-dot" />
                About Naavi
              </div>

              <h1>
                The World's First<br />
                <em>AI-Powered</em> <strong>Path Engine</strong>
              </h1>

              <p>
                We don't just give you information — we give you <b>direction</b>.
                Naavi transforms confusion into intelligent, personalized navigation.
              </p>

              <div className="ab-hero-btns">
                <Link to="/login" className="ab-btn-green">Get Started Free</Link>
                <button className="ab-btn-ghost" onClick={() => scrollTo('ab-what')}>
                  Explore Our Story ↓
                </button>
              </div>
            </div>

            <div className="ab-hero-vis" aria-hidden="true">
              <svg className="ab-path-svg" viewBox="0 0 420 220" fill="none">
                <path d="M30 185C100 185 80 45 200 45C320 45 300 160 390 110"
                  stroke="#2DB67D" strokeWidth="2.5" strokeDasharray="10 5" opacity="0.55"/>
                <circle cx="30" cy="185" r="7" fill="#2DB67D"/>
                <circle cx="200" cy="45" r="5" fill="#2DB67D" opacity="0.55"/>
                <circle cx="390" cy="110" r="7" fill="#2DB67D"/>
              </svg>

              <div className="ab-fcard ab-fcard-1">
                <span className="ab-fcdot" style={{background:'#2DB67D'}} />
                <div>
                  <p>Smart Career Path</p>
                  <div className="ab-fcbar"><div style={{width:'78%',background:'#2DB67D'}} /></div>
                </div>
              </div>
              <div className="ab-fcard ab-fcard-2">
                <span className="ab-fcdot" style={{background:'#4DA6FF'}} />
                <div>
                  <p>Skill Roadmap</p>
                  <div className="ab-fcbar"><div style={{width:'62%',background:'#4DA6FF'}} /></div>
                </div>
              </div>
              <div className="ab-fcard ab-fcard-3">
                <span className="ab-fcdot" style={{background:'#FF9500'}} />
                <div>
                  <p>Global Opportunities</p>
                  <div className="ab-fcbar"><div style={{width:'91%',background:'#FF9500'}} /></div>
                </div>
              </div>
            </div>
          </div>
        </section> */}

        {/* ── WHAT IS NAAVI ── */}
        <section id="ab-what" className="ab-section ab-alt-white">
          <div className="ab-container">
            <div className="ab-row">
              <div className="ab-col-vis">
                <div className="ab-path-card">
                  <div className="ab-pc-head">
                    <span className="ab-pc-dot" />
                    <span>Your Path Engine</span>
                    <span className="ab-pc-live">LIVE</span>
                  </div>
                  {[
                    { label: 'Passion & Interests',  done: true  },
                    { label: 'Skill Assessment',     done: true  },
                    { label: 'Pathway Generation',   done: true  },
                    { label: 'Mentor Connect',       active: true },
                    { label: 'Opportunity Mapping',  done: false },
                  ].map((s, i) => (
                    <div key={i} className={`ab-pc-row ${s.done?'done':''} ${s.active?'active':''}`}>
                      <span className="ab-pc-circle" />
                      <span>{s.label}</span>
                      {s.done && <span className="ab-checkmark">✓</span>}
                      {s.active && <span className="ab-ping" />}
                    </div>
                  ))}
                </div>
              </div>

              <div className="ab-col-txt">
                
                <h2>What is <span className="ab-green">Naavi?</span></h2>
                <p className="ab-lead">
                  Naavi is the world's first AI-powered Path Engine that helps people navigate
                  personalized education, skill, and career pathways aligned with their passion
                  and future potential.
                </p>
                <div className="ab-pills">
                  {['Smart Path Guidance','Learning Roadmaps','Expert Insights','Real-time Adaptation'].map(t => (
                    <span key={t} className="ab-pill">{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── OUR VISION ── */}
        <section id="ab-vision" className="ab-section ab-alt-soft">
          <div className="ab-container">
            <div className="ab-row ab-row-rev">
              <div className="ab-col-txt">
               
                <h2>Our <span className="ab-green">Vision</span></h2>
                <p className="ab-lead">
                  To build the intelligence layer for human growth — where every individual can
                  navigate toward their highest potential with clarity, purpose, and opportunity.
                </p>
               
                
              </div>

              <div className="ab-col-vis">
                <div className="ab-rings">
                  <div className="ab-ring ab-r1" />
                  <div className="ab-ring ab-r2" />
                  <div className="ab-ring-core">
                    <BrainIcon />
                    <p>Human<br/>Growth</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── WHY NAAVI ── */}
        <section id="ab-why" className="ab-section ab-alt-white">
          <div className="ab-container">
            <div className="ab-center-hd">
             
              <h2>Why <span className="ab-green">Naavi</span></h2>
              <p>Because the world gives people information, but not direction.Naavi transforms confusion into intelligent navigation through AI-powered personalized pathways.</p>
            </div>
          </div>
        </section>

        {/* ── THE NAVIGATION PROBLEM ── */}
        <section id="ab-problem" className="ab-section ab-alt-soft">
          <div className="ab-container">
            <div className="ab-row">
              <div className="ab-col-txt">
               
                <h2>The Navigation <span className="ab-green">Problem</span></h2>
                <p className="ab-lead">
                 Millions of students and professionals make life-changing decisions with limited guidance, outdated systems, and fragmented information. Naavi solves this with dynamic pathway intelligence.
                </p>
               
                
              </div>

            </div>
          </div>
        </section>

        {/* ── PATHWAY INTELLIGENCE ── */}
        <section id="ab-intel" className="ab-section ab-alt-white">
          <div className="ab-container">
            <div className="ab-center-hd">
             
              <h2>Pathway <span className="ab-green">Intelligence</span></h2>
              <p>
                Naavi combines AI, Knowledge Graphs, and real-world human journeys to generate
                adaptive pathways made of Macro, Micro, and Nano steps.
              </p>
            </div>

            <div className="ab-tech-row">
              <div className="ab-tech-card" style={{'--tc': '#4DA6FF'}}>
                <div className="ab-tc-icon"><BrainIcon /></div>
                <h4>Large Language Models</h4>
                <p>Conversational intelligence for pathway generation, predictive reasoning, and guidance at scale.</p>
              </div>
              <div className="ab-tech-card" style={{'--tc': '#2DB67D'}}>
                <div className="ab-tc-icon"><NetworkIcon /></div>
                <h4>Knowledge Graphs</h4>
                <p>Connecting skills, careers, universities, industries, mentors, and opportunities in living context.</p>
              </div>
              <div className="ab-tech-card" style={{'--tc': '#FF9500'}}>
                <div className="ab-tc-icon"><ChartIcon /></div>
                <h4>GraphRAG Framework</h4>
                <p>Retrieval-augmented generation over knowledge graphs for explainable, future-aware pathways.</p>
              </div>
            </div>


          </div>
        </section>

        {/* ── MISSION & PHILOSOPHY ── */}
        <section id="ab-mission" className="ab-section ab-alt-soft">
          <div className="ab-container">
            <div className="ab-row ab-row-rev">
              <div className="ab-col-txt">
                <h2>Mission &amp; <span className="ab-green">Philosophy</span></h2>
                <p className="ab-lead">
                  We believe human potential should never be accidental. Naavi exists to align
                  passion, skills, education, and opportunity into meaningful life journeys.
                </p>
                
                <div className="ab-belief-list">
                  <h5>We Believe In</h5>
                  <ul>
                    <li>Democratized access to opportunity</li>
                    <li>AI as a force for human empowerment</li>
                    <li>Purpose-driven education for all</li>
                    <li>Passion aligned with real-world opportunity</li>
                  </ul>
                </div>
              </div>

              <div className="ab-col-vis">
                <div className="ab-orbit-wrap">
                  <div className="ab-orbit-ring ab-or1" />
                  <div className="ab-orbit-ring ab-or2" />
                  <div className="ab-orbit-core">
                    <span>🧠</span>
                    <p>Human<br/>Potential</p>
                  </div>
                  <div className="ab-orbit-node" style={{left:'35%', top:'15%'}}>
                    <span>❤️</span><p>Passion</p>
                  </div>
                  <div className="ab-orbit-node" style={{left:'65%', top:'15%'}}>
                    <span>⚙️</span><p>Skills</p>
                  </div>
                  <div className="ab-orbit-node" style={{left:'65%', top:'85%'}}>
                    <span>📚</span><p>Education</p>
                  </div>
                  <div className="ab-orbit-node" style={{left:'35%', top:'85%'}}>
                    <span>🌟</span><p>Opportunity</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── NAAVIVERSE ── */}
        <section id="ab-verse" className="ab-section ab-alt-white">
          <div className="ab-container">
            <div className="ab-row">
              <div className="ab-col-vis">
                <div className="ab-verse-wrap">
                  <div className="ab-verse-center">Naaviverse</div>
                  <div className="ab-verse-node" style={{left:'35%', top:'15%', animationDelay:'0s'}}>Students</div>
                  <div className="ab-verse-node" style={{left:'65%', top:'15%', animationDelay:'0.25s'}}>Institutions</div>
                  <div className="ab-verse-node" style={{left:'75%', top:'50%', animationDelay:'0.5s'}}>Employers</div>
                  <div className="ab-verse-node" style={{left:'65%', top:'85%', animationDelay:'0.75s'}}>Mentors</div>
                  <div className="ab-verse-node" style={{left:'35%', top:'85%', animationDelay:'1s'}}>Skills</div>
                  <div className="ab-verse-node" style={{left:'25%', top:'50%', animationDelay:'1.25s'}}>Pathways</div>
                  <div className="ab-verse-ring ab-vr1"/>
                  <div className="ab-verse-ring ab-vr2"/>
                </div>
              </div>

              <div className="ab-col-txt">
                
                <h2><span className="ab-green">Naaviverse</span></h2>
                <p className="ab-lead">
                  The Naaviverse is a living ecosystem of pathways, people, skills, mentors,
                  institutions, and opportunities — continuously evolving through collective
                  human intelligence.
                </p>
               
                
              </div>
            </div>
          </div>
        </section>

      </div>

      <Footer />
    </Fragment>
  );
};

export default AboutPage;