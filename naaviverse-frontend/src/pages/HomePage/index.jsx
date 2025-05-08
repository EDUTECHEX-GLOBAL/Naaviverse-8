
import { useNavigate } from "react-router-dom";

import React,{Fragment} from 'react';
import {Helmet} from 'react-helmet';
import {Link} from 'react-router-dom';



import ils_15 from '../../images/assets/ils_15.svg';
import ils15_1 from '../../images/assets/ils_15_1.svg';
import ils15_2 from '../../images/assets/ils_15_2.svg';
import ils15_3 from '../../images/assets/ils_15_3.svg';
import ils15_4 from '../../images/assets/ils_15_4.svg';
import ils15_5 from '../../images/assets/ils_15_5.svg';
import ils15_6 from '../../images/assets/ils_15_6.svg';
import ils15_7 from '../../images/assets/ils_15_7.svg';
import shape_35 from '../../images/shape/shape_35.svg';
import shape_36 from '../../images/shape/shape_36.svg';

import { useStore } from "../../components/store/store.ts";

import TopNavFour from '../../components/LandingPage/TopNavFour';

import HeroBannerFive from '../../components/LandingPage/HeroBannerFive';
import FancyFeatureSeventeen from '../../components/LandingPage/FancyFeatureSeventeen';
import About from '../../components/LandingPage/About';
import FancyFeatureNineteen from '../../components/LandingPage/FancyFeatureNineteen';
import CounterOne from '../../components/LandingPage/CounterOne';

import Faq from '../../components/LandingPage/Faq';

import Contact from '../../components/LandingPage/Contact';
import CallToAction from '../../components/LandingPage/CallToAction';
import BrandTwo from '../../components/LandingPage/BrandTwo';
import FooterFour from '../../components/LandingPage/FooterFour';
import CopyRightFour from '../../components/LandingPage/CopyRightFour';
import './homepage.scss';

