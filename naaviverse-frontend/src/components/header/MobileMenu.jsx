// import React from 'react';
// import { Link, useLocation, useNavigate } from 'react-router-dom';
// import {
//   ProSidebar,
//   SidebarHeader,
//   SidebarContent,
//   Menu,
//   MenuItem,
// } from 'react-pro-sidebar';
// import 'react-pro-sidebar/dist/css/styles.css';
// import Naavi from '../../assets/images/logo/naavi_final_logo2.png';

// const MobileMenu = ({ isOpen, onClose }) => {
//   const location = useLocation();
//   const navigate = useNavigate();

//   const handleNavigate = (path) => {
//     onClose();
//     window.scrollTo(0, 0);
//     navigate(path);
//   };

//   const handlePartnersClick = () => {
//     onClose();
//     navigate('/');
//     setTimeout(() => {
//       const section = document.getElementById('partners-section');
//       if (section) section.scrollIntoView({ behavior: 'smooth' });
//     }, 100);
//   };

//   return (
//     isOpen && (
//       <div className="mobile-menu-wrapper">
//         <ProSidebar className="mobile-menu menu-open">
//           <SidebarHeader>
//            <div className="mobile-logo" style={{ width: '150px' }}>

//               <Link to="/">
//                 <img src={Naavi} alt="Logo" />
//               </Link>
//             </div>
//             <div className="close-menu" onClick={onClose}>
//               <i className="bi bi-x-lg"></i>
//             </div>
//           </SidebarHeader>

//           <SidebarContent>
//             <Menu iconShape="square">
//               <MenuItem
//                 className={`nav-link ${
//                   location.pathname === '/' ? 'active' : ''
//                 }`}
//               >
//                 <button onClick={() => handleNavigate('/')}>Home</button>
//               </MenuItem>

//               <MenuItem
//                 className={`nav-link ${
//                   location.pathname.startsWith('/problem') ? 'active' : ''
//                 }`}
//               >
//                 <button onClick={() => handleNavigate('/problem')}>
//                   Problem
//                 </button>
//               </MenuItem>

//               <MenuItem
//                 className={`nav-link ${
//                   location.pathname.startsWith('/solution') ? 'active' : ''
//                 }`}
//               >
//                 <button onClick={() => handleNavigate('/solution')}>
//                   Solution
//                 </button>
//               </MenuItem>

//               <MenuItem className="nav-link">
//                 <button
//                   onClick={handlePartnersClick}
//                   style={{ background: 'none', border: 'none', cursor: 'pointer' }}
//                 >
//                   Partners
//                 </button>
//               </MenuItem>

//               <MenuItem
//                 className={`nav-link ${
//                   location.pathname === '/contact' ? 'active' : ''
//                 }`}
//               >
//                 <button onClick={() => handleNavigate('/contact')}>
//                   Contact
//                 </button>
//               </MenuItem>
//             </Menu>
//           </SidebarContent>
//         </ProSidebar>
//       </div>
//     )
//   );
// };

// export default MobileMenu;
