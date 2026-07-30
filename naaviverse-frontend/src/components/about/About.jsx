import React, { Fragment } from "react";
import img11 from '../../assets/images/assets/img_24.png';

const About = () => {
  return (
    <Fragment>
      <div className="fancy-feature-eighteen position-relative" style={{
        paddingTop: '60px',
        paddingBottom: '60px',
      }}>

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
                  maxWidth: '520px',
                  height: 'auto',
                  display: 'block',
                }}
              />
            </div>

            {/* TEXT — right side */}
            <div className="block-style-two" data-aos="fade-left">
              <div className="title-style-three">
                <div className="sc-title">Age Group 14 to 50+</div>
                <h2 className="main-title" style={{
                  fontSize: '40px',
                  lineHeight: '1.2',
                  marginBottom: '16px',
                }}>
                  Target <span>Audience</span> for Naavi
                </h2>
              </div>
              <p style={{
                paddingTop: '12px',
                paddingBottom: '16px',
                fontSize: '15px',
                lineHeight: '1.7',
                color: '#6B7A8D',
              }}>
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
          .fancy-feature-eighteen {
            padding-top: 30px !important;
            padding-bottom: 20px !important;
          }
          .fancy-feature-eighteen .container > div {
            grid-template-columns: 1fr !important;
            gap: 30px !important;
          }
          .fancy-feature-eighteen img {
            max-width: 100% !important;
          }
          .fancy-feature-eighteen .block-style-two {
            order: -1 !important;
          }
          .fancy-feature-eighteen [data-aos="fade-right"] {
            order: 0 !important;
            margin-top: 15px !important;
          }
          .fancy-feature-eighteen .block-style-two ul.list-item {
            padding-left: 20px !important;
          }
          .fancy-feature-eighteen .block-style-two ul.list-item li {
            font-size: 16px !important;
            line-height: 1.5 !important;
            margin-bottom: 10px !important;
            padding-left: 28px !important;
          }
          .fancy-feature-eighteen .block-style-two ul.list-item li:before {
            font-size: 12px !important;
            top: 2px !important;
          }
          .fancy-feature-eighteen .main-title {
            font-size: 40px !important;
            line-height: 1.2 !important;
            font-family: 'Poppins', sans-serif !important;
          }
          .fancy-feature-eighteen .shapes {
            display: none !important;
          }
        }

        @media (max-width: 480px) {
          .fancy-feature-eighteen .main-title {
            font-size: 40px !important;
            line-height: 1.2 !important;
            font-family: 'Poppins', sans-serif !important;
          }
        }
      `}</style>

    </Fragment>
  );
};

export default About;