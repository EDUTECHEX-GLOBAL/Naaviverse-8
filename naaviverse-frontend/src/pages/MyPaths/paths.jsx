import React, { useState, useEffect } from "react";
import axios from "axios";
import "./mypaths.scss";

const EditPathForm = ({ selectedPath, onSave, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(true);
  const [showMessagePage, setShowMessagePage] = useState(false);

  // ---------- INITIAL STATE ----------
  const [formData, setFormData] = useState({
    nameOfPath: "",
    description: "",
    program: "",
    path_type: "",
    path_cat: "",
    personality: "",
    financialSituation: [],
    curriculum: [],
    grade: [],
    stream: [],
    length: "",
    destination_institution: "",
    city: "",
    country: "",
    grade_avg: [], // keep as array in DB, but we’ll treat as single-select in UI
  });

  // ---------- FILL FORM WHEN PATH CHANGES ----------
  useEffect(() => {
    if (!selectedPath) return;

    setFormData({
      nameOfPath: selectedPath?.nameOfPath || "",
      description: selectedPath?.description || "",
      program: selectedPath?.program || "",
      path_type: selectedPath?.path_type || "",
      path_cat: selectedPath?.path_cat || "",
      personality: selectedPath?.personality || "",
      financialSituation: selectedPath?.financialSituation || [],
      curriculum: selectedPath?.curriculum || [],
      grade: selectedPath?.grade || [],
      stream: selectedPath?.stream || [],
      length: selectedPath?.length || "",
      destination_institution:
        selectedPath?.destination_institution ||
        selectedPath?.university ||
        "",
      city: selectedPath?.city || "",
      country: selectedPath?.country || "",
      grade_avg: selectedPath?.grade_avg || [],
    });

    setShowForm(true);
    setShowMessagePage(false);
    setMessage("");
  }, [selectedPath]);

  // ---------- BASIC INPUT CHANGE ----------
  const handleChange = (e) => {
    const { name, value } = e.target;

    // grade_avg we store as array (single selected value)
    if (name === "grade_avg") {
      setFormData((prev) => ({
        ...prev,
        grade_avg: value ? [value] : [],
      }));
      return;
    }

    // destination_institution must be updated by this input
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ---------- MULTI SELECT FIELDS ----------
  const handleMultiSelectChange = (e, fieldName) => {
    const selectedValues = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    setFormData((prev) => ({
      ...prev,
      [fieldName]: selectedValues,
    }));
  };

  // ---------- SAVE ----------
  const handleSave = async () => {
    if (!selectedPath || !selectedPath._id) {
      setMessage("No path selected.");
      return;
    }

    setLoading(true);

    const updatedFields = {};

    Object.keys(formData).forEach((key) => {
      const newVal = formData[key];
      const oldVal = selectedPath[key];

      // Compare arrays deeply
      if (Array.isArray(newVal)) {
        const oldArr = Array.isArray(oldVal) ? oldVal : [];
        const isSameLength = newVal.length === oldArr.length;
        const isSameContent =
          isSameLength &&
          newVal.every((v, i) => String(v) === String(oldArr[i]));

        if (!isSameContent) {
          updatedFields[key] = newVal; // ✅ keep as ARRAY, do NOT join
        }
      } else {
        // Compare scalars
        if (newVal !== oldVal) {
          updatedFields[key] = typeof newVal === "string" ? newVal.trim() : newVal;
        }
      }
    });

    if (Object.keys(updatedFields).length === 0) {
      setMessage("No changes made.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.patch(`/api/paths/edit`, {
        pathId: selectedPath._id,
        ...updatedFields,
      });

      setMessage("Path updated successfully!");
      setShowForm(false);
      setShowMessagePage(true);

      if (onSave && typeof onSave === "function") {
        onSave(response.data?.data || null);
      }
    } catch (error) {
      console.error("API call failed", error.response?.data || error.message);
      setMessage("Failed to update path.");
    } finally {
      setLoading(false);
    }
  };

  // ---------- CANCEL ----------
  const handleCancelClick = () => {
    setMessage("");
    setShowMessagePage(false);
    onCancel && onCancel();
  };

  // ---------- MESSAGE PAGE ----------
  if (showMessagePage) {
    return (
      <div className="message-page">
        <p className="text-center text-sm text-green-600">{message}</p>
        <div className="button-container" style={{ marginTop: "1rem" }}>
          <button className="form-button save-button" onClick={handleCancelClick}>
            Close
          </button>
        </div>
      </div>
    );
  }

  if (!showForm) return null;

  // ---------- FORM UI ----------
  return (
    <div className="acc-addpath">
      {message && (
        <p className="text-center text-sm text-green-600">{message}</p>
      )}

      {/* Name */}
      <div className="each-acc-addpath-field">
        <div className="each-acc-addpath-field-name">Name of the Path</div>
        <div className="each-acc-addpath-field-input">
          <input
            type="text"
            name="nameOfPath"
            value={formData.nameOfPath}
            onChange={handleChange}
            placeholder="Enter path name"
          />
        </div>
      </div>

      {/* Description */}
      <div className="each-acc-addpath-field">
        <div className="each-acc-addpath-field-name">Description</div>
        <div className="each-acc-addpath-field-input">
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter description"
          />
        </div>
      </div>

      {/* Program */}
      <div className="each-acc-addpath-field">
        <div className="each-acc-addpath-field-name">Program</div>
        <div className="each-acc-addpath-field-input">
          <input
            type="text"
            name="program"
            value={formData.program}
            onChange={handleChange}
            placeholder="Enter program"
          />
        </div>
      </div>

      {/* Path Type */}
      <div className="each-acc-addpath-field">
        <div className="each-acc-addpath-field-name">Path Type</div>
        <div className="each-acc-addpath-field-input">
          <select
            name="path_type"
            value={formData.path_type}
            onChange={handleChange}
          >
            <option value="">Select path type</option>
            <option value="immigration">immigration</option>
            <option value="education">education</option>
            <option value="career">career</option>
          </select>
        </div>
      </div>

      {/* Personality */}
      <div className="each-acc-addpath-field">
        <div className="each-acc-addpath-field-name">Personality</div>
        <div className="each-acc-addpath-field-input">
          <select
            name="personality"
            value={formData.personality}
            onChange={handleChange}
          >
            <option value="">Select personality</option>
            <option value="realistic">realistic</option>
            <option value="investigative">investigative</option>
            <option value="artistic">artistic</option>
            <option value="social">social</option>
            <option value="enterprising">enterprising</option>
            <option value="conventional">conventional</option>
          </select>
        </div>
      </div>

      {/* Length */}
      <div className="each-acc-addpath-field">
        <div className="each-acc-addpath-field-name">Length</div>
        <div className="each-acc-addpath-field-input">
          <input
            type="text"
            name="length"
            value={formData.length}
            onChange={handleChange}
            placeholder="Enter length"
          />
        </div>
      </div>

      {/* Destination Institution */}
      <div className="each-acc-addpath-field">
        <div className="each-acc-addpath-field-name">Destination</div>
        <div className="each-acc-addpath-field-input">
          <input
            type="text"
            name="destination_institution"
            value={formData.destination_institution}
            onChange={handleChange}
            placeholder="Enter destination institution"
          />
        </div>
      </div>

      {/* City */}
      <div className="each-acc-addpath-field">
        <div className="each-acc-addpath-field-name">City</div>
        <div className="each-acc-addpath-field-input">
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="Enter city"
          />
        </div>
      </div>

      {/* Country */}
      <div className="each-acc-addpath-field">
        <div className="each-acc-addpath-field-name">Country</div>
        <div className="each-acc-addpath-field-input">
          <input
            type="text"
            name="country"
            value={formData.country}
            onChange={handleChange}
            placeholder="Enter country"
          />
        </div>
      </div>

      {/* Grade Average */}
      <div className="each-acc-addpath-field">
        <div className="each-acc-addpath-field-name">Grade Average</div>
        <div className="each-acc-addpath-field-input">
          <select
            name="grade_avg"
            value={formData.grade_avg[0] || ""}
            onChange={handleChange}
          >
            <option value="">Select grade range</option>
            <option value="0%-35%">0%-35%</option>
            <option value="36%-60%">36%-60%</option>
            <option value="61%-75%">61%-75%</option>
            <option value="76%-85%">76%-85%</option>
            <option value="86%-95%">86%-95%</option>
            <option value="96%-100%">96%-100%</option>
          </select>
        </div>
      </div>

      {/* Financial Situation */}
      <div className="each-acc-addpath-field">
        <div className="each-acc-addpath-field-name">Financial Situation</div>
        <div className="each-acc-addpath-field-input">
          <select
            multiple
            value={formData.financialSituation}
            onChange={(e) => handleMultiSelectChange(e, "financialSituation")}
          >
            <option value="0-25L">0-25L</option>
            <option value="25L-75L">25L-75L</option>
            <option value="75L-3CR">75L-3CR</option>
            <option value="3CR+">3CR+</option>
          </select>
        </div>
      </div>

      {/* Stream */}
      <div className="each-acc-addpath-field">
        <div className="each-acc-addpath-field-name">Stream</div>
        <div className="each-acc-addpath-field-input">
          <select
            multiple
            value={formData.stream}
            onChange={(e) => handleMultiSelectChange(e, "stream")}
          >
            <option value="MPC">MPC</option>
            <option value="BIPC">BIPC</option>
            <option value="CEC">CEC</option>
            <option value="MEC">MEC</option>
            <option value="HEC">HEC</option>
          </select>
        </div>
      </div>

      {/* Curriculum */}
      <div className="each-acc-addpath-field">
        <div className="each-acc-addpath-field-name">Curriculum</div>
        <div className="each-acc-addpath-field-input">
          <select
            multiple
            value={formData.curriculum}
            onChange={(e) => handleMultiSelectChange(e, "curriculum")}
          >
            <option value="IB">IB</option>
            <option value="IGCSE">IGCSE</option>
            <option value="CBSE">CBSE</option>
            <option value="ICSE">ICSE</option>
            <option value="Nordic">Nordic</option>
          </select>
        </div>
      </div>

      {/* Grade */}
      <div className="each-acc-addpath-field">
        <div className="each-acc-addpath-field-name">Grade</div>
        <div className="each-acc-addpath-field-input">
          <select
            multiple
            value={formData.grade}
            onChange={(e) => handleMultiSelectChange(e, "grade")}
          >
            <option value="9">9</option>
            <option value="10">10</option>
            <option value="11">11</option>
            <option value="12">12</option>
          </select>
        </div>
      </div>

      {/* Buttons */}
      <div className="button-container">
        <button
          className="form-button cancel-button"
          onClick={handleCancelClick}
          disabled={loading}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="form-button save-button"
          disabled={loading}
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
};

export default EditPathForm;
