import React, { Fragment } from 'react';
import {
  HiOutlineSparkles,
  HiOutlineGlobeAlt,
  HiOutlineAcademicCap,
  HiOutlineUserGroup,
  HiOutlineLightBulb,
  HiOutlineChartBar,
  HiOutlineHeart,
  HiOutlineArrowRight,
  HiOutlineBriefcase,
} from "react-icons/hi";
import './impact.scss';
import Footer from '../../../components/footernew/index';
const sections = [
  {
    id: "skill-gap-problem",
    label: "01 / Problem",
    title: "Skill Gap Problem",
    text: "The future economy is evolving faster than traditional education systems. Naavi helps bridge the global skill gap by aligning individuals with future-ready pathways, emerging industries, and real-world opportunities.",
    Icon: HiOutlineChartBar,
    stat: "120M+",
    statLabel: "Global skill shortfall by 2030",
  },
  {
    id: "future-workforce",
    label: "02 / Workforce",
    title: "Future Workforce",
    text: "Tomorrow's workforce will be driven by adaptability, creativity, and intelligent skill navigation. Naavi prepares individuals for evolving careers through dynamic, AI-powered pathway intelligence.",
    Icon: HiOutlineBriefcase,
    stat: "AI-Era",
    statLabel: "Adaptive career navigation",
  },
  {
    id: "student-outcomes",
    label: "03 / Outcomes",
    title: "Student Outcomes",
    text: "Naavi transforms uncertainty into direction by helping students make informed, passion-aligned decisions that improve motivation, engagement, confidence, and long-term success.",
    Icon: HiOutlineAcademicCap,
    stat: "98%",
    statLabel: "Report clearer direction",
  },
  {
    id: "education-transformation",
    label: "04 / Transformation",
    title: "Education Transformation",
    text: "Education should evolve from standardized systems to personalized journeys. Naavi enables a new era of data-driven, adaptive, and learner-centric navigation.",
    Icon: HiOutlineSparkles,
    stat: "Personalized",
    statLabel: "Learner-centric pathways",
  },
  {
    id: "human-potential",
    label: "05 / Potential",
    title: "Human Potential",
    text: "Every individual carries untapped potential. Naavi exists to help people discover, develop, and navigate toward their highest capabilities through intelligent guidance.",
    Icon: HiOutlineLightBulb,
    stat: "1:1",
    statLabel: "Intelligent guidance per learner",
  },
  {
    id: "global-opportunity-access",
    label: "06 / Access",
    title: "Global Opportunity Access",
    text: "Access to opportunities should not depend on geography, exposure, or privilege. Naavi democratizes access to global education, skills, mentorship, and career ecosystems.",
    Icon: HiOutlineGlobeAlt,
    stat: "Global",
    statLabel: "Borderless ecosystems",
  },
  {
    id: "sdgs-social-impact",
    label: "07 / Society",
    title: "SDGs & Social Impact",
    text: "Naavi contributes toward building inclusive, future-ready societies by supporting quality education, decent work, reduced inequalities, innovation, and lifelong learning.",
    Icon: HiOutlineUserGroup,
    stat: "5 SDGs",
    statLabel: "Education · Work · Equality",
  },
  {
    id: "success-stories",
    label: "08 / Stories",
    title: "Success Stories",
    text: "Every pathway navigated through Naavi contributes to a growing ecosystem of real human journeys — inspiring future generations through collective intelligence and shared success.",
    Icon: HiOutlineHeart,
    stat: "1000+",
    statLabel: "Journeys navigated",
  },
];

function GlowField() {
  return (
    <div aria-hidden="true" className="impact-glow-wrap">
      <div className="impact-glow-1" />
      <div className="impact-glow-2" />
      <div className="impact-glow-3" />
    </div>
  );
}

