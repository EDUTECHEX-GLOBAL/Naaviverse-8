import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import "./InternalPartners.scss";
import { toast } from "react-toastify";

const BASE_URL = process.env.REACT_APP_API_BASE_URL || "";

const CATEGORIES = [
  "All Categories",
  "Education & Learning",
  "Career Guidance",
  "Tech & Software",
  "Mentorship & Coaching",
  "Financial Advisory",
  "Internal Core Team",
];

// 5 pastel avatar families defined in InternalPartners.scss (.fam-0 … .fam-4)
const FAMILY_COUNT = 5;

const InternalPartners = () => {
  // Main State
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [viewMode, setViewMode] = useState("table");

  // Drawer / Modal States
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [detailTab, setDetailTab] = useState("overview");

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    partnerName: "",
    organizationName: "",
    contactPerson: "",
    email: "",
    phone: "",
    category: "Career Guidance",
    description: "",
    tempPassword: "",
    mustChangePassword: true,
    accountStatus: "active",
  });

  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetTargetPartner, setResetTargetPartner] = useState(null);
  const [newTempPassword, setNewTempPassword] = useState("");
  const [showPasswordText, setShowPasswordText] = useState(false);

  // Fetch partners from real backend
  const fetchPartners = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/api/partner/internal/all`);
      if (res.data && res.data.success && Array.isArray(res.data.data)) {
        setPartners(res.data.data);
      } else {
        setPartners([]);
      }
    } catch (err) {
      console.warn("Failed to fetch internal partners from backend:", err.message);
      setPartners([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  /* ---------------- HELPERS ---------------- */
  const generateStrongPassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let pass = "";
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass;
  };

  // Stable pastel family per partner, based on position in the full list
  // (so a given partner keeps the same color across searches/filters/views).
  const getFamilyClass = (partnerId) => {
    const idx = partners.findIndex((x) => x.id === partnerId);
    const safeIdx = idx >= 0 ? idx : 0;
    return `fam-${safeIdx % FAMILY_COUNT}`;
  };

  // Phone numbers sometimes arrive under different keys depending on the
  // source (manual create vs imported record) — check the common variants
  // before falling back to an em dash.
  const getPhoneValue = (partner) =>
    partner?.phone || partner?.phoneNumber || partner?.mobile || partner?.contactNumber || "—";

  const handleOpenCreateModal = () => {
    setIsEditing(false);
    setFormData({
      id: "",
      partnerName: "",
      // organizationName: "Naaviverse Internal",
      contactPerson: "",
      lastName: "",
      email: "",
      phone: "",
      category: "Education & Learning",
      website: "",
      yourPosition: "Internal Partner Manager",
      street: "",
      city: "",
      state: "",
      pincode: "",
      country: "India",
      description: "",
      tempPassword: generateStrongPassword(),
      mustChangePassword: true,
      accountStatus: "active",
    });
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (partner, e) => {
    e?.stopPropagation();
    setIsEditing(true);
    setFormData({
      id: partner.id,
      partnerName: partner.partnerName,
      organizationName: partner.organizationName,
      contactPerson: partner.contactPerson || partner.firstName || "",
      lastName: partner.lastName || "",
      email: partner.email,
      phone: getPhoneValue(partner) === "—" ? "" : getPhoneValue(partner),
      category: partner.category,
      website: partner.website || "",
      yourPosition: partner.yourPosition || "",
      street: partner.street || "",
      city: partner.city || "",
      state: partner.state || "",
      pincode: partner.pincode || "",
      country: partner.country || "India",
      description: partner.description,
      tempPassword: "",
      mustChangePassword: partner.mustChangePassword,
      accountStatus: partner.accountStatus,
    });
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.partnerName || !formData.email || !formData.contactPerson) {
      toast.error("Please fill in all required fields (*)");
      return;
    }

    try {
      if (isEditing) {
        const res = await axios.put(`${BASE_URL}/api/partner/internal/update/${formData.id}`, formData);
        if (res.data && res.data.success) {
          toast.success(`Partner "${formData.partnerName}" updated!`);
          fetchPartners();
        } else {
          toast.error(res.data?.message || "Failed to update partner");
        }
      } else {
        const res = await axios.post(`${BASE_URL}/api/partner/internal/create`, formData);
        if (res.data && res.data.success) {
          toast.success(`Internal Partner "${formData.partnerName}" created successfully!`);
          fetchPartners();
        } else {
          toast.error(res.data?.message || "Failed to create partner");
        }
      }
    } catch (err) {
      console.error("API error submitting form:", err);
      toast.error(err.response?.data?.message || "Operation failed");
    }

    setIsFormModalOpen(false);
  };

  const handleToggleStatus = async (partner, e) => {
    e?.stopPropagation();
    try {
      const res = await axios.patch(`${BASE_URL}/api/partner/internal/status/${partner.id}`);
      if (res.data && res.data.success) {
        toast.info(`Partner "${partner.partnerName}" is now ${res.data.accountStatus}`);
        fetchPartners();
      }
    } catch (err) {
      console.error("Status toggle error:", err);
      toast.error("Failed to update partner status");
    }
  };

  const handleOpenResetModal = (partner, e) => {
    e?.stopPropagation();
    setResetTargetPartner(partner);
    setNewTempPassword(generateStrongPassword());
    setIsResetModalOpen(true);
  };

  const handleConfirmPasswordReset = async () => {
    if (!newTempPassword) {
      toast.error("Password cannot be blank.");
      return;
    }
    try {
      const res = await axios.post(`${BASE_URL}/api/partner/internal/reset-password`, {
        partnerId: resetTargetPartner.id || resetTargetPartner.email,
        newTempPassword,
      });
      if (res.data && res.data.success) {
        toast.success(`Password reset for ${resetTargetPartner.partnerName}`);
        fetchPartners();
      }
    } catch (err) {
      console.error("Reset password error:", err);
      toast.error(err.response?.data?.message || "Failed to reset password");
    }
    setIsResetModalOpen(false);
  };

  const handleCopyCredentials = () => {
    if (!resetTargetPartner) return;
    const textToCopy = `Email: ${resetTargetPartner.email}\nTemp Pass: ${newTempPassword}\nLogin: https://naaviverse.com/partner/login`;
    navigator.clipboard.writeText(textToCopy);
    toast.success("Credentials copied!");
  };

  const handleViewDetails = (partner) => {
    setSelectedPartner(partner);
    setDetailTab("overview");
    setIsDetailDrawerOpen(true);
  };

  /* ---------------- COMPUTED ---------------- */
  const filteredPartners = useMemo(() => {
    return partners.filter((p) => {
      const matchesSearch =
        p.partnerName.toLowerCase().includes(search.toLowerCase()) ||
        p.email.toLowerCase().includes(search.toLowerCase()) ||
        p.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
        p.organizationName.toLowerCase().includes(search.toLowerCase());

      let matchesStatus = true;
      if (statusFilter === "active") matchesStatus = p.accountStatus === "active";
      if (statusFilter === "inactive") matchesStatus = p.accountStatus === "inactive";
      if (statusFilter === "tempPass") matchesStatus = p.mustChangePassword === true;

      let matchesCategory = true;
      if (categoryFilter !== "All Categories") {
        matchesCategory = p.category === categoryFilter;
      }

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [partners, search, statusFilter, categoryFilter]);

  const stats = useMemo(() => {
    const total = partners.length;
    const active = partners.filter((p) => p.accountStatus === "active").length;
    const inactive = partners.filter((p) => p.accountStatus === "inactive").length;
    const tempPassCount = partners.filter((p) => p.mustChangePassword).length;
    return { total, active, inactive, tempPassCount };
  }, [partners]);

  const getInitials = (name) => {
    if (!name) return "IP";
    const words = name.trim().split(" ");
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
  };

  return (
    <div className="internal-partners-minimal">
      {/* ── COMPACT HEADER ── */}
      <div className="ip-top-bar">
        <div className="ip-header-info">
          <div className="title-row">
            <h2>Internal Partners</h2>
          </div>
          <p className="sub-title">Manage internal Naaviverse partners, accounts & direct revenue offerings.</p>
        </div>

        <button className="ip-btn-primary" onClick={handleOpenCreateModal}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>Create Partner</span>
        </button>
      </div>

      {/* ── TOOLBAR ── */}
      <div className="ip-compact-toolbar">
        <div className="ip-search-inline">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search partner, email or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && <button className="clear-btn" onClick={() => setSearch("")}>✕</button>}
        </div>

        <div className="ip-segment-pills">
          <button className={`seg-btn ${statusFilter === "all" ? "active" : ""}`} onClick={() => setStatusFilter("all")}>All</button>
          <button className={`seg-btn ${statusFilter === "active" ? "active" : ""}`} onClick={() => setStatusFilter("active")}>Active</button>
          <button className={`seg-btn ${statusFilter === "inactive" ? "active" : ""}`} onClick={() => setStatusFilter("inactive")}>Inactive</button>
          <button className={`seg-btn ${statusFilter === "tempPass" ? "active" : ""}`} onClick={() => setStatusFilter("tempPass")}>Temp</button>
        </div>

        <select
          className="ip-select-compact"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <div className="ip-view-switch">
          <button className={`v-btn ${viewMode === "table" ? "active" : ""}`} onClick={() => setViewMode("table")} title="List view">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <button className={`v-btn ${viewMode === "grid" ? "active" : ""}`} onClick={() => setViewMode("grid")} title="Grid view">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── TABLE / GRID ── */}
      {filteredPartners.length === 0 ? (
        <div className="ip-empty-compact">
          <p>No partners match the selected filter criteria.</p>
          <button className="ip-btn-text" onClick={() => { setSearch(""); setStatusFilter("all"); setCategoryFilter("All Categories"); }}>
            Clear filters
          </button>
        </div>
      ) : viewMode === "table" ? (
        <div className="ip-table-card">
          <table className="ip-slim-table">
            <thead>
              <tr>
                <th>Partner Account</th>
                <th>Category</th>
                <th>Contact</th>
                <th>Status</th>
                {/* <th>Security</th> */}
                <th>Offerings</th>
                <th className="th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPartners.map((p) => (
                <tr key={p.id} className={getFamilyClass(p.id)} onClick={() => handleViewDetails(p)}>
                  <td>
                    <div className="partner-compact-cell">
                      <div className="avatar-sm">{getInitials(p.partnerName)}</div>
                      <span className="p-title">{p.partnerName}</span>
                    </div>
                  </td>

                  <td>
                    <span className="chip-cat">{p.category}</span>
                  </td>

                  <td>
                    <div className="contact-compact">
                      <span className="c-person">{p.contactPerson}</span>
                      <span className="c-email">{p.email}</span>
                    </div>
                  </td>

                  <td>
                    <span className={`badge-status ${p.accountStatus}`}>
                      <span className="dot"></span>
                      {p.accountStatus === "active" ? "Active" : "Inactive"}
                    </span>
                  </td>

                  {/* <td>
                    {p.mustChangePassword ? (
                      <span className="chip-sec temp">Temp pass</span>
                    ) : (
                      <span className="chip-sec ok">Secured</span>
                    )}
                  </td> */}

                  <td>
                    <div className="offering-compact">
                      <span className="o-num">{p.totalOfferings} items</span>
                      <span className="o-rev">{p.totalRevenue}</span>
                    </div>
                  </td>

                  <td className="td-actions" onClick={(e) => e.stopPropagation()}>
                    <div className="actions-inline">
                      <button className="act-btn view-btn" title="View partner details" onClick={() => handleViewDetails(p)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </button>

                      <button className="act-btn edit-btn" title="Edit partner" onClick={(e) => handleOpenEditModal(p, e)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>

                      <button className="act-btn key-btn" title="Reset password" onClick={(e) => handleOpenResetModal(p, e)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.778-7.778zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                        </svg>
                      </button>

                      <button
                        className={`act-btn status-btn ${p.accountStatus}`}
                        title={p.accountStatus === "active" ? "Deactivate partner" : "Activate partner"}
                        onClick={(e) => handleToggleStatus(p, e)}
                      >
                        {p.accountStatus === "active" ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="6" y="4" width="4" height="16" />
                            <rect x="14" y="4" width="4" height="16" />
                          </svg>
                        ) : (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="5 3 19 12 5 21 5 3" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="ip-grid-compact">
          {filteredPartners.map((p) => (
            <div key={p.id} className={`grid-item-card ${getFamilyClass(p.id)}`} onClick={() => handleViewDetails(p)}>
              <div className="g-top">
                <div className="avatar-sm">{getInitials(p.partnerName)}</div>
                <span className={`badge-status ${p.accountStatus}`}>
                  <span className="dot"></span>
                  {p.accountStatus === "active" ? "Active" : "Inactive"}
                </span>
              </div>

              <h4 className="g-title">{p.partnerName}</h4>
              <p className="g-sub">{p.contactPerson}</p>

              <div className="g-mid">
                <span className="chip-cat">{p.category}</span>
                <span className="g-rev">{p.totalRevenue}</span>
              </div>

              <div className="g-footer" onClick={(e) => e.stopPropagation()}>
                <span className="g-email">{p.email}</span>
                <div className="g-actions">
                  <button className="icon-sm-btn" title="View" onClick={() => handleViewDetails(p)}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </button>
                  <button className="icon-sm-btn" title="Edit" onClick={(e) => handleOpenEditModal(p, e)}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                  <button className="icon-sm-btn amber-hover" title="Reset password" onClick={(e) => handleOpenResetModal(p, e)}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.778-7.778zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── CREATE / EDIT MODAL ── */}
      {isFormModalOpen && (
        <div className="ip-modal-backdrop" onClick={() => setIsFormModalOpen(false)}>
          <div className="ip-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="m-header">
              <div>
                <h3>{isEditing ? "Edit Internal Partner" : "Create Internal Partner"}</h3>
                <p className="m-sub">Directly provision internal partner credentials & assignment</p>
              </div>
              <button className="m-close" onClick={() => setIsFormModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleFormSubmit} className="m-form">
              <div className="m-form-scroll">
                <div className="m-row">
                  <div className="m-field">
                    <label>Business Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Naavi Career Pathways"
                      value={formData.partnerName}
                      onChange={(e) => setFormData({ ...formData, partnerName: e.target.value })}
                    />
                  </div>
                  <div className="m-field">
                    <label>Organization Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Naaviverse Education Pvt Ltd"
                      value={formData.organizationName}
                      onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="m-row">
                  <div className="m-field">
                    <label>First Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Aris"
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    />
                  </div>
                  <div className="m-field">
                    <label>Last Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Vance"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="m-row">
                  <div className="m-field">
                    <label>Category *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      {CATEGORIES.filter((c) => c !== "All Categories").map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="m-field">
                    <label>Position / Role</label>
                    <input
                      type="text"
                      placeholder="e.g. Lead Officer"
                      value={formData.yourPosition}
                      onChange={(e) => setFormData({ ...formData, yourPosition: e.target.value })}
                    />
                  </div>
                </div>

                <div className="m-row">
                  <div className="m-field">
                    <label>Login Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="career.internal@naaviverse.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="m-field">
                    <label>Phone Number</label>
                    <input
                      type="text"
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="m-row">
                  <div className="m-field">
                    <label>Website URL</label>
                    <input
                      type="url"
                      placeholder="https://naaviverse.com"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    />
                  </div>
                  <div className="m-field">
                    <label>Country</label>
                    <input
                      type="text"
                      placeholder="India"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    />
                  </div>
                </div>

                <div className="m-row">
                  <div className="m-field">
                    <label>Street Address</label>
                    <input
                      type="text"
                      placeholder="Street, Landmark..."
                      value={formData.street}
                      onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                    />
                  </div>
                  <div className="m-field">
                    <label>City / State / Pincode</label>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <input
                        type="text"
                        placeholder="City"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      />
                      <input
                        type="text"
                        placeholder="State"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      />
                      <input
                        type="text"
                        placeholder="Pincode"
                        value={formData.pincode}
                        onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {!isEditing && (
                  <div className="m-field">
                    <label>Temporary Password *</label>
                    <div className="pass-inline-group">
                      <input
                        type={showPasswordText ? "text" : "password"}
                        required
                        value={formData.tempPassword}
                        onChange={(e) => setFormData({ ...formData, tempPassword: e.target.value })}
                      />
                      <button type="button" className="btn-opt" onClick={() => setShowPasswordText(!showPasswordText)}>
                        {showPasswordText ? "Hide" : "Show"}
                      </button>
                      <button
                        type="button"
                        className="btn-opt highlight"
                        onClick={() => setFormData({ ...formData, tempPassword: generateStrongPassword() })}
                      >
                        Generate
                      </button>
                    </div>
                  </div>
                )}

                <div className="m-field">
                  <label>Description / Scope</label>
                  <textarea
                    rows="2"
                    placeholder="Responsibilities or offerings scope..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="m-check-row">
                  <label className="m-check">
                    <input
                      type="checkbox"
                      checked={formData.mustChangePassword}
                      onChange={(e) => setFormData({ ...formData, mustChangePassword: e.target.checked })}
                    />
                    <span>Require password change on first login</span>
                  </label>
                </div>
              </div>

              <div className="m-actions">
                <button type="button" className="ip-btn-secondary" onClick={() => setIsFormModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="ip-btn-primary">
                  {isEditing ? "Save Changes" : "Create Partner"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── RESET PASSWORD MODAL ── */}
      {isResetModalOpen && resetTargetPartner && (
        <div className="ip-modal-backdrop" onClick={() => setIsResetModalOpen(false)}>
          <div className="ip-modal-box reset" onClick={(e) => e.stopPropagation()}>
            <div className="m-header">
              <div>
                <h3>Reset Password</h3>
                <p className="m-sub">Issue new temporary access credentials</p>
              </div>
              <button className="m-close" onClick={() => setIsResetModalOpen(false)}>✕</button>
            </div>

            <div className="m-body">
              <p className="reset-desc">
                Target account: <strong>{resetTargetPartner.email}</strong>
              </p>

              <div className="m-field">
                <label>New Temporary Password</label>
                <div className="pass-inline-group">
                  <input
                    type={showPasswordText ? "text" : "password"}
                    value={newTempPassword}
                    onChange={(e) => setNewTempPassword(e.target.value)}
                  />
                  <button type="button" className="btn-opt highlight" onClick={() => setNewTempPassword(generateStrongPassword())}>
                    Generate
                  </button>
                </div>
              </div>

              <div className="copy-snippet-box">
                <div className="snippet-top">
                  <span>Credentials Snippet</span>
                  <button className="btn-copy" onClick={handleCopyCredentials}>Copy</button>
                </div>
                <code>{`Email: ${resetTargetPartner.email}\nPass: ${newTempPassword}`}</code>
              </div>
            </div>

            <div className="m-actions">
              <button className="ip-btn-secondary" onClick={() => setIsResetModalOpen(false)}>Cancel</button>
              <button className="ip-btn-primary" onClick={handleConfirmPasswordReset}>Confirm Reset</button>
            </div>
          </div>
        </div>
      )}

      {/* ── DETAIL DRAWER ── */}
      {isDetailDrawerOpen && selectedPartner && (
        <>
          <div className="ip-drawer-mask" onClick={() => setIsDetailDrawerOpen(false)} />
          <div className={`ip-drawer-clean ${getFamilyClass(selectedPartner.id)}`}>
            <div className="d-head">
              <div className="d-user">
                <div className="avatar-sm">{getInitials(selectedPartner.partnerName)}</div>
                <div>
                  <h3>{selectedPartner.partnerName}</h3>
                  <span className="d-sub">{selectedPartner.organizationName}</span>
                </div>
              </div>
              <button className="m-close" onClick={() => setIsDetailDrawerOpen(false)}>✕</button>
            </div>

            <div className="d-nav">
              <button className={`d-link ${detailTab === "overview" ? "active" : ""}`} onClick={() => setDetailTab("overview")}>Overview</button>
              <button className={`d-link ${detailTab === "security" ? "active" : ""}`} onClick={() => setDetailTab("security")}>Security</button>
              <button className={`d-link ${detailTab === "offerings" ? "active" : ""}`} onClick={() => setDetailTab("offerings")}>Offerings</button>
            </div>

            <div className="d-content">
              {detailTab === "overview" && (
                <div className="d-grid-info">
                  <div className="d-cell"><span className="lbl">Contact</span><span className="val">{selectedPartner.contactPerson}</span></div>
                  <div className="d-cell"><span className="lbl">Email</span><span className="val">{selectedPartner.email}</span></div>
                  <div className="d-cell"><span className="lbl">Phone</span><span className="val">{getPhoneValue(selectedPartner)}</span></div>
                  <div className="d-cell"><span className="lbl">Category</span><span className="val">{selectedPartner.category}</span></div>
                  <div className="d-cell"><span className="lbl">Created Date</span><span className="val">{selectedPartner.createdAt}</span></div>
                  <div className="d-cell"><span className="lbl">Created By</span><span className="val">{selectedPartner.createdBy}</span></div>
                </div>
              )}

              {detailTab === "security" && (
                <div className="d-security-box">
                  <div className="s-line"><span className="k">partner_type</span><span className="v">internal</span></div>
                  <div className="s-line"><span className="k">creation_source</span><span className="v">admin_created</span></div>
                  <div className="s-line"><span className="k">must_change_password</span><span className="v">{selectedPartner.mustChangePassword ? "true" : "false"}</span></div>
                  <button className="ip-btn-secondary full flex-btn" onClick={(e) => handleOpenResetModal(selectedPartner, e)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.778-7.778zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                    </svg>
                    <span>Reset Credentials</span>
                  </button>
                </div>
              )}

              {detailTab === "offerings" && (
                <div className="d-off-list">
                  <div className="d-off-item">
                    <span>Path Assessment Module</span>
                    <strong>₹4,999</strong>
                  </div>
                  <div className="d-off-item">
                    <span>Academic Guidance Session</span>
                    <strong>₹2,499</strong>
                  </div>
                </div>
              )}
            </div>

            <div className="d-foot">
              <button className="ip-btn-secondary" onClick={() => handleOpenEditModal(selectedPartner)}>Edit</button>
              <button className={`ip-btn-primary ${selectedPartner.accountStatus === "active" ? "danger" : ""}`} onClick={(e) => handleToggleStatus(selectedPartner, e)}>
                {selectedPartner.accountStatus === "active" ? "Deactivate" : "Activate"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default InternalPartners;