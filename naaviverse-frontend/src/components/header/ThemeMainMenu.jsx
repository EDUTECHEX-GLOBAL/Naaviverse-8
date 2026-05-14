import React, { Fragment, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

/* ─────────────────────────────────────────────────────────────
   STYLES — Poppins + mega-dropdown panel (injected once)
   Written as SCSS-flavored CSS (compiled-compatible)
───────────────────────────────────────────────────────────── */
const NAAVI_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap');

  html { scroll-behavior: smooth; }

  /* ── Wrapper ── */
  .naavi-navbar {
    display: flex;
    align-items: center;
    font-family: 'Poppins', sans-serif;
  }

  /* ── Top nav list ── */
  .naavi-navbar .navbar-nav {
    display: flex;
    align-items: center;
    list-style: none;
    margin: 0;
    padding: 0;
    gap: 0;
  }

  /* ── Nav item wrapper ── */
  .naavi-navbar .nav-item {
    position: relative;
  }

  /* ── Nav link (top level) ── */
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

  /* active underline */
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

  /* ── Chevron ── */
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

  /* ── Mega dropdown panel ── */
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

  /* right-aligned for last items */
  .naavi-navbar .mega-menu.align-right {
    left: auto;
    right: 0;
    transform: translateY(-8px);
  }

  /* width variants */
  .naavi-navbar .mega-menu.w-2col { min-width: 460px; }
  .naavi-navbar .mega-menu.w-3col { min-width: 660px; }

  /* open state */
  .naavi-navbar .nav-item:hover .mega-menu {
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
    transform: translateX(-50%) translateY(0);
  }

  .naavi-navbar .nav-item:hover .mega-menu.align-right {
    transform: translateY(0);
  }

  /* ── Inner grid ── */
  .naavi-navbar .mega-inner {
    display: grid;
    gap: 0 36px;
  }
  .naavi-navbar .mega-inner.g1 { grid-template-columns: 1fr; }
  .naavi-navbar .mega-inner.g2 { grid-template-columns: 1fr 1fr; }
  .naavi-navbar .mega-inner.g3 { grid-template-columns: 1fr 1fr 1fr; }

  /* ── Column ── */
  .naavi-navbar .mega-col {
    display: flex;
    flex-direction: column;
  }

  .naavi-navbar .mega-col + .mega-col {
    border-left: 1px solid rgba(0, 0, 0, 0.06);
    padding-left: 28px;
  }

  /* ── Column heading ── */
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

  /* ── Dropdown item (link or button) ── */
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

  transition: background 0.2s ease,
              transform 0.15s ease,
              box-shadow 0.2s ease;

  white-space: nowrap;
  box-shadow: 0 2px 12px rgba(34, 115, 230, 0.28);
}
  
