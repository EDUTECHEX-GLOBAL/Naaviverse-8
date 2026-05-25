import React, { Fragment, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import {
  HiOutlineCpuChip,
  HiOutlineSparkles,
  HiOutlineShare,
} from "react-icons/hi2";
import './Technology.scss';
import Footer from '../../../components/footernew/index';
import PathEngineImg from './images/Path_Engine.png';
import SynergyImg from './images/Synergy_1.png';

const HEADER_OFFSET = 80;

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

      {/* ── PATHWAYS ENGINE SECTION ── */}
      <section id="pathways" className="tech-section tech-pathways">
        <div className="tech-container">

          {/* Header */}
          <div className="tech-section-header">
            <span className="tech-section-tag">AI Engine</span>
            <h2 className="tech-section-title">Pathways Engine</h2>
            <p className="tech-section-desc">
              Transforming ambitions into intelligent, navigable journeys that evolve in real time.
            </p>
          </div>

          {/* Path Engine image — now appears right after header, before cards */}
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
            <div className="tech-card tech-card-white">
              <p className="tech-body-text">
                Naavi's AI Pathways Engine dynamically generates interconnected{' '}
                <strong className="tech-green">Macro</strong>,{' '}
                <strong className="tech-green">Micro</strong>, and{' '}
                <strong className="tech-green">Nano</strong> steps that guide users from their present coordinates to future aspirations.
              </p>
              <p className="tech-body-sub">Unlike static roadmaps, Naavi pathways continuously evolve based on:</p>
              <div className="tech-bullet-grid">
                {pathwayBullets.map((b) => (
                  <div key={b} className="tech-bullet-card">
                    <div className="tech-bullet-dot" />
                    <span>{b}</span>
                  </div>
                ))}
              </div>
              <p className="tech-body-text" style={{ marginTop: '24px' }}>
                The platform intelligently adapts navigation in real time — similar to how GPS systems optimize routes during travel.
              </p>
            </div>

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
      </section>

      {/* ── LLM × KG SECTION ── */}
      <section id="llms-kgs" className="tech-section tech-llm-section">
        <div className="tech-container">

          {/* Header */}
          <div className="tech-section-header">
            <span className="tech-section-tag">Intelligence Layer</span>
            <h2 className="tech-section-title">LLMs × Knowledge Graphs</h2>
            <p className="tech-section-desc">
              Naavi is powered by the powerful synergy between Large Language Models and Knowledge Graphs,
              combining reasoning intelligence with structured pathway understanding.
            </p>
          </div>

          {/* Synergy image — now appears right after header, before cards */}
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