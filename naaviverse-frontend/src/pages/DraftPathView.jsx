// src/pages/DraftPathView.jsx
import React, { useEffect, useState } from "react";
import {
  useParams,
  useNavigate,
  useSearchParams,
  Link
} from "react-router-dom";
import axios from "axios";
import "../components/Pathview/journey.scss";
import EditPathForm from "./MyPaths/paths";
import CreateNewStep from "./accDashbaoard/CreateNewStep";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const DraftPathView = ({ onAddStep }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [editOpen, setEditOpen] = useState(false);
  const [pathData, setPathData] = useState(null);
  const [steps, setSteps] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDrawer, setOpenDrawer] = useState(false);

  const [serviceDrawerOpen, setServiceDrawerOpen] = useState(false);
  const [selectedStepForService, setSelectedStepForService] = useState(null);
  const [availableServices, setAvailableServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [createStepOpen, setCreateStepOpen] = useState(false);
  
  // Recent states
  const [recentSteps, setRecentSteps] = useState([]);
  const [recentServices, setRecentServices] = useState([]);

  // Fetch path + steps
  useEffect(() => {
    const pathId = id || localStorage.getItem("selectedPathId");
    if (!pathId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        console.log("🔍 Fetching path data for ID:", pathId);
        const pathRes = await axios.get(`/api/paths/viewpath/${pathId}`);
        setPathData(pathRes.data.data);
        console.log("✅ Path data:", pathRes.data.data);

        await fetchSteps(pathId);
      } catch (err) {
        console.log("❌ Error fetching:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Separate function to fetch steps
  const fetchSteps = async (pathId) => {
    try {
      const stepsRes = await axios.get(`/api/steps/get`, {
        params: { path_id: pathId },
      });

      const fetchedSteps = stepsRes.data.data || [];
      setSteps(fetchedSteps);
      console.log("✅ Steps fetched:", fetchedSteps.length);
      
      // After setting steps, extract services from them
      extractServicesFromSteps(fetchedSteps);
      
      return fetchedSteps;
    } catch (err) {
      console.log("❌ Error fetching steps:", err);
      return [];
    }
  };

  // Extract services from steps data
  const extractServicesFromSteps = (stepsArray) => {
    if (!stepsArray || stepsArray.length === 0) {
      setServices([]);
      setRecentServices([]);
      return;
    }

    console.log("📦 Extracting services from steps data...");
    
    // Collect all services from all steps
    const allServices = [];
    
    stepsArray.forEach(step => {
      // Check if step has services array
      if (step.services && Array.isArray(step.services)) {
        console.log(`📍 Step "${step.name}" has ${step.services.length} services`);
        allServices.push(...step.services);
      } else {
        console.log(`📍 Step "${step.name}" has no services array`);
      }
    });
    
    console.log("🔗 Total services collected from steps:", allServices.length);
    
    // Remove duplicates by service ID
    const uniqueServicesMap = new Map();
    allServices.forEach(service => {
      if (service && service._id) {
        uniqueServicesMap.set(service._id, service);
      }
    });
    
    const uniqueServices = Array.from(uniqueServicesMap.values());
    console.log("✨ Unique services:", uniqueServices.length);
    console.log("📝 Service details:", uniqueServices);
    
    setServices(uniqueServices);
    
    // Set recent services (last 2)
    if (uniqueServices.length > 0) {
      const sorted = [...uniqueServices].sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return new Date(b.createdAt) - new Date(a.createdAt);
        }
        return 0;
      });
      setRecentServices(sorted.slice(0, 2));
    } else {
      setRecentServices([]);
    }
  };

  // Update recent steps (last 2)
  useEffect(() => {
    if (steps.length > 0) {
      const sorted = [...steps].sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return new Date(b.createdAt) - new Date(a.createdAt);
        }
        return 0;
      });
      setRecentSteps(sorted.slice(0, 2));
    }
  }, [steps]);

  // Check query param
  useEffect(() => {
    const shouldOpen = searchParams.get("createStep");
    setOpenDrawer(shouldOpen === "true");
  }, [searchParams]);

  // Services logic for assignment drawer
  const handleStepSelect = async (step) => {
    setSelectedStepForService(step);
    console.log("🔍 Selected step for service assignment:", step);

    try {
      const partner = JSON.parse(localStorage.getItem("partner"));
      const email = partner?.email;

      const allRes = await axios.get(`/api/services/getservices`, {
        params: { productcreatoremail: email },
      });

      const allServices = allRes.data.data || [];

      // Get attached services from the step object first
      const attachedServices = step.services || [];
      const attachedIds = attachedServices.map((s) => s._id);

      const filtered = allServices.filter(
        (service) => !attachedIds.includes(service._id)
      );

      setAvailableServices(filtered);
    } catch (err) {
      console.log("❌ Error loading services:", err);
    }
  };

  const toggleService = (id) => {
    setSelectedServices((prev) =>
      prev.includes(id)
        ? prev.filter((s) => s !== id)
        : [...prev, id]
    );
  };

  const handleAssignServices = async () => {
    if (!selectedStepForService || selectedServices.length === 0) return;

    try {
      console.log("📤 Assigning services:", selectedServices);
      
      // Show loading state if needed
      setLoading(true);
      
      // Make the API call to attach services
      await axios.post(`${BASE_URL}/api/steps/attachservice`, {
        step_id: selectedStepForService._id,
        service_ids: selectedServices,
      });

      alert("Services assigned successfully!");

      // CRITICAL: Wait a moment for the backend to update
      await new Promise(resolve => setTimeout(resolve, 500));

      // Refresh steps to get updated service lists
      const pathId = id || localStorage.getItem("selectedPathId");
      const stepsRes = await axios.get(`/api/steps/get`, {
        params: { path_id: pathId },
      });
      
      const updatedSteps = stepsRes.data.data || [];
      console.log("✅ Updated steps after assignment:", updatedSteps);
      
      setSteps(updatedSteps);
      
      // Extract services from the updated steps
      extractServicesFromSteps(updatedSteps);

      // Close the drawer and reset states
      setServiceDrawerOpen(false);
      setSelectedStepForService(null);
      setAvailableServices([]);
      setSelectedServices([]);
      
    } catch (err) {
      console.log("❌ Error assigning services:", err);
      alert("Failed to assign services. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Submit for approval
  const handleSubmitForApproval = async () => {
    try {
      await axios.put("/api/paths/submit", {
        pathId: id,
      });

      alert("Path submitted for approval successfully!");

      const updated = await axios.get(`/api/paths/viewpath/${id}`);
      setPathData(updated.data.data);
    } catch (err) {
      console.log("Error submitting path:", err);
    }
  };

  // Helper function
  const formatDate = (dateString) => {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatPrice = (service) => {
    if (!service.billing_cycle) return "Free";
    
    if (service.billing_cycle.monthly?.price) {
      return `$${service.billing_cycle.monthly.price}/mo`;
    }
    if (service.billing_cycle.lifetime?.price) {
      return `$${service.billing_cycle.lifetime.price}`;
    }
    return "Free";
  };

  if (!pathData) return (
    <div className="journeypage" style={{ padding: "35px" }}>
      <div style={{ textAlign: "center", padding: "3rem" }}>Loading...</div>
    </div>
  );
  
  const isLocked = pathData.status === "waitingforapproval";
  
  console.log("🔄 Rendering - services.length:", services.length);
  
  return (
    <div className="journeypage" style={{ padding: "20px 35px" }}>
      {/* HEADER */}
      <div className="journey-top-area">
        <div className="path-title-row">
          <h1 className="path-title">{pathData.nameOfPath}</h1>
          {pathData.status === "draft" && (
            <span className="draft-badge">DRAFT</span>
          )}
        </div>

        <p className="path-description">
          {pathData.description}
        </p>

        <div className="path-actions">
          <button
            className="btn-outline-premium"
            disabled={isLocked}
            onClick={() => {
              if (!isLocked && onAddStep) {
                onAddStep(id);
              }
            }}
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3v14M3 10h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Add Step
          </button>

          <button
            className="btn-outline-premium"
            disabled={isLocked}
            onClick={() => !isLocked && setEditOpen(true)}
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            Edit Path
          </button>

          <button
            className="btn-outline-premium"
            disabled={isLocked}
            onClick={() => !isLocked && setServiceDrawerOpen(true)}
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm8 4a2 2 0 11-4 0 2 2 0 014 0z" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            Add Services
          </button>

          {!isLocked && (
            <button
              className="btn-primary-premium"
              onClick={handleSubmitForApproval}
            >
              Submit for Approval
            </button>
          )}
        </div>
      </div>

      {/* RECENT STEPS SECTION */}
      {steps.length > 0 && (
        <div className="section-wrapper steps-section">
          <div className="section-header">
            <div className="section-title-block">
              <div className="section-icon steps-icon">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path d="M5 3h10v4H5zM5 9h10v4H5zM5 15h10v2H5z" />
                </svg>
              </div>
              <div>
                <h3>Recent Steps</h3>
                <p>Last {recentSteps.length} step{recentSteps.length !== 1 ? "s" : ""} added</p>
              </div>
            </div>

            <Link to={`/paths/${id}/steps`} className="section-view-link">
              View All Steps ({steps.length})
            </Link>
          </div>

          <div className="section-grid">
            {recentSteps.map((step) => (
              <div
                key={step._id}
                className="section-card"
                onClick={() =>
                  navigate(`/paths/${id}/steps`, { state: { selectedStep: step } })
                }
              >
                <div className="card-badge">
                  {steps.findIndex(s => s._id === step._id) + 1}
                </div>

                <h4>{step.name}</h4>

                <p className="card-desc">
                  {step.macroDescription || step.description || "No description available"}
                </p>

                <div className="card-meta">
                  <span>{formatDate(step.createdAt)}</span>
                  {step.services?.length > 0 && (
                    <span className="meta-pill">
                      {step.services.length} service{step.services.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

     

{/* SERVICES ATTACHED TO THIS PATH SECTION */}
{services.length > 0 && (
  <div className="section-wrapper services-section">
    <div className="section-header">
      <div className="section-title-block">
        <div className="section-icon services-icon">
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path d="M3 5h14v10H3z" />
          </svg>
        </div>
        <div>
          <h3>Services in this Path</h3>
          <p>
            Last {recentServices.length} service
            {recentServices.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <Link
        to={`/services/all`}
        state={{ attachedServices: services }}
        className="section-view-link"
      >
        View All Services ({services.length})
      </Link>
    </div>

    <div className="section-grid">
      {recentServices.map((service) => (
        <div
          key={service._id}
          className="section-card"
          onClick={() =>
            navigate(`/services/all`, {
              state: { selectedService: service },
            })
          }
        >
          <h4>{service.name}</h4>

          <p className="card-desc">
            {service.description || "No description"}
          </p>

          <div className="card-meta">
            <span>{formatPrice(service)}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
)}

      {/* NO STEPS/SERVICES STATE */}
      {steps.length === 0 && services.length === 0 && (
        <div className="empty-state-section">
          <h2>No steps or services added yet.</h2>
          <p>Click "Add Step" to begin creating steps or "Add Services" to add services.</p>
        </div>
      )}

      {/* EDIT PATH DRAWER */}
      {editOpen && (
        <div className="global-drawer-overlay" onClick={() => setEditOpen(false)}>
          <div className="global-drawer-panel" onClick={(e) => e.stopPropagation()}>
            <EditPathForm
              selectedPath={pathData}
              onSave={async () => {
                const updated = await axios.get(`/api/paths/viewpath/${id}`);
                setPathData(updated.data.data);
                setEditOpen(false);
              }}
              onCancel={() => setEditOpen(false)}
            />
          </div>
        </div>
      )}

      {/* ADD STEP DRAWER */}
      {createStepOpen && (
        <div className="global-drawer-overlay" onClick={() => setCreateStepOpen(false)}>
          <div className="global-drawer-panel" onClick={(e) => e.stopPropagation()}>
            <CreateNewStep
              inlineMode={true}
              pathId={id}
              onSuccess={async () => {
                await fetchSteps(id);
                setCreateStepOpen(false);
              }}
              onCancel={() => setCreateStepOpen(false)}
            />
          </div>
        </div>
      )}

      {/* ADD SERVICES DRAWER */}
      {serviceDrawerOpen && (
        <div
          className="global-drawer-overlay"
          onClick={() => {
            setServiceDrawerOpen(false);
            setSelectedStepForService(null);
            setAvailableServices([]);
            setSelectedServices([]);
          }}
        >
          <div className="global-drawer-panel" onClick={(e) => e.stopPropagation()}>
            {!selectedStepForService ? (
              <>
                <div className="drawer-title">Select Step</div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {steps.map((step) => (
                    <div
                      key={step._id}
                      className="step-select-item"
                      onClick={() => handleStepSelect(step)}
                    >
                      {step.name}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <button
                  className="btn-text"
                  style={{ marginBottom: "1rem" }}
                  onClick={() => {
                    setSelectedStepForService(null);
                    setAvailableServices([]);
                    setSelectedServices([]);
                  }}
                >
                  Back to Steps
                </button>

                <div className="drawer-title">
                  Assign Services to: {selectedStepForService.name}
                </div>

                {availableServices.length === 0 ? (
                  <p>No services available to assign.</p>
                ) : (
                  <div style={{ marginBottom: "1.5rem" }}>
                    {availableServices.map((service) => (
                      <div
                        key={service._id}
                        className={
                          selectedServices.includes(service._id)
                            ? "service-selected"
                            : "service-item"
                        }
                        onClick={() => toggleService(service._id)}
                      >
                        {service.name}
                      </div>
                    ))}
                  </div>
                )}

                <button
                  className="btn-submit-blue"
                  disabled={selectedServices.length === 0 || loading}
                  onClick={handleAssignServices}
                >
                  {loading ? "Assigning..." : "Assign Services"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DraftPathView;