import React from "react";

const K12_GRADES = [
  "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6",
  "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12",
];

const K12_CURRICULUM = ["CBSE", "ICSE", "State Board", "IB (PYP/MYP/DP)", "Cambridge / IGCSE", "Other"];
const K12_STREAMS = ["General (K-10)", "Science (PCM)", "Science (PCB)", "Commerce", "Arts / Humanities"];
const PERFORMANCE_OPTIONS = ["Below 60%", "60%–74%", "75%–89%", "90% and above"];

export default function SchoolK12Fields({ data = {}, onChange, isEditing }) {
  const getDisplayValue = (val) => val?.trim() || val || "Not provided";

  return (
    <div className="profile-section-card">
      <h3 className="profile-section-title">School: K-12</h3>
      <p className="profile-section-sub">Primary, middle, and high school academic signals</p>

      <div className="profile-fields-list">
        <div className="profile-field-row-2col">
          <div className="profile-field-group profile-field-group--highlight">
            <label>Grade Level</label>
            {isEditing ? (
              <select
                className="profile-select"
                value={data.gradeLevel || ""}
                onChange={(e) => onChange("gradeLevel", e.target.value)}
              >
                <option value="">Select Grade</option>
                {K12_GRADES.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : (
              <div className="profile-value-display">{getDisplayValue(data.gradeLevel)}</div>
            )}
          </div>

          <div className="profile-field-group">
            <label>School Board / Curriculum</label>
            {isEditing ? (
              <select
                className="profile-select"
                value={data.curriculum || ""}
                onChange={(e) => onChange("curriculum", e.target.value)}
              >
                <option value="">Select Curriculum</option>
                {K12_CURRICULUM.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : (
              <div className="profile-value-display">{getDisplayValue(data.curriculum)}</div>
            )}
          </div>
        </div>

        <div className="profile-field-row-2col">
          <div className="profile-field-group">
            <label>School Name</label>
            {isEditing ? (
              <input
                type="text"
                className="profile-input"
                value={data.school || ""}
                onChange={(e) => onChange("school", e.target.value)}
                placeholder="e.g. Delhi Public School, R.K. Puram"
              />
            ) : (
              <div className="profile-value-display">{getDisplayValue(data.school)}</div>
            )}
          </div>

          <div className="profile-field-group">
            <label>Academic Stream (Grades 11-12)</label>
            {isEditing ? (
              <select
                className="profile-select"
                value={data.academicStream || ""}
                onChange={(e) => onChange("academicStream", e.target.value)}
              >
                <option value="">Select Stream</option>
                {K12_STREAMS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : (
              <div className="profile-value-display">{getDisplayValue(data.academicStream)}</div>
            )}
          </div>
        </div>

        <div className="profile-field-group">
          <label>Current Performance</label>
          {isEditing ? (
            <select
              className="profile-select"
              value={data.currentPerformance || ""}
              onChange={(e) => onChange("currentPerformance", e.target.value)}
            >
              <option value="">Select Performance</option>
              {PERFORMANCE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          ) : (
            <div className="profile-value-display-wide">{getDisplayValue(data.currentPerformance)}</div>
          )}
        </div>
      </div>
    </div>
  );
}
