import React, { Fragment } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const ThemeMainMenu = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const handleSectionNavigation = (sectionId) => {

    if (location.pathname === "/team-details") {

        const element = document.getElementById(sectionId);

        if (element) {
            element.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }

    } else {

        navigate("/team-details");

        setTimeout(() => {

            const element = document.getElementById(sectionId);

            if (element) {
                element.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }

        }, 400);

    }
};


const handlePartnersNavigation = () => {

    if (location.pathname === "/") {

        const element = document.getElementById("partners-section");

        if (element) {
            element.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }

    } else {

        navigate("/");

        setTimeout(() => {

            const element = document.getElementById("partners-section");

            if (element) {
                element.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }

        }, 400);

    }
};


    const handleHomeClick = () => {
        navigate('/');
        window.scrollTo(0, 0);
    };


    const handlePageNavigation = (path) => {
        window.scrollTo(0, 0);
        navigate(path);
    };

    return (
        <Fragment>
            {/* Navigation Menu Items */}
            <ul className="navbar-nav desktop-menu-only">
                {/* Home Link */}
                <li className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>
                    <Link className="nav-link" to="/" onClick={handleHomeClick}>HOME</Link>
                </li>

                {/* ABOUT Dropdown */}
                <li className={`nav-item dropdown ${location.pathname.startsWith('/problem') ? 'active' : ''}`}>
                    <span className="nav-link dropdown-toggle" onClick={(e) => e.preventDefault()}>
                        ABOUT
                        <span 
    style={{
        display: 'inline-block',
        width: '0',
        height: '0',
        borderLeft: '4px solid transparent',
        borderRight: '4px solid transparent',
        borderTop: '4px solid currentColor',
        marginLeft: '4px'
    }}
/>
                    </span>
                    <ul className="dropdown-menu">
                       <li>
    <Link
        to="/problem/about-us#who-we-are"
        className="dropdown-item"
    >
        ABOUT US
    </Link>
</li>

<li>
    <Link
        to="/problem/about-us#why-naavi"
        className="dropdown-item"
    >
        WHY NAAVI
    </Link>
</li>

<li>
    <Link
        to="/problem/about-us#vision-mission"
        className="dropdown-item"
    >
        VISION & MISSION
    </Link>
</li>

                    </ul>
                </li>

                {/* TEAM Dropdown */}
                <li className={`nav-item dropdown ${location.pathname.startsWith('/problem') ? 'active' : ''}`}>
                    <span className="nav-link dropdown-toggle" onClick={(e) => e.preventDefault()}>
                        TEAM
                        <span 
    style={{
        display: 'inline-block',
        width: '0',
        height: '0',
        borderLeft: '4px solid transparent',
        borderRight: '4px solid transparent',
        borderTop: '4px solid currentColor',
        marginLeft: '4px'
    }}
/>
                    </span>
                    <ul className="dropdown-menu">
                        <li>
     <button
    className="dropdown-item w-full text-left"
    onClick={() => handleSectionNavigation("founders")}
>
    FOUNDERS
</button>


                        </li>
                        <li>
  <button
    className="dropdown-item w-full text-left"
    onClick={() => handleSectionNavigation("team-members")}
>
    TEAM MEMBERS
</button>


                        </li>
                        <li>
  <button
    className="dropdown-item w-full text-left"
    onClick={handlePartnersNavigation}
>
    PARTNERS
</button>



                        </li>
                    </ul>
                </li>

                {/* IMPACT Dropdown */}
                <li className={`nav-item dropdown ${location.pathname.startsWith('/impact') ? 'active' : ''}`}>
                    <span className="nav-link dropdown-toggle" onClick={(e) => e.preventDefault()}>
                        IMPACT
                        <span 
    style={{
        display: 'inline-block',
        width: '0',
        height: '0',
        borderLeft: '4px solid transparent',
        borderRight: '4px solid transparent',
        borderTop: '4px solid currentColor',
        marginLeft: '4px'
    }}
/>
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

                {/* TECHNOLOGY Dropdown */}
                <li className={`nav-item dropdown ${location.pathname.startsWith('/technology') ? 'active' : ''}`}>
                    <span className="nav-link dropdown-toggle" onClick={(e) => e.preventDefault()}>
                        TECHNOLOGY
                        <span 
    style={{
        display: 'inline-block',
        width: '0',
        height: '0',
        borderLeft: '4px solid transparent',
        borderRight: '4px solid transparent',
        borderTop: '4px solid currentColor',
        marginLeft: '4px'
    }}
/>
                    </span>
                    <ul className="dropdown-menu">
                        <li>
                            <Link to="/technology/pathways" className="dropdown-item" onClick={() => handlePageNavigation('/technology/pathways')}>
                                PATHWAYS
                            </Link>
                        </li>
                        <li>
                            <Link to="/technology/llms-kgs" className="dropdown-item" onClick={() => handlePageNavigation('/technology/llms-kgs')}>
                                LLMS-KGs
                            </Link>
                        </li>
                    </ul>
                </li>

                {/* MORE Dropdown */}
                <li className={`nav-item dropdown ${location.pathname.startsWith('/more') ? 'active' : ''}`}>
                    <span className="nav-link dropdown-toggle" onClick={(e) => e.preventDefault()}>
                        MORE
                        <span 
    style={{
        display: 'inline-block',
        width: '0',
        height: '0',
        borderLeft: '4px solid transparent',
        borderRight: '4px solid transparent',
        borderTop: '4px solid currentColor',
        marginLeft: '4px'
    }}
/>
                    </span>
                    <ul className="dropdown-menu">
                        <li>
                            <Link to="/contact" className="dropdown-item" onClick={() => handlePageNavigation('/contact')}>
                                CONTACT
                            </Link>
                        </li>
                        <li>
                            <Link to="/blog" className="dropdown-item" onClick={() => handlePageNavigation('/blog')}>
                                BLOG & NEWS
                            </Link>
                        </li>
                    </ul>
                </li>
            </ul>

            {/* AUTH BUTTONS - EXACTLY LIKE REFERENCE IMAGE */}
            <div className="nav-auth-buttons">
                {/* <span 
                    className="login-text"
                    onClick={() => handlePageNavigation('/login')}
                    style={{ 
                        color: '#002244',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        padding: '6px 12px'
                    }}
                >
                    Log In
                </span> */}
                <button 
    className="get-started-btn"
    onClick={() => handlePageNavigation('/login')}
    style={{
        background: '#2273E6', // Purple color
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        padding: '0px 8px', // Reduced vertical padding for smaller height
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'background 0.2s',
        marginLeft: '50px' // Moves button to the right
    }}
    // onMouseEnter={(e) => e.target.style.background = '#7b1fa2'}
    // onMouseLeave={(e) => e.target.style.background = '#8a2be2'}
>
    Get Started
</button>
            </div>
        </Fragment>
    );
};

export default ThemeMainMenu;