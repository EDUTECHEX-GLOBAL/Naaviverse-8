import React, { Fragment, useRef } from 'react';
import './impact.scss';
import Footer from '../../../components/footernew/index';

const navTerms = [
  { num: '01', label: 'Skill Gap Problem',      id: 'skill-gap-problem',        accent: '#2DB67D' },
  { num: '02', label: 'Future Workforce',       id: 'future-workforce',         accent: '#4DA6FF' },
  { num: '03', label: 'Student Outcomes',       id: 'student-outcomes',         accent: '#FF9500' },
  { num: '04', label: 'Education Transformation', id: 'education-transformation', accent: '#A259FF' },
  { num: '05', label: 'Human Potential',        id: 'human-potential',          accent: '#2DB67D' },
  { num: '06', label: 'Global Opportunity Access', id: 'global-opportunity-access',accent: '#4DA6FF' },
  { num: '07', label: 'SDGs & Social Impact',   id: 'sdgs-social-impact',       accent: '#FF9500' },
  { num: '08', label: 'Success Stories',        id: 'success-stories',          accent: '#A259FF' },
];

// ── 8 story sections ──
const stories = [
  {
    id: 'skill-gap-problem',
    title: ['Skill Gap', 'Problem'],
    text: 'The future economy is evolving faster than traditional education systems. Naavi helps bridge the global skill gap by aligning individuals with future-ready pathways, emerging industries, and real-world opportunities.',
    accent: '#2DB67D',
    visual: 'gap',
    statLabel: 'Global skill shortfall',
  },
  {
    id: 'future-workforce',
    title: ['Future', 'Workforce'],
    text: "Tomorrow's workforce will be driven by adaptability, creativity, and intelligent skill navigation. Naavi prepares individuals for evolving careers through dynamic, AI-powered pathway intelligence.",
    accent: '#4DA6FF',
    visual: 'workforce',
    statLabel: 'Adaptive career navigation',
  },
  {
    id: 'student-outcomes',
    title: ['Student', 'Outcomes'],
    text: 'Naavi transforms uncertainty into direction by helping students make informed, passion-aligned decisions that improve motivation, engagement, confidence, and long-term success.',
    accent: '#FF9500',
    visual: 'outcomes',
    statLabel: 'Report clearer direction',
  },
  {
    id: 'education-transformation',
    title: ['Education', 'Transformation'],
    text: 'Education should evolve from standardized systems to personalized journeys. Naavi enables a new era of data-driven, adaptive, and learner-centric navigation.',
    accent: '#A259FF',
    visual: 'education',
    statLabel: 'Learner-centric pathways',
  },
  {
    id: 'human-potential',
    title: ['Human', 'Potential'],
    text: 'Every individual carries untapped potential. Naavi exists to help people discover, develop, and navigate toward their highest capabilities through intelligent guidance.',
    accent: '#2DB67D',
    visual: 'potential',
    statLabel: 'Intelligent guidance per learner',
  },
  {
    id: 'global-opportunity-access',
    title: ['Global Opportunity', 'Access'],
    text: 'Access to opportunities should not depend on geography, exposure, or privilege. Naavi democratizes access to global education, skills, mentorship, and career ecosystems.',
    accent: '#4DA6FF',
    visual: 'global',
    statLabel: 'Borderless ecosystems',
  },
  {
    id: 'sdgs-social-impact',
    title: ['SDGs &', 'Social Impact'],
    text: 'Naavi contributes toward building inclusive, future-ready societies by supporting quality education, decent work, reduced inequalities, innovation, and lifelong learning.',
    accent: '#FF9500',
    visual: 'sdgs',
    statLabel: 'Education · Work · Equality',
  },
  {
    id: 'success-stories',
    title: ['Success', 'Stories'],
    text: 'Every pathway navigated through Naavi contributes to a growing ecosystem of real human journeys — inspiring future generations through collective intelligence and shared success.',
    accent: '#A259FF',
    visual: 'stories',
    statLabel: 'Journeys navigated',
  },
];

