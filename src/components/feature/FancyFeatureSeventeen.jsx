import React, { Fragment, useEffect, useRef, useState } from 'react';
import icon31 from "../../assets/images/icon/icon_3131.png";
import icon32 from "../../assets/images/icon/icon_3232.png";
import icon33 from "../../assets/images/icon/icon_3333.png";

const ServiceContent = [
  {
    icon: icon32,
    title: "Smart Path Guidance",
    desc: "Get personalized recommendations based on your interests, strengths, and goals",
    color: "#E1F0FA",  // Soft blue
    gradient: "linear-gradient(135deg, rgba(225, 240, 250, 0.75) 0%, rgba(200, 225, 245, 0.65) 100%)",
    borderColor: "rgba(120, 170, 210, 0.25)"
  },
  {
    icon: icon31,
    title: "Structured Learning Roadmaps",
    desc: "Follow step-by-step plans that guide you to target at every stage of your journey.",
    color: "#E0F0E8",  // Soft green-blue
    gradient: "linear-gradient(135deg, rgba(224, 240, 232, 0.75) 0%, rgba(190, 225, 210, 0.65) 100%)",
    borderColor: "rgba(100, 170, 150, 0.25)"
  },
  {
    icon: icon33,
    title: "Insights & Expert Support",
    desc: "Access smart insights, curated resources, and one-to-one guidance to make confident decisions",
    color: "#FFF2D9",  // Soft yellow
    gradient: "linear-gradient(135deg, rgba(255, 242, 217, 0.75) 0%, rgba(250, 230, 190, 0.65) 100%)",
    borderColor: "rgba(220, 180, 120, 0.25)"
  }
];

