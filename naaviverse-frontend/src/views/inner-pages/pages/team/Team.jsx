import React from 'react';
import { FiZap, FiSun, FiGlobe, FiBox, FiArrowRight } from 'react-icons/fi';
import './Team.scss';
import Footer from '../../../../components/footernew/index';

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

function NetworkBackdrop() {
  return (
    <div aria-hidden="true" className="team-backdrop">
      <svg className="team-backdrop__grid" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="team-grid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#2DB67D" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#team-grid)" />
      </svg>
      <div className="team-backdrop__blob team-backdrop__blob--1" />
      <div className="team-backdrop__blob team-backdrop__blob--2" />
      <div className="team-backdrop__blob team-backdrop__blob--3" />
    </div>
  );
}

function PageHeader({ title, crumb }) {
  return (
    <div className="team-page-header">
      <div className="team-container">
        <span className="team-page-header__crumb">{crumb}</span>
        <h1 className="team-page-header__title">{title}</h1>
      </div>
    </div>
  );
}

function SectionHeading({ eyebrow, title, sub, center }) {
  return (
    <div className={`team-section-heading ${center ? 'team-section-heading--center' : ''}`}>
      <span className="team-section-heading__eyebrow">{eyebrow}</span>
      <h2 className="team-section-heading__title">{title}</h2>
      {sub && <p className="team-section-heading__sub">{sub}</p>}
    </div>
  );
}

const Team = () => {
  return (
    <div className="team-page">
      <PageHeader title="Founders" crumb="TEAM" />

      {/* Founders Section */}
      <section className="team-section team-section--founders">
        <NetworkBackdrop />
        <div className="team-container">
          <SectionHeading
           
            title="Building the Future of Human Navigation"
            sub="Naavi is founded by a multidisciplinary team driven by a shared vision to redefine how people navigate education, skills, careers, and future opportunities."
          />
          <div className="team-disciplines-card">
            <p className="team-disciplines-card__intro">With backgrounds spanning:</p>
            <div className="team-disciplines-card__tags">
              {disciplines.map((d, i) => (
                <span
                  key={d}
                  className="team-tag"
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  {d}
                </span>
              ))}
            </div>
            <p className="team-disciplines-card__outro">
              the founding team is building a next-generation intelligence platform designed to unlock human potential at scale.
            </p>
          </div>
        </div>
      </section>

      {/* Belief Section */}
      <section className="team-section team-section--belief">
        <div className="team-container team-container--grid">
          <div className="team-belief-text">
            <SectionHeading
              eyebrow="Our Belief"
              title="Every individual carries unique potential"
            />
            <p className="team-body-text">
              We believe that every individual carries unique potential, but most people navigate life with fragmented guidance and accidental decisions.
            </p>
            <p className="team-body-text team-body-text--bold">
              Naavi was created to change that.
            </p>
            <p className="team-body-text team-body-text--muted">By combining:</p>
            <ul className="team-belief-stack">
              {beliefStack.map((b) => (
                <li key={b} className="team-belief-stack__item">
                  <span className="team-belief-stack__icon">
                    <FiZap size={18} />
                  </span>
                  <span className="team-belief-stack__label">{b}</span>
                </li>
              ))}
            </ul>
            <p className="team-body-text">
              we aim to create a future where growth becomes intelligently navigable.
            </p>
          </div>

          <div className="team-belief-visual">
            <div className="team-belief-visual__orbit team-belief-visual__orbit--1" />
            <div className="team-belief-visual__orbit team-belief-visual__orbit--2" />
            <div className="team-belief-visual__orbit team-belief-visual__orbit--3" />
            <div className="team-belief-visual__center">
              <FiGlobe size={40} />
              <span>Naavi</span>
            </div>
            {beliefStack.map((b, i) => (
              <div key={b} className={`team-belief-visual__node team-belief-visual__node--${i + 1}`}>
                {b.split(' ').slice(0, 2).join(' ')}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What Drives Us Section */}
      <section className="team-section team-section--drivers">
        <NetworkBackdrop />
        <div className="team-container">
          <SectionHeading
            eyebrow="What Drives Us"
            title="The forces that move Naavi forward"
          />
          <div className="team-drivers-grid">
            {drivers.map((d, i) => (
              <div key={d} className="team-driver-card">
                <div className="team-driver-card__top">
                  <span className="team-driver-card__number">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <FiArrowRight className="team-driver-card__arrow" size={22} />
                </div>
                <p className="team-driver-card__text">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Building Beyond Section */}
      <section className="team-section team-section--beyond">
        <div className="team-section--beyond__blobs">
          <div className="team-section--beyond__blob team-section--beyond__blob--1" />
          <div className="team-section--beyond__blob team-section--beyond__blob--2" />
        </div>
        <div className="team-container team-container--grid">
          <div className="team-beyond-text">
            <span className="team-beyond-badge">BUILDING BEYOND EDTECH</span>
            <h2 className="team-beyond-title">Naavi is not just a platform.</h2>
            <p className="team-beyond-sub">It is the foundation of a new category:</p>
            <p className="team-beyond-highlight">
              AI-powered human navigation infrastructure.
            </p>
            <p className="team-beyond-body">
              The founders envision a world where every learner, professional, and institution can navigate toward meaningful futures with clarity, intelligence, and confidence.
            </p>
          </div>

          <div className="team-beyond-cards">
            {[
              { Icon: FiBox,    label: "Infrastructure" },
              { Icon: FiSun,   label: "Intelligence"   },
              { Icon: FiGlobe, label: "Ecosystem"      },
              { Icon: FiZap,   label: "Navigation"     },
            ].map(({ Icon, label }, i) => (
              <div
                key={label}
                className="team-beyond-card"
                style={{ transform: i % 2 === 0 ? 'translateY(20px)' : 'translateY(-10px)' }}
              >
                <Icon size={32} className="team-beyond-card__icon" />
                <p className="team-beyond-card__label">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Looking Ahead / Naaviverse Section */}
      <section className="team-section team-section--naaviverse">
        <NetworkBackdrop />
        <div className="team-container team-container--center">
          <SectionHeading
            center
            eyebrow="Looking Ahead"
            
            sub="We are building Naavi as a global ecosystem that connects:"
          />
          <div className="team-ecosystem-tags">
            {ecosystem.map((e) => (
              <span key={e} className="team-ecosystem-tag">{e}</span>
            ))}
          </div>
          <p className="team-naaviverse-outro">
            into one intelligent, evolving universe —{' '}
            <span className="team-naaviverse-outro__highlight">the Naaviverse.</span>
          </p>
        </div>
      </section>
    <Footer />
    </div>
  );
};

export default Team;