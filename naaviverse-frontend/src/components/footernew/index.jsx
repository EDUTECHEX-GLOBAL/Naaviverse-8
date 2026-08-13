import React, { useState } from 'react';
import axios from 'axios';
import { Icon } from '@iconify/react';
import './footer.scss';
import Logo from "../../assets/images/logo/naavi_footer_logo.png";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://naaviverse-render.onrender.com";
  const cleanBaseUrl = BASE_URL.replace(/\/+$/, '');

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) {
      setMessage("Please enter a valid email.");
      setIsSuccess(false);
      return;
    }
    try {
      const res = await axios.post(`${cleanBaseUrl}/api/admin-subscribe`, { email });
      if (res.status === 201) {
        setMessage("Thanks for subscribing!");
        setIsSuccess(true);
        setEmail("");
      }
    } catch (err) {
      const serverMsg = err.response?.data?.message;
      if (
        err.response?.status === 400 ||
        err.response?.status === 409 ||
        (serverMsg && (serverMsg.toLowerCase().includes("already") || serverMsg.toLowerCase().includes("exist")))
      ) {
        setMessage("You have already used this email, please use a different email.");
      } else {
        setMessage(serverMsg || "You have already used this email, please use a different email.");
      }
      setIsSuccess(false);
      console.error(err);
    }
  };

  return (
    <footer className="footer">
      <div className="footer-main">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-col footer-col-info">
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
                <span className="social-icon" aria-label="X (Twitter)"><Icon icon="fa6-brands:x-twitter" /></span>
                <a
                  href="https://www.linkedin.com/company/naavi-network/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-icon"
                  aria-label="LinkedIn"
                >
                  <Icon icon="fa6-brands:linkedin-in" />
                </a>
              </div>
            </div>

            <div className="footer-col footer-col-contact">
              <h4 className="footer-heading">Contact Us</h4>
              <p className="footer-contact">info@naavinetwork.ai</p>
            </div>

            <div className="footer-col footer-col-subscribe">
              <h4 className="footer-heading">Subscribe</h4>
              <form className="footer-subscribe" onSubmit={handleSubscribe}>
                <input
                  type="email"
                  placeholder="example@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button type="submit">Send</button>
              </form>

              {/* Toggle Success/Error Message in green directly below send box */}
              {message && (
                <p className="footer-msg" style={{
                  color: isSuccess ? '#198754' : '#e53e3e',
                  fontSize: '13.5px',
                  fontWeight: '600',
                  marginTop: '8px',
                  marginBottom: '8px',
                  textAlign: 'left'
                }}>
                  {message}
                </p>
              )}

              <p className="footer-subtext">
                Subscribe to the list to get pilot access to the platform and updates
              </p>
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