const HomePage = () => {
  return (
        <Fragment>
            <div className="main-page-wrapper">
                <Helmet>
                    <title>Naavi - Navigate Your Passion</title>
                </Helmet>
                {/* helmet end */}

                <TopNavFour/> 

                <HeroBannerFive/> 
                {/* {Herobanner End} */}


                <div className="fancy-feature-seventeen position-relative mt-60 xl-mt-20">
                    <div className="container">
                        <div className="row align-items-center">
                            <div className="col-xl-6 col-lg-5" data-aos="fade-right">
                                <div className="title-style-three text-center text-lg-start">
                                    <h2 className="main-title">
                                        <span>Services</span> We Provide with Quality</h2>
                                </div>
                                {/* /.title-style-three */}
                            </div>
                            <div className="col-xl-6 col-lg-7" data-aos="fade-left">
                                <p className="m0 text-center text-lg-start md-pt-30">Leveraging AI and Data Science, we unlock your educational potential with personalized pathways. Our advanced algorithms craft unique roadmaps to guide you toward academic success.</p>
                            </div>
                        </div>
                        <FancyFeatureSeventeen/>
                    </div>
                    {/* /.container */}
                    <div className="shapes shape-one"/>
                </div>
                {/* /.fancy-feature-seventeen */}

                <About/> {/* /.fancy-feature-eighteen */}

                <div className="fancy-feature-nineteen position-relative pt-130 lg-pt-80">
                    <div className="container">
                        <div className="row">
                            <div className="col-xxl-5 col-lg-6 col-md-7">
                                <FancyFeatureNineteen />
                                {/* /.block-style-thirteen */}
                            </div>
                        </div>
                    </div>
                    {/* /.container */}
                    <div className="illustration-holder" data-aos="fade-left">
                        <img src={ils_15} alt="" className="w-100 main-illustration"/>
                        <img src={ils15_1} alt="" className="shapes shape-one"/>
                        <img src={ils15_2}alt="" className="shapes shape-two"/>
                        <img src={ils15_3} alt="" className="shapes shape-three"/>
                        <img src={ils15_4}alt="" className="shapes shape-four"/>
                        <img
                            src={ils15_5}
                            alt=""
                            className="shapes shape-five"
                            data-aos="fade-down"
                            data-aos-delay={200}
                            data-aos-duration={2000}/>
                        <img
                            src={ils15_6}
                            alt=""
                            className="shapes shape-six"
                            data-aos="fade-down"
                            data-aos-delay={100}
                            data-aos-duration={2000}/>
                        <img
                            src={ils15_7}
                            alt=""
                            className="shapes shape-seven"
                            data-aos="fade-down"
                            data-aos-duration={2000}/>
                    </div>
                    {/* /.illustration-holder */}
                    {/* <div className="shapes oval-one"/>
                    <div className="shapes oval-two"/> */}
                    {/* <img src={shape_35} alt="" className="shapes bg-shape"/> */}
                </div>
                {/* /.fancy-feature-nineteen */}

                <CounterOne/> 
                {/* /Counter one end */}

                {/* <div className="feedback-section-five pt-130 lg-pt-100 pb-95 lg-pb-40">
                    <div className="container">
                        <div className="title-style-three text-center" data-aos="fade-up">
                            <div className="sc-title">Testimonials</div>
                            <h2 className="main-title">Words from <span>Client</span>
                            </h2>
                        </div>
                        
                        <TestimonialFive/>
                        
                    </div>
                    <img
                        src="images/media/img_08.jpg"
                        alt=""
                        className="shapes avatar-one"
                        width={45}
                        height={45}
                        style={{
                        outlineWidth: '6px'
                    }}/>
                    <img
                        src="images/media/img_09.jpg"
                        alt=""
                        className="shapes avatar-two"
                        width={85}
                        height={85}
                        style={{
                        outlineWidth: '10px'
                    }}/>
                    <img
                        src="images/media/img_10.jpg"
                        alt=""
                        className="shapes avatar-three"
                        width={85}
                        height={85}
                        style={{
                        outlineWidth: '10px'
                    }}/>
                    <img
                        src="images/media/img_11.jpg"
                        alt=""
                        className="shapes avatar-four"
                        width={50}
                        height={50}
                        style={{
                        outlineWidth: '5px'
                    }}/>
                </div> */}
                {/* /.feedback-section-five */}

                <div
                    className="fancy-feature-twenty position-relative mt-160 pb-100 lg-mt-100 lg-pb-70">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-5">
                                <div
                                    className="block-style-five pe-xxl-5 me-xxl-5 md-pb-50"
                                    data-aos="fade-right">
                                    <div className="title-style-three">
                                        <div className="sc-title">QUESTIONS &amp; ANSWERS</div>
                                        <h2 className="main-title">Any <span>Questions?</span> Find here.</h2>
                                    </div>
                                    {/* /.title-style-three */}
                                    <p className="pt-20 pb-15">Don’t find your answer here? just send us a message for any query.
                                    </p>
                                    <Link to="/contact" className="btn-eight ripple-btn">Contact us</Link>
                                </div>
                                {/* /.block-style-five */}
                            </div>
                            <div className="col-lg-7" data-aos="fade-left">
                                <Faq/>
                            </div>
                        </div>
                    </div>
                    {/* /.container */}
                    <img src={shape_36} alt="" className="shapes shape-one"/>
                    <div className="shapes oval-one"/>
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

                <Contact/> {/* /.Fancy Feature 21 end */}

                <div className="partner-section-two mt-0 mb-130 lg-mb-80">
                    <div className="container">
                        <div className="row">
                            <div className="col-12 m-auto">
                                <BrandTwo/>
                            </div>
                        </div>
                    </div>
                    {/* /.container */}
                </div>
                {/* /.partner-section-two */}

                <div className="footer-style-four theme-basic-footer">
                    <div className="container">
                        <div className="inner-wrapper">
                            <div className="subscribe-area">
                                <CallToAction/>
                            </div>
                            {/* /.subscribe-area */}

                            <FooterFour/> {/* /.FooterFour End */}

                            <div className="bottom-footer">
                                <CopyRightFour/>
                            </div>
                        </div>
                        {/* /.inner-wrapper */}
                    </div>
                </div>
                {/* /.footer-style-four */}

            </div>
        </Fragment>
    )
}

export default HomePage;
