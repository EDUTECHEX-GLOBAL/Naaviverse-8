import React from "react";

const CONCERN_AREAS = [
  "Mental Health & Stress Management",
  "Career Confusion / Decision Making",
  "Study-Life Balance & Time Management",
  "Confidence & Public Speaking",
  "Exam Anxiety & Burnout",
  "Relationship & Interpersonal Skills",
  "General Life Coaching",
];

const SUPPORT_TYPES = [
  "1-on-1 Certified Counselor",
  "Mentor / Peer Guidance",
  "Structured Weekly Habit Coaching",
  "Short-term / Immediate Crisis Advice",
  "Self-paced Meditation / Mindfulness Modules",
];

export default function NonAcademicCounsellingFields({ data = {}, onChange, isEditing }) {
  const getDisplayValue = (val) => val?.trim() || val || "Not provided";

  return (
    <div className="profile-section-card">
      <h3 className="profile-section-title">Non-Academic Counselling</h3>
      <p className="profile-section-sub">Mental wellness, life coaching, stress management, and guidance signals</p>

      <div className="profile-fields-list">
        <div className="profile-field-group profile-field-group--highlight">
          <label>Primary Concern Area</label>
          {isEditing ? (
            <select
              className="profile-select"
              value={data.concernArea || ""}
              onChange={(e) => onChange("concernArea", e.target.value)}
            >
              <option value="">Select Concern Area</option>
              {CONCERN_AREAS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          ) : (
            <div className="profile-value-display-wide">{getDisplayValue(data.concernArea)}</div>
          )}
        </div>

        <div className="profile-field-group">
          <label>Current Challenge Description</label>
          {isEditing ? (
            <textarea
              className="profile-input"
              style={{ minHeight: "80px", resize: "vertical" }}
              value={data.currentChallenge || ""}
              onChange={(e) => onChange("currentChallenge", e.target.value)}
              placeholder="Describe what specific challenge or blocker you are currently facing..."
            />
          ) : (
            <div className="profile-value-display-wide">{getDisplayValue(data.currentChallenge)}</div>
          )}
        </div>

        <div className="profile-field-group">
          <label>Support Type Needed</label>
          {isEditing ? (
            <select
              className="profile-select"
              value={data.supportTypeNeeded || ""}
              onChange={(e) => onChange("supportTypeNeeded", e.target.value)}
            >
              <option value="">Select Support Type</option>
              {SUPPORT_TYPES.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          ) : (
            <div className="profile-value-display-wide">{getDisplayValue(data.supportTypeNeeded)}</div>
          )}
        </div>
      </div>
    </div>
  );
}
