import React, { useState, useEffect } from "react";
import axios from "axios";
import close from "../../images/close.svg";
import { toast } from "react-toastify";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const LevelOneModal = ({ onClose, onComplete, userDetails, existingData }) => {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(existingData?.profilePicture || "");
  
  const [formData, setFormData] = useState({
    name: existingData?.name || "",
    username: existingData?.username || "",
    phoneNumber: existingData?.phoneNumber || "",
    country: existingData?.country || "",
    state: existingData?.state || "",
    city: existingData?.city || "",
    postalCode: existingData?.postalCode || "",
    profilePicture: existingData?.profilePicture || "",
    email: existingData?.email || userDetails?.email || "",
    userType: "student"
  });

  const [countryApiValue, setCountryApiValue] = useState([]);
  const [stateApiValue, setStateApiValue] = useState([]);
  const [cityApiValue, setCityApiValue] = useState([]);
  const [userNameAvailable, setUserNameAvailable] = useState(null);
  const [checkingUsername, setCheckingUsername] = useState(false);

  // Fetch countries
  useEffect(() => {
    axios.get(`${BASE_URL}/api/countries`)
      .then((response) => {
        if (Array.isArray(response.data)) {
          const sorted = response.data.sort((a, b) => 
            a.name.common.localeCompare(b.name.common)
          );
          setCountryApiValue(sorted);
        }
      })
      .catch(error => console.error("Error fetching countries:", error));
  }, []);

  // Fetch states
  useEffect(() => {
    axios.get(`${BASE_URL}/api/states`)
      .then((response) => {
        setStateApiValue(Array.isArray(response.data) ? response.data : []);
      })
      .catch(error => console.error("Error fetching states:", error));
  }, []);

  // Fetch cities
  useEffect(() => {
    axios.get(`${BASE_URL}/api/cities`)
      .then((response) => {
        setCityApiValue(Array.isArray(response.data) ? response.data : []);
      })
      .catch(error => console.error("Error fetching cities:", error));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Reset username availability when username changes
    if (name === "username") {
      setUserNameAvailable(null);
    }
  };

  const handleCheckUsername = async () => {
    if (!formData.username) return;
    
    setCheckingUsername(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/users/check-username?username=${formData.username}`);
      setUserNameAvailable(res.data.available);
    } catch (err) {
      setUserNameAvailable(false);
    } finally {
      setCheckingUsername(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result);
    reader.readAsDataURL(file);

    try {
      // Get presigned URL
      const response = await fetch(`${BASE_URL}/api/upload/get-presigned-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: file.name, fileType: file.type }),
      });

      if (!response.ok) throw new Error('Failed to get presigned URL');

      const data = await response.json();
      
      // Upload to S3
      await fetch(data.presignedUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      const fileUrl = `https://thenaaviversebucket.s3.amazonaws.com/${file.name}`;
      setFormData(prev => ({ ...prev, profilePicture: fileUrl }));
      
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    const required = ['name', 'username', 'phoneNumber', 'country', 'state', 'city', 'postalCode', 'profilePicture'];
    for (const field of required) {
      if (!formData[field]) {
        toast.error(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return;
      }
    }

    setLoading(true);
    
    try {
      const body = {
        ...formData,
        email: userDetails.email,
        phoneNumber: formData.phoneNumber.startsWith('+') ? formData.phoneNumber : `+${formData.phoneNumber}`
      };

      let response;
      if (existingData?._id) {
        // Update existing profile
        response = await axios.put(`${BASE_URL}/api/users/update/${existingData._id}`, body);
      } else {
        // Create new profile
        response = await axios.post(`${BASE_URL}/api/users/add`, body);
      }

      if (response.data?.status) {
        toast.success("Profile saved successfully!");
        onComplete();
      } else {
        toast.error("Failed to save profile");
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    return formData.name && 
           formData.username && 
           formData.phoneNumber && 
           formData.country && 
           formData.state && 
           formData.city && 
           formData.postalCode && 
           formData.profilePicture;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{existingData ? "Edit Level 1" : "Complete Level 1"} - Basic Information</h2>
          <div className="close-btn" onClick={onClose}>
            <img src={close} alt="close" />
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Profile Picture Upload */}
            <div className="form-group">
              <label>Profile Picture *</label>
              <div className="image-upload-container">
                <div className="image-preview" onClick={() => document.getElementById('profile-upload').click()}>
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" />
                  ) : (
                    <div style={{ background: '#f0f0f0', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      Upload
                    </div>
                  )}
                </div>
                <input
                  id="profile-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
                <button type="button" className="upload-btn" onClick={() => document.getElementById('profile-upload').click()}>
                  {uploading ? "Uploading..." : "Choose Image"}
                </button>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Username *</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Choose username"
                    required
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={handleCheckUsername}
                    disabled={!formData.username || checkingUsername}
                    className="btn btn-secondary"
                    style={{ padding: '12px 16px' }}
                  >
                    {checkingUsername ? "..." : "Check"}
                  </button>
                </div>
                {userNameAvailable === true && (
                  <small style={{ color: 'green' }}>✓ Username available</small>
                )}
                {userNameAvailable === false && (
                  <small style={{ color: 'red' }}>✗ Username taken</small>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>Phone Number *</label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="+1234567890"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Country *</label>
                <select name="country" value={formData.country} onChange={handleChange} required>
                  <option value="">Select Country</option>
                  {countryApiValue.map((item) => (
                    <option key={item.cca2} value={item.name.common}>
                      {item.name.common}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>State *</label>
                <select name="state" value={formData.state} onChange={handleChange} required>
                  <option value="">Select State</option>
                  {stateApiValue.map((item) => (
                    <option key={item._id || item.name} value={item.name}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>City *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Enter city"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Postal Code *</label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  placeholder="Enter postal code"
                  required
                />
              </div>
            </div>
          </div>
          
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={!isFormValid() || loading || (userNameAvailable === false)}
            >
              {loading ? "Saving..." : existingData ? "Update Level 1" : "Complete Level 1"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LevelOneModal;