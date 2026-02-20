import React, {Fragment, useState} from 'react';
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

import {Helmet} from 'react-helmet';
import ModalVideos from '../../../../components/ModalVideo/ModalVideos';
import Tilt from 'react-parallax-tilt';
import { Link } from 'react-router-dom';

import TopNavFour from '../../../../components/header/TopNavFour';
// import FancyFeatureTwentyThree from '../../../../components/feature/FancyFeatureTwentyThree';
import FancyFeatureTwentyTwo from '../../../../components/feature/FancyFeatureTwentyTwo';
import CommonCounter from '../../../../components/counter/CommonCounter';
//import TestimonialOne from '../../../../components/testimonial/TestimonialOne';
import TestimonialThree from '../../../../components/testimonial/TestimonialThree';
//import ContactTwo from '../../../../components/contact/ContactTwo';
//import BrandTwo from '../../../../components/brand/BrandTwo';
import Footer from '../../../../components/footernew/index';

import NewsFormTwo from '../../../../components/form/NewsFormTwo';
import img12 from '../../../../assets/images/media/img_12.jpg';
import ils17 from '../../../../assets/images/assets/ils_17.svg';
import ils18 from '../../../../assets/images/assets/ils_18.svg';

import shape25 from '../../../../assets/images/shape/shape_25.svg';
import shape46 from '../../../../assets/images/shape/shape_46.svg';



const AboutUsTwo = () => {
      const location = useLocation();   // ✅ inside component
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (location.pathname === "/problem/vision-mission") {
            setTimeout(() => {
                const section = document.getElementById("vision-mission-section");
                if (section) {
                    section.scrollIntoView({ behavior: "smooth" });
                }
            }, 200);
        }
    }, [location]);
    const OpenModal = () => {
        setOpen(!open)
    }
    return (
        <Fragment>
            <div className="main-page-wrapper">
            <ModalVideos isOpen={open} onClick={OpenModal} />
                <Helmet>
                    <title>About Us | naavinetwork.ai – Smart Path Planning & Career Guidance</title>

                </Helmet>
                {/* helmet end */}

                <TopNavFour/> {/* theme-menu-four */}

                <div className="theme-inner-banner space-fix-one">
                    <div className="container">
                        <h2 className="intro-title">About <span>Our Platform</span>
                        </h2>
                        <ul className="page-breadcrumb style-none d-flex">
                            <li>
                                <Link to="/">Home</Link>
                            </li>
                            <li className="current-page">About us</li>
                        </ul>
                    </div>
                    <img src={ils17} alt="" className="shapes illustration-one"/>
                </div>
                {/* /.theme-inner-banner */}

                <div className="fancy-short-banner-four">
                    <div className="container">
                        <div
                            className="bg-wrapper d-flex align-items-center justify-content-center"
                            style={{
                            
                                        // backgroundImage: `url(${img12})`


                        }}>
                            <a
                                className="fancybox video-icon tran3s d-flex align-items-center justify-content-center"
                                data-fancybox onClick={OpenModal}><i className="fas fa-play"/></a>
                        </div>
                    </div>
                </div>
                {/* /.fancy-short-banner-four */}

                <div className="fancy-feature-twentyThree mt-30">
                    <div className="container">
                        <FancyFeatureTwentyTwo/>
                    </div>
                </div>
                {/* /.fancy-feature-twentyThree */}

                <div className="fancy-feature-twelve mt-130 pb-50 lg-mt-80">
                    <div className="container">
                        <div className="row align-items-center align-items-xl-start">
                            <div className="col-xl-5 col-md-6 order-md-last">
                                <div className="block-style-nine color-two">
    <div className="title-style-three pb-10" data-aos="fade-up">
        <div className="sc-title">WHY CHOOSE US</div>
        <h2 className="main-title">Why <span>choose us</span> for your future</h2>
    </div>

    <ul className="style-none list-item">
        <li data-aos="fade-up">Discover the right career and education path based on your interests, strengths, and goals.</li>
        <li data-aos="fade-up" data-aos-delay={100}>Get personalized guidance on what to study now and which colleges or universities to target next.</li>
        <li data-aos="fade-up" data-aos-delay={200}>Plan every step with clear insights, curated resources, and structured roadmaps for success.</li>
    </ul>
</div>

                                {/* /.block-style-nine */}
                            </div>
                            <div className="col-xl-7 col-md-6 order-md-first" data-aos="fade-right">
                                <div
                                    className="illustration-holder position-relative d-inline-block pe-md-5 me-xxl-5 sm-mt-60">
                                    <Tilt tiltMaxAngleX={5} tiltMaxAngleY={5}>
                                        <img src={ils18} alt="" className="transform-img-meta"/>
                                    </Tilt>
                                </div>
                            </div>
                        </div>
                    </div>
                    <img src={shape25} alt="" className="shapes bg-shape"/>
                </div>
                {/* /.fancy-feature-twelve */}

                <div className="counter-section-one mt-100">
                    <div className="container">
                        
                            <CommonCounter/>
                        
                        {/* /.inner-container */}
                    </div>
                </div>
                {/* /.counter-section-one */}

                <div
                    className="feedback-section-four position-relative mt-150 pb-75 lg-mt-110 sm-pb-20">
                    <div className="container">
                        <div className="title-style-three text-center" data-aos="fade-up">
                            <div className="sc-title">Success Stories</div>
                            <h2 className="main-title">Trsuted by <span>Students & Aspirants</span>
                            </h2>
                        </div>
                        {/* /.title-style-three */}
                    </div>
                    {/* /.container */}
                    <div className="inner-content mt-90 lg-mt-60">
    <div className="slider-wrapper">
        <TestimonialThree/>
    </div>
</div>

                    {/* /.inner-content */}
                    {/* <div className="mt-100 lg-mt-70">
                        <div className="container">
                            <ContactTwo/>
                        </div>
                    </div> */}
                    <img src={shape46} alt="" className="shapes bg-shape"/>
                </div>
                {/* /.feedback-section-four */}

                {/* <div className="partner-section-two mb-130 lg-mb-80">
                    <div className="container">
                        <div className="row">
                            <div className="col-12 m-auto">
                                <BrandTwo/>
                            </div>
                        </div>
                    </div>
                </div> */}
                {/* /.partner-section-two */}

               {/* <div className="footer-style-four theme-basic-footer mt-150 lg-mt-80">

                    <div className="container">
                        <div className="inner-wrapper">
                            <div className="subscribe-area">
                                <div className="row align-items-center">
                                    <div className="col-md-6">
                                        <div className="title-style-four sm-pb-20">
                                           <h4 className="main-title">Get Career Tips, Updates & <span>Guidance</span></h4>

                                        </div>
                                      
                                    </div>
                                    <div className="col-md-6">
                                        <div className="subscribe-form">
                                            <NewsFormTwo />
                                            <p>We only send interesting and relevant emails.</p>
                                        </div>
                                       
                                    </div>
                                </div>
                            </div>
                           
                            <Footer />
                            
                        </div>
                    
                    </div>
                </div> */}
              
{/* Signup block + new footer */}

<div className="footer-style-four theme-basic-footer mt-150 lg-mt-80">

    <div className="container">

        <div className="inner-wrapper">

            {/* Signup block */}
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

            {/* Your NEW landing page footer */}
            <Footer />

        </div>

    </div>

</div>

            </div>
        </Fragment>
    )
}

export default AboutUsTwo