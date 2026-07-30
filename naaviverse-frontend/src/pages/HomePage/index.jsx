import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./homepage.scss";
import { useCoinContextData } from "../../context/CoinContext";
import useWindowDimensions from "../../utils/WindowSize";
import { useStore } from "../../components/store/store.ts";
import MobMenu from "../../components/mobMenu/mobMenu";
import Navbar from "../../components/Navbar/index.jsx";

//images
import homepageImg from "../../static/images/homepageImg.webp";
import discoverIcon from "../../static/images/homepage/discoverIcon.svg";
import refineIcon from "../../static/images/homepage/refineIcon.svg";
import mentorIcon from "../../static/images/homepage/mentorIcon.svg";
import analyzeIcon from "../../static/images/homepage/analyzeIcon.svg";
import adjustIcon from "../../static/images/homepage/adjustIcon.svg";
import accomplishIcon from "../../static/images/homepage/accomplishIcon.svg";
import heroImg from "../../static/images/homepage/heroImg.png";
import hamIcon from "../../static/images/icons/hamIcon.svg";

const HomePage = () => {
  const navigate = useNavigate();
  const { setSchoolSearch } = useCoinContextData();
  const { width } = useWindowDimensions();
  const { mobMenuOpen } = useStore();

  const hiwData = [
    {
      id: 1,
      name: "Discover",
      icon: discoverIcon,
    },
    {
      id: 2,
      name: "Refine",
      icon: refineIcon,
    },
    {
      id: 3,
      name: "Get Mentored",
      icon: mentorIcon,
    },
    {
      id: 4,
      name: "Analyze",
      icon: analyzeIcon,
    },
    {
      id: 5,
      name: "Adjust",
      icon: adjustIcon,
    },
    {
      id: 6,
      name: "Accomplish",
      icon: accomplishIcon,
    },
  ];

  return (
    <div className="homepage">
      <Navbar />
      {width > 768 ? (
        <div className="homepage-content">
          <div className="cover-Img">
            <img src={homepageImg} alt="" />
            <div className="background-tint"></div>
            <div className="mid-text">Find Your Next Adventure</div>
            <div className="background-tint1"></div>
            <div className="input-box-container">
              <div className="input-box1">
                <input
                  type="text"
                  placeholder="Which school do you want to go to?"
                  onChange={(e) => {
                    setSchoolSearch(e.target.value);
                  }}
                />
              </div>
              <div
                className="createPath-btn"
                onClick={() => {
                  navigate("/maps");
                }}
              >
                Find Path
              </div>
            </div>
          </div>
          <div className="hiw-container">
            <div className="hiw-text">How It Works</div>
            <div className="hiw-options">
              {hiwData.map((e, i) => {
                return (
                  <div className="each-hiw-option" key={e.id}>
                    <div className="img-border">
                      <img src={e.icon} alt="" />
                    </div>
                    <div className="each-hiw-option-name">{e.name}</div>
                  </div>
                );
              })}
              <div className="centre-line"></div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {!mobMenuOpen ? (
            <div className="homepage-content">
              <div className="cover-Img-mobile">
                <img src={heroImg} alt="" />
                <div className="background-tint-mobile"></div>
                <div className="mid-text-mobile">Find Your Next Adventure</div>
                <div className="background-tint1-mobile"></div>
                <div className="input-box-container-mobile">
                  <div className="input-box1-mobile">
                    <input type="text" placeholder="What Do You Want?" />
                    <div
                      className="createPath-btn-mobile"
                      onClick={() => {
                        navigate("/maps");
                      }}
                    >
                      Go
                    </div>
                  </div>
                </div>
              </div>
              <div className="hiw-container">
                <div className="hiw-text">How It Works</div>
                <div className="hiw-options">
                  {hiwData.map((e, i) => {
                    return (
                      <div className="each-hiw-option" key={e.id}>
                        <div className="img-border">
                          <img src={e.icon} alt="" />
                        </div>
                        <div className="each-hiw-option-name">{e.name}</div>
                      </div>
                    );
                  })}
                  <div className="centre-line"></div>
                </div>
              </div>
            </div>
          ) : (
            <MobMenu />
          )}
        </>
      )}
    </div>
  );
};

export default HomePage;