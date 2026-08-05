import React, { Fragment, useEffect } from 'react';
import { Helmet } from "react-helmet-async";
import { Link } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';


import HeroBannerFive from '../../components/hero-banner/HeroBannerFive';
import FancyFeatureSeventeen from '../../components/feature/FancyFeatureSeventeen';
import About from '../../components/about/About';
import FancyFeatureNineteen from '../../components/feature/FancyFeatureNineteen';
import CounterOne from '../../components/counter/CounterOne';
import TestimonialFive from '../../components/testimonial/TestimonialFive';
import Faq from '../../components/faq/Faq';
import Blog from '../../components/blog/Blog';
import Contact from '../../components/contact/Contact';
import globe from '../../assets/images/assets/naavi-icon4.webp';
import car from '../../assets/images/assets/naavi-icon2.webp';
import route from '../../assets/images/assets/naavi-icon3.webp';
import './useranalysis.scss';
import useranalysis from '../../assets/images/assets/useranalysis3.png';

import BrandTwo from '../../components/brand/BrandTwo';
import Footer from '../../components/footernew/index';




const UserAnalysis = () => {
    useEffect(() => {
        AOS.init({
            duration: 1200,
            once: true
        });
        AOS.refresh();
    }, []);


    return (
        <Fragment>
            <div className="main-page-wrapper landing-scope">


                <Helmet>
                    <title>
                        Naavi Network | AI Powered Path Engine for Education, Career & Life Navigation
                    </title>

                    <meta
                        name="description"
                        content="Naavi Network is an AI Powered Path Engine that helps students, professionals and institutions discover personalized education, career and life pathways through intelligent AI-driven Macro, Micro and Nano navigation."
                    />

                    <meta
                        name="keywords"
                        content="Naavi Network, AI Powered Path Engine, AI Career Guidance, AI Education Platform, Career Navigation, Personalized Learning, Student Career Planning, Education Pathways, Macro Micro Nano Steps, Future Career Planning, AI Roadmap Generator"
                    />

                    <meta
                        name="robots"
                        content="index, follow, max-image-preview:large"
                    />

                    <link
                        rel="canonical"
                        href="https://naavinetwork.ai/"
                    />

                    {/* Open Graph */}
                    <meta property="og:type" content="website" />
                    <meta property="og:site_name" content="Naavi Network" />
                    <meta
                        property="og:title"
                        content="Naavi Network | AI Powered Path Engine"
                    />
                    <meta
                        property="og:description"
                        content="Discover personalized education, career and life pathways powered by AI with intelligent Macro, Micro and Nano navigation."
                    />
                    <meta
                        property="og:url"
                        content="https://naavinetwork.ai/"
                    />
                    <meta
                        property="og:image"
                        content="https://naavinetwork.ai/logo512.png"
                    />

                    {/* Twitter */}
                    <meta
                        name="twitter:card"
                        content="summary_large_image"
                    />
                    <meta
                        name="twitter:title"
                        content="Naavi Network | AI Powered Path Engine"
                    />
                    <meta
                        name="twitter:description"
                        content="Navigate your education, career and future using AI-powered personalized pathways."
                    />
                    <meta
                        name="twitter:image"
                        content="https://naavinetwork.ai/logo512.png"
                    />
                </Helmet>

                <HeroBannerFive />
                {/* {Herobanner End} */}

                {/* Three-Image Feature Section */}
                <div className="featureSection">
                    <div className="container">
                        <div className="row text-center">
                            <div className="col-md-4 mb-40" data-aos="fade-up">
                                <img src={car} alt="Car Icon" className="featureIcon" />
                                <div className="featureTitle">Real-time Paths</div>
                                <p className="featureText">Improve pathways forecast with up-to-date global data</p>
                            </div>
                            <div className="col-md-4 mb-40" data-aos="fade-up" data-aos-delay="100">
                                <img src={globe} alt="Globe Icon" className="featureIcon" />
                                <div className="featureTitle">Global Routing</div>
                                <p className="featureText">Provide pathways with steps to over 20 countries</p>
                            </div>
                            <div className="col-md-4 mb-40" data-aos="fade-up" data-aos-delay="200">
                                <img src={route} alt="Routing Icon" className="featureIcon" />
                                <div className="featureTitle">Precise Nano steps</div>
                                <p className="featureText">Steps with mentors optimized for success</p>
                            </div>
                        </div>
                    </div>
                </div>


                <div className="map-visual-wrapper text-center">
                    <img
                        src={useranalysis}
                        alt="User Path Maps"
                        className="map-visual-img"
                    />
                </div>



                <div className="fancy-feature-seventeen position-relative mt-160 xl-mt-50">
                    <div className="container">
                        <div className="row align-items-center">
                            <div className="col-xl-6 col-lg-5">
                                <div className="title-style-three text-center text-lg-start">
                                    <h2 className="main-title" style={{ color: '#010d4c', opacity: 1, display: 'block', visibility: 'visible' }}>
                                        <span style={{ color: '#198754' }}>Personalized</span> Pathways
                                    </h2>
                                </div>
                                {/* /.title-style-three */}
                            </div>
                            <div className="col-xl-6 col-lg-7">
                                <p className="m0 text-center text-lg-start md-pt-30">
                                    At Naaviverse, we build AI-powered ecosystems that transform potential into opportunity
                                </p>
                            </div>
                        </div>
                        <FancyFeatureSeventeen />
                    </div>
                    {/* /.container */}
                    <div className="shapes shape-one" />
                </div>
                {/* /.fancy-feature-seventeen */}

                <About /> {/* /.fancy-feature-eighteen */}

                <div className="fancy-feature-nineteen position-relative pt-130 lg-pt-80">
                    <FancyFeatureNineteen />
                </div>


                <CounterOne />


                <div
                    className="fancy-feature-twenty position-relative pb-100 lg-pb-70"
                    style={{ marginTop: '40px' }}>

                    <div className="container">
                        <div className="row">
                            <div className="col-lg-5">
                                <div
                                    className="block-style-five pe-xxl-5 me-xxl-5 md-pb-50"
                                    data-aos="fade-right">
                                    <div className="title-style-three">
                                        <div className="sc-title">QUESTIONS &amp; ANSWERS</div>
                                        <h2 className="main-title" style={{ color: '#010d4c', opacity: 1, display: 'block', visibility: 'visible' }}>
                                            <span style={{ color: '#000' }}>FAQ's</span>
                                        </h2>
                                    </div>
                                    {/* /.title-style-three */}
                                    <p className="pt-20 pb-15">Don’t find your answer here? just send us a message for any query.
                                    </p>
                                    <Link to="/contact" className="btn-eight ripple-btn">Contact us</Link>
                                </div>
                                {/* /.block-style-five */}
                            </div>
                            <div className="col-lg-7" data-aos="fade-left">
                                <Faq />
                            </div>
                        </div>
                    </div>
                    {/* /.container */}

                    <div className="shapes oval-one" />
                </div>
                {/* /.fancy-feature-twenty */}

                {/* <div className="blog-section-three position-relative pt-70 lg-pt-40">
                    <div className="container">
                        <div
                            className="title-style-three text-center mb-50 lg-mb-20"
                            data-aos="fade-up">
                            <div className="sc-title">RECENT NEWS</div>
                            <h2 className="main-title">Inside Story &amp; <span>Blog</span>
                            </h2>
                        </div>
                       
                        <Blog/>
                    </div>
                </div> */}
                {/* /.blog-section-three */}

                <Contact /> {/* /.Fancy Feature 21 end */}

                <div id="partners-section" className="partner-section-two mt-30 mb-60 lg-mb-40">



                    <div className="container">
                        <div className="row">
                            <div className="col-12 m-auto">
                                <BrandTwo />
                            </div>
                        </div>
                    </div>
                    {/* /.container */}
                </div>
                {/* /.partner-section-two */}

                <div className="footer-style-four theme-basic-footer">
                    <div className="container">
                        <div className="inner-wrapper">

                            {/* /.subscribe-area */}

                            <Footer /> {/* /.FooterFour End */}


                        </div>
                        {/* /.inner-wrapper */}
                    </div>
                </div>
                {/* /.footer-style-four */}

            </div>
        </Fragment>
    )
}

export default UserAnalysis