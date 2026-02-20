import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./mapspage.scss";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useCoinContextData } from "../../context/CoinContext";
import Pathview from "./PathView";
import MapComponent from "./MapComponent";
import axios from "axios";
import Skeleton from "react-loading-skeleton";
import GoogleMapComponent from "./GoogleMapComponent";
import GoogleMaps from "./GoogleMaps";
import useWindowDimensions from "../../utils/WindowSize";
import { useStore } from "../../components/store/store.ts";
import MobMenu from "../../components/mobMenu/mobMenu";
import Navbar from "../../components/Navbar/index.jsx";


//images
import logo from "../../static/images/logo.svg";
import careerIcon from "../../static/images/mapspage/careerIcon.svg";
import educationIcon from "../../static/images/mapspage/educationIcon.svg";
import immigrationIcon from "../../static/images/mapspage/immigrationIcon.svg";
import plus from "../../static/images/mapspage/plus.svg";
import close from "../../static/images/mapspage/close.svg";
import hamIcon from "../../static/images/icons/hamIcon.svg";
import arrow from "./darrow.svg";
const BASE_URL = process.env.REACT_APP_API_BASE_URL;
const libraries = ["places"];

const MapsPage = () => {
  const navigate = useNavigate();
  const { width } = useWindowDimensions();
  const { mobMenuOpen } = useStore();
  const { pathname } = useLocation();
  const {
    preLoginMenu,
    setPreLoginMenu,
    schoolSearch,
    setSchoolSearch,
    programSearch,
    setProgramSearch,
    showDdown,
    setShowDdown,
    preLoginPathViewData,
    setPreLoginPathViewData,
    showPreLoginModal,
    setShowPreLoginModal,
  } = useCoinContextData();
  const [option, setOption] = useState("Education");
  const [containers, setContainers] = useState([
    { id: 1, inputValue1: "", inputValue2: "", removable: false },
  ]);
  const [map, setMap] = useState(/** @type google.maps.Map */ (null));
  const [currentLocation, setCurrentLocation] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const autocompleteRef = useRef(null);
  const [resetLoaction, setResetLocation] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [placesId, setPlacesId] = useState(null);
  const [placeInfo, setPlaceInfo] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [directions, setDirections] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showDirections, setShowDirections] = useState(true);
  const [pathOption, setPathOption] = useState("Path View");
  const [switchToStep, setSwitchToStep] = useState(false);
  const [switchStepsDetails, setSwitchStepsDetails] = useState([]);
  const [grade, setGrade] = useState([]);
  const [gradeAvg, setGradeAvg] = useState([]);
  const [curriculum, setCurriculum] = useState([]);
  const [stream, setStream] = useState([]);
  const [finance, setFinance] = useState([]);
  const streamList = ["MPC", "BIPC", "CEC", "MEC", "HEC"];
  const curriculumList = ["IB", "IGCSE", "CBSE", "ICSE", "Nordic"];
  const gradeList = ["9", "10", "11", "12"];
  const gradePointAvg = [
    "0% - 35%",
    "36% - 60%",
    "61% - 75%",
    "76% - 85%",
    "86% - 95%",
    "96% - 100%",
  ];
  const financeList = ["0-25L", "25L-75L", "75L-3CR", "3CR+", "Other"];
  const [loading1, setLoading1] = useState(false);
  const [isloading, setIsloading] = useState(false);
  const [preLoginEmail, setPreloginEmail] = useState();
  const [preLoginPathId, setPreLoginPathId] = useState();
  const [isStoring, setIsStoring] = useState(false);

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
      setSelectedPlace("");
      setSelectedLocation(null);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting current location:", error);
        }
      );
    }
  }, [resetLoaction]);

  const handleResetContainer = () => {
    // const directionsRenderer = new window.google.maps.DirectionsRenderer();
    // directionsRenderer.setMap(map);
    // directionsRenderer.setDirections({ routes: [] }); // Clear directions
    // setContainers([
    //   { id: 1, inputValue1: "", inputValue2: "", removable: false },
    // ]);
    // setResetLocation(!resetLoaction);
    // setSelectedPlace(null);
    // setPlacesId(null);
    // setPlaceInfo("");
    // setSelectedDate(null);
    // setShowDatePicker(false);
    // setDirections(null);
    // setSelectedLocation(null);
    // setShowDirections(false);
    window.location.reload();
  };

  const handlePlaceSelect = () => {
    if (autocompleteRef?.current) {
      const place = autocompleteRef?.current?.getPlace();
      if (place?.geometry && place?.geometry?.location) {
        const location = {
          lat: place?.geometry?.location?.lat(),
          lng: place?.geometry?.location?.lng(),
        };
        setSelectedLocation(location);
        setSelectedPlace(place?.formatted_address);
        const placeId = place?.place_id;
        setPlacesId(placeId);
        if (map) {
          map.panTo(location);
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
        setPlaceInfo(data?.result);
        return data.result;
      } catch (error) {
        console.log(error, "error in getting place info");
      }
    }
  };

  useEffect(() => {
    fetchPlaceDetails(placesId);
  }, [placesId]);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setShowDatePicker(false);
  };

  const CustomInput = ({ value, onClick }) => (
    <input
      type="text"
      placeholder="By When?"
      value={value}
      onClick={onClick}
      onFocus={() => setShowDatePicker(true)}
      onBlur={() => setShowDatePicker(false)}
    />
  );

  useEffect(() => {
    setLoading1(true);
    axios
      .get(`${BASE_URL}/api/userpaths/programs`)
      .then((response) => {
        let result = response?.data?.data;
        // console.log(result, "path view result");
        setPreLoginPathViewData(result);
        setLoading1(false);
      })
      .catch((error) => {
        console.log(error, "error in getting pre-login path view result");
        setPreLoginPathViewData([]);
        setLoading1(false);
      });
  }, []);

