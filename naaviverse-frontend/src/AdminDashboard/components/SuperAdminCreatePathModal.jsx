import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FiCheckCircle,
  FiLayers,
  FiX,
  FiPlus,
  FiTrash2,
  FiAlertCircle,
  FiClock,
  FiBookOpen,
  FiTag,
} from "react-icons/fi";
import "./SuperAdminCreatePathModal.scss";

const BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:4545";

// ── SVG Category Icons ─────────────────────────────────────
const IconVendor = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"
      stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 6h18" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
    <path d="M16 10a4 4 0 0 1-8 0"
      stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconMentor = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.75"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
      stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconDistributor = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14"
      stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16.5 9.4 7.55 4.24M3.29 7 12 12l8.71-5M12 22V12"
      stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18 15v6M15 18h6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
  </svg>
);

const IconInstitution = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 10v11M12 10v11M16 10v11"
      stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const CATEGORIES = [
  { key: "vendors", label: "Vendors", Icon: IconVendor, singular: "Vendor" },
  { key: "mentors", label: "Mentors", Icon: IconMentor, singular: "Mentor" },
  { key: "distributors", label: "Distributors", Icon: IconDistributor, singular: "Distributor" },
  { key: "institutions", label: "Institutions", Icon: IconInstitution, singular: "Institution" },
];

export const VIEWS = [
  { key: "macro", label: "Macro View", tag: "Foundational / Free", color: "#0d6b6e" },
  { key: "micro", label: "Micro View", tag: "Intermediate / Structured", color: "#2563eb" },
  { key: "nano", label: "Nano View", tag: "Advanced / Expert", color: "#7c3aed" },
];

/**
 * Creates clean initial steps with empty marketplaces (no hardcoded dummy data)
 */
function createInitialEmptySteps() {
  return [
    {
      name: "Step 1: Academic Foundations & Prerequisites",
      description: "",
      duration: "1 Year",
      activeView: "macro",
      activeCategory: "vendors",
      macro: {
        name: "Step 1: Foundational Modules",
        desc: "",
        duration: "1 Year",
        access: "free",
        marketplace: [],
      },
      micro: {
        name: "Step 1: Structured Core Prep",
        desc: "",
        duration: "1 Year",
        access: "paid",
        marketplace: [],
      },
      nano: {
        name: "Step 1: Competitive Diagnostics",
        desc: "",
        duration: "6 Months",
        access: "paid",
        marketplace: [],
      },
    },
    {
      name: "Step 2: Core Coursework & Domain Specialization",
      description: "",
      duration: "1.5 Years",
      activeView: "macro",
      activeCategory: "vendors",
      macro: {
        name: "Step 2: Domain Curriculum",
        desc: "",
        duration: "1.5 Years",
        access: "free",
        marketplace: [],
      },
      micro: {
        name: "Step 2: Guided Labs & Assignments",
        desc: "",
        duration: "1 Year",
        access: "paid",
        marketplace: [],
      },
      nano: {
        name: "Step 2: Advanced Electives & Specialization",
        desc: "",
        duration: "6 Months",
        access: "paid",
        marketplace: [],
      },
    },
    {
      name: "Step 3: Applied Projects, Research & Portfolio",
      description: "",
      duration: "1 Year",
      activeView: "macro",
      activeCategory: "vendors",
      macro: {
        name: "Step 3: Capstone Exploration",
        desc: "",
        duration: "1 Year",
        access: "free",
        marketplace: [],
      },
      micro: {
        name: "Step 3: Production Codebase & Portfolio",
        desc: "",
        duration: "8 Months",
        access: "paid",
        marketplace: [],
      },
      nano: {
        name: "Step 3: Research Residency & Publications",
        desc: "",
        duration: "6 Months",
        access: "paid",
        marketplace: [],
      },
    },
    {
      name: "Step 4: Admissions, Capstone & Placement",
      description: "",
      duration: "6 Months",
      activeView: "macro",
      activeCategory: "vendors",
      macro: {
        name: "Step 4: Application Strategy",
        desc: "",
        duration: "6 Months",
        access: "free",
        marketplace: [],
      },
      micro: {
        name: "Step 4: Portfolio & Interview Reviews",
        desc: "",
        duration: "4 Months",
        access: "paid",
        marketplace: [],
      },
      nano: {
        name: "Step 4: Bespoke Placement & Strategy",
        desc: "",
        duration: "3 Months",
        access: "paid",
        marketplace: [],
      },
    },
  ];
}

