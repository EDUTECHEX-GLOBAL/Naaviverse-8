import React from "react";

const PERSONALITY_OPTIONS = [
  "Realistic: Engineer, Electrician, Mechanic",
  "Investigative: Scientist, Data Analyst, AI Researcher",
  "Artistic: Designer, Writer, Animator",
  "Social: Teacher, Counselor, Nurse",
  "Enterprising: Entrepreneur, Manager, Marketing Executive",
  "Conventional: Accountant, Banker, Administrator",
];

const BUDGET_TIERS = ["0-25%", "25-50%", "50-75%", "75-100%"];
const SCHOLARSHIP_OPTIONS = ["None", "Partial", "Full"];

export default function PersonalityGeography({
  data = {},
  onChange,
  isEditing,
  countriesList = [],
  statesList = [],
  citiesList = [],
  loadingCountries = false,
  loadingStates = false,
  loadingCities = false,
  onCountryChange,
  onStateChange,
  onCityChange,
}) {
  const getDisplayValue = (val) => val?.trim() || val || "Not provided";

  return (
    <>
      {/* ── Section 1: Basic Personal Information ── */}
      <div className="profile-section-card">
        <h3 className="profile-section-title">Basic Personal Information</h3>
        <p className="profile-section-sub">Core identifying information about the student</p>

        <div className="profile-fields-list">
          <div className="profile-field-row-2col">
            <div className="profile-field-group">
              <label>Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  className="profile-input"
                  value={data.name || ""}
                  onChange={(e) => onChange("name", e.target.value)}
                  placeholder="e.g. Aparna Ponnuru"
                />
              ) : (
                <div className="profile-value-display">{getDisplayValue(data.name)}</div>
              )}
            </div>

            <div className="profile-field-group">
              <label>Age / Date of Birth</label>
              {isEditing ? (
                <input
                  type="text"
                  className="profile-input"
                  value={data.age || ""}
                  onChange={(e) => onChange("age", e.target.value)}
                  placeholder="e.g. 17 or 2008-05-15"
                />
              ) : (
                <div className="profile-value-display">{getDisplayValue(data.age)}</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 2: Location Information ── */}
      <div className="profile-section-card">
        <h3 className="profile-section-title">Location Information</h3>
        <p className="profile-section-sub">Where the student is currently located</p>

        <div className="profile-fields-list">
          <div className="profile-field-row-3col">
            <div className="profile-field-group">
              <label>Country</label>
              {isEditing ? (
                <select
                  className="profile-select"
                  value={data.country || ""}
                  onChange={onCountryChange}
                  disabled={loadingCountries}
                >
                  <option value="">
                    {loadingCountries ? "Loading countries..." : "Select Country"}
                  </option>
                  {countriesList.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="profile-value-display">{getDisplayValue(data.country)}</div>
              )}
            </div>

            <div className="profile-field-group">
              <label>State</label>
              {isEditing ? (
                <select
                  className="profile-select"
                  value={data.state || ""}
                  onChange={onStateChange}
                  disabled={loadingStates || !data.country}
                >
                  <option value="">
                    {!data.country
                      ? "Select country first"
                      : loadingStates
                      ? "Loading states..."
                      : "Select State"}
                  </option>
                  {statesList.map((s) => (
                    <option key={s.name} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="profile-value-display">{getDisplayValue(data.state)}</div>
              )}
            </div>

            <div className="profile-field-group">
              <label>City</label>
              {isEditing ? (
                <select
                  className="profile-select"
                  value={data.city || ""}
                  onChange={onCityChange}
                  disabled={loadingCities || !data.state}
                >
                  <option value="">
                    {!data.state
                      ? "Select state first"
                      : loadingCities
                      ? "Loading cities..."
                      : "Select City"}
                  </option>
                  {citiesList.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="profile-value-display">{getDisplayValue(data.city)}</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 3: Financial Information ── */}
      <div className="profile-section-card">
        <h3 className="profile-section-title">Financial Information</h3>
        <p className="profile-section-sub">Budget and financial context for recommendations</p>

        <div className="profile-fields-list">
          <div className="profile-field-row-2col">
            <div className="profile-field-group">
              <label>Financial Situation</label>
              {isEditing ? (
                <select
                  className="profile-select"
                  value={data.financialSituation || ""}
                  onChange={(e) => onChange("financialSituation", e.target.value)}
                >
                  <option value="">Select Budget Tier</option>
                  {BUDGET_TIERS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="profile-value-display">{getDisplayValue(data.financialSituation)}</div>
              )}
            </div>

            <div className="profile-field-group">
              <label>Scholarship Requirement</label>
              {isEditing ? (
                <select
                  className="profile-select"
                  value={data.scholarshipRequirement || ""}
                  onChange={(e) => onChange("scholarshipRequirement", e.target.value)}
                >
                  <option value="">Select Scholarship Need</option>
                  {SCHOLARSHIP_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="profile-value-display">{getDisplayValue(data.scholarshipRequirement)}</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 4: Student Characteristics ── */}
      <div className="profile-section-card">
        <h3 className="profile-section-title">Student Characteristics</h3>
        <p className="profile-section-sub">Personality, interests, skills, and preferences</p>

        <div className="profile-fields-list">
          <div className="profile-field-group">
            <label>Personality Signal</label>
            {isEditing ? (
              <select
                className="profile-select"
                value={data.personalitySignal || ""}
                onChange={(e) => onChange("personalitySignal", e.target.value)}
              >
                <option value="">Select Personality</option>
                {PERSONALITY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : (
              <div className="profile-value-display-wide">
                {getDisplayValue(data.personalitySignal)}
              </div>
            )}
          </div>

          <div className="profile-field-row-2col">
            <div className="profile-field-group">
              <label>Interests</label>
              {isEditing ? (
                <input
                  type="text"
                  className="profile-input"
                  value={data.interests || ""}
                  onChange={(e) => onChange("interests", e.target.value)}
                  placeholder="e.g. Robotics, Music, Writing"
                />
              ) : (
                <div className="profile-value-display">{getDisplayValue(data.interests)}</div>
              )}
            </div>

            <div className="profile-field-group">
              <label>Skills</label>
              {isEditing ? (
                <input
                  type="text"
                  className="profile-input"
                  value={data.skills || ""}
                  onChange={(e) => onChange("skills", e.target.value)}
                  placeholder="e.g. Python, Public Speaking, Design"
                />
              ) : (
                <div className="profile-value-display">{getDisplayValue(data.skills)}</div>
              )}
            </div>
          </div>

          <div className="profile-field-group">
            <label>Learning Preferences</label>
            {isEditing ? (
              <input
                type="text"
                className="profile-input"
                value={data.preferences || ""}
                onChange={(e) => onChange("preferences", e.target.value)}
                placeholder="e.g. Visual learner, prefers hands-on projects"
              />
            ) : (
              <div className="profile-value-display-wide">{getDisplayValue(data.preferences)}</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
