import React, { Fragment } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom'; // Import useNavigate instead of useHistory
import Naavi from '../../images/logo/logo_01.png';

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
            <ul className="navbar-nav">
                <li className="d-block d-lg-none">
                    <div className="logo">
                        <Link to="/"><img src={Naavi} alt="" width={130} /></Link>
                    </div>
                </li>
                {/* Updated Home Link */}
                <li className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>
                    <Link className="nav-link" to="/" onClick={handleHomeClick}>Home</Link>
                </li>
                <li className={`nav-item ${location.pathname.startsWith('/problem') ? 'active' : ''}`}>
                    <Link 
                        className="nav-link" 
                        to="/problem" 
                        onClick={() => handlePageNavigation('/problem')}
                    >
                        Problem
                    </Link>
                </li>
                <li className={`nav-item ${location.pathname.startsWith('/solution') ? 'active' : ''}`}>
                    <Link 
                        className="nav-link" 
                        to="/solution" 
                        onClick={() => handlePageNavigation('/solution')}
                    >
                        Solution
                    </Link>
                </li>
                {/* Updated Partners Link */}
                <li className="nav-item">
                    <button 
                        onClick={handlePartnersClick} 
                        className="nav-link" 
                        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                        Partners
                    </button>
                </li>
                <li className={`nav-item ${location.pathname === '/contact' ? 'active' : ''}`}>
                    <Link 
                        className="nav-link" 
                        to="/contact" 
                        onClick={() => handlePageNavigation('/contact')}
                    >
                        Contact
                    </Link>
                </li>
            </ul>
        </Fragment>
    );
};

export default ThemeMainMenu;