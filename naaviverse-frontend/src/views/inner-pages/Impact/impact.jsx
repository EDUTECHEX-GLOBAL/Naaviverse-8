import React, { Fragment } from 'react';
import './impact.scss';
import Footer from '../../../components/footernew/index';

const sections = [
  {
    id: "skill-gap-problem",
    title: "Skill Gap Problem",
    text: "The future economy is evolving faster than traditional education systems. Naavi helps bridge the global skill gap by aligning individuals with future-ready pathways, emerging industries, and real-world opportunities.",
  },
  {
    id: "future-workforce",
    title: "Future Workforce",
    text: "Tomorrow's workforce will be driven by adaptability, creativity, and intelligent skill navigation. Naavi prepares individuals for evolving careers through dynamic, AI-powered pathway intelligence.",
  },
  {
    id: "student-outcomes",
    title: "Student Outcomes",
    text: "Naavi transforms uncertainty into direction by helping students make informed, passion-aligned decisions that improve motivation, engagement, confidence, and long-term success.",
  },
  {
    id: "education-transformation",
    title: "Education Transformation",
    text: "Education should evolve from standardized systems to personalized journeys. Naavi enables a new era of data-driven, adaptive, and learner-centric navigation.",
  },
  {
    id: "human-potential",
    title: "Human Potential",
    text: "Every individual carries untapped potential. Naavi exists to help people discover, develop, and navigate toward their highest capabilities through intelligent guidance.",
  },
  {
    id: "global-opportunity-access",
    title: "Global Opportunity Access",
    text: "Access to opportunities should not depend on geography, exposure, or privilege. Naavi democratizes access to global education, skills, mentorship, and career ecosystems.",
  },
  {
    id: "sdgs-social-impact",
    title: "SDGs & Social Impact",
    text: "Naavi contributes toward building inclusive, future-ready societies by supporting quality education, decent work, reduced inequalities, innovation, and lifelong learning.",
  },
  {
    id: "success-stories",
    title: "Success Stories",
    text: "Every pathway navigated through Naavi contributes to a growing ecosystem of real human journeys — inspiring future generations through collective intelligence and shared success.",
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
          <h1 className="impact-page-title">Impact</h1>
        </div>
      </div>

      {/* ── TIMELINE ── */}
      <section className="impact-section impact-timeline-section">
        <GlowField />
        <div className="impact-container impact-relative">

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
                    <h3 className="impact-tl-title">{s.title}</h3>
                    <p className="impact-tl-desc">{s.text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>

        </div>
      </section>

     <Footer />

    </Fragment>
  );
};

export default Impact;