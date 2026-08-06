import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./nodespage.scss";
import search from "../../images/search.svg";
import searchIcon from "../../images/searchIcon.svg";
import { GetAllAccountantsWithoutFollowers } from "../../services/accountant";
import useWindowDimensions from "../../utils/WindowSize";
import { useStore } from "../../components/store/store.ts";
import MobMenu from "../../components/mobMenu/mobMenu";
import Skeleton from "react-loading-skeleton";
import { useCoinContextData } from "../../context/CoinContext";
import Navbar from "../../components/Navbar/index.jsx";

//images
import logo from "../../static/images/logo.svg";
import hamIcon from "../../static/images/icons/hamIcon.svg";

const NodesPage = () => {
  const { setSingleDirectory, mobMenuOpen } = useStore();
  let navigate = useNavigate();
  const { pathname } = useLocation();
  const { width } = useWindowDimensions();
  const [accountantsData, setAccountantsData] = useState([]);
  const [filteredAccountantsData, setFilteredAccountantsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const { preLoginMenu, setPreLoginMenu } = useCoinContextData();

  useEffect(() => {
    setLoading(true);
    GetAllAccountantsWithoutFollowers()
      .then((response) => {
        let result = response?.data?.data;
        // console.log(result, "result88698698");
        setAccountantsData(result);
        setFilteredAccountantsData(result);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error, "error in getting accountantsData");
      });
  }, []);

  function filterItem(text) {
    let filterItem = accountantsData?.filter((eachitem) => {
      return eachitem?.displayName
        ?.toLowerCase()
        ?.includes(text?.toLowerCase());
    });
    setFilteredAccountantsData(filterItem);
  }

  function capitalizeWords(sentence) {
    // Split the sentence into an array of words
    var words = sentence.toLowerCase().split(" ");

    // Capitalize the first letter of each word
    for (var i = 0; i < words.length; i++) {
      words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1);
    }

    // Join the capitalized words back into a sentence
    var capitalizedSentence = words.join(" ");

    return capitalizedSentence;
  }

  useEffect(() => {
    if (pathname.includes("/directory/nodes")) {
      setPreLoginMenu("Partners");
    }
  }, []);

  return (
    <div className="nodesPage">
      <Navbar />
      {width > 768 ? (
        <div className="nodespage-content">
          <div className="top-div">
            <div className="hiding-div">
              <div className="static-div">
                <div>Find Your Next Mentor</div>
              </div>
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Search Partners By Name.."
                  onChange={(event) => filterItem(event.target.value)}
                />
                <div className="search-btn">
                  <img src={search} alt="search" />
                </div>
              </div>
            </div>
          </div>
          <div className="bottom-div">
            <div className="directory-scroll-div">
              <div className="acc-txt">Partners</div>
              <div className="accountants-div">
                {loading
                  ? Array(10)
                      .fill("")
                      .map((e, i) => {
                        return (
                          <div className="each-accountant" key={i}>
                            <Skeleton className="cover-pic" />
                            <div className="account-img-box">
                              <Skeleton className="account-img" />
                            </div>
                            <div className="account-name">
                              <Skeleton width={100} height={25} />
                            </div>
                            <div className="account-work">
                              <Skeleton width={200} height={25} />
                            </div>
                            <div className="account-country">
                              <Skeleton width={100} height={25} />
                            </div>
                            <div className="account-countries-all">
                              <div
                                className="account-countries-each"
                                style={{ border: "none", padding: "0" }}
                              >
                                <Skeleton width={150} height={25} />
                              </div>
                            </div>
                            <div className="account-speaclities">
                              <Skeleton width={100} height={25} />
                            </div>
                            <div className="account-speaclities-all">
                              <div
                                className="account-speaclities-each"
                                style={{ border: "none", padding: "0" }}
                              >
                                <Skeleton width={150} height={25} />
                              </div>
                            </div>
                          </div>
                        );
                      })
                  : filteredAccountantsData?.map((e, i) => {
                      return (
                        <div
                          className="each-accountant"
                          key={i}
                          onClick={() => {
                            setSingleDirectory(e);
                            navigate(`/directory/nodes/${e.bankerTag}`);
                          }}
                        >
                          <div
                            className="cover-pic"
                            style={{ background: `#${e?.colorCode}` }}
                          ></div>
                          <div className="account-img-box">
                            <img
                              src={e?.profilePicURL}
                              alt=""
                              className="account-img"
                            />
                          </div>
                          <div className="account-name">{e?.displayName}</div>
                          <div className="account-work">{e?.description}</div>
                          <div className="account-country">Countries</div>
                          <div className="account-countries-all">
                            <div className="account-countries-each">
                              {e?.country}
                            </div>
                          </div>
                          <div className="account-speaclities">Specialty</div>
                          <div className="account-speaclities-all">
                            <div className="account-speaclities-each">
                              {capitalizeWords(e?.subCategory)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {!mobMenuOpen ? (
            <div className="mob-directory-content">
              <div className="mob-top-div">
                <div className="mob-hiding-div">
                  <div className="mob-static-div">
                    <div>Partners</div>
                  </div>
                  <div className="mob-search-container">
                    <input
                      type="text"
                      placeholder="Search Partners.."
                      onChange={(event) => filterItem(event.target.value)}
                    />
                    <div className="mob-search-btn">
                      <img src={searchIcon} alt="search" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="mob-scroll-div">
                <div className="mob-bottom-div">
                  <div className="mob-accountants-div">
                    {loading
                      ? Array(3)
                          .fill("")
                          .map((e, i) => {
                            return (
                              <div key={i} className="mob-each-accountant">
                                <Skeleton className="mob-cover-pic" />
                                <div className="mob-account-img-box">
                                  <Skeleton className="mob-account-img" />
                                </div>
                                <div className="mob-account-name">
                                  <Skeleton width={100} height={25} />
                                </div>
                                <div className="mob-account-work">
                                  <Skeleton width={200} height={25} />
                                </div>
                                <div className="mob-account-country">
                                  <Skeleton width={100} height={25} />
                                </div>
                                <div className="mob-account-countries-all">
                                  <div
                                    className="mob-account-countries-each"
                                    style={{ border: "none", padding: "0" }}
                                  >
                                    <Skeleton width={120} height={25} />
                                  </div>
                                </div>
                                <div className="mob-account-speaclities">
                                  <Skeleton width={100} height={25} />
                                </div>
                                <div className="mob-account-speaclities-all">
                                  <div
                                    className="mob-account-speaclities-each"
                                    style={{ border: "none", padding: "0" }}
                                  >
                                    <Skeleton width={150} height={25} />
                                  </div>
                                </div>
                              </div>
                            );
                          })
                      : filteredAccountantsData?.map((e, i) => {
                          return (
                            <div
                              className="mob-each-accountant"
                              key={i}
                              onClick={() => {
                                setSingleDirectory(e);
                                navigate(e.bankerTag);
                              }}
                            >
                              <div
                                className="mob-cover-pic"
                                style={{ background: `#${e?.colorCode}` }}
                              ></div>
                              <div className="mob-account-img-box">
                                <img
                                  src={e?.profilePicURL}
                                  alt=""
                                  className="mob-account-img"
                                />
                              </div>
                              <div className="mob-account-name">
                                {e?.displayName}
                              </div>
                              <div className="mob-account-work">
                                {e?.description}
                              </div>
                              <div className="mob-account-country">
                                Countries
                              </div>
                              <div className="mob-account-countries-all">
                                <div className="mob-account-countries-each">
                                  {e?.country}
                                </div>
                              </div>
                              <div className="mob-account-speaclities">
                                Specialty
                              </div>
                              <div className="mob-account-speaclities-all">
                                <div className="mob-account-speaclities-each">
                                  {capitalizeWords(e?.subCategory)}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                  </div>
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

export default NodesPage;
