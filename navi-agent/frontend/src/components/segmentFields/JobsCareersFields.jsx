import React from "react";

const EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Contract / Freelance", "Internship", "Looking for Job / Fresher"];
const EXPERIENCE_OPTIONS = ["0-1 years (Entry level)", "1-3 years (Junior)", "3-5 years (Mid-level)", "5-8 years (Senior)", "8+ years (Lead / Manager)"];
const INDUSTRY_OPTIONS = [
  "Technology & Software",
  "Data Science & AI",
  "Financial Services & Fintech",
  "Healthcare & Biotech",
  "E-commerce & Retail",
  "Education & Edtech",
  "Consulting & Strategy",
  "Manufacturing & Hardware",
  "Media & Entertainment",
  "Government / Public Sector",
  "Other",
];

export default function JobsCareersFields({ data = {}, onChange, isEditing }) {
  const getDisplayValue = (val) => val?.trim() || val || "Not provided";

  return (
    <div className="profile-section-card">
      <h3 className="profile-section-title">Jobs & Careers</h3>
      <p className="profile-section-sub">Professional roles, experience level, and industry context</p>

      <div className="profile-fields-list">
        <div className="profile-field-row-2col">
          <div className="profile-field-group profile-field-group--highlight">
            <label>Current Role / Job Title</label>
            {isEditing ? (
              <input
                type="text"
                className="profile-input"
                value={data.currentRole || ""}
                onChange={(e) => onChange("currentRole", e.target.value)}
                placeholder="e.g. Frontend Developer"
              />
            ) : (
              <div className="profile-value-display">{getDisplayValue(data.currentRole)}</div>
            )}
          </div>

          <div className="profile-field-group">
            <label>Years of Experience</label>
            {isEditing ? (
              <select
                className="profile-select"
                value={data.yearsOfExperience || ""}
                onChange={(e) => onChange("yearsOfExperience", e.target.value)}
              >
                <option value="">Select Experience Level</option>
                {EXPERIENCE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : (
              <div className="profile-value-display">{getDisplayValue(data.yearsOfExperience)}</div>
            )}
          </div>
        </div>

        <div className="profile-field-row-2col">
          <div className="profile-field-group">
            <label>Industry</label>
            {isEditing ? (
              <select
                className="profile-select"
                value={data.industry || ""}
                onChange={(e) => onChange("industry", e.target.value)}
              >
                <option value="">Select Industry</option>
                {INDUSTRY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : (
              <div className="profile-value-display">{getDisplayValue(data.industry)}</div>
            )}
          </div>

          <div className="profile-field-group">
            <label>Employment Type</label>
            {isEditing ? (
              <select
                className="profile-select"
                value={data.employmentType || ""}
                onChange={(e) => onChange("employmentType", e.target.value)}
              >
                <option value="">Select Employment Type</option>
                {EMPLOYMENT_TYPES.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : (
              <div className="profile-value-display">{getDisplayValue(data.employmentType)}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
