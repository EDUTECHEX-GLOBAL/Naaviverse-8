import React,{Fragment, useEffect} from 'react';

import {Helmet} from 'react-helmet';
import {Link} from 'react-router-dom';

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
import useranalysis from '../../assets/images/assets/useranalysis2.webp';

import BrandTwo from '../../components/brand/BrandTwo';
import Footer from '../../components/footernew/index';




const UserAnalysis = () => {

    
    return (
        <Fragment>
       <div className="main-page-wrapper landing-scope">


                <Helmet>
                    <title>Naavi - Navigate Your Passion</title>
                </Helmet>
                {/* helmet end */}

                <HeroBannerFive/> 
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
                            <div className="col-xl-6 col-lg-5" data-aos="fade-right">
                                <div className="title-style-three text-center text-lg-start">
                                    <h2 className="main-title">
                                        <span>Services</span> We Provide with Quality</h2>
                                </div>
                                {/* /.title-style-three */}
                            </div>
                            <div className="col-xl-6 col-lg-7" data-aos="fade-left">
                                <p className="m0 text-center text-lg-start md-pt-30"><p className="m0 text-center text-lg-start md-pt-30">
At Naaviverse, we craft intelligent digital ecosystems powered by AI and the cloud
</p>
</p>
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
                        <img src="images/assets/ils_15.svg" alt="" className="w-100 main-illustration"/>
                        <img src="images/assets/ils_15_1.svg" alt="" className="shapes shape-one"/>
                        <img src="images/assets/ils_15_2.svg" alt="" className="shapes shape-two"/>
                        <img src="images/assets/ils_15_3.svg" alt="" className="shapes shape-three"/>
                        <img src="images/assets/ils_15_4.svg" alt="" className="shapes shape-four"/>
                        <img
                            src="images/assets/ils_15_5.svg"
                            alt=""
                            className="shapes shape-five"
                            data-aos="fade-down"
                            data-aos-delay={200}
                            data-aos-duration={2000}/>
                        <img
                            src="images/assets/ils_15_6.svg"
                            alt=""
                            className="shapes shape-six"
                            data-aos="fade-down"
                            data-aos-delay={100}
                            data-aos-duration={2000}/>
                        <img
                            src="images/assets/ils_15_7.svg"
                            alt=""
                            className="shapes shape-seven"
                            data-aos="fade-down"
                            data-aos-duration={2000}/>
                    </div>
                    {/* /.illustration-holder */}
                    <div className="shapes oval-one"/>
                    <div className="shapes oval-two"/>
                    <img src="images/shape/shape_35.svg" alt="" className="shapes bg-shape"/>
                </div>
                {/* /.fancy-feature-nineteen */}

                <CounterOne/> 
               

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
                    <img src="images/shape/shape_36.svg" alt="" className="shapes shape-one"/>
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

    <div id="partners-section" className="partner-section-two mt-30 mb-130 lg-mb-80">



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
                           
                            {/* /.subscribe-area */}

                            <Footer/> {/* /.FooterFour End */}
                                                                                                                                                        
                            
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