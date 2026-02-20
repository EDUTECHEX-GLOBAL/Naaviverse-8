/* eslint-disable no-unused-vars */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, {Fragment, useEffect} from 'react';
import {Helmet} from 'react-helmet';
import {Link, useLocation} from 'react-router-dom';

import TopNavFour from '../../../../components/header/TopNavFour';
import InnerBanner from '../../../../components/page-title/InnerBanner';
import AboutFour from '../../../../components/about/AboutFour';
import FancyFeatureTwentyTwo from '../../../../components/feature/FancyFeatureTwentyTwo';
import CommonCounter from '../../../../components/counter/CommonCounter';
import Skill from '../../../../components/skill/Skill';
import Team from '../../../../components/team/Team';
import TestimonialThree from '../../../../components/testimonial/TestimonialThree';
import BrandSix from '../../../../components/brand/BrandSix';
import AdressOne from '../../../../components/adress/AdressOne';
import Info from '../../../../components/adress/Info';

import shape38 from '../../../../assets/images/shape/shape_38.svg';
import shape39 from '../../../../assets/images/shape/shape_39.svg';
import shape40 from '../../../../assets/images/shape/shape_40.svg';
import shape41 from '../../../../assets/images/shape/shape_41.svg';
import shape42 from '../../../../assets/images/shape/shape_42.svg';
import shape43 from '../../../../assets/images/shape/shape_43.svg';
import shape44 from '../../../../assets/images/shape/shape_44.svg';
import shape45 from '../../../../assets/images/shape/shape_45.svg';

import ils05 from '../../../../assets/images/assets/ils_05.svg';
import ils051 from '../../../../assets/images/assets/ils_05_1.svg';
import ils052 from '../../../../assets/images/assets/ils_05_2.svg';
import ils053 from '../../../../assets/images/assets/ils_05_3.svg';
import ils054 from '../../../../assets/images/assets/ils_05_4.svg';
import ils055 from '../../../../assets/images/assets/ils_05_5.svg';

import ils06 from '../../../../assets/images/assets/ils_06.svg';
import ils061 from '../../../../assets/images/assets/ils_06_1.svg';
import ils062 from '../../../../assets/images/assets/ils_06_2.svg';
import ils063 from '../../../../assets/images/assets/ils_06_3.svg';
import ils064 from '../../../../assets/images/assets/ils_06_4.svg';
import ils065 from '../../../../assets/images/assets/ils_06_5.svg';


import Tilt from 'react-parallax-tilt';
import ils18 from '../../../../assets/images/assets/ils_18.svg';
import shape25 from '../../../../assets/images/shape/shape_25.svg';
import Footer from '../../../../components/footernew/index';
import NewsFormTwo from '../../../../components/form/NewsFormTwo';

