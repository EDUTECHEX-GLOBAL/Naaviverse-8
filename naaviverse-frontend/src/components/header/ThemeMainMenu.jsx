import React, { Fragment, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const NAAVI_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap');

  html { scroll-behavior: smooth; }

  .naavi-navbar {
    display: flex;
    align-items: center;
    font-family: 'Poppins', sans-serif;
  }

  .naavi-navbar .navbar-nav {
    display: flex;
    align-items: center;
    list-style: none;
    margin: 0;
    padding: 0;
    gap: 0;
  }

  .naavi-navbar .nav-item {
    position: relative;
  }

  .naavi-navbar .nav-link {
    font-family: 'Poppins', sans-serif;
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.07em;
    color: #1c1c2e;
    padding: 10px 13px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 5px;
    text-decoration: none;
    border-radius: 6px;
    transition: color 0.2s ease, background 0.2s ease;
    white-space: nowrap;
    user-select: none;
    position: relative;
  }

  .naavi-navbar .nav-link:hover {
    color: #2273E6;
    background: rgba(34, 115, 230, 0.05);
  }

  .naavi-navbar .nav-item.active > .nav-link {
    color: #2273E6;
  }

  .naavi-navbar .nav-item.active > .nav-link::after {
    content: '';
    position: absolute;
    bottom: 4px;
    left: 13px;
    right: 13px;
    height: 2px;
    border-radius: 2px;
    background: #2273E6;
  }

  .naavi-navbar .chevron {
    display: inline-block;
    width: 0;
    height: 0;
    border-left: 3px solid transparent;
    border-right: 3px solid transparent;
    border-top: 3.5px solid currentColor;
    transition: transform 0.22s ease;
    margin-top: 1px;
    flex-shrink: 0;
  }

  .naavi-navbar .nav-item:hover .chevron {
    transform: rotate(180deg);
  }

  .naavi-navbar .mega-menu {
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%) translateY(-2px);
    background: #ffffff;
    border: 1px solid rgba(0, 0, 0, 0.07);
    border-radius: 14px;
    box-shadow:
      0 20px 60px rgba(0, 0, 0, 0.10),
      0 4px 16px rgba(0, 0, 0, 0.06);
    padding: 6px 30px 22px;
    min-width: 220px;
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    transition:
      opacity 0.22s cubic-bezier(0.4, 0, 0.2, 1),
      transform 0.22s cubic-bezier(0.4, 0, 0.2, 1),
      visibility 0.22s;
    z-index: 9999;
  }

  .naavi-navbar .mega-menu.align-right {
    left: auto;
    right: 0;
    transform: translateY(-8px);
  }

  .naavi-navbar .mega-menu.w-2col { min-width: 460px; }
  .naavi-navbar .mega-menu.w-3col { min-width: 660px; }

  /* CSS :hover opens the dropdown */
  .naavi-navbar .nav-item:hover .mega-menu {
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
    transform: translateX(-50%) translateY(0);
  }

  .naavi-navbar .nav-item:hover .mega-menu.align-right {
    transform: translateY(0);
  }

  /* force-close overrides :hover — applied after a click, cleared on mouseleave */
  .naavi-navbar .mega-menu.force-close {
    opacity: 0 !important;
    visibility: hidden !important;
    pointer-events: none !important;
    transform: translateX(-50%) translateY(-2px) !important;
  }

  .naavi-navbar .mega-menu.align-right.force-close {
    transform: translateY(-8px) !important;
  }

  .naavi-navbar .mega-inner {
    display: grid;
    gap: 0 36px;
  }
  .naavi-navbar .mega-inner.g1 { grid-template-columns: 1fr; }
  .naavi-navbar .mega-inner.g2 { grid-template-columns: 1fr 1fr; }
  .naavi-navbar .mega-inner.g3 { grid-template-columns: 1fr 1fr 1fr; }

  .naavi-navbar .mega-col {
    display: flex;
    flex-direction: column;
  }

  .naavi-navbar .mega-col + .mega-col {
    border-left: 1px solid rgba(0, 0, 0, 0.06);
    padding-left: 28px;
  }

  .naavi-navbar .mega-heading {
    font-family: 'Poppins', sans-serif;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.13em;
    text-transform: uppercase;
    color: #a0a8b8;
    margin-bottom: 12px;
    margin-top: -4px;
  }

  .naavi-navbar .mega-item {
    font-family: 'Poppins', sans-serif;
    font-size: 15px;
    font-weight: 400;
    color: #1c1c2e;
    padding: 6.5px 0;
    text-decoration: none;
    background: none;
    border: none;
    cursor: pointer;
    text-align: left;
    width: 100%;
    letter-spacing: 0.01em;
    line-height: 1.5;
    transition: color 0.16s ease, padding-left 0.16s ease;
    display: block;
  }

  .naavi-navbar .mega-item:hover {
    color: #2273E6;
    padding-left: 5px;
  }

  .naavi-navbar .get-started-btn {
    font-family: 'Poppins', sans-serif;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.02em;
    background: #2273E6;
    color: #fff;
    border: none;
    border-radius: 8px;
    width: 100px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    margin-left: 35px;
    transition: background 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease;
    white-space: nowrap;
    box-shadow: 0 2px 12px rgba(34, 115, 230, 0.28);
  }