`;

/* ── Inject styles once into <head> ── */
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

/* ── Chevron icon component ── */
const Chevron = () => <span className="chevron" aria-hidden="true" />;

/* ─────────────────────────────────────────────────────────────
   ThemeMainMenu
───────────────────────────────────────────────────────────── */
const ThemeMainMenu = () => {
    useInjectStyles(NAAVI_STYLES);

    const location = useLocation();
    const navigate = useNavigate();

    /* smooth-scroll to top then navigate */
    const go = (path) => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        navigate(path);
    };
const goAbout = (hash) => {
    // Convert hash to match AboutPage IDs: 'what' -> 'ab-what', 'vision' -> 'ab-vision', etc.
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
       /* scroll to a section on /team */
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
    const at = (prefix) => location.pathname.startsWith(prefix);

    return (
        <Fragment>
            <div className="naavi-navbar">
                <ul className="navbar-nav desktop-menu-only">

                    {/* ── HOME ── */}
                    <li className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>
                        <Link className="nav-link" to="/" onClick={() => go('/')}>HOME</Link>
                    </li>

                    {/* ── ABOUT ── 2 columns */}
                    <li className={`nav-item dropdown ${at('/about') ? 'active' : ''}`}>
                        <span className="nav-link">ABOUT <Chevron /></span>
                        <div className="mega-menu w-2col">
                            <div className="mega-inner g2">
                                <div className="mega-col">
                                    <p className="mega-heading">Who We Are</p>
                                    <button className="mega-item" onClick={() => goAbout('what')}>What is Naavi?</button>
                                    <button className="mega-item" onClick={() => goAbout('vision')}>Our Vision</button>
                                    <button className="mega-item" onClick={() => goAbout('why')}>Why Naavi</button>
                                    <button className="mega-item" onClick={() => goAbout('mission')}>Mission & Philosophy</button>
                                </div>
                                <div className="mega-col">
                                    <p className="mega-heading">Platform</p>
                                    <button className="mega-item" onClick={() => goAbout('problem')}>The Navigation Problem</button>
                                    <button className="mega-item" onClick={() => goAbout('intel')}>Pathway Intelligence</button>
                                    <button className="mega-item" onClick={() => goAbout('verse')}>Naaviverse</button>
                                </div>
                            </div>
                        </div>
                    </li>

                    {/* ── TEAM ── single col */}
                    <li className={`nav-item dropdown ${at('/team') ? 'active' : ''}`}>
                        <span className="nav-link">TEAM <Chevron /></span>
                        <div className="mega-menu">
                            <div className="mega-inner g1">
                                <div className="mega-col">
                                    <p className="mega-heading">Our People</p>
                                    <button className="mega-item" onClick={() => goSection('founders')}>Founders</button>
                                </div>
                            </div>
                        </div>
                    </li>

                 {/* ── IMPACT ── 3 columns */}
<li className={`nav-item dropdown ${at('/impact') ? 'active' : ''}`}>
    <span className="nav-link">IMPACT <Chevron /></span>
    <div className="mega-menu w-3col">
        <div className="mega-inner g3">
            <div className="mega-col">
                <p className="mega-heading">The Problem</p>
                <button className="mega-item" onClick={() => goImpact('skill-gap-problem')}>Skill Gap Problem</button>
                <button className="mega-item" onClick={() => goImpact('future-workforce')}>Future Workforce</button>
                <button className="mega-item" onClick={() => goImpact('human-potential')}>Human Potential</button>
            </div>
            <div className="mega-col">
                <p className="mega-heading">Outcomes</p>
                <button className="mega-item" onClick={() => goImpact('student-outcomes')}>Student Outcomes</button>
                <button className="mega-item" onClick={() => goImpact('education-transformation')}>Education Transformation</button>
                <button className="mega-item" onClick={() => goImpact('success-stories')}>Success Stories</button>
            </div>
            <div className="mega-col">
                <p className="mega-heading">Global Reach</p>
                <button className="mega-item" onClick={() => goImpact('global-opportunity-access')}>Global Opportunity Access</button>
                <button className="mega-item" onClick={() => goImpact('sdgs-social-impact')}>SDGs & Social Impact</button>
            </div>
        </div>
    </div>
</li>
                   {/* ── TECHNOLOGY ── single col */}
<li className={`nav-item dropdown ${at('/technology') ? 'active' : ''}`}>
    <span className="nav-link">TECHNOLOGY <Chevron /></span>
    <div className="mega-menu">
        <div className="mega-inner g1">
            <div className="mega-col">
                <p className="mega-heading">Core Tech</p>
                <Link className="mega-item" to="/technology/pathways" onClick={() => go('/technology/pathways')}>Pathways</Link>
                <Link className="mega-item" to="/technology/llms-kgs" onClick={() => go('/technology/llms-kgs')}>LLM's – KG's</Link>
            </div>
        </div>
    </div>
</li>

                    {/* ── MORE ── right-aligned, single col */}
                    <li className={`nav-item dropdown ${location.pathname === '/contact' ? 'active' : ''}`}>
                        <span className="nav-link">MORE <Chevron /></span>
                        <div className="mega-menu align-right">
                            <div className="mega-inner g1">
                                <div className="mega-col">
                                    <p className="mega-heading">Get in Touch</p>
                                    <Link className="mega-item" to="/contact" onClick={() => go('/contact')}>Contact</Link>
                                </div>
                            </div>
                        </div>
                    </li>

                </ul>

                {/* ── CTA ── */}
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