import React from 'react';
import searchic from "../../static/images/dashboard/searchic.svg";
import downarrow from "../../static/images/dashboard/downarrow.svg";
import profile from "../../static/images/dashboard/profile.svg";
import profilea from "../../static/images/dashboard/profilea.svg";
import sidearrow from "../../static/images/dashboard/sidearrow.svg";
import logout from "../../static/images/dashboard/logout.svg";
import { useNavigate } from 'react-router-dom';

const MenuNav = ({showDrop, setShowDrop, searchTerm, setSearchterm, searchPlaceholder}) => {
    const navigate = useNavigate();
    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
      };
     

      
      const handleNavifateProfile = () => {
        const userType = localStorage.getItem('userType')
        

        if(userType === 'user'){
            navigate('/dashboard/users/profile')
        }else if (userType === 'partner'){

            navigate('/dashboard/accountants/profile')
        }else{
            navigate('/admin/dashboard/profile')
        }
      }
    

    return ( 
        <>
          <div className="dash-nav">
            <div
                className="search-input-box"
                onClick={() => setShowDrop(false)}
            >
                <input
                className="search-input"
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchterm(e.target.value)}
                style={{ paddingLeft: "40px" }} 
                />
            </div>
            <div
                className="search-box"
                onClick={() => setShowDrop(false)}
            >
                <img className="search-icon" src={searchic} alt="" />
            </div>
            <div
                className="full-user"
                onClick={() => setShowDrop(!showDrop)}
            >
                <div className="user-box">
                <img
                    className="user-icon"
                    src={
                        localStorage.getItem("userProfilePic")!== undefined
                        ? localStorage.getItem("userProfilePic")
                        : profile
                    }
                    alt=""
                />
                </div>
                <div
                    className="arrow-box"
                    style={{
                        transform: showDrop ? "rotate(180deg)" : "",
                        cursor: "pointer",
                    }}
                >
                    <img className="arrow-icon" src={downarrow} alt="" />
                </div>
            </div>
            </div>

            <>
        {showDrop ? (
          <div className="m-drop" onMouseDown={(e) => e.stopPropagation()}>
            <div
              className="m-each"
              onClick={() => {
                handleNavifateProfile()
              }}
            >
              <div className="m-left">
                <div className="m-left-icon-box">
                  <img className="m-left-icon" src={profilea} alt="" />
                </div>
                <div className="m-left-text">Profile</div>
              </div>
              <div className="m-right-icon-box">
                <img className="m-right-icon" src={sidearrow} alt="" />
              </div>
            </div>
            <div className="m-each-line"> </div>
            <div className="m-each" onClick={() => handleLogout()}>
              <div className="m-left">
                <div className="m-left-icon-box">
                  <img className="m-left-icon" src={logout} alt="" />
                </div>
                <div className="m-left-text">Logout</div>
              </div>
              <div className="m-right-icon-box">
                <img className="m-right-icon" src={sidearrow} alt="" />
              </div>
            </div>
          </div>
        ) : (
          ""
        )}
      </>
        </>
     );
}
 
export default MenuNav;