const AboutUsOne = () => {

    const location = useLocation();
useEffect(() => {
    if (location.hash) {
        const id = location.hash.replace("#", "");
        const element = document.getElementById(id);
        if (element) {
            setTimeout(() => {
                element.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }, 200);
        }
    } else {
        window.scrollTo(0, 0);
    }
}, [location]);
    // Number counter animation effect
    useEffect(() => {
        const countUp = (element, target) => {
            let current = 0;
            const increment = target / 100;
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    element.textContent = target.toLocaleString() + (element.dataset.suffix || '');
                    clearInterval(timer);
                } else {
                    element.textContent = Math.floor(current).toLocaleString() + (element.dataset.suffix || '');
                }
            }, 20);
        };




        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const numberElement = entry.target.querySelector('.stat-number');
                    if (numberElement && numberElement.dataset.count) {
                        countUp(numberElement, parseInt(numberElement.dataset.count));
                    }
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        document.querySelectorAll('.stat-card').forEach(card => {
            observer.observe(card);
        });

        return () => observer.disconnect();
    }, []);

    return (
        <Fragment>
            <div className="main-page-wrapper">

                <Helmet>
                    <title>About Us One || Naavi - AI Powered Path Engine</title>
                </Helmet>
        
                {/* Inline Styles */}
                <style>
                    {`
                    /* Hero Stats Section */
                    .hero-stats-section {
                        position: relative;
                        padding: 100px 0;
                        background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
                        overflow: hidden;
                        margin: 80px 0;
                    }

                    .hero-content-wrapper {
                        max-width: 1200px;
                        margin: 0 auto;
                        text-align: center;
                        position: relative;
                        z-index: 2;
                    }

                    .hero-tagline {
                        display: inline-flex;
                        align-items: center;
                        gap: 10px;
                        background: white;
                        padding: 10px 25px;
                        border-radius: 50px;
                        font-size: 0.95rem;
                        font-weight: 600;
                        color: #4da6ff;
                        margin-bottom: 30px;
                        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
                    }

                    .live-dot {
                        width: 8px;
                        height: 8px;
                        background: #4cd964;
                        border-radius: 50%;
                        animation: blink 1.5s infinite;
                    }

                    .hero-main-title {
                        font-size: 3.2rem;
                        font-weight: 800;
                        line-height: 1.2;
                        margin-bottom: 25px;
                        color: #1a202c;
                    }

                    .gradient-text {
                        background: linear-gradient(135deg, #4da6ff, #1a8cff);
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                        background-clip: text;
                        position: relative;
                    }

                    .gradient-text::after {
                        content: '';
                        position: absolute;
                        bottom: 5px;
                        left: 0;
                        right: 0;
                        height: 8px;
                        background: rgba(77, 166, 255, 0.2);
                        z-index: -1;
                        border-radius: 4px;
                    }

                    .hero-description {
                        font-size: 1.2rem;
                        color: #4a5568;
                        line-height: 1.6;
                        max-width: 700px;
                        margin: 0 auto 50px;
                    }

                    .stats-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
                        gap: 30px;
                        margin: 60px auto;
                        max-width: 1000px;
                    }

                    .stat-card {
                        background: white;
                        padding: 35px 25px;
                        border-radius: 20px;
                        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
                        border: 1px solid rgba(255, 255, 255, 0.8);
                        transition: all 0.3s ease;
                        position: relative;
                        overflow: hidden;
                    }

                    .stat-card::before {
                        content: '';
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        height: 4px;
                        background: linear-gradient(90deg, #4da6ff, #1a8cff);
                    }

                    .stat-card:hover {
                        transform: translateY(-10px);
                        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
                    }

                    .stat-number {
                        font-size: 2.8rem;
                        font-weight: 800;
                        color: #2c3e50;
                        margin-bottom: 10px;
                        font-feature-settings: "tnum";
                        font-variant-numeric: tabular-nums;
                    }

                    .stat-label {
                        color: #718096;
                        font-size: 1rem;
                        font-weight: 500;
                    }

                    .trusted-brands {
                        margin: 80px 0 50px;
                    }

                    .brands-title {
                        font-size: 1rem;
                        color: #a0aec0;
                        text-transform: uppercase;
                        letter-spacing: 2px;
                        margin-bottom: 30px;
                        font-weight: 600;
                    }

                    .brands-grid {
                        opacity: 0.8;
                        transition: opacity 0.3s ease;
                    }

                    .brands-grid:hover {
                        opacity: 1;
                    }

                    .hero-cta {
                        display: flex;
                        gap: 20px;
                        justify-content: center;
                        margin-top: 60px;
                        flex-wrap: wrap;
                    }

                    .btn-primary {
                        background: linear-gradient(135deg, #4da6ff, #1a8cff);
                        color: white;
                        padding: 16px 40px;
                        border-radius: 12px;
                        font-weight: 600;
                        font-size: 1.1rem;
                        text-decoration: none;
                        display: inline-flex;
                        align-items: center;
                        gap: 12px;
                        transition: all 0.3s ease;
                        box-shadow: 0 10px 25px rgba(77, 166, 255, 0.25);
                    }

                    .btn-primary:hover {
                        transform: translateY(-3px);
                        box-shadow: 0 15px 30px rgba(77, 166, 255, 0.35);
                        color: white;
                    }

                    .btn-secondary {
                        background: white;
                        color: #4da6ff;
                        padding: 16px 40px;
                        border-radius: 12px;
                        font-weight: 600;
                        font-size: 1.1rem;
                        text-decoration: none;
                        display: inline-flex;
                        align-items: center;
                        gap: 12px;
                        transition: all 0.3s ease;
                        border: 2px solid #4da6ff;
                    }

                    .btn-secondary:hover {
                        background: rgba(77, 166, 255, 0.05);
                        transform: translateY(-3px);
                        box-shadow: 0 10px 20px rgba(77, 166, 255, 0.15);
                        color: #4da6ff;
                    }

                    .hero-bg-decoration {
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        z-index: 1;
                        overflow: hidden;
                    }

                    .floating-circle {
                        position: absolute;
                        border-radius: 50%;
                        opacity: 0.1;
                        filter: blur(40px);
                    }

                    .circle-1 {
                        width: 300px;
                        height: 300px;
                        background: linear-gradient(135deg, #4da6ff, #1a8cff);
                        top: 10%;
                        left: 10%;
                        animation: float 20s ease-in-out infinite;
                    }

                    .circle-2 {
                        width: 200px;
                        height: 200px;
                        background: linear-gradient(135deg, #4cd964, #2ecc71);
                        bottom: 20%;
                        right: 15%;
                        animation: float 15s ease-in-out infinite reverse;
                        animation-delay: 2s;
                    }

                    .circle-3 {
                        width: 150px;
                        height: 150px;
                        background: linear-gradient(135deg, #ff9500, #ff5e3a);
                        top: 40%;
                        right: 20%;
                        animation: pulse 10s ease-in-out infinite;
                        animation-delay: 1s;
                    }

                    @keyframes blink {
                        0%, 100% { opacity: 1; }
                        50% { opacity: 0.5; }
                    }

                    @keyframes float {
                        0%, 100% { transform: translateY(0) rotate(0deg); }
                        50% { transform: translateY(-20px) rotate(5deg); }
                    }

                    @keyframes pulse {
                        0%, 100% { opacity: 0.1; }
                        50% { opacity: 0.2; }
                    }

                    /* Responsive */
                    @media (max-width: 992px) {
                        .hero-stats-section {
                            padding: 80px 0;
                        }
                        
                        .hero-main-title {
                            font-size: 2.5rem;
                        }
                        
                        .stats-grid {
                            grid-template-columns: repeat(2, 1fr);
                            gap: 20px;
                        }
                    }

                    @media (max-width: 768px) {
                        .hero-cta {
                            flex-direction: column;
                            align-items: center;
                        }
                        
                        .btn-primary, .btn-secondary {
                            width: 100%;
                            max-width: 300px;
                            justify-content: center;
                        }
                        
                        .stats-grid {
                            grid-template-columns: 1fr;
                        }
                    }

                    @media (max-width: 576px) {
                        .hero-main-title {
                            font-size: 2rem;
                        }
                        
                        .hero-description {
                            font-size: 1.1rem;
                        }
                        
                        .stat-card {
                            padding: 25px 20px;
                        }
                        
                        .stat-number {
                            font-size: 2.2rem;
                        }
                    }


                    
                    `}
                </style>

               <TopNavFour />

                <div className="theme-inner-banner">
                    <InnerBanner intro='About Company' currpage='About Us'/>
                   <img src={shape38} alt="" className="shapes shape-one"/>
                    <img src={shape39} alt="" className="shapes shape-two"/>
                </div>

                <div id="who-we-are" className="fancy-feature-two position-relative mt-140 lg-mt-100">

                    <div className="container">
                        <div className="row">
                            <div className="col-xxl-5 col-lg-6 col-md-7 ms-auto">
                                <AboutFour/>
                            </div>
                        </div>
                    </div>
                    <div className="illustration-holder-two sm-mt-40">
                        <img src={ils05} alt="" className="main-illustration w-100"/>
                        <img src={ils051} alt="" className="shapes shape-one"/>
                        <img src={ils052}
                            alt=""
                            className="shapes shape-two"
                            data-aos="fade-up"
                            data-aos-anchor=".fancy-feature-two"
                            data-aos-delay={100}
                            data-aos-duration={2000}/>
                        <img src={ils053}
                            alt=""
                            className="shapes shape-three"
                            data-aos="fade-up"
                            data-aos-anchor=".fancy-feature-two"
                            data-aos-delay={150}
                            data-aos-duration={2000}/>
                       <img src={ils054} alt="" className="shapes shape-four"/>
                        <img src={ils055} alt="" className="shapes shape-five"/>
                    </div>
                </div>

                <div id="vision-mission" className="fancy-feature-twentyTwo mt-150 lg-mt-60">

                    <div className="container">
                        <FancyFeatureTwentyTwo/>
                    </div>
                </div>

                <div className="counter-section-one">
                    <div className="inner-container bg-color style-two rounded-0 w-100">
                        <div className="container">
                            <CommonCounter/>
                        </div>
                        <img src={shape40} alt="" className="shapes shape-three"/>
                        <img src={shape41} alt="" className="shapes shape-four"/>
                    </div>
                </div>

                <div className="fancy-feature-five position-relative mt-50">
                    <div className="container">
                        <div className="row align-items-center">
                            <div className="col-xxl-4 col-lg-5 col-md-6">
                                <div className="block-style-five pt-60 md-pt-20" data-aos="fade-right">
                                    <div className="title-style-one">
                                        <div className="sc-title-four">WHY CHOOSE US</div>
                                        <h2 className="main-title">Why you should choose us?</h2>
                                    </div>
                                    <p className="pt-10 pb-70">Tell us about your product and we will give you expert assistance.</p>
                                    <Skill/>
                                </div>
                            </div>
                            <div className="col-xxl-8 col-lg-7 col-md-6 text-end">
                                <div className="illustration-holder d-inline-block position-relative xs-mt-20">
                                    <img src={ils06} alt="" className="main-illustration w-100"/>
                                    <img src={ils061} alt="" className="shapes shape-one"/>
                                    <img src={ils062} alt="" className="shapes shape-two"/>
                                    <img src={ils063}
                                        alt=""
                                        className="shapes shape-three"
                                        data-aos="fade-down"
                                        data-aos-duration={1800}/>
                                    <img src={ils064}
                                        alt=""
                                        className="shapes shape-four"
                                        data-aos="fade-left"
                                        data-aos-duration={1800}/>
                                    <img src={ils065} alt="" className="shapes shape-five"/>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

              <div id="why-naavi" className="fancy-feature-twelve mt-130 pb-50 lg-mt-80">

    <div className="container">
        <div className="row align-items-center align-items-xl-start">

            {/* TEXT SIDE */}
            <div className="col-xl-5 col-md-6 order-md-last">
                <div className="block-style-nine color-two">

                    <div className="title-style-three pb-10" data-aos="fade-up">
                        <div className="sc-title">WHY CHOOSE US</div>

                        <h2 className="main-title">
                            Why <span>choose us</span> for your future
                        </h2>
                    </div>

                    <ul className="style-none list-item">

                        <li data-aos="fade-up">
                            Discover the right career and education path based on your interests and goals
                        </li>

                        <li data-aos="fade-up" data-aos-delay={100}>
                            Get personalized guidance on what to study and which universities to target next
                        </li>

                        <li data-aos="fade-up" data-aos-delay={200}>
                            Plan every step with clear insights and structured roadmaps for success
                        </li>

                    </ul>

                </div>
            </div>


            {/* IMAGE SIDE */}
            <div className="col-xl-7 col-md-6 order-md-first" data-aos="fade-right">

                <div className="illustration-holder position-relative d-inline-block pe-md-5 me-xxl-5 sm-mt-60">

                    <Tilt tiltMaxAngleX={5} tiltMaxAngleY={5}>

                        <img
                            src={ils18}
                            alt=""
                            className="transform-img-meta"
                        />

                    </Tilt>

                </div>

            </div>

        </div>
    </div>

    <img src={shape25} alt="" className="shapes bg-shape"/>

</div>


                <div className="feedback-section-three style-two mt-150 lg-mt-90" data-aos="fade-up">
                    <div className="container">
                        <div className="slider-wrapper">
                            <TestimonialThree/>
                        </div>
                    </div>
                </div>

                {/* ENHANCED SECTION - REPLACEMENT FOR PARTNER SECTION */}
                <div className="hero-stats-section">
                    <div className="container">
                        <div className="hero-content-wrapper">
                            {/* Tagline */}
                            <div className="hero-tagline" data-aos="fade-up">
                                <span className="live-dot"></span>
                                Trusted by 150,000+ Students Worldwide
                            </div>
                            
                            {/* Main Title */}
                            <h1 className="hero-main-title" data-aos="fade-up" data-aos-delay="100">
                                Join <span className="gradient-text">27,000+ Institutions</span> 
                                <br />
                                Transforming Education with AI
                            </h1>
                            
                            {/* Description */}
                            <p className="hero-description" data-aos="fade-up" data-aos-delay="200">
                                Universities, colleges, and educational institutions trust Naavi to provide 
                                intelligent career guidance and academic pathway optimization for their students.
                            </p>
                            
                            {/* Animated Stats Grid */}
                            <div className="stats-grid" data-aos="fade-up" data-aos-delay="300">
                                <div className="stat-card">
                                    <div className="stat-number" data-count="150000" data-suffix="+">0</div>
                                    <div className="stat-label">Active Students</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-number" data-count="27000" data-suffix="+">0</div>
                                    <div className="stat-label">Partner Institutions</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-number" data-count="98" data-suffix="%">0</div>
                                    <div className="stat-label">Success Rate</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-number" data-count="50" data-suffix="+">0</div>
                                    <div className="stat-label">Countries</div>
                                </div>
                            </div>
                            
                            {/* Brand Logos */}
                            <div className="trusted-brands" data-aos="fade-up" data-aos-delay="400">
                                <p className="brands-title">Trusted by leading institutions</p>
                                <div className="brands-grid">
                                    <BrandSix/>
                                </div>
                            </div>
                            
                            {/* CTA Button */}
                            <div className="hero-cta" data-aos="fade-up" data-aos-delay="500">
                                <Link to="/contact" className="btn-primary">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
                                    </svg>
                                    Partner With Us
                                </Link>
                                <Link to="/demo" className="btn-secondary">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                        <path d="M8 5v14l11-7z" fill="currentColor"/>
                                    </svg>
                                    Request a Demo
                                </Link>
                            </div>
                        </div>
                    </div>
                    {/* Background Decoration */}
                    <div className="hero-bg-decoration">
                        <div className="floating-circle circle-1"></div>
                        <div className="floating-circle circle-2"></div>
                        <div className="floating-circle circle-3"></div>
                    </div>
                </div>

                {/* <div className="address-section-one">
                    <div className="container">
                        <div className="inner-content bg-white" data-aos="fade-up" data-aos-delay={100}>
                            <div className="row g-0">
                                <div className="col-md-6 d-flex">
                                    <AdressOne/>
                                </div>
                                <div className="col-md-6 d-flex">
                                    <Info/>
                                </div>
                            </div>
                        </div>
                    </div>
                </div> */}

                {/* <div className="footer-style-one bg-color theme-basic-footer">
                    <div className="container">
                        <div className="inner-wrapper">
                            <div className="bottom-footer">
                                <div className="d-lg-flex justify-content-between align-items-center">
                                    <ul className="order-lg-1 pb-15 d-flex justify-content-center footer-nav style-none">
                                        <li>
                                            <a href="#!" onClick={(e) => e.preventDefault()}>Privacy &amp; Terms.</a>
                                        </li>
                                        <li>
                                            <a href="#!" onClick={(e) => e.preventDefault()}>FAQ</a>
                                        </li>
                                        <li>
                                            <Link to="/contact">Contact Us</Link>
                                        </li>
                                    </ul>
                                    <p className="copyright text-center order-lg-0 pb-15">Copyright @2026 naavi inc.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <img src={shape44} alt="" className="shapes shape-one"/>
                    <img src={shape45} alt="" className="shapes shape-two"/>
                </div> */}

{/* NEW SIGNUP BLOCK + LANDING FOOTER */}
<div className="footer-style-four theme-basic-footer mt-150 lg-mt-80">

    <div className="container">

        <div className="inner-wrapper">

            {/* Signup Block */}
            <div className="subscribe-area">

                <div className="row align-items-center">

                    <div className="col-md-6">

                        <div className="title-style-four sm-pb-20">

                            <h4 className="main-title">
                                Get Career Tips, Updates & <span>Guidance</span>
                            </h4>

                        </div>

                    </div>

                    <div className="col-md-6">

                        <div className="subscribe-form">

                            <NewsFormTwo />

                            <p>
                                We only send interesting and relevant emails.
                            </p>

                        </div>

                    </div>

                </div>

            </div>

            {/* Landing Page Footer */}
            <Footer />

        </div>

    </div>

</div>


            </div>
        </Fragment>
    )
}

export default AboutUsOne