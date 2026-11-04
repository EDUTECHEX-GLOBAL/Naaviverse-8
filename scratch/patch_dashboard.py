import re

with open('navi-agent/frontend/src/pages/Dashboard.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace lines 1526-1589
target_pattern = re.compile(r'\{\/\* ── PATH ACCURACY SCORE CARD ── \*\/\}[\s\S]*?\{\/\* Steps — Google Maps direction style \*\/\}')

replacement_jsx = '''{/* ── PATH ACCURACY EVALUATION (HUMAN REVIEW VS OBSERVER AGENT) ── */}
                  {(() => {
                    const activeReport = customAuditReport || activePath.observer_report || activePath.observer_evaluation;
                    const obsScore = activeReport ? activeReport.overall_quality_score : (activePath.accuracy_score || activePath.readiness_score || 0);
                    const obsLabel = activeReport ? activeReport.status_label : (activePath.accuracy_label || "Verified");
                    const obsColor = activeReport ? activeReport.status_color : "#137333";
                    
                    const humanRev = activePath.human_review || (activeReport && activeReport.human_review);
                    const hasHumanReview = humanRev && humanRev.status === "reviewed" && humanRev.overall_score !== null && humanRev.overall_score !== undefined;
                    const humanScore = hasHumanReview ? humanRev.overall_score : null;
                    const scoreDiff = hasHumanReview ? Math.abs(humanScore - obsScore) : null;

                    return (
                      <div className="db-accuracy-card">
                        <div className="db-accuracy-card-header">
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                            <span className="db-accuracy-card-title">Pathway Accuracy Evaluation</span>
                            
                            {/* Human Review Score */}
                            <span className={`db-eval-pill ${hasHumanReview ? "human-reviewed" : "not-reviewed"}`}>
                              <IconUser size={12} />
                              <span>Human Review: {hasHumanReview ? `${humanScore}/100` : "Not Reviewed"}</span>
                            </span>

                            {/* Observer Agent AI Score */}
                            <span className="db-eval-pill ai-verified" style={{ borderColor: obsColor }}>
                              <IconBrain size={12} />
                              <span>Observer AI: {obsScore}/100</span>
                              <span style={{ opacity: 0.85, fontSize: "10px" }}>· {obsLabel}</span>
                            </span>

                            {/* Difference */}
                            {hasHumanReview && (
                              <span className={`db-eval-pill diff ${scoreDiff <= 5 ? "match" : "diff"}`}>
                                <span>{scoreDiff === 0 ? "Exact Match" : `${scoreDiff} pts diff`}</span>
                              </span>
                            )}
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <button
                              type="button"
                              onClick={() => setShowObserverAudit(p => !p)}
                              style={{
                                background: showObserverAudit ? "#0f172a" : "var(--bg-hover, #f3f4f6)",
                                border: "1px solid var(--border, #d1d5db)",
                                color: showObserverAudit ? "#ffffff" : "var(--text, #374151)",
                                fontSize: "11px",
                                fontWeight: 700,
                                padding: "6px 12px",
                                borderRadius: "8px",
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                transition: "all 0.15s ease"
                              }}
                            >
                              <IconSparkles size={13} />
                              <span>{showObserverAudit ? "Hide Audit Details" : "Inspect 9-Dimension Audit"}</span>
                              <span style={{ fontSize: "10px", opacity: 0.8 }}>{showObserverAudit ? "▲" : "▼"}</span>
                            </button>
                          </div>
                        </div>

                        {showObserverAudit && (
                          <ObserverInspector
                            report={activeReport}
                            onReAudit={handleReAudit}
                            auditLoading={auditLoading}
                            pathTitle={activePath.path_title}
                            totalDuration={activePath.total_duration}
                            pathId={activePath._id || activePath.id}
                            onHumanReviewUpdated={(newRev) => {
                              setActivePath(prev => ({
                                ...prev,
                                human_review: newRev
                              }));
                            }}
                          />
                        )}
                      </div>
                    );
                  })()}

                  {/* Steps — Google Maps direction style */}'''

new_content, count = target_pattern.subn(replacement_jsx, content)
if count > 0:
    with open('navi-agent/frontend/src/pages/Dashboard.jsx', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f"Replaced in Dashboard.jsx ({count} match).")
else:
    print("Pattern not matched in Dashboard.jsx!")

