import React, { Fragment } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom'; // Import useNavigate instead of useHistory
import Naavi from '../../assets/images/logo/logo_01.png';
import icon from '../../assets/images/icon/icon.png';

const ThemeMainMenu = () => {
    const location = useLocation();
    const navigate = useNavigate(); // Use useNavigate for programmatic navigation

    const handleHomeClick = () => {
        // Navigate to the homepage
        navigate('/'); // Use navigate instead of history.push
        
        // Scroll to top of the page
        window.scrollTo(0, 0);
    };

    const handlePartnersClick = () => {
        // Navigate to the homepage
        navigate('/'); // Use navigate instead of history.push
        
        // Delay scrolling to allow the page to load
        setTimeout(() => {
            const partnersSection = document.getElementById('partners-section');
            if (partnersSection) {
                partnersSection.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100); // Adjust timeout as necessary
    };

    const handlePageNavigation = (path) => {
        // Scroll to top of the page before navigating
        window.scrollTo(0, 0);
        navigate(path);
    };

    return (
        <Fragment>
          <ul className="navbar-nav desktop-menu-only">

               
                {/* Updated Home Link */}
                <li className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>
                    <Link className="nav-link" to="/" onClick={handleHomeClick}>HOME </Link>
                </li>

                <li className={`nav-item dropdown ${location.pathname.startsWith('/problem') ? 'active' : ''}`}>
  <span className="nav-link dropdown-toggle flex items-center" onClick={(e) => e.preventDefault()}>
    ABOUT
    <span className="ml-1 inline-flex  items-center mb-2">
      {/* Chevron Down SVG */}
      <svg
  width="20"
  height="20"
  viewBox="0 2 20 24"
  fill="none"
  stroke="currentColor"
  strokeWidth="1.8"
  strokeLinecap="round"
  strokeLinejoin="round"
  className="inline-block"
  style={{ verticalAlign: 'middle' }}
>
  <polyline points="6 9 12 15 18 9" />
</svg>

    </span>
  </span>

  <ul className="dropdown-menu">
    <li>
      <Link to="/problem/about-us" className="dropdown-item" onClick={() => handlePageNavigation('/problem/about-us')}>
        ABOUT US
      </Link>
    </li>
    <li>
      <Link to="/problem/why-naavi" className="dropdown-item" onClick={() => handlePageNavigation('/problem/why-naavi')}>
        WHY NAAVI
      </Link>
    </li>
    <li>
      <Link to="/problem/vision-mission" className="dropdown-item" onClick={() => handlePageNavigation('/problem/vision-mission')}>
        VISION & MISSION
      </Link>
    </li>
  </ul>
</li>

<li className={`nav-item dropdown ${location.pathname.startsWith('/problem') ? 'active' : ''}`}>
  <span className="nav-link dropdown-toggle" onClick={(e) => e.preventDefault()}>
    TEAM <span className="ml-1 inline-flex  items-center mb-2">
      {/* Chevron Down SVG */}
      <svg
  width="20"
  height="20"
  viewBox="0 2 20 24"
  fill="none"
  stroke="currentColor"
  strokeWidth="1.8"
  strokeLinecap="round"
  strokeLinejoin="round"
  className="inline-block"
  style={{ verticalAlign: 'middle' }}
>
  <polyline points="6 9 12 15 18 9" />
</svg>

    </span>
  </span>

  <ul className="dropdown-menu">
    <li>
      <Link to="/problem/about-us" className="dropdown-item" onClick={() => handlePageNavigation('/problem/about-us')}>
        FOUNDERS
      </Link>
    </li>
    <li>
      <Link to="/problem/why-naavi" className="dropdown-item" onClick={() => handlePageNavigation('/problem/why-naavi')}>
        TEAM MEMBERS
      </Link>
    </li>
    <li>
      <button
  className="dropdown-item w-full text-left"
  onClick={handlePartnersClick}
>
  PARTNERS
</button>

    </li>
  </ul>
</li>

<li className={`nav-item dropdown ${location.pathname.startsWith('/problem') ? 'active' : ''}`}>
  <span className="nav-link dropdown-toggle" onClick={(e) => e.preventDefault()}>
    IMPACT <span className="ml-1 inline-flex  items-center mb-2">
      {/* Chevron Down SVG */}
      <svg
  width="20"
  height="20"
  viewBox="0 2 20 24"
  fill="none"
  stroke="currentColor"
  strokeWidth="1.8"
  strokeLinecap="round"
  strokeLinejoin="round"
  className="inline-block"
  style={{ verticalAlign: 'middle' }}
>
  <polyline points="6 9 12 15 18 9" />
</svg>

    </span>
  </span>

  <ul className="dropdown-menu">
    <li>
      <Link to="/problem" className="dropdown-item" onClick={() => handlePageNavigation('/problem/about-us')}>
        PROBLEM
      </Link>
    </li>
    <li>
      <Link to="/solution" className="dropdown-item" onClick={() => handlePageNavigation('/problem/why-naavi')}>
        SOLUTION
      </Link>
    </li>
    
  </ul>
</li>

<li className={`nav-item dropdown ${location.pathname.startsWith('/problem') ? 'active' : ''}`}>
  <span className="nav-link dropdown-toggle" onClick={(e) => e.preventDefault()}>
    TECHNOLOGY <span className="ml-1 inline-flex  items-center mb-2">
      {/* Chevron Down SVG */}
      <svg
  width="20"
  height="20"
  viewBox="0 2 20 24"
  fill="none"
  stroke="currentColor"
  strokeWidth="1.8"
  strokeLinecap="round"
  strokeLinejoin="round"
  className="inline-block"
  style={{ verticalAlign: 'middle' }}
>
  <polyline points="6 9 12 15 18 9" />
</svg>

    </span>
  </span>

  <ul className="dropdown-menu">
 <li>
  <Link
    to="/technology/pathways"
    className="dropdown-item"
    onClick={() => handlePageNavigation('/technology/pathways')}
  >
    PATHWAYS
  </Link>
</li>

<li>
  <Link
    to="/technology/llms-kgs"
    className="dropdown-item"
    onClick={() => handlePageNavigation('/technology/llms-kgs')}
  >
    LLMS-KGs
  </Link>
</li>

    
  </ul>
</li>

<li className={`nav-item dropdown ${location.pathname.startsWith('/problem') ? 'active' : ''}`}>
  <span className="nav-link " onClick={(e) => e.preventDefault()}>
    PRICING
  </span>

  {/* <ul className="dropdown-menu">
    <li>
      <Link to="/problem/about-us" className="dropdown-item" onClick={() => handlePageNavigation('/problem/about-us')}>
        PATHWAYS
      </Link>
    </li>
    <li>
      <Link to="/problem/why-naavi" className="dropdown-item" onClick={() => handlePageNavigation('/problem/why-naavi')}>
        LLMS-KGs
      </Link>
    </li>
    
  </ul> */}
</li>
<li className={`nav-item dropdown ${location.pathname.startsWith('/problem') ? 'active' : ''}`}>
  <span className="nav-link dropdown-toggle" onClick={(e) => e.preventDefault()}>
    MORE <span className="ml-1 inline-flex  items-center mb-2">
      {/* Chevron Down SVG */}
      <svg
  width="20"
  height="20"
  viewBox="0 2 20 24"
  fill="none"
  stroke="currentColor"
  strokeWidth="1.8"
  strokeLinecap="round"
  strokeLinejoin="round"
  className="inline-block"
  style={{ verticalAlign: 'middle' }}
>
  <polyline points="6 9 12 15 18 9" />
</svg>

    </span>
  </span>

  <ul className="dropdown-menu">
    <li>
      <Link to="/contact" className="dropdown-item" onClick={() => handlePageNavigation('/problem/about-us')}>
        CONTACT
      </Link>
    </li>
    <li>
      <Link to="/blog" className="dropdown-item" onClick={() => handlePageNavigation('/problem/why-naavi')}>
        BLOG & NEWS
      </Link>
    </li>
    
  </ul>
</li>




                {/* <li className={`nav-item ${location.pathname.startsWith('/problem') ? 'active' : ''}`}>
                    <Link 
                        className="nav-link" 
                        to="/problem" 
                        onClick={() => handlePageNavigation('/problem')}
                    >
                        Problem
                    </Link>
                </li> */}
                {/* <li className={`nav-item ${location.pathname.startsWith('/solution') ? 'active' : ''}`}>
                    <Link 
                        className="nav-link" 
                        to="/solution" 
                        onClick={() => handlePageNavigation('/solution')}
                    >
                        Solution
                    </Link>
                </li> */}
                {/* Updated Partners Link */}
                {/* <li className="nav-item">
                    <button 
                        onClick={handlePartnersClick} 
                        className="nav-link" 
                        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                        Partners
                    </button>
                </li> */}
                {/* <li className={`nav-item ${location.pathname === '/contact' ? 'active' : ''}`}>
                    <Link 
                        className="nav-link" 
                        to="/contact" 
                        onClick={() => handlePageNavigation('/contact')}
                    >
                        Contact
                    </Link>
                </li> */}
            </ul>
        </Fragment>
    );
};

export default ThemeMainMenu;