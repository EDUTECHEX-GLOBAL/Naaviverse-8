import React, { Fragment, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Helmet } from "react-helmet-async";
import {
  HiOutlineCpuChip,
  HiOutlineSparkles,
  HiOutlineShare,
} from "react-icons/hi2";
import './Technology.scss';
import Footer from '../../../components/footernew/index';
import PathEngineImg from './images/Path_Engine.png';
import SynergyImg from './images/Synergy_1.png';

const HEADER_OFFSET = 110;

const pathwayBullets = [
  "user decisions",
  "performance",
  "behavioral patterns",
  "emerging opportunities",
  "and future industry trends.",
];

const pathwayCore = [
  "personalized growth navigation,",
  "intelligent decision-making,",
  "adaptive career transitions,",
  "and long-term human development.",
];

const llmCapabilities = [
  "conversational intelligence,",
  "contextual understanding,",
  "pathway generation,",
  "predictive reasoning,",
  "and adaptive recommendations.",
];

const kgNodes = [
  "skills",
  "careers",
  "universities",
  "industries",
  "mentors",
  "opportunities",
  "and human pathways.",
];

const Technology = () => {
  const { section } = useParams();
  const location = useLocation();

  const getSectionId = (sectionName) => {
    const mapping = {
      'pathways-system': 'pathways',
      'llms-knowledge-graphs': 'llms-kgs',
      'ai-matching': 'ai-matching',
      'research': 'research',
      'roadmap': 'roadmap',
      'security': 'security'
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
            const top = element.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
            window.scrollTo({ top, behavior: 'smooth' });
          }
        };
        const timer1 = setTimeout(scrollToTarget, 80);
        const timer2 = setTimeout(scrollToTarget, 300);
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
    <Fragment>
      <Helmet>
        <title>Technology | Naavi Network - AI Powered Path Engine</title>
        <meta
          name="description"
          content="Discover the technology behind Naavi Network. Learn how LLMs, Knowledge Graphs, AI matching algorithms, and pathway intelligence power personalized education, career, and life navigation."
        />
        <meta
          name="keywords"
          content="Naavi Technology, AI Path Engine, LLMs, Knowledge Graphs, Pathway Intelligence, Machine Learning, Education Tech Architecture, Naavi Network"
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://naavinetwork.ai/technology" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Naavi Network" />
        <meta property="og:title" content="Technology | Naavi Network" />
        <meta
          property="og:description"
          content="Explore the AI pathways architecture, LLMs + Knowledge Graphs synergy, and predictive reasoning powering Naavi Network."
        />
        <meta property="og:url" content="https://naavinetwork.ai/technology" />
        <meta property="og:image" content="https://naavinetwork.ai/logo512.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Technology | Naavi Network" />
        <meta
          name="twitter:description"
          content="Discover how AI LLMs and Knowledge Graphs power Naavi Network's personalized pathway platform."
        />
        <meta name="twitter:image" content="https://naavinetwork.ai/logo512.png" />
      </Helmet>

      {/* Pathways Section */}
      <section id="pathways" className="tech-section tech-pathways">
        <div className="tech-container">
          <div className="tech-section-header">
            <h2 className="tech-section-title">Pathways Engine</h2>
            <p className="tech-section-desc">
              Transforming ambitions into intelligent, navigable journeys that evolve in real time.
            </p>
          </div>

          {/* Path Engine preview image card */}
          <div className="tech-preview-image-block">
            <div className="tech-image-label">AI PATHWAYS ARCHITECTURE</div>
            <img
              src={PathEngineImg}
              alt="Naavi AI Pathways Engine Architecture"
              className="tech-preview-img"
            />
          </div>

          {/* Cards below image */}
          <div className="tech-pathways-grid">
            <div className="tech-pathways-content">
              <div className="tech-card tech-card-white">
                <div className="tech-card-label" style={{ marginBottom: '12px' }}>DYNAMIC PATHWAYS</div>
                <p className="tech-body-text" style={{ marginBottom: '12px' }}>
                  Naavi's AI Pathways Engine dynamically generates interconnected{' '}
                  <strong className="tech-green">Macro</strong>,{' '}
                  <strong className="tech-green">Micro</strong>, and{' '}
                  <strong className="tech-green">Nano</strong> steps that guide users from their present coordinates to future aspirations.
                </p>
                <p className="tech-body-sub" style={{ marginBottom: '12px' }}>Unlike static roadmaps, Naavi pathways continuously evolve based on:</p>

                <div className="tech-bullet-grid">
                  {pathwayBullets.map((b) => (
                    <div key={b} className="tech-bullet-card">
                      <div className="tech-bullet-dot" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>

                <p className="tech-body-text" style={{ marginTop: '12px' }}>
                  The platform intelligently adapts navigation in real time — similar to how GPS systems optimize routes during travel. Whether the goal is higher education, skill development, entrepreneurship, global careers, or future industries, Naavi creates personalized pathways designed around each individual's unique potential.
                </p>
              </div>
            </div>

            <div className="tech-pathways-visual-side">
              <div className="tech-card tech-card-light">
                <div className="tech-card-label">CORE CAPABILITIES</div>
                <div className="tech-core-list">
                  {pathwayCore.map((c, i) => (
                    <div key={c} className="tech-core-item-light">
                      <span className="tech-core-num-light">{String(i + 1).padStart(2, "0")}</span>
                      <span>{c}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LLM + KG Section */}
      <section id="llms-kgs" className="tech-section tech-llm-section">
        <div className="tech-container">
          <div className="tech-section-header">
            <h2 className="tech-section-title">LLMs × Knowledge Graphs</h2>
            <p className="tech-section-desc">
              Naavi is powered by the powerful synergy between Large Language Models (LLMs) and Knowledge Graphs (KGs), combining reasoning intelligence with structured pathway understanding.
            </p>
          </div>

          {/* Synergy image card */}
          <div className="tech-preview-image-block tech-synergy-preview-block">
            <div className="tech-image-label">SYNERGY · LLM × KG</div>
            <img
              src={SynergyImg}
              alt="LLM × Knowledge Graph Synergy Architecture"
              className="tech-preview-img"
            />
          </div>

          {/* Two cards below image */}
          <div className="tech-llm-grid">
            <div className="tech-card tech-card-white">
              <div className="tech-module-icon" style={{ background: 'linear-gradient(135deg, #2DB67D, #1a9e6a)' }}>
                <HiOutlineCpuChip size={24} />
              </div>
              <div className="tech-module-label">MODULE · LLM</div>
              <h3 className="tech-module-title-light">Large Language Models bring:</h3>
              <div className="tech-capability-list">
                {llmCapabilities.map((c) => (
                  <div key={c} className="tech-capability-item-light">
                    <HiOutlineSparkles className="tech-capability-icon-light" />
                    <span>{c}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="tech-card tech-card-white">
              <div className="tech-module-icon" style={{ background: '#4DA6FF' }}>
                <HiOutlineShare size={24} />
              </div>
              <div className="tech-module-label">MODULE · KG</div>
              <h3 className="tech-module-title-light">Knowledge Graphs create a structured intelligence network connecting:</h3>
              <div className="tech-tags-container">
                {kgNodes.map((n) => (
                  <span key={n} className="tech-tag-light">{n}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Caption below cards */}
          <div className="tech-synergy-caption-standalone">
            <p>
              By integrating LLMs with Knowledge Graphs through advanced{' '}
              <span className="tech-mint-bold">GraphRAG frameworks</span>, Naavi builds a continuously
              evolving intelligence ecosystem capable of understanding not just information —
              but relationships, possibilities, and human potential itself.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </Fragment>
  );
};

export default Technology;