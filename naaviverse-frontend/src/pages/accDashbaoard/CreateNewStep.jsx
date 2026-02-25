import React, { useState } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import './CreateNewStep.scss';

const CreateNewStep = () => {
const { id } = useParams();
  const navigate = useNavigate();
  const [stepForm, setStepForm] = useState({
    name: "",
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
    
    personalityData: [
      { personality: "realistic", description: "" },
      { personality: "investigative", description: "" },
      { personality: "artistic", description: "" },
      { personality: "social", description: "" },
      { personality: "enterprising", description: "" },
      { personality: "conventional", description: "" },
    ],
  });

  const [loading, setLoading] = useState(false);
  const [availablePaths, setAvailablePaths] = useState([]);
  const [searchPath, setSearchPath] = useState("");

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

  // Submit step
const handleSubmit = async () => {
  setLoading(true);
  try {
    // TODO: Add your API call here
    console.log("Submitting step:", stepForm);

    // After success, go back to path page
    navigate(`/dashboard/accountants/path/${id}`);

  } catch (error) {
    console.error("Error creating step:", error);
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

          <div className="form-field">
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

          <div className="form-field">
            <label>What type of step is it?</label>
            <div className="cost-options">
              <button
                className={`cost-btn ${stepForm.cost === 'paid' ? 'active' : ''}`}
                onClick={() => setStepForm({...stepForm, cost: 'paid'})}
              >
                Paid
              </button>
              <button
                className={`cost-btn ${stepForm.cost === 'free' ? 'active' : ''}`}
                onClick={() => setStepForm({...stepForm, cost: 'free'})}
              >
                Free
              </button>
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
            <label>What is the instructions for the nano view?</label>
            <textarea
              name="nanoDescription"
              placeholder="Provide detailed, granular instructions and specific tasks for this step..."
              rows="4"
              value={stepForm.nanoDescription}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-field">
            <label>Which path does this step belong to?</label>
            <div className="path-selector">
              <input
                type="text"
                placeholder="Search or select a path"
                value={searchPath}
                onChange={(e) => setSearchPath(e.target.value)}
              />
              <select 
                value={stepForm.path_id}
                onChange={(e) => setStepForm({...stepForm, path_id: e.target.value})}
              >
                <option value="">Select a path</option>
                <option value="path1">IBDP Engineering Pathway - Germany</option>
                <option value="path2">Medical Career Path - USA</option>
                {/* Add your paths here */}
              </select>
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
                />
              </div>
            ))}
          </div>
        </div>

        {/* Additional guidance Section */}
        <div className="form-section">
          <h2 className="section-title">Additional guidance</h2>
          
          <div className="guidance-accordion">
            <div className="guidance-item">
              <h3>Personality guidance</h3>
              <div className="personality-grid">
                {stepForm.personalityData.map((item, index) => (
                  <div key={item.personality} className="personality-card">
                    <span className="personality-label">{item.personality}</span>
                    <textarea
                      placeholder={`How ${item.personality} personalities can approach this step...`}
                      rows="2"
                      value={item.description}
                      onChange={(e) => handleGuidanceChange('personalityData', index, 'description', e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="guidance-item">
              <h3>Stream guidance</h3>
              <div className="stream-grid">
                {stepForm.streamData.map((item, index) => (
                  <div key={item.stream} className="stream-card">
                    <span className="stream-label">{item.stream}</span>
                    <textarea
                      placeholder={`Advice for ${item.stream} stream...`}
                      rows="2"
                      value={item.description}
                      onChange={(e) => handleGuidanceChange('streamData', index, 'description', e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="guidance-item">
              <h3>GPA guidance</h3>
              <div className="gpa-grid">
                {stepForm.gradePointAverageData.map((item, index) => (
                  <div key={item.gradePointAverage} className="gpa-card">
                    <span className="gpa-label">{item.gradePointAverage}</span>
                    <textarea
                      placeholder={`Advice for ${item.gradePointAverage} GPA...`}
                      rows="2"
                      value={item.description}
                      onChange={(e) => handleGuidanceChange('gradePointAverageData', index, 'description', e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="guidance-item">
              <h3>Curriculum guidance</h3>
              <div className="curriculum-grid">
                {stepForm.curriculumData.map((item, index) => (
                  <div key={item.curriculum} className="curriculum-card">
                    <span className="curriculum-label">{item.curriculum}</span>
                    <textarea
                      placeholder={`Advice for ${item.curriculum} curriculum...`}
                      rows="2"
                      value={item.description}
                      onChange={(e) => handleGuidanceChange('curriculumData', index, 'description', e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="progress-section">
          <div className="progress-label">
            <span>Completed</span>
            <span className="progress-percentage">0%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: '0%' }}></div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button className="btn-draft">Save Draft</button>
          <button className="btn-submit" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Step'}
          </button>
<button
  className="btn-back"
  onClick={() => navigate("/dashboard/accountants/paths")}
>
            ← Go back
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateNewStep;