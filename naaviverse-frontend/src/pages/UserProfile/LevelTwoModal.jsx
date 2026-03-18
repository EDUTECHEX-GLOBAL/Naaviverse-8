import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

/**
 * LevelTwoModal
 *
 * Props:
 *  inline        — render without outer overlay
 *  creation      — true when creating for first time
 *  profileDataId — MongoDB _id of the user document
 *  existingData  — existing profile object
 *  onClose       — cancel handler (null if can't dismiss)
 *  onComplete    — success callback
 */
const LevelTwoModal = ({
  inline = false,
  creation = false,
  profileDataId,
  existingData,
  onClose,
  onComplete,
}) => {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    financialSituation: existingData?.financialSituation || "",
    school:             existingData?.school             || "",
    performance:        existingData?.performance        || "",
    curriculum:         existingData?.curriculum         || "",
    stream:             existingData?.stream             || "",
    grade:              existingData?.grade              || "",
    linkedin:           existingData?.linkedin           || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSelect = (field, value) => {
    setFormData((p) => ({ ...p, [field]: value }));
  };

  const isFormValid = () =>
    formData.financialSituation &&
    formData.school &&
    formData.performance &&
    formData.curriculum &&
    formData.stream &&
    formData.grade &&
    formData.linkedin;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) { toast.error("Please fill in all fields"); return; }

    setLoading(true);
    try {
      const response = await axios.put(
        `${BASE_URL}/api/users/update/${profileDataId}`,
        formData
      );
      if (response.data?.status) {
        if (typeof onComplete === "function") onComplete();
      } else {
        toast.error(response.data?.message || "Failed to save");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const ChipGroup = ({ label, field, options, required }) => (
    <div className="up-form-group">
      <label className="up-form-label">{label}{required ? " *" : ""}</label>
      <div className="up-chips">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            className={`up-chip ${formData[field] === opt ? "up-chip--selected" : ""}`}
            onClick={() => handleSelect(field, opt)}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit}>
      <div className="up-form-wrap">
        <div className="up-form-title">
          {creation ? "Step 2 — Academic Information" : "Edit Academic Information"}
        </div>
        <div className="up-form-desc">
          {creation
            ? "Tell us about your school & academics."
            : "Update your academic & financial details."}
        </div>

        {/* Financial Situation */}
        <ChipGroup
          label="Financial Situation"
          field="financialSituation"
          required
          options={["0-25Lakhs", "25-75Lakhs", "75Lakhs-3CR", "3CR+"]}
        />

        {/* School + Grade */}
        <div className="up-form-row">
          <div className="up-form-group">
            <label className="up-form-label">School *</label>
            <input
              className="up-input"
              type="text"
              name="school"
              value={formData.school}
              onChange={handleChange}
              placeholder="Enter school name"
              required
            />
          </div>

          <div className="up-form-group">
            <label className="up-form-label">Grade *</label>
            <div className="up-chips">
              {["9", "10", "11", "12"].map((g) => (
                <button
                  key={g}
                  type="button"
                  className={`up-chip ${formData.grade === g ? "up-chip--selected" : ""}`}
                  onClick={() => handleSelect("grade", g)}
                >
                  Grade {g}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Performance */}
        <ChipGroup
          label="Grade Point Average"
          field="performance"
          required
          options={["0%-35%", "36%-60%", "61%-75%", "76%-85%", "86%-95%", "96%-100%"]}
        />

        {/* Curriculum */}
        <ChipGroup
          label="Curriculum"
          field="curriculum"
          required
          options={["IB", "IGCSE", "CBSE", "ICSE", "Nordic"]}
        />

        {/* Stream */}
        <ChipGroup
          label="Stream"
          field="stream"
          required
          options={["MPC", "BIPC", "CEC", "MEC", "HEC"]}
        />

        {/* LinkedIn */}
        <div className="up-form-group">
          <label className="up-form-label">LinkedIn Profile *</label>
          <input
            className="up-input"
            type="url"
            name="linkedin"
            value={formData.linkedin}
            onChange={handleChange}
            placeholder="https://linkedin.com/in/yourprofile"
            required
          />
        </div>

        {/* Footer */}
        <div className="up-form-footer">
          {onClose && !creation && (
            <button type="button" className="up-btn-cancel" onClick={onClose}>
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="up-btn-primary"
            disabled={!isFormValid() || loading}
          >
            {loading
              ? "Saving…"
              : creation
              ? "Continue →"
              : "Save Changes"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default LevelTwoModal;