import React, { useState } from 'react';
import './CreateNewPath.scss';

const CreateNewPath = ({ 
  setpstep, 
  setaccsideNav,
  pathSteps, 
  setPathSteps,
  grade, 
  setGrade,
  gradeAvg, 
  setGradeAvg,
  curriculum, 
  setCurriculum,
  stream, 
  setStream,
  finance, 
  setFinance,
  personality, 
  setPersonality,
  gradeList,
  gradePointAvg,
  curriculumList,
  streamList,
  financeList,
  personalityList,
  countryApiValue,
  handleGrade,
  handleGradeAvg,
  handleCurriculum,
  handleStream,
  handleFinance,
  handlePersonality,
  pathSubmission
}) => {
  const [showPopup, setShowPopup] = useState(false);
  const [stepCount, setStepCount] = useState(1);

  const handleNextStepClick = () => {
    if (!pathSteps?.nameOfPath || !pathSteps?.length || !pathSteps?.description) {
      alert('Please fill in all required fields');
      return;
    }
    setShowPopup(true);
  };

  const handleContinue = () => {
    setShowPopup(false);
    localStorage.setItem('pathStepCount', stepCount);
    pathSubmission();
  };

  const handleCancel = () => {
    setShowPopup(false);
    setStepCount(1);
  };

  return (
    <>
      <div className="new-path-container">
        <div className="new-path-content">
          {/* Basic Information Section */}
          <div className="form-section">
            <h2 className="section-title">Basic information</h2>
            
            <div className="form-field">
              <label>What is the name of the path?</label>
              <input 
                type="text" 
                placeholder="IBDP Engineering Pathway - Germany"
                value={pathSteps?.nameOfPath || ''}
                onChange={(e) => setPathSteps({...pathSteps, nameOfPath: e.target.value})}
              />
            </div>

            <div className="form-field">
              <label>How long will the path approx take?</label>
              <div className="duration-field">
                <input 
                  type="number" 
                  placeholder="3"
                  value={pathSteps?.length || ''}
                  onChange={(e) => setPathSteps({...pathSteps, length: e.target.value})}
                />
                <span className="years-badge">Years</span>
              </div>
            </div>

            <div className="form-field">
              <label>Describe the path</label>
              <textarea 
                placeholder="This path guides students from IBDP through admission to top German engineering universities."
                value={pathSteps?.description || ''}
                onChange={(e) => setPathSteps({...pathSteps, description: e.target.value})}
                rows="4"
              />
            </div>

            <div className="form-field">
              <label>What type of path is it?</label>
              <div className="path-type-group">
                {['Education', 'Career', 'Immigration'].map((type) => (
                  <button
                    key={type}
                    className={`path-type-btn ${pathSteps?.path_type === type.toLowerCase() ? 'active' : ''}`}
                    onClick={() => setPathSteps({...pathSteps, path_type: type.toLowerCase()})}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Participant Profile Section */}
          <div className="form-section">
            <h2 className="section-title">Participant profile</h2>
            <h3 className="section-subtitle">Ideal fit</h3>

            <div className="form-field">
              <label>Select ideal grade for participant</label>
              <div className="options-grid">
                {gradeList.map((item) => (
                  <button
                    key={item}
                    className={`option-btn ${grade.includes(item) ? 'selected' : ''}`}
                    onClick={() => handleGrade(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-field">
              <label>Select ideal grade point average</label>
              <div className="options-grid">
                {gradePointAvg.map((item) => (
                  <button
                    key={item}
                    className={`option-btn ${gradeAvg.includes(item) ? 'selected' : ''}`}
                    onClick={() => handleGradeAvg(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-field">
              <label>Select ideal curriculum</label>
              <div className="options-grid">
                {curriculumList.map((item) => (
                  <button
                    key={item}
                    className={`option-btn ${curriculum.includes(item) ? 'selected' : ''}`}
                    onClick={() => handleCurriculum(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-field">
              <label>Select ideal stream</label>
              <div className="options-grid">
                {streamList.map((item) => (
                  <button
                    key={item}
                    className={`option-btn ${stream.includes(item) ? 'selected' : ''}`}
                    onClick={() => handleStream(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-field">
              <label>Select ideal financial situation</label>
              <div className="options-grid">
                {financeList.map((item) => (
                  <button
                    key={item}
                    className={`option-btn ${finance.includes(item) ? 'selected' : ''}`}
                    onClick={() => handleFinance(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-field">
              <label>What personality suits this path?</label>
              <div className="personality-grid">
                {personalityList.map((item) => (
                  <button
                    key={item}
                    className={`personality-btn ${personality === item ? 'selected' : ''}`}
                    onClick={() => handlePersonality(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Academic Target Section */}
          <div className="form-section">
            <h2 className="section-title">Academic target</h2>

            <div className="form-field">
              <label>What program will they be studying?</label>
              <input 
                type="text" 
                placeholder="B.Sc. Mechanical Engineering"
                value={pathSteps?.program || ''}
                onChange={(e) => setPathSteps({...pathSteps, program: e.target.value})}
              />
            </div>

            <div className="form-field">
              <label>What is the destination of the path?</label>
              <input 
                type="text" 
                placeholder="Technical University of Munich"
                value={pathSteps?.destination_institution || ''}
                onChange={(e) => setPathSteps({...pathSteps, destination_institution: e.target.value})}
              />
            </div>

            <div className="form-row">
              <div className="form-field half">
                <label>City</label>
                <input 
                  type="text" 
                  placeholder="Munich"
                  value={pathSteps?.city || ''}
                  onChange={(e) => setPathSteps({...pathSteps, city: e.target.value})}
                />
              </div>
              <div className="form-field half">
                <label>Country</label>
                <select 
                  value={pathSteps?.country || ''}
                  onChange={(e) => setPathSteps({...pathSteps, country: e.target.value})}
                >
                  <option value="">Select Country</option>
                  {countryApiValue?.map((item) => (
                    <option key={item.cca2} value={item.name?.common || item.name}>
                      {item.name?.common || item.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="progress-section">
            <div className="progress-label">
              <span>Completed</span>
              <span className="progress-percentage">100%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: '100%' }}></div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button className="btn-back" onClick={() => setaccsideNav("Paths")}>Go Back</button>
            <button className="btn-next" onClick={handleNextStepClick}>Next Step →</button>
          </div>
        </div>
      </div>

      {/* Step Count Popup */}
      {showPopup && (
        <>
          <div className="step-popup-overlay" onClick={handleCancel} />
          <div className="step-popup" onClick={(e) => e.stopPropagation()}>
            <h3 className="step-popup-title">Add Steps to Your Path</h3>
            <p className="step-popup-description">
              How many steps do you want to add to this path? You can add as many as you need.
            </p>
            <div className="step-popup-input-wrapper">
              <input
                type="number"
                min="1"
                value={stepCount}
                onChange={(e) => setStepCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="step-popup-input"
              />
            </div>
            <div className="step-popup-buttons">
              <button className="step-popup-btn step-popup-btn-cancel" onClick={handleCancel}>
                Cancel
              </button>
              <button className="step-popup-btn step-popup-btn-continue" onClick={handleContinue}>
                Continue →
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default CreateNewPath;
//new temp