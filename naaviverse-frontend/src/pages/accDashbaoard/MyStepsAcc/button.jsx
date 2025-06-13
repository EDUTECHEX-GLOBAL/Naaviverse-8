import React, { useEffect, useState } from "react";
import axios from "axios";
import AddSubStepForm from "./steps.jsx";

const SubStepActionPanel = ({ type, selectedStepId, onCancel, onSave, onView }) => {
  const [alreadyExists, setAlreadyExists] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchSubStepStatus = async () => {
    try {
      const res = await axios.get(`/api/steps/get-step/${selectedStepId}`);
      const data = res.data;

      const fieldMap = {
        macro: "macro_name",
        micro: "micro_name",
        nano: "nano_name"
      };

      setAlreadyExists(Boolean(data[fieldMap[type]]));
    } catch (err) {
      console.error("Error checking substep status", err);
    }
  };

  useEffect(() => {
    if (selectedStepId) {
      fetchSubStepStatus();
    }
  }, [selectedStepId, type]);

  if (showForm) {
    return (
      <AddSubStepForm
        type={type}
        selectedStep={selectedStepId}
        onSave={onSave}
        onCancel={() => {
          setShowForm(false);
        }}
      />
    );
  }

  return (
    <div className="subStepAction_buttons">
      <button
        className="add-button"
        onClick={() => setShowForm(true)}
        disabled={alreadyExists}
      >
        {alreadyExists ? "Already Added" : "Add Step"}
      </button>

      <button
        className="view-button"
        onClick={() => onView(type)}
        disabled={!alreadyExists}
        style={{ marginLeft: "10px" }}
      >
        View Step
      </button>

      <button
        className="cancel-button"
        onClick={onCancel}
        style={{ marginLeft: "10px" }}
      >
        Cancel
      </button>
    </div>
  );
};

export default SubStepActionPanel;
