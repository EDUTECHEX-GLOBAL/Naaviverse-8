import React, { useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import {
  FiZap,
  FiSun,
  FiGlobe,
  FiBox,
  FiArrowRight,
  FiCpu,
  FiUsers,
  FiCompass,
} from 'react-icons/fi';
import './Team.scss';
import Footer from '../../../../components/footernew/index';
import buildingBeyondImg from './images/building beyond.png';
import teamVisionImage from '../../../../assets/images/assets/solution.png';
import ndustryImg from './images/ndustry.png';
const HEADER_OFFSET = 80;

const disciplines = [
  "Artificial Intelligence",
  "Deep Technology",
  "Education",
  "Research",
  "Human Development",
  "Innovation Ecosystems",
];

const beliefStack = [
  "AI-powered reasoning",
  "Pathway intelligence",
  "Knowledge graphs",
  "Real-world human journeys",
];

const drivers = [
  "Democratizing access to opportunity",
  "Aligning passion with purpose",
  "Building future-ready ecosystems",
  "Creating intelligent pathways for human growth",
  "Empowering the next generation through AI",
];

const ecosystem = [
  "people",
  "pathways",
  "mentors",
  "institutions",
  "industries",
  "future opportunities",
];

const Team = () => {
  const { section } = useParams();
  const location = useLocation();

  // Map URL params to section IDs
  const getSectionId = (sectionName) => {
    const mapping = {
      'founders': 'team-founders',
      'leadership': 'team-leadership',
      'advisors': 'team-advisors',
      'careers': 'team-careers'
    };
    return mapping[sectionName] || null;
  };

  // Scroll to section when URL param changes
  useEffect(() => {
    if (section) {
      const sectionId = getSectionId(section);
      if (sectionId) {
        setTimeout(() => {
          const element = document.getElementById(sectionId);
          if (element) {
            const top = element.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
            window.scrollTo({ top, behavior: 'smooth' });
          }
        }, 120);
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [section, location.pathname]);

  return (
    <div className="team-page">
      {/* Hero Section - Founders Section */}
      <section id="team-founders" className="team-section team-hero">
        <div className="team-container">
          <div className="team-hero-content">
            <span className="team-hero-tag">MEET THE FOUNDERS</span>
            <h1 className="team-hero-title">
              Building the future of <span className="team-accent">human navigation</span>
            </h1>
            <p className="team-hero-desc">
              Naavi is founded by a multidisciplinary team driven by a shared vision to redefine how people navigate education, skills, careers, and future opportunities.
            </p>
          </div>
        </div>
      </section>

      {/* Leadership Section */}
      <section id="team-leadership" className="team-section team-disciplines">
        <div className="team-container">
          <div className="team-disciplines-card">
            <h3 className="team-section-subtitle">Our Leadership</h3>
            <p className="team-disciplines-intro">With backgrounds spanning:</p>
            <div className="team-tags-grid">
              {disciplines.map((d, i) => (
                <span key={d} className="team-tag">{d}</span>
              ))}
            </div>
            <p className="team-disciplines-outro">
              the leadership team is building a next-generation intelligence platform designed to unlock human potential at scale.
            </p>
          </div>
        </div>
      </section>

          {/* Advisors Section */}
      <section id="team-advisors" className="team-section team-belief">
        <div className="team-container team-container--two-col">
          <div className="team-belief-text">
            <span className="team-section-eyebrow">Our Advisors</span>
            <h2 className="team-section-title">Guided by industry experts</h2>
            <p className="team-body-text">
              We believe that every individual carries unique potential, but most people navigate life with fragmented guidance and accidental decisions.
            </p>
            <p className="team-body-text team-body-text--bold">Naavi was created to change that.</p>
            <p className="team-body-text team-body-text--muted">By combining:</p>
            <div className="team-belief-stack">
              {beliefStack.map((b) => (
                <div key={b} className="team-belief-item">
                  <div className="team-belief-icon"><FiZap size={16} /></div>
                  <span>{b}</span>
                </div>
              ))}
            </div>
            <p className="team-body-text">we aim to create a future where growth becomes intelligently navigable.</p>
          </div>

          <div className="team-belief-visual">
            <img 
              src={ndustryImg} 
              alt="Industry ecosystem" 
              className="team-ndustry-image"
            />
          </div>
        </div>
      </section>

     {/* What Drives Us Section */}
<section className="team-section team-drivers">
  <div className="team-container">
    <div className="team-drivers-layout">
      <div className="team-drivers-left">
        <span className="team-section-eyebrow">What Drives Us</span>
        <h2 className="team-section-title">The forces that move Naavi forward</h2>
        <div className="team-drivers-list">
          {drivers.map((d, i) => (
            <div key={d} className="team-driver-row">
              <div className="team-driver-circle">{i + 1}</div>
              <div className="team-driver-content">
                <p className="team-driver-title">{d}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="team-drivers-right">
        <div className="team-drivers-vis">
          <div className="team-drivers-orb team-drivers-orb-1" />
          <div className="team-drivers-orb team-drivers-orb-2" />
          <svg viewBox="0 0 280 280" className="team-drivers-svg">
            {/* Gears */}
            <circle cx="160" cy="120" r="72" fill="#FFF9E5" stroke="#FFD166" strokeWidth="2"/>
            <circle cx="160" cy="120" r="52" fill="none" stroke="#FFD166" strokeWidth="1.5" strokeDasharray="6 4"/>
            <circle cx="160" cy="120" r="28" fill="#FFD166" opacity="0.3"/>
            {/* Gear teeth */}
            {[0,30,60,90,120,150,180,210,240,270,300,330].map((angle, i) => (
              <rect
                key={i}
                x="155" y="43"
                width="10" height="16"
                rx="3"
                fill="#FFD166"
                transform={`rotate(${angle} 160 120)`}
              />
            ))}
            {/* Lightbulb */}
            <circle cx="160" cy="112" r="18" fill="none" stroke="#E05C5C" strokeWidth="1.8"/>
            <path d="M152 120 Q152 132 160 136 Q168 132 168 120" fill="none" stroke="#E05C5C" strokeWidth="1.8"/>
            <line x1="155" y1="138" x2="165" y2="138" stroke="#E05C5C" strokeWidth="1.8"/>
            <line x1="156" y1="142" x2="164" y2="142" stroke="#E05C5C" strokeWidth="1.8"/>
            {/* Small gear */}
            <circle cx="84" cy="155" r="38" fill="#E8F4FF" stroke="#4DA6FF" strokeWidth="1.5"/>
            <circle cx="84" cy="155" r="22" fill="none" stroke="#4DA6FF" strokeWidth="1" strokeDasharray="4 3"/>
            {[0,45,90,135,180,225,270,315].map((angle, i) => (
              <rect
                key={i}
                x="80" y="112"
                width="8" height="12"
                rx="2"
                fill="#4DA6FF"
                transform={`rotate(${angle} 84 155)`}
              />
            ))}
            {/* Person */}
            <circle cx="118" cy="205" r="12" fill="#2DB67D" opacity="0.8"/>
            <path d="M106 240 Q118 220 130 240" fill="#2DB67D" opacity="0.6"/>
            <line x1="118" y1="217" x2="118" y2="245" stroke="#2DB67D" strokeWidth="2.5" opacity="0.7"/>
            <line x1="108" y1="228" x2="128" y2="228" stroke="#2DB67D" strokeWidth="2.5" opacity="0.7"/>
            {/* Connecting line person to gear */}
            <path d="M128 218 Q145 190 150 160" fill="none" stroke="#2DB67D" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.4"/>
          </svg>
        </div>
      </div>
    </div>
  </div>
</section>

      {/* Building Beyond Section */}
      <section className="team-section team-beyond">
        <div className="team-container team-container--two-col">
          <div className="team-beyond-text">
            <span className="team-beyond-badge">BUILDING BEYOND EDTECH</span>
            <h2 className="team-beyond-title">Naavi is not just a platform.</h2>
            <p className="team-beyond-sub">It is the foundation of a new category:</p>
            <p className="team-beyond-highlight">AI-powered human navigation infrastructure.</p>
            <p className="team-beyond-body">
              The founders envision a world where every learner, professional, and institution can navigate toward meaningful futures with clarity, intelligence, and confidence.
            </p>
          </div>
          <div className="team-beyond-image">
            <img src={buildingBeyondImg} alt="Building Beyond EdTech" className="team-beyond-img" />
          </div>
        </div>
      </section>

      {/* Careers Section */}
      <section id="team-careers" className="team-section team-naaviverse">
        <div className="team-container team-container--center">
          <span className="team-section-eyebrow">Careers at Naavi</span>
          <h2 className="team-section-title">Join us in building a global ecosystem that connects:</h2>
          <div className="team-ecosystem-tags">
            {ecosystem.map((e) => (
              <span key={e} className="team-ecosystem-tag">{e}</span>
            ))}
          </div>
          <p className="team-naaviverse-outro">
            into one intelligent, evolving universe —{' '}
            <span className="team-naaviverse-highlight">the Naaviverse.</span>
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Team;