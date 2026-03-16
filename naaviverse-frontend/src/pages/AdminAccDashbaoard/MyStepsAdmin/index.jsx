import React, { useState, useEffect } from "react";
import { useCoinContextData } from "../../../context/CoinContext.js";
import Skeleton from "react-loading-skeleton";
import "./mypaths.scss";
import axios from "axios";
import { Draggable } from "react-beautiful-dnd";
import EditStepForm from "../../accDashbaoard/MyStepsAcc/steps.jsx";
import dummy from "./dummy.svg";
import closepop from "../../../static/images/dashboard/closepop.svg";
import lg1 from "../../../static/images/login/lg1.svg";
import CurrentStep from "../../CurrentStep/index.jsx";
import { useStore } from "../../../components/store/store.ts";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const MyStepsAdmin = ({ search, admin, fetchAllServicesAgain, stepDataPage }) => {
  const navigate = useNavigate();
  const { sideNav, setsideNav } = useStore();
  let userDetails = JSON.parse(localStorage.getItem("adminuser"));
  const { setCurrentStepData, setCurrentStepDataLength, mypathsMenu, setMypathsMenu } = useCoinContextData();

  const [partnerPathData, setPartnerPathData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [partnerStepsData, setPartnerStepsData] = useState([]);
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
  const [selectedServices, setSelectedServices] = useState([]);
  const [showSelectedPath, setShowSelectedPath] = useState(null);
  const [addServiceStep, setAddServiceStep] = useState(null);
  const [selectedSubStep, setSelectedSubStep] = useState(null);
  const [allServices, setAllServices] = useState([]);
  const [attachedServices, setAttachedServices] = useState([]);
  const [serviceToRemove, setServiceToRemove] = useState(null);
  const [selectedStep, setSelectedStep] = useState(null);
  const [allPaths, setAllPaths] = useState([]);
  const [backupPathData, setBackupPathData] = useState([]);
  const [stepId, setStepId] = useState("");
  const [backupPathId, setBackupPathId] = useState("");
  const [serviceCountMap, setServiceCountMap] = useState({});
  const [productDataArray, setProductDataArray] = useState([]);
  const [productKeys, setProductKeys] = useState(null);

  useEffect(() => {
    if (stepActionEnabled && selectedStepId) {
      const step = partnerStepsData.find(s => s._id === selectedStepId);
      setSelectedStep(step || null);
    }
  }, [stepActionEnabled, selectedStepId, partnerStepsData]);

  const getAllPaths = () => {
    setLoading(true);
    let email = userDetails?.email;
    const endpoint = admin
      ? `${BASE_URL}/api/paths/get?status=active`
      : `${BASE_URL}/api/paths/get?email=${email}`;
    axios.get(endpoint)
      .then((response) => { setPartnerPathData(response?.data?.data); setLoading(false); })
      .catch((error) => console.log(error));
  };

  useEffect(() => {
    if (!userDetails?.email) return;
    axios.get(`${BASE_URL}/api/paths/get?email=${userDetails.email}`)
      .then(({ data }) => { if (data.status) setBackupPathData(data.data); });
  }, [userDetails?.email]);

  const getNewPath = () => {
    setLoading(true);
    axios.get(`${BASE_URL}/api/paths/get?status=waitingforapproval`)
      .then((response) => { setPartnerPathData(response?.data?.data); setLoading(false); })
      .catch((error) => console.log(error));
  };

  const fetchServiceCounts = async (steps = []) => {
    if (!Array.isArray(steps) || steps.length === 0) { setServiceCountMap({}); return; }
    const counts = {};
    await Promise.all(steps.map(async (step) => {
      try {
        const { data } = await axios.get(`${BASE_URL}/api/steps/getall/${step._id}`);
        counts[step._id] = data?.data?.length || 0;
      } catch { counts[step._id] = 0; }
    }));
    setServiceCountMap(counts);
  };

  const refreshStepServices = async (stepId) => {
    if (!stepId) return;
    try {
      const { data } = await axios.get(`${BASE_URL}/api/steps/getall/${stepId}`);
      setAttachedServices(data?.status ? data.data || [] : []);
    } catch (err) { setAttachedServices([]); }
  };

  const getAllSteps = () => {
    setLoading(true);
    axios.get(`${BASE_URL}/api/steps/get?status=${mypathsMenu === "Active Steps" ? "active" : "inactive"}`)
      .then((response) => {
        const result = response?.data?.data || [];
        setPartnerStepsData(result);
        if (result.length > 0) fetchServiceCounts(result);
        else setServiceCountMap({});
        setLoading(false);
      })
      .catch(() => { setPartnerStepsData([]); setLoading(false); });
  };

  useEffect(() => { getAllSteps(); }, [mypathsMenu]);

  useEffect(() => {
    if (stepActionStep !== 5) return;
    axios.get(`${BASE_URL}/api/services/admin?status=active`)
      .then(({ data }) => setAllServices(data?.status ? data.data || [] : []))
      .catch(() => setAllServices([]));
  }, [stepActionStep]);

  useEffect(() => {
    if (stepActionStep !== 6 || !selectedStepId) return;
    axios.get(`${BASE_URL}/api/steps/getall/${selectedStepId}`)
      .then(({ data }) => setAttachedServices(data?.status ? data.data || [] : []))
      .catch(() => setAttachedServices([]));
  }, [stepActionStep, selectedStepId]);

  const filteredPartnerPathData = partnerPathData?.filter((entry) =>
    entry?.nameOfPath?.toLowerCase()?.includes(search?.toLowerCase())
  );

  const filteredPartnerStepsData = partnerStepsData?.filter((entry) =>
    entry?.name?.toLowerCase()?.includes(search?.toLowerCase())
  );

  const myPathsTimeout = () => setTimeout(reload1, 2000);
  function reload1() {
    getAllPaths(); setPathActionEnabled(false); setPathActionStep(1);
    setSelectedPathId(""); setEditPaths("default"); setMetaDataStep("default");
    setSelectedPath([]); setNewValue("");
  }

  const myStepsTimeout = () => setTimeout(reload2, 2000);
  function reload2() {
    getAllSteps(); setStepActionEnabled(false); setStepActionStep(1); setSelectedStepId("");
  }

  const deletePath = () => {
    setActionLoading(true);
    axios.delete(`${BASE_URL}/api/paths/delete/${selectedPathId}`)
      .then((response) => {
        if (response?.data?.status) { setActionLoading(false); setPathActionStep(3); myPathsTimeout(); }
      }).catch((error) => console.log(error));
  };

  const deleteStep = () => {
    setActionLoading(true);
    axios.delete(`${BASE_URL}/api/steps/delete/${selectedStepId}`)
      .then((response) => {
        if (response?.data?.status) { setActionLoading(false); setStepActionStep(3); myStepsTimeout(); }
      }).catch((error) => console.log(error));
  };

  const addServiceToStepInstant = async (serviceId) => {
    if (!selectedStepId) { toast.error("No step selected"); return; }
    try {
      await axios.post(`${BASE_URL}/api/steps/attachservice`, { step_id: selectedStepId, service_ids: [serviceId] });
      toast.success("Service added successfully");
      await refreshStepServices(selectedStepId);
      fetchServiceCounts(partnerStepsData);
    } catch (error) { toast.error("Failed to add service"); }
  };

  const resetPathAction = () => {
    setPathActionEnabled(false); setPathActionStep(1); setSelectedPathId("");
    setEditPaths("default"); setMetaDataStep("default"); setSelectedPath([]);
    setNewValue(""); setViewPathData([]);
  };

  const editMetaData = (field) => {
    setActionLoading(true);
    axios.put(`${BASE_URL}/api/paths/update/${selectedPathId}`, { [field]: newValue })
      .then((response) => {
        if (response?.data?.status) { setMetaDataStep("success"); setActionLoading(false); myPathsTimeout(); }
      }).catch((error) => console.log(error));
  };

  const viewPath = (path) => {
    setViewPathLoading(true);
    axios.get(`${BASE_URL}/api/paths/get?nameOfPath=${path}`)
      .then((response) => { setViewPathData(response?.data?.data[0]); setViewPathLoading(false); })
      .catch((error) => console.log(error));
  };

  const handleApprovePath = () => {
    setActionLoading(true);
    axios.put(`${BASE_URL}/api/paths/updatepath/${selectedPathId}`, { status: "active" })
      .then(({ data }) => {
        if (data.status) { getNewPath(); setPathActionEnabled(false); setActionLoading(false); setPathActionStep(1); }
      });
  };

  const handleRejectPath = () => {
    setActionLoading(true);
    axios.put(`${BASE_URL}/api/paths/updatepath/${selectedPathId}`, { status: "inactive" })
      .then(({ data }) => {
        if (data.status) {
          mypathsMenu === "Pending Paths" ? getNewPath() : getAllPaths();
          setPathActionEnabled(false); setActionLoading(false); setPathActionStep(1);
        }
      });
  };

  const removeServiceFromStep = async (id) => {
    if (!selectedStepId || !id) return;
    setActionLoading(true);
    try {
      await axios.delete(`${BASE_URL}/api/steps/remove/${selectedStepId}/${id}`);
      toast.success("Service removed");
      await refreshStepServices(selectedStepId);
      fetchServiceCounts(partnerStepsData);
    } catch (err) { toast.error("Failed to remove service"); }
    finally { setActionLoading(false); }
  };

  useEffect(() => { setShowSelectedPath(null); }, [mypathsMenu]);

  const fetchProductData = async (apiKey) => {
    try {
      const response = await axios.get(`https://comms.globalxchange.io/gxb/product/get?product_id=${apiKey}`);
      return response.data.products[0];
    } catch (error) { return null; }
  };

  const fetchData = React.useCallback(async () => {
    setProductDataArray([]);
    if (productKeys && Array.isArray(productKeys)) {
      const results = await Promise.all(productKeys.map(id => fetchProductData(id)));
      setProductDataArray(results.filter(Boolean));
    }
  }, [productKeys]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const pathNameMap = React.useMemo(() => {
    const map = {};
    allPaths.forEach((p) => { map[String(p._id)] = p.nameOfPath; });
    return map;
  }, [allPaths]);

  useEffect(() => {
    axios.get(`${BASE_URL}/api/paths/get?status=active`).then(({ data }) => {
      if (data?.status) setAllPaths(data.data);
    });
  }, []);

  useEffect(() => {
    if (pathActionEnabled || stepActionEnabled) document.body.classList.add('admin-popup-open');
    else document.body.classList.remove('admin-popup-open');
    return () => document.body.classList.remove('admin-popup-open');
  }, [pathActionEnabled, stepActionEnabled]);

  const closeStepModal = () => {
    setStepActionEnabled(false);
    setStepActionStep(1);
    setSelectedStepId("");
    setSelectedStep(null);
  };

  const handlePlace = (item, index) => {
    const updatedPathObject = addIdToObjectAtIndex(item?.the_ids, stepId, backupPathId, index);
    axios.put(`${BASE_URL}/api/paths/update/${selectedPath?._id}`, { the_ids: updatedPathObject })
      .then(res => { if (res.data.status) { resetPathAction(); getAllPaths(); } });
  };

  function addIdToObjectAtIndex(idsArray, stepId, backupPathId, index) {
    const newArray = idsArray.map(({ step_id, backup_pathId }) => ({ step_id, backup_pathId }));
    newArray.splice(index, 0, { step_id: stepId, backup_pathId: backupPathId });
    return newArray;
  }

  const handledeletePathPosition = (fullObject, idToDelete) => {
    const updatedTheIds = [...fullObject.the_ids];
    const indexToDelete = updatedTheIds.findIndex(obj => obj._id === idToDelete);
    if (indexToDelete !== -1) updatedTheIds.splice(indexToDelete, 1);
    const updatedBody = updatedTheIds.map(({ step_id, backup_pathId }) => ({ step_id, backup_pathId }));
    axios.put(`${BASE_URL}/api/paths/update/${selectedPath?._id}`, { the_ids: updatedBody })
      .then(res => { if (res.data.status) { resetPathAction(); getAllPaths(); } });
  };

  const getChangedPos = (currentPos, newPos) => updatePositionOfObject(selectedPath, currentPos, newPos);

  function updatePositionOfObject(fullObject, currentIndex, newIndex) {
    const updatedTheIds = [...fullObject.the_ids];
    const [movedObject] = updatedTheIds.splice(currentIndex, 1);
    updatedTheIds.splice(newIndex, 0, movedObject);
    const updatedTheIdsArray = updatedTheIds.map(({ step_id, backup_pathId }) => ({ step_id, backup_pathId }));
    axios.put(`${BASE_URL}/api/paths/update/${selectedPath?._id}`, { the_ids: updatedTheIdsArray })
      .then(res => { if (res.data.status) { resetPathAction(); getAllPaths(); } });
  }

  const getModalTitle = () => {
    if (stepActionStep === 3) return null;
    if (stepActionStep === 4) return "Edit Services";
    if (stepActionStep === 5) return "Add a Service";
    if (stepActionStep === 6) return "Remove a Service";
    if (stepActionStep === 7) return "Edit Step";
    return "Step Actions";
  };

  return (
    <div className="admin-mypaths">

      {/* ── Tab Menu ── */}
      <div className="admin-mypaths-menu">
        {["Active Steps", "Inactive Steps"].map((tab) => (
          <div
            key={tab}
            className={`admin-each-mypath-menu ${mypathsMenu === tab ? "active-tab" : ""}`}
            onClick={() => {
              setMypathsMenu(tab);
              if (viewPathEnabled) { setViewPathEnabled(false); setViewPathData([]); }
            }}
          >
            {tab}
          </div>
        ))}
      </div>

      {/* ── Content ── */}
      <div className="admin-mypaths-content">
        {showSelectedPath ? (
          <div>
            <CurrentStep
              productDataArray={productDataArray}
              selectedPathId={selectedPathId}
              showSelectedPath={showSelectedPath}
              selectedPath={selectedPath}
            />
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="admin-mypathsNav">
              <div className="admin-mypathsName">Name</div>
              <div className="admin-mypathsCountry">Length</div>
              <div className="admin-mypathsCountry">Cost</div>
              <div className="admin-mypathsMicrosteps">Services</div>
            </div>

            {/* Table Rows */}
            <div className="admin-mypathsScroll-div">
              {loading
                ? Array(10).fill("").map((_, i) => (
                    <div className="step-row" key={i} style={{ pointerEvents: "none" }}>
                      <div className="step-row-main">
                        <div style={{ width: "25%" }}><Skeleton height={16} width="70%" /></div>
                        <div style={{ width: "25%" }}><Skeleton height={16} width="50%" /></div>
                        <div style={{ width: "25%" }}><Skeleton height={16} width="50%" /></div>
                        <div style={{ width: "25%" }}><Skeleton height={16} width="30%" /></div>
                      </div>
                    </div>
                  ))
                : filteredPartnerStepsData?.map((e) => {
                    const isFree = !e?.cost || e?.cost?.toLowerCase() === "free";
                    return (
                      <div
                        className="step-row"
                        key={e._id}
                        onClick={() => {
                          setSelectedStepId(e._id);
                          setSelectedStep(e);
                          setStepActionEnabled(true);
                        }}
                      >
                        <div className="step-row-main">
                          <div className="step-row-name">{e?.name || "Untitled"}</div>
                          <div className="step-row-length">{e?.length || 0} Days</div>
                          <div className="step-row-cost">
                            <span className={`step-cost-pill ${isFree ? "free" : "paid"}`}>
                              {isFree ? "Free" : e?.cost}
                            </span>
                          </div>
                          <div className="step-row-services">
                            <span className="step-services-count">
                              {serviceCountMap[e._id] ?? 0}
                            </span>
                          </div>
                        </div>

                        {e?.description && (
                          <div className="step-row-desc">{e.description}</div>
                        )}

                        <div className="step-row-footer">
                          <span className="step-footer-label">BY</span>
                          <span className="step-footer-email">{e?.email || "N/A"}</span>
                          <span className="step-footer-dot">•</span>
                          <span className="step-footer-date">
                            {e?.createdAt
                              ? new Date(e.createdAt).toLocaleDateString("en-IN", {
                                  day: "2-digit", month: "short", year: "numeric",
                                })
                              : "—"}
                          </span>
                          {e?.path_id && pathNameMap[String(e.path_id)] && (
                            <span className="step-path-tag">
                              ✦ {pathNameMap[String(e.path_id)]}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
              }
            </div>
          </>
        )}
      </div>

      {/* ══ STEP ACTION MODAL ══ */}
      {stepActionEnabled && (
        <div className="smodal-overlay" onClick={closeStepModal}>
          <div className="smodal-box" onClick={(e) => e.stopPropagation()}>

            {stepActionStep !== 3 && (
              <div className="smodal-header">
                <div className="smodal-header-left">
                  {stepActionStep > 1 && stepActionStep !== 7 && (
                    <button
                      className="smodal-back-btn"
                      onClick={() => {
                        if (stepActionStep === 5 || stepActionStep === 6) setStepActionStep(4);
                        else if (stepActionStep === 4) setStepActionStep(1);
                        else setStepActionStep(stepActionStep - 1);
                      }}
                    >
                      ← Back
                    </button>
                  )}
                  <h2 className="smodal-title">{getModalTitle()}</h2>
                </div>
                <button className="smodal-close-btn" onClick={closeStepModal}>
                  <img src={closepop} alt="close" />
                </button>
              </div>
            )}

            {selectedStep && stepActionStep !== 3 && stepActionStep !== 7 && (
              <div className="smodal-step-chip">
                <span className="smodal-chip-dot" />
                {selectedStep.name}
              </div>
            )}

            {stepActionStep === 1 && (
              <div className="smodal-actions-grid">
                <button className="smodal-action-btn" onClick={() => setStepActionStep(4)}>
                  <span className="smodal-action-icon">🔧</span>
                  <span className="smodal-action-label">Edit Services</span>
                  <span className="smodal-action-arrow">→</span>
                </button>
                <button className="smodal-action-btn" onClick={() => setStepActionStep(7)}>
                  <span className="smodal-action-icon">✏️</span>
                  <span className="smodal-action-label">Edit Step</span>
                  <span className="smodal-action-arrow">→</span>
                </button>
                <button className="smodal-action-btn danger" onClick={() => deleteStep()}>
                  <span className="smodal-action-icon">🗑</span>
                  <span className="smodal-action-label">Delete Step</span>
                  <span className="smodal-action-arrow">→</span>
                </button>
              </div>
            )}

            {stepActionStep === 3 && (
              <div className="smodal-success">
                <div className="smodal-success-icon">✓</div>
                <div className="smodal-success-title">Step Deleted</div>
                <div className="smodal-success-sub">Redirecting shortly...</div>
              </div>
            )}

            {stepActionStep === 4 && (
              <div className="smodal-actions-grid">
                <button className="smodal-action-btn" onClick={() => setStepActionStep(5)}>
                  <span className="smodal-action-icon">➕</span>
                  <span className="smodal-action-label">Add a Service</span>
                  <span className="smodal-action-arrow">→</span>
                </button>
                <button className="smodal-action-btn" onClick={() => setStepActionStep(6)}>
                  <span className="smodal-action-icon">➖</span>
                  <span className="smodal-action-label">Remove a Service</span>
                  <span className="smodal-action-arrow">→</span>
                </button>
              </div>
            )}

            {stepActionStep === 5 && (
              <div className="smodal-list">
                {allServices.length > 0 ? (
                  allServices.map(item => {
                    const isAlreadyAdded = attachedServices?.some(s => s._id === item._id);
                    return (
                      <div
                        key={item._id}
                        className={`smodal-list-item ${isAlreadyAdded ? "already-added" : ""}`}
                        onClick={() => { if (!isAlreadyAdded) addServiceToStepInstant(item._id); }}
                      >
                        <div className="smodal-list-item-name">{item.name}</div>
                        {isAlreadyAdded
                          ? <span className="smodal-added-badge">✔ Added</span>
                          : <span className="smodal-list-arrow">+</span>
                        }
                      </div>
                    );
                  })
                ) : (
                  <div className="smodal-empty">No services found</div>
                )}
              </div>
            )}

            {stepActionStep === 6 && (
              <div className="smodal-list">
                {attachedServices.length > 0 ? (
                  attachedServices.map(item => (
                    <div
                      key={item._id}
                      className="smodal-list-item removable"
                      onClick={() => removeServiceFromStep(item._id)}
                    >
                      <div className="smodal-list-item-name">{item.name}</div>
                      <span className="smodal-remove-badge">Remove ×</span>
                    </div>
                  ))
                ) : (
                  <div className="smodal-empty">No services attached</div>
                )}
              </div>
            )}

            {stepActionStep === 7 && selectedStep && (
              <div className="smodal-form-wrap">
                <EditStepForm
                  selectedStep={selectedStep}
                  onSave={(updatedStep) => {
                    setPartnerStepsData((prev) =>
                      prev.map((step) =>
                        step._id === updatedStep._id ? { ...step, ...updatedStep } : step
                      )
                    );
                    setSelectedStep(updatedStep);
                    closeStepModal();
                  }}
                  onCancel={closeStepModal}
                />
              </div>
            )}

            {actionLoading && (
              <div className="smodal-loading">
                <img src={lg1} alt="loading" className="smodal-loading-img" />
              </div>
            )}

          </div>
        </div>
      )}

      {/* ══ PATH ACTION PANEL ══ */}
      {pathActionEnabled && (
        <>
          <div className="admin-popup-backdrop" onClick={() => resetPathAction()} />
          <div className="admin-acc-popular1">
            <div
              className="admin-acc-popular-top1"
              style={{
                display: pathActionStep === 3 ? "none" : metaDataStep === "success" ? "none" : "",
              }}
            >
              <div className="admin-acc-popular-head1">
                {pathActionStep > 3 ? "Edit Paths" : "My Path Actions"}
              </div>
              <div
                className="admin-acc-popular-img-box1"
                style={{ cursor: "pointer" }}
                onClick={() => resetPathAction()}
              >
                <img className="admin-acc-popular-img1" src={closepop} alt="" />
              </div>
            </div>

            {pathActionStep === 1 && mypathsMenu !== "Pending Paths" && (
              <div className="admin-acc-mt-div">
                <div className="admin-acc-scroll-div">
                  <div className="admin-acc-step-box4" onClick={() => setPathActionStep(4)}>Edit path</div>
                  <div className="admin-acc-step-box4" onClick={() => setPathActionStep(2)}>Delete path</div>
                  {admin && (
                    <div className="admin-acc-step-box4" onClick={() => setPathActionStep(6)}>Reject Path</div>
                  )}
                  <div
                    className="admin-acc-step-box4"
                    onClick={() => {
                      setViewPathEnabled(true);
                      setPathActionEnabled(false);
                      navigate(`/dashboard/path/${selectedPathId}`);
                    }}
                  >
                    View path
                  </div>
                </div>
              </div>
            )}

            {pathActionStep === 1 && mypathsMenu === "Pending Paths" && (
              <div className="admin-acc-mt-div">
                <div className="admin-acc-scroll-div">
                  <div className="admin-acc-step-box4" onClick={() => setPathActionStep(5)}>Approve Path</div>
                  <div className="admin-acc-step-box4" onClick={() => setPathActionStep(6)}>Reject Path</div>
                  <div className="admin-acc-step-box4" onClick={() => setPathActionStep(9)}>Add Services</div>
                  <div className="admin-acc-step-box4" onClick={() => setPathActionStep(4)}>Edit path</div>
                  <div className="admin-acc-step-box4" onClick={() => setPathActionStep(2)}>Delete path</div>
                  <div
                    className="admin-acc-step-box4"
                    onClick={() => { setViewPathEnabled(true); setPathActionEnabled(false); }}
                  >
                    View path
                  </div>
                </div>
              </div>
            )}

            {pathActionStep === 2 && (
              <div className="admin-acc-mt-div">
                <div className="admin-acc-scroll-div">
                  <div className="admin-acc-step-box4" onClick={() => deletePath()}>Confirm and delete</div>
                </div>
                <div className="admin-goBack3" onClick={() => setPathActionStep(1)}>Go Back</div>
              </div>
            )}

            {actionLoading && (
              <div className="admin-popularlogo">
                <img className="admin-popularlogoimg" src={lg1} alt="" />
              </div>
            )}

            {pathActionStep === 3 && <div className="admin-success-box2">Path Successfully Deleted</div>}

            {pathActionStep === 5 && (
              <div className="admin-acc-mt-div">
                <div className="admin-acc-sub-text">Are you sure you want to approve this path?</div>
                <div className="admin-acc-scroll-div">
                  <div className="admin-acc-step-box4" onClick={() => handleApprovePath()}>Yes</div>
                  <div className="admin-acc-step-box4" onClick={() => setPathActionStep(1)}>Never mind</div>
                </div>
                <div className="admin-goBack3" onClick={() => setPathActionStep(1)}>Go Back</div>
              </div>
            )}

            {pathActionStep === 6 && (
              <div className="admin-acc-mt-div">
                <div className="admin-acc-sub-text">Are you sure you want to reject this path?</div>
                <div className="admin-acc-scroll-div">
                  <div className="admin-acc-step-box4" onClick={() => handleRejectPath()}>Yes</div>
                  <div className="admin-acc-step-box4" onClick={() => setPathActionStep(1)}>Never mind</div>
                </div>
                <div className="admin-goBack3" onClick={() => setPathActionStep(1)}>Go Back</div>
              </div>
            )}

            {pathActionStep === 7 && <div className="admin-success-box2">Path is Approved.</div>}
            {pathActionStep === 8 && <div className="admin-success-box2">Path is Rejected.</div>}
          </div>
        </>
      )}

    </div>
  );
};

export default MyStepsAdmin;