import React, { Fragment } from 'react';
import icon31 from "../../assets/images/icon/icon_31.svg";
import icon32 from "../../assets/images/icon/icon_32.svg";
import icon33 from "../../assets/images/icon/icon_33.svg";


const ServiceContent = [
  {
    icon: icon32,
    title: "Large Language Models",
    desc: "Utilizing LLMs to transform complex data into clear, actionable insights. We craft personalized learning paths that align with your academic goals.",
    dataAos: "fade-right",
    className: ""
  },
  {
    icon: icon31,
    title: "Knowledge Graphs",
    desc: "Crafting intelligent pathways with Knowledge Graphs that connect your educational dots. Our maps guide you toward your academic goals.",
    dataAos: "fade-up",
    className: "active"
  },
  {
    icon: icon33,
    title: "Combining KGs with LLMs",
    desc: "Convert data noise into intelligent insights for competitive differentiation, quality check, and equality.",
    dataAos: "fade-left",
    className: ""
  }
];

const FancyFeatureSeventeen = () => {
    return ( 
        <Fragment> 
            <div className="row justify-content-center pt-30">
                {ServiceContent.map((val, i) => (
                    <div key={i} className="col-lg-4 col-md-6" data-aos={val.dataAos} data-aos-delay={val.dataDelay}>
                        <div className={`block-style-twelve block-space mt-30 ${val.className}`}>
                            <div className="icon d-flex align-items-end">
                              <img src={val.icon} alt={val.title} />

                            </div>
                            {/* Added custom class for heading */}
                            <h5 className="custom-feature-title">{val.title}</h5>
                            <p>{val.desc}</p>
                            {/* <img src="images/icon/icon_20.svg" alt="" className="tran3s more-btn" /> */}
                        </div>
                        {/* /.block-style-twelve */}
                    </div>
                ))}
            </div> 
        </Fragment>
    );
};

export default FancyFeatureSeventeen;
