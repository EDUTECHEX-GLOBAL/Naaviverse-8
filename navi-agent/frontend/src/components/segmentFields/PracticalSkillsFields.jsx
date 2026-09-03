import React from "react";

const SKILL_LEVEL_OPTIONS = [
  "Complete Beginner",
  "Beginner (some exposure)",
  "Intermediate (can build basic projects)",
  "Advanced (professional-level)",
  "Expert / Teaching others",
];

const LEARNING_MODE_OPTIONS = [
  "Self-study (YouTube, Docs, Blogs)",
  "Online Courses (Coursera, Udemy, etc.)",
  "Bootcamp (structured, intensive)",
  "University / College Course",
  "Mentored / Apprenticeship",
  "On-the-job / Freelance",
];

const PROJECT_TYPE_OPTIONS = [
  "Personal Portfolio Projects",
  "Open-source Contributions",
  "Freelance / Client Work",
  "Hackathon Projects",
  "Research / Academic Projects",
  "Startup / Side Business",
];

const SKILL_CATEGORY_OPTIONS = [
  "Software Development",
  "Data Science & Analytics",
  "AI / Machine Learning",
  "Web Development",
  "Mobile Development",
  "UI/UX Design",
  "Cloud & DevOps",
  "Cybersecurity",
  "Digital Marketing",
  "Content Creation & Media",
  "CAD / 3D Modeling",
  "Other",
];

export default function PracticalSkillsFields({ data = {}, onChange, isEditing }) {
  const getDisplayValue = (val) => val?.trim() || val || "Not provided";

  return (
    <div className="profile-section-card">
      <h3 className="profile-section-title">Practical & Skills</h3>
      <p className="profile-section-sub">Skills learning, project portfolios, certifications, and hands-on experience</p>

      <div className="profile-fields-list">
        <div className="profile-field-row-2col">
          <div className="profile-field-group profile-field-group--highlight">
            <label>Target Skill / Domain</label>
            {isEditing ? (
              <select
                className="profile-select"
                value={data.skillCategory || ""}
                onChange={(e) => onChange("skillCategory", e.target.value)}
              >
                <option value="">Select Skill Category</option>
                {SKILL_CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : (
              <div className="profile-value-display">{getDisplayValue(data.skillCategory)}</div>
            )}
          </div>

          <div className="profile-field-group">
            <label>Current Skill Level</label>
            {isEditing ? (
              <select
                className="profile-select"
                value={data.skillLevel || ""}
                onChange={(e) => onChange("skillLevel", e.target.value)}
              >
                <option value="">Select Skill Level</option>
                {SKILL_LEVEL_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : (
              <div className="profile-value-display">{getDisplayValue(data.skillLevel)}</div>
            )}
          </div>
        </div>

        <div className="profile-field-row-2col">
          <div className="profile-field-group">
            <label>Preferred Learning Mode</label>
            {isEditing ? (
              <select
                className="profile-select"
                value={data.learningMode || ""}
                onChange={(e) => onChange("learningMode", e.target.value)}
              >
                <option value="">Select Learning Mode</option>
                {LEARNING_MODE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : (
              <div className="profile-value-display">{getDisplayValue(data.learningMode)}</div>
            )}
          </div>

          <div className="profile-field-group">
            <label>Project / Portfolio Type</label>
            {isEditing ? (
              <select
                className="profile-select"
                value={data.projectType || ""}
                onChange={(e) => onChange("projectType", e.target.value)}
              >
                <option value="">Select Project Type</option>
                {PROJECT_TYPE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : (
              <div className="profile-value-display">{getDisplayValue(data.projectType)}</div>
            )}
          </div>
        </div>

        <div className="profile-field-group">
          <label>Specific Skill / Technology</label>
          {isEditing ? (
            <input
              type="text"
              className="profile-input"
              value={data.targetSkill || ""}
              onChange={(e) => onChange("targetSkill", e.target.value)}
              placeholder="e.g. Python, React, Figma, AWS, TensorFlow"
            />
          ) : (
            <div className="profile-value-display-wide">{getDisplayValue(data.targetSkill)}</div>
          )}
        </div>
      </div>
    </div>
  );
}