useEffect(() => {
  if (pathname.includes("/maps")) {
    setPreLoginMenu("Paths");
  }
}, [pathname, setPreLoginMenu]);


  const handleGrade = (item) => {
    if (grade.includes(item)) {
      // If the grade is already selected, remove it
      setGrade(grade.filter((o) => o !== item));
    } else {
      // If the grade is not selected, add it
      setGrade([...grade, item]);
    }
  };

  const handleGradeAvg = (item) => {
    if (gradeAvg.includes(item)) {
      // If the gradeAvg is already selected, remove it
      setGradeAvg(gradeAvg.filter((o) => o !== item));
    } else {
      // If the gradeAvg is not selected, add it
      setGradeAvg([...gradeAvg, item]);
    }
  };

  const handleCurriculum = (item) => {
    if (curriculum.includes(item)) {
      // If the curriculum is already selected, remove it
      setCurriculum(curriculum.filter((o) => o !== item));
    } else {
      // If the curriculum is not selected, add it
      setCurriculum([...curriculum, item]);
    }
  };

  const handleStream = (item) => {
    if (stream.includes(item)) {
      // If the stream is already selected, remove it
      setStream(stream.filter((o) => o !== item));
    } else {
      // If the stream is not selected, add it
      setStream([...stream, item]);
    }
  };

  const handleFinance = (item) => {
    if (finance.includes(item)) {
      // If the finance is already selected, remove it
      setFinance(finance.filter((o) => o !== item));
    } else {
      // If the finance is not selected, add it
      setFinance([...finance, item]);
    }
  };

