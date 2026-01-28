import React, { Fragment } from "react";

import ils14 from "../../assets/images/assets/ils_14.svg";
import ils14_1 from "../../assets/images/assets/ils_14_1.svg";
import ils14_2 from "../../assets/images/assets/ils_14_2.svg";
import ils14_3 from "../../assets/images/assets/ils_14_3.svg";
import ils14_4 from "../../assets/images/assets/ils_14_4.svg";
import ils14_5 from "../../assets/images/assets/ils_14_5.svg";
import ils14_6 from "../../assets/images/assets/ils_14_6.svg";
import ils14_7 from "../../assets/images/assets/ils_14_7.svg";

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

        {/* IMAGE SECTION */}
        <div className="illustration-holder" data-aos="fade-right">
          <img src={ils14} alt="" className="w-100 main-illustration" />

          <img src={ils14_1} alt="" className="shapes shape-one" data-aos="fade-down" />
          <img
            src={ils14_2}
            alt=""
            className="shapes shape-two"
            data-aos="fade-down"
            data-aos-delay="100"
          />
          <img
            src={ils14_3}
            alt=""
            className="shapes shape-three"
            data-aos="fade-down"
            data-aos-delay="200"
          />
          <img src={ils14_4} alt="" className="shapes shape-four" />
          <img src={ils14_5} alt="" className="shapes shape-five" />
          <img src={ils14_6} alt="" className="shapes shape-six" />
          <img src={ils14_7} alt="" className="shapes shape-seven" />
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
