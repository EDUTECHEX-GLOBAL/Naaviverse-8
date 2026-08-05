import React, { Fragment } from 'react';
import "./fancyFeatureNineteen.scss";
import img22 from '../../assets/images/assets/img_23.png';

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
    heading: 'Explore Paths and Steps',
    desc: 'Curated pathway with precise navigation',
    dataDelay: '100'
  },
  {
    num: 4,
    className: 'numb tran3s',
    heading: 'Marketplace of Mentors & Institutions',
    desc: 'Will help you navigate the journey',
    dataDelay: '150'
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
                <h2 className="main-title" style={{ color: '#010d4c', opacity: 1, display: 'block', visibility: 'visible' }}>
                  How Naavi <span style={{ color: '#198754' }}>process</span> works
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

            {/* RIGHT SIDE – IMAGE */}
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