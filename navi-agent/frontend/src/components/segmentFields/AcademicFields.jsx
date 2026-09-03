import React from "react";

const EDUCATION_STAGES = [
  { key: "school", label: "School Student (Grades 1–12)" },
  { key: "undergraduate", label: "Undergraduate Student" },
  { key: "postgraduate", label: "Postgraduate Student" },
];

// School Student options
const K12_GRADES = [
  "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6",
  "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12",
];
const K12_CURRICULUM = ["CBSE", "ICSE", "State Board", "IB (PYP/MYP/DP)", "Cambridge / IGCSE", "Other"];
const K12_STREAMS = ["General (K-10)", "Science (PCM)", "Science (PCB)", "Commerce", "Arts / Humanities"];

// Undergraduate options
const UG_DEGREES = ["B.Tech/B.E.", "B.Sc", "BBA", "B.Com", "MBBS", "BA", "BCA", "B.Des", "B.Arch", "Diploma", "Other"];
const UG_CURRICULUM = ["University", "Autonomous College", "Affiliated College", "Online / Distance", "Other"];

// Postgraduate options
const PG_DEGREES = ["Master's", "MBA", "M.Tech", "M.Sc", "M.Com", "MA", "MCA", "PhD", "Other"];

// Common
const STREAM_OPTIONS = ["Engineering / Tech", "Computer Science", "Business / Management", "Commerce", "Science", "Arts / Humanities", "Medicine / Healthcare", "Law", "Design", "Other"];
const PERFORMANCE_OPTIONS = ["Below 60%", "60%–74%", "75%–89%", "90% and above"];