// ── Section visuals ──
function SectionVisual({ type, accent }) {
  switch (type) {
    case 'gap':
      return (
        <div className="imp-vis">
          <div className="imp-vis-glow" style={{ background: `radial-gradient(circle, ${accent}18, transparent 65%)` }} />
          <svg viewBox="0 0 220 180" className="imp-vis-svg">
            <rect x="15"  y="110" width="28" height="60" rx="5" fill={accent} opacity="0.85" />
            <rect x="58"  y="80"  width="28" height="90" rx="5" fill={accent} opacity="0.6"  />
            <rect x="101" y="50"  width="28" height="120" rx="5" fill={accent} opacity="0.4" />
            <rect x="144" y="20"  width="28" height="150" rx="5" fill={accent} opacity="0.2" />
            <polyline points="29,110 72,80 115,50 158,20" fill="none" stroke={accent} strokeWidth="2" strokeDasharray="6 4" opacity="0.5" />
            <circle cx="29"  cy="110" r="5" fill={accent} />
            <circle cx="72"  cy="80"  r="5" fill={accent} opacity="0.7" />
            <circle cx="115" cy="50"  r="5" fill={accent} opacity="0.5" />
            <circle cx="158" cy="20"  r="5" fill={accent} opacity="0.3" />
            <text x="12" y="12" fontSize="9" fill={accent} fontWeight="700" opacity="0.7">120M+ gap</text>
          </svg>
        </div>
      );

    case 'workforce':
      return (
        <div className="imp-vis">
          <div className="imp-vis-glow" style={{ background: `radial-gradient(circle, ${accent}18, transparent 65%)` }} />
          <div className="imp-vis-nodes-wrap">
            {['Adaptability','AI Skills','Creativity','Navigation','Leadership'].map((n, i) => (
              <div key={n} className="imp-vis-node" style={{
                '--accent': accent,
                animationDelay: `${i * 0.35}s`,
                top:  `${[12,4,46,72,32][i]}%`,
                left: `${[8, 52,70,18,38][i]}%`,
              }}>
                {n}
              </div>
            ))}
          </div>
        </div>
      );

    case 'outcomes':
      return (
        <div className="imp-vis">
          <div className="imp-vis-glow" style={{ background: `radial-gradient(circle, ${accent}18, transparent 65%)` }} />
          <div className="imp-vis-ring-wrap">
            <div className="imp-vis-ring" style={{ '--accent': accent, width:'190px', height:'190px' }} />
            <div className="imp-vis-ring" style={{ '--accent': accent, width:'120px', height:'120px', animationDirection:'reverse', animationDuration:'11s' }} />
            <div className="imp-vis-core" style={{ background: accent }}>
              <span className="imp-vis-core-num">98%</span>
              <span className="imp-vis-core-lbl">Clarity</span>
            </div>
          </div>
        </div>
      );

    case 'education':
      return (
        <div className="imp-vis">
          <div className="imp-vis-glow" style={{ background: `radial-gradient(circle, ${accent}18, transparent 65%)` }} />
          <div className="imp-vis-steps">
            {['Standard','Data-Driven','Adaptive','Personalized'].map((step, i) => (
              <div key={step} className="imp-vis-step" style={{ '--accent': accent, '--delay': `${i * 0.25}s` }}>
                <div className="imp-vis-step-dot" />
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>
      );

    case 'potential':
      return (
        <div className="imp-vis">
          <div className="imp-vis-glow" style={{ background: `radial-gradient(circle, ${accent}18, transparent 65%)` }} />
          <div className="imp-vis-orbit-wrap">
            <div className="imp-vis-orbit" style={{ '--accent': accent, width:'200px', height:'200px' }} />
            <div className="imp-vis-orbit" style={{ '--accent': accent, width:'128px', height:'128px', animationDirection:'reverse', animationDuration:'9s' }} />
            <div className="imp-vis-orbit-core" style={{ background: `linear-gradient(135deg, ${accent}, ${accent}99)` }}>🧠</div>
            {['Passion','Skills','Goals','Growth'].map((label, i) => (
              <div key={label} className="imp-vis-orbit-node" style={{
                top:  `${[4, 48, 88, 48][i]}%`,
                left: `${[48, 88, 48, 8][i]}%`,
                animationDelay: `${i * 0.4}s`,
              }}>
                {label}
              </div>
            ))}
          </div>
        </div>
      );

    case 'global':
      return (
        <div className="imp-vis">
          <div className="imp-vis-glow" style={{ background: `radial-gradient(circle, ${accent}18, transparent 65%)` }} />
          <svg viewBox="0 0 200 180" className="imp-vis-svg">
            <ellipse cx="100" cy="90" rx="78" ry="68" fill="none" stroke={accent} strokeWidth="1.2" opacity="0.25" />
            <ellipse cx="100" cy="90" rx="50" ry="68" fill="none" stroke={accent} strokeWidth="0.8" opacity="0.15" />
            <line x1="22" y1="90" x2="178" y2="90" stroke={accent} strokeWidth="0.8" opacity="0.15" />
            <line x1="100" y1="22" x2="100" y2="158" stroke={accent} strokeWidth="0.8" opacity="0.15" />
            {[[55,50],[138,62],[72,122],[148,108],[100,35],[65,145]].map(([cx,cy],i) => (
              <circle key={i} cx={cx} cy={cy} r="5" fill={accent} opacity={0.35 + i * 0.1}>
                <animate attributeName="r" values="4;7;4" dur={`${2+i*0.5}s`} repeatCount="indefinite" />
              </circle>
            ))}
          </svg>
        </div>
      );

    case 'sdgs':
      return (
        <div className="imp-vis">
          <div className="imp-vis-glow" style={{ background: `radial-gradient(circle, ${accent}18, transparent 65%)` }} />
          <div className="imp-vis-list">
            {['Quality Education','Decent Work','Reduced Inequalities','Innovation','Lifelong Learning'].map((g, i) => (
              <div key={g} className="imp-vis-list-item" style={{ '--accent': accent, '--delay': `${i * 0.15}s` }}>
                <div className="imp-vis-list-dot" style={{ background: accent }} />
                <span>{g}</span>
              </div>
            ))}
          </div>
        </div>
      );

    case 'stories':
    default:
      return (
        <div className="imp-vis">
          <div className="imp-vis-glow" style={{ background: `radial-gradient(circle, ${accent}18, transparent 65%)` }} />
          <div className="imp-vis-circles">
            {[160,120,84,52,28].map((size, i) => (
              <div key={i} className="imp-vis-circle" style={{
                width: `${size}px`, height: `${size}px`,
                borderColor: accent,
                opacity: 0.1 + i * 0.12,
                animationDelay: `${i * 0.3}s`,
              }} />
            ))}
            <div className="imp-vis-circle-label" style={{ color: accent }}>1000+</div>
            <div className="imp-vis-circle-sub">Journeys</div>
          </div>
        </div>
      );
  }
}

const Impact = () => {
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 140;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  return (
    <Fragment>
      {/* ══════════════════════════════
          HERO — with problem.webp image
      ══════════════════════════════ */}
      <div className="imp-hero">
        <div className="imp-hero-bg" />
        <div className="imp-container imp-hero-inner">
          <div className="imp-hero-text">
           
            <h1 className="imp-hero-title">
              An intelligence layer for{' '}
              <span className="imp-hero-accent">human navigation,</span>{' '}
              mapped end-to-end.
            </h1>
            <p className="imp-hero-desc">
              Eight interconnected dimensions — from the global skill gap to the real human stories that emerge — woven into one adaptive, AI-powered ecosystem.
            </p>
            <div className="imp-hero-btns">
              <button className="imp-hero-btn-primary" onClick={() => scrollToSection('skill-gap-problem')}>
                Explore the storyline →
              </button>
              
            </div>
          </div>
          <div className="imp-hero-visual">
  <img 
    src={require('../../../assets/images/assets/problem.webp')}
    alt="Problem visualization"
    className="imp-hero-image"
  />
</div>
        </div>
      </div>

      {/* ══════════════════════════════
    MARQUEE SCROLL STRIP
══════════════════════════════ */}
<div className="imp-marquee-strip">
  <div className="imp-marquee-track">
    {[...navTerms, ...navTerms].map((t, i) => (
      <span key={i} className="imp-marquee-item">
        <span className="imp-marquee-dot" />
        {t.label.toUpperCase()}
      </span>
    ))}
  </div>
</div>

      {/* ══════════════════════════════
          8 IMPACT SECTIONS
      ══════════════════════════════ */}
      {stories.map((s, i) => {
        const isEven = i % 2 === 0;
        // alternate backgrounds: white / very soft tint
        const bg = i % 2 === 0 ? '#ffffff' : '#F7F9FC';

        return (
          <section
            key={s.id}
            id={s.id}
            className={`imp-story ${isEven ? '' : 'imp-story-flip'}`}
            style={{ background: bg }}
          >
            <div className="imp-story-glow" style={{
              background: `radial-gradient(circle at ${isEven ? '75%' : '25%'} 50%, ${s.accent}0a, transparent 55%)`,
            }} />

            <div className="imp-container imp-story-inner">
              {/* Text */}
              <div className="imp-story-text">
              
                <h2 className="imp-story-title">
                  {s.title[0]}<br />
                  <span style={{ color: s.accent }}>{s.title[1]}</span>
                </h2>
                <p className="imp-story-desc">{s.text}</p>
                <div className="imp-story-stat-row">
                  <div className="imp-story-stat" style={{ '--accent': s.accent }}>
                    <span className="imp-story-stat-val" style={{ color: s.accent }}>{s.stat}</span>
                    <span className="imp-story-stat-lbl">{s.statLabel}</span>
                  </div>
                </div>
                <div className="imp-story-line" style={{ background: `linear-gradient(90deg, ${s.accent}, transparent)` }} />
              </div>

              {/* Visual */}
              <div className="imp-story-vis-wrap">
                <SectionVisual type={s.visual} accent={s.accent} />
              </div>
            </div>
          </section>
        );
      })}

      <Footer />
    </Fragment>
  );
};

export default Impact;