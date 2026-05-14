import React, { Fragment } from 'react';
import {
  HiOutlineCpuChip,
  HiOutlineSparkles,
  HiOutlineShare,
  HiOutlineBolt,
  HiOutlineGlobeAlt,
  HiOutlineArrowRight,
} from "react-icons/hi2";
import './Technology.scss';
import Footer from '../../../components/footernew/index';
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

function CircuitGrid() {
  return (
    <div aria-hidden="true" className="tech-circuit-grid">
      <svg className="tech-circuit-svg" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="circuit" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#2DB67D" strokeWidth="0.6" />
            <circle cx="0" cy="0" r="1.6" fill="#2DB67D" />
            <circle cx="60" cy="60" r="1.6" fill="#4DA6FF" />
          </pattern>
          <radialGradient id="fade" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <mask id="m"><rect width="100%" height="100%" fill="url(#fade)" /></mask>
        </defs>
        <rect width="100%" height="100%" fill="url(#circuit)" mask="url(#m)" opacity="0.18" />
      </svg>
      <div className="tech-glow tech-glow-tl" />
      <div className="tech-glow tech-glow-br" />
    </div>
  );
}

const Technology = () => {
  return (
    <Fragment>


      {/* ── PATHWAYS ── */}
      <section id="pathways" className="tech-section tech-pathways">
        <CircuitGrid />
        <div className="tech-container tech-relative">
          <div className="tech-layer-bar">
            <span className="tech-layer-tag">[ LAYER 01 ]</span>
            <span className="tech-layer-line" />
          </div>
          <h2 className="tech-section-title">PATHWAYS</h2>

          <div className="tech-pathways-grid">
            <div className="tech-pathways-main">
              <p className="tech-body-text">
                Naavi's AI Pathways Engine transforms ambitions into intelligent, navigable journeys. Every pathway is dynamically generated using interconnected{' '}
                <strong className="tech-green">Macro</strong>,{' '}
                <strong className="tech-green">Micro</strong>, and{' '}
                <strong className="tech-green">Nano</strong>{' '}
                steps that guide users from their present coordinates to future aspirations.
              </p>
              <p className="tech-body-sub">Unlike static roadmaps, Naavi pathways continuously evolve based on:</p>
              <ul className="tech-bullets">
                {pathwayBullets.map((b) => (
                  <li key={b} className="tech-bullet-item">
                    <span className="tech-bullet-dot" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <p className="tech-body-sub" style={{ marginTop: '20px' }}>
                The platform intelligently adapts navigation in real time — similar to how GPS systems optimize routes during travel. Whether the goal is higher education, skill development, entrepreneurship, global careers, or future industries, Naavi creates personalized pathways designed around each individual's unique potential.
              </p>
            </div>

            <div className="tech-pathways-side">
              <div className="tech-core-card">
                <p className="tech-mono-tag">CORE CAPABILITIES</p>
                <p className="tech-core-intro">At its core, the Pathways Engine enables:</p>
                <ul className="tech-core-list">
                  {pathwayCore.map((c, i) => (
                    <li key={c} className="tech-core-item">
                      <span className="tech-core-num">{String(i + 1).padStart(2, "0")}</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="tech-steps-card">
                <p className="tech-mono-tag tech-mono-tag-green">PATHWAY STEPS</p>
                <div className="tech-steps-row">
                  {[
                    { t: "Macro", color: "#2DB67D" },
                    { t: "Micro", color: "#4DA6FF" },
                    { t: "Nano",  color: "#FF9500" },
                  ].map((s, i, arr) => (
                    <div key={s.t} className="tech-step-wrap">
                      <div className="tech-step-node" style={{ background: s.color }}>
                        {i + 1}
                      </div>
                      <p className="tech-step-label">{s.t}</p>
                      {i < arr.length - 1 && (
                        <HiOutlineArrowRight className="tech-step-arrow" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── LLM's - KG's ── */}
      <section id="llms-kgs" className="tech-section tech-llm-section">
        <CircuitGrid />
        <div className="tech-container tech-relative">
          <div className="tech-layer-bar">
            <span className="tech-layer-tag tech-layer-tag-mint">[ LAYER 02 ]</span>
            <span className="tech-layer-line tech-layer-line-mint" />
          </div>
          <h2 className="tech-section-title tech-section-title-white">LLM's — KG's</h2>
        

          <p className="tech-llm-intro">
            Naavi is powered by the powerful synergy between Large Language Models (LLMs) and Knowledge Graphs (KGs), combining reasoning intelligence with structured pathway understanding.
          </p>

          <div className="tech-llm-grid">
            {/* LLMs panel */}
            <div className="tech-module-card">
              <div className="tech-module-glow tech-module-glow-green" />
              <div className="tech-module-header">
                <div className="tech-module-icon" style={{ background: 'linear-gradient(135deg, #2DB67D, #1a9e6a)' }}>
                  <HiOutlineCpuChip size={22} />
                </div>
                <div>
                  <p className="tech-mono-tag">MODULE · LLM</p>
                  <p className="tech-module-title">Large Language Models bring:</p>
                </div>
              </div>
              <ul className="tech-llm-list">
                {llmCapabilities.map((c) => (
                  <li key={c} className="tech-llm-item">
                    <HiOutlineSparkles className="tech-llm-icon" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* KGs panel */}
            <div className="tech-module-card">
              <div className="tech-module-glow tech-module-glow-blue" />
              <div className="tech-module-header">
                <div className="tech-module-icon" style={{ background: '#4DA6FF' }}>
                  <HiOutlineShare size={22} />
                </div>
                <div>
                  <p className="tech-mono-tag">MODULE · KG</p>
                  <p className="tech-module-title">Knowledge Graphs create a structured intelligence network connecting:</p>
                </div>
              </div>
              <div className="tech-kg-tags">
                {kgNodes.map((n) => (
                  <span key={n} className="tech-kg-tag">{n}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Synergy panel */}
          <div className="tech-synergy-card">
            <div className="tech-synergy-glow" />
            <div className="tech-synergy-inner">
              <div className="tech-synergy-text">
                <p className="tech-mono-tag">SYNERGY · LLM × KG</p>
                <h3 className="tech-synergy-title">
                  Together, this AI architecture moves beyond traditional recommendation systems.
                </h3>
                <p className="tech-synergy-desc">
                  Naavi generates highly personalized, explainable, and future-aware navigation pathways.
                </p>
                <p className="tech-synergy-desc">
                  By integrating LLMs with Knowledge Graphs through advanced{' '}
                  <span className="tech-mint-bold">GraphRAG frameworks</span>, Naavi builds a continuously evolving intelligence ecosystem capable of understanding not just information — but relationships, possibilities, and human potential itself.
                </p>
              </div>
              <div className="tech-synergy-chips">
                {[
                  { Icon: HiOutlineBolt,     t: "Adaptive" },
                  { Icon: HiOutlineGlobeAlt, t: "Future-aware" },
                  { Icon: HiOutlineSparkles, t: "Explainable" },
                  { Icon: HiOutlineShare,    t: "Connected" },
                ].map(({ Icon, t }) => (
                  <div key={t} className="tech-synergy-chip">
                    <Icon size={22} className="tech-chip-icon" />
                    <p className="tech-chip-label">{t}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    <Footer />

    </Fragment>
  );
};

export default Technology;