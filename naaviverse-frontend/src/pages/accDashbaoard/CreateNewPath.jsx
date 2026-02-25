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
 const [stepCount, setStepCount] = useState('');
  
  // Duration state
  const [duration, setDuration] = useState({
    years: '',
    months: '',
    days: ''
  });

  // Location state
  const [preferredLocation, setPreferredLocation] = useState({
    city: '',
    country: ''
  });

  const handleNextStepClick = () => {
    // Validate required fields
    if (!pathSteps?.nameOfPath || !pathSteps?.description || !pathSteps?.program || !pathSteps?.destination_institution) {
      alert('Please fill in all required fields');
      return;
    }
    
    // Validate at least one option selected from each category
    if (grade.length === 0 || gradeAvg.length === 0 || curriculum.length === 0 || 
        stream.length === 0 || finance.length === 0 || !personality) {
      alert('Please select at least one option from each category');
      return;
    }
    
    setShowPopup(true);
  };

 const handleContinue = () => {
  if (!stepCount || parseInt(stepCount) < 1) {
    alert("Please enter a valid number of steps");
    return;
  }

  setShowPopup(false);

  const years = parseInt(duration.years) || 0;
  const months = parseInt(duration.months) || 0;
  const days = parseInt(duration.days) || 0;
  const totalDays = (years * 365) + (months * 30) + days;

  setPathSteps({
    ...pathSteps,
    duration: {
      years,
      months,
      days,
      totalDays
    },
    preferredLocation
  });

  localStorage.setItem('pathStepCount', stepCount);
  localStorage.setItem('pathDuration', JSON.stringify(duration));
  localStorage.setItem('preferredLocation', JSON.stringify(preferredLocation));

  pathSubmission();
};

  const handleCancel = () => {
  setShowPopup(false);
  setStepCount('');
};

  // Handler for single select (personality) - using parent's handler


  // Handler for multi-select - using parent's handlers


  // Handler for single select (personality) - using parent's handler
  const handlePersonalitySelect = (item) => {
    handlePersonality(item);
  };

  // Handler for multi-select - using parent's handlers
  const handleMultiSelect = (type, item) => {
    switch(type) {
      case 'grade':
        handleGrade(item);
        break;
      case 'gradeAvg':
        handleGradeAvg(item);
        break;
      case 'curriculum':
        handleCurriculum(item);
        break;
      case 'stream':
        handleStream(item);
        break;
      case 'finance':
        handleFinance(item);
        break;
      default:
        break;
    }
  };

  return (
    <>
      <div className="new-path-container">
        <div className="new-path-content">
          {/* Basic Information Section */}
          <div className="form-section">
            <h2 className="section-title">Basic information</h2>
            
            <div className="form-field">
              <label>What is the name of the path? <span className="required">*</span></label>
              <input 
                type="text" 
                placeholder="e.g., IBDP Engineering Pathway - Germany"
                value={pathSteps?.nameOfPath || ''}
                onChange={(e) => setPathSteps({...pathSteps, nameOfPath: e.target.value})}
              />
            </div>

            <div className="form-field">
              <label>How long will the path approx take?</label>
              <div className="duration-dropdown-group">

  {/* Years */}
  <div className="duration-select">
    <label>Years</label>
    <select
      value={duration.years}
      onChange={(e) => setDuration({ ...duration, years: e.target.value })}
    >
      <option value="">Select</option>
      {[...Array(11)].map((_, i) => (
        <option key={i} value={i}>{i}</option>
      ))}
    </select>
  </div>

  {/* Months */}
  <div className="duration-select">
    <label>Months</label>
    <select
      value={duration.months}
      onChange={(e) => setDuration({ ...duration, months: e.target.value })}
    >
      <option value="">Select</option>
      {[...Array(12)].map((_, i) => (
        <option key={i} value={i}>{i}</option>
      ))}
    </select>
  </div>

  {/* Days */}
  <div className="duration-select">
    <label>Days</label>
    <select
      value={duration.days}
      onChange={(e) => setDuration({ ...duration, days: e.target.value })}
    >
      <option value="">Select</option>
      {[...Array(31)].map((_, i) => (
        <option key={i} value={i}>{i}</option>
      ))}
    </select>
  </div>

</div>
            </div>

            <div className="form-field">
              <label>Describe the path <span className="required">*</span></label>
              <textarea 
                placeholder="e.g., This path guides students from IBDP through admission to top German engineering universities."
                value={pathSteps?.description || ''}
                onChange={(e) => setPathSteps({...pathSteps, description: e.target.value})}
                rows="4"
              />
            </div>

            <div className="form-field">
              <label>What type of path is it? <span className="required">*</span></label>
              <div className="path-type-group">
                {['Education', 'Career', 'Immigration'].map((type) => (
                  <button
                    key={type}
                    className={`path-type-btn ${pathSteps?.path_type === type.toLowerCase() ? 'active-green' : ''}`}
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
            <h3 className="section-subtitle">Ideal fit (select at least one from each)</h3>

            <div className="form-field">
              <label>Select ideal grade for participant <span className="required">*</span></label>
              <div className="options-grid">
                {gradeList.map((item) => (
                  <button
                    key={item}
                    className={`option-btn ${grade.includes(item) ? 'selected-green' : ''}`}
                    onClick={() => handleMultiSelect('grade', item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-field">
              <label>Select ideal grade point average <span className="required">*</span></label>
              <div className="options-grid">
                {gradePointAvg.map((item) => (
                  <button
                    key={item}
                    className={`option-btn ${gradeAvg.includes(item) ? 'selected-green' : ''}`}
                    onClick={() => handleMultiSelect('gradeAvg', item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-field">
              <label>Select ideal curriculum <span className="required">*</span></label>
              <div className="options-grid">
                {curriculumList.map((item) => (
                  <button
                    key={item}
                    className={`option-btn ${curriculum.includes(item) ? 'selected-green' : ''}`}
                    onClick={() => handleMultiSelect('curriculum', item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-field">
              <label>Select ideal stream <span className="required">*</span></label>
              <div className="options-grid streams-grid">
                {streamList.map((item) => (
                  <button
                    key={item}
                    className={`option-btn stream-btn ${stream.includes(item) ? 'selected-green' : ''}`}
                    onClick={() => handleMultiSelect('stream', item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-field">
              <label>Select ideal financial situation <span className="required">*</span></label>
              <div className="options-grid finance-grid">
                {financeList.map((item) => (
                  <button
                    key={item}
                    className={`option-btn finance-btn ${finance.includes(item) ? 'selected-green' : ''}`}
                    onClick={() => handleMultiSelect('finance', item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-field">
              <label>What personality suits this path? <span className="required">*</span></label>
              <div className="personality-grid">
                {personalityList.map((item) => (
                  <button
                    key={item}
                    className={`personality-btn ${personality === item ? 'selected-green' : ''}`}
                    onClick={() => handlePersonalitySelect(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          
          
          {/* Preferred Location */}
<div className="form-field">
  <label>Preferred Location (Optional)</label>

  <div className="profile-location-grid">

    <input
      type="text"
      placeholder="Address"
      value={preferredLocation.address || ''}
      onChange={(e) =>
        setPreferredLocation({ ...preferredLocation, address: e.target.value })
      }
    />

    <input
      type="text"
      placeholder="City"
      value={preferredLocation.city}
      onChange={(e) =>
        setPreferredLocation({ ...preferredLocation, city: e.target.value })
      }
    />

    <select
      value={preferredLocation.country}
      onChange={(e) =>
        setPreferredLocation({ ...preferredLocation, country: e.target.value })
      }
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

          {/* Academic Target Section */}
          <div className="form-section">
            <h2 className="section-title">Academic target</h2>

            <div className="form-field">
              <label>What program will they be studying? <span className="required">*</span></label>
              <input 
                type="text" 
                placeholder="e.g., B.Sc. Mechanical Engineering"
                value={pathSteps?.program || ''}
                onChange={(e) => setPathSteps({...pathSteps, program: e.target.value})}
              />
            </div>

            <div className="form-field">
              <label>What is the destination of the path? <span className="required">*</span></label>
              <input 
                type="text" 
                placeholder="e.g., Technical University of Munich"
                value={pathSteps?.destination_institution || ''}
                onChange={(e) => setPathSteps({...pathSteps, destination_institution: e.target.value})}
              />
            </div>

            <div className="form-row">
              <div className="form-field half">
                <label>City</label>
                <input 
                  type="text" 
                  placeholder="e.g., Munich"
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
  step="1"
  placeholder="Enter number of steps"
  value={stepCount}
  onChange={(e) => setStepCount(e.target.value)}
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