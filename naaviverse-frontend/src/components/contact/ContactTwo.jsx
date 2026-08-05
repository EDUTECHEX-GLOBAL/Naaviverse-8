import React, {Fragment} from 'react';
import { Link } from 'react-router-dom';
import Tilt from 'react-parallax-tilt';

const ContactTwo = () => {
   return (
    <Fragment>
        <div className="row align-items-center">
            <div className="col-md-6 order-md-last">
                <div className="block-style-nine ps-lg-5 ms-xxl-3">
                    <div className="title-style-three" data-aos="fade-up">
                        <div className="sc-title">Get Started</div>
                        <h2 className="main-title">
                            Plan Your <span>Future Path</span> with Confidence.
                        </h2>
                    </div>

                    <p className="pt-20 pb-30" data-aos="fade-up" data-aos-delay={80}>
                        Discover the right courses, colleges, and career direction with personalized guidance and smart insights. 
                        Take the first step today and build a clear roadmap toward your goals.
                    </p>

                    <Link
                        to="/contact"
                        className="btn-eight"
                        data-aos="fade-up"
                        data-aos-delay={130}
                    >
                        Start Your Journey
                    </Link>
                </div>
            </div>

            <div className="col-md-6 order-md-first" data-aos="fade-right">
                <div className="illustration-holder position-relative d-inline-block sm-mt-60">
                    <Tilt tiltMaxAngleX={5} tiltMaxAngleY={5}>
                        <img src="images/assets/ils_19.svg" alt="" className="transform-img-meta"/>
                    </Tilt>
                </div>
            </div>
        </div>
    </Fragment>
)

}

export default ContactTwo