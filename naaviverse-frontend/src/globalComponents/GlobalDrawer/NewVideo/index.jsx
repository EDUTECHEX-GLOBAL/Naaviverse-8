import React, { useContext, useEffect, useState } from "react";
import Axios from "axios";
import Scrollbars from "react-custom-scrollbars";
import * as jose from "jose";
import cloudUploadIcon from "../../../static/images/clipIcons/cloudUpload.svg";

import loadingGif from "../../../static/images/loading.gif";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import arrowDown from "../../../static/images/arrowDown.svg"
// import LoadingAnimation from "../LoadingAnimation";
import { useNavigate } from "react-router-dom";
// import { selectLoginData } from "../../app/loginSlice";
import { toast } from "react-toastify";
import axios from "axios";
import clearInput from "../../../static/images/icons/refresh.svg";
import CountryList from "./CountryList";
import AppsList from "./AppsList";
import "./numberInput.css";
import { GlobalContex } from "../../../globalContext";
import closeWhite from "../../../static/images/icons/closeWhite.svg";

import plus from "../../../static/images/globaldrawer/plus.svg";

import AppList from "./AppsList";
import LoadingAnimation from "../../LoadingAnimation";
import PublicationList from "./PublicationList";
import defaultImg from "../../../static/images/icons/defaultImg.svg";
import AuthorList from "./AuthorList";
import EnterArticle from "./EnterArticle";
import CategoryList from "./CategoryList";
import NavBarList from "./NavBarList";
import { useForceUpdate } from "framer-motion";
import plusIcon from "../../../static/images/addNewIcons/plusIcon.svg";
import closeIconRed from "../../../static/images/addNewIcons/closeIconRed.svg";

function renameFile(originalFile, newName) {
  return new File([originalFile], newName, {
    type: originalFile.type,
    lastModified: originalFile.lastModified,
  });
}

const secret = "uyrw7826^&(896GYUFWE&*#GBjkbuaf"; // secret not to be disclosed anywhere.
const emailDev = "rahulrajsb@outlook.com"; // email of the developer.

