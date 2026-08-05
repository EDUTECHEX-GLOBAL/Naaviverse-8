import React, {Fragment} from 'react';
import {Helmet} from 'react-helmet';


import TopNavFour from '../../../components/header/TopNavFour';
import InnerBanner from '../../../components/page-title/InnerBanner';
// import PortfolioGalleryFour from '../../../components/portfolio/PortfolioGalleryFour';
import BannerOne from '../../../components/short-banner/BannerOne';
import Footer from '../../../components/footernew/index';


const Portfolio2Column = () => {
    return (
        <Fragment>
            <div className="main-page-wrapper">
                <Helmet>
                    <title>Solution|| Naavi - Navigate Your Passion</title>
                </Helmet>
                {/* helmet end */}

                <TopNavFour/> {/* theme-menu-four */}

                <div className="theme-inner-banner">
                    <InnerBanner intro="LLMs-Synergised with Knowledge Graphs (KG)" currpage="Solution"/>
                    <img src="images/shape/shape_38.svg" alt="" className="shapes shape-one"/>
                    <img src="images/shape/shape_39.svg" alt="" className="shapes shape-two"/>
                </div>
                {/* /.theme-inner-banner */}

                {/* <div className="portfolio-gallery-four mt-140 mb-130 lg-mt-90 lg-mb-50">
                    <div className="container">
                        <PortfolioGalleryFour/>
                    </div>
                </div> */}
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
                            <Footer />
                            
                        </div>
                        {/* /.inner-wrapper */}
                    </div>
                </div>
                {/* /.footer-style-four */}

            </div>
        </Fragment>
    )
}

export default Portfolio2Column