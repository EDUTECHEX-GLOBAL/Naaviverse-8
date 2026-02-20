import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import SD from '../assets/images/assets/problem.webp';
import AOS from 'aos';
import 'aos/dist/aos.css';

import TopNavFour from '../components/header/TopNavFour';
import Footer from '../components/footernew/index';

const NotFound = () => {
  useEffect(() => {
    AOS.init({ 
      duration: 800, 
      easing: 'ease-out',
      once: true
    });
  }, []);

  return (
    <div className="main-page-wrapper" style={{ 
      background: '#fafafa',
      minHeight: '100vh'
    }}>
      {/* Navbar */}
      <TopNavFour />

      {/* Main Content */}
      <div className="simple-layout-section" style={{ 
        padding: '80px 0 60px',
        position: 'relative'
      }}>
        <div className="container">
          {/* ROW 1: Text on right, Image on left - SAME ROW */}
          <div className="row align-items-start"> {/* CHANGED: align-items-start for top alignment */}
            
{/* COLUMN 1: Text content on RIGHT side - MOVED DOWN */}
<div className="col-lg-6 order-lg-2" data-aos="fade-left">
  {/* Add padding-top to move text down to match image */}
  <div style={{ 
    marginBottom: '30px',
    paddingTop: '40px'  // ADDED: Moves text down to align with image
  }}>
    <h1 style={{
      fontSize: '2.25rem',
      fontWeight: '800',
      color: '#1a202c',
      lineHeight: '1.1',
      marginBottom: '20px',  // Slightly increased
      textAlign: 'left'
    }}>
      <span style={{
        display: 'block',
        background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
      }}>
        Synergised with Knowledge Graphs
      </span>
    </h1>

    <p style={{
      color: '#6b7280',
      fontSize: '1.125rem',
      lineHeight: '1.7',  // Slightly increased
      maxWidth: '100%',
      textAlign: 'left',
      fontWeight: '400',
      marginBottom: '25px'  // Added spacing
    }}>
      AI-based approach to education counseling, which is personalised, where school 
      students provide information in levels:
    </p>

    {/* Problem Points List - ADDED */}
    <div style={{ marginBottom: '30px' }}>
      {[
        'Limited Exposure to Career Options',
        'Limited Access to Diverse Paths', 
        'Limited Motivation',
       //'Underutilised Potential'
      ].map((point, index) => (
        <div 
          key={index}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '12px',
            padding: '10px 16px',
            background: index % 2 === 0 ? 'rgba(255, 255, 255, 0.8)' : 'rgba(249, 250, 251, 0.8)',
            borderRadius: '8px',
            border: '1px solid rgba(229, 231, 235, 0.5)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateX(4px)';
            e.currentTarget.style.borderColor = '#8b5cf6';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateX(0)';
            e.currentTarget.style.borderColor = 'rgba(229, 231, 235, 0.5)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div style={{
            width: '8px',
            height: '8px',
            background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
            borderRadius: '50%',
            flexShrink: 0
          }}></div>
          <span style={{
            color: '#4b5563',
            fontSize: '0.95rem',
            fontWeight: '500'
          }}>
            {point}
          </span>
        </div>
      ))}
    </div>
  </div>
</div>

