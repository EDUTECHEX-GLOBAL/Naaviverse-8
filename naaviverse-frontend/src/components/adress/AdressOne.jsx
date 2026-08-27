import React, {Fragment} from 'react'

const AdressOne = () => {
    return (
        <Fragment>
            <div className="address-block-one d-flex border-right">
                <div className="icon"><img src="images/icon/icon_06.svg" alt=""/></div>
                <div className="text-meta">
                    <h4 className="title">Our Address</h4>
                    <p className='footer-head'><strong>NAAVI NETWORK</strong><br />
                T-Hub, Knowledge City<br />
                Hyderabad,<br />
                Telangana 500081 INDIA
                </p>

                </div>
                {/* /.text-meta */}
            </div>
            {/* /.address-block-one */}
        </Fragment>
    )
}

export default AdressOne