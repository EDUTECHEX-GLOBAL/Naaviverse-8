import React, { useState, useRef, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import MapComponent from "./MapComponent";
import Listview from "../Listview";
import {
  useJsApiLoader,
  GoogleMap,
  Marker,
  Autocomplete,
} from "@react-google-maps/api";
import { LoadScript } from "@react-google-maps/api";
import "./mapspage.scss";
import DatePicker from "react-datepicker";
import { useCoinContextData } from "../../context/CoinContext";
import "react-datepicker/dist/react-datepicker.css";
import { useStore } from "../../components/store/store.ts";

//images
import logo from "../../static/images/logo.svg";
import careerIcon from "../../static/images/mapspage/careerIcon.svg";
import educationIcon from "../../static/images/mapspage/educationIcon.svg";
import immigrationIcon from "../../static/images/mapspage/immigrationIcon.svg";
import plus from "../../static/images/mapspage/plus.svg";
import close from "../../static/images/mapspage/close.svg";
import hamIcon from "../../static/images/icons/hamIcon.svg";
import axios from "axios";
import Pathview from "../Pathview";
import Stepview from "../Stepview";
import { GlobalContex } from "../../globalContext";
import JourneyPage from "../Pathview/JourneyPage";

const libraries = ["places"];

const PathComponent = () => {
  const navigate = useNavigate();
  const { sideNav, setsideNav } = useStore();
  const [option, setOption] = useState("Education");
  const [containers, setContainers] = useState([
    { id: 1, inputValue1: "", inputValue2: "", removable: false },
  ]);
  const [pathOption, setPathOption] = useState("Path View");
  // const [searchTerm, setSearchterm] = useState("");
  const [pathMap, setPathMap] = useState(/** @type google.maps.Map */(null));
  const [pathCurrentLocation, setPathCurrentLocation] = useState(null);
  const [pathSearchTerm, setPathSearchTerm] = useState("");
  const autocompleteRef = useRef(null);
  const [pathResetLoaction, setPathResetLocation] = useState(false);
  const [pathSelectedPlace, setPathSelectedPlace] = useState(null);
  const [pathPlacesId, setPathPlacesId] = useState(null);
  const [pathPlaceInfo, setPathPlaceInfo] = useState("");
  const [pathSelectedDate, setPathSelectedDate] = useState(null);
  const [pathShowDatePicker, setPathShowDatePicker] = useState(false);
  const [pathDirections, setPathDirections] = useState(null);
  const [pathSelectedLocation, setPathSelectedLocation] = useState(null);
  const [pathShowDirections, setPathShowDirections] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [selectedPathId, setSelectedPathId] = useState(null);
  const {
    searchTerm,
    setSearchterm,
    pathItemSelected,
    setPathItemSelected,
    pathItemStep,
    setPathItemStep,
    selectedPathItem,
    setSelectedPathItem,
    showPathDetails,
    setShowPathDetails,
  } = useCoinContextData();
  const {
    gradeToggle,
    setGradeToggle,
    schoolToggle,
    setSchoolToggle,
    curriculumToggle,
    setCurriculumToggle,
    streamToggle,
    setStreamToggle,
    performanceToggle,
    setPerformanceToggle,
    financialToggle,
    setFinancialToggle,
    personalityToggle,
    setPersonalityToggle,
    refetchPaths,
    setRefetchPaths,
  } = useContext(GlobalContex);
  const [loading, setLoading] = useState(false);
  const [levelThreeData, setLevelThreeData] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  let userDetails = JSON.parse(localStorage.getItem("user"));

  const handleAddContainer = () => {
    const lastContainer = containers[containers.length - 1];
    const newContainerId = lastContainer.id + 1;
    const newContainer = {
      id: newContainerId,
      inputValue1: "",
      inputValue2: "",
      removable: true,
    };
    setContainers([...containers, newContainer]);
  };

  const handleRemoveContainer = (containerId) => {
    const updatedContainers = containers.filter(
      (container) => container.id !== containerId
    );
    // Renumber the containers after removing one
    const renumberedContainers = updatedContainers.map((container, index) => {
      return { ...container, id: index + 1 };
    });
    setContainers(renumberedContainers);
  };

  const handleInputChange = (e, containerId, inputIndex) => {
    const updatedContainers = [...containers];
    const containerIndex = updatedContainers.findIndex(
      (container) => container.id === containerId
    );

    if (containerIndex !== -1) {
      if (inputIndex === 1) {
        updatedContainers[containerIndex].inputValue1 = e.target.value;
      } else if (inputIndex === 2) {
        updatedContainers[containerIndex].inputValue2 = e.target.value;
      }

      setContainers(updatedContainers);
    }
  };

  useEffect(() => {
    if (navigator.geolocation) {
      setPathSelectedPlace("");
      setPathSelectedLocation(null);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setPathCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error(
            "Error getting current location in path component:",
            error
          );
        }
      );
    }
  }, [pathResetLoaction]);

  const handlePlaceSelect = () => {
    if (autocompleteRef?.current) {
      const place = autocompleteRef?.current?.getPlace();
      if (place?.geometry && place?.geometry?.location) {
        const location = {
          lat: place?.geometry?.location?.lat(),
          lng: place?.geometry?.location?.lng(),
        };
        setPathSelectedLocation(location);
        setPathSelectedPlace(place?.formatted_address);
        const placeId = place?.place_id;
        setPathPlacesId(placeId);
        if (pathMap) {
          pathMap.panTo(location);
        }
      }
    }
  };

  const fetchPlaceDetails = async (placeId) => {
    // console.log(placeId, 'placeid')
    if (placeId !== null) {
      try {
        const response = await fetch(
          `https://careers.marketsverse.com/api/places?place_id=${placeId}`
        );
        const data = await response.json();
        // console.log(data?.result, "place info");
        setPathPlaceInfo(data?.result);
        return data.result;
      } catch (error) {
        console.log(error, "error in getting place info in path component");
      }
    }
  };

  useEffect(() => {
    fetchPlaceDetails(pathPlacesId);
  }, [pathPlacesId]);

  const handleDateChange = (date) => {
    setPathSelectedDate(date);
    setPathShowDatePicker(false);
  };

  const CustomInput = ({ value, onClick }) => (
    <input
      type="text"
      placeholder="By When?"
      value={value}
      onClick={onClick}
      onFocus={() => setPathShowDatePicker(true)}
      onBlur={() => setPathShowDatePicker(false)}
    />
  );

  const myTimeout = () => {
    setTimeout(reload, 3000);
  };

  function reload() {
    setsideNav("My Journey");
    setSelectedPathItem([]);
    setPathItemSelected(true);
    setPathItemStep(3);
    navigate("/dashboard/users");
  }

  const pathSelection = () => {
    setLoading(true);
    let body = {
      email: userDetails?.email,
      pathId: selectedPathItem?._id, // Selected from UI
    };

    axios
      .post(`/api/fetch/selectpath`, body)
      .then((response) => {
        let result = response?.data;
        console.log("Path Selection Result:", result);

        if (result?.pathId) {
          localStorage.setItem("selectedPathId", result.pathId); // Store pathId
          setSelectedPathId(result.pathId); // Update state
        }

        setLoading(false);

        // Call reload function to update the UI
        reload();
      })
      .catch((error) => {
        console.error("Error in path selection:", error.response?.data || error);
        setLoading(false);
      });
  };

  const fetchUserProfile = async () => {
    try {
      const email = userDetails?.email; // Ensure email is defined
      const response = await fetch(`/api/users/get/${email}`);
      const result = await response.json();

      console.log("Fetched User Data:", result);

      if (result.status) {
        localStorage.setItem("userProfile", JSON.stringify(result.data));
        setUserProfile(result.data); // Adjust based on actual structure
      } else {
        console.log("No user found");
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const MidAreaContent = ({ onClose }) => (
    <div className="mid-area1" >
      {/* Close button */}
      <button
        onClick={onClose}
        aria-label="Close"
        style={{
          position: "absolute",
          top: "-34px",
          right: "-3px",
          fontSize: "3rem",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          fontWeight: "",
          lineHeight: 1,
          zIndex: 9999,
          color: "#000", // ensure visible color
        }}
      >
        &times;
      </button>

      <div className="current-coord-container"
        styles={{
          width: '100%',
          display: 'flex',
          flexdirection: 'column',
          gap: '0.5rem',
          marginbottom: '0.5rem'
        }}>
        <div className="current-text">Current Coordinates</div>

        {userProfile ? (
          <>
            <div
              className="each-coo-field"
              style={{
                width: '100%',
                borderRadius: '60px',
                backgroundColor: 'white',
                display: 'grid',
                gridTemplateColumns: 'auto 1fr auto', /* Adjusted for the new layout */
                alignItems: 'center',
                padding: '0.5rem ',
                fontWeight: '300',
                fontSize: '0.9rem',
                gap: '1rem',
                border: '2px solid #ccc',
                marginBottom: '2rem',
                marginTop: '2rem'
              }}
            >
              <div
                className="field-name"
                style={{
                  fontSize: '1em',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  whiteSpace: 'nowrap',
                  paddingLeft: '0.4rem',  /* Space from the left edge */
                  paddingRight:'0.4rem',
                 
                }}
              >
                Grade
              </div>
              <div
                className="toggleContainer"
                onClick={(e) => setGradeToggle(!gradeToggle)}
                style={{
                  width: '100% !important',
                  border: '1px solid #d9d9d9',
                  borderradius: '35px',
                  marginleft: '10px',
                  marginright: '2px !important',
                  
                }}
              >
                <div
                  className="toggle"
                  style={{
                    width: '1.2rem',    /* Adjusted size */
                    height: '1.2rem',   /* Adjusted size */
                    background: 'linear-gradient(90deg, #47b4d5 0.02%, #29449d 119.26%)',
                    borderRadius: '100%',
                    cursor: 'pointer',
                    transform: !gradeToggle
                      ? "translateX(0px)"
                      : "translateX(20px)",
                  }}
                >
                  &nbsp;
                </div>
              </div>
              <div
                className="field-value"
                style={{
                  fontSize: '1em',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end', /* Align to the right */
                  whiteSpace: 'nowrap',
                  paddingRight: '0.4rem',   /* Space from the right edge */
                }}
              >
                {userProfile?.grade}
              </div>
            </div>



            <div className="each-coo-field" style={{
              width: '100%',
              borderRadius: '60px',
              backgroundColor: 'white',
              display: 'grid',
              gridTemplateColumns: 'auto 1fr auto', /* Adjusted for the new layout */
              alignItems: 'center',
              padding: '0.5rem 1rem',
              fontWeight: '300',
              fontSize: '0.9rem',
              gap: '0.5rem',
              border: '2px solid #ccc',
              marginBottom: '2rem',
            }}>
              <div className="field-name" style={{
                fontSize: '1em',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                whiteSpace: 'nowrap',
                paddingLeft: '0rem',  /* Space from the left edge */
                paddingRight:'0.2rem',
               
              }}>Curriculum </div>
              <div
                className="toggleContainer2"
                onClick={(e) => setCurriculumToggle(!curriculumToggle)}
                style={{
                  width: '30% !important',
                  border: '1px solid #d9d9d9',
                  borderradius: '35px',
                  marginleft: '10px',
                  marginright: '2px !important',
                  
                }}
              >
                <div
                  className="toggle2"
                  style={{
                    width: '1.2rem',    /* Adjusted size */
                    height: '1.2rem',   /* Adjusted size */
                    background: 'linear-gradient(90deg, #47b4d5 0.02%, #29449d 119.26%)',
                    borderRadius: '100%',
                    cursor: 'pointer',
                    transform: !curriculumToggle
                      ? "translateX(0px)"
                      : "translateX(20px)",
                  }}
                >
                  &nbsp;
                </div>
              </div>
              <div className="field-value" style={{
                fontSize: '1em',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end', /* Align to the right */
                whiteSpace: 'nowrap',
                paddingRight: '0 rem',   /* Space from the right edge */
              }}>
                {userProfile?.curriculum}
              </div>
            </div>

            <div className="each-coo-field" style={{
              width: '100%',
              borderRadius: '60px',
              backgroundColor: 'white',
              display: 'grid',
              gridTemplateColumns: 'auto 1fr auto', /* Adjusted for the new layout */
              alignItems: 'center',
              padding: '0.5rem 1rem',
              fontWeight: '300',
              fontSize: '0.9rem',
              gap: '0.5rem',
              border: '2px solid #ccc',
              marginBottom: '2rem',
            }}>
              <div className="field-name" style={{
                fontSize: '1em',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                whiteSpace: 'nowrap',
                paddingLeft: '0rem',  /* Space from the left edge */
              }}>Stream</div>
              <div
                className="toggleContainer"
                onClick={(e) => setStreamToggle(!streamToggle)}
                style={{
                  width: '100% !important',
                  border: '1px solid #d9d9d9',
                  borderradius: '35px',
                  marginleft: '10px',
                  marginright: '2px !important',
                }}
              >
                <div
                  className="toggle"
                  style={{
                    width: '1.2rem',    /* Adjusted size */
                    height: '1.2rem',   /* Adjusted size */
                    background: 'linear-gradient(90deg, #47b4d5 0.02%, #29449d 119.26%)',
                    borderRadius: '100%',
                    cursor: 'pointer',
                    transform: !streamToggle
                      ? "translateX(0px)"
                      : "translateX(20px)",
                  }}
                >
                  &nbsp;
                </div>
              </div>
              <div className="field-value" style={{
                fontSize: '1em',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end', /* Align to the right */
                whiteSpace: 'nowrap',
                paddingRight: '0rem',   /* Space from the right edge */
              }}>
                {console.log("stream:", userProfile?.stream)}
                {userProfile?.stream}
              </div>
            </div>

            <div className="each-coo-field" style={{
              width: '100%',
              borderRadius: '60px',
              backgroundColor: 'white',
              display: 'grid',
              gridTemplateColumns: 'auto 1fr auto', /* Adjusted for the new layout */
              alignItems: 'center',
              padding: '0.5rem 1rem',
              fontWeight: '300',
              fontSize: '0.9rem',
              gap: '0.5rem',
              border: '2px solid #ccc',
              marginBottom: '2rem',
            }}>
              <div className="field-name" style={{
                fontSize: '1em',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                whiteSpace: 'nowrap',
                paddingLeft: '0.1rem',  /* Space from the left edge */
                paddingRight:'0rem',
              }}>Performance</div>
              <div
                className="toggleContainer4"
                onClick={(e) => setPerformanceToggle(!performanceToggle)}
                style={{
                  width: '100% !important',
                  border: '1px solid #d9d9d9',
                  borderradius: '35px',
                  marginleft: '3px',
                  marginright: '2px !important',
                }}
              >
                <div
                  className="toggle4"
                  style={{
                    width: '1.2rem',    /* Adjusted size */
                    height: '1.2rem',   /* Adjusted size */
                    background: 'linear-gradient(90deg, #47b4d5 0.02%, #29449d 119.26%)',
                    borderRadius: '100%',
                    cursor: 'pointer',
                    transform: !performanceToggle
                      ? "translateX(0px)"
                      : "translateX(20px)",
                  }}
                >
                  &nbsp;
                </div>
              </div>
              <div className="field-value" sstyle={{
                fontSize: '1em',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end', /* Align to the right */
                whiteSpace: 'nowrap',
                paddingRight: '0rem',   /* Space from the right edge */
              }}>
                {userProfile?.performance}
              </div>
            </div>

            <div className="each-coo-field" style={{
              width: '100%',
              borderRadius: '60px',
              backgroundColor: 'white',
              display: 'grid',
              gridTemplateColumns: 'auto 1fr auto', /* Adjusted for the new layout */
              alignItems: 'center',
              padding: '0.5rem 1rem',
              fontWeight: '300',
              fontSize: '0.9rem',
              gap: '0.5rem',
              border: '2px solid #ccc',
              marginBottom: '2rem',
            }}>
              <div className="field-name" style={{
                fontSize: '1em',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                whiteSpace: 'nowrap',
                paddingLeft: '0rem',  /* Space from the left edge */
              }}>Financial</div>
              <div
                className="toggleContainer3"
                onClick={(e) => setFinancialToggle(!financialToggle)}
                style={{
                  width: '100% !important',
                  border: '1px solid #d9d9d9',
                  borderradius: '35px',
                  marginleft: '10px',
                  marginright: '2px !important',
                }}
              >
                <div
                  className="toggle3"
                  style={{
                    width: '1.2rem',    /* Adjusted size */
                    height: '1.2rem',   /* Adjusted size */
                    background: 'linear-gradient(90deg, #47b4d5 0.02%, #29449d 119.26%)',
                    borderRadius: '100%',
                    cursor: 'pointer',
                    transform: !financialToggle
                      ? "translateX(0px)"
                      : "translateX(20px)",
                  }}
                >
                  &nbsp;
                </div>
              </div>
              <div className="field-value" style={{
                fontSize: '1em',
                fonteight: '20%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end', /* Align to the right */
                whiteSpace: 'nowrap',
                paddingRight: '0rem',   /* Space from the right edge */
              }}>
                {userProfile?.financialSituation}
              </div>
            </div>

            <div className="each-coo-field" style={{
              width: '100%',
              borderRadius: '60px',
              backgroundColor: 'white',
              display: 'grid',
              gridTemplateColumns: 'auto 1fr auto', /* Adjusted for the new layout */
              alignItems: 'center',
              padding: '0.5rem 1rem',
              fontWeight: '300',
              fontSize: '0.9rem',
              gap: '0.5rem',
              border: '2px solid #ccc',
              marginBottom: '2rem',
            }}>
              <div className="field-name" style={{
                fontSize: '1em',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                whiteSpace: 'nowrap',
                paddingLeft: '0.1rem',  /* Space from the left edge */
              }}>Personality:</div>
              <div
                className="toggleContainer3"
                onClick={(e) => setPersonalityToggle(!personalityToggle)}
                style={{
                  width: '100% !important',
                  border: '1px solid #d9d9d9',
                  borderradius: '35px',
                  marginleft: '10px',
                  marginright: '2px !important',
                }}
              >
                <div
                  className="toggle3"
                  style={{
                    width: '1.2rem',    /* Adjusted size */
                    height: '1.2rem',   /* Adjusted size */
                    background: 'linear-gradient(90deg, #47b4d5 0.02%, #29449d 119.26%)',
                    borderRadius: '100%',
                    cursor: 'pointer',
                    transform: !personalityToggle
                      ? "translateX(0px)"
                      : "translateX(20px)",
                  }}
                >
                  &nbsp;
                </div>
              </div>
              <div className="field-value" style={{
                fontSize: '1em',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end', /* Align to the right */
                whiteSpace: 'nowrap',
                paddingRight: '0.1rem',   /* Space from the right edge */
              }}>
                {console.log("Personality Data:", userProfile?.personality)}
                {userProfile?.personality ?? "--"}
              </div>
            </div>

            <div className="each-coo-field" style={{
              width: '100%',
              borderRadius: '60px',
              backgroundColor: 'white',
              display: 'grid',
              gridTemplateColumns: 'auto 1fr auto', /* Adjusted for the new layout */
              alignItems: 'center',
              padding: '0.5rem 1rem',
              fontWeight: '300',
              fontSize: '0.9rem',
              gap: '0.5rem',
              border: '2px solid #ccc',
              marginBottom: '2rem',
            }}>
              <div className="field-name" style={{
                fontSize: '1em',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                whiteSpace: 'nowrap',
                paddingLeft: '0.1rem',  /* Space from the left edge */
              }}>School</div>
              <div
                className="toggleContainer"
                onClick={(e) => setSchoolToggle(!schoolToggle)}
                style={{
                  width: '100% !important',
                  border: '1px solid #d9d9d9',
                  borderradius: '35px',
                  marginleft: '10px',
                  marginright: '2px !important',
                }}
              >
                <div
                  className="toggle"
                  style={{
                    width: '1.2rem',    /* Adjusted size */
                    height: '1.2rem',   /* Adjusted size */
                    background: 'linear-gradient(90deg, #47b4d5 0.02%, #29449d 119.26%)',
                    borderRadius: '100%',
                    cursor: 'pointer',
                    transform: !schoolToggle
                      ? "translateX(0px)"
                      : "translateX(20px)",
                  }}
                >
                  &nbsp;
                </div>
              </div>

              <div className="field-value" style={{
                fontSize: '1em',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end', /* Align to the right */
                whiteSpace: 'nowrap',
                paddingRight: '0.1rem',   /* Space from the right edge */
              }}>
                {userProfile?.school}
              </div>
            </div>
          </>
        ) : (
          <p>Loading user profile...</p>
        )}
      </div>

      <div className="maps-btns-div1">
        <div
          className="gs-Btn-maps1"
          onClick={() => setRefetchPaths(!refetchPaths)}
          style={{ cursor: "pointer" }}
        >
          Find Paths
        </div>
      </div>
    </div>
  );





  return (
    <div className="mapspage1">
      {showPathDetails ? (
        <JourneyPage />
      ) : (
        <div className="maps-container1">

          <div className="maps-sidebar1">
            <div
              className="top-icons1"
              style={{
                display:
                  pathItemSelected && pathItemStep === 3 ? "none" : "flex",
              }}
            >
              <div
                className="each-icon1"
                onClick={() => {
                  setOption("Education");
                }}
              >
                <div
                  className="border-div1"
                  style={{
                    border:
                      option === "Education"
                        ? "1px solid #100F0D"
                        : "1px solid #e7e7e7",
                  }}
                >
                  <img src={educationIcon} alt="" />
                </div>
                <div
                  className="icon-name-txt1"
                  style={{
                    fontWeight: option === "Education" ? "600" : "",
                  }}
                >
                  Education
                </div>
              </div>
            </div>

            {pathItemSelected && pathItemStep === 1 ? (
              <div className="mid-area1" style={{ borderBottom: "none" }}>
                <div
                  style={{
                    fontWeight: "400",
                    marginTop: "0.5rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  What do you want to do with this path?
                </div>
                <div className="maps-btns-div1">
                  <div
                    className="reset-btn1"
                    style={{ fontWeight: "400", textAlign: "center", paddingleft: "0.5px !important" }}
                    onClick={() => {
                      navigate(`/dashboard/path/${selectedPathItem?._id}`);
                    }}
                  >
                    Explore Path
                  </div>
                  <div
                    className="reset-btn1"
                    style={{ fontWeight: "400", textAlign: "center" }}
                    onClick={() => {
                      setPathItemStep(2);
                    }}
                  >
                    Select Path
                  </div>
                  <div
                    className="reset-btn1"
                    style={{ fontWeight: "400", textAlign: "center" }}
                    onClick={() => {
                      setPathItemSelected(false);
                      setSelectedPathItem([]);
                    }}
                  >
                    Go Back
                  </div>
                </div>
              </div>
            ) : pathItemSelected && pathItemStep === 2 ? (
              <div className="mid-area1" style={{ borderBottom: "none" }}>
                <div
                  style={{
                    fontWeight: "400",
                    marginTop: "0.5rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  Are you sure you want to select this path?
                </div>
                <div className="maps-btns-div1">
                  <div
                    className="reset-btn1"
                    style={{
                      fontWeight: "400",
                      textAlign: "left",
                      opacity: loading ? "0.25" : "1",
                    }}
                    onClick={() => {
                      pathSelection();
                    }}
                  >
                    {loading ? "Loading..." : "Yes, Confirm"}
                  </div>
                  <div
                    className="reset-btn1"
                    style={{ fontWeight: "400", textAlign: "left" }}
                    onClick={() => {
                      setPathItemStep(1);
                    }}
                  >
                    Go Back
                  </div>
                </div>
              </div>
            ) : pathItemSelected && pathItemStep === 3 ? (
              <div className="congrats-area">
                <div className="congrats-textt">Congratulations</div>
                <div className="congrats-textt1">
                  You have successfully chosen {selectedPathItem?.nameOfPath}.
                  You will be redirected to your journey page now.
                </div>
              </div>
            ) : (
              <>
                <div className="maps-btns-div1" style={{ marginTop: "1rem" }}>
                  <button
                    className="gs-Btn-maps1"
                    onClick={() => setIsFilterOpen(true)}
                    type="button"
                  >
                    Filter Paths
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="maps-content-area1">
            <Pathview />
          </div>
        </div>
      )}
      {/* Side window overlay */}
      {isFilterOpen && (
        <>
          <div
            className="sidebar-overlay"
            onClick={() => setIsFilterOpen(false)}
          ></div>
          <div className="side-window" role="dialog" aria-modal="true">
            <button
              className="close-button"
              onClick={() => setIsFilterOpen(false)}
              aria-label="Close Filter Paths"
            >
              &times;
            </button>
            {/* Show the full mid-area1 content inside side window */}
            <MidAreaContent onClose={() => setIsFilterOpen(false)} />
          </div>
        </>
      )}
    </div>
  );
};

export default PathComponent;
