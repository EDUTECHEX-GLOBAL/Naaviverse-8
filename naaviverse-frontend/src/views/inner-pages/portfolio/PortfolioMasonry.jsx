import React, {Fragment} from 'react';
import {Helmet} from 'react-helmet';
import {Link} from 'react-router-dom';

import TopNavFour from '../../../components/header/TopNavFour';
import PortfolioGalleryFive from '../../../components/portfolio/PortfolioGalleryFive';
import BannerOne from '../../../components/short-banner/BannerOne';
import Footer from '../../../components/footernew/index';




const PortfolioMasonry = () => {
    return (
        <Fragment>
            <div className="main-page-wrapper">
                <Helmet>
                    <title>Solution || Naavi - Navigate Your Passion</title>
                </Helmet>
                {/* helmet end */}

                <TopNavFour/> 
                {/* theme-menu-four */}

                <div className="theme-inner-banner">
                    <div className="container">
                        <h2 className="intro-title">LLMs-Synergised with <span>Knowledge Graphs (KG)</span>
                        </h2>
                        <ul className="page-breadcrumb style-none d-flex">
                            <li>
                                <Link to="/">Home</Link>
                            </li>
                            <li className="current-page">Solution</li>
                        </ul>
                    </div>
                    <img src="images/assets/ils_20.svg" alt="" className="shapes illustration-two"/>
                </div>
                {/* /.theme-inner-banner */}

                <div className="portfolio-gallery-four mt-140 mb-130 lg-mt-90 lg-mb-70">
                    <div className="container">
                        <PortfolioGalleryFive />
                        <div className="load-more-item1 text-center mt-40 lg-mt-30">
                            <a href="#" className="tran3s"><i className="bi bi-arrow-clockwise"/></a>
                            <span className="pt-10">Loading....</span>
                        </div>
                    </div>
                </div>
                {/* /.portfolio-gallery-four */}

                <div className="fancy-short-banner-one position-relative bottom-transform">
                    <div className="container">
                        <div className="bg-wrapper">
                            <BannerOne/>
                        </div>
                        {/* /.bg-wrapper */}
                    </div>
                    {/* /.container */}
                </div>
                {/* /.fancy-short-banner-one */}

                <div className="footer-style-four space-fix-one theme-basic-footer">
                    <div className="container">
                        <div className="inner-wrapper">
                            
                            {/* /.subscribe-area */}
                            <Footer/>
                            
                        </div>
                        {/* /.inner-wrapper */}
                    </div>
                </div>
                {/* /.footer-style-four */}

            </div>
        </Fragment>
    )
}

export default PortfolioMasonry 