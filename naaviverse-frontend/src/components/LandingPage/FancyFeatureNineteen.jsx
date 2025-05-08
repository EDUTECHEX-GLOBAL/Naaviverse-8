import React, {Fragment} from 'react'
import './fancyfeaturenineteen.scss'

const ProcessContent = [
    {
        num: 1,
        className: 'numb tran3s',
        heading: 'Create Naavi Profile',
        desc: 'Customized details, skills, interests',
        dataDelay: ''
    }, {
        num: 2,
        className: 'numb tran3s',
        heading: 'Enter the Coordinates',
        desc: 'Current and Future Academic Destinations',
        dataDelay: '50'
    }, {
        num: 3,
        className: 'numb tran3s',
        heading: 'Connect to Mentors and Institutions',
        desc: 'Curated pathway with precise navigation',
        dataDelay: '100'
    }
]

const FancyFeatureNineteen = () => {
    return (
        <Fragment>
            <div className="block-style-thirteen" data-aos="fade-right">
                <div className="title-style-three pb-15">
                    <div className="sc-title">PERSONALIZED PATHWAYS</div>
                    <h2 className="main-title">How Naavi <span>process</span> works </h2>
                </div>
                {/* /.title-style-three */}
                <ul className="style-none list-item">
                    {ProcessContent.map((val, i) => (
                        <li key={i} data-aos="fade-up" data-aos-delay={val.dataDelay}>
                            <div className={val.className}>{val.num}</div>
                            <h6>{val.heading}</h6>
                            <span>{val.desc}</span>
                        </li>
                    ))}
                </ul>
            </div>
            {/* /.block-style-thirteen */}
        </Fragment>
    )
}

export default FancyFeatureNineteen