{/* COLUMN 2: Image on LEFT side - LARGER */}
<div className="col-lg-6 order-lg-1" data-aos="fade-right">
  <div style={{
    position: 'relative',
    borderRadius: '12px',
    overflow: 'hidden',
    height: '500px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }}>
    <img 
      src={SD} 
      alt="AI Education Counseling Flow" 
      style={{
        width: '100%',
        height: '500px',
        display: 'block',
        borderRadius: '12px',
        boxShadow: '0 15px 40px rgba(0, 0, 0, 0.12)',
        border: '1px solid rgba(0, 0, 0, 0.05)',
        objectFit: 'cover'
      }}
    />
  </div>
</div>
</div> {/* This closing div might be the issue - check if it's duplicated */}

          {/* ROW 2: 3 boxes BELOW both image and text */}
          <div className="row">
            <div className="col-12">
              {/* Information Levels with Pastel Colors - BELOW both columns */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '24px',
                marginTop: '60px', // CHANGED: Increased margin for better spacing
                maxWidth: '1200px',
                marginLeft: 'auto',
                marginRight: 'auto'
              }}>
                
                {/* Level 1 - Pastel Purple with ANIMATION */}
                <div 
                  data-aos="fade-up" 
                  data-aos-delay="300"
                  style={{
                    padding: '20px',
                    background: 'linear-gradient(135deg, #f5f3ff 0%, #fafafa 100%)',
                    borderRadius: '12px',
                    border: '1px solid #e9d5ff',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 12px 24px rgba(139, 92, 246, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '12px'
                  }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: '600',
                      fontSize: '0.875rem',
                      boxShadow: '0 4px 12px rgba(139, 92, 246, 0.2)'
                    }}>
                      01
                    </div>
                    <h3 style={{
                      margin: 0,
                      fontSize: '1.125rem',
                      fontWeight: '600',
                      color: '#1f2937'
                    }}>
                      Basic Information
                    </h3>
                  </div>
                  <p style={{
                    margin: 0,
                    color: '#6b7280',
                    fontSize: '0.95rem',
                    lineHeight: '1.5',
                    paddingLeft: '48px'
                  }}>
                    Location, type of school, demographic details
                  </p>
                </div>

                {/* Level 2 - Pastel Blue with ANIMATION */}
                <div 
                  data-aos="fade-up" 
                  data-aos-delay="400"
                  style={{
                    padding: '20px',
                    background: 'linear-gradient(135deg, #eff6ff 0%, #fafafa 100%)',
                    borderRadius: '12px',
                    border: '1px solid #bfdbfe',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 12px 24px rgba(59, 130, 246, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '12px'
                  }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: '600',
                      fontSize: '0.875rem',
                      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)'
                    }}>
                      02
                    </div>
                    <h3 style={{
                      margin: 0,
                      fontSize: '1.125rem',
                      fontWeight: '600',
                      color: '#1f2937'
                    }}>
                      Academic Performance
                    </h3>
                  </div>
                  <p style={{
                    margin: 0,
                    color: '#6b7280',
                    fontSize: '0.95rem',
                    lineHeight: '1.5',
                    paddingLeft: '48px'
                  }}>
                    Grades, subjects of interest, academic aspirations
                  </p>
                </div>

                {/* Level 3 - Pastel Green with ANIMATION */}
                <div 
                  data-aos="fade-up" 
                  data-aos-delay="500"
                  style={{
                    padding: '20px',
                    background: 'linear-gradient(135deg, #f0fdf4 0%, #fafafa 100%)',
                    borderRadius: '12px',
                    border: '1px solid #bbf7d0',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 12px 24px rgba(16, 185, 129, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '12px'
                  }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: '600',
                      fontSize: '0.875rem',
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
                    }}>
                      03
                    </div>
                    <h3 style={{
                      margin: 0,
                      fontSize: '1.125rem',
                      fontWeight: '600',
                      color: '#1f2937'
                    }}>
                      Psychometric & Extracurricular
                    </h3>
                  </div>
                  <p style={{
                    margin: 0,
                    color: '#6b7280',
                    fontSize: '0.95rem',
                    lineHeight: '1.5',
                    paddingLeft: '48px'
                  }}>
                    Personality traits, activities, passions and hobbies
                  </p>
                </div>

              </div>

              {/* AI Visualization Note */}
              <div 
                data-aos="fade-up"
                data-aos-delay="600"
                style={{
                  textAlign: 'center',
                  marginTop: '40px',
                  paddingTop: '20px',
                  borderTop: '1px solid #e5e7eb'
                }}
              >
                <p style={{
                  margin: 0,
                  color: '#6b7280',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <span style={{
                    display: 'inline-block',
                    width: '6px',
                    height: '6px',
                    background: '#8b5cf6',
                    borderRadius: '50%'
                  }}></span>
                  AI-powered personalized education pathway visualization
                </p>
              </div>

              {/* Navigation */}
              <div 
                data-aos="fade-up"
                data-aos-delay="700"
                style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  marginTop: '40px' 
                }}
              >
                <Link 
                  to="/"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#6b7280',
                    textDecoration: 'none',
                    fontSize: '0.95rem',
                    fontWeight: '500',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    background: 'white',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#8b5cf6';
                    e.currentTarget.style.borderColor = '#8b5cf6';
                    e.currentTarget.style.transform = 'translateX(-4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#6b7280';
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="footer-style-four space-fix-one theme-basic-footer">
        <div className="container">
          <div className="inner-wrapper">
            <Footer />
          </div>
        </div>
      </div>

      {/* Responsive Styles */}
      <style>{`
        @media (max-width: 992px) {
          .simple-layout-section {
            padding: 60px 0 40px !important;
          }
          
          .col-lg-6 {
            margin-bottom: 40px;
          }
          
          .col-lg-6.order-lg-2 {
            order: 1; /* Text first on mobile */
          }
          
          .col-lg-6.order-lg-1 {
            order: 2; /* Image second on mobile */
          }
        }

        @media (max-width: 768px) {
          .simple-layout-section {
            padding: 50px 0 30px !important;
          }
          
          h1 {
            font-size: 1.75rem !important;
            text-align: center !important;
          }
          
          p {
            font-size: 1rem !important;
            text-align: center !important;
          }
          
          .info-grid {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
            margin-top: 40px !important;
          }
        }

        @media (max-width: 576px) {
          h1 {
            font-size: 1.5rem !important;
          }
          
          .simple-layout-section {
            padding: 40px 0 20px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default NotFound;