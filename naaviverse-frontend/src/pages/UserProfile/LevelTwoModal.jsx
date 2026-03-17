import React, { useState } from "react";
import axios from "axios";
import close from "../../images/close.svg";
import { toast } from "react-toastify";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const LevelTwoModal = ({ onClose, onComplete, profileDataId, existingData }) => {
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    financialSituation: existingData?.financialSituation || "",
    school: existingData?.school || "",
    performance: existingData?.performance || "",
    curriculum: existingData?.curriculum || "",
    stream: existingData?.stream || "",
    grade: existingData?.grade || "",
    linkedin: existingData?.linkedin || ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelect = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if all fields are filled
    const allFilled = Object.values(formData).every(val => val && val.trim() !== "");
    
    if (!allFilled) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    
    try {
      const response = await axios.put(
        `${BASE_URL}/api/users/update/${profileDataId}`,
        formData
      );

      if (response.data?.status) {
        toast.success("Level 2 completed successfully!");
        onComplete();
      } else {
        toast.error("Failed to save level 2");
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Complete Level 2 - Academic Information</h2>
          <div className="close-btn" onClick={onClose}>
            <img src={close} alt="close" />
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Financial Situation */}
            <div className="form-group">
              <label>Financial Situation *</label>
              <div className="options-grid">
                {["0-25Lakhs", "25-75Lakhs", "75Lakhs-3CR", "3CR+"].map(option => (
                  <button
                    key={option}
                    type="button"
                    className={`option-btn ${formData.financialSituation === option ? 'selected' : ''}`}
                    onClick={() => handleSelect('financialSituation', option)}
                  >
                    {option.replace('Lakhs', ' L').replace('CR', ' Cr')}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>School *</label>
                <input
                  type="text"
                  name="school"
                  value={formData.school}
                  onChange={handleChange}
                  placeholder="Enter school name"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Grade *</label>
                <div className="options-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                  {["9", "10", "11", "12"].map(grade => (
                    <button
                      key={grade}
                      type="button"
                      className={`option-btn ${formData.grade === grade ? 'selected' : ''}`}
                      onClick={() => handleSelect('grade', grade)}
                    >
                      {grade}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Performance */}
            <div className="form-group">
              <label>Grade Point Average *</label>
              <div className="options-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                {["0%-35%", "36%-60%", "61%-75%", "76%-85%", "86%-95%", "96%-100%"].map(range => (
                  <button
                    key={range}
                    type="button"
                    className={`option-btn ${formData.performance === range ? 'selected' : ''}`}
                    onClick={() => handleSelect('performance', range)}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>

            {/* Curriculum */}
            <div className="form-group">
              <label>Curriculum *</label>
              <div className="options-grid">
                {["IB", "IGCSE", "CBSE", "ICSE", "Nordic"].map(curriculum => (
                  <button
                    key={curriculum}
                    type="button"
                    className={`option-btn ${formData.curriculum === curriculum ? 'selected' : ''}`}
                    onClick={() => handleSelect('curriculum', curriculum)}
                  >
                    {curriculum}
                  </button>
                ))}
              </div>
            </div>

            {/* Stream */}
            <div className="form-group">
              <label>Stream *</label>
              <div className="options-grid">
                {["MPC", "BIPC", "CEC", "MEC", "HEC"].map(stream => (
                  <button
                    key={stream}
                    type="button"
                    className={`option-btn ${formData.stream === stream ? 'selected' : ''}`}
                    onClick={() => handleSelect('stream', stream)}
                  >
                    {stream}
                  </button>
                ))}
              </div>
            </div>

            {/* LinkedIn */}
            <div className="form-group">
              <label>LinkedIn Profile *</label>
              <input
                type="url"
                name="linkedin"
                value={formData.linkedin}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/yourprofile"
                required
              />
            </div>
          </div>
          
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading}
            >
              {loading ? "Saving..." : "Complete Level 2"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LevelTwoModal;