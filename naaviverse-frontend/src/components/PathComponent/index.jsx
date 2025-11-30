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
  const [pathMap, setPathMap] = useState(/** @type google.maps.Map */ (null));
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

  let userDetails = JSON.parse(localStorage.getItem("user") || "{}");


//   const autoGenerateUniversity = async (uni) => {
//   try {
//     if (
//       uni.generatedProgram &&
//       uni.generatedProgram.program &&
//       uni.generatedProgram.description &&
//       uni.generatedProgram.steps?.length > 0
//     ) {
//       return uni; // already generated
//     }

//     const { data } = await axios.post("/api/perplexity/generate", {
//       id: uni._id,
//       name: uni.name,
//     });

//     console.log("Generated using AI:", data.generatedProgram);

//     return {
//       ...uni,
//       generatedProgram: data.generatedProgram,
//     };
//   } catch (err) {
//     console.error("AI generation failed", err);
//     return uni; // fallback
//   }
// };


  // --------------------------------------------------------------
  // ✅ MOVED HERE: pathSelection FIX (to solve "not defined" error)
  // --------------------------------------------------------------
const pathSelection = () => {
  const email = userDetails?.email;

  // 🎯 FIX: USE _id (REAL UNIVERSITY ID)
  const universityId =
    selectedPathItem?._id ||
    localStorage.getItem("selectedUniversityId");

  console.log("🔍 selectedPathItem:", selectedPathItem);
  console.log("🔍 Correct University ID:", universityId);

  if (!email || !universityId) {
    console.log("❌ Missing values:", { email, universityId });
    return alert("Missing universityId/email!");
  }

  axios.post("http://localhost:4545/api/fetch/selectpath", {
    email,
    universityId,
  })
  .then(res => {
    // SAVE CORRECT ID
    localStorage.setItem("selectedUniversityId", universityId);
    reload();
  })
  .catch(err => console.error(err));
};



  // --------------------------------------------------------------

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

  // -------- rest of your component EXACTLY as before --------
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

  const handleResetContainer = () => {
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
    if (placeId !== null) {
      try {
        const response = await fetch(
          `https://careers.marketsverse.com/api/places?place_id=${placeId}`
        );
        const data = await response.json();
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

  // Do NOT reset these here
  // setSelectedPathItem(null);
  // setPathItemSelected(false);

  setPathItemStep(3); // <-- show Congratulations
  navigate("/dashboard/users");
}





  const fetchUserProfile = async () => {
    try {
      const email = userDetails?.email;
      const response = await fetch(`/api/users/get/${email}`);
      const result = await response.json();

      if (result.status) {
        localStorage.setItem("userProfile", JSON.stringify(result.data));
        setUserProfile(result.data);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  // 🔍 Fetch recommended programs/paths
  useEffect(() => {
    if (!userProfile) return;

const fetchPrograms = async () => {
  try {
    setLoading(true);

    const params = {};

    if (!gradeToggle && userProfile.grade) params.grade = userProfile.grade;
    if (!curriculumToggle && userProfile.curriculum)
      params.curriculum = userProfile.curriculum;
    if (!streamToggle && userProfile.stream)
      params.stream = userProfile.stream;
    if (!performanceToggle && userProfile.performance)
      params.performance = userProfile.performance;
    if (!financialToggle && userProfile.financialSituation)
      params.financialSituation = userProfile.financialSituation;
    if (!personalityToggle && userProfile.personality)
      params.personality = userProfile.personality;

    const { data } = await axios.get("/api/universities", { params });


setLevelThreeData(data.data);






  } catch (error) {
    console.error("Error fetching programs:", error);
    setLevelThreeData([]);
  } finally {
    setLoading(false);
  }
};


    fetchPrograms();
  }, [
    refetchPaths,
    userProfile,
    gradeToggle,
    curriculumToggle,
    streamToggle,
    performanceToggle,
    financialToggle,
    personalityToggle,
  ]);

  // -----------------------------------------------
// 🔍 AUTO-TRIGGER AI ONLY WHEN USER SEARCHES
// -----------------------------------------------
useEffect(() => {
  if (!searchTerm || searchTerm.trim().length < 3) return;

  const fetchUniversity = async () => {
    try {
      setLoading(true);
      console.log("🔍 Searching for university:", searchTerm);

     const res = await axios.get(
  `http://localhost:4545/api/universities/find-or-create?name=${searchTerm}`
);


      if (res.data?.status) {
        console.log("🎯 University Found/Created:", res.data.data);
        setLevelThreeData([res.data.data]); // show ONLY the searched university
      }
    } catch (error) {
      console.error("❌ University search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchUniversity();
}, [searchTerm]);


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
                    style={{ fontWeight: "400", textAlign: "left" }}
                    onClick={() => {
                      navigate(`/dashboard/path/${selectedPathItem?._id}`);
                    }}
                  >
                    Explore Path
                  </div>
                  <div
                    className="reset-btn1"
                    style={{ fontWeight: "400", textAlign: "left" }}
                    onClick={() => {
                      setPathItemStep(2);
                    }}
                  >
                    Select Path
                  </div>
                  <div
                    className="reset-btn1"
                    style={{ fontWeight: "400", textAlign: "left" }}
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
                 You have successfully chosen {selectedPathItem?.name}.
                  You will be redirected to your journey page now.
                </div>
              </div>
            ) : (
              <div className="mid-area1">
                <div className="current-coord-container">
                  <div className="current-text">Current Coordinates</div>

                  {userProfile ? (
                    <>
                      <div className="each-coo-field">
                        <div className="field-name">
                          Grade: {userProfile.grade}
                        </div>
                        <div
                          className="toggleContainer"
                          onClick={(e) => setGradeToggle(!gradeToggle)}
                        >
                          <div
                            className="toggle"
                            style={{
                              transform: !gradeToggle
                                ? "translateX(0px)"
                                : "translateX(20px)",
                            }}
                          >
                            &nbsp;
                          </div>
                        </div>
                        <div className="field-value">{userProfile?.grade}</div>
                      </div>

                      <div className="each-coo-field">
                        <div className="field-name">
                          Curriculum: {userProfile.curriculum}
                        </div>
                        <div
                          className="toggleContainer"
                          onClick={(e) => setCurriculumToggle(!curriculumToggle)}
                        >
                          <div
                            className="toggle"
                            style={{
                              transform: !curriculumToggle
                                ? "translateX(0px)"
                                : "translateX(20px)",
                            }}
                          >
                            &nbsp;
                          </div>
                        </div>
                        <div className="field-value">
                          {userProfile?.curriculum}
                        </div>
                      </div>

                      <div className="each-coo-field">
                        <div className="field-name">Stream</div>
                        <div
                          className="toggleContainer"
                          onClick={(e) => setStreamToggle(!streamToggle)}
                        >
                          <div
                            className="toggle"
                            style={{
                              transform: !streamToggle
                                ? "translateX(0px)"
                                : "translateX(20px)",
                            }}
                          >
                            &nbsp;
                          </div>
                        </div>
                        <div className="field-value">{userProfile?.stream}</div>
                      </div>

                      <div className="each-coo-field">
                        <div className="field-name">Performance</div>
                        <div
                          className="toggleContainer"
                          onClick={(e) =>
                            setPerformanceToggle(!performanceToggle)
                          }
                        >
                          <div
                            className="toggle"
                            style={{
                              transform: !performanceToggle
                                ? "translateX(0px)"
                                : "translateX(20px)",
                            }}
                          >
                            &nbsp;
                          </div>
                        </div>
                        <div className="field-value">
                          {userProfile?.performance}
                        </div>
                      </div>

                      <div className="each-coo-field">
                        <div className="field-name">Financial</div>
                        <div
                          className="toggleContainer"
                          onClick={(e) => setFinancialToggle(!financialToggle)}
                        >
                          <div
                            className="toggle"
                            style={{
                              transform: !financialToggle
                                ? "translateX(0px)"
                                : "translateX(20px)",
                            }}
                          >
                            &nbsp;
                          </div>
                        </div>
                        <div className="field-value">
                          {userProfile?.financialSituation}
                        </div>
                      </div>

                      <div className="each-coo-field">
                        <div className="field-name">
                          Personality: {userProfile?.personality}
                        </div>
                        <div
                          className="toggleContainer"
                          onClick={(e) =>
                            setPersonalityToggle(!personalityToggle)
                          }
                        >
                          <div
                            className="toggle"
                            style={{
                              transform: !personalityToggle
                                ? "translateX(0px)"
                                : "translateX(20px)",
                            }}
                          >
                            &nbsp;
                          </div>
                        </div>
                        <div className="field-value">
                          {userProfile?.personality ?? "--"}
                        </div>
                      </div>

                      <div className="each-coo-field">
                        <div className="field-name">School</div>
                        <div
                          className="toggleContainer"
                          style={{ border: "0px" }}
                        ></div>
                        <div
                          className="field-value"
                          style={{ borderLeft: "0px" }}
                        >
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
                    onClick={(e) => setRefetchPaths(!refetchPaths)}
                  >
                    Find Paths
                  </div>
                </div>
              </div>
            )}
          </div>

   <div className="maps-content-area1">
  <Pathview
    paths={levelThreeData}
    loading={loading}
    onConfirmPath={(uni) => {
      setSelectedPathItem(uni);
      setPathItemSelected(true);
      setPathItemStep(1);
    }}
  />
</div>

        </div>
      )}
    </div>
  );
};

export default PathComponent;