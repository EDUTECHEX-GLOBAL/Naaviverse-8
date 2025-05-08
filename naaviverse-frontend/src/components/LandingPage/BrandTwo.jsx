import React, { Fragment } from 'react';
import NvidiaLogo from '../../images/logo/nvidia-inception-program.png';
import ThubLogo from '../../images/logo/t-hub-logo.png';
import DeptScienceLogo from '../../images/logo/dst-logo1.jpg';
import MathLogo from '../../images/logo/AIScaleUp.png';
import './brand.scss';

const BrandLogo = [
    {
        img: NvidiaLogo,
        dataDelay: '',
        className: '',
        link: 'https://www.nvidia.com/en-in/startups/', // Nvidia link
    },
    {
        img: ThubLogo,
        dataDelay: '100',
        className: 'thub',
        link: 'https://t-hub.co/', // Thub link
    },
    {
        img: DeptScienceLogo,
        dataDelay: '200',
        className: 'dst-logo',
        link: 'https://dst.gov.in/', // DST link
    },
    {
        img: MathLogo,
        dataDelay: '300',
        className: '',
        link: 'https://www.mat-hub.ai/', // MATH AI Scale up link
    }
];

const BrandTwo = () => {
    return (
        <Fragment>
            <div id="partners-section">
                <h2 className="partners-heading">Partners</h2>
                <ul className="style-none text-center mt-40 lg-mt-10">
                    {BrandLogo.map((item, i) => (
                        <li
                            key={i}
                            className="partner-logo-block-one d-inline-block"
                            data-aos="fade-up"
                            data-aos-delay={item.dataDelay}>
                            <a
                                href={item.link} // Link to respective website
                                target="_blank" // Open in a new tab
                                rel="noopener noreferrer" // Security for external links
                                className="d-flex align-items-center justify-content-center">
                                <img
                                    src={item.img}
                                    alt={`Logo ${i + 1}`}
                                    className={`brand-logo-img ${item.className}`}
                                />
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        </Fragment>
    );
};

export default BrandTwo;
