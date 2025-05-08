import React, {Fragment} from 'react'
import { Link } from 'react-router-dom'
import './copyright.scss';

const CopyRightFour = () => {
    return (
        <Fragment>
            <div className="d-lg-flex justify-content-between align-items-center">
               
                <p className="copyright text-center order-lg-0 pb-15">Copyright @{new Date().getFullYear()}{" "}
                    naavi inc.</p>
            </div>
        </Fragment>
    )
}

export default CopyRightFour