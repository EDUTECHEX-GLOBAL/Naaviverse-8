import React, { Fragment, useEffect } from 'react';
import { Helmet } from "react-helmet-async";
import { useParams, useLocation } from 'react-router-dom';
import Footer from '../../../../components/footernew/index';
import './AboutPage.scss';

import whatImg from './images/What is naavi.png';
import naaviverseImg from './images/Naaviverse.png';
import visionImg from './images/Our Vision.png';
import navigationProblemImg from './images/Navigation Problem.png';
import missionImg from './images/Mission and Philosophy.png';

const HEADER_OFFSET = 80;

/* SVG Icons */
const BrainIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 4C9.5 4 8 6 8 8C8 10 9.5 11 11 12C8.5 12.5 7 14 7 16.5C7 19 9 20 12 20C15 20 17 19 17 16.5C17 14 15.5 12.5 13 12C14.5 11 16 10 16 8C16 6 14.5 4 12 4Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <path d="M12 8V12" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const NetworkIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="4" r="2" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="4" cy="20" r="2" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="20" cy="20" r="2" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M12 6V10" stroke="currentColor" strokeWidth="1.5" />
    <path d="M6 18L10 14" stroke="currentColor" strokeWidth="1.5" />
    <path d="M18 18L14 14" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const ChartIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 21H3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M7 15V21" stroke="currentColor" strokeWidth="1.5" />
    <path d="M12 10V21" stroke="currentColor" strokeWidth="1.5" />
    <path d="M17 5V21" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const AboutPage = () => {
  const { section } = useParams();
  const location = useLocation();

  // Map URL params to section IDs
  const getSectionId = (sectionName) => {
    const mapping = {
      'what-is-naavi': 'ab-what',
      'our-vision': 'ab-vision',
      'why-naavi': 'ab-why',
      'navigation-problem': 'ab-problem',
      'pathway-intelligence': 'ab-intel',
      'mission-philosophy': 'ab-mission',
      'naaviverse': 'ab-verse'
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
    <Fragment>
      <Helmet>
        <title>About Naavi Network | AI Powered Path Engine</title>
        <meta
          name="description"
          content="Learn about Naavi Network, the world's AI Powered Path Engine helping students and professionals navigate personalized education, career and life pathways using artificial intelligence."
        />
        <meta
          name="keywords"
          content="About Naavi Network, AI Path Engine, Education Technology, Career Guidance, AI Navigation Platform, Personalized Career Paths, Naaviverse"
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://naavinetwork.ai/about" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Naavi Network" />
        <meta property="og:title" content="About Naavi Network | AI Powered Path Engine" />
        <meta property="og:description" content="Discover the vision, mission and technology behind Naavi Network's AI-powered personalized pathway platform." />
        <meta property="og:url" content="https://naavinetwork.ai/about" />
        <meta property="og:image" content="https://naavinetwork.ai/logo512.png" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="About Naavi Network | AI Powered Path Engine" />
        <meta name="twitter:description" content="Learn how Naavi Network is transforming education and career navigation using AI-powered pathway intelligence." />
        <meta name="twitter:image" content="https://naavinetwork.ai/logo512.png" />
      </Helmet>

      <div className="ab-page">

        {/* ── WHAT IS NAAVI ── */}
        <section id="ab-what" className="ab-section ab-alt-white">
          <div className="ab-container">
            <div className="ab-grid ab-grid--img-left">
              <div className="ab-grid__visual">
                <img src={whatImg} alt="What is Naavi" className="ab-img" />
              </div>
              <div className="ab-grid__text">
                <h2 className="ab-heading">
                  What is <span className="ab-green">Naavi?</span>
                </h2>
                <p className="ab-body">
                  Naavi is the world's first AI-powered Path Engine that helps people navigate
                  personalized education, skill, and career pathways aligned with their passion
                  and future potential.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section id="ab-vision" className="ab-section ab-alt-soft">
          <div className="ab-container">
            <div className="ab-grid ab-grid--img-right">
              <div className="ab-grid__text">
                <h2 className="ab-heading">
                  Our <span className="ab-green">Vision</span>
                </h2>
                <p className="ab-body">
                  To build the intelligence layer for human growth where every individual can
                  navigate toward their highest potential with clarity, purpose, and opportunity.
                </p>
              </div>
              <div className="ab-grid__visual">
                <img src={visionImg} alt="Our Vision" className="ab-img ab-img--vision" />
              </div>
            </div>
          </div>
        </section>

        {/* ── WHY NAAVI ── */}
        <section id="ab-why" className="ab-section ab-section--why">
          <div className="ab-container">
            <div className="ab-center-block">
              <h2 className="ab-heading ab-heading--center">
                Why <span className="ab-green">Naavi</span>
              </h2>
              <p className="ab-body ab-body--center">
                Because the world gives people information, but not direction. Naavi transforms
                confusion into intelligent navigation through AI-powered personalized pathways.
              </p>
            </div>
          </div>
        </section>

        {/* ── THE NAVIGATION PROBLEM ── */}
        <section id="ab-problem" className="ab-section ab-alt-soft">
          <div className="ab-container">
            <div className="ab-grid ab-grid--img-right">
              <div className="ab-grid__text">
                <h2 className="ab-heading">
                  The Navigation <span className="ab-green">Problem</span>
                </h2>
                <p className="ab-body">
                  Millions of students and professionals make life changing decisions with limited guidance, outdated systems, and fragmented information. Naavi solves this with dynamic pathway intelligence.
                </p>
              </div>
              <div className="ab-grid__visual">
                <img src={navigationProblemImg} alt="The Navigation Problem" className="ab-img ab-img--problem" />
              </div>
            </div>
          </div>
        </section>

        {/* ── PATHWAY INTELLIGENCE ── */}
        <section id="ab-intel" className="ab-section ab-alt-white">
          <div className="ab-container">
            <div className="ab-center-block">
              <h2 className="ab-heading ab-heading--center">
                Pathway <span className="ab-green">Intelligence</span>
              </h2>
              <p className="ab-body ab-body--center">
                Naavi combines AI, Knowledge Graphs, and real-world human journeys to generate
                adaptive pathways made of Macro, Micro, and Nano steps.
              </p>
            </div>
            <div className="ab-tech-row">
              <div className="ab-tech-card ab-tech-card--blue">
                <div className="ab-tc-icon"><BrainIcon /></div>
                <h4>Large Language Models</h4>
                <p>Conversational intelligence for pathway generation, predictive reasoning, and guidance at scale.</p>
              </div>
              <div className="ab-tech-card ab-tech-card--green">
                <div className="ab-tc-icon"><NetworkIcon /></div>
                <h4>Knowledge Graphs</h4>
                <p>Connecting skills, careers, universities, industries, mentors, and opportunities in living context.</p>
              </div>
              <div className="ab-tech-card ab-tech-card--orange">
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
            <div className="ab-grid ab-grid--img-left">
              <div className="ab-grid__visual">
                <img src={missionImg} alt="Mission and Philosophy" className="ab-img ab-img--mission" />
              </div>
              <div className="ab-grid__text">
                <h2 className="ab-heading">
                  Mission &amp; <span className="ab-green">Philosophy</span>
                </h2>
                <p className="ab-body">
                  We believe human potential should never be accidental. Naavi exists to align
                  passion, skills, education, and opportunity into meaningful life journeys.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── NAAVIVERSE ── */}
        <section id="ab-verse" className="ab-section ab-alt-white">
          <div className="ab-container">
            <div className="ab-grid ab-grid--img-right">
              <div className="ab-grid__text">
                <h2 className="ab-heading">
                  <span className="ab-green">Naaviverse</span>
                </h2>
                <p className="ab-body">
                  The Naaviverse is a living ecosystem of pathways, people, skills, mentors,
                  institutions, and opportunities continuously evolving through collective
                  human intelligence.
                </p>
              </div>
              <div className="ab-grid__visual">
                <img src={naaviverseImg} alt="Naaviverse" className="ab-img" />
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