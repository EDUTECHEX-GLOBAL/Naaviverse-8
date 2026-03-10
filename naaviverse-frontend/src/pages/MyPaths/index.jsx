import React, { useState, useEffect } from "react";
import { useCoinContextData } from "../../context/CoinContext";
import Skeleton from "react-loading-skeleton";
import "./mypaths.scss";
import axios from "axios";
import { Draggable } from "react-drag-reorder";
import EditPathForm from "../MyPaths/paths.jsx";

// images
import dummy from "./dummy.svg";
import closepop from "../../static/images/dashboard/closepop.svg";
import lg1 from "../../static/images/login/lg1.svg";
import CurrentStep from "../CurrentStep";
import { useStore } from "../../components/store/store.ts";
import { useNavigate } from "react-router-dom";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const MyPaths = ({ search, admin, fetchAllServicesAgain, stpesMenu }) => {
  const navigate = useNavigate();
  const { sideNav, setsideNav } = useStore();
  let userDetails = JSON.parse(localStorage.getItem("partner"));
  const {
    setCurrentStepData,
    setCurrentStepDataLength,
    mypathsMenu,
    setMypathsMenu,
  } = useCoinContextData();

  const [partnerPathData, setPartnerPathData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPathId, setSelectedPathId] = useState("");
  const [pathActionEnabled, setPathActionEnabled] = useState(false);
  const [pathActionStep, setPathActionStep] = useState(1);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedStepId, setSelectedStepId] = useState("");
  const [stepActionEnabled, setStepActionEnabled] = useState(false);
  const [stepActionStep, setStepActionStep] = useState(1);
  const [editPaths, setEditPaths] = useState("default");
  const [metaDataStep, setMetaDataStep] = useState("default");
  const [selectedPath, setSelectedPath] = useState([]);
  const [newValue, setNewValue] = useState("");
  const [viewPathEnabled, setViewPathEnabled] = useState(false);
  const [viewPathLoading, setViewPathLoading] = useState(false);
  const [viewPathData, setViewPathData] = useState([]);
  const [showSelectedPath, setShowSelectedPath] = useState(null);
  const [addServiceStep, setAddServiceStep] = useState(null);
  const [selectedSubStep, setSelectedSubStep] = useState(null);
  const [backupPathData, setBackupPathData] = useState([]);
  const [stepId, setStepId] = useState("");
  const [backupPathId, setBackupPathId] = useState("");
  const [allServices, setAllServices] = useState([]);
  const [productDataArray, setProductDataArray] = useState([]);
  const [productKeys, setProductKeys] = useState(null);
  const [allServicesToAdd, setAllServicesToAdd] = useState([]);
  const [allServicesToRemove, setAllServicesToRemove] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [localSearch, setLocalSearch] = useState(search || "");
  const [expandedDesc, setExpandedDesc] = useState({});
  // ============================================
  // API Calls
  // ============================================
  const toggleDescription = (pathId) => {
    setExpandedDesc(prev => ({
      ...prev,
      [pathId]: !prev[pathId]
    }));
  };
  const getAllPaths = () => {
    setPartnerPathData([]);
    setLoading(true);

    const email = userDetails?.email;
    let endpoint = "";

    // ADMIN
    if (admin && (mypathsMenu === "Pending Approval" || mypathsMenu === "Pending Paths")) {
      endpoint = `/api/paths/get?status=waitingforapproval`;
    }
    // PARTNER Draft
    else if (!admin && mypathsMenu === "Draft") {
      endpoint = `/api/paths/get?email=${email}&status=draft`;
    }
    // PARTNER Pending
    else if (!admin && mypathsMenu === "Pending Approval") {
      endpoint = `/api/paths/get?email=${email}&status=waitingforapproval`;
    }
    // Inactive
    else if (mypathsMenu === "Inactive Paths") {
      endpoint = `/api/paths/get?email=${email}&status=inactive`;
    }
    // Default Active
    else {
      endpoint = `/api/paths/get?email=${email}&status=active`;
    }

    console.log("➡️ FINAL API CALL:", `${BASE_URL}${endpoint}`);

    axios
      .get(`${BASE_URL}${endpoint}`)
      .then((response) => {
        setPartnerPathData(response?.data?.data || []);
      })
      .catch((error) => {
        console.log("❌ Error fetching partnerPathData:", error);
      })
      .finally(() => setLoading(false));
  };

  const getAllServices = () => {
    let email = userDetails?.email;
    axios
      .get(`${BASE_URL}/api/attachservice/getnotaddedservices?step_id=${selectedStepId}&productcreatoremail=${email}`)
      .then(({ data }) => {
        if (data.status) {
          setAllServices(data.data);
        }
      });
  };

  // Load backup paths once
  useEffect(() => {
    const email = userDetails?.email;
    if (!email) return;
    axios.get(`${BASE_URL}/api/paths/get?email=${email}`).then(({ data }) => {
      if (data.status) setBackupPathData(data.data);
    });
  }, []);

  // Load services when step changes
  useEffect(() => {
    if (!selectedStepId) return;
    getAllServices();
  }, [selectedStepId]);

  // Load paths when menu changes
  useEffect(() => {
    let cancelled = false;
    const loadPaths = async () => {
      if (cancelled) return;
      await getAllPaths();
    };
    loadPaths();
    return () => (cancelled = true);
  }, [mypathsMenu]);

  // Load services for add/remove
  useEffect(() => {
    if (selectedStepId) {
      axios.get(`${BASE_URL}/api/attachservice/getnotaddedservices?step_id=${selectedStepId}&productcreatoremail=${userDetails?.user?.email}`)
        .then(({ data }) => {
          if (data.status) setAllServicesToAdd(data?.data[0]);
        });
    }
  }, [selectedStepId]);

  useEffect(() => {
    if (selectedStepId) {
      axios.get(`${BASE_URL}/api/attachservice/get?step_id=${selectedStepId}`)
        .then(({ data }) => {
          if (data.status) setAllServicesToRemove(data?.data[0]);
        });
    }
  }, [selectedStepId]);

  // Reset selected path when menu changes
  useEffect(() => {
    setShowSelectedPath(null);
  }, [mypathsMenu]);

  useEffect(() => {
    if (!stepActionEnabled) {
      setSelectedServices([]);
      setStepActionStep(1);
    }
  }, [stepActionEnabled]);

  useEffect(() => {
    if (!mypathsMenu) {
      setMypathsMenu("Paths");
    }
  }, []);

  // ============================================
  // Action Handlers
  // ============================================

  const myPathsTimeout = () => {
    setTimeout(reload1, 2000);
  };

  function reload1() {
    setPathActionEnabled(false);
    setPathActionStep(1);
    setSelectedPathId("");
    setEditPaths("default");
    setMetaDataStep("default");
    setSelectedPath([]);
    setNewValue("");
  }

  const myStepsTimeout = () => {
    setTimeout(reload2, 2000);
  };

  function reload2() {
    setStepActionEnabled(false);
    setStepActionStep(1);
    setSelectedStepId("");
  }

  const deletePath = (status) => {
    setActionLoading(true);
    axios
      .delete(`${BASE_URL}/api/paths/delete/${selectedPathId}`, {
        data: { status },
      })
      .then((response) => {
        let result = response?.data;
        if (result?.status) {
          setActionLoading(false);
          setPathActionStep(3);
          myPathsTimeout();
        }
      })
      .catch((error) => {
        console.log(error, "error in deletePath");
      });
  };

  const deleteStep = () => {
    setActionLoading(true);
    axios
      .delete(`${BASE_URL}/api/steps/delete/${selectedStepId}`)
      .then((response) => {
        let result = response?.data;
        if (result?.status) {
          setActionLoading(false);
          setStepActionStep(3);
          myStepsTimeout();
        }
      })
      .catch((error) => {
        console.log(error, "error in deleteStep");
      });
  };

  const resetPathAction = () => {
    setPathActionEnabled(false);
    setPathActionStep(1);
    setSelectedPathId("");
    setEditPaths("default");
    setMetaDataStep("default");
    setSelectedPath([]);
    setNewValue("");
    setViewPathData([]);
  };

  const editMetaData = (field) => {
    setActionLoading(true);
    let obj = { [field]: newValue };
    axios
      .put(`${BASE_URL}/api/paths/update/${selectedPathId}`, obj)
      .then((response) => {
        let result = response?.data;
        if (result?.status) {
          setMetaDataStep("success");
          setActionLoading(false);
          myPathsTimeout();
        }
      })
      .catch((error) => {
        console.log(error, "ediMetaData error");
      });
  };

  const viewPathById = (id) => {
    if (!id) {
      console.error("❌ NO ID SENT TO API");
      return;
    }
    setViewPathLoading(true);
    axios
      .get(`${BASE_URL}/api/paths/viewpath/${id}`)
      .then((response) => {
        let result = response?.data?.data;
        setViewPathData(Array.isArray(result) ? result[0] : result);
      })
      .catch((error) => {
        console.log("Error in fetching view path data:", error);
      })
      .finally(() => setViewPathLoading(false));
  };

  const handleApprovePath = () => {
    setActionLoading(true);
    axios
      .put(`${BASE_URL}/api/paths/updatepath/${selectedPathId}`, {
        status: "active",
      })
      .then(({ data }) => {
        if (data.status) {
          getAllPaths();
          setPathActionEnabled(false);
          setActionLoading(false);
          setPathActionStep(1);
        }
      })
      .catch(() => setActionLoading(false));
  };

  const handleRejectPath = () => {
    setActionLoading(true);
    axios
      .put(`${BASE_URL}/api/paths/updatepath/${selectedPathId}`, {
        status: "draft",
      })
      .then(({ data }) => {
        if (data.status) {
          setMypathsMenu("Draft");
          getAllPaths();
          setPathActionEnabled(false);
          setActionLoading(false);
          setPathActionStep(1);
        }
      })
      .catch(() => setActionLoading(false));
  };

  const handleAddService = (newId) => {
    setActionLoading(true);
    axios
      .post(`${BASE_URL}/api/steps/addproducts/${selectedStepId}`, {
        product_ids: [newId],
      })
      .then(({ data }) => {
        if (data.status) {
          getAllPaths();
          getAllServices();
          setPathActionEnabled(false);
          setStepActionEnabled(false);
          setActionLoading(false);
          setPathActionStep(1);
          fetchAllServicesAgain();
        }
      });
  };

  const handleSelectServicesForStep = (item) => {
    const isSelected = selectedServices.includes(item);
    if (isSelected) {
      const updatedServices = selectedServices.filter((service) => service !== item);
      setSelectedServices(updatedServices);
    } else {
      setSelectedServices([...selectedServices, item]);
    }
  };

  const addServicesToStep = () => {
    setActionLoading(true);
    setLoading(true);
    axios
      .post(`${BASE_URL}/api/attachservice/add`, {
        step_id: selectedStepId,
        service_ids: [...selectedServices],
      })
      .then(({ data }) => {
        if (data.status) {
          setStepActionEnabled(false);
        }
        setActionLoading(false);
        setLoading(false);
        setSelectedServices([]);
      });
  };

  const removeServiceFromStep = (id) => {
    axios
      .put(`${BASE_URL}/api/attachservice/remove/${allServicesToRemove?._id}`, {
        service_id: id,
      })
      .then(({ data }) => {
        if (data.status) {
          setStepActionEnabled(false);
          setActionLoading(false);
          setLoading(false);
        }
      });
  };

  const handleEditSubmit = () => {
    setPathActionStep(1);
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // ============================================
  // Render
  // ============================================

  return (
    <div className="mypaths">
      {/* Top Navigation Menu */}

      {/* <div
          className="each-mypath-menu"
          style={{
            fontWeight: mypathsMenu === "Paths" ? "700" : "",
            background: mypathsMenu === "Paths" ? "rgba(241, 241, 241, 0.5)" : "",
          }}
          onClick={() => {
            setMypathsMenu("Paths");
            if (viewPathEnabled) {
              setViewPathEnabled(false);
              setViewPathData([]);
            }
          }}
        >
          {admin ? "Active Paths" : "Paths"}
        </div> */}
      {/* <div
          className="each-mypath-menu"
          style={{
            fontWeight: mypathsMenu === "Draft" ? "700" : "",
            background: mypathsMenu === "Draft" ? "rgba(241, 241, 241, 0.5)" : "",
          }}
          onClick={() => {
            setMypathsMenu("Draft");
            setViewPathEnabled(false);
            setViewPathData([]);
          }}
        >
          Draft
        </div> */}
      {/* <div
          className="each-mypath-menu"
          style={{
            fontWeight: mypathsMenu === "Pending Approval" ? "700" : "",
            background: mypathsMenu === "Pending Approval" ? "rgba(241, 241, 241, 0.5)" : "",
          }}
          onClick={() => {
            setMypathsMenu("Pending Approval");
            if (viewPathEnabled) {
              setViewPathEnabled(false);
              setViewPathData([]);
            }
          }}
        >
          Pending Approval
        </div>
        <div
          className="each-mypath-menu"
          style={{
            fontWeight: mypathsMenu === "Inactive Paths" ? "700" : "",
            background: mypathsMenu === "Inactive Paths" ? "rgba(241, 241, 241, 0.5)" : "",
          }}
          onClick={() => {
            setMypathsMenu("Inactive Paths");
            if (viewPathEnabled) {
              setViewPathEnabled(false);
              setViewPathData([]);
            }
          }}
        >
          Inactive Paths
        </div> */}
      {admin && (
        <div
          className="each-mypath-menu"
          style={{
            fontWeight: mypathsMenu === "Pending Paths" ? "700" : "",
            background: mypathsMenu === "Pending Paths" ? "rgba(241, 241, 241, 0.5)" : "",
          }}
          onClick={() => {
            setMypathsMenu("Pending Paths");
            if (viewPathEnabled) {
              setViewPathEnabled(false);
              setViewPathData([]);
            }
          }}
        >
          Pending Paths
        </div>
      )}


      {/* Main Content */}
      <div className="mypaths-content">
        {/* Show Selected Path Details */}
        {showSelectedPath ? (
          <div>
            <CurrentStep
              productDataArray={productDataArray}
              selectedPathId={selectedPathId}
              showSelectedPath={showSelectedPath}
              selectedPath={selectedPath}
            />
          </div>
        ) : viewPathEnabled ? (
          /* View Path Details */
          <div className="viewpath-container">
            <div className="viewpath-top-area">
              <div>Your Selected Path:</div>
              <div className="viewpath-bold-text">
                {viewPathData?.nameOfPath || viewPathData?.destination_institution || "Untitled Path"}
              </div>
              <div className="viewpath-des">{viewPathData?.description}</div>
              <div className="viewpath-goBack-div" onClick={() => setViewPathEnabled(false)}>
                Go Back
              </div>
            </div>

            <div className="viewpath-steps-area">
              {viewPathData?.StepDetails?.map((e, i) => (
                <div
                  key={i}
                  onClick={() => {
                    setShowSelectedPath(e);
                    setProductKeys(e?.product_ids);
                  }}
                  className="viewpath-each-j-step viewpath-relative-div"
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      background: "#0d6b6e",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: "0.9rem",
                      marginBottom: "0.5rem",
                      flexShrink: 0,
                      zIndex: 2,
                    }}
                  >
                    {i + 1}
                  </div>
                  <div className="viewpath-each-j-step-text">
                    {e?.macro_name || e?.name || "Untitled Step"}
                  </div>
                  <div className="viewpath-each-j-step-text1">
                    {e?.macro_description || e?.description || ""}
                  </div>
                  <div className="viewpath-each-j-amount-div">
                    <div className="viewpath-each-j-amount">
                      {e?.macro_access || e?.cost || "Free"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Main Paths List - CARD LAYOUT */
          <>


            {/* Filter Tabs */}
            <div className="filter-tabs">
              <span
                className={`filter-tab ${mypathsMenu === 'Paths' ? 'active' : ''}`}
                onClick={() => setMypathsMenu('Paths')}
              >
                Active Paths
              </span>
              <span
                className={`filter-tab ${mypathsMenu === 'Draft' ? 'active' : ''}`}
                onClick={() => setMypathsMenu('Draft')}
              >
                Draft
              </span>
              <span
                className={`filter-tab ${mypathsMenu === 'Pending Approval' ? 'active' : ''}`}
                onClick={() => setMypathsMenu('Pending Approval')}
              >
                Pending Approval
              </span>
              <span
                className={`filter-tab ${mypathsMenu === 'Inactive Paths' ? 'active' : ''}`}
                onClick={() => setMypathsMenu('Inactive Paths')}
              >
                Inactive
              </span>
            </div>

            {/* Loading Skeletons */}
            {loading ? (
              <div className="paths-grid">
                {Array(3)
                  .fill("")
                  .map((_, i) => (
                    <div className="path-card" key={i}>
                      <div className="path-header">
                        <div className="path-title">
                          <Skeleton width={200} height={30} />
                        </div>
                        <Skeleton width={100} height={25} />
                      </div>
                      <Skeleton count={3} />
                      <div className="path-stats">
                        <Skeleton width={80} height={30} />
                        <Skeleton width={120} height={30} />
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              /* Paths Grid - Cards */
              <div className="paths-grid">
                {partnerPathData
                  ?.filter((e) =>
                    !localSearch ||
                    e?.nameOfPath?.toLowerCase().includes(localSearch.toLowerCase()) ||
                    e?.description?.toLowerCase().includes(localSearch.toLowerCase()) ||
                    e?.destination_institution?.toLowerCase().includes(localSearch.toLowerCase())
                  )
                  ?.map((e, i) => {
                    // Determine status class and text

                    const lastUpdated = formatDate(e?.updatedAt);

                    return (
                      <div
                        className="path-card"
                        key={i}
                        onClick={() => {
                          setSelectedPathId(e?._id);
                          setSelectedPath(e);
                          localStorage.setItem("selectedPathId", e?._id);

                          if (e?.status === "draft") {
                            navigate(`/dashboard/accountants/path/${e._id}`);
                          } else {
                            setPathActionEnabled(true);
                          }
                        }}
                      >
                        {/* Card Header */}
                        <div className="path-header">
                          <div className="path-title">
                            <h3>{e?.nameOfPath || "Untitled Path"}</h3>
                          </div>
                          <div className="path-meta">
                            {/* Show date for non-draft paths, show arrow for draft paths */}
                            {e?.status === "draft" ? (
                              <button
                                className="draft-arrow-btn"
                                onClick={(event) => {
                                  event.stopPropagation(); // Prevent card click
                                  navigate(`/dashboard/accountants/path/${e._id}`);
                                }}
                                title="Go to Draft Page"
                              >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </button>
                            ) : (
                              <span className="path-date">📅 {lastUpdated}</span>
                            )}
                          </div>
                        </div>


                        {/* Description with Read More - FIXED VERSION */}
                        <div className="path-description">
                          {(() => {
                            const description = e?.description || "No description provided.";
                            const isExpanded = expandedDesc[e?._id];
                            const maxLength = 120; // Show first 120 characters

                            if (description.length > maxLength) {
                              return (
                                <span>
                                  {isExpanded
                                    ? description
                                    : description.substring(0, maxLength) + "... "}
                                  <span
                                    className="read-more-btn"
                                    onClick={(event) => {
                                      event.stopPropagation(); // Prevent card click
                                      toggleDescription(e?._id);
                                    }}
                                  >
                                    {isExpanded ? "Read less" : "Read more"}
                                  </span>
                                </span>
                              );
                            }
                            return <span>{description}</span>;
                          })()}
                        </div>

                        {/* Stats Row - Match the image style */}
                        <div className="path-stats-row">
                          <div className="stats-group">
                            <span className="stat-item">
                              <strong>{e?.the_ids?.length || 0}</strong> steps
                            </span>
                            <span className="stat-item">
                              <span className="stat-icon">📅</span>
                              Updated {lastUpdated}
                            </span>
                          </div>

                          <button
                            className="view-steps-btn"
                            onClick={(evt) => {
                              evt.stopPropagation();
                              setViewPathEnabled(true);
                              setPathActionEnabled(false);
                              viewPathById(e?._id);    // ← now e is the map param (the path object)
                            }}
                          >
                            View Steps
                          </button>
                        </div>

                        {/* Action Buttons */}
                        <div className="path-footer" onClick={(e) => e.stopPropagation()}>
                          {/* <button
                            className="btn-outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              setViewPathEnabled(true);
                              setPathActionEnabled(false);
                              viewPathById(e?._id);
                            }}
                          >
                            View Steps
                          </button> */}
                          {/* <button
                            className="btn-outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPathId(e?._id);
                              setSelectedPath(e);
                              setPathActionStep(4);
                            }}
                          >
                            Edit Path
                          </button> */}
                          {e?.status === "waitingforapproval" && admin && (
                            <button
                              className="btn-primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPathId(e?._id);
                                setPathActionStep(5);
                              }}
                            >
                              Approve
                            </button>
                          )}
                          {/* {e?.status !== "draft" && e?.status !== "waitingforapproval" && (
                            // <button
                            //   className="btn-primary"
                            //   onClick={(e) => {
                            //     e.stopPropagation();
                            //     setSelectedPathId(e?._id);
                            //     setPathActionStep(2);
                            //   }}
                            // >
                            //   Delete
                            // </button>
                          )} */}
                        </div>
                      </div>
                    );
                  })}

                {/* Show message if no paths */}
                {partnerPathData?.filter((e) =>
                  !localSearch ||
                  e?.nameOfPath?.toLowerCase().includes(localSearch.toLowerCase()) ||
                  e?.description?.toLowerCase().includes(localSearch.toLowerCase()) ||
                  e?.destination_institution?.toLowerCase().includes(localSearch.toLowerCase())
                ).length === 0 && !loading && (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#5e6f7e' }}>
                      No paths found. Click "Create New Path" to get started.
                    </div>
                  )}
              </div>
            )}

          </>
        )}

        {/* ============================================
            Step Action Popup (Keep Existing)
        ============================================ */}
        {stepActionEnabled && (
          <div className="acc-popular1">
            <div className="acc-popular-top" style={{ display: stepActionStep === 3 ? "none" : "" }}>
              <div className="acc-popular-head">My Step Actions</div>
              <div
                className="acc-popular-img-box"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  setStepActionEnabled(false);
                  setStepActionStep(1);
                  setSelectedStepId("");
                }}
              >
                <img className="acc-popular-img" src={closepop} alt="" />
              </div>
            </div>

            {stepActionStep === 1 && (
              <div style={{ marginTop: "3rem" }}>
                <div className="acc-step-box" onClick={() => setStepActionStep(4)}>
                  Edit Services
                </div>
                <div className="acc-step-box">Edit Step</div>
                <div className="acc-step-box">Delete step</div>
              </div>
            )}

            {stepActionStep === 2 && (
              <div style={{ marginTop: "3rem" }}>
                <div className="acc-step-box" onClick={deleteStep}>
                  Confirm and delete
                </div>
                <div className="goBack2" onClick={() => setStepActionStep(1)}>
                  Go Back
                </div>
              </div>
            )}

            {stepActionStep === 3 && <div className="success-box1">Step Successfully Deleted</div>}

            {stepActionStep === 4 && (
              <div className="acc-mt-div">
                <div className="acc-sub-text">What do you want to do?</div>
                <div className="acc-scroll-div">
                  <div
                    className="acc-step-box4"
                    style={{
                      flexDirection: "column",
                      alignItems: "flex-start",
                      justifyContent: "center",
                    }}
                    onClick={() => setStepActionStep(5)}
                  >
                    <div>Add a Service</div>
                  </div>
                  <div
                    className="acc-step-box4"
                    style={{
                      flexDirection: "column",
                      alignItems: "flex-start",
                      justifyContent: "center",
                    }}
                    onClick={() => setStepActionStep(6)}
                  >
                    <div>Remove a Service</div>
                  </div>
                </div>
                <div className="goBack3" onClick={() => setStepActionStep(1)}>
                  Go Back
                </div>
              </div>
            )}

            {stepActionStep === 5 && (
              <div className="acc-mt-div">
                <div className="acc-sub-text">Which service do you want to add?</div>
                <div className="acc-scroll-div">
                  {allServicesToAdd &&
                    allServicesToAdd?.serviceDetails?.map((item) => (
                      <div
                        className={
                          selectedServices.includes(item?._id)
                            ? "acc-step-box4-selected"
                            : "acc-step-box4"
                        }
                        style={{
                          flexDirection: "column",
                          alignItems: "flex-start",
                          justifyContent: "center",
                        }}
                        onClick={() => handleSelectServicesForStep(item?._id)}
                        key={item?._id}
                      >
                        <div>{item?.name}</div>
                        <div style={{ fontSize: "12px", fontWeight: 400, paddingTop: "5px" }}>
                          {item?._id}
                        </div>
                      </div>
                    ))}
                </div>
                <div
                  className="save-Btn"
                  style={{ opacity: selectedServices.length > 0 ? 1 : 0.3 }}
                  onClick={() => selectedServices.length > 0 && addServicesToStep()}
                >
                  Add Selected Services
                </div>
                <div className="goBack3" onClick={() => setStepActionStep(1)}>
                  Go Back
                </div>
              </div>
            )}

            {stepActionStep === 6 && (
              <div className="acc-mt-div">
                <div className="acc-sub-text">Which service do you want to remove?</div>
                <div className="acc-scroll-div">
                  {allServicesToRemove &&
                    allServicesToRemove?.serviceDetails?.map((item) => (
                      <div
                        className={
                          selectedServices.includes(item?._id)
                            ? "acc-step-box4-selected"
                            : "acc-step-box4"
                        }
                        style={{
                          flexDirection: "column",
                          alignItems: "flex-start",
                          justifyContent: "center",
                        }}
                        onClick={() => removeServiceFromStep(item?._id)}
                        key={item?._id}
                      >
                        <div>{item?.name}</div>
                        <div style={{ fontSize: "12px", fontWeight: 400, paddingTop: "5px" }}>
                          {item?._id}
                        </div>
                      </div>
                    ))}
                </div>
                <div className="goBack3" onClick={() => setStepActionStep(1)}>
                  Go Back
                </div>
              </div>
            )}

            {actionLoading && (
              <div className="popularlogo">
                <img className="popularlogoimg" src={lg1} alt="" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPaths;