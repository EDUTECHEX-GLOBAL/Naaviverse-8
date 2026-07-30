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
import { toast , ToastContainer } from "react-toastify";
import axios from "axios";
import clearInput from "../../../static/images/icons/refresh.svg";
import CountryList from "./CountryList";
import AppsList from "./AppsList";
import "./numberInput.css";
import { GlobalContex } from "../../../globalContext";

import plus from "../../../static/images/globaldrawer/plus.svg";

import AppList from "./AppsList";
import LoadingAnimation from "../../LoadingAnimation";

function renameFile(originalFile, newName) {
  return new File([originalFile], newName, {
    type: originalFile.type,
    lastModified: originalFile.lastModified,
  });
}

const secret = "uyrw7826^&(896GYUFWE&*#GBjkbuaf"; // secret not to be disclosed anywhere.
const emailDev = "rahulrajsb@outlook.com"; // email of the developer.

const NewAuthor = ({ step, setStep, setMainMenu, loading, setLoading }) => {
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
  } = useContext(GlobalContex);

  // Form Variables

  const [company, setCompany] = useState();
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [tokenName, setTokenName] = useState("");
  const [tokenAvailable, setTokenAvailable] = useState(null);

  //Publishers New Publication
  const [authorName, setAuthorName] = useState("");
  const [country, setCountry] = useState(null);
  const [description, setDescription] = useState("");
  const [authorUserName, setAuthorUserName] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [colouredIcon, setColouredIcon] = useState("");
  const [colouredIconLoading, setColouredIconLoading] = useState("");
  const [coverPhoto, setCoverPhoto] = useState("");
  const [coverPhotoLoading, setCoverPhotoLoading] = useState("");

  const [visibleSubmit, setVisibleSubmit] = useState(false);

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
                You Have Successfully Made {authorName} An Author
              </div>
            </div>
          </div>
        );

      case "country":
        return (
          <div className="newConglomerate">
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
                {/* Author Name */}
                <div className="name">Author Name</div>
                <div className="inputWrap">
                  <input
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    type="text"
                    className="text"
                    placeholder="Author Name..."
                  />
                </div>

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

                {/* Author Username */}
                <div className="name">Create Username</div>
                <div className="inputWrap">
                  <input
                    value={authorUserName}
                    onChange={(e) => setAuthorUserName(e.target.value)}
                    type="text"
                    className="text"
                    placeholder="Enter Username..."
                  />
                </div>

                {/* Publication Description */}
                <div className="name">Describe</div>
                <div className="inputWrap">
                  <input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    type="text"
                    className="text"
                    placeholder="Enter Description..."
                  />
                </div>

                {/* Enter Email */}
                <div className="name">Enter Email</div>
                <div className="inputWrap">
                  <input
                    value={authorEmail}
                    onChange={(e) => setAuthorEmail(e.target.value)}
                    type="text"
                    className="text"
                    placeholder="Email...."
                  />
                </div>
                <div className="name">Upload Profile Image</div>

                <div>
                  <div
                    className="filesUpload"
                    style={{ justifyContent: "flex-start" }}
                  >
                    <label className="fileInp icon">
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
                       Profile Pic
                      </div>
                      <div className="hovTxt">
                        Upload
                        <br />
                        New
                      </div>
                    </label>
                    <label
                      className="fileInp icon"
                      style={{
                        flex: "0 0 50%",
                        maxWidth: "50%",
                        marginLeft: "20px",
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
                        Cover Photo
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
                    authorName &&
                      description &&
                      authorUserName &&
                      country &&
                      authorEmail &&  
                      colouredIcon &&
                      coverPhoto
                      ? 1
                      : 0.3,
                }}
              >
                Add Author
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
  }

  const validate = () => {
    if (authorName && description && authorUserName && country && authorEmail && colouredIcon && coverPhoto) {
      setVisibleSubmit(true);
      createNewAuthor();
    } else {
      toast.warning("All Fields Are Mandatory");
    }
  };

  const createNewAuthor = () => {
    setLoading(true);
    axios
      .post(`https://publications.apimachine.com/publisher/register`, {
        name: authorName,
        user_name: authorUserName,
        email: authorEmail,
        description: description,
        country: country.name,
        profile_pic: colouredIcon,
        cover_pic: coverPhoto,
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
        setTabSelected("Authors");
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
            Adding {authorName}
          </div>
        </div>
      ) : (
        getContent()
      )}
      <ToastContainer />
    </>
  );
};

export default NewAuthor;