`;

function useInjectStyles(css) {
  useEffect(() => {
    const id = 'naavi-mega-nav-styles';
    if (!document.getElementById(id)) {
      const tag = document.createElement('style');
      tag.id = id;
      tag.textContent = css;
      document.head.appendChild(tag);
    }
  }, []);
}

const Chevron = () => <span className="chevron" aria-hidden="true" />;

const ThemeMainMenu = () => {
  useInjectStyles(NAAVI_STYLES);

  const location = useLocation();
  const navigate = useNavigate();

  // Which menu is temporarily force-closed after a click
  const [closedMenu, setClosedMenu] = useState(null);

  // Clear force-close state whenever the route changes
  useEffect(() => {
    setClosedMenu(null);
  }, [location.pathname]);

  const go = (path) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    navigate(path);
  };

  const goAbout = (hash) => {
    const sectionId = `ab-${hash}`;
    if (location.pathname === '/about') {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      navigate('/about');
      setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 400);
    }
  };

  const goSection = (sectionId) => {
    if (location.pathname === '/team') {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      navigate('/team');
      setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 420);
    }
  };

  const goImpact = (sectionId) => {
    if (location.pathname === '/impact') {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      navigate('/impact');
      setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 400);
    }
  };

  const goTechnology = (sectionId) => {
    if (location.pathname === '/technology') {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      navigate('/technology');
      setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 400);
    }
  };

  const at = (prefix) => location.pathname.startsWith(prefix);

  // Returns 'force-close' string if this menu was just clicked, else ''
  const fc = (menuName) => closedMenu === menuName ? 'force-close' : '';

  // Call on item click: hides the menu immediately
  const close = (menuName) => setClosedMenu(menuName);

  // Call on <li> mouseleave: re-enables hover for next time
  const reset = () => setClosedMenu(null);

  return (
    <Fragment>
      <div className="naavi-navbar">
        <ul className="navbar-nav desktop-menu-only">

          {/* HOME */}
          <li className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>
            <Link className="nav-link" to="/" onClick={() => go('/')}>HOME</Link>
          </li>

          {/* ABOUT */}
          <li
            className={`nav-item dropdown ${at('/about') ? 'active' : ''}`}
            onMouseLeave={reset}
          >
            <span className="nav-link">ABOUT <Chevron /></span>
            <div className={`mega-menu w-2col ${fc('about')}`}>
              <div className="mega-inner g2">
                <div className="mega-col">
                  <p className="mega-heading">Who We Are</p>
                  <button className="mega-item" onClick={() => { goAbout('what');    close('about'); }}>What is Naavi?</button>
                  <button className="mega-item" onClick={() => { goAbout('vision');  close('about'); }}>Our Vision</button>
                  <button className="mega-item" onClick={() => { goAbout('why');     close('about'); }}>Why Naavi</button>
                  <button className="mega-item" onClick={() => { goAbout('mission'); close('about'); }}>Mission & Philosophy</button>
                </div>
                <div className="mega-col">
                  <p className="mega-heading">Platform</p>
                  <button className="mega-item" onClick={() => { goAbout('problem'); close('about'); }}>The Navigation Problem</button>
                  <button className="mega-item" onClick={() => { goAbout('intel');   close('about'); }}>Pathway Intelligence</button>
                  <button className="mega-item" onClick={() => { goAbout('verse');   close('about'); }}>Naaviverse</button>
                </div>
              </div>
            </div>
          </li>

          {/* TEAM */}
          <li
            className={`nav-item dropdown ${at('/team') ? 'active' : ''}`}
            onMouseLeave={reset}
          >
            <span className="nav-link">TEAM <Chevron /></span>
            <div className={`mega-menu ${fc('team')}`}>
              <div className="mega-inner g1">
                <div className="mega-col">
                  <p className="mega-heading">Our People</p>
                  <button className="mega-item" onClick={() => { goSection('founders'); close('team'); }}>Founders</button>
                </div>
              </div>
            </div>
          </li>

          {/* IMPACT */}
          <li
            className={`nav-item dropdown ${at('/impact') ? 'active' : ''}`}
            onMouseLeave={reset}
          >
            <span className="nav-link">IMPACT <Chevron /></span>
            <div className={`mega-menu w-3col ${fc('impact')}`}>
              <div className="mega-inner g3">
                <div className="mega-col">
                  <p className="mega-heading">The Problem</p>
                  <button className="mega-item" onClick={() => { goImpact('skill-gap-problem');  close('impact'); }}>Skill Gap Problem</button>
                  <button className="mega-item" onClick={() => { goImpact('future-workforce');    close('impact'); }}>Future Workforce</button>
                  <button className="mega-item" onClick={() => { goImpact('human-potential');     close('impact'); }}>Human Potential</button>
                </div>
                <div className="mega-col">
                  <p className="mega-heading">Outcomes</p>
                  <button className="mega-item" onClick={() => { goImpact('student-outcomes');          close('impact'); }}>Student Outcomes</button>
                  <button className="mega-item" onClick={() => { goImpact('education-transformation');  close('impact'); }}>Education Transformation</button>
                  <button className="mega-item" onClick={() => { goImpact('success-stories');           close('impact'); }}>Success Stories</button>
                </div>
                <div className="mega-col">
                  <p className="mega-heading">Global Reach</p>
                  <button className="mega-item" onClick={() => { goImpact('global-opportunity-access'); close('impact'); }}>Global Opportunity Access</button>
                  <button className="mega-item" onClick={() => { goImpact('sdgs-social-impact');        close('impact'); }}>SDGs & Social Impact</button>
                </div>
              </div>
            </div>
          </li>

          {/* TECHNOLOGY */}
          <li
            className={`nav-item dropdown ${at('/technology') ? 'active' : ''}`}
            onMouseLeave={reset}
          >
            <span className="nav-link">TECHNOLOGY <Chevron /></span>
            <div className={`mega-menu ${fc('technology')}`}>
              <div className="mega-inner g1">
                <div className="mega-col">
                  <p className="mega-heading">Core Tech</p>
                  <button className="mega-item" onClick={() => { goTechnology('pathways');  close('technology'); }}>Pathways</button>
                  <button className="mega-item" onClick={() => { goTechnology('llms-kgs'); close('technology'); }}>LLM's – KG's</button>
                </div>
              </div>
            </div>
          </li>

          {/* MORE */}
          <li
            className={`nav-item dropdown ${location.pathname === '/contact' ? 'active' : ''}`}
            onMouseLeave={reset}
          >
            <span className="nav-link">MORE <Chevron /></span>
            <div className={`mega-menu align-right ${fc('more')}`}>
              <div className="mega-inner g1">
                <div className="mega-col">
                  <p className="mega-heading">Get in Touch</p>
                  <Link className="mega-item" to="/contact" onClick={() => { go('/contact'); close('more'); }}>Contact</Link>
                </div>
              </div>
            </div>
          </li>

        </ul>

        {/* CTA */}
        <div className="nav-auth-buttons">
          <button className="get-started-btn" onClick={() => go('/login')}>
            Get Started
          </button>
        </div>
      </div>
    </Fragment>
  );
};

export default ThemeMainMenu;