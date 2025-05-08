import React, { Fragment } from 'react';
import ModalVideos from '../ModalVideo/ModalVideos';
import ils_13 from '../../images/assets/ils_13.svg';
import ils13_1 from '../../images/assets/ils_13_1.svg';
import ils13_2 from '../../images/assets/ils_13_2.svg';
import { useNavigate } from "react-router-dom";
import './herobannerfive.scss';

const HeroBannerFive = () => {
    const navigate = useNavigate();
    return (
        <Fragment>
            <ModalVideos isOpen={false} onClick={() => {}} />
            <div className="hero-banner-five">
                <div className="container">
                    <div className="row">
                        <div className="col-xxl-6 col-md-7">
                            <div className="hero-heading">Find Your Education<span> Pathway</span></div>
                            <div className="custom-text">Naavi is your partner in finding the perfect education path, designed for your unique career goals.</div>
                            <ul className="style-none button-group d-flex align-items-center">
                                {/* Button to open the chatbot in a new tab */}
                                <li className="me-4">
                                <button
      onClick={() => navigate("/login")}
      className="ripple-btn btn-one"
    >
      Get Started
    </button>

                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="illustration-holder">
                    <img src={ils_13} alt="" className="main-illustration ms-auto " />
                    <img src={ils13_1} alt="" className="shapes shape-one" />
                    <img src={ils13_2} alt="" className="shapes shape-two" data-aos="fade-down" />
                    <img src={ils13_2} alt="" className="shapes shape-three" data-aos="fade-down" />
                </div>
                <div className="shapes oval-one" />
            </div>
        </Fragment>
    );
};

export default HeroBannerFive;