const handleFilter = async () => {
  try {
    setLoading1(true);

    const params = {};

    if (grade.length > 0) params.grade = grade;
    if (stream.length > 0) params.stream = stream;
    if (curriculum.length > 0) params.curriculum = curriculum;
    if (gradeAvg.length > 0) params.performance = gradeAvg;
    if (finance.length > 0) params.financialSituation = finance;

    const res = await axios.get(`${BASE_URL}/api/paths/active`, { params });

    setPreLoginPathViewData(res.data.data || []);
  } catch (error) {
    console.log("error in getting filtered paths", error);
    setPreLoginPathViewData([]);
  } finally {
    setLoading1(false);
  }
};


  const myTimeout = () => {
    setTimeout(reload, 2000);
  };

  function reload() {
    setPreloginEmail("");
    setPreLoginPathId("");
    setShowPreLoginModal(false);
    setGrade([]);
    setGradeAvg([]);
    setCurriculum([]);
    setStream([]);
    setFinance([]);
    setShowDdown("");
  }

  const storePreLoginData = () => {
    setIsStoring(true);
    let obj = {
      email: preLoginEmail,
      pathId: preLoginPathId,
    };

    if (grade.length > 0) {
      obj.grade = grade;
    }

    if (stream.length > 0) {
      obj.stream = stream;
    }

    if (curriculum.length > 0) {
      obj.curriculum = curriculum;
    }

    if (finance.length > 0) {
      obj.financialPosition = finance;
    }

    if (gradeAvg.length > 0) {
      obj.gradePointAvg = gradeAvg;
    }

    axios
      .post(`https://careers.marketsverse.com/pre_login/store`, obj)
      .then((response) => {
        let result = response?.data;
        // console.log(result, "storePreLoginData result");
        if (result?.status) {
          setIsStoring(false);
          navigate("/register");
          myTimeout();
        }
      })
      .catch((error) => {
        console.log(error, "error in storePreLoginData");
      });
  };

  return (
    <div className="mapspage">
      <Navbar />
      {width > 768 ? (
        <div className="maps-container">
          <div className="maps-sidebar">
            <div className="top-icons">
              {/* <div
                className="each-icon"
                // onClick={() => {
                //   setOption("Career");
                // }}
                style={{
                  opacity: 0.5,
                  cursor: "not-allowed",
                }}
              >
                <div
                  className="border-div"
                  style={{
                    border:
                      option === "Career"
                        ? "1px solid #100F0D"
                        : "1px solid #e7e7e7",
                  }}
                >
                  <img src={careerIcon} alt="" />
                </div>
                <div
                  className="icon-name-txt"
                  style={{
                    fontWeight: option === "Career" ? "600" : "",
                  }}
                >
                  Career
                </div>
              </div> */}
              <div
                className="each-icon"
                onClick={() => {
                  setOption("Education");
                }}
              >
                <div
                  className="border-div"
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
                  className="icon-name-txt"
                  style={{
                    fontWeight: option === "Education" ? "600" : "",
                  }}
                >
                  Education
                </div>
              </div>
              {/* <div
                className="each-icon"
                // onClick={() => {
                //   setOption("Immigration");
                // }}
                style={{
                  opacity: 0.5,
                  cursor: "not-allowed",
                }}
              >
                <div
                  className="border-div"
                  style={{
                    border:
                      option === "Immigration"
                        ? "1px solid #100F0D"
                        : "1px solid #e7e7e7",
                  }}
                >
                  <img src={immigrationIcon} alt="" />
                </div>
                <div
                  className="icon-name-txt"
                  style={{
                    fontWeight: option === "Immigration" ? "600" : "",
                  }}
                >
                  Immigration
                </div>
              </div> */}
            </div>
            <div className="mid-area">
              <div className="s-destination-div">
                <div>Search Destination</div>
                <div className="input-div1">
                <input
  type="text"
  placeholder="What school?"
  onChange={(e) => {
    setSchoolSearch(e.target.value);
  }}
  value={schoolSearch}
/>
                </div>
                <div className="input-div1">
<input
  type="text"
  placeholder="What program?"
  onChange={(e) => {
    setProgramSearch(e.target.value);
  }}
  value={programSearch}
/>
                </div>
              </div>
              <div className="each-filter-div">
                <div
                  className="visible-div"
                  onClick={() => {
                    if (showDdown === "Grade") {
                      setShowDdown("");
                    } else {
                      setShowDdown("Grade");
                    }
                  }}
                >
                  <div>You’re Current Grade</div>
                  <div>
                    <img
                      src={arrow}
                      alt=""
                      style={{
                        transform:
                          showDdown === "Grade" ? "rotate(180deg)" : "",
                      }}
                    />
                  </div>
                </div>
                <div
                  className="hidden-div"
                  style={{
                    display: showDdown === "Grade" ? "flex" : "none",
                  }}
                >
                  <div
                    className="optioncardWrapper"
                    style={{ width: "100%", flexWrap: "wrap", gap: "1rem" }}
                  >
                    {gradeList.map((item) => (
                      <div
                        className={
                          grade.includes(item)
                            ? "optionCardSmallSelected"
                            : "optionCardSmall"
                        }
                        onClick={(e) => handleGrade(item)}
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="each-filter-div">
                <div
                  className="visible-div"
                  onClick={() => {
                    if (showDdown === "Grade Point") {
                      setShowDdown("");
                    } else {
                      setShowDdown("Grade Point");
                    }
                  }}
                >
                  <div>You’re Current Grade Point Avg</div>
                  <div>
                    <img
                      src={arrow}
                      alt=""
                      style={{
                        transform:
                          showDdown === "Grade Point" ? "rotate(180deg)" : "",
                      }}
                    />
                  </div>
                </div>
                <div
                  className="hidden-div1"
                  style={{
                    display: showDdown === "Grade Point" ? "flex" : "none",
                  }}
                >
                  <div className="optionCardFullWrapper">
                    {gradePointAvg.map((item) => (
                      <div
                        className={
                          gradeAvg.includes(item)
                            ? "optionCardFullSelected"
                            : "optionCardFull"
                        }
                        onClick={(e) => handleGradeAvg(item)}
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="each-filter-div">
                <div
                  className="visible-div"
                  onClick={() => {
                    if (showDdown === "Stream") {
                      setShowDdown("");
                    } else {
                      setShowDdown("Stream");
                    }
                  }}
                >
                  <div>You’re Current Stream</div>
                  <div>
                    <img
                      src={arrow}
                      alt=""
                      style={{
                        transform:
                          showDdown === "Stream" ? "rotate(180deg)" : "",
                      }}
                    />
                  </div>
                </div>
                <div
                  className="hidden-div1"
                  style={{
                    display: showDdown === "Stream" ? "flex" : "none",
                  }}
                >
                  <div className="optionCardFullWrapper">
                    {streamList.map((item) => (
                      <div
                        className={
                          stream.includes(item)
                            ? "optionCardFullSelected"
                            : "optionCardFull"
                        }
                        onClick={(e) => handleStream(item)}
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="each-filter-div">
                <div
                  className="visible-div"
                  onClick={() => {
                    if (showDdown === "Curriculum") {
                      setShowDdown("");
                    } else {
                      setShowDdown("Curriculum");
                    }
                  }}
                >
                  <div>You’re Current Curriculum</div>
                  <div>
                    <img
                      src={arrow}
                      alt=""
                      style={{
                        transform:
                          showDdown === "Curriculum" ? "rotate(180deg)" : "",
                      }}
                    />
                  </div>
                </div>
                <div
                  className="hidden-div1"
                  style={{
                    display: showDdown === "Curriculum" ? "flex" : "none",
                  }}
                >
                  <div className="optionCardFullWrapper">
                    {curriculumList.map((item) => (
                      <div
                        className={
                          curriculum.includes(item)
                            ? "optionCardFullSelected"
                            : "optionCardFull"
                        }
                        onClick={(e) => handleCurriculum(item)}
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="each-filter-div">
                <div
                  className="visible-div"
                  onClick={() => {
                    if (showDdown === "Financial") {
                      setShowDdown("");
                    } else {
                      setShowDdown("Financial");
                    }
                  }}
                >
                  <div>You’re Current Financial Position</div>
                  <div>
                    <img
                      src={arrow}
                      alt=""
                      style={{
                        transform:
                          showDdown === "Financial" ? "rotate(180deg)" : "",
                      }}
                    />
                  </div>
                </div>
                <div
                  className="hidden-div1"
                  style={{
                    display: showDdown === "Financial" ? "flex" : "none",
                  }}
                >
                  <div className="optionCardFullWrapper">
                    {financeList.map((item) => (
                      <div
                        className={
                          finance.includes(item)
                            ? "optionCardFullSelected"
                            : "optionCardFull"
                        }
                        onClick={(e) => handleFinance(item)}
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="maps-btns-div">
                <div
                  className="gs-Btn-maps"
                  onClick={() => {
                    handleFilter();
                  }}
                >
                  Find Paths
                </div>
              </div>
            </div>
          </div>
          <div className="maps-content-area">
            {switchToStep ? (
              <div className="pathviewPage1-step-details">
                <div className="pathviewPage1-journey-top-area">
                  <div>Your Selected Path:</div>
                  {isloading ? (
                    <Skeleton width={150} height={30} />
                  ) : (
                    <div className="pathviewPage1-bold-text">
                      {switchStepsDetails?.length > 0
                        ? switchStepsDetails?.destination_institution
                        : ""}
                    </div>
                  )}
                  {isloading ? (
                    <Skeleton width={500} height={20} />
                  ) : (
                    <div className="pathviewPage1-journey-des">
                      {switchStepsDetails?.length > 0
                        ? switchStepsDetails?.description
                        : ""}
                    </div>
                  )}
                  <div
                    className="pathviewPage1-goBack-div"
                    onClick={() => {
                      // setSwitchToStep(false);
                      // setSwitchStepsDetails([]);
                      // setSelectedLocation(null);
                      window.location.reload();
                    }}
                  >
                    Go Back
                  </div>
                </div>
                <div className="pathviewPage1-journey-steps-area">
                  {isloading
                    ? Array(6)
                        .fill("")
                        .map((e, i) => {
                          return (
                            <div
                              className="pathviewPage1-each-j-step pathviewPage1-relative-div"
                              key={i}
                            >
                              <div className="pathviewPage1-each-j-img">
                                <Skeleton width={75} height={75} />
                              </div>
                              <div className="pathviewPage1-each-j-step-text">
                                <Skeleton width={200} height={30} />
                              </div>
                              <div className="pathviewPage1-each-j-step-text1">
                                <Skeleton width={250} height={25} />
                              </div>
                              <div className="pathviewPage1-each-j-amount-div">
                                <div className="pathviewPage1-each-j-amount">
                                  <Skeleton width={100} height={30} />
                                </div>
                              </div>
                            </div>
                          );
                        })
                    : switchStepsDetails?.length > 0
                    ? switchStepsDetails?.StepDetails?.map((e, i) => {
                        return (
                          <div
                            className="pathviewPage1-each-j-step pathviewPage1-relative-div"
                            key={i}
                            onClick={() => {
                              setShowPreLoginModal(true);
                            }}
                          >
                            <div className="pathviewPage1-each-j-img">
                              <img src={e?.icon} alt="" />
                            </div>
                            <div className="pathviewPage1-each-j-step-text">
                              {e?.name}
                            </div>
                            <div className="pathviewPage1-each-j-step-text1">
                              {e?.description}
                            </div>
                            <div className="pathviewPage1-each-j-amount-div">
                              <div className="pathviewPage1-each-j-amount">
                                {e?.cost}
                              </div>
                              {/* <div
                                className="each-j-amount"
                                style={{ textDecorationLine: "underline" }}
                              >
                                Current
                              </div> */}
                            </div>
                            {/* <div className="j-arr-div">
                              <img src={arrow} alt="" />
                            </div> */}
                          </div>
                        );
                      })
                    : ""}
                </div>
              </div>
            ) : (
              <div className="maps-page-seperator">
                <Pathview
                  switchToStep={switchToStep}
                  setSwitchToStep={setSwitchToStep}
                  switchStepsDetails={switchStepsDetails}
                  setSwitchStepsDetails={setSwitchStepsDetails}
                  loading1={loading1}
                  setLoading1={setLoading1}
                  setSelectedLocation={setSelectedLocation}
                  setPreLoginPathId={setPreLoginPathId}
                />
                {/* <MapComponent /> */}
                <GoogleMaps
                  map={map}
                  setMap={setMap}
                  searchTerm={searchTerm}
                  currentLocation={currentLocation}
                  setCurrentLocation={setCurrentLocation}
                  placeInfo={placeInfo}
                  selectedPlace={selectedPlace}
                  directions={directions}
                  setDirections={setDirections}
                  selectedLocation={selectedLocation}
                  showDirections={showDirections}
                />
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          {!mobMenuOpen ? (
            <div className="maps-container-mob">
              <div>Coming Soon</div>
            </div>
          ) : (
            <MobMenu />
          )}
        </>
      )}

      {showPreLoginModal && (
        <div
          className="maps-overlay"
          onClick={() => {
            setShowPreLoginModal(false);
            setPreloginEmail("");
          }}
        >
          <div
            className="modal-container"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <div>
              <img src={logo} alt="" />
            </div>
            <div className="save-div">
              <div>Save you’re current path results and coordinates</div>
              <div className="save-input-div">
                <input
                  type="text"
                  placeholder="Enter you’re email"
                  onChange={(e) => {
                    setPreloginEmail(e.target.value);
                  }}
                  value={preLoginEmail}
                />
              </div>
            </div>
            <div
              style={{
                opacity: isStoring ? "0.25" : preLoginEmail ? "1" : "0.25",
                cursor: isStoring
                  ? "not-allowed"
                  : preLoginEmail
                  ? "pointer"
                  : "not-allowed",
              }}
              className="cont-Btn"
              onClick={() => {
                if (preLoginEmail) {
                  storePreLoginData();
                }
              }}
            >
              {isStoring ? "Loading.." : "Continue To Registration"}
            </div>
            <div className="already-Btn">
              <p
                onClick={() => {
                  navigate("/login");
                  setShowPreLoginModal(false);
                  setPreloginEmail("");
                }}
              >
                Already have an account?
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapsPage;
