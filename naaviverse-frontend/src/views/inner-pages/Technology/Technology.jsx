// Technology.jsx
import React, { Fragment } from 'react';
import {
  HiOutlineCpuChip,
  HiOutlineSparkles,
  HiOutlineShare,
  HiOutlineBolt,
  HiOutlineGlobeAlt,
  HiOutlineChartBar,
  HiOutlineUserGroup,
} from "react-icons/hi2";
import './Technology.scss';
import Footer from '../../../components/footernew/index';

// Import the image
import solutionImage from '../../../assets/images/assets/solution.png';

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

// Macro/Micro/Nano visual component
function PathwayStepsVisual() {
  return (
    <div className="tech-pathway-visual">
      <svg viewBox="0 0 300 140" className="tech-pathway-svg">
        <path
          d="M 30 70 L 100 70 L 140 35 L 180 35 L 250 35"
          fill="none"
          stroke="#2DB67D"
          strokeWidth="1.5"
          strokeDasharray="6 4"
          opacity="0.5"
        />
        <circle cx="30" cy="70" r="7" fill="#2DB67D">
          <animate attributeName="r" values="5;9;5" dur="3s" repeatCount="indefinite" />
        </circle>
        <text x="15" y="58" fontSize="10" fill="#2DB67D" fontWeight="600">Macro</text>

        <circle cx="100" cy="70" r="7" fill="#4DA6FF">
          <animate attributeName="r" values="5;9;5" dur="3s" begin="0.5s" repeatCount="indefinite" />
        </circle>
        <text x="85" y="58" fontSize="10" fill="#4DA6FF" fontWeight="600">Micro</text>

        <circle cx="180" cy="35" r="7" fill="#FF9500">
          <animate attributeName="r" values="5;9;5" dur="3s" begin="1s" repeatCount="indefinite" />
        </circle>
        <text x="165" y="23" fontSize="10" fill="#FF9500" fontWeight="600">Nano</text>

        <circle cx="250" cy="35" r="5" fill="#2DB67D" />
        <circle cx="250" cy="35" r="14" fill="none" stroke="#2DB67D" strokeWidth="1" opacity="0.5">
          <animate attributeName="r" values="10;22;10" dur="2.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.5;0;0.5" dur="2.5s" repeatCount="indefinite" />
        </circle>
        <text x="240" y="25" fontSize="9" fill="#2DB67D" fontWeight="600">Goal</text>
      </svg>
    </div>
  );
}

