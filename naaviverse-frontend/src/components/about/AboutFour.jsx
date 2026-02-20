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
    content: "✔";
    position: absolute;
    left: 0;
    top: 0;
    color: #2273E6;
    font-size: 18px;
    font-weight: bold;
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
