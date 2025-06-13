import React, { useState } from "react";
import axios from "axios";
import './steps.css';

const AddSubStepForm = ({ type, selectedStep, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: ""
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const apiMap = {
    macro: "/api/steps/add-macro-step",
    micro: "/api/steps/add-micro-step",
    nano: "/api/steps/add-nano-step"
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!selectedStep) {
      setMessage("Step ID missing.");
      return;
    }

    if (!formData.name || !formData.description) {
      setMessage("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(apiMap[type], {
        stepId: selectedStep,
        name: formData.name,
        description: formData.description
      });

      const { alreadyExists } = res.data;

      if (alreadyExists) {
        setMessage(`${type.charAt(0).toUpperCase() + type.slice(1)} step already exists.`);
      } else {
        setMessage(`${type.charAt(0).toUpperCase() + type.slice(1)} step added successfully.`);
      }

      // Auto-close form after 1.5 seconds
      setTimeout(() => {
        onSave();
      }, 1500);

    } catch (error) {
      console.error(error);
      setMessage("Failed to add step.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="editStepForm_edit-step-container">
      <h3>
  Add {typeof type === "string" ? type.charAt(0).toUpperCase() + type.slice(1) : ""} Step
</h3>


      <div className="editStepForm_form-group">
        <label>Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          disabled={loading}
        />
      </div>

      <div className="editStepForm_form-group">
        <label>Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          disabled={loading}
        />
      </div>

      <div className="editStepForm_button-container">
        <button
          className="editStepForm_cancel-button"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </button>
        <button
          className="editStepForm_save-button"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Saving..." : "Add"}
        </button>
      </div>

      {message && <p>{message}</p>}
    </div>
  );
};

export default AddSubStepForm;
