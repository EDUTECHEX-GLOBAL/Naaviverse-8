import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Country, State, City } from "country-state-city";

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
    country:        existingData?.country        || "India",
    state:          existingData?.state          || "",
    city:           existingData?.city           || "",
    postalCode:     existingData?.postalCode     || "",
    profilePicture: existingData?.profilePicture || "",
    email:          existingData?.email          || userDetails?.email || "",
    userType:       existingData?.userType       || "student",
  });

  // ── Country code + phone number split ─────────────────────────────────────
  const [countryCode, setCountryCode] = useState("+91");
  const [phoneDigits, setPhoneDigits] = useState("");

  // All countries from library
  const allCountries = useMemo(() => {
    return Country.getAllCountries().sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  // Dial code options
  const dialCodeOptions = useMemo(() => {
    const seen = new Set();
    const list = [];
    allCountries.forEach((c) => {
      if (c.phonecode) {
        const formattedCode = c.phonecode.startsWith("+") ? c.phonecode : `+${c.phonecode}`;
        const key = `${c.isoCode}-${formattedCode}`;
        if (!seen.has(key)) {
          seen.add(key);
          list.push({
            code: formattedCode,
            isoCode: c.isoCode,
            name: c.name,
            label: `${formattedCode} (${c.isoCode} - ${c.name})`,
          });
        }
      }
    });
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, [allCountries]);

  // Find selected country object
  const selectedCountryObj = useMemo(() => {
    if (!formData.country) return null;
    return allCountries.find(
      (c) => c.name.toLowerCase() === formData.country.toLowerCase() || c.isoCode.toLowerCase() === formData.country.toLowerCase()
    );
  }, [allCountries, formData.country]);

  // States for selected country
  const availableStates = useMemo(() => {
    if (!selectedCountryObj) return [];
    return State.getStatesOfCountry(selectedCountryObj.isoCode).sort((a, b) => a.name.localeCompare(b.name));
  }, [selectedCountryObj]);

  // Find selected state object
  const selectedStateObj = useMemo(() => {
    if (!formData.state || !availableStates.length) return null;
    return availableStates.find(
      (s) => s.name.toLowerCase() === formData.state.toLowerCase() || s.isoCode.toLowerCase() === formData.state.toLowerCase()
    );
  }, [availableStates, formData.state]);

  // Cities for selected state
  const availableCities = useMemo(() => {
    if (!selectedCountryObj || !selectedStateObj) return [];
    return City.getCitiesOfState(selectedCountryObj.isoCode, selectedStateObj.isoCode).sort((a, b) => a.name.localeCompare(b.name));
  }, [selectedCountryObj, selectedStateObj]);

  // Parse existing phoneNumber into code + digits on mount or when existingData arrives
  useEffect(() => {
    const ph = existingData?.phoneNumber || "";
    if (ph) {
      const match = ph.match(/^(\+\d{1,4})\s*(.*)$/);
      if (match) {
        setCountryCode(match[1]);
        setPhoneDigits(match[2].replace(/[^\d]/g, ""));
      } else {
        setPhoneDigits(ph.replace(/[^\d]/g, ""));
      }
    }
  }, [existingData?.phoneNumber]);

  const [userNameAvailable, setUserNameAvailable] = useState(null);
  const [checkingUsername,  setCheckingUsername]  = useState(false);

  // ── Track original username to skip re-check when unchanged ──────────────
  const originalUsername = existingData?.username || "";
  const isUsernameUnchanged = formData.username === originalUsername;

  // ── Sync formData when parent passes fresh existingData after save + re-fetch ──
  useEffect(() => {
    if (!existingData) return;
    setFormData({
      name:           existingData.name           || "",
      username:       existingData.username       || "",
      phoneNumber:    existingData.phoneNumber    || "",
      country:        existingData.country        || "India",
      state:          existingData.state          || "",
      city:           existingData.city           || "",
      postalCode:     existingData.postalCode     || "",
      profilePicture: existingData.profilePicture || "",
      email:          existingData.email          || userDetails?.email || "",
      userType:       existingData.userType       || "student",
    });
    setPreviewUrl(existingData.profilePicture || "");
    setUserNameAvailable(null);
  }, [existingData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (name === "username") setUserNameAvailable(null);
  };

  // ── Country selection handler ─────────────────────────────────────────────
  const handleCountryChange = (e) => {
    const countryName = e.target.value;
    setFormData((p) => ({ ...p, country: countryName, state: "", city: "" }));

    const match = allCountries.find((c) => c.name.toLowerCase() === countryName.toLowerCase());
    if (match && match.phonecode) {
      const code = match.phonecode.startsWith("+") ? match.phonecode : `+${match.phonecode}`;
      setCountryCode(code);
    }
  };

  // ── State selection handler ───────────────────────────────────────────────
  const handleStateChange = (e) => {
    const stateName = e.target.value;
    setFormData((p) => ({ ...p, state: stateName, city: "" }));
  };

  // ── City selection handler ────────────────────────────────────────────────
  const handleCityChange = (e) => {
    setFormData((p) => ({ ...p, city: e.target.value }));
  };

  // ── Username check — skip API call if username hasn't changed ─────────────
  const handleCheckUsername = async () => {
    if (!formData.username) return;

    if (isUsernameUnchanged) {
      setUserNameAvailable(true);
      return;
    }

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

  // ── Form validation — unchanged username is implicitly valid ──────────────
  const isFormValid = () =>
    formData.name &&
    formData.username &&
    phoneDigits &&
    formData.country &&
    formData.state &&
    formData.city &&
    formData.postalCode &&
    userNameAvailable !== false &&
    (isUsernameUnchanged || userNameAvailable === true);

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

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    const required = ["name", "username", "country", "state", "city", "postalCode"];
    for (const f of required) {
      if (!formData[f]) {
        toast.error(`Please fill in ${f.replace(/([A-Z])/g, " $1").toLowerCase()}`);
        return;
      }
    }
    if (!phoneDigits) {
      toast.error("Please fill in phone number");
      return;
    }

    if (userNameAvailable === false) {
      toast.error("That username is already taken — please choose another");
      return;
    }

    // If username was changed but availability wasn't checked yet, force a check
    if (!isUsernameUnchanged && userNameAvailable === null) {
      toast.error("Please check username availability before saving");
      return;
    }

    setLoading(true);
    try {
      const email = userDetails?.email || formData.email;
      const fullPhone = `${countryCode}${phoneDigits}`;
      const body  = {
        ...formData,
        email,
        phoneNumber: fullPhone,
      };

      let response;
      const editId = existingData?._id || existingDocId;

      if (editId && !creation) {
        // ── Edit mode: PUT /api/users/update/:id ────────────────────────────
        response = await axios.put(`${BASE_URL}/api/users/update/${editId}`, body);
      } else {
        // ── Creation mode: POST /api/users/add ─────────────────────────────
        response = await axios.post(`${BASE_URL}/api/users/add`, body);
      }

      if (response.data?.status) {
        const savedId = response.data?.data?._id || editId;

        // ── Persist pic + name to localStorage so sidebar updates instantly ─
        if (formData.profilePicture) {
          localStorage.setItem("userProfilePic", formData.profilePicture);
        }

        try {
          const raw    = localStorage.getItem("user");
          const parsed = raw ? JSON.parse(raw) : {};
          const updated = parsed?.user
            ? { ...parsed, user: { ...parsed.user, name: formData.name } }
            : { ...parsed, name: formData.name };
          localStorage.setItem("user", JSON.stringify(updated));
          localStorage.setItem("userName", formData.name);
        } catch {}

        if (typeof onComplete === "function") onComplete(savedId);
      } else {
        toast.error(response.data?.message || "Failed to save profile");
      }
    } catch (err) {
      console.error("Submit error:", err.response?.data || err.message);
      // Surface username-taken error from backend
      const msg = err.response?.data?.message || "";
      if (msg.toLowerCase().includes("username")) {
        toast.error("That username is already taken — please choose another");
        setUserNameAvailable(false);
      } else {
        toast.error(msg || "An error occurred. Please try again.");
      }
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

        {/* ── Profile Picture ─────────────────────────────────────────────── */}
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

        {/* ── Name + Username ─────────────────────────────────────────────── */}
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

            {/* ── Availability feedback ────────────────────────────────────── */}
            {userNameAvailable === true && (
              <div className="up-username-ok">✓ Username available</div>
            )}
            {userNameAvailable === false && (
              <div className="up-username-err">✗ Username already taken</div>
            )}
            {userNameAvailable === null && isUsernameUnchanged && formData.username && (
              <div className="up-username-ok" style={{ opacity: 0.6 }}>
                ✓ Current username
              </div>
            )}
            {userNameAvailable === null && !isUsernameUnchanged && formData.username && (
              <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: "4px" }}>
                Click "Check" to verify availability
              </div>
            )}
          </div>
        </div>

        {/* ── Phone Number with Country Code ──────────────────────────────── */}
        <div className="up-form-group">
          <label className="up-form-label">Phone Number *</label>
          <div className="up-phone-row">
            <select
              className="up-select up-phone-code"
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
            >
              {dialCodeOptions.map((opt) => (
                <option key={`${opt.isoCode}-${opt.code}`} value={opt.code}>
                  {opt.code} ({opt.isoCode})
                </option>
              ))}
            </select>
            <input
              className="up-input up-phone-input"
              type="tel"
              value={phoneDigits}
              onChange={(e) => {
                const val = e.target.value.replace(/[^\d]/g, "");
                setPhoneDigits(val);
              }}
              placeholder="9876543210"
              required
            />
          </div>
        </div>

        {/* ── Country + State ─────────────────────────────────────────────── */}
        <div className="up-form-row">
          <div className="up-form-group">
            <label className="up-form-label">Country *</label>
            <select
              className="up-select"
              name="country"
              value={formData.country}
              onChange={handleCountryChange}
              required
            >
              <option value="">Select Country</option>
              {allCountries.map((c) => (
                <option key={c.isoCode} value={c.name}>
                  {c.name}
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
              onChange={handleStateChange}
              required
              disabled={!availableStates.length}
            >
              <option value="">
                {!formData.country
                  ? "Select country first"
                  : availableStates.length
                  ? "Select State"
                  : "No states found"}
              </option>
              {availableStates.map((s) => (
                <option key={`${s.countryCode}-${s.isoCode}`} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ── City + Postal ────────────────────────────────────────────────── */}
        <div className="up-form-row">
          <div className="up-form-group">
            <label className="up-form-label">City *</label>
            {availableCities.length > 0 ? (
              <select
                className="up-select"
                name="city"
                value={formData.city}
                onChange={handleCityChange}
                required
              >
                <option value="">Select City</option>
                {availableCities.map((c, idx) => (
                  <option key={`${c.countryCode}-${c.stateCode}-${c.name}-${idx}`} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                className="up-input"
                type="text"
                name="city"
                value={formData.city}
                onChange={handleCityChange}
                placeholder={formData.state ? "Type your city" : "Select state first"}
                required
              />
            )}
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

        {/* ── Footer ──────────────────────────────────────────────────────── */}
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