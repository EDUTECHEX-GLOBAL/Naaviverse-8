import React, { useState, useEffect } from "react";
import axios from 'axios';
import './mypaths.scss'; // Import the CSS file

const EditPathForm = ({ selectedPath, onSave, onCancel }) => {
  console.log("EditPathForm is rendering...");
  console.log("Received selectedPath:", selectedPath);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(true);
  const [showMessagePage, setShowMessagePage] = useState(false); // New state

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
    length: selectedPath?.length || "", // New field
    destination_institution: selectedPath?.destination_institution || selectedPath?.university || "", // New field
    city: selectedPath?.city || "", // New field
    country: selectedPath?.country || "", // New field
    grade_avg: [], // New field
  });

  useEffect(() => {
    if (selectedPath) {
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
        length: selectedPath?.length || "", // New field
        destination_institution: selectedPath?.destination_institution || selectedPath?.university || "", // New field
        city: selectedPath?.city || "", // New field
        country: selectedPath?.country || "", // New field
        grade_avg:  selectedPath?.grade_avg || [],
      });
      setShowForm(true); // Ensure form is visible when a new path is selected
      setShowMessagePage(false); //reset to false when a new path selected
    }
  }, [selectedPath]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleMultiSelectChange = (e, fieldName) => {
    const selectedValues = Array.from(e.target.selectedOptions, (option) => option.value);
    setFormData({ ...formData, [fieldName]: selectedValues });
  };

  const handleSave = async () => {
    if (!selectedPath || !selectedPath._id) {
        setMessage('No path selected.');
        return;
    }

    setLoading(true);

    const updatedFields = {};
    Object.keys(formData).forEach((key) => {
        if (formData[key] !== selectedPath[key]) {
            // Check if the field is an array and convert it to a string
            if (Array.isArray(formData[key])) {
                updatedFields[key] = formData[key].join(','); // Convert array to string
            } else {
                updatedFields[key] = typeof formData[key] === 'string' ? formData[key].toLowerCase() : formData[key];
            }
        }
    });

    if (Object.keys(updatedFields).length === 0) {
        setMessage('No changes made.');
        setLoading(false);
        return;
    }

    try {
        const response = await axios.patch(`/api/paths/edit`, {
            pathId: selectedPath._id,
            ...updatedFields,
        });

        console.log(" Response:", response.data);
        setMessage('Path updated successfully!');
        setShowForm(false); // Hide the form
        setShowMessagePage(true); // Show the message page
    } catch (error) {
        console.error(" API call failed", error.response?.data || error.message);
        setMessage('Failed to update path.');
    } finally {
        setLoading(false);
    }
}


  //Modified the onCancel function
  const handleCancelClick = () => {
    setMessage(''); // Clear the message
    setShowMessagePage(false); // Hide the message page
    onCancel(); // Call the original onCancel to close the form
  };

  if (showMessagePage) {
    return (
      <div className="message-page">
        <p className="text-center text-sm text-green-600 p-2">{message}</p>
      </div>
    );
  }

  if (!showForm) return null; // Hide the form when showForm is false

  return (
    <div className="acc-addpath">
      {/* Display message */}
      {message && <p className="text-center text-sm text-green-600">{message}</p>}

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
      </div>{/* Path Type */}
      <div className="each-acc-addpath-field">
        <div className="each-acc-addpath-field-name">Path Type</div>
        <div className="each-acc-addpath-field-input">
          <select
            name="path_type"
            value={formData.path_type}
            onChange={handleChange}
          >
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
          
            <option value="Realistic">realistic</option>
            <option value="Investigative">investigative</option>
            <option value="Artistic">artistic</option>
            <option value="Social">social</option>
            <option value="Enterprising">enterprising</option>
            <option value="Conventional">conventional</option>
          </select>
        </div>
      </div>

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
      <div className="each-acc-addpath-field">
        <div className="each-acc-addpath-field-name">Destination</div>
        <div className="each-acc-addpath-field-input">
          <input
            type="text"
            name="destination"
            value={formData.destination_institution}
            onChange={handleChange}
            placeholder="Enter destination"
          />
        </div>
      </div>
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
      <div className="each-acc-addpath-field">
        <div className="each-acc-addpath-field-name">Grade Average</div>
        <div className="each-acc-addpath-field-input">
          <select name="grade_avg" value={formData.grade_avg} onChange={handleChange}>
            
            <option value="0%-35%">0%-35%</option>
            <option value="36%-60%">36%-60%</option>
            <option value="61%-75%">61%-75%</option>
            <option value="76%-85%">76%-85%</option>
            <option value="86%-95%">86%-95%</option>
            <option value="95%-100%">95%-100%</option>
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
      </div> {/* Grade */}
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
        <button className="form-button cancel-button" onClick={handleCancelClick} disabled={loading}>
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
