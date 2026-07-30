import React from "react";
import Images from "../../../assets/0-exporter";
import "./registered-apps.style.scss";
export default function RegisteredApps({
  userDetails,
  tabApps,
  handleClick,
  registeredApps,
  split,
}) {
  const [searchTerm, setSearchTerm] = React.useState("");

  console.log(registeredApps , "registeredApps")

  return (
    <div className="registered-apps">
      <div className="about-user">
        <img src={userDetails?.profile_img} />
        <h4>Welcome {userDetails.username}</h4>
        <p>Which Of Your Apps You Want To Explore</p>
        <input
          placeholder="Search Apps"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          type="search"
        />
      </div>
      <div className="user-apps-wrapper">
        {registeredApps
          .filter((x) => {
            return (
              split ||
              (!tabApps.includes(x.app_code) &&
                x.app_name.toLowerCase().startsWith(searchTerm.toLowerCase()))
            );
          })
          .map((obj) => (
            <div className="single-app-wrapper">
              <div className="single-app">
                <div onClick={() => handleClick(obj)}>
                  <img
                    onError={(e) => (e.target.src = Images.mainLogo)}
                    src={!obj.app_icon ? Images.mainLogo : obj.app_icon}
                  />
                </div>
                <p style={{textAlign:"center"}}>{obj.app_name}</p>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
