import React, { useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Helmet } from "react-helmet-async";
import { HiOutlineUserGroup } from "react-icons/hi2";
import './Team.scss';
import Footer from '../../../../components/footernew/index';
import buildingBeyondImg from './images/Building.webp';
import ndustryImg from './images/naavi_advisors.gif';
import whatDrivesUsImg from './images/what drives us.webp';

const HEADER_OFFSET = 100;

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

const Team = () => {
  const { section } = useParams();
  const location = useLocation();

  const getSectionId = (sectionName) => {
    const mapping = {
      'founders': 'team-founders',
      'leadership': 'team-leadership',
      'advisors': 'team-advisors',
      'careers': 'team-careers'
    };
    return mapping[sectionName] || null;
  };

  useEffect(() => {
    if (section) {
      const sectionId = getSectionId(section);
      if (sectionId) {
        const scrollToTarget = () => {
          const element = document.getElementById(sectionId);
          if (element) {
            // scrollIntoView is scroll-container-agnostic; header offset via scroll-margin-top in CSS
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        };
        const timer1 = setTimeout(scrollToTarget, 80);
        const timer2 = setTimeout(scrollToTarget, 400);
        return () => {
          clearTimeout(timer1);
          clearTimeout(timer2);
        };
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [section, location.pathname, location.key]);

  return (
    <>
      <Helmet>
        <title>Meet the Team | Naavi Network - AI Powered Path Engine</title>
        <meta
          name="description"
          content="Meet the founders, leadership team and advisors behind Naavi Network. Learn how our multidisciplinary experts are building the world's AI Powered Path Engine for education, careers and human potential."
        />
        <meta
          name="keywords"
          content="Naavi Team, Naavi Founders, Leadership Team, AI Experts, Education Technology, Career Navigation, Artificial Intelligence, Naavi Network"
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://naavinetwork.ai/team" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Naavi Network" />
        <meta property="og:title" content="Meet the Team | Naavi Network" />
        <meta
          property="og:description"
          content="Discover the founders, leadership and advisors building Naavi Network's AI Powered Path Engine."
        />
        <meta property="og:url" content="https://naavinetwork.ai/team" />
        <meta property="og:image" content="https://naavinetwork.ai/logo512.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Meet the Team | Naavi Network" />
        <meta
          name="twitter:description"
          content="Meet the multidisciplinary team building AI-powered personalized navigation for education and careers."
        />
        <meta name="twitter:image" content="https://naavinetwork.ai/logo512.png" />
      </Helmet>

      <div className="team-page">
        {/* Hero Section - Founders */}
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
        <section id="team-leadership" className="team-section">
          <div className="team-container">
            <div className="team-card-section team-card-section--leadership">
              <div className="team-leadership-content">
                <div className="team-icon-badge">
                  <HiOutlineUserGroup size={22} />
                </div>
                <h2 className="team-card-title">Our Leadership</h2>
                <p className="team-card-subtitle">With backgrounds spanning:</p>
                <div className="team-tags-grid">
                  {disciplines.map((d) => (
                    <span key={d} className="team-tag">{d}</span>
                  ))}
                </div>
                <p className="team-card-outro">
                  The leadership team is building a next-generation intelligence platform designed to unlock human potential at scale.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Advisors Section */}
        <section id="team-advisors" className="team-section">
          <div className="team-container">
            <div className="team-card-section team-card-section--advisors">
              <div className="team-card-grid">
                <div className="team-card-left">
                  <span className="team-section-eyebrow">OUR ADVISORS</span>
                  <h2 className="team-card-title">Guided by industry experts</h2>
                  <p className="team-body-text">
                    We believe that every individual carries unique potential, but most people navigate life with fragmented guidance and accidental decisions.
                  </p>
                  <p className="team-body-quote">Naavi was created to change that.</p>
                  <p className="team-body-text">
                    We aim to create a future where growth becomes intelligently navigable.
                  </p>
                </div>
                <div className="team-card-right">
                  <div className="team-diagram-box">
                    <img
                      src={ndustryImg}
                      alt="Naavi industry ecosystem diagram"
                      className="team-diagram-img"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What Drives Us Section */}
        <section className="team-section">
          <div className="team-container">
            <div className="team-card-section team-card-section--drivers">
              <div className="team-card-grid">
                <div className="team-card-left">
                  <span className="team-section-eyebrow">WHAT DRIVES US</span>
                  <h2 className="team-card-title">The forces that move Naavi forward</h2>
                  <div className="team-drivers-list">
                    {drivers.map((d, i) => (
                      <div key={d} className="team-driver-row">
                        <div className="team-driver-circle">{i + 1}</div>
                        <p className="team-driver-title">{d}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="team-card-right">
                  <img
                    src={whatDrivesUsImg}
                    alt="What drives us illustration"
                    className="team-drives-img"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Building Beyond Section */}
        <section className="team-section">
          <div className="team-container">
            <div className="team-card-section team-card-section--beyond">
              <div className="team-card-grid">
                <div className="team-card-left">
                  <span className="team-beyond-badge">BUILDING BEYOND EDTECH</span>
                  <h2 className="team-card-title">Naavi is not just a platform.</h2>
                  <p className="team-beyond-sub">It is the foundation of a new category:</p>
                  <p className="team-beyond-highlight">AI-powered human navigation infrastructure.</p>
                  <p className="team-beyond-body">
                    The founders envision a world where every learner, professional, and institution can navigate toward meaningful futures with clarity, intelligence, and confidence.
                  </p>
                </div>
                <div className="team-card-right">
                  <img
                    src={buildingBeyondImg}
                    alt="Building Beyond EdTech illustration"
                    className="team-illustration-img"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default Team;
