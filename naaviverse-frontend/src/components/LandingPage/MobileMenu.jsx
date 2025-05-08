// import React, { Fragment, useState } from 'react';
// import { Link, useLocation, useNavigate } from 'react-router-dom';
// import {
//     ProSidebar,
//     SidebarHeader,
//     SidebarContent,
//     Menu,
//     MenuItem,
// } from 'react-pro-sidebar';
// import 'react-pro-sidebar/dist/css/styles.css';
// import Naavi from '../../images/logo/naavimobilelogo.jpg';

// const MobileMenu = () => {
//     const [click, setClick] = useState(false);
//     const location = useLocation(); // Get the current location to handle active class
//     const navigate = useNavigate(); // Use useNavigate for programmatic navigation

//     const handleClick = () => {
//         setClick(!click);
//     };

//     const handleHomeClick = () => {
//         // Close the sidebar
//         setClick(false);
//         // Navigate to homepage
//         navigate('/');
//         // Scroll to top of the page
//         window.scrollTo(0, 0);
//     };

//     const handlePartnersClick = () => {
//         // Close the sidebar
//         setClick(false); // Close the sidebar

//         // Navigate to the homepage
//         navigate('/');

//         // Delay scrolling to allow the page to load
//         setTimeout(() => {
//             const partnersSection = document.getElementById('partners-section');
//             if (partnersSection) {
//                 partnersSection.scrollIntoView({ behavior: 'smooth' });
//             }
//         }, 100); // Adjust timeout if necessary
//     };

//     const handlePageNavigation = (path) => {
//         // Close the sidebar
//         setClick(false);
//         // Scroll to top of the page before navigating
//         window.scrollTo(0, 0);
//         navigate(path);
//     };

//     return (
//         <Fragment>
//             <div className="mobile-menu-wrapper">
//                 <div className="moblie-menu-toggler">
//                     <button
//                         className={click ? "navbar-toggler active d-block d-lg-none" : "navbar-toggler d-block d-lg-none"}
//                         type="button"
//                         onClick={handleClick}
//                     >
//                         <span />
//                     </button>
//                 </div>
//                 <ProSidebar className={click ? 'mobile-menu menu-open' : 'mobile-menu'}>
//                     <SidebarHeader>
//                         <div className="mobile-logo">
//                             <Link to="/"><img src={Naavi} alt="" /></Link>
//                         </div>
//                         <div className="close-menu" onClick={handleClick}>
//                             <i className="bi bi-x-lg"></i>
//                         </div>
//                     </SidebarHeader>
//                     <SidebarContent>
//                         <Menu iconShape="square">
//                             {/* Updated Home Link */}
//                             <MenuItem className={location.pathname === '/' ? 'active' : ''} className="nav-link">
//                                 <Link to="/" onClick={handleHomeClick}>Home</Link>
//                             </MenuItem>
//                             <MenuItem className={location.pathname.startsWith('/problem') ? 'active' : ''} className="nav-link">
//                                 <Link 
//                                     to="/problem" 
//                                     onClick={() => handlePageNavigation('/problem')}
//                                 >
//                                     Problem
//                                 </Link>
//                             </MenuItem>
//                             <MenuItem className={location.pathname.startsWith('/solution') ? 'active' : ''} className="nav-link">
//                                 <Link 
//                                     to="/solution" 
//                                     onClick={() => handlePageNavigation('/solution')}
//                                 >
//                                     Solution
//                                 </Link>
//                             </MenuItem>
//                             {/* Updated Partners Menu Item */}
//                             <MenuItem className="nav-link">
//                                 <button 
//                                     onClick={handlePartnersClick} 
//                                     style={{ background: 'none', border: 'none', cursor: 'pointer' }}
//                                 >
//                                     Partners
//                                 </button>
//                             </MenuItem>
//                             <MenuItem className={location.pathname === '/contact' ? 'active' : ''} className="nav-link">
//                                 <Link 
//                                     to="/contact" 
//                                     onClick={() => handlePageNavigation('/contact')}
//                                 >
//                                     Contact
//                                 </Link>
//                             </MenuItem>
//                         </Menu>
//                     </SidebarContent>
//                 </ProSidebar>
//             </div>
//         </Fragment>
//     );
// };

// export default MobileMenu;