export default function AcademicFields({ data = {}, onChange, isEditing }) {
  const getDisplayValue = (val) => val?.trim() || val || "Not provided";
  const stage = data.educationStage || "undergraduate";

  return (
    <div className="profile-section-card">
      <h3 className="profile-section-title">Academic Information</h3>
      <p className="profile-section-sub">Current academic stage, institution, and performance</p>

      <div className="profile-fields-list">
        {/* Education Stage Selector */}
        <div className="profile-field-group profile-field-group--highlight">
          <label>Education Stage</label>
          {isEditing ? (
            <select
              className="profile-select"
              value={stage}
              onChange={(e) => onChange("educationStage", e.target.value)}
            >
              {EDUCATION_STAGES.map((opt) => (
                <option key={opt.key} value={opt.key}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : (
            <div className="profile-value-display-wide">
              {EDUCATION_STAGES.find((s) => s.key === stage)?.label || stage}
            </div>
          )}
        </div>

        {/* ── SCHOOL STUDENT FIELDS ── */}
        {stage === "school" && (
          <>
            <div className="profile-field-row-2col">
              <div className="profile-field-group">
                <label>Grade Level</label>
                {isEditing ? (
                  <select
                    className="profile-select"
                    value={data.gradeLevel || ""}
                    onChange={(e) => onChange("gradeLevel", e.target.value)}
                  >
                    <option value="">Select Grade</option>
                    {K12_GRADES.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <div className="profile-value-display">{getDisplayValue(data.gradeLevel)}</div>
                )}
              </div>

              <div className="profile-field-group">
                <label>School Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    className="profile-input"
                    value={data.schoolName || data.schoolOrCollege || ""}
                    onChange={(e) => onChange("schoolName", e.target.value)}
                    placeholder="e.g. Delhi Public School, R.K. Puram"
                  />
                ) : (
                  <div className="profile-value-display">{getDisplayValue(data.schoolName || data.schoolOrCollege)}</div>
                )}
              </div>
            </div>

            <div className="profile-field-row-2col">
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
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <div className="profile-value-display">{getDisplayValue(data.curriculum)}</div>
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
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <div className="profile-value-display">{getDisplayValue(data.academicStream)}</div>
                )}
              </div>
            </div>
          </>
        )}

        {/* ── UNDERGRADUATE STUDENT FIELDS ── */}
        {stage === "undergraduate" && (
          <>
            <div className="profile-field-row-2col">
              <div className="profile-field-group">
                <label>Degree</label>
                {isEditing ? (
                  <select
                    className="profile-select"
                    value={data.degreeType || data.undergraduateDegree || ""}
                    onChange={(e) => onChange("degreeType", e.target.value)}
                  >
                    <option value="">Select Degree</option>
                    {UG_DEGREES.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <div className="profile-value-display">{getDisplayValue(data.degreeType || data.undergraduateDegree)}</div>
                )}
              </div>

              <div className="profile-field-group">
                <label>Specialization / Major</label>
                {isEditing ? (
                  <select
                    className="profile-select"
                    value={data.academicStream || ""}
                    onChange={(e) => onChange("academicStream", e.target.value)}
                  >
                    <option value="">Select Stream / Major</option>
                    {STREAM_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <div className="profile-value-display">{getDisplayValue(data.academicStream)}</div>
                )}
              </div>
            </div>

            <div className="profile-field-row-2col">
              <div className="profile-field-group">
                <label>College / University</label>
                {isEditing ? (
                  <input
                    type="text"
                    className="profile-input"
                    value={data.schoolOrCollege || data.collegeOrUniversity || ""}
                    onChange={(e) => onChange("schoolOrCollege", e.target.value)}
                    placeholder="e.g. IIT Delhi, BITS Pilani"
                  />
                ) : (
                  <div className="profile-value-display">{getDisplayValue(data.schoolOrCollege || data.collegeOrUniversity)}</div>
                )}
              </div>

              <div className="profile-field-group">
                <label>Current Year / Semester</label>
                {isEditing ? (
                  <input
                    type="text"
                    className="profile-input"
                    value={data.gradeLevel || ""}
                    onChange={(e) => onChange("gradeLevel", e.target.value)}
                    placeholder="e.g. 3rd Year / 6th Semester"
                  />
                ) : (
                  <div className="profile-value-display">{getDisplayValue(data.gradeLevel)}</div>
                )}
              </div>
            </div>

            <div className="profile-field-group">
              <label>Curriculum / System</label>
              {isEditing ? (
                <select
                  className="profile-select"
                  value={data.curriculum || ""}
                  onChange={(e) => onChange("curriculum", e.target.value)}
                >
                  <option value="">Select Curriculum</option>
                  {UG_CURRICULUM.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : (
                <div className="profile-value-display-wide">{getDisplayValue(data.curriculum)}</div>
              )}
            </div>
          </>
        )}

        {/* ── POSTGRADUATE STUDENT FIELDS ── */}
        {stage === "postgraduate" && (
          <>
            <div className="profile-field-row-2col">
              <div className="profile-field-group">
                <label>Degree</label>
                {isEditing ? (
                  <select
                    className="profile-select"
                    value={data.degreeType || data.postgraduateDegree || ""}
                    onChange={(e) => onChange("degreeType", e.target.value)}
                  >
                    <option value="">Select Degree</option>
                    {PG_DEGREES.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <div className="profile-value-display">{getDisplayValue(data.degreeType || data.postgraduateDegree)}</div>
                )}
              </div>

              <div className="profile-field-group">
                <label>Specialization</label>
                {isEditing ? (
                  <select
                    className="profile-select"
                    value={data.academicStream || ""}
                    onChange={(e) => onChange("academicStream", e.target.value)}
                  >
                    <option value="">Select Specialization</option>
                    {STREAM_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <div className="profile-value-display">{getDisplayValue(data.academicStream)}</div>
                )}
              </div>
            </div>

            <div className="profile-field-row-2col">
              <div className="profile-field-group">
                <label>University</label>
                {isEditing ? (
                  <input
                    type="text"
                    className="profile-input"
                    value={data.schoolOrCollege || data.postgraduateUniversity || ""}
                    onChange={(e) => onChange("schoolOrCollege", e.target.value)}
                    placeholder="e.g. Stanford University"
                  />
                ) : (
                  <div className="profile-value-display">{getDisplayValue(data.schoolOrCollege || data.postgraduateUniversity)}</div>
                )}
              </div>

              <div className="profile-field-group">
                <label>Current Year</label>
                {isEditing ? (
                  <input
                    type="text"
                    className="profile-input"
                    value={data.gradeLevel || ""}
                    onChange={(e) => onChange("gradeLevel", e.target.value)}
                    placeholder="e.g. 1st Year / 2nd Year"
                  />
                ) : (
                  <div className="profile-value-display">{getDisplayValue(data.gradeLevel)}</div>
                )}
              </div>
            </div>
          </>
        )}

        {/* ── Common: Academic Performance ── */}
        <div className="profile-field-group">
          <label>Academic Performance</label>
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
