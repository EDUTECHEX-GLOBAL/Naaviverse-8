import React, { Fragment, useEffect } from 'react'; 
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';

import TopNavFour from '../../../components/header/TopNavFour';
import Footer from '../../../components/footernew/index';
import SolutionImage from '../../../assets/images/assets/solution.png';

const Portfolio3Column = () => {
    useEffect(() => {
        AOS.init({ 
            duration: 800, 
            easing: 'ease-out',
            once: true
        });
    }, []);

    return (
        <Fragment>
            <div className="main-page-wrapper" style={{ 
                background: '#fafafa',
                minHeight: '100vh'
            }}>
                <Helmet>
                    <title>Solution || Naavi - Navigate Your Passion</title>
                </Helmet>

                <TopNavFour />

                {/* Main Content - EXACT same structure as problem page */}
                <div className="simple-layout-section" style={{ 
                    padding: '80px 0 60px',
                    position: 'relative'
                }}>
                    <div className="container">
                        {/* ROW 1: Text on right, Image on left - SAME ROW */}
                        <div className="row align-items-start">
                            
                            {/* COLUMN 1: Text content on RIGHT side */}
                            <div className="col-lg-6 order-lg-2" data-aos="fade-left">
                                <div style={{ 
                                    marginBottom: '30px',
                                    paddingTop: '60px'
                                }}>
                                    <h1 style={{
                                        fontSize: '2.25rem',
                                        fontWeight: '800',
                                        color: '#1a202c',
                                        lineHeight: '1.1',
                                        marginBottom: '20px',
                                        textAlign: 'left'
                                    }}>
                                        <span style={{
                                            display: 'block',
                                            background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            backgroundClip: 'text'
                                        }}>
                                            LLMs-Synergised with Knowledge Graphs
                                        </span>
                                    </h1>

                                    <p style={{
                                        color: '#6b7280',
                                        fontSize: '1.125rem',
                                        lineHeight: '1.7',
                                        maxWidth: '100%',
                                        textAlign: 'left',
                                        fontWeight: '400',
                                        marginBottom: '25px'
                                    }}>
                                        AI-based approach to education counseling, which is personalised, where school 
                                        students provide information in levels:
                                    </p>

                                    {/* Information Levels List - Similar to problem points */}
                                    <div style={{ marginBottom: '30px' }}>
                                        {[
                                            'Basic information (location, type of school)',
                                            'Academic performances (grades, interests, aspirations)',
                                            'Psychometric analysis & Extracurricular activities'
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

                                                      {/* COLUMN 2: Image on LEFT side */}
                            <div className="col-lg-6 order-lg-1" data-aos="fade-right">
                                <div style={{
                                    position: 'relative',
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '20px',
                                    backgroundColor: '#f8f9fa',
                                    paddingTop:'130px'
                                }}>
                                    <img 
                                        src={SolutionImage} 
                                        alt="Solution" 
                                        style={{
                                            maxWidth: '100%',
                                            maxHeight: '350px',
                                            display: 'block',
                                            borderRadius: '8px',
                                            boxShadow: '0 15px 40px rgba(0, 0, 0, 0.12)',
                                            border: '1px solid rgba(0, 0, 0, 0.05)',
                                            objectFit: 'contain'
                                        }}
                                    />
                                </div>
                            </div>
</div>
                        {/* ROW 2: 3 boxes BELOW both image and text - EXACT same as problem page */}
                        <div className="row">
                            <div className="col-12">
                                {/* Information Levels with Pastel Colors */}
                                <div style={{ 
                                    display: 'grid', 
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                                    gap: '24px',
                                    marginTop: '60px',
                                    maxWidth: '1200px',
                                    marginLeft: 'auto',
                                    marginRight: 'auto'
                                }}>
                                    
                                    {/* Level 1 */}
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

                                    {/* Level 2 */}
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

                                    {/* Level 3 */}
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

                                {/* Additional Description */}
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
                                        fontSize: '0.95rem',
                                        fontWeight: '500',
                                        lineHeight: '1.6',
                                        maxWidth: '800px',
                                        marginLeft: 'auto',
                                        marginRight: 'auto'
                                    }}>
                                        They are provided with interactive pathways, including macro and micro steps. 
                                        Each decision unlocks new levels, progressively clarifying and defining their journey.
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

                                {/* Breadcrumbs */}
                                <ul className="page-breadcrumb style-none d-flex justify-content-center mt-5" data-aos="fade-up" data-aos-delay="800">
                                    <li><Link to="/" style={{ 
                                        color: '#6b7280',
                                        textDecoration: 'none',
                                        fontSize: '0.95rem'
                                    }}>Home</Link></li>
                                    <li style={{ 
                                        color: '#8b5cf6',
                                        fontSize: '0.95rem',
                                        marginLeft: '8px'
                                    }}>/ Solution</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Section */}
                <div className="footer-style-four space-fix-one theme-basic-footer">
                    <div className="container">
                        <div className="inner-wrapper">
                            <Footer />
                        </div>
                    </div>
                </div>

                {/* Responsive Styles - EXACT same as problem page */}
                                {/* Responsive Styles */}
                <style>
                    {`
                    @media (max-width: 992px) {
                        .simple-layout-section {
                            padding: 60px 0 40px !important;
                        }
                        .col-lg-6 {
                            margin-bottom: 40px;
                        }
                        .col-lg-6.order-lg-2 {
                            order: 1;
                        }
                        .col-lg-6.order-lg-1 {
                            order: 2;
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
                        div[style*="display: grid"][style*="grid-template-columns"] {
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
                    `}
                </style>
            </div>
        </Fragment>
    );
};

export default Portfolio3Column;  