import React, { useContext, useEffect, useState } from "react";
import Axios from "axios";
import Scrollbars from "react-custom-scrollbars";
import * as jose from "jose";
import cloudUploadIcon from "../../../static/images/clipIcons/cloudUpload.svg";

import loadingGif from "../../../static/images/loading.gif";
import arrowDown from "../../../static/images/arrowDown.svg"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

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

import plus from "../../../static/images/globaldrawer/plus.svg";
import "../../../static/scss/_newConglomerate.scss";

import AppList from "./AppsList";
import LoadingAnimation from "../../LoadingAnimation";
import FontList from "./FontList";

function renameFile(originalFile, newName) {
  return new File([originalFile], newName, {
    type: originalFile.type,
    lastModified: originalFile.lastModified,
  });
}

const secret = "uyrw7826^&(896GYUFWE&*#GBjkbuaf"; // secret not to be disclosed anywhere.
const emailDev = "rahulrajsb@outlook.com"; // email of the developer.

const NewPublication = ({
  step,
  setStep,
  setMainMenu,
  loading,
  setLoading,
}) => {
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
    setSlider,
    refetchData,
    setRefetchData,
  } = useContext(GlobalContex);

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
  // const [selectedFont, setSelectedFont] = useState(null);

  const [colouredIcon, setColouredIcon] = useState("");
  const [colouredIconLoading, setColouredIconLoading] = useState("");

  const [coverPhoto, setCoverPhoto] = useState("");
  const [coverPhotoLoading, setCoverPhotoLoading] = useState("");

  const [visibleSubmit, setVisibleSubmit] = useState(false);
  const [primaryColour, setPrimaryColour] = useState("#000000");
  const [secondaryColour, setSecondaryColour] = useState("#000000");
  const [textColor, setTextColor] = useState("#000000");
  const [textFont, setTextFont] = useState("");
  const [Logo, setLogo] = useState("");
  const [LogoLoading, setLogoLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem("step", step);
  }, [step]);

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

  function getContent() {
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
                You Have Successfully Created the app {app.name}. You Will Be
                Redirected To The Updated App List Automatically
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
          <div className="newConglomerate" style={{paddingBottom:"0px"}}>
            <CountryList setCountry={setCountry} onClose={() => setStep("")} />
          </div>
        );
      case "Font":
        return (
          <div className="newConglomerate" style={{ paddingBottom: "0px" }}>
            <FontList setTextFont={setTextFont} onClose={() => setStep("")} />
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

      default:
        return (
          <>
            <div className="newConglomerate" style={{paddingBottom:"0px"}}>
              <Scrollbars
                className="scrollForm"
                renderTrackHorizontal={() => <div />}
                renderThumbHorizontal={() => <div />}
                renderTrackVertical={() => <div />}
                renderThumbVertical={() => <div />}
              >
                {/* Publication Name */}
                <div className="name">What do you want to call your publication?</div>
                <div className="inputWrap">
                  <input
                    value={publicationName}
                    onChange={(e) => setPublicationName(e.target.value)}
                    type="text"
                    className="text"
                    placeholder="Publication Name..."
                  />
                </div>

                {/* Select Connected App */}
                {/* <div className="name">Select Connected App</div>
                {app?.app_code ? (
                  <div className="user" onClick={() => setStep("app")}>
                    <img className="dp" src={app?.app_icon} alt="" />
                    <div className="userDetail">
                      <div className="name">{app?.app_name}</div>
                      <div className="email">{app?.app_code}</div>
                    </div>
                  </div>
                ) : (
                  <div className="inputWrap" onClick={() => setStep("app")}>
                    <input
                      type="text"
                      className="text"
                      placeholder="Click Here To Select An App"
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
                )} */}
                {/* Select Country */}
                <div className="name">What country is your publication based in?</div>
                {country?.name ? (
                  <div className="countryuser" onClick={() => setStep("country")}>
                    <img className="dp" src={country?.image} alt="" />
                    <div>
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

                {/* Publication Description */}
                <div className="name">Describe your publication</div>
                {/* <div className="inputWrap"> */}
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  type="text"
                  className="text-textarea"
                  placeholder="Description..."
                  rows={5}
                  cols={40}
                />
                {/* </div> */}

                {/* Publication Webiste */}
                <div className="name">What will be the website for your publication?</div>
                <div className="inputWrap">
                  <div
                  // className="btnCheck"
                  // style={{
                  //   border: "solid 1px #e7e7e7",
                  //   borderWidth: "0px 1px 0px 0px",
                  // }}
                  >
                    {/* {tokenAvailable !== null ? (
                      tokenAvailable === true ? (
                        <img style={{ cursor: "pointer" }} src={clearInput} />
                      ) : (
                        <img style={{ cursor: "pointer" }} src={clearInput} />
                      )
                    ) : (
                      "https://"
                    )} */}
                  </div>
                  <input
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    type="text"
                    className="text"
                    placeholder="Link..."
                  />
                </div>



                {/* Upload Logos */}
                <div className="name">Upload a cover photo</div>
                <div>
                  <div className="filesUpload"
                    style={{ justifyContent: "flex-start", height: "323px" }}>
                    <label
                      className="fileInp icon"
                      style={{
                        flex: "0 0 100%",
                        maxWidth: "100%",
                        borderRadius: "35px"
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
                        style={{ width: "80px" }}
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
                        {/* Cover Photo */}
                      </div>
                      <div className="hovTxt">
                        Upload
                        <br />
                        New
                      </div>
                    </label>
                  </div>

                </div>
                <div className="name">Upload a icon</div>
                <div>
                  <div
                    className="filesUpload"
                    style={{ justifyContent: "flex-start" }}
                  >
                    <label className="fileInp icon" style={{
                      height: "95px",
                      borderRadius: "15px"
                    }}>
                      <img
                        className={`${Boolean(colouredIcon)}`}
                        src={
                          colouredIconLoading
                            ? loadingGif
                            : colouredIcon || cloudUploadIcon
                        }
                        alt=""
                        style={{ width: "40px" }}
                      />
                      <input
                        type="file"
                        onChange={(e) => {
                          uploadImage(
                            e,
                            setColouredIcon,
                            setColouredIconLoading
                          );
                        }}
                        accept="image/*"
                      />
                      <div
                        className="text"
                        style={{ fontWeight: "700", fontSize: "12px" }}
                      >
                        {/* Colored Icon */}
                      </div>
                      <div className="hovTxt">
                        Upload
                        <br />
                        New
                      </div>
                    </label>

                  </div>
                </div>
                <div className="name">Upload a logo</div>
                <div>
                  <div className="filesUpload"
                    style={{ justifyContent: "flex-start", height: "145px" }}>
                    <label
                      className="fileInp icon"
                      style={{
                        flex: "0 0 100%",
                        maxWidth: "100%",
                        borderRadius: "15px"
                      }}
                    >
                      <img
                        className={`${Boolean(coverPhoto)}`}
                        src={
                          LogoLoading
                            ? loadingGif
                            : Logo || cloudUploadIcon
                        }
                        alt=""
                        style={{ width: "40px" }}
                      />
                      <input
                        type="file"
                        onChange={(e) => {
                          uploadImage(e, setLogo, setLogoLoading);
                        }}
                        accept="image/*"
                      />
                      <div
                        className="text"
                        style={{ fontWeight: "700", fontSize: "12px" }}
                      >
                        {/* Cover Photo */}
                      </div>
                      <div className="hovTxt">
                        Upload
                        <br />
                        New
                      </div>
                    </label>
                  </div>

                </div>

                <div className="name">Enter primary colour code</div>
                <div className="inputWrap">
                  <input
                    value={primaryColour}
                    // onChange={(e) => setPrimaryColour(e.target.value)}
                    type="text"
                    className="text"
                    placeholder="#000000"
                  />
                  <div
                    className="btnCheck"
                    style={{
                      border: "none"
                    }}
                  >
                    <input type="color" style={{
                      border: "none",
                    }} className="color" value={primaryColour} 
                    onChange={(e) => setPrimaryColour(e.target.value)}
                    />

                  </div>
                </div>

                <div className="name">Enter secondary colour code</div>
                <div className="inputWrap">
                  <input
                    value={secondaryColour}
                    // onChange={(e) => setSecondaryColour(e.target.value)}
                    type="text"
                    className="text"
                    placeholder="#000000"
                  />
                  <div
                    className="btnCheck"
                    style={{
                      border: "none"
                    }}
                  >
                    <input type="color" style={{
                      border: "none",
                    }} className="color" value={secondaryColour} onChange={(e) => setSecondaryColour(e.target.value)}
                    />

                  </div>
                </div>


                <div className="name">Enter text colour code</div>
                <div className="inputWrap">
                  <input
                    value={textColor}
                    // onChange={(e) => setTextColor(e.target.value)}
                    type="text"
                    className="text"
                    placeholder="#000000"
                  />
                  <div
                    className="btnCheck"
                    style={{
                      border: "none"
                    }}
                  >
                    <input type="color" style={{
                      border: "none",
                    }} className="color" value={textColor} onChange={(e) => setTextColor(e.target.value)}
                    />

                  </div>
                </div>


                <div className="name">Enter text font</div>
                {textFont ? (
                  <div className="countryuser" onClick={() => setStep("Font")}>
                    {/* <img className="dp" src={country?.image} alt="" /> */}
                    <div>
                      <div className="name">{textFont}</div>
                    </div>
                  </div>
                ) : (
                  <div className="inputWrap" onClick={() => setStep("Font")}>
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
                <div>
              <div
                className="btnBack"
                onClick={(e) => {
                  setStep("");
                  setMainMenu("");
                }}
              >
                Go Back
              </div>
              &nbsp;
              <div
                className="NextStepBtn"
                onClick={() => validate()}
                style={{
                  opacity:
                    publicationName &&
                      description &&
                      website &&
                      colouredIcon &&
                      coverPhoto &&
                      country &&
                      primaryColour &&
                      secondaryColour &&
                      textColor &&
                      textFont
                      ? 1
                      : 0.3,
                }}
              >
                Next Step
              </div>
              &nbsp;
            </div>
                <div className="space"></div>
              </Scrollbars>
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
  }

  const validate = () => {
    if (
      publicationName &&
      description &&
      website &&
      colouredIcon &&
      coverPhoto &&
      country &&
      primaryColour &&
      secondaryColour &&
      textColor &&
      textFont &&
      Logo
    ) {
      setVisibleSubmit(true);
      createNewPublication();
    } else {
      toast.warning("All Fields Are Mandatory");
    }
  };

  const createNewPublication = () => {
    setLoading(true);
    axios
      .post(`https://publications.apimachine.com/publication/new`, {
        name: publicationName,
        app_code: "farm",
        email: bankerEmail,
        profile_pic: colouredIcon,
        cover_pic: coverPhoto,
        description: description,
        website: website,
        social_media: "",
        country: country.name,
        primaryColor: primaryColour,
        secondaryColor: secondaryColour,
        textColor: textColor,
        font: textFont,
        fullColoredLogo: Logo,
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
        setTabSelected("Publications");
        setSlider(false);
        setStep("");
        setRefetchData(!refetchData);
      });
  };

  // const createApp = () => {
  //   setLoading(true);
  //   axios
  //     .post(`https://comms.globalxchange.io/gxb/apps/create`, {
  //       app_name: appName,
  //       app_code: appCode,
  //       profile_start_code: appCode,
  //       parent_group_id: conglomerate.group_id,
  //       GXNativeapp: true,
  //       mobileApp: true,
  //       short_description: shortDesc,
  //       long_description: longDesc,
  //       categories: categories.map((o) => o.category_id),
  //       color_codes: [
  //         {
  //           primarycolourcode: primaryColour,
  //         },
  //       ],
  //       user_label: callUsers,
  //       app_icon: colouredIcon,
  //       white_logo: whiteLogo2,
  //       website: website,
  //       cover_photo: coverPhoto,
  //       operatorid: brand.operator_id,
  //       email: bankerEmail,
  //       token: loginData.idToken,
  //       country: country.name,
  //       data: {
  //         color_logo: colouredLogo,
  //         white_icon: whiteLogo,
  //         website_description: websiteDesc,
  //         website_title: websiteTitle,
  //         currencyname: displayCurrency.coinSymbol,
  //       },
  //     })
  //     .then(({ data }) => {
  //       if (data.status === false) {
  //         toast.success(data.message || "API Error");
  //       } else setStep("success");
  //     })
  //     .catch((error) => {
  //       toast.error(error?.response?.data?.message);
  //     })
  //     .finally(() => setLoading(false));
  // };

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
            Creating {publicationName} ...
          </div>
        </div>
      ) : (
        getContent()
      )}
    </>
  );
};

export default NewPublication;
