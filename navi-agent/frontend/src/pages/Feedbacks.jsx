import { useEffect, useState } from "react";
import {
  IconMessageSquare,
  IconUser,
  IconCheck,
  IconNavigation,
  IconAlert,
  IconSearch,
} from "./Icons";
import "./Feedbacks.scss";

const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://127.0.0.1:8001" : "");

function TrashIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

function PlusIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

export default function Feedbacks() {
  const [activeTab, setActiveTab] = useState("student"); // "student" | "admin"
  const [studentFeedbacks, setStudentFeedbacks] = useState([]);
  const [adminFeedbacks, setAdminFeedbacks] = useState([]);

  // Search and filters
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Admin Curation Directive Form State
  const [directiveText, setDirectiveText] = useState("");
  const [targetGoal, setTargetGoal] = useState("");
  const [category, setCategory] = useState("resources");
  const [grade, setGrade] = useState("");
  const [curriculum, setCurriculum] = useState("");
  const [stream, setStream] = useState("");

  const flash = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      // 1. Fetch Student Marketplace Feedback
      const resStudent = await fetch(`${API}/api/marketplace-feedback`);
      if (!resStudent.ok) throw new Error("Failed to load student feedbacks");
      const dataStudent = await resStudent.json();
      setStudentFeedbacks(dataStudent);

      // 2. Fetch Admin Curation Learnings
      const resAdmin = await fetch(`${API}/api/feedbacks`);
      if (!resAdmin.ok) throw new Error("Failed to load admin feedbacks");
      const dataAdmin = await resAdmin.json();
      setAdminFeedbacks(dataAdmin);
    } catch (err) {
      console.error("[Curation Feedbacks] Error loading feedbacks:", err);
      setError(err.message || "Failed to load database records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteStudentFeedback = async (id) => {
    if (!window.confirm("Are you sure you want to delete this interaction log?")) return;
    try {
      const res = await fetch(`${API}/api/marketplace-feedback/${id}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Failed to delete log");
      flash("Student interaction log deleted.");
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteAdminFeedback = async (id) => {
    if (!window.confirm("Are you sure you want to delete this AI Curation Learning? It will be removed from the AI memory model.")) return;
    try {
      const res = await fetch(`${API}/api/feedbacks/${id}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Failed to delete directive");
      flash("Learning feedback deleted from AI memory.");
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmitDirective = async (e) => {
    e.preventDefault();
    if (!directiveText.trim()) {
      alert("Curation instructions cannot be blank.");
      return;
    }
    if (!targetGoal.trim()) {
      alert("Target goal/focus area is required.");
      return;
    }

    try {
      const adminEmail = sessionStorage.getItem("nv_session") || "Admin Curation";
      const payload = {
        admin_email: adminEmail,
        target_goal: targetGoal.trim(),
        student_profile: {
          grade: grade ? parseInt(grade, 10) : undefined,
          curriculum: curriculum.trim() || undefined,
          stream: stream.trim() || undefined
        },
        feedback_text: directiveText.trim(),
        category: category
      };

      const res = await fetch(`${API}/api/feedbacks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Failed to submit directive");

      flash("Curation directive saved to AI memory successfully!");
      // Reset form
      setDirectiveText("");
      setTargetGoal("");
      setGrade("");
      setCurriculum("");
      setStream("");
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredStudentFeedbacks = studentFeedbacks.filter(f => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      f.student_email?.toLowerCase().includes(query) ||
      f.path_name?.toLowerCase().includes(query) ||
      f.step_title?.toLowerCase().includes(query) ||
      f.provider_name?.toLowerCase().includes(query) ||
      f.action?.toLowerCase().includes(query)
    );
  });

  const filteredAdminFeedbacks = adminFeedbacks.filter(f => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      f.feedback_text?.toLowerCase().includes(query) ||
      f.target_goal?.toLowerCase().includes(query) ||
      f.category?.toLowerCase().includes(query) ||
      f.admin_email?.toLowerCase().includes(query)
    );
  });

  // ── Maps stored action values → human-readable labels + badge CSS slugs ──────
  const ACTION_MAP = {
    // Step feedback actions (sent from Naaviverse platform)
    "Helpful":      { label: "Helpful",      slug: "helpful" },
    "helpful":      { label: "Helpful",      slug: "helpful" },
    "Not relevant": { label: "Not relevant", slug: "not-relevant" },
    "notRelevant":  { label: "Not relevant", slug: "not-relevant" },
    "not relevant": { label: "Not relevant", slug: "not-relevant" },
    "Skip":         { label: "Skip",         slug: "skip" },
    "skip":         { label: "Skip",         slug: "skip" },
    "Comment":      { label: "Comment",      slug: "comment" },
    "comment":      { label: "Comment",      slug: "comment" },
    // Marketplace actions
    "save":         { label: "Save",         slug: "save" },
    "Save":         { label: "Save",         slug: "save" },
    "enroll":       { label: "Enroll",       slug: "enroll" },
    "Enroll":       { label: "Enroll",       slug: "enroll" },
  };

  const getActionMeta = (action) => {
    if (!action) return { label: "Unknown", slug: "unknown", customComment: null };
    
    // Check if it's a dynamic comment like "comment: text..."
    if (action.startsWith("comment:") || action.startsWith("Comment:")) {
      const commentText = action.replace(/^(comment:|Comment:)\s*/i, "");
      return { label: "Comment", slug: "comment", customComment: commentText };
    }
    
    // Exact mapping check
    const matched = ACTION_MAP[action] || ACTION_MAP[action?.toLowerCase()];
    if (matched) {
      return { ...matched, customComment: null };
    }
    
    // Fallback
    return { label: action, slug: "not-relevant", customComment: null };
  };

  // ── Format timestamp in IST (UTC+5:30) ───────────────────────────────────
  const formatTimestamp = (ts) => {
    if (!ts) return "Just now";
    return new Date(ts).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      year: "numeric", month: "numeric", day: "numeric",
      hour: "2-digit", minute: "2-digit", hour12: true,
    });
  };

  return (
    <div className="feedbacks-page-root">
      <div className="fb-header">
        <div>
          <span className="pill pill-teal">Feedback & AI Memory</span>
          <h1 className="display-title">Curation & Interactions</h1>
          <p className="fb-header-sub">
            Monitor student marketplace clicks and capture curation feedback to improve AI generation quality.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="fb-alert card fb-alert--success">
          <span className="alert-dot" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="fb-alert card fb-alert--error">
          <IconAlert size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="fb-layout">

        {/* Main Content Pane */}
        <div className="fb-main-pane">

          <div className="fb-controls-bar card">
            <div className="fb-search-wrap">
              <IconSearch size={15} />
              <input
                type="text"
                placeholder="Search feedback or paths..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="fb-tabs">
              <button
                type="button"
                className={`fb-tab-btn ${activeTab === "student" ? "active" : ""}`}
                onClick={() => setActiveTab("student")}
              >
                Student Clicks <span className="fb-tab-count">{filteredStudentFeedbacks.length}</span>
              </button>
              <button
                type="button"
                className={`fb-tab-btn ${activeTab === "admin" ? "active" : ""}`}
                onClick={() => setActiveTab("admin")}
              >
                AI Curation Memory <span className="fb-tab-count">{filteredAdminFeedbacks.length}</span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="fb-loading card">
              <div className="pulse-dots"><span></span><span></span><span></span></div>
              <p>Fetching logs...</p>
            </div>
          ) : activeTab === "student" ? (
            // Tab 1: Student Marketplace clicks
            filteredStudentFeedbacks.length === 0 ? (
              <div className="fb-empty card">
                <IconNavigation size={32} />
                <h3>No student interactions recorded</h3>
                <p>When students click Enroll, Save, or Not Relevant in the Marketplace, the logs will show up here.</p>
              </div>
            ) : (
              <div className="fb-table-card card">
                <div className="fb-table-container">
                  <table className="fb-table">
                    <colgroup>
                      <col className="col-student" />
                      <col className="col-path" />
                      <col className="col-milestone" />
                      <col className="col-provider" />
                      <col className="col-action" />
                      <col className="col-time" />
                      <col className="col-del" />
                    </colgroup>
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Pathway</th>
                        <th>Milestone Step</th>
                        <th>Provider</th>
                        <th>Action</th>
                        <th>Timestamp</th>
                        <th aria-hidden="true"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudentFeedbacks.map((f) => (
                        <tr key={f.id || f._id}>
                          <td className="font-small font-semibold truncate-cell" title={f.student_email}>
                            {f.student_email}
                          </td>
                          <td className="truncate-cell" title={f.path_name}>{f.path_name}</td>
                          <td className="font-small truncate-cell" title={`${f.step_title} (ID: ${f.step_id})`}>
                            {f.step_title} <span className="text-muted">(ID: {f.step_id})</span>
                          </td>
                          <td>
                            <div className="provider-cell">
                              <span className="prov-name truncate-cell" title={f.provider_name}>{f.provider_name}</span>
                              <span className="prov-type">{f.provider_type}</span>
                            </div>
                          </td>
                          <td>
                            {(() => {
                              const meta = getActionMeta(f.action);
                              return (
                                <div style={{ display: "flex", flexDirection: "column", gap: "4px", alignItems: "flex-start" }}>
                                  <span className={`pill-badge badge-${meta.slug}`}>
                                    {meta.label}
                                  </span>
                                  {meta.customComment && (
                                    <span style={{ fontSize: "11px", color: "#64748b", fontStyle: "italic", whiteSpace: "normal", wordBreak: "break-word", maxWidth: "200px" }}>
                                      {meta.customComment}
                                    </span>
                                  )}
                                </div>
                              );
                            })()}
                          </td>
                          <td className="font-small text-muted">
                            {formatTimestamp(f.timestamp)}
                          </td>
                          <td>
                            <button
                              className="btn-trash"
                              onClick={() => handleDeleteStudentFeedback(f.id || f._id)}
                              title="Delete log"
                            >
                              <TrashIcon size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          ) : (
            // Tab 2: Admin AI Learnings Curation Memory
            filteredAdminFeedbacks.length === 0 ? (
              <div className="fb-empty card">
                <IconMessageSquare size={32} />
                <h3>No curation learnings registered</h3>
                <p>Use the form on the right to directly register feedback, or curate paths to build AI memory.</p>
              </div>
            ) : (
              <div className="fb-admin-grid">
                {filteredAdminFeedbacks.map((feedback) => (
                  <div key={feedback.id || feedback._id} className="fb-admin-card card">
                    <div className="fb-admin-card-head">
                      <span className={`pill-badge badge-cat-${feedback.category || "general"}`}>
                        {(feedback.category || "general").toUpperCase()}
                      </span>
                      <button
                        className="btn-trash"
                        onClick={() => handleDeleteAdminFeedback(feedback.id || feedback._id)}
                        title="Delete learning card"
                      >
                        <TrashIcon size={13} />
                      </button>
                    </div>
                    <div className="fb-admin-card-body">
                      <p className="fb-text" title={feedback.feedback_text}>“{feedback.feedback_text}”</p>

                      <div className="fb-meta">
                        <div className="meta-item">
                          <strong>Target Goal:</strong>
                          <span className="truncate-cell" title={feedback.target_goal}>{feedback.target_goal}</span>
                        </div>
                        {feedback.student_profile && (Object.keys(feedback.student_profile).length > 0) && (
                          <div className="meta-item">
                            <strong>Profile:</strong>
                            <span>
                              {feedback.student_profile.grade ? `${feedback.student_profile.grade}th Grade` : ""}
                              {feedback.student_profile.curriculum ? ` • ${feedback.student_profile.curriculum}` : ""}
                              {feedback.student_profile.stream ? ` • ${feedback.student_profile.stream}` : ""}
                            </span>
                          </div>
                        )}
                        <div className="meta-footer font-small">
                          <span className="truncate-cell" title={feedback.admin_email}>By {feedback.admin_email}</span>
                          <span>{feedback.timestamp ? new Date(feedback.timestamp).toLocaleDateString() : "Just now"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>

        {/* Curation Form Side Pane */}
        <div className="fb-side-pane">
          <div className="fb-form-card card">
            <h3 className="fb-form-title">⚡ Curation Caster</h3>
            <p className="fb-form-desc">
              Write explicit curation feedback guidelines. The AI generator retrieves matching rules to customize resources & milestones.
            </p>

            <form onSubmit={handleSubmitDirective}>
              <div className="form-group">
                <label>Category Context</label>
                <select value={category} onChange={e => setCategory(e.target.value)}>
                  <option value="resources">Marketplace & Resources (Recommended)</option>
                  <option value="academics">Academics & Subject Choices</option>
                  <option value="timeline">Milestone Timelines</option>
                  <option value="general">General Guideline</option>
                </select>
              </div>

              <div className="form-group">
                <label>Target Goal / Keyword</label>
                <input
                  type="text"
                  placeholder="e.g. Data Science, SAT Prep, Stanford CS"
                  value={targetGoal}
                  onChange={e => setTargetGoal(e.target.value)}
                  required
                />
                <span className="field-hint">The target goal must match terms in the student's query.</span>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Target Grade</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    placeholder="e.g. 10"
                    value={grade}
                    onChange={e => setGrade(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Curriculum</label>
                  <input
                    type="text"
                    placeholder="e.g. IB, CBSE"
                    value={curriculum}
                    onChange={e => setCurriculum(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Stream Focus</label>
                <input
                  type="text"
                  placeholder="e.g. Science, Commerce, Arts"
                  value={stream}
                  onChange={e => setStream(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>AI Curation Instruction</label>
                <textarea
                  rows={4}
                  placeholder="e.g. For low budget profiles, do not recommend Scaler Academy. Recommend free options like freeCodeCamp and Kaggle. Highlight project outcomes."
                  value={directiveText}
                  onChange={e => setDirectiveText(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn-primary fb-submit-btn">
                <PlusIcon size={14} /> Save Learning Memory
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}