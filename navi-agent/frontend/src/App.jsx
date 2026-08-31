import { useEffect, useState } from "react";
import { Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
import AuthFlow, { useAuth, logout } from "./pages/authflow";
import Dashboard from "./pages/Dashboard";
import StepDetail from "./pages/StepDetail";
import Marketplace from "./pages/Marketplace";
import AdminReview from "./pages/Adminreview";
import ProfileDetails from "./pages/ProfileDetails";
import Analytics from "./pages/Analytics";
import Feedbacks from "./pages/Feedbacks";
import SavedMarketplace from "./pages/SavedMarketplace";
import {
  IconArrowLeft,
  IconBuilding,
  IconMap,
  IconMenu,
  IconNavigation,
  IconPin,
  IconRoute,
  IconShoppingCart,
  IconTarget,
  IconCheck,
  Icongraph,
  IconUser,
  IconLogOut,
  IconMessageSquare,
  IconBookmark,
} from "./pages/Icons";
import "./App.css";

const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://127.0.0.1:8001" : "");

function buildPositionLabel(profile) {
  if (!profile) return "Profile unavailable";
  return [profile.grade, profile.stream, profile.country].filter(Boolean).join(" • ") || "Current position";
}

async function pathRecordExists(dbId) {
  if (!dbId) return false;
  try {
    const res = await fetch(`${API}/api/paths/${dbId}`);
    return res.ok;
  } catch {
    return true;
  }
}

function stripSavedState(path) {
  if (!path) return path;
  const { db_id, status, ...rest } = path;
  return rest;
}

async function removeStaleSavedIds(pathData) {
  if (!pathData) return pathData;

  if (pathData.alternatives) {
    let changed = false;
    const alternatives = await Promise.all(pathData.alternatives.map(async (alt) => {
      if (!alt?.db_id) return alt;
      const exists = await pathRecordExists(alt.db_id);
      if (exists) return alt;
      changed = true;
      return stripSavedState(alt);
    }));
    return changed ? { ...pathData, alternatives } : pathData;
  }

  if (pathData.db_id) {
    const exists = await pathRecordExists(pathData.db_id);
    if (!exists) return stripSavedState(pathData);
  }

  return pathData;
}

export default function App() {
  const { user, profile: savedProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [authed, setAuthed] = useState(!!user);
  const [activeEmail, setActiveEmail] = useState(user || "");
  const [profile, setProfile] = useState(savedProfile);

  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth > 900);

  const [pathData, setPathData] = useState(() => {
    const email = (() => {
      try { return JSON.parse(localStorage.getItem("nv_session") || "null"); }
      catch { return null; }
    })();
    if (!email) return null;
    try {
      return JSON.parse(localStorage.getItem(`nv_path_data_${email.toLowerCase()}`) || "null");
    } catch {
      return null;
    }
  });

  const [selectedAltIdx, setSelectedAltIdx] = useState(0);
  const [userInput, setUserInput] = useState(() => {
    const email = (() => {
      try { return JSON.parse(localStorage.getItem("nv_session") || "null"); }
      catch { return null; }
    })();
    if (!email) return { current: "", goal: "" };
    try {
      return JSON.parse(localStorage.getItem(`nv_user_input_${email.toLowerCase()}`) || '{"current": "", "goal": ""}') || { current: "", goal: "" };
    } catch {
      return { current: "", goal: "" };
    }
  });

  const [activeStep, setActiveStep] = useState(null);
  const [activeView, setActiveView] = useState(null);

  const activePath = pathData?.alternatives
    ? pathData.alternatives[selectedAltIdx] || pathData.alternatives[0]
    : pathData;
  const savedNav = (() => {
    if (!activeEmail) return {};
    try {
      return JSON.parse(localStorage.getItem(`nv_active_nav_${activeEmail.toLowerCase()}`) || "{}") || {};
    } catch {
      return {};
    }
  })();
  const routeStepMatch = location.pathname.match(/^\/(?:step-detail|marketplace)\/([^/]+)/);
  const routeStepId = routeStepMatch ? Number(routeStepMatch[1]) : Number(savedNav.stepId) || null;
  const routeViewMatch = location.pathname.match(/^\/marketplace\/[^/]+\/([^/]+)/);
  const routeView = routeViewMatch?.[1] || savedNav.view || null;
  const routeStep = routeStepId
    ? activePath?.steps?.find(step => Number(step.id) === routeStepId)
    : null;
  const currentStep = routeStep || activeStep;
  const currentView = routeView || activeView || "macro";

  function handleAuthenticated(email, profileData) {
    console.log("[Naavi App] User authenticated:", email);
    // Use window.location.replace for a guaranteed navigation.
    // The async login handler (after await) makes React state transitions
    // unreliable — a full page reload reads the freshly saved localStorage
    // session and renders the dashboard correctly every time.
    window.location.replace("/dashboard");
  }

  function handleLogout() {
    console.log("[Naavi App] User logging out.");
    if (activeEmail) {
      localStorage.removeItem(`nv_path_data_${activeEmail.toLowerCase()}`);
      localStorage.removeItem(`nv_user_input_${activeEmail.toLowerCase()}`);
      localStorage.removeItem(`nv_active_nav_${activeEmail.toLowerCase()}`);
    }
    logout();
    // Full page reload to login — clears all React state cleanly.
    window.location.replace("/login");
  }

  if (!authed) {
    return (
      <Routes>
        <Route path="/login" element={<AuthFlow onAuthenticated={handleAuthenticated} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  const goTo = (p) => {
    console.log("[Naavi App] Navigation trigger to view:", p);
    const routeMap = {
      dashboard: "/dashboard",
      profile: "/profile",
      stepdetail: currentStep ? `/step-detail/${currentStep.id}` : "/step-detail",
      marketplace: currentStep ? `/marketplace/${currentStep.id}/${currentView}` : "/marketplace",
      adminreview: "/admin-review",
      analytics: "/analytics",
      feedbacks: "/feedbacks",
      savedmarketplace: "/saved-marketplace",
    };
    navigate(routeMap[p] || "/dashboard");
    // Auto-close sidebar on mobile after selecting a page
    if (window.innerWidth <= 900) {
      setSidebarOpen(false);
    }
  };

  const handleGenerationStart = (input, isRegen = false) => {
    console.log("[Naavi App] Generation Start requested. Input:", input, "isRegen:", isRegen);
    setUserInput(input);
    if (!isRegen) {
      console.log("[Naavi App] Clearing old path data (not a tab-isolated regeneration).");
      setPathData(null); // Clear old path while generating
      setSelectedAltIdx(0);
      if (activeEmail) {
        localStorage.removeItem(`nv_path_data_${activeEmail.toLowerCase()}`);
      }
    } else {
      console.log("[Naavi App] Tab-isolated regeneration. Retaining remaining alternative paths.");
    }
    setSidebarOpen(false); // Auto-collapse sidebar so the path panel has full width
    if (activeEmail) {
      localStorage.setItem(`nv_user_input_${activeEmail.toLowerCase()}`, JSON.stringify(input));
    }
  };

  const handlePathGenerated = (data, input) => {
    console.log("[Naavi App] Path generated/updated. Data:", data, "Input:", input);
    setPathData(data);
    const checkedInput = input || { current: "", goal: "" };
    setUserInput(checkedInput);
    if (data?.alternatives) {
      if (selectedAltIdx >= data.alternatives.length) {
        setSelectedAltIdx(0);
      }
    } else {
      setSelectedAltIdx(0);
    }
    // stay on dashboard — path renders inline on right
    if (activeEmail) {
      localStorage.setItem(`nv_path_data_${activeEmail.toLowerCase()}`, JSON.stringify(data));
      localStorage.setItem(`nv_user_input_${activeEmail.toLowerCase()}`, JSON.stringify(checkedInput));
    }
  };

  useEffect(() => {
    if (!activeEmail || !pathData) return;

    let canceled = false;
    removeStaleSavedIds(pathData).then((checkedPathData) => {
      if (canceled || checkedPathData === pathData) return;
      console.log("[Naavi App] Removed stale saved DB reference from cached path data.");
      setPathData(checkedPathData);
      localStorage.setItem(`nv_path_data_${activeEmail.toLowerCase()}`, JSON.stringify(checkedPathData));
    });

    return () => {
      canceled = true;
    };
  }, [activeEmail, pathData]);

  const handleProfileUpdated = (newProfile) => {
    console.log("[Naavi App] Student Signals profile updated. Resetting path cache. New profile:", newProfile);
    setProfile(newProfile);
    setPathData(null);
    setUserInput({ current: "", goal: "" });
    setSelectedAltIdx(0);
    if (activeEmail) {
      localStorage.removeItem(`nv_path_data_${activeEmail.toLowerCase()}`);
      localStorage.removeItem(`nv_user_input_${activeEmail.toLowerCase()}`);
      localStorage.removeItem(`nv_active_nav_${activeEmail.toLowerCase()}`);
    }
  };

  const handleStepClick = (step) => {
    console.log("[Naavi App] Step selected to explore:", step);
    setActiveStep(step);
    setActiveView("macro"); // Reset back to macro when exploring a new step
    if (activeEmail) {
      localStorage.setItem(`nv_active_nav_${activeEmail.toLowerCase()}`, JSON.stringify({ stepId: step.id, view: "macro" }));
    }
    navigate(`/step-detail/${step.id}`);
  };

  const handleStepPatched = (stepId, field, newValue) => {
    console.log("[Naavi App] Step patched — stepId:", stepId, "field:", field);
    // Update the patched field inside pathData without touching other steps
    setPathData(prev => {
      if (!prev) return prev;
      const updateStepsArr = (stepsArr) =>
        stepsArr.map(s => {
          if (s.id !== stepId) return s;
          if (field === "__step__") return newValue;
          return { ...s, [field]: newValue };
        });

      let updated;
      if (prev.alternatives) {
        updated = {
          ...prev,
          alternatives: prev.alternatives.map((alt, idx) => idx === selectedAltIdx
            ? { ...alt, steps: updateStepsArr(alt.steps || []) }
            : alt
          )
        };
      } else {
        updated = { ...prev, steps: updateStepsArr(prev.steps || []) };
      }
      // Persist to localStorage
      if (activeEmail) {
        localStorage.setItem(`nv_path_data_${activeEmail.toLowerCase()}`, JSON.stringify(updated));
      }
      return updated;
    });
    // Also update the activeStep so StepDetail reflects the new value immediately
    setActiveStep(prev => {
      if (prev?.id !== stepId) return prev;
      if (field === "__step__") return newValue;
      return { ...prev, [field]: newValue };
    });
  };

  const handleViewClick = (view) => {
    console.log("[Naavi App] Selecting step view in marketplace details:", view);
    setActiveView(view);
    const step = currentStep || activeStep;
    if (activeEmail && step) {
      localStorage.setItem(`nv_active_nav_${activeEmail.toLowerCase()}`, JSON.stringify({ stepId: step.id, view }));
    }
    navigate(step ? `/marketplace/${step.id}/${view}` : "/marketplace");
  };

  const handleBack = () => {
    const currentPath = location.pathname;
    console.log("[Naavi App] Back button clicked from page:", currentPath);
    if (currentPath.startsWith("/marketplace")) {
      const step = currentStep || activeStep;
      navigate(step ? `/step-detail/${step.id}` : "/dashboard");
    }
    else if (currentPath.startsWith("/step-detail")) navigate("/dashboard");
    else if (currentPath.startsWith("/admin-review/")) navigate("/admin-review");
    else navigate("/dashboard");
  };

  const navItems = [
    { key: "dashboard", label: "Dashboard", Icon: IconNavigation, enabled: true },
    { key: "stepdetail", label: "Step Details", Icon: IconMap, enabled: !!currentStep },
    { key: "marketplace", label: "Marketplace", Icon: IconShoppingCart, enabled: !!currentStep },
    { key: "savedmarketplace", label: "Saved", Icon: IconBookmark, enabled: true },
    { key: "adminreview", label: "Admin Review", Icon: IconCheck, enabled: true },
    { key: "feedbacks", label: "Feedbacks", Icon: IconMessageSquare, enabled: true },
    { key: "analytics", label: "Analytics", Icon: Icongraph, enabled: true },
    { key: "profile", label: "Student Signals", Icon: IconUser, enabled: true },
  ];

  const currentPath = location.pathname;
  const isDashboard = currentPath === "/" || currentPath === "/dashboard";

  return (
    <div className={`app-root maps-shell ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>

      {/* Dim backdrop mask for mobile screens */}
      {sidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside className="app-sidebar">
        <div className="sidebar-brand" onClick={() => goTo("dashboard")}>
          <img
            src={sidebarOpen ? "/naavi_logo.png" : "/naavi_favicon.png"}
            alt="naavi logo"
            className="logo-image-sidebar"
          />
          <div className="sidebar-brand-copy">
            {/* <span className="logo-name">Naavi</span>
            <span className="logo-tag">AI Path Engine</span> */}
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(item => {
            const isActive = (item.key === "dashboard" && isDashboard) ||
              (item.key === "profile" && currentPath === "/profile") ||
              (item.key === "stepdetail" && currentPath.startsWith("/step-detail")) ||
              (item.key === "marketplace" && currentPath.startsWith("/marketplace")) ||
              (item.key === "savedmarketplace" && currentPath === "/saved-marketplace") ||
              (item.key === "adminreview" && currentPath.startsWith("/admin-review")) ||
              (item.key === "feedbacks" && currentPath === "/feedbacks") ||
              (item.key === "analytics" && currentPath === "/analytics");
            return (
              <button
                key={item.key}
                className={`sidebar-nav-item ${isActive ? "active" : ""}`}
                onClick={() => item.enabled && goTo(item.key)}
                disabled={!item.enabled}
                title={item.label}
              >
                <span className="sidebar-nav-icon"><item.Icon size={18} /></span>
                <span className="sidebar-nav-label">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-logout-btn" onClick={handleLogout} title="Log out">
            <span className="sidebar-logout-icon"><IconLogOut size={18} /></span>
            <span className="sidebar-logout-label">Log out</span>
          </button>
        </div>
      </aside>

      {/* ── Workspace ── */}
      <div className="app-workspace">

        {/* Topbar */}
        <header className={`maps-topbar ${!isDashboard ? "has-back" : ""}`}>
          <button className="hamburger-btn" onClick={() => setSidebarOpen(o => !o)} aria-label="Open navigation menu">
            <IconMenu size={20} />
          </button>

          {!isDashboard && (
            <button className="nav-back" onClick={handleBack} aria-label="Go back">
              <IconArrowLeft size={15} /> <span className="nav-back-label">Back</span>
            </button>
          )}

          <div className="route-searchbar" aria-label="Current career route">
            <div className="route-search-point"><IconPin size={14} /></div>
            <div className="route-search-copy route-from">
              <span>From</span>
              <strong>{userInput?.current || buildPositionLabel(profile) || "Please select"}</strong>
            </div>
            <div className="route-search-divider" />
            <div className="route-search-point goal"><IconTarget size={14} /></div>
            <div className="route-search-copy route-to">
              <span>To</span>
              <strong style={{ color: !userInput?.goal ? "#94a3b8" : "inherit" }}>
                {userInput?.goal || "Please select"}
              </strong>
            </div>
            <div className="route-search-divider" />
            <div className="route-search-copy route-steps">
              <span>Steps</span>
              <strong style={{ color: !pathData ? "#94a3b8" : "inherit" }}>
                {pathData
                  ? `${(pathData?.alternatives
                      ? pathData.alternatives[selectedAltIdx] || pathData.alternatives[0]
                      : pathData
                    )?.steps?.length || 0} steps`
                  : "Please select"}
              </strong>
            </div>
          </div>

          <div className="topbar-profile">
            <IconBuilding size={15} />
            <span>{profile?.city || activeEmail}</span>
          </div>
        </header>

        {/* Main content */}
        <main className="app-main">
          <Routes>
            <Route path="/login" element={<Navigate to="/dashboard" replace />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={
              <Dashboard
                profile={profile}
                pathData={pathData}
                userInput={userInput}
                initialCurrent={[profile?.grade, profile?.curriculum, profile?.country].filter(Boolean).join(" • ") || ""}
                onPathGenerated={handlePathGenerated}
                onStepClick={handleStepClick}
                onGenerationStart={handleGenerationStart}
                onProfileUpdated={handleProfileUpdated}
                selectedAltIdx={selectedAltIdx}
                setSelectedAltIdx={setSelectedAltIdx}
                onStepPatched={handleStepPatched}
              />
            } />
            <Route path="/profile" element={
              <ProfileDetails
                profile={profile}
                onProfileUpdated={handleProfileUpdated}
                onBack={() => navigate("/dashboard")}
              />
            } />
            <Route path="/step-detail/:stepId?" element={
              currentStep ? (
                <StepDetail
                  step={currentStep}
                  initialView={currentView}
                  onViewClick={handleViewClick}
                  onBack={() => navigate("/dashboard")}
                  userInput={userInput}
                  profile={profile}
                  onStepPatched={handleStepPatched}
                />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            } />
            <Route path="/marketplace/:stepId?/:view?" element={
              currentStep ? (
                <Marketplace
                  step={currentStep}
                  view={currentView}
                  onBack={() => navigate(`/step-detail/${currentStep.id}`)}
                  userInput={userInput}
                  profile={profile}
                  onStepPatched={handleStepPatched}
                />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            } />
            <Route path="/admin-review/:pathId" element={
              <AdminReview
                pathData={pathData}
                userInput={userInput}
                profile={profile}
                onBack={() => navigate("/admin-review")}
              />
            } />
            <Route path="/admin-review" element={
              <AdminReview
                pathData={pathData}
                userInput={userInput}
                profile={profile}
                onBack={() => navigate("/dashboard")}
              />
            } />
            <Route path="/saved-marketplace" element={<SavedMarketplace />} />
            <Route path="/feedbacks" element={<Feedbacks />} />
            <Route path="/analytics" element={<Analytics />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
