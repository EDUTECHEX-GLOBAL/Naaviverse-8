import React,{Fragment} from 'react'
import { Link } from 'react-router-dom'

const AboutFour = () => {
    return (
        <Fragment>

            {/* Inline SCSS-style CSS */}
 <style>
{`
.block-style-two .list-item {
    display: flex !important;
    flex-direction: column !important;
    flex-wrap: nowrap !important;
    list-style: none;
    padding-left: 0;
    margin-top: 10px;
}

.block-style-two .list-item li {
    position: relative;
    padding-left: 32px;
    margin-bottom: 12px;
    font-size: 16px;
    line-height: 1.6;
    font-weight: 500;
    color: #1a1a1a;
}

.block-style-two .list-item li::before {
    content: "";
    position: absolute;
    left: 0;
    top: 3px;
    width: 20px;
    height: 20px;
    background-repeat: no-repeat;
    background-size: contain;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%232273E6' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='20 6 9 17 4 12'%3E%3C/polyline%3E%3C/svg%3E");
}

/* ADD THIS */
.block-style-two .btn-one {
    margin-top: 25px !important;
}
`}
</style>



            <div className="block-style-two" data-aos="fade-left">

                <div className="title-style-one">
                    <div className="sc-title-four">WHO WE ARE</div>

                    <h2 className="main-title">
                        Smart Technology Real Impact
                    </h2>
                </div>

                <p className="pt-10 pb-20 lg-pb-10">
                    Smart guidance and clear insights to help you choose the right path and move forward with confidence.
                </p>

                <ul className="style-none list-item color-rev">

                    <li>Intelligent automation</li>

                    <li>Smarter decision support</li>

                    <li>Optimized workflows</li>

                    <li>Advanced data-driven operations</li>

                </ul>

                <Link to="/contact" className="btn-one mt-30">
                    Contact us
                </Link>

            </div>

        </Fragment>
    )
}

export default AboutFour
