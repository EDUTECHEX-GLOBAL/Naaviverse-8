import React, { Fragment, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import './impact.scss';
import Footer from '../../../components/footernew/index';
import skillGapProblemImg from './images/skill_gap_problem.png';
import futureWorkforceImg from './images/future_workforce_U.png';
import studentOutcomesImg from './images/student_outcomes.png';
import educationTransformationImg from './images/edu_transf.png';
import humanPotentialImg from './images/human_potential.png';
import globalOpportunityImg from './images/global_opportunity_access.png';
import sdgImpactImg from './images/SDG_Social_Impact.png';
import successStoriesImg from './images/successs.png';

const HEADER_OFFSET = 140;

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
//success
const stories = [
  {
    id: 'skill-gap-problem',
    title: ['Skill Gap', 'Problem'],
    text: 'The future economy is evolving faster than traditional education systems. Naavi helps bridge the global skill gap by aligning individuals with future-ready pathways, emerging industries, and real-world opportunities.',
    accent: '#2DB67D',
    visual: 'gap',
    stat: '85M',
    statLabel: 'Global skill shortfall',
  },
  {
    id: 'future-workforce',
    title: ['Future', 'Workforce'],
    text: "Tomorrow's workforce will be driven by adaptability, creativity, and intelligent skill navigation. Naavi prepares individuals for evolving careers through dynamic, AI-powered pathway intelligence.",
    accent: '#4DA6FF',
    visual: 'workforce',
    stat: '92%',
    statLabel: 'Adaptive career navigation',
  },
  {
    id: 'student-outcomes',
    title: ['Student', 'Outcomes'],
    text: 'Naavi transforms uncertainty into direction by helping students make informed, passion-aligned decisions that improve motivation, engagement, confidence, and long-term success.',
    accent: '#FF9500',
    visual: 'outcomes',
    stat: '78%',
    statLabel: 'Report clearer direction',
  },
  {
    id: 'education-transformation',
    title: ['Education', 'Transformation'],
    text: 'Education should evolve from standardized systems to personalized journeys. Naavi enables a new era of data-driven, adaptive, and learner-centric navigation.',
    accent: '#A259FF',
    visual: 'education',
    stat: '100%',
    statLabel: 'Learner-centric pathways',
  },
  {
    id: 'human-potential',
    title: ['Human', 'Potential'],
    text: 'Every individual carries untapped potential. Naavi exists to help people discover, develop, and navigate toward their highest capabilities through intelligent guidance.',
    accent: '#2DB67D',
    visual: 'potential',
    stat: '10M+',
    statLabel: 'Intelligent guidance per learner',
  },
  {
    id: 'global-opportunity-access',
    title: ['Global Opportunity', 'Access'],
    text: 'Access to opportunities should not depend on geography, exposure, or privilege. Naavi democratizes access to global education, skills, mentorship, and career ecosystems.',
    accent: '#4DA6FF',
    visual: 'global',
    stat: '195+',
    statLabel: 'Borderless ecosystems',
  },
  {
    id: 'sdgs-social-impact',
    title: ['SDGs &', 'Social Impact'],
    text: 'Naavi contributes toward building inclusive, future-ready societies by supporting quality education, decent work, reduced inequalities, innovation, and lifelong learning.',
    accent: '#FF9500',
    visual: 'sdgs',
    stat: 'SDG 4,8,9',
    statLabel: 'Education · Work · Equality',
  },
  {
    id: 'success-stories',
    title: ['Success', 'Stories'],
    text: 'Every pathway navigated through Naavi contributes to a growing ecosystem of real human journeys — inspiring future generations through collective intelligence and shared success.',
    accent: '#A259FF',
    visual: 'stories',
    stat: '50K+',
    statLabel: 'Journeys navigated',
  },
];

// ── Section visuals ──
function SectionVisual({ type, accent }) {
  switch (type) {
    case 'gap':
      return (
        <div className="imp-vis imp-vis-image-wrap">
          <img
            src={skillGapProblemImg}
            alt="Skill gap problem"
            className="imp-story-image"
          />
        </div>
      );
    case 'workforce':
      return (
        <div className="imp-vis imp-vis-image-wrap">
          <img
            src={futureWorkforceImg}
            alt="Future workforce"
            className="imp-story-image"
          />
        </div>
      );
    case 'outcomes':
      return (
        <div className="imp-vis imp-vis-image-wrap">
          <img
            src={studentOutcomesImg}
            alt="Student outcomes"
            className="imp-story-image"
          />
        </div>
      );
    case 'education':
      return (
        <div className="imp-vis imp-vis-image-wrap">
          <img
            src={educationTransformationImg}
            alt="Education transformation"
            className="imp-story-image"
          />
        </div>
      );
    case 'potential':
      return (
        <div className="imp-vis imp-vis-image-wrap">
          <img
            src={humanPotentialImg}
            alt="Human potential"
            className="imp-story-image"
          />
        </div>
      );
    case 'global':
      return (
        <div className="imp-vis imp-vis-image-wrap">
          <img
            src={globalOpportunityImg}
            alt="Global opportunity access"
            className="imp-story-image"
          />
        </div>
      );
    case 'sdgs':
      return (
        <div className="imp-vis imp-vis-image-wrap">
          <img
            src={sdgImpactImg}
            alt="SDGs and social impact"
            className="imp-story-image"
          />
        </div>
      );
    case 'stories':
    default:
      return (
        <div className="imp-vis imp-vis-image-wrap">
          <img
            src={successStoriesImg}
            alt="Success stories"
            className="imp-story-image"
          />
        </div>
      );
  }
}

const Impact = () => {
  const { section } = useParams();
  const location = useLocation();

  // Map URL params to section IDs
  const getSectionId = (sectionName) => {
    const mapping = {
      'skill-gap-problem': 'skill-gap-problem',
      'future-workforce': 'future-workforce',
      'student-outcomes': 'student-outcomes',
      'education-transformation': 'education-transformation',
      'human-potential': 'human-potential',
      'global-opportunity-access': 'global-opportunity-access',
      'sdgs-social-impact': 'sdgs-social-impact',
      'success-stories': 'success-stories'
    };
    return mapping[sectionName] || null;
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
    window.scrollTo({ top, behavior: 'smooth' });
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