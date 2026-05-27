import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './appnavbar.scss';
import realtorwhite from '../../static/images/dashboard/realtorwhite.svg';
import downarrow from '../../static/images/dashboard/downarrow.svg';
import bell from '../../static/images/dashboard/bell.svg';
import profile from '../../static/images/dashboard/profile.svg';

const Appnavbar = () => {
  let navigate = useNavigate();
  const inputRef = useRef()
  const [openactions, setOpenactions] = useState(false);
  const [userwidth, setuserwidth] = useState(0);

  // const x = window.scrollX + document.querySelector('#action').getBoundingClientRect().left;
  

  const handlewidth = () => {
    var a;
    if(inputRef.current !== undefined){
      const { offsetLeft } = inputRef.current;
      a = offsetLeft
    }
    else{
      a = 0;
    }
    return a;
  }
  //   const { offsetLeft } = inputRef.current
  //   console.log("hiii", offsetLeft)
  //   setuserwidth(offsetLeft - 0)
  // }, [])
  
  
  return (
    <div className="dashboard-nav-main">
      <div className="dashboard-navbar">
        <div className="nav-left">
          <img className="nav-logo" src={realtorwhite} alt="" />
        </div>
        <div className="nav-right">
          {/* <div className="nav-actions">
            <div
              className={
                openactions === true
                  ? 'actions-btn1 actions-btn1-open'
                  : 'actions-btn1'
              }
              id="action"
              ref={inputRef}
            >
              Quick Actions
            </div>
            <div
              className={
                openactions === true
                  ? 'actions-btn2 actions-btn2-open'
                  : 'actions-btn2'
              }
              onClick={() => setOpenactions(!openactions)}
            >
              <img className="action-arrow" src={downarrow} alt="" />
            </div>
          </div> */}
          <div className="nav-line-box">
            <div className="nav-line"></div>
          </div>
          <div className="nav-bell-box">
            <img className="nav-bell" src={bell} alt="" />
          </div>
          <div className="nav-user" id="user">
            <div className="user-img-box">
              <img className="user-img" src={profile} alt="" />
            </div>
            <div className="user-name">
              {JSON.parse(localStorage.getItem('user')) !== null ||
              JSON.parse(localStorage.getItem('user')) !== undefined
                ? JSON.parse(localStorage.getItem('user')).user.username
                : ''}
            </div>
            <div className="user-arrow-box">
              <img className="user-arrow" src={downarrow} alt="" />
            </div>
          </div>
        </div>
      </div>
      <div
        className="actions-btn3"
        style={{ display: openactions === true ? 'flex' : '' , marginLeft: `${handlewidth()}px`}}
        // onClick={() => navigate('/newlisting')}
      >
        New Listing
      </div>
    </div>
  );
};

export default Appnavbar;
