// Contact.jsx
import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { Icon } from "@iconify/react";
import "./contact.scss";
import Footer from '../../../components/footernew/index';

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

export default function Contact() {
  const formRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    if (formRef.current) {
      setTimeout(() => {
        formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 200);
    }
  }, [location]);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [product, setProduct] = useState("");
  const [mobile, setMobile] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const contactData = { fullName, email, product, mobile, message };

    try {
      await axios.post(`${BASE_URL}/api/admin-contact`, contactData);
      setStatus("Thank you for reaching out! Our team will get back to you shortly.");
      setStatusType("success");
      setFullName("");
      setEmail("");
      setProduct("");
      setMobile("");
      setMessage("");
    } catch (error) {
      setStatus("Error sending message. Please try again.");
      setStatusType("error");
    }

    setTimeout(() => {
      setStatus("");
      setStatusType("");
    }, 5000);
  };

  return (
    <>
      {/* Hero Section */}
      <section className="contact-hero">
        <div className="contact-container">
          <div className="contact-hero-content">
            <span className="contact-hero-tag">GET IN TOUCH</span>
            <h1 className="contact-hero-title">
              Let's talk about <span className="contact-accent">the future</span>
            </h1>
            <p className="contact-hero-desc">
              Have questions about Naavi? Want to explore partnership opportunities? 
              We'd love to hear from you.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="contact-form-section" ref={formRef}>
        <div className="contact-container">
          <div className="contact-grid">
            {/* Left Side - Contact Info */}
            <div className="contact-info">
              <span className="contact-info-eyebrow">REACH OUT</span>
              <h2 className="contact-info-title">How can we help you?</h2>
              <p className="contact-info-desc">
                Whether you're curious about features, want to request a demo, 
                or explore partnership opportunities — our team is ready to assist.
              </p>

              <div className="contact-info-details">
                <div className="contact-info-item">
                  <div className="contact-info-icon">
                    <Icon icon="carbon:location" width={22} />
                  </div>
                  <div>
                    <h4>Visit Us</h4>
                    <p>T-Hub, 2nd Floor, SY.NO.83/1, Raidurg Village, Hyderabad, Telangana 500081</p>
                  </div>
                </div>

                <div className="contact-info-item">
                  <div className="contact-info-icon">
                    <Icon icon="carbon:email" width={22} />
                  </div>
                  <div>
                    <h4>Email Us</h4>
                    <p>info@naavinetwork.ai</p>
                   
                  </div>
                </div>

                <div className="contact-info-item">
                  <div className="contact-info-icon">
                    <Icon icon="carbon:phone" width={22} />
                  </div>
                  <div>
                    <h4>Call Us</h4>
                    <p>+91 40 1234 5678</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Form */}
            <div className="contact-form-wrapper">
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="contact-form-row">
                  <div className="contact-form-group">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="contact-form-group">
                    <label>Email Address *</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="hello@naavi.ai"
                    />
                  </div>
                </div>

                <div className="contact-form-row">
                  <div className="contact-form-group">
                    <label>Mobile Number *</label>
                    <input
                      type="tel"
                      value={mobile}
                      onChange={(e) => {
                        const input = e.target.value;
                        if (/^\d{0,10}$/.test(input)) setMobile(input);
                      }}
                      required
                      maxLength="10"
                      placeholder="9876543210"
                    />
                  </div>
                  <div className="contact-form-group">
                    <label>Inquiry Type *</label>
                    <select
                      value={product}
                      onChange={(e) => setProduct(e.target.value)}
                      required
                    >
                      <option value="">Select Inquiry Type</option>
                      <option value="GENERAL">General Information</option>
                      <option value="SUPPORT">Technical Support</option>
                      <option value="PRICING">Pricing & Plans</option>
                      <option value="DEMO">Request a Demo</option>
                      <option value="PARTNERSHIP">Partnership Opportunity</option>
                      <option value="FEEDBACK">Feedback & Suggestions</option>
                      <option value="OTHER">Other Questions</option>
                    </select>
                  </div>
                </div>

                <div className="contact-form-group contact-form-full">
                  <label>Message *</label>
                  <textarea
                    rows="5"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    placeholder="Tell us how we can help you today..."
                  />
                </div>

                <button type="submit" className="contact-submit-btn">
                  Send Message
                  <Icon icon="bi:arrow-right" />
                </button>

                {status && (
                  <p className={`contact-status contact-status--${statusType}`}>
                    {status}
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <div className="contact-map">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3806.5387246675623!2d78.3762381736905!3d17.43391080146618!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb93bd18410b0f%3A0x8d7e3fea891858ce!2sT-Hub!5e0!3m2!1sen!2sin!4v1745926796929!5m2!1sen!2sin"
          width="100%"
          height="400"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="T-Hub Hyderabad"
        />
      </div>

      <Footer />
    </>
  );
}