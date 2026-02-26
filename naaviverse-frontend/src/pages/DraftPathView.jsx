// src/pages/DraftPathView.jsx
import React, { useEffect, useState } from "react";
import {
  useParams,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import axios from "axios";
import "../components/Pathview/journey.scss";
import EditPathForm from "./MyPaths/paths";
import CreateNewStep from "./accDashbaoard/CreateNewStep"; // adjust path if needed
const BASE_URL = process.env.REACT_APP_API_BASE_URL;
// CHANGE signature:
const DraftPathView = ({ onAddStep }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [editOpen, setEditOpen] = useState(false);
  const [pathData, setPathData] = useState(null);
  const [steps, setSteps] = useState([]);
  const [openDrawer, setOpenDrawer] = useState(false);

  const [serviceDrawerOpen, setServiceDrawerOpen] = useState(false);
  const [selectedStepForService, setSelectedStepForService] = useState(null);
  const [availableServices, setAvailableServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [createStepOpen, setCreateStepOpen] = useState(false);

  /* ================= FETCH PATH + STEPS ================= */
  useEffect(() => {
    const pathId = id || localStorage.getItem("selectedPathId");
    if (!pathId) return;

    const fetchData = async () => {
      try {
        const pathRes = await axios.get(
          `${BASE_URL}/api/paths/viewpath/${pathId}`
        );
        setPathData(pathRes.data.data);

        const stepsRes = await axios.get(`${BASE_URL}/api/steps/get`, {
          params: { path_id: pathId },
        });

        setSteps(stepsRes.data.data || []);
      } catch (err) {
        console.log("Error fetching:", err);
      }
    };

    fetchData();
  }, [id]);

  /* ================= CHECK QUERY PARAM ================= */
  useEffect(() => {
    const shouldOpen = searchParams.get("createStep");
    setOpenDrawer(shouldOpen === "true");
  }, [searchParams]);

  /* ================= SERVICES LOGIC ================= */

const handleStepSelect = async (step) => {
  setSelectedStepForService(step);

  try {
    const partner = JSON.parse(localStorage.getItem("partner"));
    const email = partner?.email;

    // 1️⃣ Get all services of this creator
    const allRes = await axios.get(`${BASE_URL}/api/services/getservices`, {
      params: { productcreatoremail: email },
    });

    const allServices = allRes.data.data || [];

    // 2️⃣ Get services already attached to this step
    const attachedRes = await axios.get(`${BASE_URL}/api/services/by-step`, {
      params: { step_id: step._id },
    });

    const attachedServices = attachedRes.data.data || [];

    // 3️⃣ Extract attached service IDs
    const attachedIds = attachedServices.map((s) => s._id);

    // 4️⃣ Filter available services
    const filtered = allServices.filter(
      (service) => !attachedIds.includes(service._id)
    );

    setAvailableServices(filtered);
  } catch (err) {
    console.log("Error loading services:", err);
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
await axios.post(`${BASE_URL}/api/steps/attachservice`, {
  step_id: selectedStepForService._id,
  service_ids: selectedServices,
});


      alert("Services assigned successfully!");

      // Refresh steps
      const stepsRes = await axios.get(`${BASE_URL}/api/steps/get`, {
        params: { path_id: id },
      });
      setSteps(stepsRes.data.data || []);

      // Reset
      setServiceDrawerOpen(false);
      setSelectedStepForService(null);
      setAvailableServices([]);
      setSelectedServices([]);
    } catch (err) {
      console.log("Error assigning services:", err);
    }
  };


  /* ================= SUBMIT FOR APPROVAL ================= */
const handleSubmitForApproval = async () => {
  try {
    await axios.put(`${BASE_URL}/api/paths/submit`, {
      pathId: id,
    });

    alert("Path submitted for approval successfully!");

    const updated = await axios.get(`${BASE_URL}/api/paths/viewpath/${id}`);
    setPathData(updated.data.data);

  } catch (err) {
    console.log("Error submitting path:", err);
  }
};

  if (!pathData) return (
    <div className="journeypage" style={{ padding: "35px" }}>
      <div style={{ textAlign: "center", padding: "3rem" }}>Loading...</div>
    </div>
  );
  
  const isLocked = pathData.status === "waitingforapproval";
  
  return (
    <div className="journeypage" style={{ padding: "20px 35px" }}>
      {/* Back to Paths Button - IMPROVED VERSION */}
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        marginBottom: "24px"
      }}>
   
      </div>

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
            className="btn-soft"
            disabled={isLocked}
onClick={() => {
  if (!isLocked) {
    if (onAddStep) {
      onAddStep(id);  // tells parent to switch to CreateNewStep view
    }
  }
}}
          >
            + Add Step
          </button>

          <button
            className="btn-text"
            disabled={isLocked}
            onClick={() => !isLocked && setEditOpen(true)}
          >
            Edit Path
          </button>

          <button
            className="btn-text"
            disabled={isLocked}
            onClick={() => !isLocked && setServiceDrawerOpen(true)}
          >
            Add Services
          </button>

          {!isLocked && (
            <button
              className="btn-submit-blue"
              onClick={handleSubmitForApproval}
            >
              Submit for Approval
            </button>
          )}
        </div>
      </div>

      {steps.length === 0 ? (
  <div className="empty-state-section">
    <h2>No steps added yet.</h2>
    <p>Click "Add Step" to begin creating steps.</p>
  </div>
) : (
  <div className="steps-grid-premium">
    {steps.map((step, index) => (
      <div key={step._id} className="step-card-premium">
        <div className="bubble">{index + 1}</div>
        <div className="step-title-premium">
          {step.name}
        </div>
        <div className="step-desc-premium">
          {step.macroDescription || step.description || "No description available"}
        </div>
        {step.microDescription && (
          <div className="step-micro-desc">
            <small>Micro: {step.microDescription.substring(0, 100)}...</small>
          </div>
        )}
      </div>
    ))}
  </div>
)}

      {/* EDIT PATH DRAWER */}
      {editOpen && (
        <div
          className="global-drawer-overlay"
          onClick={() => setEditOpen(false)}
        >
          <div
            className="global-drawer-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <EditPathForm
              selectedPath={pathData}
              onSave={async () => {
                const updated = await axios.get(
                  `${BASE_URL}/api/paths/viewpath/${id}`
                );
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
  <div
    className="global-drawer-overlay"
    onClick={() => setCreateStepOpen(false)}
  >
    <div
      className="global-drawer-panel"
      onClick={(e) => e.stopPropagation()}
    >
      <CreateNewStep
        inlineMode={true}
        pathId={id}
        onSuccess={async () => {
          const stepsRes = await axios.get(`${BASE_URL}/api/steps/get`, {
            params: { path_id: id },
          });
          setSteps(stepsRes.data.data || []);
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
          <div
            className="global-drawer-panel"
            onClick={(e) => e.stopPropagation()}
          >
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
                  ← Back to Steps
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
                  disabled={selectedServices.length === 0}
                  onClick={handleAssignServices}
                >
                  Assign Services →
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