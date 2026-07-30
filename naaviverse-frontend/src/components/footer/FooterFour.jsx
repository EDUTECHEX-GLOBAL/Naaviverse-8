// import React, { Fragment } from 'react';
// import { Link } from 'react-router-dom';
// import Naavi from '../../assets/images/logo/logo_01.png';

// const SocialContent = [
//     {
//         icon: 'fab fa-instagram',
//         routerPath: 'https://www.instagram.com/naavinetwork/',
//     },
//     {
//         icon: 'fab fa-linkedin-in',
//         routerPath: 'https://www.linkedin.com/company/naavi-network/?originalSubdomain=in',
//     },
// ];

// const PageContent = [
//     { name: 'Home', routerPath: '/' },
//     { name: 'Problem', routerPath: '/problem' },
//     { name: 'Solution', routerPath: '/solution' },
//     { name: 'Contact', routerPath: '/contact' },
// ];

// const LegalContent = [
//     { name: 'Terms and Conditions', routerPath: '/faq' },
//     { name: 'Privacy Policy', routerPath: '/faq' },
//     { name: 'Cancellation Policy', routerPath: '/faq' },
// ];

// const FooterFour = () => {
//     return (
//         <Fragment>
//             <div className="row theme-basic-footer">
//                 <div className="col-lg-4 footer-intro mb-40">
//                     <div className="logo mb-3">
//                         <Link to="/" className="d-block">
//                             <img src={Naavi} alt="Logo" width={120} className="custom-logo" />
//                         </Link>
//                     </div>
//                     <p className="footer-description">
//                         Guiding students on their educational journeys by creating personalized pathways to success, utilizing advanced AI technologies like LLMs and knowledge graphs.
//                     </p>
//                     <ul className="d-flex style-none social-icon mt-4">
//                         {SocialContent.map((val, i) => (
//                             <li key={i}>
//                                 <a href={val.routerPath} target="_blank" rel="noopener noreferrer">
//                                     <i className={val.icon} />
//                                 </a>
//                             </li>
//                         ))}
//                     </ul>
//                 </div>
//                 <div className="col-lg-2 col-sm-4 ms-auto mb-30">
//                     <h5 className="footer-title">Links</h5>
//                     <ul className="footer-nav footer-nav-link">
//                         {PageContent.map((val, i) => (
//                             <li key={i}>
//                                 <Link to={val.routerPath}>{val.name}</Link>
//                             </li>
//                         ))}
//                     </ul>
//                 </div>
//                 <div className="col-xl-2 col-lg-3 col-sm-4 mb-30">
//                     <h5 className="footer-title">Legal</h5>
//                     <ul className="footer-nav footer-nav-link">
//                         {LegalContent.map((val, i) => (
//                             <li key={i}>
//                                 <Link to={val.routerPath}>{val.name}</Link>
//                             </li>
//                         ))}
//                     </ul>
//                 </div>
//             </div>
//         </Fragment>
//     );
// };

// export default FooterFour;
