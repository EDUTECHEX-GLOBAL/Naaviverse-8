import React, { useState, useEffect } from "react";
import { useCoinContextData } from "../../context/CoinContext.js";
import Skeleton from "react-loading-skeleton";
import "./mypaths.scss";
import axios from "axios";
import { Draggable } from "react-drag-reorder";
import closepop from "../../static/images/dashboard/closepop.svg";
import lg1 from "../../static/images/login/lg1.svg";
import CurrentStep from "../CurrentStep/index.jsx";
import { useStore } from "../../components/store/store.ts";
import { useNavigate } from "react-router-dom";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const MyPathsAdmin = ({ search, admin, fetchAllServicesAgain, stepDataPage }) => {
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
  const [selectedPath, setSelectedPath] = useState({});
  const [newValue, setNewValue] = useState("");
  const [viewPathEnabled, setViewPathEnabled] = useState(false);
  const [viewPathLoading, setViewPathLoading] = useState(false);
  const [viewPathData, setViewPathData] = useState([]);
  const [showSelectedPath, setShowSelectedPath] = useState(null);
  const [backupPathData, setBackupPathData] = useState([]);
  const [stepId, setStepId] = useState("");
  const [backupPathId, setBackupPathId] = useState("");
  const [searchName, setSearchName] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const [expandedRows, setExpandedRows] = useState({});
  const [productDataArray, setProductDataArray] = useState([]);
  const [productKeys, setProductKeys] = useState(null);
  const [allServicesToAdd, setAllServicesToAdd] = useState([]);
  const [allServicesToRemove, setAllServicesToRemove] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);

  // Marketplace states
  const [marketplaceItems, setMarketplaceItems] = useState([]);
  const [marketplaceLoading, setMarketplaceLoading] = useState(false);
  const [attachedServices, setAttachedServices] = useState([]);
  const [marketStepId, setMarketStepId] = useState("");

  // ─── Fetchers ────────────────────────────────────────────────
  const IconEye = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z"
        strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );

  const getAllPaths = () => {
    setLoading(true);
    const email = userDetails?.email;
    const endpoint = admin
      ? `${BASE_URL}/api/paths/get?status=active`
      : `${BASE_URL}/api/paths/get?email=${email}`;
    axios.get(endpoint).then(({ data }) => {
      setPartnerPathData(data?.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  const getInactivePath = () => {
    setLoading(true);
    const email = userDetails?.email;
    const endpoint = admin
      ? `${BASE_URL}/api/paths/get?status=inactive`
      : `${BASE_URL}/api/paths/get?email=${email}`;
    axios.get(endpoint).then(({ data }) => {
      setPartnerPathData(data?.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  const getNewPath = () => {
    setLoading(true);
    axios.get(`${BASE_URL}/api/paths/get?status=waitingforapproval`).then(({ data }) => {
      setPartnerPathData(data?.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  const getAllSteps = () => {
    axios.get(`${BASE_URL}/api/steps/get?status=active`).then(({ data }) => {
      setPartnerStepsData(data?.data);
    });
  };

  // Fetch ALL marketplace items (for the "available to attach" list)
  const fetchMarketplaceItems = () => {
    setMarketplaceLoading(true);
    axios.get(`${BASE_URL}/api/marketplace/admin/get-all`).then(({ data }) => {
      if (data.status) setMarketplaceItems(data.data || []);
      setMarketplaceLoading(false);
    }).catch(() => setMarketplaceLoading(false));
  };

  // Fetch marketplace items already attached to a specific step
  const fetchAttachedServices = (sid) => {
    axios.get(`${BASE_URL}/api/marketplace/step/${sid}`)
      .then(({ data }) => {
        if (data.status) setAttachedServices(data?.data || []);
        else setAttachedServices([]);
      })
      .catch(() => setAttachedServices([]));
  };

  const deleteStep = () => {
    setActionLoading(true);
    axios.delete(`${BASE_URL}/api/steps/delete/${selectedStepId}`).then(({ data }) => {
      if (data?.status) {
        setActionLoading(false);
        setStepActionStep(3);
        setTimeout(() => {
          getAllSteps();
          setStepActionEnabled(false);
          setStepActionStep(1);
          setSelectedStepId("");
        }, 2000);
      }
    }).catch(() => setActionLoading(false));
  };

  useEffect(() => {
    axios.get(`${BASE_URL}/api/paths/get?status=active`).then(({ data }) => {
      if (data.status) setBackupPathData(data?.data);
    });
    getAllSteps();
    axios.get(`${BASE_URL}/api/services/getservices?status=active`).then(({ data }) => {
      if (data.status) setAllServicesToAdd(data.data);
    });
  }, []);

  useEffect(() => {
    if (mypathsMenu === "Pending Paths") getNewPath();
    else if (mypathsMenu === "Inactive Paths") getInactivePath();
    else getAllPaths();
  }, [mypathsMenu]);

  useEffect(() => {
    if (selectedStepId) {
      axios.get(`${BASE_URL}/api/attachservice/get?step_id=${selectedStepId}`)
        .then(({ data }) => { if (data.status) setAllServicesToRemove(data?.data[0]); })
        .catch(() => { });
    }
  }, [selectedStepId]);

  useEffect(() => {
    if (!productKeys || !Array.isArray(productKeys) || productKeys.length === 0) {
      setProductDataArray([]); return;
    }
    Promise.all(productKeys.map(id =>
      axios.get(`${BASE_URL}/api/services/getbyid/${id}`).then(r => r.data.data).catch(() => null)
    )).then(results => setProductDataArray(results.filter(Boolean)));
  }, [productKeys]);

  useEffect(() => { setShowSelectedPath(null); }, [mypathsMenu]);
  useEffect(() => { setMypathsMenu("Paths"); }, []);

  useEffect(() => {
    if (pathActionEnabled || stepActionEnabled) document.body.classList.add('admin-popup-open');
    else document.body.classList.remove('admin-popup-open');
    return () => document.body.classList.remove('admin-popup-open');
  }, [pathActionEnabled, stepActionEnabled]);

  useEffect(() => {
    if (!stepActionEnabled) { setSelectedServices([]); setStepActionStep(1); }
  }, [stepActionEnabled]);

  // ─── Filter ──────────────────────────────────────────────────
  const filteredPartnerPathData = partnerPathData?.filter((entry) => {
    const mn = entry?.nameOfPath?.toLowerCase()?.includes(searchName?.toLowerCase());
    const me = entry?.email?.toLowerCase()?.includes(searchEmail?.toLowerCase());
    if (!searchName && !searchEmail) return true;
    if (searchName && !searchEmail) return mn;
    if (!searchName && searchEmail) return me;
    return mn && me;
  });

  // ─── Actions ─────────────────────────────────────────────────
  const resetPathAction = () => {
    setPathActionEnabled(false);
    setPathActionStep(1);
    setSelectedPathId("");
    setEditPaths("default");
    setMetaDataStep("default");
    setSelectedPath([]);
    setNewValue("");
    setViewPathData([]);
    setMarketStepId("");
    setAttachedServices([]);
    setMarketplaceItems([]);
  };

  const deletePath = () => {
    setActionLoading(true);
    axios.delete(`${BASE_URL}/api/paths/delete/${selectedPathId}`).then(({ data }) => {
      if (data?.status) {
        setActionLoading(false);
        setPathActionStep(3);
        mypathsMenu === "Paths" ? getAllPaths() : getInactivePath();
      }
    }).catch(() => setActionLoading(false));
  };

  const reactivatePath = () => {
    setActionLoading(true);
    axios.put(`${BASE_URL}/api/paths/reactivate/${selectedPathId}`).then(({ data }) => {
      if (data?.status) { setActionLoading(false); setPathActionStep(3); getAllPaths(); }
    }).catch(() => setActionLoading(false));
  };

  const handleApprovePath = () => {
    setActionLoading(true);
    axios.put(`${BASE_URL}/api/paths/updatepath/${selectedPathId}`, { status: "active" }).then(({ data }) => {
      if (data.status) { getAllPaths(); setPathActionEnabled(false); setActionLoading(false); setPathActionStep(1); }
    }).catch(() => setActionLoading(false));
  };

  const handleRejectPath = () => {
    setActionLoading(true);
    axios.put(`${BASE_URL}/api/paths/updatepath/${selectedPathId}`, { status: "draft" }).then(({ data }) => {
      if (data.status) {
        mypathsMenu === "Pending Paths" ? getNewPath() : getAllPaths();
        setPathActionEnabled(false); setActionLoading(false); setPathActionStep(1);
      }
    });
  };

  const editMetaData = (field) => {
    setActionLoading(true);
    axios.patch(`${BASE_URL}/api/paths/edit`, { pathId: selectedPathId, [field]: newValue }).then(({ data }) => {
      if (data?.status) { setMetaDataStep("success"); setActionLoading(false); setTimeout(reload1, 2000); }
    }).catch(() => setActionLoading(false));
  };

  function reload1() {
    getAllPaths(); setPathActionEnabled(false); setPathActionStep(1);
    setSelectedPathId(""); setEditPaths("default"); setMetaDataStep("default"); setSelectedPath([]); setNewValue("");
  }

  const handlePlace = (item, index) => {
    const arr = (item?.the_ids || []).map(({ step_id, backup_pathId }) => ({ step_id, backup_pathId }));
    arr.splice(index, 0, { step_id: stepId, backup_pathId: backupPathId });
    axios.patch(`${BASE_URL}/api/paths/edit`, { pathId: selectedPath?._id, the_ids: arr }).then(({ data }) => {
      if (data.status) { resetPathAction(); getAllPaths(); }
    });
  };

  const handledeletePathPosition = (fullObject, idToDelete) => {
    const updated = [...fullObject.the_ids];
    const idx = updated.findIndex(o => o.step_id === idToDelete);
    if (idx !== -1) updated.splice(idx, 1);
    const body = updated.map(({ step_id, backup_pathId }) => ({ step_id, backup_pathId }));
    axios.patch(`${BASE_URL}/api/paths/edit`, { pathId: selectedPath?._id, the_ids: body }).then(({ data }) => {
      if (data.status) { resetPathAction(); getAllPaths(); }
    });
  };

  const getChangedPos = (currentPos, newPos) => {
    if (!Array.isArray(selectedPath?.StepDetails) || currentPos === newPos) return;
    const reordered = [...selectedPath.StepDetails];
    const [moved] = reordered.splice(currentPos, 1);
    reordered.splice(newPos, 0, moved);
    const body = reordered.map(s => ({ step_id: s._id, backup_pathId: s.backup_pathId || null }));
    axios.patch(`${BASE_URL}/api/paths/edit`, { pathId: selectedPath._id, the_ids: body }).then(({ data }) => {
      if (data.status) {
        axios.get(`${BASE_URL}/api/paths/viewpath/${selectedPath._id}`).then(({ data }) => {
          if (data?.data) setSelectedPath(data.data);
        });
      }
    });
  };

  const handleSelectServicesForStep = (id) =>
    setSelectedServices(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);

  const addServicesToStep = () => {
    setActionLoading(true);
    axios.post(`${BASE_URL}/api/steps/attachservice`, { step_id: selectedStepId, service_ids: [...selectedServices] }).then(({ data }) => {
      if (data.status) { setStepActionEnabled(false); setActionLoading(false); setSelectedServices([]); fetchAllServicesAgain(); getAllPaths(); }
    }).catch(() => setActionLoading(false));
  };

  const removeServiceFromStep = (id) => {
    setActionLoading(true);
    axios.delete(`${BASE_URL}/api/steps/service/${selectedStepId}/${id}`).then(({ data }) => {
      if (data.status) { setStepActionEnabled(false); setActionLoading(false); fetchAllServicesAgain(); getAllPaths(); }
    }).catch(() => setActionLoading(false));
  };

  // Attach: update the marketplace item's step_id to this step
  const attachMarketService = (item) => {
    setActionLoading(true);
    axios.patch(`${BASE_URL}/api/marketplace/update/${item._id}`, { step_id: marketStepId })
      .then(({ data }) => {
        if (data.status) {
          setActionLoading(false);
          // Optimistically update UI
          setAttachedServices(prev => [...prev, { ...item, step_id: marketStepId }]);
          setMarketplaceItems(prev => prev.filter(m => m._id !== item._id));
        } else {
          // Fallback optimistic update even if response unclear
          setActionLoading(false);
          setAttachedServices(prev => [...prev, { ...item, step_id: marketStepId }]);
          setMarketplaceItems(prev => prev.filter(m => m._id !== item._id));
        }
      })
      .catch(() => {
        setActionLoading(false);
        // Still update UI optimistically
        setAttachedServices(prev => [...prev, { ...item, step_id: marketStepId }]);
        setMarketplaceItems(prev => prev.filter(m => m._id !== item._id));
      });
  };

  // Detach: clear the marketplace item's step_id
  const detachMarketService = (item) => {
    setActionLoading(true);
    axios.patch(`${BASE_URL}/api/marketplace/update/${item._id}`, { step_id: null })
      .then(({ data }) => {
        setActionLoading(false);
        // Update UI
        setAttachedServices(prev => prev.filter(s => s._id !== item._id));
        setMarketplaceItems(prev => [...prev, item]);
      })
      .catch(() => {
        setActionLoading(false);
        // Optimistic fallback
        setAttachedServices(prev => prev.filter(s => s._id !== item._id));
        setMarketplaceItems(prev => [...prev, item]);
      });
  };

  // ─── Back navigation ─────────────────────────────────────────
  const handleBack = () => {
    const backMap = {
      "Edit steps": "default",
      "add_step": "Edit steps",
      "add_sub_step": "add_step",
      "show_all_paths": "add_sub_step",
      "remove_step": "Edit steps",
      "reorder_step": "Edit steps",
      "marketplace_steps": "default",
      "marketplace_attach": "marketplace_steps",
    };
    if (editPaths !== "default") setEditPaths(backMap[editPaths] || "default");
    else setPathActionStep(1);
  };

  const showBack = pathActionStep > 1 || editPaths !== "default";

  const getModalTitle = () => {
    if (["Edit steps", "add_step", "add_sub_step", "show_all_paths", "remove_step", "reorder_step"].includes(editPaths)) return "Edit Path";
    if (editPaths === "marketplace_steps" || editPaths === "marketplace_attach") return "Marketplace";
    if (pathActionStep === 5) return "Approve Path";
    if (pathActionStep === 6) return "Reject Path";
    if (pathActionStep === 2) return mypathsMenu === "Inactive Paths" ? "Reactivate Path" : "Delete Path";
    if (pathActionStep === 3) return "Done";
    if (pathActionStep === 4) return "Edit Path";
    return "Path Actions";
  };

  const roleEmoji = { institution: "🏛", mentor: "👤", distributor: "📦", vendor: "🛍" };
  const roleColor = { institution: "#7c3aed", mentor: "#0891b2", distributor: "#d97706", vendor: "#dc2626" };

  // ─── SVG Icons ───────────────────────────────────────────────
  const IconPencil = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z" />
    </svg>
  );
  const IconTrash = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0h10" />
      <line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
  const IconCheck = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
  const IconX = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
  const IconShop = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
  const IconChevron = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );

  const ActionCard = ({ color, icon, title, desc, onClick }) => (
    <div className={`pp-card pp-card--${color}`} onClick={onClick}>
      <div className="pp-card-icon">{icon}</div>
      <h4>{title}</h4>
      <p>{desc}</p>
    </div>
  );

  const OptionRow = ({ iconColor, icon, title, sub, onClick }) => (
    <div className="pp-option-item" onClick={onClick}>
      <div className={`pp-option-icon pp-option-icon--${iconColor}`}>{icon}</div>
      <div className="pp-option-content"><strong>{title}</strong><span>{sub}</span></div>
      <IconChevron />
    </div>
  );

  return (
    <div className="admin-mypaths">

      {/* TOPBAR */}
      <div className="admin-paths-topbar">
        <div className="admin-paths-tabs">
          <button className={`paths-tab ${mypathsMenu === "Paths" ? "active" : ""}`}
            onClick={() => { setMypathsMenu("Paths"); setViewPathEnabled(false); setViewPathData([]); }}>
            {admin ? "Active Paths" : "Paths"}
          </button>
          {admin && (
            <button className={`paths-tab ${mypathsMenu === "Pending Paths" ? "active" : ""}`}
              onClick={() => { setMypathsMenu("Pending Paths"); setViewPathEnabled(false); setViewPathData([]); }}>
              Pending Paths
            </button>
          )}
          {admin && (
            <button className={`paths-tab ${mypathsMenu === "Inactive Paths" ? "active" : ""}`}
              onClick={() => { setMypathsMenu("Inactive Paths"); setViewPathEnabled(false); setViewPathData([]); }}>
              Inactive Paths
            </button>
          )}
        </div>
        <div className="admin-paths-search-row">
          <div className="paths-search-input">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input type="text" placeholder="Search by path" value={searchName} onChange={e => setSearchName(e.target.value)} />
          </div>
          <div className="paths-search-input">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            <input type="text" placeholder="Search by email" value={searchEmail} onChange={e => setSearchEmail(e.target.value)} />
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="admin-mypaths-content">
        {showSelectedPath ? (
          <div>
            <CurrentStep productDataArray={productDataArray} selectedPathId={selectedPathId} showSelectedPath={showSelectedPath} selectedPath={selectedPath} />
          </div>
        ) : viewPathEnabled ? (
          <div className="admin-viewpath-container">
            <div className="admin-viewpath-top-area">
              <div>Your Selected Path:</div>
              {viewPathLoading ? <Skeleton width={150} height={30} /> : (
                <div className="admin-viewpath-bold-text">{viewPathData && Object.keys(viewPathData).length > 0 ? viewPathData?.destination_institution : ""}</div>
              )}
              {viewPathLoading ? <Skeleton width={500} height={20} /> : (
                <div className="admin-viewpath-des">{viewPathData && Object.keys(viewPathData).length > 0 ? viewPathData?.description : ""}</div>
              )}
              <div className="admin-viewpath-goBack-div" onClick={() => setViewPathEnabled(false)}>Go Back</div>
            </div>
            <div className="admin-viewpath-steps-area">
              {viewPathLoading
                ? Array(6).fill("").map((e, i) => <div className="admin-viewpath-each-j-step" key={i}>...</div>)
                : viewPathData?.StepDetails?.map((e, i) => (
                  <div key={i} className="admin-viewpath-each-j-step"
                    onClick={() => { setShowSelectedPath(e); setProductKeys(e?.product_ids); }}>
                    <div className="admin-viewpath-each-j-img"><img src={e?.icon} alt="" /></div>
                    <div className="admin-viewpath-each-j-step-text">{e?.name}</div>
                    <div className="admin-viewpath-each-j-step-text1">{e?.description}</div>
                    <div className="admin-viewpath-each-j-amount">{e?.cost}</div>
                  </div>
                ))}
            </div>
          </div>
        ) : (
          <div className="paths-table-body">
            {loading
              ? Array(8).fill("").map((_, i) => (
                <div className="paths-table-row" key={i}>
                  <div className="paths-col-name"><Skeleton width={120} height={20} /></div>
                  <div className="paths-col-desc"><Skeleton width="90%" height={20} /></div>
                  <div className="paths-col-steps"><Skeleton width={70} height={28} borderRadius={50} /></div>
                </div>
              ))
              : filteredPartnerPathData?.map((e, i) => (
                <div className="paths-table-row" key={i}
                  onClick={async () => {
                    setPathActionEnabled(true);
                    setSelectedPathId(e?._id);
                    const res = await axios.get(`${BASE_URL}/api/paths/viewpath/${e?._id}`);
                    if (res.data?.data) setSelectedPath(res.data.data);
                  }}>
                  <div className="paths-col-name">
                    <span className="path-name-text">{e?.nameOfPath}</span>
                  </div>
                  <div className="paths-col-desc" onClick={ev => ev.stopPropagation()}>
                    <span className="path-desc-text">
                      {expandedRows[e?._id]
                        ? e?.description
                        : (e?.description?.length > 120 ? e?.description?.substring(0, 120) + '...' : e?.description)}
                    </span>
                    {e?.description?.length > 120 && (
                      <span className="path-desc-toggle" onClick={ev => {
                        ev.stopPropagation();
                        setExpandedRows(prev => ({ ...prev, [e._id]: !prev[e._id] }));
                      }}>
                        {expandedRows[e?._id] ? ' Read Less' : ' Read More'}
                      </span>
                    )}
                  </div>
                  <div className="paths-col-steps">
                    <span className="actions-pill">Actions</span>
                  </div>
                  <div className="path-meta-info">
                    <span className="meta-date">
                      {(function () {
                        const date = e?.createdAt ? new Date(e.createdAt) : new Date();
                        return date.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
                      })()}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* PATH ACTION MODAL */}
      {pathActionEnabled && (
        <>
          <div className="pp-overlay" onClick={() => resetPathAction()} />
          <div className="pp-modal">

            <div className="pp-header">
              <div className="pp-header-left">
                <h3 className="pp-title">{getModalTitle()}</h3>
                <p className="pp-subtitle">{selectedPath?.nameOfPath || "—"}</p>
              </div>
              <div className="pp-header-right">
                {showBack && (
                  <button className="pp-back-btn" onClick={handleBack}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
                    </svg>
                    Back
                  </button>
                )}
                <button className="pp-close-btn" onClick={() => resetPathAction()}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="pp-body">

              {/* MAIN ACTIONS — ACTIVE / INACTIVE */}
              {pathActionStep === 1 && editPaths === "default" && mypathsMenu !== "Pending Paths" && (
                <div className="pp-cards-grid">
                  <ActionCard color="blue" icon={<IconPencil />} title="Edit Path" desc="Modify steps, metadata, or structure" onClick={() => setPathActionStep(4)} />
                  <ActionCard
                    color={mypathsMenu === "Inactive Paths" ? "green" : "red"}
                    icon={mypathsMenu === "Inactive Paths" ? <IconCheck /> : <IconTrash />}
                    title={mypathsMenu === "Inactive Paths" ? "Reactivate Path" : "Delete Path"}
                    desc={mypathsMenu === "Inactive Paths" ? "Restore this path to active" : "Permanently remove this path"}
                    onClick={() => setPathActionStep(2)}
                  />
                  <ActionCard color="purple" icon={<IconEye />} title="View Path" desc="Open the complete path page"
                    onClick={() => { localStorage.setItem("selectedPathId", selectedPathId); navigate(`/dashboard/path/${selectedPathId}`); }} />
                  <ActionCard color="teal" icon={<IconShop />} title="Marketplace" desc="Attach services to steps"
                    onClick={() => { fetchMarketplaceItems(); setEditPaths("marketplace_steps"); }} />
                </div>
              )}

              {/* MAIN ACTIONS — PENDING */}
              {pathActionStep === 1 && editPaths === "default" && mypathsMenu === "Pending Paths" && (
                <div className="pp-cards-grid">
                  <ActionCard color="green" icon={<IconCheck />} title="Approve Path" desc="Publish this path to users" onClick={() => setPathActionStep(5)} />
                  <ActionCard color="amber" icon={<IconX />} title="Reject Path" desc="Send back for revisions" onClick={() => setPathActionStep(6)} />
                  <ActionCard color="blue" icon={<IconPencil />} title="Edit Path" desc="Modify steps and structure" onClick={() => setPathActionStep(4)} />
                  <ActionCard color="purple" icon={<IconEye />} title="View Path" desc="Open the complete path page"
                    onClick={() => { localStorage.setItem("selectedPathId", selectedPathId); navigate(`/dashboard/path/${selectedPathId}`); }} />
                  <ActionCard color="teal" icon={<IconShop />} title="Marketplace" desc="Attach services to steps"
                    onClick={() => { fetchMarketplaceItems(); setEditPaths("marketplace_steps"); }} />
                </div>
              )}

              {/* DELETE / REACTIVATE CONFIRM */}
              {pathActionStep === 2 && (
                <div className="pp-confirm">
                  <div className={`pp-confirm-icon ${mypathsMenu === "Inactive Paths" ? "pp-confirm-icon--green" : "pp-confirm-icon--red"}`}>
                    {mypathsMenu === "Inactive Paths"
                      ? <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5" /></svg>
                      : <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0h10" /></svg>}
                  </div>
                  <h3>{mypathsMenu === "Inactive Paths" ? "Reactivate this path?" : "Delete this path?"}</h3>
                  <p className="pp-confirm-msg">
                    <strong>"{selectedPath?.nameOfPath}"</strong> will be {mypathsMenu === "Inactive Paths" ? "restored and visible to users." : "permanently removed. This cannot be undone."}
                  </p>
                  <div className="pp-confirm-actions">
                    <button className={`pp-btn ${mypathsMenu === "Inactive Paths" ? "pp-btn--green" : "pp-btn--red"}`}
                      onClick={() => mypathsMenu === "Inactive Paths" ? reactivatePath() : deletePath()}>
                      {actionLoading ? "Processing..." : mypathsMenu === "Inactive Paths" ? "Yes, Reactivate" : "Yes, Delete"}
                    </button>
                    <button className="pp-btn pp-btn--ghost" onClick={() => setPathActionStep(1)}>Cancel</button>
                  </div>
                </div>
              )}

              {/* SUCCESS */}
              {pathActionStep === 3 && (
                <div className="pp-success">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10" /><path d="M8 12l3 3 6-6" />
                  </svg>
                  <h3>Done!</h3>
                  <p>Action completed successfully</p>
                </div>
              )}

              {/* EDIT OPTIONS */}
              {pathActionStep === 4 && editPaths === "default" && (
                <div className="pp-option-list">
                  <p className="pp-section-label">What would you like to edit?</p>
                  <OptionRow iconColor="blue"
                    icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 6h13" /><path d="M8 12h13" /><path d="M8 18h13" /><circle cx="3" cy="6" r="1" fill="currentColor" /><circle cx="3" cy="12" r="1" fill="currentColor" /><circle cx="3" cy="18" r="1" fill="currentColor" /></svg>}
                    title="Edit Steps" sub="Add, remove, or reorder steps in this path"
                    onClick={() => setEditPaths("Edit steps")}
                  />
                </div>
              )}

              {/* STEP MANAGEMENT */}
              {editPaths === "Edit steps" && (
                <div className="pp-option-list">
                  <p className="pp-section-label">Step Management</p>
                  <OptionRow iconColor="green"
                    icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>}
                    title="Add New Step" sub="Insert a step from your library" onClick={() => setEditPaths("add_step")}
                  />
                  <OptionRow iconColor="red"
                    icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>}
                    title="Remove Step" sub="Delete a step from this path" onClick={() => setEditPaths("remove_step")}
                  />
                  <OptionRow iconColor="amber"
                    icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>}
                    title="Reorder Steps" sub="Drag and drop to change sequence" onClick={() => setEditPaths("reorder_step")}
                  />
                </div>
              )}

              {/* ADD STEP */}
              {editPaths === "add_step" && (
                <div className="pp-selector">
                  <p className="pp-section-label">Select step to add</p>
                  <div className="pp-selector-list">
                    {partnerStepsData?.map(item => {
                      const added = selectedPath?.StepDetails?.some(s => s._id === item._id);
                      return (
                        <div key={item._id} className={`pp-selector-item ${added ? "pp-selector-item--disabled" : ""}`}
                          onClick={() => { if (!added) { setEditPaths("add_sub_step"); setStepId(item._id); } }}>
                          <div className="pp-selector-item-body">
                            <strong>{item?.name}</strong>
                            {item?.description && <p>{item.description.substring(0, 110)}{item.description.length > 110 ? '...' : ''}</p>}
                            <code>{item?._id}</code>
                          </div>
                          <span className={`pp-tag ${added ? "pp-tag--gray" : "pp-tag--blue"}`}>{added ? "Already Added" : "Select →"}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SELECT BACKUP PATH */}
              {editPaths === "add_sub_step" && (
                <div className="pp-selector">
                  <p className="pp-section-label">Select backup path</p>
                  <div className="pp-selector-list">
                    {backupPathData?.map(item => (
                      <div key={item._id} className="pp-selector-item"
                        onClick={() => { setEditPaths("show_all_paths"); setBackupPathId(item._id); }}>
                        <div className="pp-selector-item-body">
                          <strong>{item?.nameOfPath}</strong>
                          {item?.description && <p>{item.description.substring(0, 110)}{item.description.length > 110 ? '...' : ''}</p>}
                          <code>{item?._id}</code>
                        </div>
                        <span className="pp-tag pp-tag--indigo">Select →</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CHOOSE POSITION */}
              {editPaths === "show_all_paths" && (
                <div className="pp-position">
                  <p className="pp-section-label">Choose insertion position</p>
                  <div className="pp-position-list">
                    {selectedPath?.StepDetails?.map((item, index) => (
                      <React.Fragment key={item._id}>
                        <div className="pp-position-step">
                          <span className="pp-step-num">{index + 1}</span>
                          <span className="pp-step-name">{item.name}</span>
                        </div>
                        <button className="pp-insert-btn" onClick={() => handlePlace(selectedPath, index + 1)}>
                          + Insert Here
                        </button>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              )}

              {/* REMOVE STEP */}
              {editPaths === "remove_step" && (
                <div className="pp-selector">
                  <p className="pp-section-label">Select step to remove</p>
                  <div className="pp-selector-list">
                    {selectedPath?.StepDetails?.filter(item => item?.name)?.map(item => (
                      <div key={item._id} className="pp-selector-item pp-selector-item--remove"
                        onClick={() => handledeletePathPosition(selectedPath, item._id)}>
                        <div className="pp-selector-item-body">
                          <strong>{item?.name}</strong>
                          {item?.description && <p>{item.description.substring(0, 110)}{item.description.length > 110 ? '...' : ''}</p>}
                          <code>{item?._id}</code>
                        </div>
                        <span className="pp-tag pp-tag--red">Remove</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* REORDER STEPS */}
              {editPaths === "reorder_step" && (
                <div className="pp-reorder">
                  <p className="pp-section-label">Drag to reorder</p>
                  <div className="pp-reorder-list">
                    {Array.isArray(selectedPath?.StepDetails) && selectedPath.StepDetails.length > 0 ? (
                      <Draggable onPosChange={(cur, nxt) => { if (cur !== nxt) getChangedPos(cur, nxt); }}>
                        {selectedPath.StepDetails.map((item, idx) => (
                          <div key={item._id} className="pp-reorder-item">
                            <div className="pp-reorder-handle">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
                                <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
                                <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
                              </svg>
                            </div>
                            <span className="pp-reorder-num">{idx + 1}</span>
                            <div className="pp-reorder-content">
                              <strong>{item.name}</strong>
                              {item.description && <span>{item.description.substring(0, 80)}{item.description.length > 80 ? '...' : ''}</span>}
                            </div>
                          </div>
                        ))}
                      </Draggable>
                    ) : (
                      <div className="pp-empty">No steps to reorder</div>
                    )}
                  </div>
                </div>
              )}

              {/* APPROVE CONFIRM */}
              {pathActionStep === 5 && (
                <div className="pp-confirm">
                  <div className="pp-confirm-icon pp-confirm-icon--green">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5" /></svg>
                  </div>
                  <h3>Approve this path?</h3>
                  <p className="pp-confirm-msg">This path will become visible to all users.</p>
                  <div className="pp-confirm-actions">
                    <button className="pp-btn pp-btn--green" onClick={handleApprovePath}>{actionLoading ? "Processing..." : "Yes, Approve"}</button>
                    <button className="pp-btn pp-btn--ghost" onClick={() => setPathActionStep(1)}>Cancel</button>
                  </div>
                </div>
              )}

              {/* REJECT CONFIRM */}
              {pathActionStep === 6 && (
                <div className="pp-confirm">
                  <div className="pp-confirm-icon pp-confirm-icon--red">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                  </div>
                  <h3>Reject this path?</h3>
                  <p className="pp-confirm-msg">It will be moved to drafts for revision.</p>
                  <div className="pp-confirm-actions">
                    <button className="pp-btn pp-btn--red" onClick={handleRejectPath}>{actionLoading ? "Processing..." : "Yes, Reject"}</button>
                    <button className="pp-btn pp-btn--ghost" onClick={() => setPathActionStep(1)}>Cancel</button>
                  </div>
                </div>
              )}

              {/* MARKETPLACE: SELECT STEP */}
              {editPaths === "marketplace_steps" && (
                <div className="pp-selector">
                  <p className="pp-section-label">Select step to manage services</p>
                  <div className="pp-selector-list">
                    {selectedPath?.StepDetails?.filter(s => s?.name)?.map(step => (
                      <div key={step._id} className="pp-selector-item"
                        onClick={() => {
                          setMarketStepId(step._id);
                          fetchAttachedServices(step._id);
                          setEditPaths("marketplace_attach");
                        }}>
                        <div className="pp-selector-item-body">
                          <strong>{step.name}</strong>
                          {step.description && <p>{step.description.substring(0, 80)}{step.description.length > 80 ? '...' : ''}</p>}
                        </div>
                        <span className="pp-tag pp-tag--teal">Manage →</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* MARKETPLACE: ATTACH / DETACH */}
              {editPaths === "marketplace_attach" && (
                <div>
                  {/* Already attached */}
                  {attachedServices.length > 0 && (
                    <div style={{ marginBottom: 20 }}>
                      <p className="pp-section-label">Currently attached</p>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {attachedServices.map(svc => {
                          const re = roleEmoji[svc.role?.toLowerCase()] || "🛍";
                          const rc = roleColor[svc.role?.toLowerCase()] || "#64748b";
                          return (
                            <div key={svc._id} className="pp-market-item">
                              <div className="pp-market-item-info">
                                <div className="pp-market-emoji">{re}</div>
                                <div>
                                  <strong>{svc.name}</strong>
                                  <span style={{ color: rc, fontWeight: 600, fontSize: "0.7rem", textTransform: "uppercase", display: "block" }}>{svc.role}</span>
                                </div>
                              </div>
                              <button className="pp-market-remove-btn" onClick={() => detachMarketService(svc)}>
                                {actionLoading ? "..." : "Remove"}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Available to attach */}
                  <p className="pp-section-label">Add from marketplace</p>
                  {marketplaceLoading ? (
                    <div style={{ padding: "16px 0", textAlign: "center", color: "#94a3b8", fontSize: "0.85rem" }}>Loading...</div>
                  ) : (
                    <div className="pp-selector-list">
                      {marketplaceItems
                        .filter(m => !attachedServices.some(a => a._id === m._id))
                        .map(item => {
                          const re = roleEmoji[item.role?.toLowerCase()] || "❓";
                          const rc = roleColor[item.role?.toLowerCase()] || "#64748b";
                          // Check if this item already belongs to this step via step_id
                          const alreadyOnThisStep = item.step_id && item.step_id.toString() === marketStepId.toString();
                          return (
                            <div key={item._id}
                              className={`pp-selector-item ${alreadyOnThisStep ? "pp-selector-item--disabled" : ""}`}
                              onClick={() => { if (!alreadyOnThisStep) attachMarketService(item); }}>
                              <div className="pp-selector-item-body" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <div className="pp-market-emoji">{re}</div>
                                <div>
                                  <strong>{item.name}</strong>
                                  <span style={{ color: rc, fontWeight: 600, fontSize: "0.7rem", textTransform: "uppercase", display: "block" }}>{item.role}</span>
                                </div>
                              </div>
                              {alreadyOnThisStep
                                ? <span className="pp-tag pp-tag--gray">Already Added</span>
                                : <span className="pp-tag pp-tag--green">Attach →</span>
                              }
                            </div>
                          );
                        })}
                      {marketplaceItems.filter(m => !attachedServices.some(a => a._id === m._id)).length === 0 && (
                        <div className="pp-empty">All marketplace items are attached</div>
                      )}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </>
      )}

      {/* STEP ACTION POPUP */}
      {stepActionEnabled && (
        <>
          <div className="pp-overlay" onClick={() => { setStepActionEnabled(false); setStepActionStep(1); setSelectedStepId(""); }} />
          <div className="admin-acc-popular1">
            <div className="admin-acc-popular-top" style={{ display: stepActionStep === 3 ? "none" : "" }}>
              <div className="admin-acc-popular-head">My Step Actions</div>
              <div className="admin-acc-popular-img-box" style={{ cursor: "pointer" }}
                onClick={() => { setStepActionEnabled(false); setStepActionStep(1); setSelectedStepId(""); }}>
                <img className="admin-acc-popular-img" src={closepop} alt="" />
              </div>
            </div>
            {stepActionStep === 1 && (
              <div style={{ marginTop: "3rem" }}>
                <div className="admin-acc-step-box" onClick={() => setStepActionStep(4)}>Edit Services</div>
                <div className="admin-acc-step-box">Edit Step</div>
                <div className="admin-acc-step-box" onClick={() => deleteStep()}>Delete step</div>
              </div>
            )}
            {stepActionStep === 2 && (
              <div style={{ marginTop: "3rem" }}>
                <div className="admin-acc-step-box" onClick={() => deleteStep()}>Confirm and delete</div>
                <div className="admin-goBack2" onClick={() => setStepActionStep(1)}>Go Back</div>
              </div>
            )}
            {stepActionStep === 3 && <div className="admin-success-box1">Step Successfully Deleted</div>}
            {stepActionStep === 4 && (
              <div className="admin-acc-mt-div">
                <div className="admin-acc-sub-text">What do you want to do?</div>
                <div className="admin-acc-scroll-div">
                  <div className="admin-acc-step-box4" style={{ flexDirection: 'column', alignItems: 'flex-start' }} onClick={() => setStepActionStep(5)}>Add a Service</div>
                  <div className="admin-acc-step-box4" style={{ flexDirection: 'column', alignItems: 'flex-start' }} onClick={() => setStepActionStep(6)}>Remove a Service</div>
                </div>
                <div className="admin-goBack3" onClick={() => setStepActionStep(1)}>Go Back</div>
              </div>
            )}
            {stepActionStep === 5 && (
              <div className="admin-acc-mt-div">
                <div className="admin-acc-sub-text">Which service do you want to add?</div>
                <div className="admin-acc-scroll-div">
                  {allServicesToAdd?.map(item => (
                    <div key={item?._id}
                      className={selectedServices.includes(item?._id) ? 'admin-acc-step-box4-selected' : "admin-acc-step-box4"}
                      style={{ flexDirection: 'column', alignItems: 'flex-start' }}
                      onClick={() => handleSelectServicesForStep(item?._id)}>
                      <div>{item?.name}</div>
                      <div style={{ fontSize: '12px', fontWeight: 400, paddingTop: '5px' }}>{item?._id}</div>
                    </div>
                  ))}
                </div>
                <div className="admin-save-Btn" style={{ opacity: selectedServices.length > 0 ? 1 : 0.3 }}
                  onClick={() => selectedServices.length > 0 && addServicesToStep()}>
                  Add Selected Services
                </div>
                <div className="admin-goBack3" onClick={() => setStepActionStep(1)}>Go Back</div>
              </div>
            )}
            {stepActionStep === 6 && (
              <div className="admin-acc-mt-div">
                <div className="admin-acc-sub-text">Which service do you want to remove?</div>
                <div className="admin-acc-scroll-div">
                  {allServicesToRemove?.serviceDetails?.map(item => (
                    <div key={item?._id} className="admin-acc-step-box4"
                      style={{ flexDirection: 'column', alignItems: 'flex-start' }}
                      onClick={() => removeServiceFromStep(item?._id)}>
                      <div>{item?.name}</div>
                      <div style={{ fontSize: '12px', fontWeight: 400, paddingTop: '5px' }}>{item?._id}</div>
                    </div>
                  ))}
                </div>
                <div className="admin-goBack3" onClick={() => setStepActionStep(1)}>Go Back</div>
              </div>
            )}
            {actionLoading && (
              <div className="admin-popularlogo">
                <img className="admin-popularlogoimg" src={lg1} alt="" />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default MyPathsAdmin;