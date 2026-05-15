// Team.jsx
import React from 'react';
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

// Import image
import teamVisionImage from '../../../../assets/images/assets/solution.png';

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
  return (
    <div className="team-page">
      {/* Hero Section */}
      <section className="team-section team-hero">
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

      {/* Disciplines Section */}
      <section className="team-section team-disciplines">
        <div className="team-container">
          <div className="team-disciplines-card">
            <p className="team-disciplines-intro">With backgrounds spanning:</p>
            <div className="team-tags-grid">
              {disciplines.map((d, i) => (
                <span key={d} className="team-tag">
                  {d}
                </span>
              ))}
            </div>
            <p className="team-disciplines-outro">
              the founding team is building a next-generation intelligence platform designed to unlock human potential at scale.
            </p>
          </div>
        </div>
      </section>

      {/* Belief Section */}
      <section className="team-section team-belief">
        <div className="team-container team-container--two-col">
          <div className="team-belief-text">
            <span className="team-section-eyebrow">Our Belief</span>
            <h2 className="team-section-title">Every individual carries unique potential</h2>
            <p className="team-body-text">
              We believe that every individual carries unique potential, but most people navigate life with fragmented guidance and accidental decisions.
            </p>
            <p className="team-body-text team-body-text--bold">Naavi was created to change that.</p>
            <p className="team-body-text team-body-text--muted">By combining:</p>
            <div className="team-belief-stack">
              {beliefStack.map((b) => (
                <div key={b} className="team-belief-item">
                  <div className="team-belief-icon">
                    <FiZap size={16} />
                  </div>
                  <span>{b}</span>
                </div>
              ))}
            </div>
            <p className="team-body-text">we aim to create a future where growth becomes intelligently navigable.</p>
          </div>

          <div className="team-belief-visual">
            <div className="team-visual-ring team-visual-ring--outer" />
            <div className="team-visual-ring team-visual-ring--middle" />
            <div className="team-visual-ring team-visual-ring--inner" />
            <div className="team-visual-center">
              <FiGlobe size={32} />
              <span>Naavi</span>
            </div>
            {beliefStack.map((b, i) => (
              <div key={b} className={`team-visual-node team-visual-node--${i + 1}`}>
                {b.split(' ').slice(0, 2).join(' ')}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What Drives Us Section */}
      <section className="team-section team-drivers">
        <div className="team-container">
          <div className="team-section-header">
            <span className="team-section-eyebrow">What Drives Us</span>
            <h2 className="team-section-title">The forces that move Naavi forward</h2>
          </div>

          <div className="team-drivers-grid">
            {drivers.map((d, i) => (
              <div key={d} className="team-driver-card">
                <div className="team-driver-card-top">
                  <span className="team-driver-number">{String(i + 1).padStart(2, "0")}</span>
                  <FiArrowRight className="team-driver-arrow" size={20} />
                </div>
                <p className="team-driver-text">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


     {/* Building Beyond Section - Light background */}
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

    <div className="team-beyond-cards">
      {[
        { Icon: FiBox, label: "Infrastructure", color: "#2DB67D" },
        { Icon: FiSun, label: "Intelligence", color: "#4DA6FF" },
        { Icon: FiGlobe, label: "Ecosystem", color: "#FF9500" },
        { Icon: FiCompass, label: "Navigation", color: "#A259FF" },
      ].map(({ Icon, label, color }) => (
        <div key={label} className="team-beyond-card">
          <div className="team-beyond-card-icon" style={{ backgroundColor: `${color}10`, color: color }}>
            <Icon size={28} />
          </div>
          <p className="team-beyond-card-label">{label}</p>
        </div>
      ))}
    </div>
  </div>
</section>

      {/* Looking Ahead Section */}
      <section className="team-section team-naaviverse">
        <div className="team-container team-container--center">
          <span className="team-section-eyebrow">Looking Ahead</span>
          <h2 className="team-section-title">We are building Naavi as a global ecosystem that connects:</h2>
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