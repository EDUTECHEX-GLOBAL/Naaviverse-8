import React, { Fragment } from 'react';
import "./fancyFeatureNineteen.scss";
import img22 from '../../assets/images/assets/img_22.png';

/* Commented unused illustration imports */
/*
import ils15 from "../../assets/images/assets/ils_15.svg";
import ils15_1 from "../../assets/images/assets/ils_15_1.svg";
import ils15_2 from "../../assets/images/assets/ils_15_2.svg";
import ils15_3 from "../../assets/images/assets/ils_15_3.svg";
import ils15_4 from "../../assets/images/assets/ils_15_4.svg";
import ils15_5 from "../../assets/images/assets/ils_15_5.svg";
import ils15_6 from "../../assets/images/assets/ils_15_6.svg";
import ils15_7 from "../../assets/images/assets/ils_15_7.svg";
*/

const ProcessContent = [
  {
    num: 1,
    className: 'numb tran3s',
    heading: 'Create Naavi Profile',
    desc: 'Customized details, skills, interests',
    dataDelay: ''
  },
  {
    num: 2,
    className: 'numb tran3s',
    heading: 'Enter the Coordinates',
    desc: 'Current and Future Academic Destinations',
    dataDelay: '50'
  },
  {
    num: 3,
    className: 'numb tran3s',
    heading: 'Connect to Mentors and Institutions',
    desc: 'Curated pathway with precise navigation',
    dataDelay: '100'
  }
];

const FancyFeatureNineteen = () => {
  return (
    <Fragment>
      <section className="fancy-feature-nineteen">
        <div className="container">
          <div className="feature-grid">

            {/* LEFT SIDE – TEXT */}
            <div className="block-style-thirteen" data-aos="fade-right">
              <div className="title-style-three pb-15">
                <div className="sc-title">PERSONALIZED PATHWAYS</div>
                <h2 className="main-title">
                  How Naavi <span>process</span> works
                </h2>
              </div>

              <ul className="style-none list-item">
                {ProcessContent.map((val, i) => (
                  <li
                    key={i}
                    className="process-item"
                    data-aos="fade-up"
                    data-aos-delay={val.dataDelay}
                  >
                    <div className={val.className}>{val.num}</div>
                    <div className="process-copy">
                      <h6>{val.heading}</h6>
                      <span>{val.desc}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* RIGHT SIDE – ONLY img22 */}
            <div className="illustration-holder" data-aos="fade-left">
              <img
                src={img22}
                alt="Naavi process illustration"
                className="main-illustration"
              />
            </div>

          </div>
        </div>
      </section>
    </Fragment>
  );
};

export default FancyFeatureNineteen;
