import React, { Fragment } from "react";
import img11 from '../../assets/images/assets/img_24.png';

const About = () => {
  return (
    <Fragment>
      <div className="fancy-feature-eighteen position-relative pt-200 pb-225 lg-pt-130 md-pt-100 xl-pb-150 lg-pb-100">

        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '40px',
            alignItems: 'center',
          }}>

            {/* IMAGE — left side */}
            <div data-aos="fade-right" style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <img
                src={img11}
                alt="Target Audience"
                style={{
                  width: '100%',
                  maxWidth: '620px',
                  height: 'auto',
                  display: 'block',
                }}
              />
            </div>

            {/* TEXT — right side */}
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

        {/* DECORATIVE SHAPES */}
        <div className="shapes oval-one" style={{ width: '30px', height: '30px', opacity: 1.0 }} />
        <div className="shapes oval-two" style={{ width: '20px', height: '20px', opacity: 1.0 }} />
        <div className="shapes oval-three" style={{ width: '15px', height: '15px', opacity: 1.0 }} />

      </div>

      {/* Responsive styles */}
      <style>{`
  @media (max-width: 768px) {
    .fancy-feature-eighteen .container > div {
      grid-template-columns: 1fr !important;
      gap: 24px !important;
    }
    .fancy-feature-eighteen img {
      max-width: 100% !important;
    }
    /* Swap order on mobile */
    .fancy-feature-eighteen .block-style-two {
      order: -1 !important;   /* text first */
    }
    .fancy-feature-eighteen [data-aos="fade-right"] {
      order: 0 !important;    /* image second */
    }
  }
`}</style>

    </Fragment>
  );
};

export default About;