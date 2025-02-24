import React, { useState, useEffect } from "react";
import axios from "axios";

const EditStepForm = ({ selectedStep, onSave, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showMessagePage, setShowMessagePage] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    length: "",
    cost: "",
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
    personalityData: [
      { personality: "realistic", description: "" },
      { personality: "investigative", description: "" },
      { personality: "artistic", description: "" },
      { personality: "social", description: "" },
      { personality: "enterprising", description: "" },
      { personality: "conventional", description: "" },
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
  });

  // Fetch step data by ID if selectedStep is provided
  useEffect(() => {
    const fetchStep = async () => {
      if (selectedStep) {
        setLoading(true);
        try {
          const response = await axios.get(`/api/steps/${selectedStep}`);
          const stepData = response.data.data;
          setFormData({
            name: stepData.name || "",
            description: stepData.description || "",
            length: stepData.length || "",
            cost: stepData.cost || "",
            gradeData: stepData.gradeData || [],
            financialData: stepData.financialData || [],
            personalityData: stepData.personalityData || [],
            streamData: stepData.streamData || [],
            gradePointAverageData: stepData.gradePointAverageData || [],
            curriculumData: stepData.curriculumData || [],
          });
        } catch (error) {
          console.error("Error fetching step data", error);
          setMessage("Failed to load step data.");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchStep();
  }, [selectedStep]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDescriptionChange = (e, field, key) => {
    const { value: descriptionValue } = e.target;
  
    const keyFieldMap = {
        gradeData: "grade",
        financialData: "financialSituation",
        personalityData: "personality",
        streamData: "stream",
        gradePointAverageData: "gradePointAverage",
        curriculumData: "curriculum",
    };

    const keyField = keyFieldMap[field];

    if (!keyField) {
        console.error(`Unknown field: ${field}`);
        return;
    }

    const updatedData = formData[field].map((item) =>
        item[keyField] === key ? { ...item, description: descriptionValue } : item
    );

    setFormData({ ...formData, [field]: updatedData });
};


  const handleSave = async () => {
    if (!selectedStep) {
        setMessage("No step selected.");
        return;
    }

    setLoading(true);

    const updatedFields = {};
    Object.keys(formData).forEach((key) => {
        if (formData[key] !== selectedStep[key]) {
            updatedFields[key] = formData[key]; // Send updated fields as-is
        }
    });

    if (Object.keys(updatedFields).length === 0) {
        setMessage("No changes made.");
        setLoading(false);
        return;
    }

    try {
        const response = await axios.patch(`/api/steps/editstep`, {
            stepId: selectedStep, // Ensure we send the step ID correctly
            ...updatedFields,
        });

        console.log("Response:", response.data);
        setMessage("Step updated successfully!");
        setShowForm(false); // Hide the form
        setShowMessagePage(true); // Show success message
    } catch (error) {
        console.error("API call failed", error.response?.data || error.message);
        setMessage("Failed to update step.");
    } finally {
        setLoading(false);
    }
};

  if (showMessagePage) {
    return (
      <div className="message-page">
        <p>{message}</p>
      </div>
    );
  }

  return (
    <div className="edit-step-container" style={{ maxHeight: "80vh", overflowY: "auto" }}>
      <div className="form-group">
        <label>Step Name</label>
        <input type="text" name="name" value={formData.name} onChange={handleChange} />
      </div>

      <div className="form-group">
        <label>Description</label>
        <textarea name="description" value={formData.description} onChange={handleChange}></textarea>
      </div>

      <div className="form-group">
        <label>Length</label>
        <input type="text" name="length" value={formData.length} onChange={handleChange} />
      </div>

      <div className="form-group">
        <label>Cost</label>
        <select name="cost" value={formData.cost} onChange={handleChange}>
          <option value="paid">Paid</option>
          <option value="free">Free</option>
        </select>
      </div>

      {/* Render Grade Data */}
      {formData.gradeData.map((grade) => (
        <div key={grade.grade} className="form-group">
          <label>{grade.grade} Description</label>
          <textarea
            value={grade.description}
            onChange={(e) => handleDescriptionChange(e, "gradeData", grade.grade)}
          />
        </div>
      ))}

      {/* Render Financial Data */}
      {formData.financialData.map((financialSituation) => (
        <div key={financialSituation.financialSituation} className="form-group">
          <label>{financialSituation.financialSituation} Description</label>
          <textarea
            value={financialSituation.description}
            onChange={(e) => handleDescriptionChange(e, "financialData", financialSituation.financialSituation)}
          />
        </div>
      ))}

      {/* Render Personality Data */}
      {formData.personalityData.map((personality) => (
        <div key={personality.personality} className="form-group">
          <label>{personality.personality} Description</label>
          <textarea
            value={personality.description}
            onChange={(e) => handleDescriptionChange(e, "personalityData", personality.personality)}
          />
        </div>
      ))}

      {/* Render Stream Data */}
      {formData.streamData.map((stream) => (
        <div key={stream.stream} className="form-group">
          <label>{stream.stream} Description</label>
          <textarea
            value={stream.description}
            onChange={(e) => handleDescriptionChange(e, "streamData", stream.stream)}
          />
        </div>
      ))}

      {/* Render Grade Point Average Data */}
      {formData.gradePointAverageData.map((gpa) => (
        <div key={gpa.gradePointAverage} className="form-group">
          <label>{gpa.gradePointAverage} Description</label>
          <textarea
            value={gpa.description}
            onChange={(e) => handleDescriptionChange(e, "gradePointAverageData", gpa.gradePointAverage)}
          />
        </div>
      ))}

      {/* Render Curriculum Data */}
      {formData.curriculumData.map((curriculum) => (
        <div key={curriculum.curriculum} className="form-group">
          <label>{curriculum.curriculum} Description</label>
          <textarea
            value={curriculum.description}
            onChange={(e) => handleDescriptionChange(e, "curriculumData", curriculum.curriculum)}
          />
        </div>
      ))}

      <div className="button-container">
        <button className="btn-secondary" onClick={onCancel} disabled={loading}>Go Back</button>
        <button className="btn-primary" onClick={handleSave} disabled={loading}>
          {loading ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
};

export default EditStepForm;
