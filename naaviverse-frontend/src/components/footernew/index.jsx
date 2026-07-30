import React, { useState } from 'react';
import axios from 'axios';
import './footer.scss';
import Logo from "../../assets/images/logo/naavi_footer_logo.png";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) {
      setMessage("Please enter a valid email.");
      setIsSuccess(false);
      return;
    }
    try {
      const res = await axios.post(`${BASE_URL}/api/admin-subscribe`, { email });
      if (res.status === 201) {
        setMessage("Subscription successful!");
        setIsSuccess(true);
        setEmail("");
      }
    } catch (err) {
      setMessage("Error subscribing. Please try again later.");
      setIsSuccess(false);
      console.error(err);
    }
  };

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
                <span className="social-icon" aria-label="LinkedIn"><i className="fab fa-linkedin-in"></i></span>
                <span className="social-icon" aria-label="Instagram"><i className="fab fa-instagram"></i></span>
                <span className="social-icon" aria-label="Facebook"><i className="fab fa-facebook-f"></i></span>
                <span className="social-icon" aria-label="Twitter"><i className="fab fa-twitter"></i></span>
              </div>
            </div>

            <div className="footer-col1">
              <h4 className="footer-heading">Contact Us</h4>
              <p className="footer-contact">info@naavinetwork.ai</p>
            </div>

            <div className="footer-col2">
              <h4 className="footer-heading">Subscribe</h4>
              {/* 👇 NOW WIRED UP */}
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
              {/* 👇 SUCCESS/ERROR MESSAGE */}
              {message && (
                <p style={{
                  color: isSuccess ? 'green' : 'red',
                  fontSize: '13px',
                  marginTop: '6px'
                }}>
                  {message}
                </p>
              )}
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