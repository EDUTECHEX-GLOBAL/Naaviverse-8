import React, { useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Helmet } from "react-helmet-async";
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
import buildingBeyondImg from './images/Building.png';
import teamVisionImage from '../../../../assets/images/assets/solution.png';
import ndustryImg from './images/naavi_advisors.gif';
import whatDrivesUsImg from './images/what drives us.png';
const HEADER_OFFSET = 80;

const disciplines = [
  "Artificial Intelligence",
  "Deep Technology",
  "Education",
  "Research",
  "Human Development",
  "Innovation Ecosystems",
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
    <>
      <Helmet>
        <title>
          Meet the Team | Naavi Network - AI Powered Path Engine
        </title>

        <meta
          name="description"
          content="Meet the founders, leadership team and advisors behind Naavi Network. Learn how our multidisciplinary experts are building the world's AI Powered Path Engine for education, careers and human potential."
        />

        <meta
          name="keywords"
          content="Naavi Team, Naavi Founders, Leadership Team, AI Experts, Education Technology, Career Navigation, Artificial Intelligence, Naavi Network"
        />

        <meta
          name="robots"
          content="index, follow"
        />

        <link
          rel="canonical"
          href="https://naavinetwork.ai/team"
        />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Naavi Network" />
        <meta
          property="og:title"
          content="Meet the Team | Naavi Network"
        />
        <meta
          property="og:description"
          content="Discover the founders, leadership and advisors building Naavi Network's AI Powered Path Engine."
        />
        <meta
          property="og:url"
          content="https://naavinetwork.ai/team"
        />
        <meta
          property="og:image"
          content="https://naavinetwork.ai/logo512.png"
        />

        {/* Twitter */}
        <meta
          name="twitter:card"
          content="summary_large_image"
        />
        <meta
          name="twitter:title"
          content="Meet the Team | Naavi Network"
        />
        <meta
          name="twitter:description"
          content="Meet the multidisciplinary team building AI-powered personalized navigation for education and careers."
        />
        <meta
          name="twitter:image"
          content="https://naavinetwork.ai/logo512.png"
        />
      </Helmet>

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
              The leadership team is building a next-generation intelligence platform designed to unlock human potential at scale.
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
            <p className="team-body-text team-body-quote">Naavi was created to change that.</p>

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
                    <p className="team-driver-title">{d}</p>
                  </div>

                ))}
              </div>
            </div>
            <div className="team-drivers-right">
              <div className="team-drivers-vis" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
              }}>
                <img
                  src={whatDrivesUsImg}
                  alt="What drives us"
                  style={{
                    width: '100%',
                    maxWidth: '550px',  // 👈 increased size
                    height: 'auto',
                  }}
                />
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


      <Footer />
      </div>
    </>
  );
};

export default Team;