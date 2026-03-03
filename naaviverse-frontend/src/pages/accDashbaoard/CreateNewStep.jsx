import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import './CreateNewStep.scss';
import axios from 'axios';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const CreateNewStep = ({ inlineMode = false, pathId: propPathId, onSuccess, onCancel }) => {
  const { id: paramId } = useParams();
  const id = propPathId || paramId;
  const navigate = useNavigate();
  
  const [stepForm, setStepForm] = useState({
    name: "",
    description: "", 
    length: "",
    cost: "free",
    macroDescription: "",
    microDescription: "",
    nanoDescription: "",
    path_id: id || "",
    // Guidance sections
    gradeData: [
      { grade: "9", description: "" },
      { grade: "10", description: "" },
      { grade: "11", description: "" },
      { grade: "12", description: "" },
    ],
    financialData: [
      { financialSituation: "0-25L", description: "" },
      { financialSituation: "25L-75L", description: "" },
      { financialSituation: "75L-3CR", description: "" },
      { financialSituation: "3CR+", description: "" },
      { financialSituation: "other", description: "" },
    ],
    streamData: [
      { stream: "MPC", description: "" },
      { stream: "BIPC", description: "" },
      { stream: "CEC", description: "" },
      { stream: "MEC", description: "" },
      { stream: "HEC", description: "" },
    ],
    gradePointAverageData: [
      { gradePointAverage: "0% - 35%", description: "" },
      { gradePointAverage: "36% - 60%", description: "" },
      { gradePointAverage: "61% - 75%", description: "" },
      { gradePointAverage: "76% - 85%", description: "" },
      { gradePointAverage: "86% - 95%", description: "" },
      { gradePointAverage: "96% - 100%", description: "" },
    ],
    curriculumData: [
      { curriculum: "IB", description: "" },
      { curriculum: "IGCSE", description: "" },
      { curriculum: "CBSE", description: "" },
      { curriculum: "ICSE", description: "" },
      { curriculum: "Nordic", description: "" },
    ],
    personalityData: [], // Will be filled from multi-select dropdown
  });

  const [loading, setLoading] = useState(false);
  const [availablePaths, setAvailablePaths] = useState([]);
  const [searchPath, setSearchPath] = useState("");
  const [customPathInput, setCustomPathInput] = useState("");
  const [selectedPersonalities, setSelectedPersonalities] = useState([]);
  const [personalityDropdownOpen, setPersonalityDropdownOpen] = useState(false);
  const [showPathSuggestions, setShowPathSuggestions] = useState(false);

  const personalityOptions = [
    "realistic", "investigative", "artistic", "social", "enterprising", "conventional"
  ];

  // Fetch available paths from API
  useEffect(() => {
    fetchPaths();
  }, []);

  const fetchPaths = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/paths/get`);
      setAvailablePaths(res.data?.data || []);
    } catch (err) {
      console.error('Error fetching paths:', err);
    }
  };

  // 🔥 STEP 3: Auto-select exact match when typing
  useEffect(() => {
    const exactMatch = availablePaths.find(
      p => p.nameOfPath?.toLowerCase() === searchPath.toLowerCase()
    );

    if (exactMatch) {
      setStepForm(prev => ({
        ...prev,
        path_id: exactMatch._id
      }));
    }
  }, [searchPath, availablePaths]);

  // Close path suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.path-autocomplete')) {
        setShowPathSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle input changes
  const handleInputChange = (e) => {
    setStepForm({
      ...stepForm,
      [e.target.name]: e.target.value
    });
  };

  // Handle guidance text changes
  const handleGuidanceChange = (section, index, field, value) => {
    const updatedSection = [...stepForm[section]];
    updatedSection[index][field] = value;
    setStepForm({
      ...stepForm,
      [section]: updatedSection
    });
  };

  // Handle personality multi-select
  const togglePersonality = (personality) => {
    const newSelected = selectedPersonalities.includes(personality)
      ? selectedPersonalities.filter(p => p !== personality)
      : [...selectedPersonalities, personality];
    
    setSelectedPersonalities(newSelected);
    
    // Update stepForm personalityData
    const newPersonalityData = newSelected.map(p => ({
      personality: p,
      description: stepForm.personalityData.find(item => item.personality === p)?.description || ""
    }));
    
    setStepForm({
      ...stepForm,
      personalityData: newPersonalityData
    });
  };

  const handlePersonalityDescriptionChange = (personality, value) => {
    const updatedData = stepForm.personalityData.map(item =>
      item.personality === personality ? { ...item, description: value } : item
    );
    setStepForm({
      ...stepForm,
      personalityData: updatedData
    });
  };

  // Handle custom path addition
  const handleAddCustomPath = () => {
    if (customPathInput.trim()) {
      // Check if path already exists
      const existingPath = availablePaths.find(
        p => p.nameOfPath?.toLowerCase() === customPathInput.trim().toLowerCase()
      );
      
      if (existingPath) {
        // If exists, just select it
        setStepForm({ ...stepForm, path_id: existingPath._id });
        setSearchPath(existingPath.nameOfPath);
      } else {
        // Create a temporary custom path object
        const tempPath = {
          _id: `custom-${Date.now()}`,
          nameOfPath: customPathInput.trim(),
          isCustom: true
        };
        
        // Add to available paths
        setAvailablePaths(prev => [tempPath, ...prev]);
        
        // Select this path
        setStepForm({ ...stepForm, path_id: tempPath._id });
        setSearchPath(customPathInput.trim());
      }
      
      setCustomPathInput("");
      setShowPathSuggestions(false);
    }
  };

  const handleAddCustomPathFromSearch = (pathName) => {
    if (pathName.trim()) {
      // Check if path already exists
      const existingPath = availablePaths.find(
        p => p.nameOfPath?.toLowerCase() === pathName.trim().toLowerCase()
      );
      
      if (existingPath) {
        setStepForm({ ...stepForm, path_id: existingPath._id });
        setSearchPath(existingPath.nameOfPath);
      } else {
        const tempPath = {
          _id: `custom-${Date.now()}`,
          nameOfPath: pathName.trim(),
          isCustom: true
        };
        
        setAvailablePaths(prev => [tempPath, ...prev]);
        setStepForm({ ...stepForm, path_id: tempPath._id });
        setSearchPath(pathName.trim());
      }
      
      setShowPathSuggestions(false);
    }
  };

  // Submit step
const handleSubmit = async () => {
  setLoading(true);
  try {
    // Get partner email from localStorage
    const partner = JSON.parse(localStorage.getItem("partner"));
    const email = partner?.email;

    if (!email) {
      toast.error("User email not found. Please login again.");
      return;
    }

    // Prepare the step data for API
    const stepData = {
      ...stepForm,
      created_by: email,
      // Ensure path_id is set
      path_id: stepForm.path_id || id,
    };

    console.log("Submitting step to API:", stepData);

    // Make the API call to create the step
    const response = await axios.post(`${BASE_URL}/api/steps/add`, stepData);

    console.log("Step creation response:", response.data);

    if (response.data?.status) {
      toast.success("Step created successfully!");
      
      // After success, go back to path page
      if (inlineMode && onSuccess) {
        onSuccess(); // This should refresh the steps in DraftPathView
      } else {
        navigate(`/dashboard/accountants/path/${id}`);
      }
    } else {
      toast.error(response.data?.message || "Failed to create step");
    }
  } catch (error) {
    console.error("Error creating step:", error);
    toast.error(error.response?.data?.message || "Error creating step");
  } finally {
    setLoading(false);
  }
};
  return (
    <div className="new-step-container">
      <div className="new-step-content">

        {/* Step Details Section */}
        <div className="form-section">
          <h2 className="section-title">Step details</h2>

          <div className="form-field">
            <label>What is the name of this step?</label>
            <input
              type="text"
              name="name"
              placeholder="e.g., Research lab introduction, College application workshop"
              value={stepForm.name}
              onChange={handleInputChange}
            />
          </div>
{/* ADD THIS BELOW */}
<div className="form-field">
  <label>What is the description of this step?</label>
  <textarea
    name="description"
    placeholder="e.g., In this step, students will explore research opportunities and learn how to approach lab introductions..."
    rows="4"
    value={stepForm.description}
    onChange={handleInputChange}
  />
</div>
          <div className="form-row">
            <div className="form-field half">
              <label>How long does this step take?</label>
              <div className="duration-field-compact">
                <input
                  type="number"
                  name="length"
                  placeholder="e.g., 21"
                  value={stepForm.length}
                  onChange={handleInputChange}
                />
                <span className="days-badge">Days</span>
              </div>
            </div>

            <div className="form-field half">
              <label>What type of step is it?</label>
              <div className="cost-options">
                <button
                  type="button"
                  className={`cost-btn ${stepForm.cost === 'paid' ? 'active' : ''}`}
                  onClick={() => setStepForm({ ...stepForm, cost: 'paid' })}
                >
                  Paid
                </button>
                <button
                  type="button"
                  className={`cost-btn ${stepForm.cost === 'free' ? 'active' : ''}`}
                  onClick={() => setStepForm({ ...stepForm, cost: 'free' })}
                >
                  Free
                </button>
              </div>
            </div>
          </div>

          <div className="form-field">
            <label>What is the instructions for the macro view?</label>
            <textarea
              name="macroDescription"
              placeholder="Provide high-level overview and big picture instructions for this step..."
              rows="4"
              value={stepForm.macroDescription}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-field">
            <label>What is the instructions for the micro view?</label>
            <textarea
              name="microDescription"
              placeholder="Provide mid-level, detailed instructions for this step..."
              rows="4"
              value={stepForm.microDescription}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-field">
            <label>What is the instructions for the nano view?</label>
            <textarea
              name="nanoDescription"
              placeholder="Provide detailed, granular instructions and specific tasks for this step..."
              rows="4"
              value={stepForm.nanoDescription}
              onChange={handleInputChange}
            />
          </div>

          {/* 🔥 STEP 1 & 2: Path selector with fixed dropdown behavior */}
          <div className="form-field">
            <label>Which path does this step belong to?</label>

            <div className="path-autocomplete">
              <input
                type="text"
                placeholder="Search or type path name..."
                value={searchPath}
                onChange={(e) => {
                  setSearchPath(e.target.value);
                  setShowPathSuggestions(true);
                }}
                onFocus={() => setShowPathSuggestions(true)}
                className="path-input"
              />

              {showPathSuggestions && (
                <div className="path-dropdown">
                  {availablePaths
                    .filter(path =>
                      searchPath.trim() === ""
                        ? true
                        : path.nameOfPath
                            ?.toLowerCase()
                            .includes(searchPath.toLowerCase())
                    )
                    .map(path => (
                      <div
                        key={path._id}
                        className={`path-option ${
                          stepForm.path_id === path._id ? "active" : ""
                        }`}
                        onClick={() => {
                          setSearchPath(path.nameOfPath);      // keep text in input
                          setStepForm(prev => ({
                            ...prev,
                            path_id: path._id
                          }));
                          setShowPathSuggestions(false);
                        }}
                      >
                        {path.nameOfPath}
                      </div>
                    ))}
                </div>
              )}

              <small className="path-hint">
                If not found, you can simply type a new path name.
              </small>
            </div>
          </div>
        </div>

        {/* Grade-specific guidance Section */}
        <div className="form-section">
          <h2 className="section-title">Grade-specific guidance</h2>
          <div className="guidance-grid">
            {stepForm.gradeData.map((item, index) => (
              <div key={item.grade} className="guidance-card">
                <h3 className="guidance-title">Grade {item.grade}</h3>
                <textarea
                  placeholder={`Advice for ${item.grade}th graders...`}
                  rows="3"
                  value={item.description}
                  onChange={(e) => handleGuidanceChange('gradeData', index, 'description', e.target.value)}
                  className="light-placeholder"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Financial situation guidance Section */}
        <div className="form-section">
          <h2 className="section-title">Financial situation guidance</h2>
          <div className="guidance-grid">
            {stepForm.financialData.map((item, index) => (
              <div key={item.financialSituation} className="guidance-card">
                <h3 className="guidance-title">
                  {item.financialSituation === "0-25L" && "0-25 Lakhs"}
                  {item.financialSituation === "25L-75L" && "25-75 Lakhs"}
                  {item.financialSituation === "75L-3CR" && "75 Lakhs - 3 CR"}
                  {item.financialSituation === "3CR+" && "3 CR+"}
                  {item.financialSituation === "other" && "Other"}
                </h3>
                <textarea
                  placeholder={`Guidance for ${item.financialSituation}...`}
                  rows="3"
                  value={item.description}
                  onChange={(e) => handleGuidanceChange('financialData', index, 'description', e.target.value)}
                  className="light-placeholder"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Additional guidance Section */}
        <div className="form-section">
          <h2 className="section-title">Additional guidance</h2>
          
          {/* Personality - Multi-select dropdown */}
          <div className="guidance-item">
            <h3>Personality guidance</h3>
            <div className="personality-selector">
              <div 
                className={`personality-dropdown ${personalityDropdownOpen ? 'open' : ''}`}
                onClick={() => setPersonalityDropdownOpen(!personalityDropdownOpen)}
              >
                <span>
                  {selectedPersonalities.length > 0 
                    ? `${selectedPersonalities.length} personality type(s) selected`
                    : 'Select personality types...'}
                </span>
                <span className="dropdown-arrow">▼</span>
              </div>
              
              {personalityDropdownOpen && (
                <div className="personality-options">
                  {personalityOptions.map(personality => (
                    <div key={personality} className="personality-option">
                      <label>
                        <input
                          type="checkbox"
                          checked={selectedPersonalities.includes(personality)}
                          onChange={() => togglePersonality(personality)}
                        />
                        <span className="personality-name">{personality}</span>
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedPersonalities.length > 0 && (
              <div className="personality-descriptions">
                {selectedPersonalities.map(personality => (
                  <div key={personality} className="personality-description-item">
                    <span className="personality-label">{personality}</span>
                    <textarea
                      placeholder={`How ${personality} personalities can approach this step...`}
                      rows="2"
                      value={stepForm.personalityData.find(p => p.personality === personality)?.description || ''}
                      onChange={(e) => handlePersonalityDescriptionChange(personality, e.target.value)}
                      className="light-placeholder"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Stream guidance - Accordion style */}
          <div className="guidance-item">
            <h3>Stream guidance</h3>
            <div className="stream-accordion">
              {stepForm.streamData.map((item, index) => (
                <details key={item.stream} className="stream-details">
                  <summary className="stream-summary">
                    <span className="stream-label">{item.stream}</span>
                    <span className="accordion-icon">▼</span>
                  </summary>
                  <div className="stream-content">
                    <textarea
                      placeholder={`Advice for ${item.stream} stream...`}
                      rows="3"
                      value={item.description}
                      onChange={(e) => handleGuidanceChange('streamData', index, 'description', e.target.value)}
                      className="light-placeholder"
                    />
                  </div>
                </details>
              ))}
            </div>
          </div>

          {/* GPA guidance - Accordion style */}
          <div className="guidance-item">
            <h3>GPA guidance</h3>
            <div className="gpa-accordion">
              {stepForm.gradePointAverageData.map((item, index) => (
                <details key={item.gradePointAverage} className="gpa-details">
                  <summary className="gpa-summary">
                    <span className="gpa-label">{item.gradePointAverage}</span>
                    <span className="accordion-icon">▼</span>
                  </summary>
                  <div className="gpa-content">
                    <textarea
                      placeholder={`Advice for ${item.gradePointAverage} GPA...`}
                      rows="3"
                      value={item.description}
                      onChange={(e) => handleGuidanceChange('gradePointAverageData', index, 'description', e.target.value)}
                      className="light-placeholder"
                    />
                  </div>
                </details>
              ))}
            </div>
          </div>

          {/* Curriculum guidance - Accordion style */}
          <div className="guidance-item">
            <h3>Curriculum guidance</h3>
            <div className="curriculum-accordion">
              {stepForm.curriculumData.map((item, index) => (
                <details key={item.curriculum} className="curriculum-details">
                  <summary className="curriculum-summary">
                    <span className="curriculum-label">{item.curriculum}</span>
                    <span className="accordion-icon">▼</span>
                  </summary>
                  <div className="curriculum-content">
                    <textarea
                      placeholder={`Advice for ${item.curriculum} curriculum...`}
                      rows="3"
                      value={item.description}
                      onChange={(e) => handleGuidanceChange('curriculumData', index, 'description', e.target.value)}
                      className="light-placeholder"
                    />
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button type="button" className="btn-draft">Save Draft</button>
          <button 
            type="button" 
            className="btn-submit" 
            onClick={handleSubmit} 
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Step'}
          </button>
          <button
            type="button"
            className="btn-back"
            onClick={() => inlineMode && onCancel ? onCancel() : navigate(`/dashboard/accountants/path/${id}`)}
          >
            ← Go back
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateNewStep;