with open('navi-agent/frontend/src/pages/Adminreview.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add import ObserverInspector
target_import = 'import { cleanLocationText } from "../utils/textUtils";'
replacement_import = '''import { cleanLocationText } from "../utils/textUtils";
import ObserverInspector from "../components/ObserverInspector";'''

if target_import in content:
    content = content.replace(target_import, replacement_import, 1)
    print("1. Added ObserverInspector import to Adminreview.jsx.")
else:
    print("1. Target import not found!")

# 2. Add state variables
target_state = '  // Alternatives index state'
replacement_state = '''  // Observer Agent Audit state
  const [observerReport, setObserverReport] = useState(null);
  const [observerLoading, setObserverLoading] = useState(false);
  const [showObserverAudit, setShowObserverAudit] = useState(false);

  const runObserverAudit = async () => {
    if (!selectedPath) return;
    setObserverLoading(true);
    try {
      const res = await fetch(`${API}/api/observer/paths/${selectedPath.id}`);
      if (res.ok) {
        const data = await res.json();
        setObserverReport(data);
        setShowObserverAudit(true);
      } else {
        const inlineRes = await fetch(`${API}/api/observer/observe`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roadmap_data: activeRoadmap || selectedPath.roadmap_data,
            current_position: selectedPath.current_position || "",
            target_goal: selectedPath.target_goal || "",
            profile: selectedPath.profile || {},
            category: selectedPath.profile?.activeSegment || "academic",
            human_review: selectedPath.human_review,
            path_id: selectedPath.id
          })
        });
        if (inlineRes.ok) {
          const inlineData = await inlineRes.json();
          setObserverReport(inlineData);
          setShowObserverAudit(true);
        }
      }
    } catch (err) {
      console.error("Admin Observer Audit error:", err);
    } finally {
      setObserverLoading(false);
    }
  };

  // Alternatives index state'''

if target_state in content:
    content = content.replace(target_state, replacement_state, 1)
    print("2. Added Observer state & runObserverAudit to Adminreview.jsx.")
else:
    print("2. Target state not found!")

# 3. Add ObserverInspector Card above Global Metrics
target_metrics = '{/* ── Global Metrics ──────────────────────────────────────────── */}'
replacement_metrics = '''{/* ── Pathway Accuracy & AI Observer Evaluation Card ─────────── */}
          <div className="ar-editor-stats-card card" style={{ marginBottom: 16 }}>
            <div className="stats-card-header">
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <div className="section-label" style={{ marginBottom: 0 }}>Pathway Accuracy Evaluation</div>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 6,
                  background: selectedPath?.human_review?.status === "reviewed" ? "#f1f5f9" : "#fef3c7",
                  color: selectedPath?.human_review?.status === "reviewed" ? "#0f172a" : "#b45309"
                }}>
                  Human: {selectedPath?.human_review?.status === "reviewed" ? `${selectedPath.human_review.overall_score}/100` : "Not Reviewed"}
                </span>
                {observerReport && (
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 6,
                    background: "#eff6ff", color: "#1e40af"
                  }}>
                    Observer AI: {observerReport.overall_quality_score}/100 ({observerReport.status_label})
                  </span>
                )}
              </div>
              <button
                type="button"
                className="btn-edit-section"
                onClick={runObserverAudit}
                disabled={observerLoading}
                style={{ gap: 6 }}
              >
                <IconBrain size={13} />
                <span>{observerLoading ? "Auditing..." : (showObserverAudit ? "Re-Audit Pathway" : "Run Observer Audit")}</span>
              </button>
            </div>

            {showObserverAudit && observerReport && (
              <div style={{ marginTop: 12 }}>
                <ObserverInspector
                  report={observerReport}
                  onReAudit={runObserverAudit}
                  auditLoading={observerLoading}
                  pathTitle={activeRoadmap?.path_title || selectedPath?.target_goal}
                  totalDuration={activeRoadmap?.total_duration}
                  pathId={selectedPath?.id}
                  onHumanReviewUpdated={(newRev, newComp) => {
                    setSelectedPath(prev => ({
                      ...prev,
                      human_review: newRev
                    }));
                    if (observerReport) {
                      setObserverReport(prev => ({
                        ...prev,
                        human_review: newRev,
                        comparison: newComp || prev?.comparison
                      }));
                    }
                  }}
                />
              </div>
            )}
          </div>

          {/* ── Global Metrics ──────────────────────────────────────────── */}'''

if target_metrics in content:
    content = content.replace(target_metrics, replacement_metrics, 1)
    print("3. Added Observer card to Adminreview.jsx.")
else:
    print("3. Target metrics not found!")

with open('navi-agent/frontend/src/pages/Adminreview.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Adminreview.jsx updated successfully!")

