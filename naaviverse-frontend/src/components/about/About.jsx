import React, { Fragment } from "react";
import img11 from '../../assets/images/assets/img_11.png';

const About = () => {
  return (  
    <Fragment>
      <div className="fancy-feature-eighteen position-relative pt-200 pb-225 lg-pt-130 md-pt-100 xl-pb-150 lg-pb-100">
        
        {/* TEXT SECTION */}
        <div className="container">
          <div className="row">
            <div className="col-xl-5 col-lg-6 col-md-7 ms-auto">
              <div className="block-style-two" data-aos="fade-left">
                <div className="title-style-three">
                  <div className="sc-title">Age Group 14 to 50+</div>
                  <h2 className="main-title">
                    Target <span>Audience</span> for Naavi
                  </h2>
                </div>

                <p className="pt-20 pb-25 lg-pb-20">
                  AI technology is perfect for best business solutions &amp; we
                  offer help to achieve your goals.
                </p>

                <ul className="style-none list-item color-rev">
                  <li>Personalized Pathway Insights</li>
                  <li>Real-Time Progress Tracking</li>
                  <li>Data-Driven Goal Optimization</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* IMAGE SECTION — ONLY img11 */}
        <div className="illustration-holder" data-aos="fade-right">
          <img src={img11} alt="Target Audience" className="w-100 main-illustration" />
        </div>

        {/* DECORATIVE SHAPES */}
        <div className="shapes oval-one" />
        <div className="shapes oval-two" />
        <div className="shapes oval-three" />
      </div>
    </Fragment>
  );
};

export default About;