// LLM + KG synergy visual
function SynergyVisual() {
  return (
    <div className="tech-synergy-visual">
      <svg viewBox="0 0 300 160" className="tech-synergy-svg">
        <circle cx="75" cy="80" r="38" fill="none" stroke="#2DB67D" strokeWidth="1.5" opacity="0.3">
          <animate attributeName="r" values="36;42;36" dur="4s" repeatCount="indefinite" />
        </circle>
        <circle cx="75" cy="80" r="24" fill="rgba(45,182,125,0.06)" stroke="#2DB67D" strokeWidth="1" />
        <text x="75" y="76" textAnchor="middle" fontSize="11" fill="#2DB67D" fontWeight="700">LLM</text>
        <text x="75" y="90" textAnchor="middle" fontSize="8" fill="#6B7A8D">Reasoning</text>

        <circle cx="225" cy="80" r="38" fill="none" stroke="#4DA6FF" strokeWidth="1.5" opacity="0.3">
          <animate attributeName="r" values="36;42;36" dur="4s" begin="0.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="225" cy="80" r="24" fill="rgba(77,166,255,0.06)" stroke="#4DA6FF" strokeWidth="1" />
        <text x="225" y="76" textAnchor="middle" fontSize="11" fill="#4DA6FF" fontWeight="700">KG</text>
        <text x="225" y="90" textAnchor="middle" fontSize="8" fill="#6B7A8D">Structure</text>

        <line x1="99" y1="80" x2="201" y2="80" stroke="url(#grad-llm-kg)" strokeWidth="1.8" strokeDasharray="4 3" opacity="0.5">
          <animate attributeName="stroke-dashoffset" values="0;14" dur="1.5s" repeatCount="indefinite" />
        </line>

        <circle cx="150" cy="80" r="16" fill="rgba(45,182,125,0.12)">
          <animate attributeName="r" values="13;19;13" dur="3s" repeatCount="indefinite" />
        </circle>
        <text x="150" y="84" textAnchor="middle" fontSize="10" fill="#2DB67D" fontWeight="800">×</text>

        <defs>
          <linearGradient id="grad-llm-kg" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2DB67D" />
            <stop offset="100%" stopColor="#4DA6FF" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

// Graph nodes visual
function GraphNodesVisual() {
  return (
    <div className="tech-graph-visual">
      <svg viewBox="0 0 260 160" className="tech-graph-svg">
        {[
          { x: 35, y: 80, label: "Skills", color: "#2DB67D" },
          { x: 100, y: 35, label: "Careers", color: "#4DA6FF" },
          { x: 165, y: 60, label: "Universities", color: "#FF9500" },
          { x: 220, y: 110, label: "Mentors", color: "#A259FF" },
          { x: 65, y: 130, label: "Opportunities", color: "#2DB67D" },
          { x: 135, y: 135, label: "Pathways", color: "#4DA6FF" },
        ].map((node, i) => (
          <g key={i}>
            <circle cx={node.x} cy={node.y} r="7" fill={node.color} opacity="0.6">
              <animate attributeName="r" values="5;9;5" dur={`${3 + i * 0.3}s`} repeatCount="indefinite" />
            </circle>
            <text x={node.x} y={node.y - 9} textAnchor="middle" fontSize="8" fill="#1A1A2E" fontWeight="600">{node.label}</text>
          </g>
        ))}
        <path
          d="M 35 80 L 100 35 L 165 60 L 220 110 M 165 60 L 135 135 M 100 35 L 65 130 M 65 130 L 135 135"
          fill="none"
          stroke="#2DB67D"
          strokeWidth="0.7"
          opacity="0.25"
          strokeDasharray="3 3"
        >
          <animate attributeName="stroke-dashoffset" values="0;12" dur="2s" repeatCount="indefinite" />
        </path>
      </svg>
    </div>
  );
}

const Technology = () => {
  return (
    <Fragment>
      {/* Pathways Section */}
      <section id="pathways" className="tech-section tech-pathways">
        <div className="tech-container">
          <div className="tech-section-header">
          
            <h2 className="tech-section-title">Pathways Engine</h2>
            <p className="tech-section-desc">
              Transforming ambitions into intelligent, navigable journeys that evolve in real time.
            </p>
          </div>

          <div className="tech-pathways-grid">
            <div className="tech-pathways-content">
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

              {/* Solution Image Banner */}
          <div className="tech-solution-banner">
            <img src={solutionImage} alt="Naavi Solution Architecture" className="tech-solution-image" />
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

          {/* Synergy Banner */}
          <div className="tech-synergy-banner">
            <GraphNodesVisual />
            <div className="tech-synergy-content">
              <div className="tech-synergy-label">SYNERGY · LLM × KG</div>
              <h3 className="tech-synergy-title">
                Together, this AI architecture moves beyond traditional recommendation systems.
              </h3>
              <p className="tech-synergy-text">
                Naavi generates highly personalized, explainable, and future-aware navigation pathways. By integrating LLMs with Knowledge Graphs through advanced{' '}
                <span className="tech-mint-bold">GraphRAG frameworks</span>, Naavi builds a continuously evolving intelligence ecosystem capable of understanding not just information — but relationships, possibilities, and human potential itself.
              </p>
            
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </Fragment>
  );
};

export default Technology;