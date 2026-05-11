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
import { useNavigate, useLocation } from "react-router-dom";
import pathIcon from '../../assets/images/assets/naavi-icon2.webp';
const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const MyPathsAdmin = ({ search, admin, fetchAllServicesAgain, stepDataPage }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { sideNav, setsideNav } = useStore();
  let userDetails = JSON.parse(localStorage.getItem("adminuser"));
  const { setCurrentStepData, setCurrentStepDataLength, mypathsMenu, setMypathsMenu } = useCoinContextData();
  const [pathChangeRequests, setPathChangeRequests] = useState({}); // { [pathId]: [...changeRequests] }
  const [changeRequestsLoading, setChangeRequestsLoading] = useState({});

  const [adminReplyTexts, setAdminReplyTexts] = useState({});
  const [adminReplyLoading, setAdminReplyLoading] = useState({});
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
  const [expandedHistoryId, setExpandedHistoryId] = useState(null);
  const [pendingPopup, setPendingPopup] = useState(null); // { type: 'approve'|'request'|'reject'|'compare', pathId, path }
  const [rejectChecklist, setRejectChecklist] = useState([]);
  const [rejectNote, setRejectNote] = useState("");
  const [rejectNoteError, setRejectNoteError] = useState(false);
  // ── Marketplace states ────────────────────────────────────────
  const [marketLayer, setMarketLayer] = useState("");
  const [marketplaceItems, setMarketplaceItems] = useState([]);       // all items for this layer
  const [marketplaceLoading, setMarketplaceLoading] = useState(false);
  const [attachedServices, setAttachedServices] = useState([]);       // items attached to this step+layer
  const [marketStepId, setMarketStepId] = useState("");
  const [marketStepData, setMarketStepData] = useState(null);

  // ── Marketplace create-listing form states ────────────────────
  const [mpRole, setMpRole] = useState("");
  const [mpName, setMpName] = useState("");
  const [mpAccess, setMpAccess] = useState("Free");
  const [mpCost, setMpCost] = useState("");
  const [mpGoal, setMpGoal] = useState("");
  const [mpOutcomes, setMpOutcomes] = useState("");
  const [mpDuration, setMpDuration] = useState("");
  const [mpFeatures, setMpFeatures] = useState("");
  const [mpDiscount, setMpDiscount] = useState("");
  const [otherIssue, setOtherIssue] = useState("");
  const [vcrActiveTab, setVcrActiveTab] = useState("all");
  const [vcrOpenThreads, setVcrOpenThreads] = useState({});
  const [vcrSelectedRequest, setVcrSelectedRequest] = useState(null);

  // ─── layerConfig — reads actual names/descriptions from the step document ───
  const getLayerConfig = (stepData) => ({
    macro: {
      label: "Macro",
      color: "#7c3aed",
      bg: "#faf5ff",
      border: "#e9d5ff",
      viewName: stepData?.macro_name || "Macro View",
      viewDesc: stepData?.macro_description || "High-Level Pathway Services",
    },
    micro: {
      label: "Micro",
      color: "#0891b2",
      bg: "#ecfeff",
      border: "#a5f3fc",
      viewName: stepData?.micro_name || "Micro View",
      viewDesc: stepData?.micro_description || "Mid-Level Support Services",
    },
    nano: {
      label: "Nano",
      color: "#d97706",
      bg: "#fffbeb",
      border: "#fde68a",
      viewName: stepData?.nano_name || "Nano View",
      viewDesc: stepData?.nano_description || "Granular Task-Level Services",
    },
  });

  // ─── Fetchers ────────────────────────────────────────────────
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
    // Fetch both waitingforapproval AND changesrequested paths for Pending Paths tab
    Promise.all([
      axios.get(`${BASE_URL}/api/paths/get?status=waitingforapproval`),
      axios.get(`${BASE_URL}/api/paths/get?status=changesrequested`),
    ]).then(([res1, res2]) => {
      const combined = [
        ...(res1.data?.data || []),
        ...(res2.data?.data || []),
      ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setPartnerPathData(combined);
      setLoading(false);
    }).catch(() => setLoading(false));
  };
  const getAllSteps = () => {
    axios.get(`${BASE_URL}/api/steps/get?status=active`).then(({ data }) => {
      setPartnerStepsData(data?.data);
    });
  };

  /**
   * fetchMarketplaceData — loads:
   *  1. Items attached to this step+layer  (via /marketplace/step/:id?layer=X)
   *  2. ALL items for this layer            (via /marketplace/admin/get-all?layer=X)
   *     The "available" list is derived in the render by filtering out attached ones.
   */

  const fetchChangeRequests = (pathId) => {
    if (pathChangeRequests[pathId]) return; // already loaded
    setChangeRequestsLoading(prev => ({ ...prev, [pathId]: true }));
    axios.get(`${BASE_URL}/api/paths/viewpath/${pathId}`)
      .then(({ data }) => {
        if (data?.status) {
          setPathChangeRequests(prev => ({
            ...prev,
            [pathId]: data.data?.changeRequests || []
          }));
        }
      })
      .catch(() => { })
      .finally(() => setChangeRequestsLoading(prev => ({ ...prev, [pathId]: false })));
  };


  const sendAdminReply = async (pathId, crId) => {
    const msg = (adminReplyTexts[crId] || "").trim();
    if (!msg) return;
    setAdminReplyLoading(prev => ({ ...prev, [crId]: true }));
    setAdminReplyTexts(prev => ({ ...prev, [crId]: "" })); // clear input immediately
    try {
      await axios.patch(`${BASE_URL}/api/paths/reply/${pathId}/${crId}`, {
        from: "admin",
        message: msg,
        adminEmail: userDetails?.email || "",
      });
      // Always do a fresh fetch — bypass cache entirely
      const { data } = await axios.get(`${BASE_URL}/api/paths/viewpath/${pathId}`);
      if (data?.status) {
        setPathChangeRequests(prev => ({
          ...prev,
          [pathId]: data.data?.changeRequests || [],
        }));
      }
    } catch (err) {
      console.error("Admin reply error:", err);
      setAdminReplyTexts(prev => ({ ...prev, [crId]: msg })); // restore on error
    } finally {
      setAdminReplyLoading(prev => ({ ...prev, [crId]: false }));
    }
  };

  const fetchMarketplaceData = (stepId, layer) => {
    const sid = stepId || marketStepId;
    const lay = layer || marketLayer;
    if (!sid || !lay) return;

    setMarketplaceLoading(true);

    // 1. Attached to this step+layer
    axios
      .get(`${BASE_URL}/api/marketplace/step/${sid}?layer=${lay}`)
      .then(({ data }) => {
        setAttachedServices(data?.status ? data.data : []);
      })
      .catch(() => setAttachedServices([]));

    // 2. ALL items for this layer (we compute "available" = all minus attached in render)
    axios
      .get(`${BASE_URL}/api/marketplace/admin/get-all?layer=${lay}`)
      .then(({ data }) => {
        setMarketplaceItems(data?.status ? data.data : []);
        setMarketplaceLoading(false);
      })
      .catch(() => {
        setMarketplaceItems([]);
        setMarketplaceLoading(false);
      });
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

  // ── One-time setup: backup paths, steps, services ──
  useEffect(() => {
    axios.get(`${BASE_URL}/api/paths/get?status=active`).then(({ data }) => {
      if (data.status) setBackupPathData(data?.data);
    });
    getAllSteps();
    axios.get(`${BASE_URL}/api/services/getservices?status=active`).then(({ data }) => {
      if (data.status) setAllServicesToAdd(data.data);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Read URL tab on mount → set menu + fetch correct data ──
  useEffect(() => {
    const tab = new URLSearchParams(location.search).get("tab");
    if (tab === "inactive") {
      setMypathsMenu("Inactive Paths");
      getInactivePath();
    } else if (tab === "pending") {
      setMypathsMenu("Pending Paths");
      getNewPath();
    } else {
      setMypathsMenu("Paths");
      getAllPaths();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  useEffect(() => {
    if (pathActionEnabled || stepActionEnabled) document.body.classList.add("admin-popup-open");
    else document.body.classList.remove("admin-popup-open");
    return () => document.body.classList.remove("admin-popup-open");
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

  // ─── Reset ───────────────────────────────────────────────────
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
    setMarketStepData(null);
    setAttachedServices([]);
    setMarketplaceItems([]);
    setMarketLayer("");
    setMpRole(""); setMpName(""); setMpAccess("Free"); setMpCost("");
    setMpGoal(""); setMpOutcomes(""); setMpDuration("");
    setMpFeatures(""); setMpDiscount("");
  };

  // ─── Path Actions ─────────────────────────────────────────────
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


  const REJECT_ISSUES = [
    "Price needs to be reduced",
    "Path description is too vague",
    "Steps are incomplete",
    "Duration is unrealistic",
    "Images / media missing",
    "Target audience not specified",
    <input
      type="text"
      placeholder="Other (type here)"
      className="popup-note-area"
      value={otherIssue}                          // ← was rejectNote
      onChange={(e) => setOtherIssue(e.target.value)}  // ← was setRejectNote
    />
  ];

  const toggleRejectCheck = (issue) => {
    setRejectChecklist(prev =>
      prev.includes(issue) ? prev.filter(i => i !== issue) : [...prev, issue]
    );
  };

  const closePendingPopup = () => {
    setPendingPopup(null);
    setRejectChecklist([]);
    setRejectNote("");
    setOtherIssue("");
    setRejectNoteError(false);
    setVcrSelectedRequest(null); // ← add this
  };




  const handleRequestChanges = () => {
    if (!rejectNote.trim()) { setRejectNoteError(true); return; }
    setActionLoading(true);

    const allIssues = [
      ...rejectChecklist,
      ...(otherIssue.trim() ? [otherIssue.trim()] : []),
    ];

    axios.put(`${BASE_URL}/api/paths/requestchanges/${pendingPopup?.pathId}`, {
      issues: allIssues,
      adminNote: rejectNote,
      adminEmail: userDetails?.email || "",
    })
      .then(({ data }) => {
        if (data.status) {
          getNewPath();
          closePendingPopup();
        }
      })
      .catch((err) => {
        console.error("Request changes error:", err);
      })
      .finally(() => {
        setActionLoading(false);
      });
  };


  const handleFinalReject = () => {
    if (!rejectNote.trim()) { setRejectNoteError(true); return; }
    setActionLoading(true);
    axios.put(`${BASE_URL}/api/paths/updatepath/${pendingPopup?.pathId}`, {
      status: "draft",
      review_notes: rejectNote.trim(),
    }).then(({ data }) => {
      if (data.status) { getNewPath(); setActionLoading(false); closePendingPopup(); }
    }).catch(() => setActionLoading(false));
  };

  const handleApproveConfirm = () => {
    setActionLoading(true);
    axios.put(`${BASE_URL}/api/paths/updatepath/${pendingPopup?.pathId}`, { status: "active" }).then(({ data }) => {
      if (data.status) { getNewPath(); setActionLoading(false); closePendingPopup(); }
    }).catch(() => setActionLoading(false));
  };

  const STATIC_HISTORY = [
    { type: "submitted", label: "Partner submitted path", sub: "8 Mar 2026, 9:00 AM" },
    { type: "request", label: "Round 1 — Changes requested", sub: "Issues: Price too high, Steps incomplete · 9 Mar 2026" },
    { type: "resubmit", label: "Round 2 — Partner resubmitted", sub: "10 Mar 2026, 10:49 AM · Under review" },
  ];

  // Static compare data
  const STATIC_COMPARE = {
    old: { price: "₹999", steps: "2 steps", description: "Short intro only, no details about curriculum.", duration: "Not specified" },
    new: { price: "₹999", steps: "2 steps", description: "Full curriculum breakdown added with subject-wise goals for Grade 11 students.", duration: "6 months" },
    checklist: [
      { label: "Price needs to be reduced", fixed: false },
      { label: "Steps are incomplete", fixed: false },
      { label: "Path description too vague", fixed: true },
      { label: "Duration unrealistic", fixed: true },
    ]
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

  // ─── Marketplace Actions ──────────────────────────────────────

  /**
   * attachMarketService — links an existing marketplace item to this step+layer.
   * Updates: marketplace item's step_id + step's [layer]_marketplace array.
   */
  const attachMarketService = (item) => {
    setActionLoading(true);

    const fieldKey = `${marketLayer}_marketplace`;
    const currentIds = (marketStepData?.[fieldKey] || []).map(id => id.toString());

    if (currentIds.includes(item._id.toString())) {
      setActionLoading(false);
      return;
    }

    const updatedIds = [...currentIds, item._id.toString()];

    // 1. Update the step's [layer]_marketplace array
    axios
      .put(`${BASE_URL}/api/steps/update/${marketStepId}`, { [fieldKey]: updatedIds })
      .then(({ data }) => {
        if (data?.status) {
          setMarketStepData(prev => ({ ...prev, [fieldKey]: updatedIds }));

          // 2. Update the marketplace item's step_id
          axios.patch(`${BASE_URL}/api/marketplace/link-step`, {
            item_id: item._id,
            step_id: marketStepId,
          }).then(() => {
            // 3. Move item from "available" to "attached" in UI
            setAttachedServices(prev => [...prev, item]);
            setMarketplaceItems(prev =>
              prev.map(m => m._id === item._id ? { ...m, step_id: marketStepId } : m)
            );
          });
        }
        setActionLoading(false);
      })
      .catch(() => setActionLoading(false));
  };

  /**
   * detachMarketService — removes a marketplace item from this step+layer.
   * Updates: marketplace item's step_id → null + step's [layer]_marketplace array.
   */
  const detachMarketService = (item) => {
    setActionLoading(true);

    const fieldKey = `${marketLayer}_marketplace`;
    const currentIds = (marketStepData?.[fieldKey] || []).map(id => id.toString());
    const updatedIds = currentIds.filter(id => id !== item._id.toString());

    // 1. Update the step's [layer]_marketplace array
    axios
      .put(`${BASE_URL}/api/steps/update/${marketStepId}`, { [fieldKey]: updatedIds })
      .then(({ data }) => {
        if (data?.status) {
          setMarketStepData(prev => ({ ...prev, [fieldKey]: updatedIds }));

          // 2. Nullify the marketplace item's step_id
          axios.patch(`${BASE_URL}/api/marketplace/link-step`, {
            item_id: item._id,
            step_id: null,
          }).then(() => {
            // 3. Move item from "attached" back to full list in UI
            setAttachedServices(prev => prev.filter(s => s._id !== item._id));
            setMarketplaceItems(prev =>
              prev.map(m => m._id === item._id ? { ...m, step_id: null } : m)
            );
          });
        }
        setActionLoading(false);
      })
      .catch(() => setActionLoading(false));
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
      "marketplace_layer": "marketplace_steps",
      "marketplace_attach": "marketplace_layer",
      "marketplace_create": "marketplace_attach",
    };
    if (editPaths !== "default") setEditPaths(backMap[editPaths] || "default");
    else setPathActionStep(1);
  };

  const showBack = pathActionStep > 1 || editPaths !== "default";

  const getModalTitle = () => {
    if (["Edit steps", "add_step", "add_sub_step", "show_all_paths", "remove_step", "reorder_step"].includes(editPaths)) return "Edit Path";
    if (["marketplace_steps", "marketplace_layer", "marketplace_attach", "marketplace_create"].includes(editPaths)) return "Marketplace";
    if (pathActionStep === 5) return "Approve Path";
    if (pathActionStep === 6) return "Reject Path";
    if (pathActionStep === 2) return mypathsMenu === "Inactive Paths" ? "Reactivate Path" : "Delete Path";
    if (pathActionStep === 3) return "Done";
    if (pathActionStep === 4) return "Edit Path";
    return "Path Actions";
  };

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

  // Convenience: current layer config object
  const currentLayerCfg = marketStepData ? getLayerConfig(marketStepData)[marketLayer] : null;

  // Derived: items NOT yet attached to this step (available to attach)
  const attachedIds = new Set(attachedServices.map(s => s._id?.toString()));
  const availableItems = marketplaceItems.filter(
    item => !attachedIds.has(item._id?.toString())
  );

  return (
    <div className="admin-mypaths">

      {/* TOPBAR */}
      <div className="admin-paths-topbar">
        <div className="admin-paths-tabs">
          <button
            className={`paths-tab ${mypathsMenu === "Paths" ? "active" : ""}`}
            onClick={() => {
              setMypathsMenu("Paths");
              setViewPathEnabled(false);
              setViewPathData([]);
              getAllPaths();                          // ← add this
              navigate("/admin/dashboard/paths?tab=active");
            }}>
            {admin ? "Active Paths" : "Paths"}
          </button>
          {admin && (
            <button
              className={`paths-tab ${mypathsMenu === "Pending Paths" ? "active" : ""}`}
              onClick={() => {
                setMypathsMenu("Pending Paths");
                setViewPathEnabled(false);
                setViewPathData([]);
                getNewPath();                          // ← add this
                navigate("/admin/dashboard/paths?tab=pending");
              }}>
              Pending Paths
            </button>
          )}
          {admin && (
            <button
              className={`paths-tab ${mypathsMenu === "Inactive Paths" ? "active" : ""}`}
              onClick={() => {
                setMypathsMenu("Inactive Paths");
                setViewPathEnabled(false);
                setViewPathData([]);
                getInactivePath();                     // ← add this
                navigate("/admin/dashboard/paths?tab=inactive");
              }}>
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
            <CurrentStep
              productDataArray={productDataArray}
              selectedPathId={selectedPathId}
              showSelectedPath={showSelectedPath}
              selectedPath={selectedPath}
            />
          </div>
        ) : viewPathEnabled ? (
          <div className="admin-viewpath-container">
            <div className="admin-viewpath-top-area">
              <div>Your Selected Path:</div>
              {viewPathLoading ? <Skeleton width={150} height={30} /> : (
                <div className="admin-viewpath-bold-text">
                  {viewPathData && Object.keys(viewPathData).length > 0 ? viewPathData?.destination_institution : ""}
                </div>
              )}
              {viewPathLoading ? <Skeleton width={500} height={20} /> : (
                <div className="admin-viewpath-des">
                  {viewPathData && Object.keys(viewPathData).length > 0 ? viewPathData?.description : ""}
                </div>
              )}
              <div className="admin-viewpath-goBack-div" onClick={() => setViewPathEnabled(false)}>Go Back</div>
            </div>
            <div className="admin-viewpath-steps-area">
              {viewPathLoading
                ? Array(6).fill("").map((_, i) => (
                  <div className="admin-viewpath-each-j-step" key={i}>...</div>
                ))
                : viewPathData?.StepDetails?.map((e, i) => (
                  <div
                    key={i}
                    className="admin-viewpath-each-j-step enhanced-step-card"
                    onClick={() => {
                      setShowSelectedPath(e);
                      setProductKeys(e?.product_ids);
                    }}
                  >
                    {/* STEP HEADER */}
                    <div className="step-top">
                      <div className="step-icon">
                        <img src={e?.icon} alt="" />
                      </div>
                      <div className="step-info">
                        <div className="step-title">{i + 1}. {e?.name}</div>
                        <div className="step-desc">{e?.description}</div>
                      </div>
                    </div>

                    {/* 🔥 3 VIEW CARDS */}
                    <div className="step-views">

                      {/* MACRO */}
                      <div className="view-card macro">
                        <div className="view-label">Macro</div>
                        <div className="view-name">
                          {e?.macro_name || "Macro View"}
                        </div>
                        <div className="view-desc">
                          {e?.macro_description || "High level overview"}
                        </div>
                      </div>

                      {/* MICRO */}
                      <div className="view-card micro">
                        <div className="view-label">Micro</div>
                        <div className="view-name">
                          {e?.micro_name || "Micro View"}
                        </div>
                        <div className="view-desc">
                          {e?.micro_description || "Mid level details"}
                        </div>
                      </div>

                      {/* NANO */}
                      <div className="view-card nano">
                        <div className="view-label">Nano</div>
                        <div className="view-name">
                          {e?.nano_name || "Nano View"}
                        </div>
                        <div className="view-desc">
                          {e?.nano_description || "Detailed execution"}
                        </div>
                      </div>

                    </div>

                    {/* COST (optional) */}
                    {e?.cost && (
                      <div className="step-cost">
                        {e?.cost}
                      </div>
                    )}
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
              : filteredPartnerPathData?.map((path, i) => (
                mypathsMenu === "Pending Paths" ? (
                  <div className="pending-path-card" key={i}>
                    <div className="pending-card-top">
                      <div className="pending-card-left">
  <div className="admin-icon-box">
    <img src={pathIcon} alt="path" style={{ width: "14px", height: "14px", objectFit: "contain" }} />
  </div>
  <span className="pending-path-name">{path?.nameOfPath}</span>
</div>
                      <span className="pending-date">
                        {path?.createdAt ? new Date(path.createdAt).toLocaleString("en-IN", {
                          day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                        }) : ""}
                      </span>
                    </div>

                    <p className="pending-desc">
                      {expandedRows[path?._id]
                        ? path?.description
                        : (path?.description?.length > 160 ? path?.description?.substring(0, 160) + "..." : path?.description)}
                      {path?.description?.length > 160 && (
                        <span className="path-desc-toggle"
                          onClick={() => setExpandedRows(prev => ({ ...prev, [path._id]: !prev[path._id] }))}>
                          {expandedRows[path?._id] ? " Read Less" : " Read More"}
                        </span>
                      )}
                    </p>

                    <div className="pending-action-row">
                      <button className="pab pab--review"
                        onClick={() => { localStorage.setItem("selectedPathId", path?._id); navigate(`/dashboard/path/${path?._id}`); }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                        View steps
                      </button>
                      <button className="pab pab--approve"
                        onClick={() => setPendingPopup({ type: "approve", pathId: path?._id, path: path })}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
                        Approve
                      </button>
                      <button className="pab pab--request"
                        onClick={() => { setRejectChecklist([]); setRejectNote(""); setRejectNoteError(false); setPendingPopup({ type: "request", pathId: path?._id, path: path }); }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                        Request Changes
                      </button>
                      <button className="pab pab--compare"
                        onClick={() => {
                          fetchChangeRequests(path?._id);
                          setPendingPopup({ type: "compare", pathId: path?._id, path: path });
                        }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="16 3 21 3 21 8" /><line x1="4" y1="20" x2="21" y2="3" /><polyline points="21 16 21 21 16 21" /><line x1="15" y1="15" x2="21" y2="21" /></svg>
                        Review
                      </button>
                      <button className="pab pab--reject"
                        onClick={() => { setRejectChecklist([]); setRejectNote(""); setRejectNoteError(false); setPendingPopup({ type: "reject", pathId: path?._id, path: path }); }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                        Reject
                      </button>
                    </div>

                  </div>

                ) : (
                  <div className="paths-table-row" key={i}
                    onClick={async () => {
                      setPathActionEnabled(true);
                      setSelectedPathId(path?._id);
                      const res = await axios.get(`${BASE_URL}/api/paths/viewpath/${path?._id}`);
                      if (res.data?.data) setSelectedPath(res.data.data);
                    }}>
<div className="paths-col-name">
  <div className="admin-icon-box">
    <img src={pathIcon} alt="path" style={{ width: "16px", height: "16px", objectFit: "contain" }} />
  </div>
  <span className="path-name-text">{path?.nameOfPath}</span>
</div>                <div className="paths-col-desc" onClick={ev => ev.stopPropagation()}>
                      <span className="path-desc-text">
                        {expandedRows[path?._id] ? path?.description : (path?.description?.length > 120 ? path?.description?.substring(0, 120) + "..." : path?.description)}
                      </span>
                      {path?.description?.length > 120 && (
                        <span className="path-desc-toggle" onClick={ev => { ev.stopPropagation(); setExpandedRows(prev => ({ ...prev, [path._id]: !prev[path._id] })); }}>
                          {expandedRows[path?._id] ? " Read Less" : " Read More"}
                        </span>
                      )}
                    </div>
                    <div className="paths-col-steps">
                      <div className="path-meta-info">
                        <span className="meta-date">
                          {(function () {
                            const date = path?.createdAt ? new Date(path.createdAt) : new Date();
                            return date.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
                          })()}
                        </span>
                      </div>
                      <span className="actions-pill">Actions</span>
                    </div>
                  </div>
                )
              ))}
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════
          PATH ACTION MODAL
      ══════════════════════════════════════════════════════════ */}
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

            {/* ── STEP 1: MAIN ACTIONS — ACTIVE / INACTIVE ── */}
{pathActionStep === 1 && editPaths === "default" && mypathsMenu !== "Pending Paths" && (
  <div className="pp-cards-grid">
    {/* For Inactive Paths: only show Review and Reactivate */}
    {mypathsMenu === "Inactive Paths" ? (
      <>
        <ActionCard
          color="green"
          icon={<IconCheck />}
          title="Reactivate Path"
          desc="Restore this path to active"
          onClick={() => setPathActionStep(2)}
        />
        <ActionCard
          color="purple"
          icon={<IconPencil />}
          title="Review Path"
          desc="Open the complete path page"
          onClick={() => { localStorage.setItem("selectedPathId", selectedPathId); navigate(`/dashboard/path/${selectedPathId}`); }}
        />
      </>
    ) : (
      <>
        <ActionCard
          color="blue"
          icon={<IconPencil />}
          title="Edit Path"
          desc="Modify steps, metadata, or structure"
          onClick={() => setPathActionStep(4)}
        />
        <ActionCard
          color="red"
          icon={<IconTrash />}
          title="Delete Path"
          desc="Permanently remove this path"
          onClick={() => setPathActionStep(2)}
        />
        <ActionCard
          color="purple"
          icon={<IconPencil />}
          title="Review Path"
          desc="Open the complete path page"
          onClick={() => { localStorage.setItem("selectedPathId", selectedPathId); navigate(`/dashboard/path/${selectedPathId}`); }}
        />
        <ActionCard
          color="teal"
          icon={<IconShop />}
          title="Marketplace"
          desc="Attach services to steps"
          onClick={() => setEditPaths("marketplace_steps")}
        />
      </>
    )}
  </div>
)}

              {/* ── STEP 2: DELETE / REACTIVATE CONFIRM ── */}
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
                    <button
                      className={`pp-btn ${mypathsMenu === "Inactive Paths" ? "pp-btn--green" : "pp-btn--red"}`}
                      onClick={() => mypathsMenu === "Inactive Paths" ? reactivatePath() : deletePath()}>
                      {actionLoading ? "Processing..." : mypathsMenu === "Inactive Paths" ? "Yes, Reactivate" : "Yes, Delete"}
                    </button>
                    <button className="pp-btn pp-btn--ghost" onClick={() => setPathActionStep(1)}>Cancel</button>
                  </div>
                </div>
              )}

              {/* ── STEP 3: SUCCESS ── */}
              {pathActionStep === 3 && (
                <div className="pp-success">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10" /><path d="M8 12l3 3 6-6" />
                  </svg>
                  <h3>Done!</h3>
                  <p>Action completed successfully</p>
                </div>
              )}

              {/* ── STEP 4: EDIT OPTIONS ── */}
              {pathActionStep === 4 && editPaths === "default" && (
                <div className="pp-option-list">
                  <p className="pp-section-label">What would you like to edit?</p>
                  <OptionRow
                    iconColor="blue"
                    icon={
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M8 6h13" /><path d="M8 12h13" /><path d="M8 18h13" />
                        <circle cx="3" cy="6" r="1" fill="currentColor" />
                        <circle cx="3" cy="12" r="1" fill="currentColor" />
                        <circle cx="3" cy="18" r="1" fill="currentColor" />
                      </svg>
                    }
                    title="Edit Steps"
                    sub="Add, remove, or reorder steps in this path"
                    onClick={() => setEditPaths("Edit steps")}
                  />
                </div>
              )}

              {/* ── STEP MANAGEMENT ── */}
              {editPaths === "Edit steps" && (
                <div className="pp-option-list">
                  <p className="pp-section-label">Step Management</p>
                  <OptionRow
                    iconColor="green"
                    icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>}
                    title="Add New Step" sub="Insert a step from your library" onClick={() => setEditPaths("add_step")}
                  />
                  <OptionRow
                    iconColor="red"
                    icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>}
                    title="Remove Step" sub="Delete a step from this path" onClick={() => setEditPaths("remove_step")}
                  />
                  <OptionRow
                    iconColor="amber"
                    icon={
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
                        <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
                      </svg>
                    }
                    title="Reorder Steps" sub="Drag and drop to change sequence" onClick={() => setEditPaths("reorder_step")}
                  />
                </div>
              )}

              {/* ── ADD STEP ── */}
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
                            {item?.description && <p>{item.description.substring(0, 110)}{item.description.length > 110 ? "..." : ""}</p>}
                            <code>{item?._id}</code>
                          </div>
                          <span className={`pp-tag ${added ? "pp-tag--gray" : "pp-tag--blue"}`}>{added ? "Already Added" : "Select →"}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── SELECT BACKUP PATH ── */}
              {editPaths === "add_sub_step" && (
                <div className="pp-selector">
                  <p className="pp-section-label">Select backup path</p>
                  <div className="pp-selector-list">
                    {backupPathData?.map(item => (
                      <div key={item._id} className="pp-selector-item"
                        onClick={() => { setEditPaths("show_all_paths"); setBackupPathId(item._id); }}>
                        <div className="pp-selector-item-body">
                          <strong>{item?.nameOfPath}</strong>
                          {item?.description && <p>{item.description.substring(0, 110)}{item.description.length > 110 ? "..." : ""}</p>}
                          <code>{item?._id}</code>
                        </div>
                        <span className="pp-tag pp-tag--indigo">Select →</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── CHOOSE POSITION ── */}
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
                        <button className="pp-insert-btn" onClick={() => handlePlace(selectedPath, index + 1)}>+ Insert Here</button>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              )}

              {/* ── REMOVE STEP ── */}
              {editPaths === "remove_step" && (
                <div className="pp-selector">
                  <p className="pp-section-label">Select step to remove</p>
                  <div className="pp-selector-list">
                    {selectedPath?.StepDetails?.filter(item => item?.name)?.map(item => (
                      <div key={item._id} className="pp-selector-item pp-selector-item--remove"
                        onClick={() => handledeletePathPosition(selectedPath, item._id)}>
                        <div className="pp-selector-item-body">
                          <strong>{item?.name}</strong>
                          {item?.description && <p>{item.description.substring(0, 110)}{item.description.length > 110 ? "..." : ""}</p>}
                          <code>{item?._id}</code>
                        </div>
                        <span className="pp-tag pp-tag--red">Remove</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── REORDER STEPS ── */}
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
                              {item.description && <span>{item.description.substring(0, 80)}{item.description.length > 80 ? "..." : ""}</span>}
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

              {/* ── STEP 5: APPROVE CONFIRM ── */}
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

              {/* ── STEP 6: REJECT CONFIRM ── */}
              {pathActionStep === 6 && (
                <div className="pp-confirm">
                  <div className="pp-confirm-icon pp-confirm-icon--red">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </div>
                  <h3>Reject this path?</h3>
                  <p className="pp-confirm-msg">It will be moved to drafts for revision.</p>
                  <div className="pp-confirm-actions">
                    <button className="pp-btn pp-btn--red" onClick={handleRejectPath}>{actionLoading ? "Processing..." : "Yes, Reject"}</button>
                    <button className="pp-btn pp-btn--ghost" onClick={() => setPathActionStep(1)}>Cancel</button>
                  </div>
                </div>
              )}

              {/* ══════════════════════════════════════════════════════
                  MARKETPLACE STEP 1 — SELECT STEP
              ══════════════════════════════════════════════════════ */}
              {editPaths === "marketplace_steps" && (
                <div className="pp-selector">
                  <p className="pp-section-label">Select a step to manage its marketplace</p>
                  <div className="pp-selector-list">
                    {selectedPath?.StepDetails?.filter(s => s?.name)?.map(step => (
                      <div
                        key={step._id}
                        className="pp-selector-item"
                        onClick={() => {
                          setMarketStepId(step._id);
                          setAttachedServices([]);
                          setMarketplaceItems([]);
                          axios.get(`${BASE_URL}/api/steps/${step._id}`)
                            .then(({ data }) => {
                              if (data?.data) setMarketStepData(data.data);
                            });
                          setEditPaths("marketplace_layer");
                        }}>
                        <div className="pp-selector-item-body">
                          <strong>{step.name}</strong>
                          {step.description && <p>{step.description.substring(0, 80)}{step.description.length > 80 ? "..." : ""}</p>}
                        </div>
                        <span className="pp-tag pp-tag--teal">Select →</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ══════════════════════════════════════════════════════
                  MARKETPLACE STEP 2 — SELECT LAYER
              ══════════════════════════════════════════════════════ */}
              {editPaths === "marketplace_layer" && (
                <div className="pp-selector">
                  <p className="pp-section-label">Select a view to manage</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {Object.entries(getLayerConfig(marketStepData)).map(([layerKey, cfg]) => (
                      <div
                        key={layerKey}
                        style={{
                          padding: "18px 20px",
                          borderRadius: 16,
                          cursor: "pointer",
                          border: `1.5px solid ${cfg.border}`,
                          background: cfg.bg,
                          display: "flex",
                          alignItems: "center",
                          gap: 14,
                          transition: "all 0.15s",
                        }}
                        onClick={() => {
                          setMarketLayer(layerKey);
                          setAttachedServices([]);
                          setMarketplaceItems([]);
                          // fetchMarketplaceData with explicit args since state hasn't updated yet
                          fetchMarketplaceData(marketStepId, layerKey);
                          setEditPaths("marketplace_attach");
                        }}>
                        <div style={{
                          width: 44, height: 44, borderRadius: 12,
                          background: cfg.color, display: "flex",
                          alignItems: "center", justifyContent: "center",
                          color: "#fff", fontWeight: 800, fontSize: "1rem", flexShrink: 0,
                        }}>
                          {cfg.label[0]}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontWeight: 700, fontSize: "0.78rem",
                            color: cfg.color, textTransform: "uppercase",
                            letterSpacing: "0.07em", marginBottom: 3,
                          }}>
                            {cfg.label}
                          </div>
                          <div style={{
                            fontWeight: 600, fontSize: "0.88rem",
                            color: "#0f172a", marginBottom: 2,
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                          }}>
                            {cfg.viewName}
                          </div>
                          <div style={{
                            fontSize: "0.74rem", color: "#64748b",
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                          }}>
                            {cfg.viewDesc}
                          </div>
                        </div>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ══════════════════════════════════════════════════════
                  MARKETPLACE STEP 3 — ATTACH / DETACH
              ══════════════════════════════════════════════════════ */}
              {editPaths === "marketplace_attach" && (
                <div>
                  {/* Layer title */}
                  {currentLayerCfg && (
                    <div style={{ marginBottom: "16px" }}>
                      <h3 style={{ fontSize: "18px", fontWeight: "600" }}>{currentLayerCfg.viewName}</h3>
                      <p style={{ color: "#64748b", fontSize: "13px" }}>{currentLayerCfg.viewDesc}</p>
                    </div>
                  )}

                  {/* ATTACHED */}
                  <p className="pp-section-label">
                    ATTACHED TO THIS STEP ({marketLayer?.toUpperCase()})
                  </p>

                  {marketplaceLoading ? (
                    <div style={{ padding: "12px 0", color: "#64748b", fontSize: "13px" }}>Loading...</div>
                  ) : attachedServices.length > 0 ? (
                    attachedServices.map(item => (
                      <div className="pp-market-item" key={item._id}>
                        <div className="pp-market-item-info">
                          <div className="pp-market-emoji">📦</div>
                          <div>
                            <strong>{item.name}</strong>
                            <span>{item.role}</span>
                          </div>
                        </div>
                        <button
                          className="pp-market-remove-btn"
                          disabled={actionLoading}
                          onClick={() => detachMarketService(item)}>
                          {actionLoading ? "..." : "Remove"}
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="pp-empty">No items attached to this step</div>
                  )}

                  {/* CREATE BUTTON */}
                  <button
                    className="pp-create-btn"
                    style={{ marginTop: "16px", marginBottom: "8px" }}
                    onClick={() => setEditPaths("marketplace_create")}>
                    + Create New Listing
                  </button>

                  {/* AVAILABLE (all in this layer, not yet attached to this step) */}
                  <p className="pp-section-label" style={{ marginTop: "20px" }}>
                    ALL {marketLayer?.toUpperCase()} MARKETPLACE ({availableItems.length} available)
                  </p>

                  {marketplaceLoading ? (
                    <div style={{ padding: "12px 0", color: "#64748b", fontSize: "13px" }}>Loading...</div>
                  ) : availableItems.length === 0 ? (
                    <div className="pp-empty">No other {marketLayer} items in marketplace</div>
                  ) : (
                    availableItems.map(item => (
                      <div className="pp-market-item" key={item._id}>
                        <div className="pp-market-item-info">
                          <div className="pp-market-emoji">📦</div>
                          <div>
                            <strong>{item.name}</strong>
                            <span>{item.role}</span>
                            {item.step_id && (
                              <span style={{ fontSize: "11px", color: "#f59e0b", display: "block" }}>
                                ⚠ Already linked to another step
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          className="pp-market-attach-btn"
                          disabled={actionLoading}
                          onClick={() => attachMarketService(item)}>
                          {actionLoading ? "..." : "Attach"}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* ══════════════════════════════════════════════════════
                  MARKETPLACE STEP 4 — CREATE NEW LISTING
              ══════════════════════════════════════════════════════ */}
              {editPaths === "marketplace_create" && (
                <div className="pp-selector">
                  {/* Layer badge */}
                  {currentLayerCfg && (
                    <div style={{
                      display: "flex", alignItems: "center", gap: 8,
                      padding: "8px 14px", background: currentLayerCfg.bg,
                      borderRadius: 10, border: `1.5px solid ${currentLayerCfg.border}`,
                      fontSize: "0.78rem", color: currentLayerCfg.color,
                      fontWeight: 500, marginBottom: 16,
                    }}>
                      <span style={{ color: "#64748b" }}>Adding to</span>
                      <strong style={{ textTransform: "uppercase", letterSpacing: "0.04em" }}>
                        {currentLayerCfg.label}
                      </strong>
                      <span style={{ color: "#64748b" }}>layer</span>
                    </div>
                  )}

                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {/* Role */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                      <label className="pp-section-label" style={{ marginBottom: 0 }}>Role *</label>
                      <select value={mpRole} onChange={e => setMpRole(e.target.value)}
                        style={{ padding: "9px 12px", border: "1.5px solid #e8ecf0", borderRadius: 10, fontSize: "0.85rem", outline: "none", background: "#fff" }}>
                        <option value="">Select role...</option>
                        <option value="institution">Institution</option>
                        <option value="mentor">Mentor</option>
                        <option value="distributor">Distributor</option>
                        <option value="vendor">Vendor</option>
                      </select>
                    </div>

                    {/* Name */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                      <label className="pp-section-label" style={{ marginBottom: 0 }}>Name *</label>
                      <input
                        style={{ padding: "9px 12px", border: "1.5px solid #e8ecf0", borderRadius: 10, fontSize: "0.85rem", outline: "none" }}
                        type="text" value={mpName} onChange={e => setMpName(e.target.value)}
                        placeholder="e.g. Malla Reddy University"
                      />
                    </div>

                    {/* Access + Cost */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                        <label className="pp-section-label" style={{ marginBottom: 0 }}>Access</label>
                        <select value={mpAccess} onChange={e => setMpAccess(e.target.value)}
                          style={{ padding: "9px 12px", border: "1.5px solid #e8ecf0", borderRadius: 10, fontSize: "0.85rem", outline: "none", background: "#fff" }}>
                          <option value="Free">Free</option>
                          <option value="Paid">Paid</option>
                          <option value="Subscription">Subscription</option>
                        </select>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                        <label className="pp-section-label" style={{ marginBottom: 0 }}>Cost</label>
                        <input
                          style={{ padding: "9px 12px", border: "1.5px solid #e8ecf0", borderRadius: 10, fontSize: "0.85rem", outline: "none" }}
                          type="text" value={mpCost} onChange={e => setMpCost(e.target.value)} placeholder="e.g. ₹65,000"
                        />
                      </div>
                    </div>

                    {/* Duration */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                      <label className="pp-section-label" style={{ marginBottom: 0 }}>Duration</label>
                      <input
                        style={{ padding: "9px 12px", border: "1.5px solid #e8ecf0", borderRadius: 10, fontSize: "0.85rem", outline: "none" }}
                        type="text" value={mpDuration} onChange={e => setMpDuration(e.target.value)} placeholder="e.g. 3 months"
                      />
                    </div>

                    {/* Goal */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                      <label className="pp-section-label" style={{ marginBottom: 0 }}>Goal</label>
                      <input
                        style={{ padding: "9px 12px", border: "1.5px solid #e8ecf0", borderRadius: 10, fontSize: "0.85rem", outline: "none" }}
                        type="text" value={mpGoal} onChange={e => setMpGoal(e.target.value)} placeholder="What goal does this serve?"
                      />
                    </div>

                    {/* Features */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                      <label className="pp-section-label" style={{ marginBottom: 0 }}>Features</label>
                      <textarea
                        style={{ padding: "9px 12px", border: "1.5px solid #e8ecf0", borderRadius: 10, fontSize: "0.85rem", outline: "none", minHeight: 70, resize: "vertical", fontFamily: "inherit" }}
                        value={mpFeatures} onChange={e => setMpFeatures(e.target.value)} placeholder="Key features or offerings"
                      />
                    </div>

                    {/* Outcomes + Discount */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                        <label className="pp-section-label" style={{ marginBottom: 0 }}>Outcomes</label>
                        <input
                          style={{ padding: "9px 12px", border: "1.5px solid #e8ecf0", borderRadius: 10, fontSize: "0.85rem", outline: "none" }}
                          type="text" value={mpOutcomes} onChange={e => setMpOutcomes(e.target.value)} placeholder="Expected outcomes"
                        />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                        <label className="pp-section-label" style={{ marginBottom: 0 }}>Discount</label>
                        <input
                          style={{ padding: "9px 12px", border: "1.5px solid #e8ecf0", borderRadius: 10, fontSize: "0.85rem", outline: "none" }}
                          type="text" value={mpDiscount} onChange={e => setMpDiscount(e.target.value)} placeholder="e.g. 10%"
                        />
                      </div>
                    </div>

                    {/* Submit */}
                    <button
                      className="pp-btn pp-btn--blue"
                      style={{ marginTop: 4, borderRadius: 50 }}
                      disabled={actionLoading}
                      onClick={() => {
                        if (!mpRole || !mpName) { alert("Role and Name are required"); return; }
                        setActionLoading(true);

                        axios
                          .post(`${BASE_URL}/api/marketplace/add`, {
                            name: mpName,
                            role: mpRole,
                            layer: marketLayer,
                            step_id: marketStepId,
                            path_id: selectedPathId,
                            partner_email: userDetails?.email || "",
                            access: mpAccess,
                            cost: mpCost,
                            goal: mpGoal,
                            outcomes: mpOutcomes,
                            duration: mpDuration,
                            features: mpFeatures,
                            discount: mpDiscount,
                          })
                          .then(({ data }) => {
                            if (data?.status && data?.data) {
                              const newItem = data.data;
                              // Add to attached list and to full items list
                              setAttachedServices(prev => [...prev, newItem]);
                              setMarketplaceItems(prev => [...prev, newItem]);
                              setMarketStepData(prev => ({
                                ...prev,
                                [`${marketLayer}_marketplace`]: [
                                  ...(prev?.[`${marketLayer}_marketplace`] || []),
                                  newItem._id
                                ]
                              }));
                              // Reset form fields
                              setMpRole(""); setMpName(""); setMpAccess("Free"); setMpCost("");
                              setMpGoal(""); setMpOutcomes(""); setMpDuration("");
                              setMpFeatures(""); setMpDiscount("");
                              setEditPaths("marketplace_attach");
                            }
                            setActionLoading(false);
                          })
                          .catch(() => setActionLoading(false));
                      }}>
                      {actionLoading ? "Adding..." : "Add to Marketplace"}
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </>
      )}


      {/* ══════════════════════════════════════════════════════════
    PENDING PATH POPUPS
══════════════════════════════════════════════════════════ */}
      {pendingPopup && (
        <>
          <div className="pp-overlay" onClick={closePendingPopup} />
          <div className="pending-popup-modal">

            <div className="pending-popup-header">
              <div>
                <h3 className="pending-popup-title">
                  {pendingPopup.type === "approve" && "Approve Path"}
                  {pendingPopup.type === "request" && "Request Changes"}
                  {pendingPopup.type === "reject" && "Reject Path"}
                  {pendingPopup.type === "compare" && "Version Comparison"}
                </h3>
                <p className="pending-popup-subtitle">{pendingPopup.path?.nameOfPath}</p>
              </div>
              <button className="pp-close-btn" onClick={closePendingPopup}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* APPROVE */}
            {pendingPopup.type === "approve" && (
              <div className="pending-popup-body">
                <h4 className="popup-confirm-heading">Are you sure you want to approve?</h4>
                <p className="popup-confirm-msg">
                  This path will become <strong>live and visible</strong> to users.
                </p>

                <div className="popup-confirm-actions">
                  <button className="pp-btn pp-btn--green" onClick={handleApproveConfirm}>
                    Yes, Approve
                  </button>
                  <button className="pp-btn pp-btn--ghost" onClick={closePendingPopup}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* REQUEST CHANGES */}
            {pendingPopup.type === "request" && (
              <div className="pending-popup-body">
                <p className="pp-section-label">Flag issues for partner</p>
                <div className="popup-checklist">
                  {REJECT_ISSUES.map((issue, idx) => (
                    <label key={idx} className={`popup-check-item ${rejectChecklist.includes(issue) ? "checked" : ""}`}>
                      <input type="checkbox" checked={rejectChecklist.includes(issue)} onChange={() => toggleRejectCheck(issue)} />
                      {issue}
                    </label>
                  ))}
                </div>
                <p className="pp-section-label" style={{ marginTop: "16px" }}>
                  Note to partner <span style={{ color: "#ef4444" }}>*</span>
                </p>
                <textarea
                  className={`popup-note-area ${rejectNoteError ? "error" : ""}`}
                  placeholder="Explain what the partner needs to fix before resubmitting..."
                  value={rejectNote}
                  onChange={ev => { setRejectNote(ev.target.value); setRejectNoteError(false); }}
                />
                {rejectNoteError && <p className="popup-note-error">Note is required before sending.</p>}
                <div className="popup-footer">
                  <button className="pp-btn pp-btn--ghost" onClick={closePendingPopup}>Cancel</button>
                  <button className="pp-btn pp-btn--amber" onClick={handleRequestChanges}>
                    {actionLoading ? "Sending..." : "Send Change Request →"}
                  </button>
                </div>
              </div>
            )}

            {/* REJECT */}
            {pendingPopup.type === "reject" && (
              <div className="pending-popup-body">
                <div className="popup-confirm-icon popup-confirm-icon--red">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </div>
                <h4 className="popup-confirm-heading">Are you sure you want to reject?</h4>
                <p className="pp-section-label" style={{ marginTop: "4px" }}>Select rejection reasons</p>
                <div className="popup-checklist">
                  {REJECT_ISSUES.map(issue => (
                    <label key={issue} className={`popup-check-item ${rejectChecklist.includes(issue) ? "checked" : ""}`}>
                      <input type="checkbox" checked={rejectChecklist.includes(issue)} onChange={() => toggleRejectCheck(issue)} />
                      {issue}
                    </label>
                  ))}
                </div>
                <p className="pp-section-label" style={{ marginTop: "16px" }}>
                  Rejection note <span style={{ color: "#ef4444" }}>*</span> (mandatory)
                </p>
                <textarea
                  className={`popup-note-area ${rejectNoteError ? "error" : ""}`}
                  placeholder="Explain why this path is being rejected..."
                  value={rejectNote}
                  onChange={ev => { setRejectNote(ev.target.value); setRejectNoteError(false); }}
                />
                {rejectNoteError && <p className="popup-note-error">Note is required before rejecting.</p>}
                <div className="popup-footer">
                  <button className="pp-btn pp-btn--ghost" onClick={closePendingPopup}>Cancel</button>
                  <button className="pp-btn pp-btn--red" onClick={handleFinalReject}>
                    {actionLoading ? "Rejecting..." : "Confirm Reject"}
                  </button>
                </div>
              </div>
            )}


            {pendingPopup.type === "compare" && (
              <div className="pending-popup-body vcr-body-wrap">

                {changeRequestsLoading[pendingPopup?.pathId] ? (
                  <div className="vcr-loading">Loading…</div>

                ) : vcrSelectedRequest !== null ? (
                  // ─── DETAIL VIEW: single request thread ───────────────────
                  (() => {
                    const cr = (pathChangeRequests[pendingPopup?.pathId] || [])[vcrSelectedRequest];
                    if (!cr) return null;
                    return (
                      <div>
                        {/* Back button */}
                        <button
                          className="vcr-back-btn"
                          onClick={() => setVcrSelectedRequest(null)}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
                          </svg>
                          Back to all requests
                        </button>

                        <div className="vcr-detail-header">
                          <span className="vcr-thread-num">Request {vcrSelectedRequest + 1}</span>
                          <span className="vcr-thread-time">
                            {new Date(cr.sentAt).toLocaleString("en-IN", {
                              day: "2-digit", month: "short", year: "numeric",
                              hour: "2-digit", minute: "2-digit",
                            })}
                          </span>
                          <span className={`vcr-status-badge ${cr.status === "addressed" ? "resolved" : "pending"}`}>
                            {cr.status === "addressed" ? "Resolved" : "Pending"}
                          </span>
                        </div>

                        <div className="vcr-chat-area">
                          {/* Admin original message */}
                          <div className="vcr-msg admin-msg">
                            <div className="vcr-msg-content">
                              <span className="vcr-msg-label align-right">You (Admin)</span>
                              <div className="vcr-bubble admin-bubble">
                                {(cr.issues || []).filter(i => i?.trim()).length > 0 && (
                                  <div className="vcr-issue-pills">
                                    {cr.issues.filter(i => i?.trim()).map((issue, ii) => (
                                      <span key={ii} className="vcr-issue-pill">{issue}</span>
                                    ))}
                                  </div>
                                )}
                                {cr.adminNote && (
                                  <p className="vcr-bubble-text admin-text">{cr.adminNote}</p>
                                )}
                              </div>
                            </div>
                            <div className="vcr-avatar admin-av">AD</div>
                          </div>

                          {/* Replies */}
                          {(cr.replies || []).map((reply, rIdx) => {
                            const isAdmin = reply.from === "admin";
                            return (
                              <div key={rIdx} className={`vcr-msg ${isAdmin ? "admin-msg" : "partner-msg"}`}>
                                {isAdmin ? (
                                  <>
                                    <div className="vcr-msg-content">
                                      <span className="vcr-msg-label align-right">
                                        You (Admin) · {new Date(reply.sentAt).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                                      </span>
                                      <div className="vcr-bubble admin-bubble">
                                        <p className="vcr-bubble-text admin-text">{reply.message}</p>
                                      </div>
                                    </div>
                                    <div className="vcr-avatar admin-av">AD</div>
                                  </>
                                ) : (
                                  <>
                                    <div className="vcr-avatar partner-av">P</div>
                                    <div className="vcr-msg-content">
                                      <span className="vcr-msg-label">
                                        Partner · {new Date(reply.sentAt).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                                      </span>
                                      <div className="vcr-bubble partner-bubble">
                                        <p className="vcr-bubble-text partner-text">{reply.message}</p>
                                      </div>
                                    </div>
                                  </>
                                )}
                              </div>
                            );
                          })}

                       {/* Reply input */}
<div className="vcr-reply-box">
  <textarea
    className="vcr-reply-input"
    rows={1}
    placeholder="Reply to partner…"
    value={adminReplyTexts[cr._id] || ""}
    onChange={(e) => {
      setAdminReplyTexts(prev => ({ ...prev, [cr._id]: e.target.value }));
      e.target.style.height = "auto";
      e.target.style.height = Math.min(e.target.scrollHeight, 90) + "px";
    }}
    onKeyDown={(e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendAdminReply(pendingPopup?.pathId, cr._id);
      }
    }}
  />
  <button
    className={`vcr-send-btn ${adminReplyTexts[cr._id]?.trim() ? "active" : ""}`}
    disabled={!adminReplyTexts[cr._id]?.trim() || adminReplyLoading[cr._id]}
    onClick={() => sendAdminReply(pendingPopup?.pathId, cr._id)}
  >
    {adminReplyLoading[cr._id] ? (
      <span className="vcr-send-spinner" />
    ) : (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
        <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
      </svg>
    )}
  </button>
</div>

{/* ── MARK AS ADDRESSED BUTTON ── */}
{cr.status !== "addressed" && (
  <button
    onClick={async () => {
      try {
        setActionLoading(true);
        await axios.patch(
          `${BASE_URL}/api/paths/address/${pendingPopup?.pathId}/${cr._id}`
        );
        // Refresh the change requests
        const { data } = await axios.get(
          `${BASE_URL}/api/paths/viewpath/${pendingPopup?.pathId}`
        );
        if (data?.status) {
          setPathChangeRequests(prev => ({
            ...prev,
            [pendingPopup?.pathId]: data.data?.changeRequests || [],
          }));
        }
        setActionLoading(false);
      } catch (err) {
        console.error("Address error:", err);
        setActionLoading(false);
      }
    }}
    className="vcr-address-btn"
  >
    ✓ Mark as Addressed
  </button>
)}
                        </div>
                      </div>
                    );
                  })()

                ) : (
                  // ─── LIST VIEW: all requests as clickable cards ────────────
                  (pathChangeRequests[pendingPopup?.pathId] || []).length === 0 ? (
                    <div className="vcr-empty-state">No change requests sent yet.</div>
                  ) : (
                    <div className="vcr-request-list">
                      <p className="pp-section-label" style={{ marginBottom: 12 }}>
                        {(pathChangeRequests[pendingPopup?.pathId] || []).length} change request(s) sent
                      </p>
                      {(pathChangeRequests[pendingPopup?.pathId] || []).map((cr, idx) => {
                        const replyCount = (cr.replies || []).length;
                        const partnerReplied = (cr.replies || []).some(r => r.from === "partner");
                        return (
                          <div
                            key={cr._id || idx}
                            className="vcr-request-card"
                            onClick={() => setVcrSelectedRequest(idx)}
                          >
                            <div className="vcr-request-card-left">
                              <span className="vcr-request-num">Request {idx + 1}</span>
                              <span className="vcr-request-date">
                                {new Date(cr.sentAt).toLocaleString("en-IN", {
                                  day: "2-digit", month: "short", year: "numeric",
                                  hour: "2-digit", minute: "2-digit",
                                })}
                              </span>
                              {(cr.issues || []).filter(i => i?.trim()).length > 0 && (
                                <div className="vcr-request-issues">
                                  {cr.issues.filter(i => i?.trim()).slice(0, 2).map((issue, ii) => (
                                    <span key={ii} className="vcr-issue-pill">{issue}</span>
                                  ))}
                                  {cr.issues.filter(i => i?.trim()).length > 2 && (
                                    <span className="vcr-issue-pill vcr-issue-more">
                                      +{cr.issues.filter(i => i?.trim()).length - 2} more
                                    </span>
                                  )}
                                </div>
                              )}
                              <div className="vcr-request-meta">
                                <span className="vcr-reply-count">
                                  💬 {replyCount} {replyCount === 1 ? "reply" : "replies"}
                                </span>
                                {partnerReplied && (
                                  <span className="vcr-partner-replied">Partner replied</span>
                                )}
                              </div>
                            </div>
                            <div className="vcr-request-card-right">
                              <span className={`vcr-status-badge ${cr.status === "addressed" ? "resolved" : "pending"}`}>
                                {cr.status === "addressed" ? "Resolved" : "Pending"}
                              </span>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
                                <polyline points="9 18 15 12 9 6" />
                              </svg>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )
                )}

                <div className="popup-footer">
                  <button className="pp-btn pp-btn--ghost" onClick={closePendingPopup}>Close</button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
      {/* ══════════════════════════════════════════════════════════
          STEP ACTION POPUP
      ══════════════════════════════════════════════════════════ */}
      {stepActionEnabled && (
        <>
          <div
            className="pp-overlay"
            onClick={() => { setStepActionEnabled(false); setStepActionStep(1); setSelectedStepId(""); }}
          />
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
                  <div className="admin-acc-step-box4" style={{ flexDirection: "column", alignItems: "flex-start" }} onClick={() => setStepActionStep(5)}>Add a Service</div>
                  <div className="admin-acc-step-box4" style={{ flexDirection: "column", alignItems: "flex-start" }} onClick={() => setStepActionStep(6)}>Remove a Service</div>
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
                      className={selectedServices.includes(item?._id) ? "admin-acc-step-box4-selected" : "admin-acc-step-box4"}
                      style={{ flexDirection: "column", alignItems: "flex-start" }}
                      onClick={() => handleSelectServicesForStep(item?._id)}>
                      <div>{item?.name}</div>
                      <div style={{ fontSize: "12px", fontWeight: 400, paddingTop: "5px" }}>{item?._id}</div>
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
                      style={{ flexDirection: "column", alignItems: "flex-start" }}
                      onClick={() => removeServiceFromStep(item?._id)}>
                      <div>{item?.name}</div>
                      <div style={{ fontSize: "12px", fontWeight: 400, paddingTop: "5px" }}>{item?._id}</div>
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