const FancyFeatureSeventeen = () => {
  const containerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      {
        threshold: 0.2
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  return (
    <Fragment> 
      <div className="fancy-feature-seventeen-container" ref={containerRef}>
        <div className="fancy-feature-seventeen">
          <div className="features-grid">
            {ServiceContent.map((val, i) => (
              <div 
                key={i} 
                className={`feature-card ${isVisible ? 'visible' : ''}`}
                style={{ 
                  '--card-gradient': val.gradient,
                  '--card-color': val.color,
                  '--border-color': val.borderColor,
                  '--delay': `${i * 0.15}s`
                }}
              >
                <div className="card-inner">
                  <div className="icon-wrapper">
                    <img 
                      src={val.icon} 
                      alt={val.title} 
                      className="icon-image"
                    />
                    <div className="icon-glow"></div>
                  </div>
                  
                  <h3 className="card-title">
                    {val.title}
                  </h3>
                  
                  <p className="card-description">{val.desc}</p>
                  
                  <button className="action-button">
                    Explore Feature
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
                
                <div className="card-shadow"></div>
                <div className="card-highlight"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .fancy-feature-seventeen-container {
          padding: 60px 20px;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .fancy-feature-seventeen-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, #e5e7eb, transparent);
        }

        .fancy-feature-seventeen {
          max-width: 1100px;
          width: 100%;
          margin: 0 auto;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        @media (max-width: 1024px) {
          .features-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .features-grid {
            grid-template-columns: 1fr;
            max-width: 400px;
            margin: 0 auto;
          }
        }

        .feature-card {
  position: relative;
  background: var(--card-gradient);
  border-radius: 20px;
  padding: 24px 24px;  /* REDUCED: from 32px 28px */
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  opacity: 0;
  transform: translateY(20px);
  height: 100%;
  border: 1px solid var(--border-color);
  overflow: hidden;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.03);
}

        .feature-card.visible {
          opacity: 1;
          transform: translateY(0);
          animation: cardAppear 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          animation-delay: var(--delay);
        }

        .card-shadow {
          position: absolute;
          top: 8px;
          left: 8px;
          right: 8px;
          bottom: -8px;
          background: rgba(0, 0, 0, 0.03);
          border-radius: 20px;
          z-index: -1;
          transition: all 0.4s ease;
          filter: blur(14px);
          opacity: 0.5;
        }

        .feature-card:hover {
          transform: translateY(-8px);
          background: var(--card-gradient);
          border-color: rgba(255, 255, 255, 0.6);
          box-shadow: 
            0 30px 50px rgba(0, 0, 0, 0.05),
            0 10px 25px rgba(0, 0, 0, 0.03);
        }

        .feature-card:hover .card-shadow {
          opacity: 0.6;
          transform: translateY(12px);
          filter: blur(18px);
        }

        .card-highlight {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, 
            transparent, 
            rgba(255, 255, 255, 0.8), 
            transparent);
          opacity: 0;
          transition: opacity 0.4s ease;
        }

        .feature-card:hover .card-highlight {
          opacity: 1;
          animation: highlightSlide 2.5s ease-in-out infinite;
        }

        .card-inner {
          display: flex;
          flex-direction: column;
          height: 100%;
          position: relative;
          z-index: 1;
        }

        .icon-wrapper {
  position: relative;
  width: 72px;
  height: 72px;
  margin-bottom: 16px;  /* REDUCED: from 26px */
  display: flex;
  align-items: center;
  justify-content: center;
}

        .icon-image {
          width: 54px;
          height: 54px;
          object-fit: contain;
          filter: drop-shadow(0 6px 10px rgba(0, 0, 0, 0.08));
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
          z-index: 2;
        }

        .feature-card:hover .icon-image {
          transform: scale(1.15) translateY(-4px);
          filter: drop-shadow(0 12px 20px rgba(0, 0, 0, 0.12));
        }

        .icon-glow {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: var(--card-color);
          border-radius: 20px;
          filter: blur(14px);
          opacity: 0.5;
          transition: opacity 0.5s ease;
          z-index: 1;
        }

        .feature-card:hover .icon-glow {
          opacity: 0.7;
          animation: iconPulse 2.5s ease-in-out infinite;
        }

        .card-title {
  font-size: 1.4rem;
  font-weight: 600;
  color: #1a1f2e;
  margin-bottom: 12px;  /* REDUCED: from 18px */
  line-height: 1.4;
  position: relative;
  letter-spacing: -0.01em;
}

        .card-title::after {
          content: '';
          position: absolute;
          bottom: -8px;
          left: 0;
          width: 40px;
          height: 3px;
          background: linear-gradient(90deg, rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0.08));
          border-radius: 2px;
          transition: width 0.4s ease;
        }

        .feature-card:hover .card-title::after {
          width: 60px;
        }

        .card-description {
  color: #2e3440;
  line-height: 1.65;
  font-size: 0.98rem;
  margin-bottom: 20px;  /* REDUCED: from 30px */
  flex-grow: 1;
  opacity: 0.85;
  transition: opacity 0.3s ease;
}

        .feature-card:hover .card-description {
          opacity: 1;
        }

        .action-button {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 12px 24px;
          background: rgba(255, 255, 255, 0.85);
          color: #2a2f3f;
          border: 1px solid rgba(255, 255, 255, 0.9);
          border-radius: 30px;
          font-weight: 500;
          font-size: 0.92rem;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          margin-top: auto;
          backdrop-filter: blur(8px);
          box-shadow: 0 6px 15px rgba(0, 0, 0, 0.03);
          width: fit-content;
        }

        .action-button:hover {
          background: rgba(255, 255, 255, 0.95);
          transform: translateX(6px);
          box-shadow: 
            0 10px 25px rgba(0, 0, 0, 0.06),
            0 5px 12px rgba(0, 0, 0, 0.03);
        }

        .action-button svg {
          transition: transform 0.3s ease;
        }

        .action-button:hover svg {
          transform: translateX(5px);
        }

        @keyframes cardAppear {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes highlightSlide {
          0%, 100% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(100%);
          }
        }

        @keyframes iconPulse {
          0%, 100% {
            opacity: 0.7;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.15);
          }
        }
@media (max-width: 768px) {
  .fancy-feature-seventeen-container {
    padding: 48px 16px;
  }

  .feature-card {
    padding: 22px 20px;  /* REDUCED: from 28px 24px */
  }

  .icon-wrapper {
    width: 64px;
    height: 64px;
    margin-bottom: 14px;  /* REDUCED: from 24px */
  }

  .icon-image {
    width: 48px;
    height: 48px;
  }

  .card-title {
    font-size: 1.3rem;
    margin-bottom: 10px;  /* ADDED: consistent spacing */
  }

  .card-description {
    font-size: 0.93rem;
    margin-bottom: 18px;  /* ADDED: consistent spacing */
  }

  .action-button {
    padding: 11px 22px;
    font-size: 0.88rem;
  }
}

      @media (max-width: 480px) {
  .fancy-feature-seventeen-container {
    padding: 40px 12px;
  }

  .feature-card {
    padding: 20px 18px;  /* REDUCED: from 24px 20px */
  }

  .icon-wrapper {
    width: 56px;
    height: 56px;
    margin-bottom: 12px;  /* ADDED: consistent spacing */
  }

  .icon-image {
    width: 42px;
    height: 42px;
  }

  .card-title {
    font-size: 1.2rem;
    margin-bottom: 8px;  /* ADDED: consistent spacing */
  }

  .card-description {
    font-size: 0.9rem;
    margin-bottom: 16px;  /* ADDED: consistent spacing */
  }

  .features-grid {
    gap: 20px;
  }
}
      `}</style>
    </Fragment>
  );
};

export default FancyFeatureSeventeen;