/**
 * Normalizes an incoming raw step from DB into the multi-view structure
 */
function normalizeRawStep(raw, idx = 0) {
  const parseDur = (val) => {
    if (!val) return "1 Year";
    if (typeof val === "string") {
      try {
        const obj = JSON.parse(val);
        if (obj.years || obj.months) {
          return `${obj.years ? `${obj.years} Yrs ` : ""}${obj.months ? `${obj.months} Mos` : ""}`.trim();
        }
      } catch {
        return val;
      }
      return val;
    }
    return "1 Year";
  };

  const normMarket = (arr) => {
    if (!Array.isArray(arr)) return [];
    return arr
      .map((item) => ({
        name: item.name || "",
        category: item.category || item.role || "vendors",
        role: item.role || item.category || "vendors",
        cost: item.cost || item.price || "Free",
        duration: item.duration || "1 Month",
        discount: item.discount || "0%",
        access: item.access || "Free",
        goal: item.goal || item.why || item.outcomes || "",
      }))
      .filter((it) => it.name && it.name.trim() !== "");
  };

  const macroMarket = normMarket(raw.macro_marketplace || raw.macro?.marketplace);
  const microMarket = normMarket(raw.micro_marketplace || raw.micro?.marketplace);
  const nanoMarket  = normMarket(raw.nano_marketplace || raw.nano?.marketplace);

  const stepName = raw.name || raw.macro_name || `Step ${idx + 1}`;
  const stepDesc = raw.description || raw.macro_description || "";
  const stepDuration = parseDur(raw.macro_length || raw.macro?.duration);

  return {
    name: stepName,
    description: stepDesc,
    duration: stepDuration,
    activeView: "macro",
    activeCategory: "vendors",
    macro: {
      name: raw.macro_name || raw.macro?.name || stepName,
      desc: raw.macro_description || raw.macro?.desc || stepDesc,
      duration: parseDur(raw.macro_length || raw.macro?.duration) || stepDuration,
      access: raw.macro_access || raw.macro?.access || "free",
      marketplace: macroMarket,
    },
    micro: {
      name: raw.micro_name || raw.micro?.name || `${stepName} (Micro)`,
      desc: raw.micro_description || raw.micro?.desc || stepDesc,
      duration: parseDur(raw.micro_length || raw.micro?.duration) || stepDuration,
      access: raw.micro_access || raw.micro?.access || "paid",
      marketplace: microMarket,
    },
    nano: {
      name: raw.nano_name || raw.nano?.name || `${stepName} (Nano)`,
      desc: raw.nano_description || raw.nano?.desc || stepDesc,
      duration: parseDur(raw.nano_length || raw.nano?.duration) || "6 Months",
      access: raw.nano_access || raw.nano?.access || "paid",
      marketplace: nanoMarket,
    },
  };
}

