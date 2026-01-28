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
        AOS.init({ duration: 1200, easing: 'ease' });
    }, []);

    return (
        <Fragment>
            <div className="main-page-wrapper portfolio-page">
                <Helmet>
                    <title>Solution || Naavi - Navigate Your Passion</title>
                </Helmet>

                <TopNavFour />

                {/* Main Banner */}
                <div className="theme-inner-banner portfolio-banner d-flex align-items-center justify-content-center">
                    <div className="container">
                        <div className="row align-items-center">
                            {/* Left Column (Text Content) */}
                            <div className="col-md-6 portfolio-text" data-aos="fade-right">
                                <h2 className="portfolio-heading">
                                    LLMs-Synergised with <span className="highlighted-word">Knowledge Graphs</span>
                                </h2>
                                <p className="portfolio-paragraph">
                                    AI-based approach to education counseling, which is personalised, where school students provide information in levels:
                                </p>
                                <ul className="portfolio-list">
                                    <li className="portfolio-list-item">Basic information (location, type of school)</li>
                                    <li className="portfolio-list-item">Academic performances (grades, interests, aspirations)</li>
                                    <li className="portfolio-list-item">Psychometric analysis & Extracurricular activities</li>
                                </ul>
                                {/* <p className="portfolio-paragraph-second">
                                    They are provided with interactive pathways, including macro and micro steps. Each decision unlocks new levels, progressively clarifying and defining their journey.
                                </p> */}
                            </div>

                            {/* Right Column (Image Section) */}
                            <div className="col-md-6 text-center portfolio-image-container" data-aos="fade-left">
                                <img src={SolutionImage} alt="Solution" className="portfolio-image img-fluid" />
                            </div>
                        </div>

                        {/* Breadcrumbs */}
                        <ul className="page-breadcrumb style-none d-flex justify-content-center mt-4" data-aos="fade-up" data-aos-delay="800">
                            <li><Link to="/">Home</Link></li>
                            <li className="current-page">Solution</li>
                        </ul>
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
            </div>
        </Fragment>
    );
};

export default Portfolio3Column;
