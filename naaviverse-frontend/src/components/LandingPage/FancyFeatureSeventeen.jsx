import React, { Fragment } from 'react';
import './fancyfeatureseventeen.scss';

// Importing images
import icon32 from '../../images/icon/icon_32.svg';
import icon31 from '../../images/icon/icon_31.svg';
import icon33 from '../../images/icon/icon_33.svg';
import arrowIcon from '../../images/arrow.svg'; // If you want to use the arrow image too

const iconMap = {
    icon_32: icon32,
    icon_31: icon31,
    icon_33: icon33,
    icon_20: arrowIcon,
};

const ServiceContent = [
    {
        icon: "icon_32",
        title: 'Large Language Models',
        desc: `Utilizing LLMs to transform complex data into clear, actionable insights. We craft personalized learning paths that align with your academic goals.`,
        arrow: 'icon_20',
        datadelay: '',
        dataAos: 'fade-right',
        className: ''
    }, {
        icon: "icon_31",
        title: 'Knowledge Graphs',
        desc: `Crafting intelligent pathways with Knowledge Graphs that connect your educational dots. Our maps guide you toward your academic goals.`,
        arrow: 'icon_20',
        datadelay: '100',
        dataAos: 'fade-up',
        className: 'active'
    }, {
        icon: "icon_33",
        title: 'Combining KGs with LLMs',
        desc: `Convert data noise into intelligent insights for competitive differentiation, quality check, and equality.`,
        arrow: 'icon_20',
        datadelay: '',
        dataAos: 'fade-left',
        className: ''
    }
];

const FancyFeatureSeventeen = () => {
    return ( 
        <Fragment> 
            <div className="row justify-content-center pt-30">
                {ServiceContent.map((val, i) => (
                    <div key={i} className="col-lg-4 col-md-6" data-aos={val.dataAos} data-aos-delay={val.datadelay}>
                        <div className={`block-style-twelve block-space mt-30 ${val.className}`}>
                            <div className="icon d-flex align-items-end">
                                <img src={iconMap[val.icon]} alt={val.title} />
                            </div>
                            <h5 className="custom-feature-title">{val.title}</h5>
                            <p>{val.desc}</p>
                            {/* If you want to display arrow: */}
                            {/* <img src={arrowIcon} alt="arrow" className="tran3s more-btn" /> */}
                        </div>
                    </div>
                ))}
            </div> 
        </Fragment>
    );
};

export default FancyFeatureSeventeen;