export default function SuperAdminCreatePathModal({
  isOpen,
  onClose,
  request,
  onPathCreated,
}) {
  const [loading, setLoading] = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Form Fields
  const [nameOfPath, setNameOfPath] = useState("");
  const [program, setProgram] = useState("");
  const [destinationInstitution, setDestinationInstitution] = useState("");
  const [sector, setSector] = useState("");
  const [destinationDegree, setDestinationDegree] = useState("");
  const [description, setDescription] = useState("");
  const [adminNotes, setAdminNotes] = useState("");

  // Steps List
  const [steps, setSteps] = useState([]);

  // Panel state for adding marketplace item: { [stepIndex]: boolean }
  const [activeAddPanels, setActiveAddPanels] = useState({});

  // Form state for adding marketplace item
  const [marketForm, setMarketForm] = useState({
    name: "",
    cost: "Free",
    duration: "1 Month",
    discount: "0%",
    access: "Free",
    goal: "",
  });

  const isEditMode = Boolean(
    request?.createdPathId || request?.status === "created"
  );

  useEffect(() => {
    if (request && isOpen) {
      setErrorMsg("");

      const initDefaults = () => {
        const goal = request.targetGoal || "";
        const inst = request.targetInstitution || "";
        const sec = request.sector || "";
        const lvl = request.educationLevel || "Undergraduate Degree";

        setNameOfPath(goal);
        setProgram(goal);
        setDestinationInstitution(inst);
        setSector(sec);
        setDestinationDegree(lvl);
        setDescription(request.goalDetails || "");
        setAdminNotes(
          request.adminNotes ||
            `Your requested pathway for "${goal}" has been reviewed, approved, and officially published by Super Admin.`
        );

        setSteps(createInitialEmptySteps());
      };

      if (request.createdPathId) {
        setLoadingExisting(true);
        axios
          .get(`${BASE_URL}/api/userpaths/steps?pathId=${request.createdPathId}`)
          .then((res) => {
            if (res.data?.status && res.data.data) {
              const p = res.data.data.path || {};
              const stList = res.data.data.steps || [];

              setNameOfPath(p.nameOfPath || p.name || request.targetGoal || "");
              setProgram(
                p.program || p.destination_degree || request.targetGoal || ""
              );
              setDestinationInstitution(
                p.destination_institution || request.targetInstitution || ""
              );
              setSector(p.sector || request.sector || "");
              setDestinationDegree(
                p.destination_degree ||
                  request.educationLevel ||
                  "Undergraduate Degree"
              );
              setDescription(p.description || request.goalDetails || "");
              setAdminNotes(
                request.adminNotes ||
                  `Your requested pathway for "${p.nameOfPath || p.name || request.targetGoal}" has been updated.`
              );

              if (stList.length > 0) {
                setSteps(stList.map((s, idx) => normalizeRawStep(s, idx)));
              } else {
                initDefaults();
              }
            } else {
              initDefaults();
            }
          })
          .catch((err) => {
            console.warn("Could not load existing steps, using defaults:", err);
            initDefaults();
          })
          .finally(() => {
            setLoadingExisting(false);
          });
      } else {
        initDefaults();
      }
    }
  }, [request, isOpen]);

  if (!isOpen || !request) return null;

  // View / Category Switchers
  const handleSwitchView = (stepIdx, viewKey) => {
    setSteps((prev) => {
      const copy = [...prev];
      copy[stepIdx] = { ...copy[stepIdx], activeView: viewKey };
      return copy;
    });
  };

  const handleSwitchCategory = (stepIdx, catKey) => {
    setSteps((prev) => {
      const copy = [...prev];
      copy[stepIdx] = { ...copy[stepIdx], activeCategory: catKey };
      return copy;
    });
  };

  // Change Step-level Field (Name, Description, Duration)
  const handleStepFieldChange = (stepIdx, field, value) => {
    setSteps((prev) => {
      const copy = [...prev];
      copy[stepIdx] = {
        ...copy[stepIdx],
        [field]: value,
      };
      return copy;
    });
  };

  // Change View-level Field (Name, Description, Duration)
  const handleViewFieldChange = (stepIdx, viewKey, field, value) => {
    setSteps((prev) => {
      const copy = [...prev];
      copy[stepIdx] = {
        ...copy[stepIdx],
        [viewKey]: {
          ...copy[stepIdx][viewKey],
          [field]: value,
        },
      };
      return copy;
    });
  };

  // Add Step
  const handleAddStep = () => {
    const nextIdx = steps.length + 1;
    setSteps((prev) => [
      ...prev,
      {
        name: `Step ${nextIdx}: New Milestone`,
        description: "",
        duration: "1 Year",
        activeView: "macro",
        activeCategory: "vendors",
        macro: {
          name: `Step ${nextIdx} (Macro)`,
          desc: "",
          duration: "1 Year",
          access: "free",
          marketplace: [],
        },
        micro: {
          name: `Step ${nextIdx} (Micro)`,
          desc: "",
          duration: "1 Year",
          access: "paid",
          marketplace: [],
        },
        nano: {
          name: `Step ${nextIdx} (Nano)`,
          desc: "",
          duration: "6 Months",
          access: "paid",
          marketplace: [],
        },
      },
    ]);
  };

  // Remove Step
  const handleRemoveStep = (index) => {
    if (steps.length <= 1) {
      alert("A pathway must have at least one step.");
      return;
    }
    setSteps((prev) => prev.filter((_, i) => i !== index));
  };

  // Open add panel for a step
  const handleOpenAddPanel = (stepIdx, currentViewKey) => {
    setActiveAddPanels((prev) => ({ ...prev, [stepIdx]: true }));
    setMarketForm({
      name: "",
      cost: currentViewKey === "macro" ? "Free" : "$49",
      duration: "1 Month",
      discount: "0%",
      access: currentViewKey === "macro" ? "Free" : "Paid",
      goal: "",
      outcomes: "",
    });
  };

  // Close add panel
  const handleCloseAddPanel = (stepIdx) => {
    setActiveAddPanels((prev) => ({ ...prev, [stepIdx]: false }));
  };

  // Save new marketplace item with all fields
  const handleSaveMarketplaceItem = (stepIdx) => {
    const name = (marketForm.name || "").trim();
    if (!name) {
      alert("Please enter a name for the marketplace listing.");
      return;
    }

    const step = steps[stepIdx];
    const currentViewKey = step.activeView || "macro";
    const currentCatKey = step.activeCategory || "vendors";

    const newItem = {
      name,
      category: currentCatKey,
      role: currentCatKey,
      cost: (marketForm.cost || "Free").trim() || "Free",
      duration: marketForm.duration || "1 Month",
      discount: marketForm.discount || "0%",
      access: marketForm.access || "Free",
      goal: (marketForm.goal || "").trim(),
      outcomes: (marketForm.outcomes || "").trim(),
    };

    setSteps((prev) => {
      const copy = [...prev];
      const curList = copy[stepIdx][currentViewKey]?.marketplace || [];
      copy[stepIdx] = {
        ...copy[stepIdx],
        [currentViewKey]: {
          ...copy[stepIdx][currentViewKey],
          marketplace: [...curList, newItem],
        },
      };
      return copy;
    });

    // Close panel and reset form
    setActiveAddPanels((prev) => ({ ...prev, [stepIdx]: false }));
  };

  // Remove Item cleanly by reference
  const handleRemoveMarketplaceItem = (stepIdx, viewKey, itemToRemove) => {
    setSteps((prev) => {
      const copy = [...prev];
      const curList = copy[stepIdx][viewKey]?.marketplace || [];
      copy[stepIdx] = {
        ...copy[stepIdx],
        [viewKey]: {
          ...copy[stepIdx][viewKey],
          marketplace: curList.filter((it) => it !== itemToRemove),
        },
      };
      return copy;
    });
  };



  // Save / Publish Pathway
  const handlePublishPath = async (e) => {
    e.preventDefault();
    if (!nameOfPath.trim()) {
      setErrorMsg("Path name is required.");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");

      const payload = {
        nameOfPath: nameOfPath.trim(),
        program: program.trim() || nameOfPath.trim(),
        destination_institution: destinationInstitution.trim(),
        destination_degree: destinationDegree.trim(),
        description: description.trim(),
        sector: sector.trim(),
        steps: steps.map((s, idx) => ({
          step_order: idx + 1,
          name: s.name || s.macro?.name || `Step ${idx + 1}`,
          description: s.description || s.macro?.desc || "",

          macro_name: s.macro?.name || s.name || `Step ${idx + 1}`,
          macro_description: s.macro?.desc || s.description || "",
          macro_length: s.macro?.duration || s.duration || "1 Year",
          macro_access: s.macro?.access || "free",
          macro_marketplace: s.macro?.marketplace || [],

          micro_name: s.micro?.name || `${s.name || `Step ${idx + 1}`} (Micro)`,
          micro_description: s.micro?.desc || s.description || "",
          micro_length: s.micro?.duration || "1 Year",
          micro_access: s.micro?.access || "paid",
          micro_marketplace: s.micro?.marketplace || [],

          nano_name: s.nano?.name || `${s.name || `Step ${idx + 1}`} (Nano)`,
          nano_description: s.nano?.desc || s.description || "",
          nano_length: s.nano?.duration || "6 Months",
          nano_access: s.nano?.access || "paid",
          nano_marketplace: s.nano?.marketplace || [],

          macro: s.macro,
          micro: s.micro,
          nano: s.nano,
        })),
        adminNotes: adminNotes.trim(),
      };

      const res = await axios.post(
        `${BASE_URL}/api/path-requests/${request._id}/create-path`,
        payload
      );

      if (res.data?.status) {
        if (onPathCreated) {
          onPathCreated(res.data.data.createdPath, res.data.data.request);
        }
        onClose();
      } else {
        setErrorMsg(res.data?.message || "Failed to save pathway.");
      }
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message || err.message || "Failed to save pathway."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sacp-modal-backdrop" onClick={onClose}>
      <div className="sacp-modal-window" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sacp-modal-header">
          <div className="sacp-header-left">
            <div className="sacp-icon">
              <FiLayers />
            </div>
            <div>
              <h3>
                {isEditMode ? "Edit Custom Pathway" : "Create Pathway for Request"}
              </h3>
              <p>
                {isEditMode
                  ? "Configure 3 Views (Macro, Micro, Nano) & 4 Marketplace Tiers for each milestone."
                  : "Publish structured multi-tier milestones and marketplace recommendations."}
              </p>
            </div>
          </div>
          <button
            className="sacp-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <FiX />
          </button>
        </div>

        {/* Body */}
        <div className="sacp-modal-body">
          {/* Minimal Request Info Bar */}
          <div className="sacp-compact-banner">
            <div className="banner-top-row">
              <span className="banner-ticket">{request.requestId || "PR"}</span>
              <span className="banner-user">
                Student: <strong>{request.userName}</strong> ({request.userEmail})
              </span>
              <span className="banner-meta">
                <FiBookOpen size={11} /> {request.targetInstitution || "No University"} · <FiClock size={11} /> {request.targetTimeline || "4 Years"} · <FiTag size={11} /> {request.sector}
              </span>
            </div>
            {request.mandatoryRequirements && (
              <div className="banner-sub-row">
                <strong>Prerequisites:</strong> {request.mandatoryRequirements}
              </div>
            )}
          </div>

          {errorMsg && (
            <div className="sacp-error-box">
              <FiAlertCircle /> {errorMsg}
            </div>
          )}

          {loadingExisting ? (
            <div style={{ textAlign: "center", padding: "24px 0", color: "#94a3b8", fontSize: "13px" }}>
              Loading existing path milestones & marketplace…
            </div>
          ) : (
            <form onSubmit={handlePublishPath}>
              <div className="sacp-section-heading">
                <span>Pathway Specifications</span>
              </div>

              <div className="sacp-form-grid">
                <div className="sacp-field col-full">
                  <label>
                    Path Name / Title <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    value={nameOfPath}
                    onChange={(e) => setNameOfPath(e.target.value)}
                    placeholder="e.g. Stanford University - Computer Science"
                    required
                  />
                </div>

                <div className="sacp-field">
                  <label>Institution / University</label>
                  <input
                    type="text"
                    value={destinationInstitution}
                    onChange={(e) => setDestinationInstitution(e.target.value)}
                    placeholder="e.g. Stanford University"
                  />
                </div>

                <div className="sacp-field">
                  <label>Target Degree / Program</label>
                  <input
                    type="text"
                    value={program}
                    onChange={(e) => setProgram(e.target.value)}
                    placeholder="e.g. Bachelor of Science in CS"
                  />
                </div>

                <div className="sacp-field">
                  <label>Sector / Category</label>
                  <input
                    type="text"
                    value={sector}
                    onChange={(e) => setSector(e.target.value)}
                    placeholder="e.g. Engineering & Technology"
                  />
                </div>

                <div className="sacp-field">
                  <label>Education Stage</label>
                  <input
                    type="text"
                    value={destinationDegree}
                    onChange={(e) => setDestinationDegree(e.target.value)}
                    placeholder="e.g. Undergraduate Degree"
                  />
                </div>

                <div className="sacp-field col-full">
                  <label>Path Description & Overview</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    placeholder="Summary of this curated path..."
                  />
                </div>
              </div>

              {/* Steps Builder */}
              <div className="sacp-section-heading" style={{ marginTop: "16px" }}>
                <span>Roadmap Steps ({steps.length}) — Macro, Micro & Nano Views</span>
                <button
                  type="button"
                  className="add-step-btn"
                  onClick={handleAddStep}
                >
                  <FiPlus /> Add Step
                </button>
              </div>

              <div className="sacp-steps-container">
                {steps.map((st, idx) => {
                  const currentViewKey = st.activeView || "macro";
                  const currentView = st[currentViewKey] || {};
                  const currentCatKey = st.activeCategory || "vendors";
                  const currentCatMeta = CATEGORIES.find((c) => c.key === currentCatKey) || CATEGORIES[0];
                  const marketplaceList = currentView.marketplace || [];

                  // Filter marketplace items for current category
                  const filteredCategoryItems = marketplaceList.filter(
                    (it) => (it.category || it.role || "").toLowerCase().includes(currentCatKey.slice(0, 4))
                  );

                  const isPanelOpen = Boolean(activeAddPanels[idx]);

                  return (
                    <div className="sacp-step-card" key={idx}>
                      {/* Step Header: Title & Duration */}
                      <div className="step-card-header">
                        <span className="step-badge">Step {idx + 1}</span>
                        <input
                          type="text"
                          className="step-title-input"
                          value={st.name || ""}
                          onChange={(e) => handleStepFieldChange(idx, "name", e.target.value)}
                          placeholder={`Step ${idx + 1} Title`}
                          required
                        />
                        <input
                          type="text"
                          className="step-duration-input"
                          value={st.duration || "1 Year"}
                          onChange={(e) => handleStepFieldChange(idx, "duration", e.target.value)}
                          placeholder="Duration"
                        />
                        {steps.length > 1 && (
                          <button
                            type="button"
                            className="remove-step-btn"
                            onClick={() => handleRemoveStep(idx)}
                            title="Remove step"
                          >
                            <FiTrash2 />
                          </button>
                        )}
                      </div>

                      {/* Step Description Field */}
                      <div className="sacp-field" style={{ marginBottom: "10px" }}>
                        <label>Step Description</label>
                        <textarea
                          value={st.description || ""}
                          onChange={(e) => handleStepFieldChange(idx, "description", e.target.value)}
                          rows={2}
                          placeholder={`Overall description for Step ${idx + 1}...`}
                        />
                      </div>

                      {/* 3 Views Segmented Selector */}
                      <div className="sacp-view-tabs">
                        {VIEWS.map((v) => {
                          const isActive = currentViewKey === v.key;
                          return (
                            <button
                              key={v.key}
                              type="button"
                              className={`sacp-view-tab ${isActive ? "active" : ""}`}
                              onClick={() => handleSwitchView(idx, v.key)}
                            >
                              <span
                                className="view-indicator-dot"
                                style={{ backgroundColor: v.color }}
                              />
                              <span className="view-tab-title">{v.label}</span>
                              <span className="view-tab-tag">{v.tag}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Active View Details Box */}
                      <div className="sacp-view-details-box">
                        <div className="sacp-form-grid" style={{ marginBottom: "8px" }}>
                          <div className="sacp-field">
                            <label>{currentViewKey.toUpperCase()} View Title</label>
                            <input
                              type="text"
                              value={currentView.name || ""}
                              onChange={(e) =>
                                handleViewFieldChange(idx, currentViewKey, "name", e.target.value)
                              }
                              placeholder={`${currentViewKey.toUpperCase()} View Title`}
                            />
                          </div>
                          <div className="sacp-field">
                            <label>{currentViewKey.toUpperCase()} Duration</label>
                            <input
                              type="text"
                              value={currentView.duration || "1 Year"}
                              onChange={(e) =>
                                handleViewFieldChange(idx, currentViewKey, "duration", e.target.value)
                              }
                              placeholder="e.g. 1 Year, 6 Months"
                            />
                          </div>
                        </div>

                        <div className="sacp-field" style={{ marginBottom: "10px" }}>
                          <label>{currentViewKey.toUpperCase()} View Description</label>
                          <textarea
                            value={currentView.desc || ""}
                            onChange={(e) =>
                              handleViewFieldChange(idx, currentViewKey, "desc", e.target.value)
                            }
                            rows={2}
                            placeholder={`${currentViewKey.toUpperCase()} View milestones and goals...`}
                          />
                        </div>

                        {/* 4 Marketplace Categories Block */}
                        <div className="sacp-marketplace-block">
                          <div className="sacp-cat-tabs">
                            {CATEGORIES.map((cat) => {
                              const isCatActive = currentCatKey === cat.key;
                              const count = marketplaceList.filter(
                                (it) => (it.category || it.role || "").toLowerCase().includes(cat.key.slice(0, 4))
                              ).length;

                              return (
                                <button
                                  key={cat.key}
                                  type="button"
                                  className={`sacp-cat-tab ${isCatActive ? "active" : ""}`}
                                  onClick={() => handleSwitchCategory(idx, cat.key)}
                                >
                                  <span className="cat-icon">
                                    <cat.Icon size={13} />
                                  </span>
                                  <span className="cat-label">{cat.label}</span>
                                  <span className="cat-count">{count}</span>
                                </button>
                              );
                            })}
                          </div>

                          {/* Marketplace Items for Selected Category */}
                          <div className="sacp-cat-items-area">
                            <div className="sacp-market-items-list">
                              {filteredCategoryItems.length === 0 ? (
                                <div className="sacp-empty-category-msg">
                                  No {currentCatMeta.label} added to {currentViewKey.toUpperCase()} view yet. Click below to add one.
                                </div>
                              ) : (
                                filteredCategoryItems.map((item, itemIdx) => (
                                  <div className="sacp-market-item-row" key={itemIdx}>
                                    <div className="item-main-info">
                                      <div className="item-header-line">
                                        <span className="item-title">{item.name}</span>
                                        <div className="item-header-badges">
                                          <span className={`badge-cost ${item.cost?.toLowerCase() === "free" ? "free" : "paid"}`}>
                                            {item.cost || "Free"}
                                          </span>
                                          {item.access && (
                                            <span className="badge-access">{item.access}</span>
                                          )}
                                        </div>
                                      </div>
                                      {(item.duration || (item.discount && item.discount !== "0%" && item.discount !== "None") || item.goal || item.outcomes) && (
                                        <div className="item-meta-badges">
                                          {item.duration && (
                                            <span className="badge-meta">
                                              <FiClock size={11} /> {item.duration}
                                            </span>
                                          )}
                                          {item.discount && item.discount !== "0%" && item.discount !== "None" && (
                                            <span className="badge-discount">
                                              {item.discount.toLowerCase().includes("off") ? item.discount : `${item.discount} Off`}
                                            </span>
                                          )}
                                          {item.goal && (
                                            <span className="badge-goal">
                                              <strong>Goal:</strong> {item.goal}
                                            </span>
                                          )}
                                          {item.outcomes && (
                                            <span className="badge-outcome">
                                              <strong>Outcome:</strong> {item.outcomes}
                                            </span>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                    <button
                                      type="button"
                                      className="item-remove-btn"
                                      onClick={() =>
                                        handleRemoveMarketplaceItem(idx, currentViewKey, item)
                                      }
                                      title={`Remove ${item.name || currentCatMeta.singular}`}
                                    >
                                      <FiTrash2 size={13} />
                                    </button>
                                  </div>
                                ))
                              )}
                            </div>

                            {/* Add Item Panel / Button */}
                            {isPanelOpen ? (
                              <div className="sacp-add-market-panel">
                                <div className="panel-header">
                                  <span>
                                    Add New {currentCatMeta.singular} ({currentViewKey.toUpperCase()} View)
                                  </span>
                                  <button
                                    type="button"
                                    className="panel-close-btn"
                                    onClick={() => handleCloseAddPanel(idx)}
                                    title="Close form"
                                  >
                                    ✕
                                  </button>
                                </div>

                                <div className="sacp-form-grid">
                                  <div className="sacp-field col-full">
                                    <label>
                                      Resource / Listing Name <span className="req">*</span>
                                    </label>
                                    <input
                                      type="text"
                                      placeholder={`Enter ${currentCatMeta.singular} name...`}
                                      value={marketForm.name}
                                      onChange={(e) =>
                                        setMarketForm((prev) => ({ ...prev, name: e.target.value }))
                                      }
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                          e.preventDefault();
                                          handleSaveMarketplaceItem(idx);
                                        }
                                      }}
                                      autoFocus
                                    />
                                  </div>

                                  <div className="sacp-field">
                                    <label>Cost</label>
                                    <input
                                      type="text"
                                      placeholder="e.g. Free, $49, $150/hr"
                                      value={marketForm.cost}
                                      onChange={(e) =>
                                        setMarketForm((prev) => ({ ...prev, cost: e.target.value }))
                                      }
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                          e.preventDefault();
                                          handleSaveMarketplaceItem(idx);
                                        }
                                      }}
                                    />
                                  </div>

                                  <div className="sacp-field">
                                    <label>Duration</label>
                                    <select
                                      value={marketForm.duration}
                                      onChange={(e) =>
                                        setMarketForm((prev) => ({ ...prev, duration: e.target.value }))
                                      }
                                    >
                                      <option value="Self-Paced">Self-Paced</option>
                                      <option value="1 Day">1 Day</option>
                                      <option value="1 Week">1 Week</option>
                                      <option value="2 Weeks">2 Weeks</option>
                                      <option value="1 Month">1 Month</option>
                                      <option value="3 Months">3 Months</option>
                                      <option value="6 Months">6 Months</option>
                                      <option value="1 Year">1 Year</option>
                                      <option value="Not Applicable">Not Applicable</option>
                                    </select>
                                  </div>

                                  <div className="sacp-field">
                                    <label>Discount</label>
                                    <select
                                      value={marketForm.discount}
                                      onChange={(e) =>
                                        setMarketForm((prev) => ({ ...prev, discount: e.target.value }))
                                      }
                                    >
                                      <option value="0%">0% (None)</option>
                                      <option value="10%">10% Off</option>
                                      <option value="20%">20% Off</option>
                                      <option value="25%">25% Off</option>
                                      <option value="50%">50% Off</option>
                                      <option value="Scholarship Available">Scholarship Available</option>
                                    </select>
                                  </div>

                                  <div className="sacp-field">
                                    <label>Access Tier</label>
                                    <select
                                      value={marketForm.access}
                                      onChange={(e) =>
                                        setMarketForm((prev) => ({ ...prev, access: e.target.value }))
                                      }
                                    >
                                      <option value="Free">Free</option>
                                      <option value="Paid">Paid</option>
                                      <option value="Covered under Subscription">Covered under Subscription</option>
                                      <option value="Invite Only">Invite Only</option>
                                    </select>
                                  </div>

                                  <div className="sacp-field col-full">
                                    <label>Goal / Purpose / Outcome</label>
                                    <input
                                      type="text"
                                      placeholder="e.g. Prerequisite coursework, essay review, portfolio guidance..."
                                      value={marketForm.goal}
                                      onChange={(e) =>
                                        setMarketForm((prev) => ({ ...prev, goal: e.target.value }))
                                      }
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                          e.preventDefault();
                                          handleSaveMarketplaceItem(idx);
                                        }
                                      }}
                                    />
                                  </div>

                                  <div className="sacp-field col-full">
                                    <label>Key Deliverables / Outcomes (Optional)</label>
                                    <input
                                      type="text"
                                      placeholder="e.g. Verified certificate, letter of recommendation, completed repo..."
                                      value={marketForm.outcomes || ""}
                                      onChange={(e) =>
                                        setMarketForm((prev) => ({ ...prev, outcomes: e.target.value }))
                                      }
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                          e.preventDefault();
                                          handleSaveMarketplaceItem(idx);
                                        }
                                      }}
                                    />
                                  </div>
                                </div>

                                <div className="panel-actions">
                                  <button
                                    type="button"
                                    className="sacp-btn sacp-btn--ghost"
                                    onClick={() => handleCloseAddPanel(idx)}
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="button"
                                    className="sacp-btn sacp-btn--save-item"
                                    onClick={() => handleSaveMarketplaceItem(idx)}
                                  >
                                    <FiPlus /> Add {currentCatMeta.singular}
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                type="button"
                                className="sacp-open-add-btn"
                                onClick={() => handleOpenAddPanel(idx, currentViewKey)}
                              >
                                <FiPlus /> {filteredCategoryItems.length > 0 ? `Add Another ${currentCatMeta.singular}` : `Add ${currentCatMeta.singular} to ${currentViewKey.toUpperCase()} View`}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Admin Response Note */}
              <div className="sacp-section-heading" style={{ marginTop: "16px" }}>
                <span>Super Admin Message to Student</span>
              </div>
              <div className="sacp-field" style={{ marginBottom: "0.5rem" }}>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={2}
                  placeholder="Feedback or guidance message shown to the student..."
                />
              </div>

              <div className="sacp-modal-footer">
                <span className="footer-hint">
                  <FiClock /> Path will be set to <strong>Active</strong> with Macro, Micro & Nano steps.
                </span>
                <div className="footer-btns">
                  <button
                    type="button"
                    className="sacp-btn sacp-btn--ghost"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="sacp-btn sacp-btn--primary"
                    disabled={loading}
                  >
                    <FiCheckCircle />{" "}
                    {loading
                      ? "Saving…"
                      : isEditMode
                      ? "Save & Update Pathway"
                      : "Publish Pathway"}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
