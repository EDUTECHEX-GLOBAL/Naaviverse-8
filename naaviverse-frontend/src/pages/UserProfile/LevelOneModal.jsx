import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const LevelOneModal = ({
  inline = false,
  creation = false,
  userDetails,
  existingData,
  existingDocId,
  onClose,
  onComplete,
}) => {
  const [loading,          setLoading]          = useState(false);
  const [uploading,        setUploading]        = useState(false);
  const [previewUrl,       setPreviewUrl]       = useState(existingData?.profilePicture || "");

  const [formData, setFormData] = useState({
    name:           existingData?.name           || "",
    username:       existingData?.username       || "",
    phoneNumber:    existingData?.phoneNumber    || "",
    country:        existingData?.country        || "",
    state:          existingData?.state          || "",
    city:           existingData?.city           || "",
    postalCode:     existingData?.postalCode     || "",
    profilePicture: existingData?.profilePicture || "",
    email:          existingData?.email          || userDetails?.email || "",
    userType:       existingData?.userType       || "student",
  });

  const [countries,        setCountries]        = useState([]);
  const [states,           setStates]           = useState([]);
  const [userNameAvailable,setUserNameAvailable]= useState(null);
  const [checkingUsername, setCheckingUsername] = useState(false);

  useEffect(() => {
    axios.get(`${BASE_URL}/api/countries`)
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : [];
        setCountries(list.sort((a, b) => a.name.common.localeCompare(b.name.common)));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    axios.get(`${BASE_URL}/api/states`)
      .then((res) => setStates(Array.isArray(res.data) ? res.data : []))
      .catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (name === "username") setUserNameAvailable(null);
  };

  const handleCheckUsername = async () => {
    if (!formData.username) return;
    setCheckingUsername(true);
    try {
      const res = await axios.get(
        `${BASE_URL}/api/users/check-username?username=${formData.username}`
      );
      setUserNameAvailable(res.data.available);
    } catch {
      setUserNameAvailable(false);
    } finally {
      setCheckingUsername(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please select an image file"); return; }
    if (file.size > 5 * 1024 * 1024)    { toast.error("Max file size is 5MB");         return; }

    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result);
    reader.readAsDataURL(file);

    try {
      const res = await fetch(`${BASE_URL}/api/upload/get-presigned-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, fileType: file.type }),
      });
      if (!res.ok) throw new Error("Upload URL request failed");
      const data = await res.json();
      if (!data.presignedUrl) throw new Error("No presigned URL");

      await fetch(data.presignedUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      const fileUrl = data.fileUrl
        || `https://thenaaviversebucket.s3.amazonaws.com/${file.name}`;

      setFormData((p) => ({ ...p, profilePicture: fileUrl }));
      toast.success("Image uploaded");
    } catch (err) {
      console.warn("Image upload skipped (optional):", err.message);
      toast.warn("Image upload skipped — you can add a picture later");
      setFormData((p) => ({ ...p, profilePicture: "" }));
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePic = () => {
    setFormData((p) => ({ ...p, profilePicture: "" }));
    setPreviewUrl("");
  };

  const isFormValid = () =>
    formData.name &&
    formData.username &&
    formData.phoneNumber &&
    formData.country &&
    formData.state &&
    formData.city &&
    formData.postalCode &&
    userNameAvailable !== false;

  // ── Submit ─────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    const required = ["name", "username", "phoneNumber", "country", "state", "city", "postalCode"];
    for (const f of required) {
      if (!formData[f]) {
        toast.error(`Please fill in ${f.replace(/([A-Z])/g, " $1").toLowerCase()}`);
        return;
      }
    }
    if (userNameAvailable === false) {
      toast.error("That username is already taken — please choose another");
      return;
    }

    setLoading(true);
    try {
      const email = userDetails?.email || formData.email;
      const body  = {
        ...formData,
        email,
        phoneNumber: formData.phoneNumber.startsWith("+")
          ? formData.phoneNumber
          : `+${formData.phoneNumber}`,
      };

      let response;

      const editId = existingData?._id || existingDocId;
      if (editId && !creation) {
        // Edit mode
        response = await axios.put(`${BASE_URL}/api/users/update/${editId}`, body);
      } else {
        // Creation mode
        response = await axios.post(`${BASE_URL}/api/users/add`, body);
      }

      if (response.data?.status) {
        const savedId = response.data?.data?._id || editId;

        // ✅ Save profile pic + name to localStorage
        // so sidebar shows correct pic and name immediately
        if (formData.profilePicture) {
          localStorage.setItem("userProfilePic", formData.profilePicture);
        }

        // ✅ Also update the name in localStorage user object
        // so sidebar shows first name correctly without re-login
        try {
          const raw     = localStorage.getItem("user");
          const parsed  = raw ? JSON.parse(raw) : {};
          const updated = {
            ...(parsed?.user ? { ...parsed, user: { ...parsed.user, name: formData.name } } : { ...parsed, name: formData.name }),
          };
          localStorage.setItem("user", JSON.stringify(updated));
           localStorage.setItem("userName", formData.name); 
        } catch {}

        if (typeof onComplete === "function") onComplete(savedId);
      } else {
        toast.error(response.data?.message || "Failed to save profile");
      }
    } catch (err) {
      console.error("Submit error:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="up-form-wrap">
        <div className="up-form-title">
          {creation ? "Step 1 — Basic Information" : "Edit Basic Information"}
        </div>
        <div className="up-form-desc">
          {creation
            ? "Tell us about yourself to get started."
            : "Update your personal & contact details."}
        </div>

        {/* Profile Picture */}
        <div className="up-form-group">
          <label className="up-form-label">Profile Picture (optional)</label>
          <div className="up-pic-wrap">
            <div
              className="up-pic-circle"
              onClick={() => document.getElementById("up-pic-input").click()}
            >
              {previewUrl ? (
                <img src={previewUrl} alt="preview" />
              ) : (
                <span className="up-pic-placeholder">Click<br />to upload</span>
              )}
            </div>
            <input
              id="up-pic-input"
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleFileUpload}
            />
            <div className="up-pic-actions">
              <button
                type="button"
                className="up-upload-btn"
                disabled={uploading}
                onClick={() => document.getElementById("up-pic-input").click()}
              >
                {uploading ? "Uploading…" : "Choose Image"}
              </button>
              {previewUrl && (
                <button type="button" className="up-remove-btn" onClick={handleRemovePic}>
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Name + Username */}
        <div className="up-form-row">
          <div className="up-form-group">
            <label className="up-form-label">Full Name *</label>
            <input
              className="up-input"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter full name"
              required
            />
          </div>

          <div className="up-form-group">
            <label className="up-form-label">Username *</label>
            <div className="up-username-row">
              <input
                className="up-input"
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Choose a username"
                required
              />
              <button
                type="button"
                className="up-check-btn"
                onClick={handleCheckUsername}
                disabled={!formData.username || checkingUsername}
              >
                {checkingUsername ? "…" : "Check"}
              </button>
            </div>
            {userNameAvailable === true  && <div className="up-username-ok">✓ Username available</div>}
            {userNameAvailable === false && <div className="up-username-err">✗ Username already taken</div>}
          </div>
        </div>

        {/* Phone */}
        <div className="up-form-group">
          <label className="up-form-label">Phone Number *</label>
          <input
            className="up-input"
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="+91 9876543210"
            required
          />
        </div>

        {/* Country + State */}
        <div className="up-form-row">
          <div className="up-form-group">
            <label className="up-form-label">Country *</label>
            <select
              className="up-select"
              name="country"
              value={formData.country}
              onChange={handleChange}
              required
            >
              <option value="">Select Country</option>
              {countries.map((c) => (
                <option key={c.cca2} value={c.name.common}>
                  {c.name.common}
                </option>
              ))}
            </select>
          </div>

          <div className="up-form-group">
            <label className="up-form-label">State *</label>
            <select
              className="up-select"
              name="state"
              value={formData.state}
              onChange={handleChange}
              required
            >
              <option value="">Select State</option>
              {states.map((s) => (
                <option key={s._id || s.name} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* City + Postal */}
        <div className="up-form-row">
          <div className="up-form-group">
            <label className="up-form-label">City *</label>
            <input
              className="up-input"
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="Enter your city"
              required
            />
          </div>

          <div className="up-form-group">
            <label className="up-form-label">Postal Code *</label>
            <input
              className="up-input"
              type="text"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
              placeholder="Enter postal code"
              required
            />
          </div>
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
            disabled={!isFormValid() || loading || uploading}
          >
            {loading ? "Saving…" : creation ? "Continue →" : "Save Changes"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default LevelOneModal;