const NewVideo = ({ step, setStep, setMainMenu, loading, setLoading }) => {
  const navigate = useNavigate();

  const {
    loginData,
    bankerEmail,
    refetchAppData,
    setRefetchAppData,
    globalMenuAdd,
    setGlobalMenuAdd,
    tabSelected,
    setTabSelected,
    selectedPublication,
    selectedApp,
    wideDrawer,
    setWideDrawer,
    setSlider,
  } = useContext(GlobalContex);

  //
  const [publication, setPublication] = useState(null);
  const [author, setAuthor] = useState(null);
  const [videoTitle, setVideoTitle] = useState("");
  const [videoLink, setVideoLink] = useState("");
  const [videoDesc, setVideoDesc] = useState("");

  const [coverPhoto, setCoverPhoto] = useState("");
  const [coverPhotoLoading, setCoverPhotoLoading] = useState("");

  const [categories, setCategories] = useState([]);
  const [navBars, setNavBars] = useState([]);
  const [buttonTitle, setButtonTitle] = useState("");
  const [buttonLink, setButtonLink] = useState("");

  const [metaTag, setMetaTag] = useState("")
  const [metaArr, setMetaArr] = useState([])

  const [keywords, setKeywords] = useState("")
  const [keywordsArr, setKeywordsArr] = useState([])

  // Form Variables

  const [company, setCompany] = useState();
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [tokenName, setTokenName] = useState("");
  const [tokenAvailable, setTokenAvailable] = useState(null);

  //Publishers New Publication
  const [publicationName, setPublicationName] = useState("");
  const [app, setApp] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [country, setCountry] = useState(null);

  const [altTag, setAltTag] = useState("");

  const [visibleSubmit, setVisibleSubmit] = useState(false);

  useEffect(() => {
    localStorage.setItem("step", step);
  }, [step]);

  useEffect(() => {
    if(selectedApp.appName === "Publishers") {
      setPublication(selectedPublication);
    }  
      if (selectedApp.appName === "Authors") {
        if (!publication?.PublicationDetail[0]?.fxa_app_id) {
          axios
            .get(
              `https://publications.apimachine.com/application/publisher/detail/${bankerEmail}`
            )
            .then(({ data }) => {
  
              setPublication(data?.data[0]?.PublicationDetails[0]);
              setLoading(false);
            });
        }
      axios.get(`https://publications.apimachine.com/publisher?email=${bankerEmail}`).then((res) => {
        if (res.data.data.length > 0) {
          setAuthor(res.data.data[0])
        }
      })
    }
  }, [])

  const handleCheckTokenAvailability = () => {
    if (tokenAvailable === null && tokenSymbol !== "") {
      axios
        .get(
          `https://comms.globalxchange.io/coin/investment/path/get?token=${tokenSymbol}`
        )
        .then((res) => {
          if (res.data.status) {
            setTokenAvailable(false);
          } else {
            setTokenAvailable(true);
          }
        });
    } else {
      setTokenAvailable(null);
      setTokenSymbol("");
    }
  };

  const signJwt = async (fileName, emailDev, secret) => {
    try {
      const jwts = await new jose.SignJWT({ name: fileName, email: emailDev })
        .setProtectedHeader({ alg: "HS512" })
        .setIssuer("gxjwtenchs512")
        .setExpirationTime("10m")
        .sign(new TextEncoder().encode(secret));
      return jwts;
    } catch (error) {
      console.log(error, "kjbedkjwebdw");
    }
  };

  const uploadImage = async (e, setImage, setLoading) => {
    setLoading(true);
    const fileName = `${new Date().getTime()}${e.target.files[0].name.substr(
      e.target.files[0].name.lastIndexOf(".")
    )}`;
    const formData = new FormData();
    const file = renameFile(e.target.files[0], fileName);
    formData.append("files", file);
    const path_inside_brain = "root/";

    const jwts = await signJwt(fileName, emailDev, secret);
    console.log(jwts, "lkjkswedcf");
    let { data } = await Axios.post(
      `https://drivetest.globalxchange.io/file/dev-upload-file?email=${emailDev}&path=${path_inside_brain}&token=${jwts}&name=${fileName}`,
      formData,
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
    setImage(data.payload.url);
    setLoading(false);
  };

  const authorStep = () => {
    if (selectedApp.appName !== "Authors") {
      setStep("Select Author")
    }
  }

  const removeCategory = (category) => {
    setCategories(categories.filter((item) => item !== category));
  };
  const removeNav = (navBar) => {
    setNavBars(navBars.filter((item) => item !== navBar));
  };

  const addMetaTag = (metaTag) => {
    if (metaTag === "") return
    setMetaArr([...metaArr, metaTag])
    console.log(metaArr, "metaArr")
    setMetaTag("")
  }

  const removeTag = (item) => {
    setMetaArr(metaArr.filter((tag) => tag !== item));
  };

  const addKeyword = (keyword) => {
    if (keyword === "") return
    setKeywordsArr([...keywordsArr, keyword])
    console.log(keywordsArr, "keywordsArr")
    setKeywords("")
  }

  const removeKeyword = (item) => {
    setKeywordsArr(keywordsArr.filter((keyword) => keyword !== item));
  };

  const getContent = () => {
    switch (step) {
      case "success":
        setTimeout(() => {
          // // navigate("/ventures/Brands");
          // window.location.reload();
          setSlider(false);
        }, 1000);
        setRefetchAppData(true);
        return (
          <div className="newConglomerate">
            <div className="succesView">
              <div className="labelItm" style={{ textAlign: "center" }}>
                You Have Successfully Published {videoTitle}.
              </div>
            </div>
          </div>
        );
      case "app":
        return (
          <div className="newConglomerate" style={{ paddingBottom: "0px" }}>
            <AppList setApp={setApp} onClose={() => setStep("")} />
          </div>
        );

      case "country":
        return (
          <div className="newConglomerate" style={{ paddingBottom: "0px" }}>
            <CountryList setCountry={setCountry} onClose={() => setStep("")} />
          </div>
        );

      case "Token Expired":
        return (
          <>
            <div className="newConglomerate">
              <div className="succesView">
                <div className="labelItm" style={{ textAlign: "center" }}>
                  Token Expired. Login Again.
                </div>
              </div>
            </div>

            <div className="footerBtns">
              <div
              // onClick={(e) => handleBackStep()}
              >
                Go Back
              </div>
              <div
                onClick={(e) => {
                  localStorage.clear();
                  window.location.reload();
                }}
              >
                Logout
              </div>
            </div>
          </>
        );

      case "Select Publication":
        return (
          <div className="newConglomerate" style={{ paddingBottom: "0px" }}>
            <PublicationList
              setPublication={setPublication}
              onClose={() => setStep("")}
            />
          </div>
        );
      case "Select Author":
        return (
          <div className="newConglomerate" style={{ paddingBottom: "0px" }}>
            <AuthorList setAuthor={setAuthor} onClose={() => setStep("")} />
          </div>
        );

      case "Add Category":
        return (
          <div className="newConglomerate" style={{ paddingBottom: "0px" }}>
            <CategoryList
              categories={categories}
              setCategories={setCategories}
              onClose={() => setStep("")}
            />
          </div>
        );
      case "Add Navbar":
        return (
          <div className="newConglomerate" style={{ paddingBottom: "0px" }}>
            <NavBarList
              navBars={navBars}
              setNavBars={setNavBars}
              onClose={() => setStep("")}
            />
          </div>
        );
      case "country":
        return (
          <div className="newConglomerate">
            <CountryList setCountry={setCountry} onClose={() => setStep("")} />
          </div>
        );
      default:
        return (
          <>
            <div className="newConglomerate">
              <Scrollbars
                className="scrollForm"
                renderTrackHorizontal={() => <div />}
                renderThumbHorizontal={() => <div />}
                renderTrackVertical={() => <div />}
                renderThumbVertical={() => <div />}
              >
                {/* Select Country */}
                <div className="name">Select The Country</div>
                {country?.name ? (
                  <div className="user" onClick={() => setStep("country")}>
                    <img className="dp" src={country?.image} alt="" />
                    <div className="userDetail">
                      <div className="name">{country?.name}</div>
                    </div>
                  </div>
                ) : (
                  <div className="inputWrap" onClick={() => setStep("country")}>
                    <input
                      type="text"
                      className="text"
                      placeholder="Click To Select"
                      readOnly
                    />
                    <div
                      className="btnCheck"
                      style={{
                        border: "none",
                      }}
                    >
   <img src = {arrowDown} width = "30px" alt = "down"/>
                    </div>
                  </div>
                )}

                {/* Select Publication */}
                <div className="name">Select Publication</div>
                {selectedApp?.appName === "Authors" ? (
                  publication?.PublicationDetail[0]?.fxa_app_id ? (
                    <div
                      className="user"
                      onClick={() => setStep("Select Publication")}
                    >
                      <img
                        className="dp"
                        src={
                          publication?.PublicationDetail[0]?.profile_pic
                            ? publication?.PublicationDetail[0]?.profile_pic
                            : defaultImg
                        }
                        alt=""
                      />
                      <div className="userDetail">
                        <div className="name">
                          {publication?.PublicationDetail[0]?.name}
                        </div>
                        <div className="email">
                          {publication?.PublicationDetail[0]?.fxa_app_id}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="inputWrap"
                      onClick={() => setStep("Select Publication")}
                    >
                      <input
                        type="text"
                        className="text"
                        placeholder="Click To Select"
                        readOnly
                      />
                      <div
                        className="btnCheck"
                        style={{
                          border: "none",
                        }}
                      >
     <img src = {arrowDown} width = "30px" alt = "down"/>
                      </div>
                    </div>
                  )
                ) : publication?.fxa_app_id ? (
                  <div
                    className="user"
                    onClick={() => setStep("Select Publication")}
                  >
                    <img
                      className="dp"
                      src={
                        publication?.profile_pic
                          ? publication?.profile_pic
                          : defaultImg
                      }
                      alt=""
                    />
                    <div className="userDetail">
                      <div className="name">{publication?.name}</div>
                      <div className="email">{publication?.fxa_app_id}</div>
                    </div>
                  </div>
                ) : (
                  <div
                    className="inputWrap"
                    onClick={() => setStep("Select Publication")}
                  >
                    <input
                      type="text"
                      className="text"
                      placeholder="Click To Select"
                      readOnly
                    />
                    <div
                      className="btnCheck"
                      style={{
                        border: "none",
                      }}
                    >
   <img src = {arrowDown} width = "30px" alt = "down"/>
                    </div>
                  </div>
                )}

                {/* Select Author */}
                <div className="name">Select Author</div>
                {author?._id ? (
                  <div
                    className="user"
                    onClick={authorStep}
                  >
                    <img
                      className="dp"
                      src={
                        author?.profile_pic ? author?.profile_pic : defaultImg
                      }
                      alt=""
                    />
                    <div className="userDetail">
                      <div className="name">{author?.name}</div>
                      <div className="email">{author?.email}</div>
                    </div>
                  </div>
                ) : (
                  <div
                    className="inputWrap"
                    onClick={() => setStep("Select Author")}
                  >
                    <input
                      type="text"
                      className="text"
                      placeholder="Click To Select"
                      readOnly
                    />
                    <div
                      className="btnCheck"
                      style={{
                        border: "none",
                      }}
                    >
   <img src = {arrowDown} width = "30px" alt = "down"/>
                    </div>
                  </div>
                )}

                {/* Video Title */}
                <div className="name">Video Title</div>
                <div className="inputWrap">
                  <input
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value)}
                    type="text"
                    className="text"
                    placeholder="Enter Title..."
                  />
                </div>

                {/* Video Description */}
                <div className="name">Video Description</div>
                <div className="inputWrap">
                  <input
                    value={videoDesc}
                    onChange={(e) => setVideoDesc(e.target.value)}
                    type="text"
                    className="text"
                    placeholder="Enter Description..."
                  />
                </div>

                {/* Video Link */}
                <div className="name">Video Link</div>
                <div className="inputWrap">
                  <div
                    // onClick={(e) => handleCheckTokenAvailability()}
                    className="btnCheck"
                    style={{
                      border: "solid 1px #e7e7e7",
                      borderWidth: "0px 1px 0px 0px",
                    }}
                  >
                    {tokenAvailable !== null ? (
                      tokenAvailable === true ? (
                        <img style={{ cursor: "pointer" }} src={clearInput} />
                      ) : (
                        <img style={{ cursor: "pointer" }} src={clearInput} />
                      )
                    ) : (
                      "https://"
                    )}
                  </div>
                  <input
                    value={videoLink}
                    onChange={(e) => setVideoLink(e.target.value)}
                    type="text"
                    className="text"
                    placeholder="Link..."
                  />
                </div>

                {/* Upload Logos */}
                <div className="name">Video Thumbnail</div>

                <div>
                  <div
                    className="filesUpload"
                    style={{ justifyContent: "flex-start" }}
                  >
                    <label
                      className="fileInp icon"
                      style={{
                        flex: "0 0 50%",
                        maxWidth: "50%",
                        // marginLeft: "20px",
                      }}
                    >
                      <img
                        className={`${Boolean(coverPhoto)}`}
                        src={
                          coverPhotoLoading
                            ? loadingGif
                            : coverPhoto || cloudUploadIcon
                        }
                        alt=""
                        style={{ width: "40px" }}
                      />
                      <input
                        type="file"
                        onChange={(e) => {
                          uploadImage(e, setCoverPhoto, setCoverPhotoLoading);
                        }}
                        accept="image/*"
                      />
                      <div
                        className="text"
                        style={{ fontWeight: "700", fontSize: "12px" }}
                      >
                        Video Thumbnail
                      </div>
                      <div className="hovTxt">
                        Upload
                        <br />
                        New
                      </div>
                    </label>
                    {/* <label
      className="fileInp icon"
      style={{ visibility: "hidden" }}
    ></label> */}
                  </div>
                </div>

                {/* Add Categories */}
                <div className="name">Add Categories</div>
                <div style={{ display: "flex", flexWrap: "wrap" }}>
                  {categories?.map((item, index) => {
                    return (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",

                          alignItems: "center",
                        }}
                      >
                        <div
                          style={{
                            width: "100px",
                            height: "100px",
                            border: "0.5px solid #E7E7E7",
                            padding: "30px",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            margin: "10px",
                            position: "relative",
                          }}
                        >
                          <div style={{
                            background: "black",
                            width: "15px",
                            padding: "3px",
                            borderRadius: "20px",
                            position: "absolute",
                            height: "15px",
                            top: "0px",
                            right: "-6px",
                            marginTop: "-5px",
                          }}
                            onClick={() => removeCategory(item)}
                          >
                            <img style={{
                              marginTop: "-15px",
                              width: "10px",
                              height: "10px",
                              cursor: "pointer"
                            }} src={closeWhite} alt="" />
                          </div>
                          <img
                            src={item?.thumbnail}
                            alt=""
                            style={{ width: "60px", height: "60px" }}
                          />
                        </div>
                        <div
                          style={{
                            wordWrap: "break-word",
                            width: "100px",
                            textAlign: "center",
                          }}
                        >
                          {item?.title}
                        </div>
                      </div>
                    );
                  })}
                  <div
                    onClick={(e) => setStep("Add Category")}
                    style={{
                      width: "100px",
                      height: "100px",
                      border: "0.5px solid #E7E7E7",
                      padding: "30px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      margin: "10px",
                    }}
                  >
                    <img src={plus} alt="" />
                  </div>
                </div>

                {/* Add Categories */}
                <div className="name" style={{ paddingTop: "20px" }}>
                  Add NavBars
                </div>
                <div style={{ display: "flex", flexWrap: "wrap" }}>
                  {navBars.map((item, index) => {
                    return (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",

                          alignItems: "center",
                        }}
                      >
                        <div
                          style={{
                            width: "100px",
                            height: "100px",
                            border: "0.5px solid #E7E7E7",
                            padding: "30px",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            margin: "10px",
                            position: "relative",
                                                    }}
                        >
                          <div style={{
                            background: "black",
                            width: "15px",
                            padding: "3px",
                            borderRadius: "20px",
                            position: "absolute",
                            height: "15px",
                            top: "0px",
                            right: "-6px",
                            marginTop: "-5px",
                          }}
                            onClick={() => removeNav(item)}
                          >
                            <img style={{
                              marginTop: "-15px",
                              width: "10px",
                              height: "10px",
                              cursor: "pointer"
                            }} src={closeWhite} alt="" />
                          </div>
                          <img
                            src={item?.icon}
                            alt=""
                            style={{ width: "60px", height: "60px" }}
                          />
                        </div>
                        <div
                          style={{
                            wordWrap: "break-word",
                            width: "100px",
                            textAlign: "center",
                          }}
                        >
                          {item.navTitle}
                        </div>
                      </div>
                    );
                  })}
                  <div
                    onClick={(e) => setStep("Add Navbar")}
                    style={{
                      width: "100px",
                      height: "100px",
                      border: "0.5px solid #E7E7E7",
                      padding: "30px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      margin: "10px",
                    }}
                  >
                    <img src={plus} alt="" />
                  </div>
                </div>

                {/* Action Button Title */}
                <div className="name" style={{ paddingTop: "20px" }}>
                  Action Button Title
                </div>
                <div className="inputWrap">
                  <input
                    value={buttonTitle}
                    onChange={(e) => setButtonTitle(e.target.value)}
                    type="text"
                    className="text"
                    placeholder="Enter Title..."
                  />
                </div>

                {/* Action Button Link */}
                <div className="name">Action Button Link</div>
                <div className="inputWrap">
                  <div
                    // onClick={(e) => handleCheckTokenAvailability()}
                    className="btnCheck"
                    style={{
                      border: "solid 1px #e7e7e7",
                      borderWidth: "0px 1px 0px 0px",
                    }}
                  >
                    {tokenAvailable !== null ? (
                      tokenAvailable === true ? (
                        <img style={{ cursor: "pointer" }} src={clearInput} />
                      ) : (
                        <img style={{ cursor: "pointer" }} src={clearInput} />
                      )
                    ) : (
                      "https://"
                    )}
                  </div>
                  <input
                    value={buttonLink}
                    onChange={(e) => setButtonLink(e.target.value)}
                    type="text"
                    className="text"
                    placeholder="Link..."
                  />
                </div>

                <div className="name">Add Metatags</div>
                <div className="inputWrap">
                  <input
                    value={metaTag}
                    onChange={(e) => setMetaTag(e.target.value)}
                    type="text"
                    className="text"
                    placeholder="Enter Metatag.."
                  />
                  <img src={plusIcon} alt="plus" onClick={() => addMetaTag(metaTag)} className="plusImg" />
                </div>
                <div className="metaFields">
                  {metaArr.map((item, index) => {
                    return (
                      <div className="metaField">
                        <div className="metaTitle">{item}</div>
                        <div className="metaClose">
                          <img src={closeIconRed} alt="close" onClick={() =>removeTag(item)}/>
                        </div>
                      </div>
                    )
                  })}

                </div>

                <div className="name">Add Keywords</div>
                <div className="inputWrap">
                  <input
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    type="text"
                    className="text"
                    placeholder="Enter Keyword.."
                  />
                  <img src = {plusIcon} alt="plus" onClick={() => addKeyword(keywords)} className="plusImg" />

                </div>

                <div className="metaFields">
                  {keywordsArr.map((item, index) => {
                    return (
                      <div className="metaField">
                        <div className="metaTitle">{item}</div>
                        <div className="metaClose">
                          <img src = {closeIconRed} alt="close" onClick={() => removeKeyword(item)}/>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="name" style={{ paddingTop: "20px" }}>
                  Add Alt tags
                </div>
                <div className="inputWrap">
                  <input
                    value={altTag}
                    onChange={(e) => setAltTag(e.target.value)}
                    type="text"
                    className="text"
                    placeholder="Enter Alt tag..."
                  />
                </div>

                <div className="space"></div>
              </Scrollbars>
            </div>

            <div className="footerBtns">
              <div
                className="newField"
                style={{ fontWeight: 700 }}
                onClick={(e) => {
                  setStep("");
                  setMainMenu("");
                }}
              >
                Go Back
              </div>
              <div
                className="btnSubmit"
                onClick={() => validate()}
                style={{
                  fontWeight: 700,
                  opacity:
                    publication &&
                      author &&
                      videoTitle &&
                      videoLink &&
                      videoDesc &&
                      coverPhoto &&
                      categories &&
                      navBars &&
                      buttonTitle &&
                      buttonLink &&
                      country &&
                      altTag
                      ? 1
                      : 0.3,
                }}
              >
                Publish Video
              </div>
            </div>

            {/* <div className="ftBtns">
              <div
                className="newField"
                style={{ fontWeight: 700 }}
                onClick={(e) => {
                  setStep("");
                  setMainMenu("");
                }}
              >
                Go Back
              </div>
              <div
                className="btnSubmit"
                onClick={() => validate()}
                style={{ fontWeight: 700, opacity: visibleSubmit ? 1 : 0.3 }}
              >
                Submit App
              </div>
            </div> */}
          </>
        );
    }
  };

  const validate = () => {
    if (
      publication &&
      author &&
      videoTitle &&
      videoLink &&
      videoDesc &&
      coverPhoto &&
      categories &&
      navBars &&
      buttonTitle &&
      buttonLink &&
      country &&
      altTag
    ) {
      setVisibleSubmit(true);
      publishNewVideo();
    } else {
      toast.warning("All Fields Are Mandatory");
    }
  };

  const publishNewVideo = () => {
    setLoading(true);
    axios
      .post(`https://publications.apimachine.com/video/new`, {
        categoryType: categories.map((o) => o._id),
        user_id: author?._id,
        email: author?.email,
        publication_id: selectedApp?.appName === "Authors"
          ? publication?.PublicationDetail[0]?._id
          : publication?._id,
        navbar_id: navBars.map((o) => o._id),
        title: videoTitle,
        desc: videoDesc,
        image: coverPhoto,
        video: videoLink,
        action_link: buttonLink,
        action: buttonTitle,
        country: country?.name,
        metatags: metaArr,
        keywords: keywordsArr,
        altTag: altTag,
      })
      .then(({ data }) => {
        if (data.status === false) {
          if (data.message === "jwt expired") {
            setStep("Token Expired");
          }
          toast.success(data.message || "API Error");
        } else setStep("success");
      })
      .catch((error) => {
        toast.error(error?.response?.data?.message);
      })
      .finally(() => {
        setLoading(false);
        setTabSelected("Video");
      });
  };

  return (
    <>
      {loading ? (
        // <div
        //   style={{
        //     display: "flex",
        //     flexDirection: "column",
        //     justifyContent: "center",
        //     alignItems: "center",
        //     height: "70vh",
        //   }}
        // >
        //   <div className="loader"></div>
        //   <div style={{ padding: "20px", fontWeight: 600, color: "#18191D" }}>
        //     Creating New Publication ...
        //   </div>
        // </div>
        <div
          style={{
            height: window.innerHeight,
            position: "relative",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <LoadingAnimation logoAnim sideDraw={true} />
          <div
            style={{
              position: "absolute",
              bottom: 0,
              textAlign: "center",
              marginBottom: "40px",
              fontWeight: 600,
              color: "#18191D",
              fontSize: "20px",
            }}
          >
            Publishing Video...
          </div>
        </div>
      ) : (
        getContent()
      )}
    </>
  );
};

export default NewVideo;
