// src/pages/DraftPathView.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import "../components/Pathview/journey.scss";
import EditPathForm from "./MyPaths/paths";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const DraftPathView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [pathData, setPathData] = useState(null);
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalSteps, setTotalSteps] = useState(5);
  const [editOpen, setEditOpen] = useState(false);

  // Modal states
  const [viewAllModalOpen, setViewAllModalOpen] = useState(false);
  const [detailViewOpen, setDetailViewOpen] = useState(false);
  const [builderViewOpen, setBuilderViewOpen] = useState(false);
  const [marketplaceModalOpen, setMarketplaceModalOpen] = useState(false);
  
  // Current step being viewed/edited
  const [currentStep, setCurrentStep] = useState(null);
  const [currentEditIndex, setCurrentEditIndex] = useState(null);
  
  // Marketplace state
  const [currentMarketLayer, setCurrentMarketLayer] = useState('macro');
  const [selectedRole, setSelectedRole] = useState(null);
  
  // Temporary step for new step creation
  const [tempStep, setTempStep] = useState(null);

  // Fetch path + steps
  useEffect(() => {
    const pathId = id || localStorage.getItem("selectedPathId");
    if (!pathId) return;

    const savedStepCount = localStorage.getItem('pathStepCount');
    if (savedStepCount) {
      setTotalSteps(parseInt(savedStepCount));
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const pathRes = await axios.get(`/api/paths/viewpath/${pathId}`);
        setPathData(pathRes.data.data);
        
        if (pathRes.data.data?.totalSteps) {
          setTotalSteps(pathRes.data.data.totalSteps);
        }

        await fetchSteps(pathId);
      } catch (err) {
        console.log("Error fetching:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const fetchSteps = async (pathId) => {
    try {
      const stepsRes = await axios.get(`/api/steps/get`, {
        params: { path_id: pathId },
      });
      const fetchedSteps = stepsRes.data.data || [];
      setSteps(fetchedSteps);
      return fetchedSteps;
    } catch (err) {
      console.log("Error fetching steps:", err);
      return [];
    }
  };

  const handleSubmitForApproval = async () => {
    try {
      await axios.put("/api/paths/submit", { pathId: id });
      alert("Path submitted for approval successfully!");
      const updated = await axios.get(`/api/paths/viewpath/${id}`);
      setPathData(updated.data.data);
    } catch (err) {
      console.log("Error submitting path:", err);
    }
  };

  const startNewStep = () => {
    if (steps.length >= totalSteps) return;
    
    setTempStep({
      number: steps.length + 1,
      macro: { name: '', desc: '', duration: { years: '', months: '', days: '' }, paid: false, free: false, instructions: '', marketplace: [] },
      micro: { name: '', desc: '', duration: { years: '', months: '', days: '' }, paid: false, free: false, instructions: '', marketplace: [] },
      nano: { name: '', desc: '', duration: { years: '', months: '', days: '' }, paid: false, free: false, instructions: '', marketplace: [] }
    });
    
    setCurrentEditIndex(-1);
    setBuilderViewOpen(true);
  };

  const editStep = (index) => {
    setCurrentEditIndex(index);
    setCurrentStep(steps[index]);
    setBuilderViewOpen(true);
  };

  const viewStepDetail = (index) => {
    setCurrentStep(steps[index]);
    setDetailViewOpen(true);
    setViewAllModalOpen(false);
  };

  const saveStep = async () => {
    if (currentEditIndex === -1 && tempStep) {
      setSteps([...steps, tempStep]);
      setTempStep(null);
    } else if (currentEditIndex !== null && currentEditIndex >= 0 && currentStep) {
      const updatedSteps = [...steps];
      updatedSteps[currentEditIndex] = currentStep;
      setSteps(updatedSteps);
    }
    
    setBuilderViewOpen(false);
    setCurrentEditIndex(null);
    setCurrentStep(null);
  };

  const cancelBuilder = () => {
    setBuilderViewOpen(false);
    setCurrentEditIndex(null);
    setCurrentStep(null);
    setTempStep(null);
  };

  const goBackToDraft = () => {
    setDetailViewOpen(false);
    setCurrentStep(null);
  };

  const openMarketplaceModal = (layer) => {
    setCurrentMarketLayer(layer);
    setMarketplaceModalOpen(true);
  };

  const closeMarketplaceModal = () => {
    setMarketplaceModalOpen(false);
    setSelectedRole(null);
  };

  const selectMarketplaceRole = (role) => {
    setSelectedRole(role);
  };

  const addMarketplaceItem = () => {
    const durationHours = document.getElementById('marketDurationHours')?.value || '';
    const durationMinutes = document.getElementById('marketDurationMinutes')?.value || '';
    const durationDays = document.getElementById('marketDurationDays')?.value || '';
    
    const duration = [];
    if (durationDays) duration.push(`${durationDays} days`);
    if (durationHours) duration.push(`${durationHours} hrs`);
    if (durationMinutes) duration.push(`${durationMinutes} min`);
    
    const item = {
      role: selectedRole,
      name: document.getElementById('marketName')?.value || '',
      access: document.getElementById('marketAccess')?.value || 'Free',
      cost: document.getElementById('marketCost')?.value || '',
      goal: document.getElementById('marketGoal')?.value || '',
      outcomes: document.getElementById('marketOutcomes')?.value || '',
      iterations: document.getElementById('marketIterations')?.value || '',
      duration: duration.join(' '),
      discount: document.getElementById('marketDiscount')?.value || '',
      features: document.getElementById('marketFeatures')?.value || ''
    };

    if (currentEditIndex === -1 && tempStep) {
      if (currentMarketLayer === 'macro') {
        tempStep.macro.marketplace = [...(tempStep.macro.marketplace || []), item];
      } else if (currentMarketLayer === 'micro') {
        tempStep.micro.marketplace = [...(tempStep.micro.marketplace || []), item];
      } else if (currentMarketLayer === 'nano') {
        tempStep.nano.marketplace = [...(tempStep.nano.marketplace || []), item];
      }
      setTempStep({...tempStep});
    } else if (currentEditIndex !== null && currentEditIndex >= 0 && currentStep) {
      const updatedStep = { ...currentStep };
      if (currentMarketLayer === 'macro') {
        updatedStep.macro.marketplace = [...(updatedStep.macro.marketplace || []), item];
      } else if (currentMarketLayer === 'micro') {
        updatedStep.micro.marketplace = [...(updatedStep.micro.marketplace || []), item];
      } else if (currentMarketLayer === 'nano') {
        updatedStep.nano.marketplace = [...(updatedStep.nano.marketplace || []), item];
      }
      setCurrentStep(updatedStep);
    }

    // Clear form
    document.getElementById('marketName') && (document.getElementById('marketName').value = '');
    document.getElementById('marketAccess') && (document.getElementById('marketAccess').value = 'Free');
    document.getElementById('marketCost') && (document.getElementById('marketCost').value = '');
    document.getElementById('marketGoal') && (document.getElementById('marketGoal').value = '');
    document.getElementById('marketOutcomes') && (document.getElementById('marketOutcomes').value = '');
    document.getElementById('marketIterations') && (document.getElementById('marketIterations').value = '');
    document.getElementById('marketDurationHours') && (document.getElementById('marketDurationHours').value = '');
    document.getElementById('marketDurationMinutes') && (document.getElementById('marketDurationMinutes').value = '');
    document.getElementById('marketDurationDays') && (document.getElementById('marketDurationDays').value = '');
    document.getElementById('marketDiscount') && (document.getElementById('marketDiscount').value = '');
    document.getElementById('marketFeatures') && (document.getElementById('marketFeatures').value = '');

    closeMarketplaceModal();
  };

  const renderMarketplaceDetail = (items) => {
    if (!items || items.length === 0) return '<p style="color:#5e6f7e; padding:0.5rem;">No marketplace items.</p>';
    let html = '';
    items.forEach(item => {
      html += `
        <div style="background:#f4f9fd; border-radius:16px; padding:1rem; margin-bottom:1rem; border:1px solid #dde7f0;">
          <div style="display:flex; flex-wrap:wrap; gap:1rem; font-size:0.9rem;">
            <div style="min-width:120px;"><strong>Name:</strong> ${item.name || ''} (${item.role || 'unknown'})</div>
            <div style="min-width:120px;"><strong>Access:</strong> ${item.access || ''}</div>
            <div style="min-width:120px;"><strong>Cost:</strong> ${item.cost || ''}</div>
            <div style="min-width:120px;"><strong>Goal:</strong> ${item.goal || ''}</div>
            <div style="min-width:120px;"><strong>Outcomes:</strong> ${item.outcomes || ''}</div>
            <div style="min-width:120px;"><strong>Iterations:</strong> ${item.iterations || ''}</div>
            <div style="min-width:120px;"><strong>Duration:</strong> ${item.duration || ''}</div>
            <div style="min-width:120px;"><strong>Discount:</strong> ${item.discount || ''}</div>
          </div>
          <div style="margin-top:0.5rem; font-size:0.9rem;"><strong>Features:</strong> ${item.features || ''}</div>
        </div>
      `;
    });
    return html;
  };

  const renderMarketplaceItemsInBuilder = (items) => {
    if (!items || items.length === 0) {
      return '<p style="color:#5e6f7e; padding:0.5rem; text-align:center;">No marketplace items added.</p>';
    }
    let html = '';
    items.forEach(item => {
      html += `
        <div style="background:#f4f9fd; border-radius:12px; padding:0.8rem; border:1px solid #ccdae5; font-size:0.85rem; margin-bottom:0.5rem;">
          <div style="display:flex; justify-content:space-between; font-weight:600;">
            <span>${item.name || 'Unnamed'} (${item.role || 'unknown'})</span>
            <span>${item.cost || ''}</span>
          </div>
          <div style="display:flex; flex-wrap:wrap; gap:0.5rem; margin-top:0.3rem; color:#2c3e50;">
            <span><strong>Goal:</strong> ${item.goal || ''}</span>
            <span><strong>Outcomes:</strong> ${item.outcomes || ''}</span>
            <span><strong>Access:</strong> ${item.access || ''}</span>
            <span><strong>Iterations:</strong> ${item.iterations || ''}</span>
            <span><strong>Duration:</strong> ${item.duration || ''}</span>
            <span><strong>Discount:</strong> ${item.discount || ''}</span>
          </div>
        </div>
      `;
    });
    return html;
  };

  if (!pathData) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Loading path details...</p>
    </div>
  );

  return (
    <div className="draft-path-container">
      {/* DRAFT PAGE VIEW */}
      <div className={`draft-view ${!detailViewOpen && !builderViewOpen ? 'active' : ''}`}>
        <div className="path-header-box">
          <div className="path-header-content">
            <div className="path-title-section">
              <h1 className="path-title">{pathData.nameOfPath || 'Untitled Path'}</h1>
              <span className="draft-badge">DRAFT</span>
            </div>
            
            <div className="path-stats">
              <span className="steps-count">Steps: {steps.length}/{totalSteps}</span>
            </div>

            {pathData.description && (
              <p className="path-description">{pathData.description}</p>
            )}

            <div className="path-actions-row">
              <button className="btn-outline" onClick={() => setViewAllModalOpen(true)}>
                View All Steps
              </button>
              <button className="btn-outline" onClick={() => setEditOpen(true)}>
                Edit Path
              </button>
              <button className="btn-primary" onClick={handleSubmitForApproval}>
                Submit for Approval
              </button>
            </div>
          </div>
        </div>

        <div className="steps-section">
          <div className="steps-header">
            <h3>Steps</h3>
          </div>

          <div className="step-list">
            {steps.length === 0 ? (
              <div className="empty-state">
                <p>No steps yet. Click "Add New" to begin.</p>
              </div>
            ) : (
              steps.map((step, index) => (
                <div className="step-card" key={step._id || index}>
                  <div className="step-info">
                    <span className="step-number">Step {index + 1}</span>
                    <span className="step-name">{step.macro?.name || step.name || 'Untitled Step'}</span>
                  </div>
                  <button className="edit-btn" onClick={() => editStep(index)}>Edit</button>
                </div>
              ))
            )}
          </div>

          <div className="add-new-container">
            <button 
              className="btn-add-new"
              onClick={startNewStep}
              disabled={steps.length >= totalSteps}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Add New
            </button>
          </div>
        </div>
      </div>

      {/* READ-ONLY DETAIL VIEW */}
      <div className={`detail-view ${detailViewOpen ? 'active' : ''}`}>
        {currentStep && (
          <>
            <div className="detail-view-header">
              <button className="back-to-paths" onClick={goBackToDraft}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Back
              </button>
              <h2>Step {steps.findIndex(s => s._id === currentStep._id) + 1}: {currentStep.macro?.name || currentStep.name || 'Untitled'}</h2>
            </div>

            <div className="detail-content" style={{ overflow: 'visible', maxHeight: 'none' }}>
              {/* MACRO Layer */}
              <div className="layer-detail-card">
                <h3 className="macro-title">MACRO</h3>
                <div className="detail-row">
                  <span className="detail-label">NAME</span>
                  <div className="detail-value">{currentStep.macro?.name || currentStep.name || ''}</div>
                </div>
                <div className="detail-row">
                  <span className="detail-label">DESCRIPTION</span>
                  <div className="detail-value">{currentStep.macro?.desc || currentStep.macroDescription || ''}</div>
                </div>
                <div className="detail-row">
                  <span className="detail-label">DURATION</span>
                  <div className="detail-value">
                    {currentStep.macro?.duration ? 
                      `${currentStep.macro.duration.years ? currentStep.macro.duration.years + ' years ' : ''}${currentStep.macro.duration.months ? currentStep.macro.duration.months + ' months ' : ''}${currentStep.macro.duration.days ? currentStep.macro.duration.days + ' days' : ''}`.trim() || 'Not set'
                      : 'Not set'}
                  </div>
                </div>
                <div className="detail-row">
                  <span className="detail-label">INSTRUCTIONS</span>
                  <div className="detail-value">{currentStep.macro?.instructions || ''}</div>
                </div>
                <div className="marketplace-items" 
                     dangerouslySetInnerHTML={{ __html: renderMarketplaceDetail(currentStep.macro?.marketplace || []) }}>
                </div>
              </div>

              {/* MICRO Layer */}
              <div className="layer-detail-card">
                <h3 className="micro-title">MICRO</h3>
                <div className="detail-row">
                  <span className="detail-label">NAME</span>
                  <div className="detail-value">{currentStep.micro?.name || ''}</div>
                </div>
                <div className="detail-row">
                  <span className="detail-label">DESCRIPTION</span>
                  <div className="detail-value">{currentStep.micro?.desc || currentStep.microDescription || ''}</div>
                </div>
                <div className="detail-row">
                  <span className="detail-label">DURATION</span>
                  <div className="detail-value">
                    {currentStep.micro?.duration ? 
                      `${currentStep.micro.duration.years ? currentStep.micro.duration.years + ' years ' : ''}${currentStep.micro.duration.months ? currentStep.micro.duration.months + ' months ' : ''}${currentStep.micro.duration.days ? currentStep.micro.duration.days + ' days' : ''}`.trim() || 'Not set'
                      : 'Not set'}
                  </div>
                </div>
                <div className="detail-row">
                  <span className="detail-label">INSTRUCTIONS</span>
                  <div className="detail-value">{currentStep.micro?.instructions || ''}</div>
                </div>
                <div className="marketplace-items" 
                     dangerouslySetInnerHTML={{ __html: renderMarketplaceDetail(currentStep.micro?.marketplace || []) }}>
                </div>
              </div>

              {/* NANO Layer */}
              <div className="layer-detail-card">
                <h3 className="nano-title">NANO</h3>
                <div className="detail-row">
                  <span className="detail-label">NAME</span>
                  <div className="detail-value">{currentStep.nano?.name || ''}</div>
                </div>
                <div className="detail-row">
                  <span className="detail-label">DESCRIPTION</span>
                  <div className="detail-value">{currentStep.nano?.desc || currentStep.nanoDescription || ''}</div>
                </div>
                <div className="detail-row">
                  <span className="detail-label">DURATION</span>
                  <div className="detail-value">
                    {currentStep.nano?.duration ? 
                      `${currentStep.nano.duration.years ? currentStep.nano.duration.years + ' years ' : ''}${currentStep.nano.duration.months ? currentStep.nano.duration.months + ' months ' : ''}${currentStep.nano.duration.days ? currentStep.nano.duration.days + ' days' : ''}`.trim() || 'Not set'
                      : 'Not set'}
                  </div>
                </div>
                <div className="detail-row">
                  <span className="detail-label">INSTRUCTIONS</span>
                  <div className="detail-value">{currentStep.nano?.instructions || ''}</div>
                </div>
                <div className="marketplace-items" 
                     dangerouslySetInnerHTML={{ __html: renderMarketplaceDetail(currentStep.nano?.marketplace || []) }}>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* BUILDER VIEW */}
      <div className={`builder-view ${builderViewOpen ? 'active' : ''}`}>
        {(tempStep || currentStep) && (
          <>
            <div className="builder-view-header">
              <div className="builder-title-row">
                <h2>
                  {currentEditIndex === -1 
                    ? `Add Step ${steps.length + 1}` 
                    : `Edit Step ${currentEditIndex + 1}`}
                </h2>
                <span className="step-counter">
                  Step {currentEditIndex === -1 ? steps.length + 1 : currentEditIndex + 1}/{totalSteps}
                </span>
              </div>
            </div>

            <div className="builder-content" style={{ overflow: 'visible', maxHeight: 'none' }}>
              {/* MACRO Builder */}
              <div className="builder-layer">
                <h3 className="macro-title">MACRO</h3>
                <div className="form-group">
                  <label>Name</label>
                  <input 
                    type="text" 
                    id="macroName" 
                    placeholder="e.g., Career Exploration"
                    value={currentEditIndex === -1 ? tempStep?.macro?.name || '' : currentStep?.macro?.name || ''}
                    onChange={(e) => {
                      if (currentEditIndex === -1 && tempStep) {
                        setTempStep({...tempStep, macro: {...tempStep.macro, name: e.target.value}});
                      } else if (currentStep) {
                        setCurrentStep({...currentStep, macro: {...currentStep.macro, name: e.target.value}});
                      }
                    }}
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea 
                    id="macroDesc" 
                    rows="2"
                    placeholder="Enter description"
                    value={currentEditIndex === -1 ? tempStep?.macro?.desc || '' : currentStep?.macro?.desc || ''}
                    onChange={(e) => {
                      if (currentEditIndex === -1 && tempStep) {
                        setTempStep({...tempStep, macro: {...tempStep.macro, desc: e.target.value}});
                      } else if (currentStep) {
                        setCurrentStep({...currentStep, macro: {...currentStep.macro, desc: e.target.value}});
                      }
                    }}
                  ></textarea>
                </div>
                <div className="form-group">
                  <label>Duration</label>
                  <div className="duration-select-group">
                    <select 
                      className="duration-select"
                      value={currentEditIndex === -1 ? tempStep?.macro?.duration?.years || '' : currentStep?.macro?.duration?.years || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (currentEditIndex === -1 && tempStep) {
                          setTempStep({
                            ...tempStep, 
                            macro: {
                              ...tempStep.macro, 
                              duration: {...tempStep.macro?.duration, years: value}
                            }
                          });
                        } else if (currentStep) {
                          setCurrentStep({
                            ...currentStep, 
                            macro: {
                              ...currentStep.macro, 
                              duration: {...currentStep.macro?.duration, years: value}
                            }
                          });
                        }
                      }}
                    >
                      <option value="">Years</option>
                      {[...Array(11)].map((_, i) => (
                        <option key={`year-${i}`} value={i}>{i} {i === 1 ? 'Year' : 'Years'}</option>
                      ))}
                    </select>
                    
                    <select 
                      className="duration-select"
                      value={currentEditIndex === -1 ? tempStep?.macro?.duration?.months || '' : currentStep?.macro?.duration?.months || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (currentEditIndex === -1 && tempStep) {
                          setTempStep({
                            ...tempStep, 
                            macro: {
                              ...tempStep.macro, 
                              duration: {...tempStep.macro?.duration, months: value}
                            }
                          });
                        } else if (currentStep) {
                          setCurrentStep({
                            ...currentStep, 
                            macro: {
                              ...currentStep.macro, 
                              duration: {...currentStep.macro?.duration, months: value}
                            }
                          });
                        }
                      }}
                    >
                      <option value="">Months</option>
                      {[...Array(12)].map((_, i) => (
                        <option key={`month-${i}`} value={i}>{i} {i === 1 ? 'Month' : 'Months'}</option>
                      ))}
                    </select>
                    
                    <select 
                      className="duration-select"
                      value={currentEditIndex === -1 ? tempStep?.macro?.duration?.days || '' : currentStep?.macro?.duration?.days || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (currentEditIndex === -1 && tempStep) {
                          setTempStep({
                            ...tempStep, 
                            macro: {
                              ...tempStep.macro, 
                              duration: {...tempStep.macro?.duration, days: value}
                            }
                          });
                        } else if (currentStep) {
                          setCurrentStep({
                            ...currentStep, 
                            macro: {
                              ...currentStep.macro, 
                              duration: {...currentStep.macro?.duration, days: value}
                            }
                          });
                        }
                      }}
                    >
                      <option value="">Days</option>
                      {[...Array(31)].map((_, i) => (
                        <option key={`day-${i}`} value={i}>{i} {i === 1 ? 'Day' : 'Days'}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="checkbox-group">
                    <label className="checkbox-label">
                      <input 
                        type="checkbox" 
                        checked={currentEditIndex === -1 ? tempStep?.macro?.paid || false : currentStep?.macro?.paid || false}
                        onChange={(e) => {
                          if (currentEditIndex === -1 && tempStep) {
                            setTempStep({...tempStep, macro: {...tempStep.macro, paid: e.target.checked}});
                          } else if (currentStep) {
                            setCurrentStep({...currentStep, macro: {...currentStep.macro, paid: e.target.checked}});
                          }
                        }}
                      /> Paid
                    </label>
                    <label className="checkbox-label">
                      <input 
                        type="checkbox" 
                        checked={currentEditIndex === -1 ? tempStep?.macro?.free || false : currentStep?.macro?.free || false}
                        onChange={(e) => {
                          if (currentEditIndex === -1 && tempStep) {
                            setTempStep({...tempStep, macro: {...tempStep.macro, free: e.target.checked}});
                          } else if (currentStep) {
                            setCurrentStep({...currentStep, macro: {...currentStep.macro, free: e.target.checked}});
                          }
                        }}
                      /> Free
                    </label>
                  </div>
                </div>
                <div className="form-group">
                  <label>Instructions</label>
                  <textarea 
                    id="macroInstructions" 
                    rows="2"
                    placeholder="Enter instructions"
                    value={currentEditIndex === -1 ? tempStep?.macro?.instructions || '' : currentStep?.macro?.instructions || ''}
                    onChange={(e) => {
                      if (currentEditIndex === -1 && tempStep) {
                        setTempStep({...tempStep, macro: {...tempStep.macro, instructions: e.target.value}});
                      } else if (currentStep) {
                        setCurrentStep({...currentStep, macro: {...currentStep.macro, instructions: e.target.value}});
                      }
                    }}
                  ></textarea>
                </div>
                <div className="marketplace-section">
                  <label>Marketplace Items</label>
                  <div 
                    id="macroMarketplaceItems" 
                    className="marketplace-items-builder"
                    dangerouslySetInnerHTML={{ 
                      __html: renderMarketplaceItemsInBuilder(
                        currentEditIndex === -1 ? tempStep?.macro?.marketplace || [] : currentStep?.macro?.marketplace || []
                      )
                    }}
                  ></div>
                  <button className="icon-btn" onClick={() => openMarketplaceModal('macro')}>+ Add Marketplace</button>
                </div>
              </div>

              {/* MICRO Builder */}
              <div className="builder-layer">
                <h3 className="micro-title">MICRO</h3>
                <div className="form-group">
                  <label>Name</label>
                  <input 
                    type="text" 
                    id="microName" 
                    placeholder="e.g., Aptitude Test"
                    value={currentEditIndex === -1 ? tempStep?.micro?.name || '' : currentStep?.micro?.name || ''}
                    onChange={(e) => {
                      if (currentEditIndex === -1 && tempStep) {
                        setTempStep({...tempStep, micro: {...tempStep.micro, name: e.target.value}});
                      } else if (currentStep) {
                        setCurrentStep({...currentStep, micro: {...currentStep.micro, name: e.target.value}});
                      }
                    }}
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea 
                    id="microDesc" 
                    rows="2"
                    placeholder="Enter description"
                    value={currentEditIndex === -1 ? tempStep?.micro?.desc || '' : currentStep?.micro?.desc || ''}
                    onChange={(e) => {
                      if (currentEditIndex === -1 && tempStep) {
                        setTempStep({...tempStep, micro: {...tempStep.micro, desc: e.target.value}});
                      } else if (currentStep) {
                        setCurrentStep({...currentStep, micro: {...currentStep.micro, desc: e.target.value}});
                      }
                    }}
                  ></textarea>
                </div>
                <div className="form-group">
                  <label>Duration</label>
                  <div className="duration-select-group">
                    <select 
                      className="duration-select"
                      value={currentEditIndex === -1 ? tempStep?.micro?.duration?.years || '' : currentStep?.micro?.duration?.years || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (currentEditIndex === -1 && tempStep) {
                          setTempStep({
                            ...tempStep, 
                            micro: {
                              ...tempStep.micro, 
                              duration: {...tempStep.micro?.duration, years: value}
                            }
                          });
                        } else if (currentStep) {
                          setCurrentStep({
                            ...currentStep, 
                            micro: {
                              ...currentStep.micro, 
                              duration: {...currentStep.micro?.duration, years: value}
                            }
                          });
                        }
                      }}
                    >
                      <option value="">Years</option>
                      {[...Array(11)].map((_, i) => (
                        <option key={`year-${i}`} value={i}>{i} {i === 1 ? 'Year' : 'Years'}</option>
                      ))}
                    </select>
                    
                    <select 
                      className="duration-select"
                      value={currentEditIndex === -1 ? tempStep?.micro?.duration?.months || '' : currentStep?.micro?.duration?.months || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (currentEditIndex === -1 && tempStep) {
                          setTempStep({
                            ...tempStep, 
                            micro: {
                              ...tempStep.micro, 
                              duration: {...tempStep.micro?.duration, months: value}
                            }
                          });
                        } else if (currentStep) {
                          setCurrentStep({
                            ...currentStep, 
                            micro: {
                              ...currentStep.micro, 
                              duration: {...currentStep.micro?.duration, months: value}
                            }
                          });
                        }
                      }}
                    >
                      <option value="">Months</option>
                      {[...Array(12)].map((_, i) => (
                        <option key={`month-${i}`} value={i}>{i} {i === 1 ? 'Month' : 'Months'}</option>
                      ))}
                    </select>
                    
                    <select 
                      className="duration-select"
                      value={currentEditIndex === -1 ? tempStep?.micro?.duration?.days || '' : currentStep?.micro?.duration?.days || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (currentEditIndex === -1 && tempStep) {
                          setTempStep({
                            ...tempStep, 
                            micro: {
                              ...tempStep.micro, 
                              duration: {...tempStep.micro?.duration, days: value}
                            }
                          });
                        } else if (currentStep) {
                          setCurrentStep({
                            ...currentStep, 
                            micro: {
                              ...currentStep.micro, 
                              duration: {...currentStep.micro?.duration, days: value}
                            }
                          });
                        }
                      }}
                    >
                      <option value="">Days</option>
                      {[...Array(31)].map((_, i) => (
                        <option key={`day-${i}`} value={i}>{i} {i === 1 ? 'Day' : 'Days'}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="checkbox-group">
                    <label className="checkbox-label">
                      <input 
                        type="checkbox" 
                        checked={currentEditIndex === -1 ? tempStep?.micro?.paid || false : currentStep?.micro?.paid || false}
                        onChange={(e) => {
                          if (currentEditIndex === -1 && tempStep) {
                            setTempStep({...tempStep, micro: {...tempStep.micro, paid: e.target.checked}});
                          } else if (currentStep) {
                            setCurrentStep({...currentStep, micro: {...currentStep.micro, paid: e.target.checked}});
                          }
                        }}
                      /> Paid
                    </label>
                    <label className="checkbox-label">
                      <input 
                        type="checkbox" 
                        checked={currentEditIndex === -1 ? tempStep?.micro?.free || false : currentStep?.micro?.free || false}
                        onChange={(e) => {
                          if (currentEditIndex === -1 && tempStep) {
                            setTempStep({...tempStep, micro: {...tempStep.micro, free: e.target.checked}});
                          } else if (currentStep) {
                            setCurrentStep({...currentStep, micro: {...currentStep.micro, free: e.target.checked}});
                          }
                        }}
                      /> Free
                    </label>
                  </div>
                </div>
                <div className="form-group">
                  <label>Instructions</label>
                  <textarea 
                    id="microInstructions" 
                    rows="2"
                    placeholder="Enter instructions"
                    value={currentEditIndex === -1 ? tempStep?.micro?.instructions || '' : currentStep?.micro?.instructions || ''}
                    onChange={(e) => {
                      if (currentEditIndex === -1 && tempStep) {
                        setTempStep({...tempStep, micro: {...tempStep.micro, instructions: e.target.value}});
                      } else if (currentStep) {
                        setCurrentStep({...currentStep, micro: {...currentStep.micro, instructions: e.target.value}});
                      }
                    }}
                  ></textarea>
                </div>
                <div className="marketplace-section">
                  <label>Marketplace Items</label>
                  <div 
                    id="microMarketplaceItems" 
                    className="marketplace-items-builder"
                    dangerouslySetInnerHTML={{ 
                      __html: renderMarketplaceItemsInBuilder(
                        currentEditIndex === -1 ? tempStep?.micro?.marketplace || [] : currentStep?.micro?.marketplace || []
                      )
                    }}
                  ></div>
                  <button className="icon-btn" onClick={() => openMarketplaceModal('micro')}>+ Add Marketplace</button>
                </div>
              </div>

              {/* NANO Builder */}
              <div className="builder-layer">
                <h3 className="nano-title">NANO</h3>
                <div className="form-group">
                  <label>Name</label>
                  <input 
                    type="text" 
                    id="nanoName" 
                    placeholder="e.g., Take Online Assessment"
                    value={currentEditIndex === -1 ? tempStep?.nano?.name || '' : currentStep?.nano?.name || ''}
                    onChange={(e) => {
                      if (currentEditIndex === -1 && tempStep) {
                        setTempStep({...tempStep, nano: {...tempStep.nano, name: e.target.value}});
                      } else if (currentStep) {
                        setCurrentStep({...currentStep, nano: {...currentStep.nano, name: e.target.value}});
                      }
                    }}
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea 
                    id="nanoDesc" 
                    rows="2"
                    placeholder="Enter description"
                    value={currentEditIndex === -1 ? tempStep?.nano?.desc || '' : currentStep?.nano?.desc || ''}
                    onChange={(e) => {
                      if (currentEditIndex === -1 && tempStep) {
                        setTempStep({...tempStep, nano: {...tempStep.nano, desc: e.target.value}});
                      } else if (currentStep) {
                        setCurrentStep({...currentStep, nano: {...currentStep.nano, desc: e.target.value}});
                      }
                    }}
                  ></textarea>
                </div>
                <div className="form-group">
                  <label>Duration</label>
                  <div className="duration-select-group">
                    <select 
                      className="duration-select"
                      value={currentEditIndex === -1 ? tempStep?.nano?.duration?.years || '' : currentStep?.nano?.duration?.years || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (currentEditIndex === -1 && tempStep) {
                          setTempStep({
                            ...tempStep, 
                            nano: {
                              ...tempStep.nano, 
                              duration: {...tempStep.nano?.duration, years: value}
                            }
                          });
                        } else if (currentStep) {
                          setCurrentStep({
                            ...currentStep, 
                            nano: {
                              ...currentStep.nano, 
                              duration: {...currentStep.nano?.duration, years: value}
                            }
                          });
                        }
                      }}
                    >
                      <option value="">Years</option>
                      {[...Array(11)].map((_, i) => (
                        <option key={`year-${i}`} value={i}>{i} {i === 1 ? 'Year' : 'Years'}</option>
                      ))}
                    </select>
                    
                    <select 
                      className="duration-select"
                      value={currentEditIndex === -1 ? tempStep?.nano?.duration?.months || '' : currentStep?.nano?.duration?.months || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (currentEditIndex === -1 && tempStep) {
                          setTempStep({
                            ...tempStep, 
                            nano: {
                              ...tempStep.nano, 
                              duration: {...tempStep.nano?.duration, months: value}
                            }
                          });
                        } else if (currentStep) {
                          setCurrentStep({
                            ...currentStep, 
                            nano: {
                              ...currentStep.nano, 
                              duration: {...currentStep.nano?.duration, months: value}
                            }
                          });
                        }
                      }}
                    >
                      <option value="">Months</option>
                      {[...Array(12)].map((_, i) => (
                        <option key={`month-${i}`} value={i}>{i} {i === 1 ? 'Month' : 'Months'}</option>
                      ))}
                    </select>
                    
                    <select 
                      className="duration-select"
                      value={currentEditIndex === -1 ? tempStep?.nano?.duration?.days || '' : currentStep?.nano?.duration?.days || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (currentEditIndex === -1 && tempStep) {
                          setTempStep({
                            ...tempStep, 
                            nano: {
                              ...tempStep.nano, 
                              duration: {...tempStep.nano?.duration, days: value}
                            }
                          });
                        } else if (currentStep) {
                          setCurrentStep({
                            ...currentStep, 
                            nano: {
                              ...currentStep.nano, 
                              duration: {...currentStep.nano?.duration, days: value}
                            }
                          });
                        }
                      }}
                    >
                      <option value="">Days</option>
                      {[...Array(31)].map((_, i) => (
                        <option key={`day-${i}`} value={i}>{i} {i === 1 ? 'Day' : 'Days'}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="checkbox-group">
                    <label className="checkbox-label">
                      <input 
                        type="checkbox" 
                        checked={currentEditIndex === -1 ? tempStep?.nano?.paid || false : currentStep?.nano?.paid || false}
                        onChange={(e) => {
                          if (currentEditIndex === -1 && tempStep) {
                            setTempStep({...tempStep, nano: {...tempStep.nano, paid: e.target.checked}});
                          } else if (currentStep) {
                            setCurrentStep({...currentStep, nano: {...currentStep.nano, paid: e.target.checked}});
                          }
                        }}
                      /> Paid
                    </label>
                    <label className="checkbox-label">
                      <input 
                        type="checkbox" 
                        checked={currentEditIndex === -1 ? tempStep?.nano?.free || false : currentStep?.nano?.free || false}
                        onChange={(e) => {
                          if (currentEditIndex === -1 && tempStep) {
                            setTempStep({...tempStep, nano: {...tempStep.nano, free: e.target.checked}});
                          } else if (currentStep) {
                            setCurrentStep({...currentStep, nano: {...currentStep.nano, free: e.target.checked}});
                          }
                        }}
                      /> Free
                    </label>
                  </div>
                </div>
                <div className="form-group">
                  <label>Instructions</label>
                  <textarea 
                    id="nanoInstructions" 
                    rows="2"
                    placeholder="Enter instructions"
                    value={currentEditIndex === -1 ? tempStep?.nano?.instructions || '' : currentStep?.nano?.instructions || ''}
                    onChange={(e) => {
                      if (currentEditIndex === -1 && tempStep) {
                        setTempStep({...tempStep, nano: {...tempStep.nano, instructions: e.target.value}});
                      } else if (currentStep) {
                        setCurrentStep({...currentStep, nano: {...currentStep.nano, instructions: e.target.value}});
                      }
                    }}
                  ></textarea>
                </div>
                <div className="marketplace-section">
                  <label>Marketplace Items</label>
                  <div 
                    id="nanoMarketplaceItems" 
                    className="marketplace-items-builder"
                    dangerouslySetInnerHTML={{ 
                      __html: renderMarketplaceItemsInBuilder(
                        currentEditIndex === -1 ? tempStep?.nano?.marketplace || [] : currentStep?.nano?.marketplace || []
                      )
                    }}
                  ></div>
                  <button className="icon-btn" onClick={() => openMarketplaceModal('nano')}>+ Add Marketplace</button>
                </div>
              </div>

              <div className="builder-actions">
                <button className="btn-outline" onClick={cancelBuilder}>Cancel</button>
                <button className="btn-primary" onClick={saveStep}>Save Step</button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* View All Steps Modal */}
      <div className={`modal ${viewAllModalOpen ? 'active' : ''}`} onClick={() => setViewAllModalOpen(false)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <h2>All Steps</h2>
          <ul className="step-list-modal">
            {steps.length === 0 ? (
              <li className="empty-item">No steps yet.</li>
            ) : (
              steps.map((step, index) => (
                <li key={step._id || index} onClick={() => viewStepDetail(index)}>
                  <span className="step-num">Step {index + 1}</span>
                  {step.macro?.name || step.name || 'Untitled'}
                </li>
              ))
            )}
          </ul>
          <div className="modal-footer">
            <button className="btn-outline" onClick={() => setViewAllModalOpen(false)}>Close</button>
          </div>
        </div>
      </div>

      {/* Marketplace Modal - CENTERED, NOT COVERING SIDEBAR */}
      <div className={`modal marketplace-modal ${marketplaceModalOpen ? 'active' : ''}`} onClick={closeMarketplaceModal}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="marketplace-context">
            Adding to <strong>{currentMarketLayer.charAt(0).toUpperCase() + currentMarketLayer.slice(1)}</strong>
          </div>

          {!selectedRole ? (
            <div className="role-selector-container">
              <h2>Choose Marketplace Role</h2>
              <p>Select the type of partner.</p>
              <div className="role-selector">
                <div className="role-option" onClick={() => selectMarketplaceRole('vendor')}>
                  <h4>Vendor</h4>
                </div>
                <div className="role-option" onClick={() => selectMarketplaceRole('mentor')}>
                  <h4>Mentor</h4>
                </div>
                <div className="role-option" onClick={() => selectMarketplaceRole('institution')}>
                  <h4>Institution</h4>
                </div>
                <div className="role-option" onClick={() => selectMarketplaceRole('distributor')}>
                  <h4>Distributor</h4>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn-outline" onClick={closeMarketplaceModal}>Cancel</button>
              </div>
            </div>
          ) : (
            <div className="marketplace-form">
              <h3>📋 Marketplace Listing</h3>
              
              <div className="form-section">
                <h4>Basic Information</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label>Name *</label>
                    <input type="text" id="marketName" placeholder="e.g., edutechex" />
                  </div>
                  <div className="form-group">
                    <label>Access</label>
                    <select id="marketAccess">
                      <option>Free</option>
                      <option>Covered under Subscription</option>
                      <option>Paid</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Cost</label>
                    <input type="text" id="marketCost" placeholder="e.g., Rs. 100, $50" />
                  </div>
                  <div className="form-group">
                    <label>Goal</label>
                    <input type="text" id="marketGoal" placeholder="e.g., Assessment, Counselling" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Outcomes</label>
                    <input type="text" id="marketOutcomes" placeholder="e.g., Defined Metrics, 80%" />
                  </div>
                  <div className="form-group">
                    <label>Iterations</label>
                    <input type="text" id="marketIterations" placeholder="e.g., 3 - Unlimited" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Duration</label>
                    <div className="duration-input-group">
                      <input type="number" id="marketDurationDays" placeholder="Days" min="0" className="duration-small-input" />
                      <input type="number" id="marketDurationHours" placeholder="Hours" min="0" max="23" className="duration-small-input" />
                      <input type="number" id="marketDurationMinutes" placeholder="Minutes" min="0" max="59" className="duration-small-input" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Discount</label>
                    <input type="text" id="marketDiscount" placeholder="e.g., 10%" />
                  </div>
                </div>
                <div className="form-group">
                  <label>Features / Description</label>
                  <textarea id="marketFeatures" rows="2" placeholder="Provide course features, USP, credentials..."></textarea>
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn-outline" onClick={() => setSelectedRole(null)}>Back</button>
                <button className="btn-primary" onClick={addMarketplaceItem}>Add to Step</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Path Drawer */}
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
    </div>
  );
};

export default DraftPathView;