const Impact = () => {
  return (
    <Fragment>

      {/* ── PAGE HEADER ── */}
      <div className="impact-page-header">
        <div className="impact-container">
          <p className="impact-crumb">IMPACT</p>
          <h1 className="impact-page-title">Our Impact</h1>
        </div>
      </div>

      {/* ── BENTO OVERVIEW ── */}
      <section className="impact-section impact-bento">
        <GlowField />
        <div className="impact-container impact-relative">
          <div className="impact-center-hd">
            <p className="impact-eyebrow">Impact at a glance</p>
            <h2>Naavi's impact, mapped end-to-end</h2>
            <p className="impact-sub">Eight interconnected dimensions — from the skill gap to real human stories — powered by intelligent navigation.</p>
          </div>

          <div className="impact-bento-grid">
            <a href="#skill-gap-problem" className="impact-bento-big">
              <p className="impact-tag">THE GAP</p>
              <p className="impact-big-stat">120M+</p>
              <p className="impact-big-desc">Global skill shortfall by 2030 — Naavi is built to close it.</p>
              <div className="impact-explore-link">
                Explore the problem <HiOutlineArrowRight className="impact-arrow" />
              </div>
            </a>

            <a href="#student-outcomes" className="impact-bento-sm impact-bento-green">
              <p className="impact-tag">OUTCOMES</p>
              <p className="impact-sm-stat">98%</p>
              <p className="impact-sm-desc">Clearer career direction</p>
            </a>

            <a href="#success-stories" className="impact-bento-sm impact-bento-white">
              <p className="impact-tag impact-tag-primary">STORIES</p>
              <p className="impact-sm-stat impact-stat-navy">1000+</p>
              <p className="impact-sm-desc impact-desc-muted">Real journeys navigated</p>
            </a>

            <a href="#sdgs-social-impact" className="impact-bento-sm impact-bento-mint">
              <p className="impact-tag impact-tag-primary">SDGs</p>
              <p className="impact-sm-stat impact-stat-navy">5</p>
              <p className="impact-sm-desc impact-desc-navy">Goals advanced</p>
            </a>

            <a href="#global-opportunity-access" className="impact-bento-sm impact-bento-blue">
              <p className="impact-tag">REACH</p>
              <p className="impact-sm-stat">Global</p>
              <p className="impact-sm-desc">Borderless opportunity</p>
            </a>
          </div>
        </div>
      </section>

      {/* ── HORIZONTAL SCROLL STRIP ── */}
      <section className="impact-section impact-strip-section">
        <div className="impact-container">
          <p className="impact-eyebrow">The journey</p>
          <h2>Eight chapters of impact</h2>
          <p className="impact-sub">Scroll horizontally — every card opens that section below.</p>
        </div>
        <div className="impact-hscroll-wrap">
          <div className="impact-hscroll-inner">
            {sections.map((s) => (
              <a key={s.id} href={`#${s.id}`} className="impact-hcard">
                <div className="impact-hcard-icon">
                  <s.Icon size={22} />
                </div>
                <p className="impact-hcard-label">{s.label}</p>
                <p className="impact-hcard-title">{s.title}</p>
                <p className="impact-hcard-stat">{s.stat}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── TIMELINE ── */}
      <section className="impact-section impact-timeline-section">
        <GlowField />
        <div className="impact-container impact-relative">
          <div className="impact-center-hd">
            <p className="impact-eyebrow">Deep dive</p>
            <h2>Storyline of transformation</h2>
          </div>

          <div className="impact-timeline-wrap">
            <div className="impact-timeline-line" />
            <div className="impact-timeline-list">
              {sections.map((s, i) => (
                <article
                  key={s.id}
                  id={s.id}
                  className={`impact-tl-article ${i % 2 ? 'impact-tl-reverse' : ''}`}
                >
                  <div className="impact-tl-text">
                    <div className="impact-tl-dot" />
                    <p className="impact-eyebrow">{s.label}</p>
                    <h3 className="impact-tl-title">{s.title}</h3>
                    <p className="impact-tl-desc">{s.text}</p>
                  </div>

                  <div className="impact-tl-card">
                    <div className="impact-tl-card-row">
                      <div className="impact-tl-icon">
                        <s.Icon size={26} />
                      </div>
                      <div>
                        <p className="impact-tl-stat">{s.stat}</p>
                        <p className="impact-tl-stat-label">{s.statLabel}</p>
                      </div>
                    </div>
                    <div className="impact-tl-bar">
                      <div className="impact-tl-bar-fill" style={{ width: `${20 + i * 10}%` }} />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CLOSING PANEL ── */}
      <section className="impact-closing">
        <div className="impact-closing-glow impact-closing-glow-1" />
        <div className="impact-closing-glow impact-closing-glow-2" />
        <div className="impact-container impact-closing-inner">
          <span className="impact-closing-badge">IMPACT, COMPOUNDED</span>
          <h2 className="impact-closing-title">Every pathway navigated, every life redirected.</h2>
          <p className="impact-closing-desc">
            Naavi is more than a platform — it is an ever-growing ecosystem of intelligent human navigation, designed to scale impact across generations.
          </p>
        </div>
      </section>

    </Fragment>
  );
};

export default Impact;