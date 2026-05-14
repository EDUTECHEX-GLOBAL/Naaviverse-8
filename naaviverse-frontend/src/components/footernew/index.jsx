import React from 'react';
import Div from '../../views/inner-pages/contact/Div';
import ContactInfoWidget from '../../views/inner-pages/contact/ContactInfoWidget';
import MenuWidget from './MenuWidget';
import Newsletter from './Newsletter';
import SocialWidget from './SocialWidget';
import TextWidget from './TextWidget';
import './footer.scss';
import Logo from "../../assets/images/logo/naavi_footer_logo.png";
// import Logo from "../../assets/images/logo/naavi_final_logo2.png";
const copyrightLinks = [
  {
    title: 'Terms of Use',
    href: '/',
  },
  {
    title: 'Privacy Policy',
    href: '/',
  },
];

const serviceMenu = [
  {
    title: 'Product Design',
    // href: '/service/service-details',
  },
  {
    title: 'Material Simulations',
    // href: '/service/service-details',
  },
  {
    title: 'Cryogenic Testing',
    // href: '/service/service-details',
  },
  {
    title: 'Assembly',
    // href: '/service/service-details',
  },
  {
    title: 'Manufacturing',
    // href: '/service/service-details',
  },
];

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-main">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-col">
              <div className="footer-logo">
                <img src={Logo} alt="Logo" />
              </div>
              <div className="footer-address">
                <p className='footer-head'><strong>NAAVI NETWORK</strong><br />
                T-Hub, Knowledge City<br />
                Hyderabad,<br />
                Telangana 500081 INDIA
                </p>
              </div>
<div className="footer-socials">
  <a
    href="https://www.linkedin.com/company/onnes-cryogenics/"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="LinkedIn"
  >
    <i className="fab fa-linkedin-in"></i>
  </a>

  <a
    href="https://www.instagram.com/onnes.cryogenics/"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Instagram"
  >
    <i className="fab fa-instagram"></i>
  </a>

  <a
    href="https://www.facebook.com/onnescryogenics"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Facebook"
  >
    <i className="fab fa-facebook-f"></i>
  </a>

  <a
    href="https://twitter.com/OCryogenics"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Twitter"
  >
    <i className="fab fa-twitter"></i>
  </a>
</div>

            </div>

            <div className="footer-col3">
              <h4 className="footer-heading">Offerings</h4>
              <ul className="footer-links">
                <li>  </li>
                <li>Workflow Automation</li>
                <li>AI-Driven Insights</li>
                <li>Resource Optimization</li>
                <li>Platform Integration</li>
              </ul>
            </div>

            <div className="footer-col1">
              <h4 className="footer-heading">Contact Us</h4>
              <p className="footer-contact">info@naavinetwork.ai</p>
            </div>

            <div className="footer-col2">
              <h4 className="footer-heading">Subscribe</h4>
              <div className="footer-subscribe">
                <input type="email" placeholder="example@gmail.com" />
                <button>Send</button>
              </div>
              <p className="footer-subtext">Subscribe to our newsletters to get the latest news and updates</p>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <div className='footer-copy'>Copyright © 2026 Naavi Network.</div>
          <div className="footer-policy-links">
            <a href="/">Terms of Use</a>
            <span>|</span>
            <a href="/">Privacy Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;