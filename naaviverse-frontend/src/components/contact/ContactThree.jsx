import React, { Fragment } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTwitter, faGithub, faLinkedin, faInstagram } from '@fortawesome/free-brands-svg-icons';
import { faGlobe } from '@fortawesome/free-solid-svg-icons';

const ContactThree = () => {
    return (
        <Fragment>
            <div className="row">
                {/* Contact Info (Mobile Numbers) - First */}
                <div className="col-md-4">
                    <div className="address-block-two text-center mb-40 sm-mb-20">
                        <div className="icon d-flex align-items-center justify-content-center m-auto">
                            <img src="images/icon/icon_18.svg" alt="" />
                        </div>
                        <h5 className="title">Contact Info</h5>
                        <p>
                            Open a chat or give us a call at
                            <br />
                            <a href="tel:+49 17686765221" className="call">+49 17686765221</a>
                            <br />
                            <a href="tel:+91 9398133808" className="call">+91 9398133808</a>
                        </p>
                    </div>
                </div>

                {/* Email Support - Second */}
                <div className="col-md-4">
                    <div className="address-block-two text-center mb-40 sm-mb-20">
                        <div className="icon d-flex align-items-center justify-content-center m-auto">
                            <img src="images/icon/icon_19.svg" alt="" />
                        </div>
                        <h5 className="title">Email Support</h5>
                        <p>
                            Email us at
                            <br/>
                            <br />
                            <a href="mailto:info@naavinetwork.ai" className="webaddress">info@naavinetwork.ai</a>
                        </p>
                    </div>
                </div>

                {/* Social Links - Third */}
                <div className="col-md-4">
                    <div className="address-block-two text-center mb-40 sm-mb-20">
                        <div className="icon d-flex align-items-center justify-content-center m-auto">
                            <FontAwesomeIcon icon={faGlobe} style={{ color: "#47b4d5", fontSize: "24px" }} />
                        </div>
                        <h5 className="title">Follow Us</h5>
                        <p> Stay connected with us </p>
                        <p className="social-links">
                            {/* <a href="https://twitter.com/adyti_369" target="_blank" rel="noopener noreferrer">
                                <FontAwesomeIcon icon={faTwitter} style={{ color: "#47b4d5", fontSize: "24px" }} />
                            </a> */}
                            <a href="https://www.instagram.com/naavinetwork/" target="_blank" rel="noopener noreferrer">
                                <FontAwesomeIcon icon={faInstagram} style={{ color: "#47b4d5", fontSize: "24px" }} />
                            </a>
                            <a href="https://www.linkedin.com/company/naavi-network/?originalSubdomain=in" target="_blank" rel="noopener noreferrer">
                                <FontAwesomeIcon icon={faLinkedin} style={{ color: "#47b4d5", fontSize: "24px" }} />
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </Fragment>
    );
}

export default ContactThree;
