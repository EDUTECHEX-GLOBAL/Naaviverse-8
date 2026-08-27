import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useParams } from "react-router-dom";
import './Adminreview.scss';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  IconCheck, IconAlert, IconArrowLeft, IconUser,
  IconSearch, IconNavigation, IconBrain, IconBulb
} from "./Icons";
import { MOCK_DATA, getPriceForView } from "./Marketplace";

const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://127.0.0.1:8001" : "");

const STATUS = {
  under_review: "under_admin_review",
  published: "published",
  rejected: "rejected"
};

function cleanMarkdownText(str) {
  if (!str) return "";
  return str.replace(/\*\*/g, "");
}

const MARKETPLACE_CATEGORIES = ["mentors", "vendors", "institutions", "distributors"];
const MARKETPLACE_SECTIONS = ["macro_free", "micro_structured", "nano_expert"];
const MARKETPLACE_CATEGORY_LABELS = {
  mentors: "Mentors",
  vendors: "Vendors",
  institutions: "Institutions",
  distributors: "Distributors",
};
const MARKETPLACE_VIEW_KEYS = {
  macro_free: "macro_view",
  micro_structured: "micro_view",
  nano_expert: "nano_view",
};

function marketplaceSectionFromView(view) {
  if (view === "macro") return "macro_free";
  if (view === "micro") return "micro_structured";
  if (view === "nano") return "nano_expert";
  return "";
}

function marketplaceSectionFromCategory(category) {
  if (category === "mentors") return "nano_expert";
  if (category === "distributors") return "macro_free";
  return "micro_structured";
}

function withLegacyMarketplaceSectionsForAdmin(data) {
  const copy = JSON.parse(JSON.stringify(data || {}));

  function normalizeRoadmap(roadmap) {
    if (!roadmap?.steps) return;
    roadmap.steps.forEach(step => {
      const marketplace = step.marketplace || {};
      MARKETPLACE_SECTIONS.forEach(section => {
        if (!Array.isArray(marketplace[section])) marketplace[section] = [];
      });

      MARKETPLACE_SECTIONS.forEach(section => {
        const viewKey = MARKETPLACE_VIEW_KEYS[section];
        const rawView = step[viewKey];
        const description = typeof rawView === "object" && rawView !== null
          ? rawView.description || ""
          : rawView || "";
        const viewMarketplace = typeof rawView === "object" && rawView !== null && rawView.marketplace
          ? rawView.marketplace
          : {};

        MARKETPLACE_CATEGORIES.forEach(category => {
          (Array.isArray(viewMarketplace[category]) ? viewMarketplace[category] : []).forEach(item => {
            marketplace[section].push({
              ...item,
              category,
              provider_type: item?.provider_type || category,
              section,
              view: marketplaceSectionFromView(item?.view) ? item.view : section.replace("_free", "").replace("_structured", "").replace("_expert", ""),
            });
          });
        });

        step[viewKey] = {
          description,
          marketplace: MARKETPLACE_CATEGORIES.reduce((acc, category) => {
            acc[category] = Array.isArray(viewMarketplace[category]) ? viewMarketplace[category] : [];
            return acc;
          }, {}),
        };
      });

      const seenBySection = Object.fromEntries(
        MARKETPLACE_SECTIONS.map(section => [
          section,
          new Set(marketplace[section].map(item => `${item?.name || ""}|${item?.type || ""}|${section}`.toLowerCase()))
        ])
      );

      MARKETPLACE_CATEGORIES.forEach(category => {
        (Array.isArray(marketplace[category]) ? marketplace[category] : []).forEach(item => {
          const section = item.section || marketplaceSectionFromView(item.view) || marketplaceSectionFromCategory(category);
          if (MARKETPLACE_SECTIONS.includes(section)) {
            const identity = `${item?.name || ""}|${item?.type || ""}|${section}`.toLowerCase();
            if (!seenBySection[section].has(identity)) {
              marketplace[section].push(item);
              seenBySection[section].add(identity);
            }
          }
        });
      });

      step.marketplace = marketplace;
    });
  }

  if (Array.isArray(copy)) {
    copy.forEach(path => {
      normalizeRoadmap(path.roadmap_data);
      (path.roadmap_data?.alternatives || []).forEach(normalizeRoadmap);
    });
    return copy;
  }

  normalizeRoadmap(copy.roadmap_data);
  normalizeRoadmap(copy);
  (copy.alternatives || []).forEach(normalizeRoadmap);
  (copy.roadmap_data?.alternatives || []).forEach(normalizeRoadmap);
  return copy;
}

function getViewDescription(step, viewKey) {
  const view = step?.[viewKey];
  if (view && typeof view === "object") return view.description || "";
  return view || "";
}

function setViewDescriptionOnStep(step, viewKey, value) {
  const next = { ...(step || {}) };
  const current = next[viewKey];
  next[viewKey] = current && typeof current === "object"
    ? { ...current, description: value }
    : { description: value, marketplace: MARKETPLACE_CATEGORIES.reduce((acc, category) => ({ ...acc, [category]: [] }), {}) };
  return next;
}

// ── Icon helpers ───────────────────────────────────────────────────────────
function PlusIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
function TrashIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
    </svg>
  );
}
function EditIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}
function ChevronDown({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
function ExportIcon({ size = 13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}
function ClockIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
function RotateCwIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 4v6h-6" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  );
}

// ── Empty templates ────────────────────────────────────────────────────────
function emptyMilestone(id) {
  return {
    id,
    title: "",
    duration: "",
    description: "",
    macro_view: { description: "", marketplace: { mentors: [], vendors: [], institutions: [], distributors: [] } },
    micro_view: { description: "", marketplace: { mentors: [], vendors: [], institutions: [], distributors: [] } },
    nano_view: { description: "", marketplace: { mentors: [], vendors: [], institutions: [], distributors: [] } },
    marketplace: {
      macro_free: [],
      micro_structured: [],
      nano_expert: []
    }
  };
}

function emptyMacroFree(category = "vendors") { return { name: "", type: "", why: "", next_step: "", category, provider_type: category, section: "macro_free", view: "macro" }; }
function emptyMicroStructured(category = "vendors") { return { name: "", type: "", cost: "", duration: "", value: "", next_step: "", category, provider_type: category, section: "micro_structured", view: "micro" }; }
function emptyNanoExpert(category = "mentors") { return { name: "", type: "", price: "", session_details: "", expected_outcomes: "", category, provider_type: category, section: "nano_expert", view: "nano" }; }

// ── Confirm modal ──────────────────────────────────────────────────────────
function ConfirmModal({ message, onConfirm, onCancel }) {
  return createPortal(
    <div className="ar-modal-overlay" onClick={onCancel}>
      <div className="ar-modal-box" onClick={e => e.stopPropagation()}>
        <p>{message}</p>
        <div className="ar-modal-btns">
          <button className="btn-cancel-section" onClick={onCancel}>Cancel</button>
          <button className="btn-danger-confirm" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ── Curation History Sidebar ───────────────────────────────────────────────
// ── Curation History Sidebar ───────────────────────────────────────────────
function CurationHistorySidebar({ path }) {
  const mods = path?.modifications || [];
  const createdAt = path?.created_at;
  const generationId = path?.generation_id;
  const [expandedIds, setExpandedIds] = useState({});

  function toggleExpand(key) {
    setExpandedIds(prev => ({ ...prev, [key]: !prev[key] }));
  }

  function formatTime(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    });
  }

  function markerClass(action) {
    if (!action) return "initial";
    if (action === "publish" || action === "published") return "published";
    return "edited";
  }

  // Keeps each diff value short so the sidebar never blows up with long
  // marketplace descriptions, "why" text, etc.
  function truncateVal(val, len = 48) {
    if (val === null || val === undefined || val === "") return "—";
    const str = typeof val === "object" ? JSON.stringify(val) : String(val);
    return str.length > len ? str.slice(0, len).trim() + "…" : str;
  }

  function actionLabel(action) {
    switch (action) {
      case "publish":
      case "published":
        return <><IconCheck size={12} /> Pathway Published</>;
      case "edit_milestone":
        return <><EditIcon size={12} /> Step Edited</>;
      case "add_milestone":
        return <><PlusIcon size={12} /> Step Added</>;
      case "delete_milestone":
        return <><TrashIcon size={12} /> Step Deleted</>;
      case "edit_global_details":
        return <><EditIcon size={12} /> Global Details Edited</>;
      case "edit_marketplace":
        return <><EditIcon size={12} /> Resources Updated</>;
      default:
        return <><EditIcon size={12} /> {action}</>;
    }
  }

  return (
    <div className="ar-editor-sidebar">
      <h3><ClockIcon size={14} /> &nbsp;Curation History</h3>

      {mods.length === 0 && !createdAt ? (
        <p style={{ fontSize: 12.5, color: "var(--text3)", fontStyle: "italic" }}>
          No history recorded yet. Edits made by admins will appear here.
        </p>
      ) : (
        <div className="ar-history-timeline">
          {createdAt && (
            <div className="ar-timeline-item">
              <span className="timeline-marker initial" />
              <div className="timeline-content">
                <span className="timeline-time">{formatTime(createdAt)}</span>
                <strong style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <IconBrain size={12} /> AI Pathway Generated
                </strong>
                {path?.original_alternative_name && (
                  <span className="timeline-author">Option: {path.original_alternative_name}</span>
                )}
                {generationId && (
                  <span className="timeline-author">Generation ID: {generationId.slice(-8)}</span>
                )}
              </div>
            </div>
          )}

          {[...mods].reverse().map((mod, i) => {
            const key = mod.timestamp ? `${mod.timestamp}_${i}` : `mod_${i}`;
            const isExpanded = !!expandedIds[key];
            const changeCount = mod.changes?.length || 0;

            return (
              <div key={key} className="ar-timeline-item">
                <span className={`timeline-marker ${markerClass(mod.action)}`} />
                <div className="timeline-content">
                  <span className="timeline-time">{formatTime(mod.timestamp)}</span>
                  <strong style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                    {actionLabel(mod.action)}
                  </strong>
                  {mod.edited_by && (
                    <span className="timeline-author">by {mod.edited_by}</span>
                  )}
                  {mod.details && (
                    <p className="timeline-details-text">{mod.details}</p>
                  )}

                  {changeCount > 0 && (
                    <>
                      <button
                        type="button"
                        className="timeline-changes-toggle"
                        onClick={() => toggleExpand(key)}
                      >
                        <span>{isExpanded ? "Hide details" : `View ${changeCount} field ${changeCount === 1 ? "change" : "changes"}`}</span>
                        <ChevronDown size={11} />
                      </button>

                      {isExpanded && (
                        <ul className="timeline-changes-list">
                          {mod.changes.slice(0, 8).map((ch, ci) => (
                            <li key={ci}>
                              <strong>{ch.field}:</strong>{" "}
                              <span className="change-old">{truncateVal(ch.old_value)}</span>
                              {" → "}
                              <span className="change-new">{truncateVal(ch.new_value)}</span>
                            </li>
                          ))}
                          {mod.changes.length > 8 && (
                            <li className="timeline-changes-more">
                              +{mod.changes.length - 8} more changes…
                            </li>
                          )}
                        </ul>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════


// ══════════════════════════════════════════════════════════════════════════
export default function AdminReview() {
  const navigate = useNavigate();
  const { pathId } = useParams();
  const [pathsQueue, setPathsQueue] = useState([]);
  const [selectedPath, setSelectedPath] = useState(null);
  const [loadingQueue, setLoadingQueue] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("under_admin_review");
  const [successMsg, setSuccessMsg] = useState("");
  const [pdfLoading, setPdfLoading] = useState(false);
  const [editedRoadmap, setEditedRoadmap] = useState(null);
  const [showHistory, setShowHistory] = useState(true);

  // Feedback states
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackCategory, setFeedbackCategory] = useState("general");
  const [feedbackList, setFeedbackList] = useState([]);


  // Edit state
  const [editingDetails, setEditingDetails] = useState(false);
  const [editingMilestoneIdx, setEditingMilestoneIdx] = useState(null);
  const [tempDetails, setTempDetails] = useState({});
  const [tempMilestone, setTempMilestone] = useState(null);

  // Marketplace expand
  const [expandedMarkets, setExpandedMarkets] = useState({});

  // Confirm delete modal
  const [confirmModal, setConfirmModal] = useState(null);
  const [activeMarketplaceCategories, setActiveMarketplaceCategories] = useState({});
  const [regeneratingMarketplaceKey, setRegeneratingMarketplaceKey] = useState("");

  // Alternatives index state
  const [activeAltIdx, setActiveAltIdx] = useState(0);
  const activeRoadmap = editedRoadmap?.alternatives ? editedRoadmap.alternatives[activeAltIdx] : editedRoadmap;

  // ── PDF Export ─────────────────────────────────────────────────────────
  const handleExportPdf = async (pathParam) => {
    const isEvent = pathParam && (pathParam.nativeEvent || pathParam.preventDefault || typeof pathParam.stopPropagation === 'function');
    const pathToExport = (pathParam && !isEvent) ? pathParam : selectedPath;
    if (!pathToExport) { alert('Select a path to generate report'); return; }
    setPdfLoading(true);
    try {
      const doc = new jsPDF();
      const now = new Date();
      const dateStr = now.toLocaleDateString();
      const roadmapRaw = (selectedPath && pathToExport.id === selectedPath.id && editedRoadmap)
        ? editedRoadmap : pathToExport.roadmap_data;
      const roadmap = roadmapRaw?.alternatives ? roadmapRaw.alternatives[activeAltIdx] : roadmapRaw;

      const printSection = (docInstance, title, content, x, y, width) => {
        let cy = y;
        if (cy > 250) { docInstance.addPage(); cy = 25; }
        docInstance.setFontSize(11); docInstance.setFont("helvetica", "bold");
        docInstance.text(title, x, cy);
        docInstance.setFontSize(10); docInstance.setFont("helvetica", "normal");
        const lines = docInstance.splitTextToSize(content || "No information provided.", width);
        lines.forEach(line => { cy += 5; if (cy > 275) { docInstance.addPage(); cy = 25; } docInstance.text(line, x, cy); });
        return cy + 12;
      };

      doc.setFillColor(99, 102, 241);
      doc.rect(0, 0, 210, 45, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22); doc.setFont("helvetica", "bold");
      doc.text('Naaviverse Admin Report', 15, 25);
      doc.setFontSize(10); doc.setFont("helvetica", "normal");
      doc.text(`Generated on: ${dateStr}`, 15, 35);
      doc.setTextColor(15, 23, 42);

      autoTable(doc, {
        startY: 55, theme: 'striped',
        headStyles: { fillColor: [79, 70, 229] },
        head: [['Metric', 'Value']],
        body: [
          ['Current Position', pathToExport.current_position || 'N/A'],
          ['Target Goal', pathToExport.target_goal || 'N/A'],
          ['Grade', pathToExport.profile?.grade || 'N/A'],
          ['Board', pathToExport.profile?.curriculum || 'N/A'],
          ['Readiness Score', `${roadmap?.readiness_score || 0}% (${roadmap?.readiness_label || 'N/A'})`],
          ['Total Duration', roadmap?.total_duration || 'N/A']
        ],
        styles: { fontSize: 10, cellPadding: 4 }
      });

      let cy = doc.lastAutoTable.finalY + 15;
      cy = printSection(doc, 'Pathway Title:', roadmap?.path_title || `Pathway to ${pathToExport.target_goal}`, 15, cy, 180);
      cy = printSection(doc, 'Pathway Description:', roadmap?.path_description, 15, cy, 180);

      // ── Per-view category configs ─────────────────────────────────────
      const VIEW_CONFIGS = [
        {
          viewKey: "macro_view",
          marketKey: "macro_free",
          viewLabel: "Macro View",
          viewColor: [22, 163, 74],
          buildRow: r => [
            cleanMarkdownText(r.name),
            cleanMarkdownText(r.type) || "—",
            "Free",
            `${cleanMarkdownText(r.why) || "—"}\nAction: ${cleanMarkdownText(r.next_step) || "—"}`
          ]
        },
        {
          viewKey: "micro_view",
          marketKey: "micro_structured",
          viewLabel: "Micro View",
          viewColor: [37, 99, 235],
          buildRow: r => [
            cleanMarkdownText(r.name),
            cleanMarkdownText(r.type) || "—",
            `${cleanMarkdownText(r.cost) || "—"} / ${cleanMarkdownText(r.duration) || "—"}`,
            `${cleanMarkdownText(r.value) || "—"}\nAction: ${cleanMarkdownText(r.next_step) || "—"}`
          ]
        },
        {
          viewKey: "nano_view",
          marketKey: "nano_expert",
          viewLabel: "Nano View",
          viewColor: [126, 34, 206],
          buildRow: r => [
            cleanMarkdownText(r.name),
            cleanMarkdownText(r.type) || "—",
            cleanMarkdownText(r.price) || "—",
            `${cleanMarkdownText(r.expected_outcomes) || "—"}\nFormat: ${cleanMarkdownText(r.session_details) || "—"}`
          ]
        }
      ];

      const CATEGORY_LABELS_PDF = [
        { key: "vendors",      label: "Vendors",      color: [234, 179, 8]   },
        { key: "distributors", label: "Distributors", color: [234, 88, 12]   },
        { key: "institutions", label: "Institutions", color: [14, 165, 233]  },
        { key: "mentors",      label: "Mentors",      color: [168, 85, 247]  },
      ];

      // ── Per-step rendering ────────────────────────────────────────────
      roadmap?.steps?.forEach(milestone => {
        doc.addPage();

        // Step header banner
        doc.setFillColor(243, 244, 246);
        doc.rect(0, 0, 210, 28, 'F');
        doc.setTextColor(79, 70, 229);
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text(`Step ${milestone.id}: ${milestone.title}`, 15, 16);
        doc.setTextColor(107, 114, 128);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`Duration: ${milestone.duration || 'N/A'}`, 150, 16);
        doc.setTextColor(15, 23, 42);

        let sy = 38;

        // Step name + description
        sy = printSection(doc, 'Step Name:', milestone.title || '—', 15, sy, 180);
        sy = printSection(doc, 'Description:', cleanMarkdownText(milestone.description) || '—', 15, sy, 180);

        // For each view: description + per-category marketplace tables
        VIEW_CONFIGS.forEach(vcfg => {
          const viewDesc = cleanMarkdownText(getViewDescription(milestone, vcfg.viewKey)) || 'No description.';
          const allItems = milestone.marketplace?.[vcfg.marketKey] || [];

          // View section header band
          if (sy > 240) { doc.addPage(); sy = 20; }
          doc.setFillColor(...vcfg.viewColor);
          doc.rect(12, sy - 4, 186, 10, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.text(vcfg.viewLabel, 15, sy + 3);
          doc.setTextColor(15, 23, 42);
          sy += 14;

          // View description text
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          const descLines = doc.splitTextToSize(viewDesc, 178);
          descLines.forEach(line => {
            if (sy > 275) { doc.addPage(); sy = 20; }
            doc.text(line, 15, sy);
            sy += 5;
          });
          sy += 6;

          // Marketplace sub-heading
          if (sy > 260) { doc.addPage(); sy = 20; }
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(80, 80, 80);
          doc.text('Marketplace Related to ' + vcfg.viewLabel + ':', 15, sy);
          doc.setTextColor(15, 23, 42);
          sy += 8;

          if (allItems.length === 0) {
            doc.setFontSize(9);
            doc.setFont('helvetica', 'italic');
            doc.setTextColor(150, 150, 150);
            doc.text('No marketplace resources for this view.', 15, sy);
            doc.setTextColor(15, 23, 42);
            sy += 10;
          } else {
            // One table per category
            CATEGORY_LABELS_PDF.forEach(cat => {
              const catItems = allItems.filter(item => classifyAdminMarketplaceItem(item) === cat.key);
              if (catItems.length === 0) return;

              if (sy > 255) { doc.addPage(); sy = 20; }

              // Category badge
              doc.setFillColor(...cat.color);
              doc.roundedRect(14, sy - 3, 54, 8, 2, 2, 'F');
              doc.setTextColor(255, 255, 255);
              doc.setFontSize(9);
              doc.setFont('helvetica', 'bold');
              doc.text(cat.label, 16, sy + 2);
              doc.setTextColor(15, 23, 42);
              sy += 10;

              const tableRows = catItems.map(r => vcfg.buildRow(r));
              autoTable(doc, {
                startY: sy,
                theme: 'grid',
                headStyles: { fillColor: cat.color, textColor: [255, 255, 255], fontSize: 8.5, fontStyle: 'bold' },
                head: [['Resource / Provider', 'Type', 'Cost', 'Details']],
                body: tableRows,
                styles: { fontSize: 8.5, cellPadding: 3, overflow: 'linebreak' },
                columnStyles: {
                  0: { cellWidth: 45 },
                  1: { cellWidth: 38 },
                  2: { cellWidth: 28 },
                  3: { cellWidth: 74 }
                },
                margin: { left: 14, right: 10 }
              });
              sy = doc.lastAutoTable.finalY + 8;
            });
          }
          sy += 4;
        });
      });

      doc.save(`naavi-admin-report-${now.toISOString().split('T')[0]}.pdf`);
    } catch (e) {
      console.error("[Naavi AdminReview] Failed to generate report PDF:", e);
      alert('Failed to generate PDF');
    }
    setPdfLoading(false);
  };

  // ── Queue load ─────────────────────────────────────────────────────────
  async function loadQueue() {
    setLoadingQueue(true); setError("");
    try {
      const res = await fetch(`${API}/api/admin/paths?status=all`);
      if (!res.ok) throw new Error("Failed to fetch paths");
      const data = await res.json();
      setPathsQueue(withLegacyMarketplaceSectionsForAdmin(data));
    } catch (e) {
      setError("Cannot load admin review queue. Verify the backend is running.");
    } finally {
      setLoadingQueue(false);
    }
  }

  async function loadFeedbacks() {
    try {
      const res = await fetch(`${API}/api/feedbacks`);
      if (!res.ok) throw new Error("Failed to fetch AI learnings");
      const data = await res.json();
      setFeedbackList(data);
    } catch (e) {
      console.error("[Naavi AdminReview] Failed to fetch feedbacks:", e);
    }
  }

  async function handleDeleteFeedback(feedbackId) {
    if (!window.confirm("Are you sure you want to delete this learning feedback? This will remove it from the AI's memory.")) return;
    try {
      const res = await fetch(`${API}/api/feedbacks/${feedbackId}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Failed to delete feedback");
      flash("Learning feedback deleted successfully.");
      loadFeedbacks();
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => {
    loadQueue();
    loadFeedbacks();
  }, []);

  useEffect(() => {
    if (!pathId) {
      setSelectedPath(null);
      setEditedRoadmap(null);
      return;
    }
    if (String(selectedPath?.id || "") === String(pathId)) return;
    selectPathForReview({ id: pathId }, false);
  }, [pathId, selectedPath?.id]);

  useEffect(() => {
    if (filterStatus === "ai_learnings") {
      loadFeedbacks();
    }
  }, [filterStatus]);


  async function selectPathForReview(pathDoc, pushRoute = true) {
    setLoadingQueue(true); setError("");
    try {
      const res = await fetch(`${API}/api/paths/${pathDoc.id}`);
      if (!res.ok) throw new Error("Failed to fetch path details");
      const fullPath = withLegacyMarketplaceSectionsForAdmin(await res.json());
      setSelectedPath(fullPath);
      setEditedRoadmap(JSON.parse(JSON.stringify(fullPath.roadmap_data)));
      setSuccessMsg(""); setEditingDetails(false); setEditingMilestoneIdx(null);
      setExpandedMarkets({}); setActiveMarketplaceCategories({}); setShowHistory(true); setActiveAltIdx(0);
      if (pushRoute) navigate(`/admin-review/${pathDoc.id}`);
    } catch (e) {
      setError("Failed to load pathway details. Verify the backend is running.");
    } finally {
      setLoadingQueue(false);
    }
  }

  function returnToQueue() {
    setSelectedPath(null);
    setEditedRoadmap(null);
    navigate("/admin-review");
  }

  // ── Save to DB ─────────────────────────────────────────────────────────
  async function saveRoadmapUpdate(updatedRoadmap, statusOverride) {
    if (!selectedPath) return false;
    const targetStatus = statusOverride || selectedPath.status;
    setLoadingSubmit(true); setError("");
    try {
      const adminEmail = sessionStorage.getItem("nv_session") || "Admin";
      const res = await fetch(`${API}/api/paths/${selectedPath.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roadmap_data: updatedRoadmap, status: targetStatus, edited_by: adminEmail })
      });
      if (!res.ok) throw new Error("Failed to update career path");
      setPathsQueue(prev => withLegacyMarketplaceSectionsForAdmin(
        prev.map(p => p.id === selectedPath.id ? { ...p, roadmap_data: updatedRoadmap } : p)
      ));
      // Refresh selectedPath to pick up new modification records
      try {
        const refreshRes = await fetch(`${API}/api/paths/${selectedPath.id}`);
        if (refreshRes.ok) setSelectedPath(withLegacyMarketplaceSectionsForAdmin(await refreshRes.json()));
      } catch (_) { /* non-critical */ }
      flash("Changes saved successfully!");
      return true;
    } catch (e) {
      setError(e.message);
      return false;
    } finally {
      setLoadingSubmit(false);
    }
  }

  async function saveStepUpdate(endpoint, method, payload, successText = "Changes saved successfully!") {
    if (!selectedPath) return null;
    setLoadingSubmit(true); setError("");
    try {
      const adminEmail = sessionStorage.getItem("nv_session") || "Admin";
      const res = await fetch(`${API}/api/admin/${endpoint}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path_id: selectedPath.id,
          alternative_index: editedRoadmap?.alternatives ? activeAltIdx : null,
          edited_by: adminEmail,
          ...payload
        })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.detail || "Failed to update step");
      }
      const data = await res.json();
      if (data.path) {
        const normalizedPath = withLegacyMarketplaceSectionsForAdmin(data.path);
        setSelectedPath(normalizedPath);
        setEditedRoadmap(JSON.parse(JSON.stringify(normalizedPath.roadmap_data)));
        setPathsQueue(prev => withLegacyMarketplaceSectionsForAdmin(
          prev.map(p => p.id === selectedPath.id ? { ...p, roadmap_data: normalizedPath.roadmap_data } : p)
        ));
      }
      flash(successText);
      return data;
    } catch (e) {
      setError(e.message);
      return null;
    } finally {
      setLoadingSubmit(false);
    }
  }

  function flash(msg) { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(""), 3000); }

  // ── History helpers ────────────────────────────────────────────────────
  const getOriginalField = (fieldPath) => {
    const original = selectedPath?.original_roadmap_data;
    if (!original) return null;
    if (fieldPath === "path_title") return original.path_title;
    if (fieldPath === "path_description") return original.path_description;
    if (fieldPath === "readiness_score") return original.readiness_score;
    if (fieldPath === "readiness_label") return original.readiness_label;
    if (fieldPath === "total_duration") return original.total_duration;
    if (fieldPath.startsWith("steps.")) {
      const parts = fieldPath.split(".");
      const stepId = parseInt(parts[1], 10);
      const subfield = parts[2];
      const origStep = original.steps?.find(s => s.id === stepId);
      if (!origStep) return undefined;
      if (["macro_view", "micro_view", "nano_view"].includes(subfield)) {
        return getViewDescription(origStep, subfield);
      }
      return origStep[subfield] ?? null;
    }
    return null;
  };

  const isFieldEdited = (fieldPath, currentValue) => {
    const origVal = getOriginalField(fieldPath);
    if (origVal === undefined || origVal === null) return false;
    return origVal !== currentValue;
  };

  const isStepAdded = (stepId) => {
    const original = selectedPath?.original_roadmap_data;
    if (!original) return false;
    return !original.steps?.some(s => s.id === stepId);
  };

  // ── Details edit ───────────────────────────────────────────────────────
  function startEditDetails() {
    setTempDetails({
      path_title: activeRoadmap.path_title || "",
      path_description: activeRoadmap.path_description || "",
      readiness_score: activeRoadmap.readiness_score || 0,
      readiness_label: activeRoadmap.readiness_label || "",
      total_duration: activeRoadmap.total_duration || ""
    });
    setEditingDetails(true);
  }
  async function saveDetails() {
    let updated;
    if (editedRoadmap?.alternatives) {
      const updatedAlternatives = [...editedRoadmap.alternatives];
      updatedAlternatives[activeAltIdx] = { ...updatedAlternatives[activeAltIdx], ...tempDetails };
      updated = { ...editedRoadmap, alternatives: updatedAlternatives };
    } else {
      updated = { ...editedRoadmap, ...tempDetails };
    }
    if (await saveRoadmapUpdate(updated)) {
      setEditedRoadmap(updated);
      setEditingDetails(false);
    }
  }

  // ── Milestone edit ─────────────────────────────────────────────────────
  function startEditMilestone(idx) {
    setEditingMilestoneIdx(idx);
    setTempMilestone(JSON.parse(JSON.stringify(activeRoadmap.steps[idx])));
  }
  async function saveMilestone(idx) {
    const data = await saveStepUpdate("edit-step", "PUT", {
      step_id: activeRoadmap.steps[idx].id,
      step: tempMilestone
    }, "Step saved successfully!");
    if (data) {
      setEditingMilestoneIdx(null);
      setTempMilestone(null);
    }
  }
  function cancelEditMilestone() { setEditingMilestoneIdx(null); setTempMilestone(null); }
  function handleTempMilestoneChange(field, value) {
    if (["macro_view", "micro_view", "nano_view"].includes(field)) {
      setTempMilestone(prev => setViewDescriptionOnStep(prev, field, value));
      return;
    }
    setTempMilestone(prev => ({ ...prev, [field]: value }));
  }

  // ── Delete milestone ───────────────────────────────────────────────────
  function confirmDeleteMilestone(idx) {
    setConfirmModal({
      message: `Delete Step ${activeRoadmap.steps[idx].id}: "${activeRoadmap.steps[idx].title}"? This cannot be undone.`,
      onConfirm: async () => {
        setConfirmModal(null);
        const data = await saveStepUpdate("delete-step", "DELETE", {
          step_id: activeRoadmap.steps[idx].id
        }, "Step deleted successfully!");
        if (data) {
          if (editingMilestoneIdx === idx) { setEditingMilestoneIdx(null); setTempMilestone(null); }
        }
      }
    });
  }

  // ── Add milestone ──────────────────────────────────────────────────────
  async function addMilestone() {
    const newId = (activeRoadmap.steps?.length || 0) + 1;
    const newMilestone = emptyMilestone(newId);
    const data = await saveStepUpdate("add-step", "POST", {
      step: newMilestone,
      insert_index: activeRoadmap.steps?.length || 0
    }, "Step added successfully!");
    if (data) {
      const newIdx = (activeRoadmap.steps?.length || 0);
      setEditingMilestoneIdx(newIdx);
      setTempMilestone(JSON.parse(JSON.stringify(data.step || newMilestone)));
    }
  }

  // ── Marketplace helpers ────────────────────────────────────────────────
  function toggleMarketplace(milestoneId, type) {
    const key = `${milestoneId}_${type}`;
    setExpandedMarkets(prev => {
      const next = { ...prev };
      ["macro", "micro", "nano"].forEach(t => { next[`${milestoneId}_${t}`] = false; });
      next[key] = !prev[key];
      return next;
    });
  }

  function getMarketplaceCategoryKey(milestoneId, viewKey) {
    return `${milestoneId}_${viewKey}`;
  }

  function getActiveMarketplaceCategory(milestoneId, viewKey) {
    return activeMarketplaceCategories[getMarketplaceCategoryKey(milestoneId, viewKey)] || "mentors";
  }

  function setActiveMarketplaceCategory(milestoneId, viewKey, category) {
    setActiveMarketplaceCategories(prev => ({
      ...prev,
      [getMarketplaceCategoryKey(milestoneId, viewKey)]: category,
    }));
  }

  function updateMarketItem(mIdx, marketKey, rIdx, field, value) {
    if (editingMilestoneIdx === mIdx) {
      setTempMilestone(prev => {
        const copy = JSON.parse(JSON.stringify(prev));
        copy.marketplace[marketKey][rIdx][field] = value;
        return copy;
      });
    } else {
      const updated = JSON.parse(JSON.stringify(editedRoadmap));
      if (updated.alternatives) {
        updated.alternatives[activeAltIdx].steps[mIdx].marketplace[marketKey][rIdx][field] = value;
      } else {
        updated.steps[mIdx].marketplace[marketKey][rIdx][field] = value;
      }
      setEditedRoadmap(updated);
    }
  }

  async function saveMarketItemDirect(mIdx) {
    let roadmapToSave = editedRoadmap;
    let stepToSave = activeRoadmap.steps[mIdx];
    if (editingMilestoneIdx === mIdx && tempMilestone) {
      if (editedRoadmap?.alternatives) {
        const updatedAlternatives = [...editedRoadmap.alternatives];
        const updatedPath = [...updatedAlternatives[activeAltIdx].steps];
        updatedPath[mIdx] = tempMilestone;
        updatedAlternatives[activeAltIdx] = { ...updatedAlternatives[activeAltIdx], steps: updatedPath };
        roadmapToSave = { ...editedRoadmap, alternatives: updatedAlternatives };
      } else {
        const updatedPath = [...editedRoadmap.steps];
        updatedPath[mIdx] = tempMilestone;
        roadmapToSave = { ...editedRoadmap, steps: updatedPath };
      }
      setEditedRoadmap(roadmapToSave);
      stepToSave = tempMilestone;
    } else {
      stepToSave = editedRoadmap?.alternatives
        ? editedRoadmap.alternatives[activeAltIdx].steps[mIdx]
        : editedRoadmap.steps[mIdx];
    }
    await saveStepUpdate("edit-step", "PUT", {
      step_id: stepToSave.id,
      step: stepToSave
    }, "Marketplace changes saved successfully!");
  }

  async function regenerateMarketplaceCategory(mIdx, col, category) {
    if (!selectedPath || !activeRoadmap?.steps?.[mIdx]) return;
    const sourceStep = editingMilestoneIdx === mIdx && tempMilestone
      ? tempMilestone
      : activeRoadmap.steps[mIdx];
    const regenKey = `${sourceStep.id}_${col.marketKey}_${category}`;
    setRegeneratingMarketplaceKey(regenKey);
    setLoadingSubmit(true);
    setError("");

    try {
      const categoryLabel = MARKETPLACE_CATEGORY_LABELS[category] || category;
      const res = await fetch(`${API}/api/path/patch-step`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step_id: sourceStep.id,
          field: "marketplace",
          instruction: `Regenerate the next-best ${categoryLabel} marketplace recommendations for this step. Replace the currently shown options with fresh alternatives that are more relevant and useful.`,
          current_step: sourceStep,
          current_position: selectedPath.current_position || "",
          target_goal: selectedPath.target_goal || "",
          profile: selectedPath.profile || {},
          marketplace_section: col.marketKey,
          marketplace_category: category,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.detail || "Marketplace regeneration failed");
      }

      const patchData = await res.json();
      const data = await saveStepUpdate("edit-step", "PUT", {
        step_id: sourceStep.id,
        step: patchData.updated_step || sourceStep,
      }, `${col.marketLabel} ${categoryLabel} regenerated successfully!`);

      if (data && editingMilestoneIdx === mIdx) {
        setEditingMilestoneIdx(null);
        setTempMilestone(null);
      }
    } catch (e) {
      setError(e.message || "Marketplace regeneration failed. Please try again.");
    } finally {
      setRegeneratingMarketplaceKey("");
      setLoadingSubmit(false);
    }
  }

  function addMarketItem(mIdx, marketKey, category = "vendors") {
    const emptyFns = { macro_free: emptyMacroFree, micro_structured: emptyMicroStructured, nano_expert: emptyNanoExpert };
    const newItem = emptyFns[marketKey](category);
    if (editingMilestoneIdx === mIdx) {
      setTempMilestone(prev => {
        const copy = JSON.parse(JSON.stringify(prev));
        copy.marketplace[marketKey].push(newItem);
        return copy;
      });
    } else {
      const updated = JSON.parse(JSON.stringify(editedRoadmap));
      if (updated.alternatives) {
        updated.alternatives[activeAltIdx].steps[mIdx].marketplace[marketKey].push(newItem);
      } else {
        updated.steps[mIdx].marketplace[marketKey].push(newItem);
      }
      setEditedRoadmap(updated);
    }
  }

  async function deleteMarketItem(mIdx, marketKey, rIdx) {
    setConfirmModal({
      message: "Delete this marketplace resource? This cannot be undone.",
      onConfirm: async () => {
        setConfirmModal(null);
        if (editingMilestoneIdx === mIdx) {
          setTempMilestone(prev => {
            const copy = JSON.parse(JSON.stringify(prev));
            copy.marketplace[marketKey].splice(rIdx, 1);
            return copy;
          });
        } else {
          const updated = JSON.parse(JSON.stringify(editedRoadmap));
          if (updated.alternatives) {
            updated.alternatives[activeAltIdx].steps[mIdx].marketplace[marketKey].splice(rIdx, 1);
          } else {
            updated.steps[mIdx].marketplace[marketKey].splice(rIdx, 1);
          }
          const updatedStep = updated.alternatives
            ? updated.alternatives[activeAltIdx].steps[mIdx]
            : updated.steps[mIdx];
          await saveStepUpdate("edit-step", "PUT", {
            step_id: updatedStep.id,
            step: updatedStep
          }, "Marketplace resource deleted successfully!");
        }
      }
    });
  }

  // ── Publish / reject ───────────────────────────────────────────────────
  async function submitReview(statusToSet = STATUS.published) {
    if (!selectedPath || !editedRoadmap) return;
    setLoadingSubmit(true); setError("");
    try {
      let roadmapDataToSubmit = editedRoadmap;
      if (statusToSet === STATUS.published) {
        roadmapDataToSubmit = editedRoadmap.alternatives
          ? editedRoadmap.alternatives[activeAltIdx]
          : editedRoadmap;
      }
      const res = await fetch(`${API}/api/paths/${selectedPath.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roadmap_data: roadmapDataToSubmit,
          status: statusToSet,
          edited_by: sessionStorage.getItem("nv_session") || "Admin",
          feedback_text: feedbackText,
          feedback_category: feedbackCategory
        })
      });
      if (!res.ok) throw new Error("Failed to update");
      flash(`Roadmap marked as ${statusToSet.toUpperCase()}!`);
      setFeedbackText("");
      setFeedbackCategory("general");
      returnToQueue(); loadQueue(); loadFeedbacks();
    } catch (e) { setError(e.message); }
    finally { setLoadingSubmit(false); }
  }

  // ── Filtered queue ─────────────────────────────────────────────────────
  const displayedPaths = pathsQueue.filter(p => p.status === filterStatus);
  const filteredPaths = displayedPaths.filter(p => {
    const q = searchQuery.toLowerCase();
    return p.target_goal?.toLowerCase().includes(q) || p.current_position?.toLowerCase().includes(q)
      || p.profile?.email?.toLowerCase().includes(q) || p.profile?.name?.toLowerCase().includes(q);
  });

  const isReadOnly = selectedPath?.status === "published";

  // ── Render helpers ─────────────────────────────────────────────────────
  const COL_DEFS = [
    { key: "macro", viewKey: "macro_view", label: "Macro View", sublabel: "High Level Outcome", colorClass: "macro", marketKey: "macro_free", marketLabel: "Free / Community Resources" },
    { key: "micro", viewKey: "micro_view", label: "Micro View", sublabel: "Execution Output", colorClass: "micro", marketKey: "micro_structured", marketLabel: "Structured / Paid Courses" },
    { key: "nano", viewKey: "nano_view", label: "Nano View", sublabel: "Mentor Guidance", colorClass: "nano", marketKey: "nano_expert", marketLabel: "Expert Mentors & Counselors" }
  ];

  function getDirectoryItemsForAdmin(col, generatedItems = []) {
    const generatedNames = new Set(generatedItems.map(item => (item?.name || "").trim().toLowerCase()).filter(Boolean));
    return Object.entries(MOCK_DATA).flatMap(([category, items]) =>
      (items || [])
        .filter(item => getPriceForView(item, col.key) !== undefined && getPriceForView(item, col.key) !== null)
        .filter(item => !generatedNames.has((item.name || "").trim().toLowerCase()))
        .map(item => ({
          ...item,
          category,
          price: getPriceForView(item, col.key),
        }))
    );
  }

  function classifyAdminMarketplaceItem(item) {
    const explicitCategory = (item?.category || item?.provider_type || "").toLowerCase();
    if (MARKETPLACE_CATEGORIES.includes(explicitCategory)) return explicitCategory;

    const type = (item?.type || "").toLowerCase();
    const name = (item?.name || "").toLowerCase();
    if (type.includes("mentor") || type.includes("coach") || type.includes("expert") || type.includes("advisor") || type.includes("tutor") || type.includes("counselor")) return "mentors";
    if (type.includes("youtube") || type.includes("docs") || type.includes("community") || type.includes("book") || type.includes("library") || type.includes("article") || type.includes("guide")) return "distributors";
    if (type.includes("university") || type.includes("college") || type.includes("school") || type.includes("institute") || type.includes("academy")) return "institutions";
    if (name.includes("mentor") || name.includes("coach") || name.includes("advisor")) return "mentors";
    if (name.includes("youtube") || name.includes("book") || name.includes("guide") || name.includes("docs")) return "distributors";
    if (name.includes("university") || name.includes("college") || name.includes("institute")) return "institutions";
    return "vendors";
  }

  function filterMarketplaceItemsByCategory(items, category) {
    return (items || []).filter(item => classifyAdminMarketplaceItem(item) === category);
  }

  function renderMarketplaceCategoryTabs(milestoneId, col, generatedItems) {
    const activeCategory = getActiveMarketplaceCategory(milestoneId, col.key);
    return (
      <div className="market-category-tabs">
        {MARKETPLACE_CATEGORIES.map(category => {
          const count = filterMarketplaceItemsByCategory(generatedItems, category).length;
          return (
            <button
              key={category}
              className={`market-category-tab ${activeCategory === category ? "active" : ""}`}
              onClick={() => setActiveMarketplaceCategory(milestoneId, col.key, category)}
              type="button"
            >
              <span>{MARKETPLACE_CATEGORY_LABELS[category]}</span>
              <strong>{count}</strong>
            </button>
          );
        })}
      </div>
    );
  }

  function renderMarketCard(col, res, rIdx, mIdx) {
    const marketKey = col.marketKey;
    return (
      <div key={rIdx} className={`market-card ${col.colorClass}`}>
        <div className="market-card-head">
          <input
            className="market-name-input"
            placeholder="Resource / Provider name"
            value={res.name || ""}
            onChange={e => updateMarketItem(mIdx, marketKey, rIdx, "name", e.target.value)}
          />
          {!isReadOnly && (
            <button className="btn-icon-danger" title="Delete resource"
              onClick={() => deleteMarketItem(mIdx, marketKey, rIdx)}>
              <TrashIcon size={13} />
            </button>
          )}
        </div>

        {col.key === "macro" && (
          <>
            <div className="market-row2">
              <input placeholder="Type  (e.g. Video, Article)" value={res.type || ""}
                onChange={e => updateMarketItem(mIdx, marketKey, rIdx, "type", e.target.value)} />
              <input placeholder="Next Step" value={res.next_step || ""}
                onChange={e => updateMarketItem(mIdx, marketKey, rIdx, "next_step", e.target.value)} />
            </div>
            <textarea rows={2} placeholder="Why is this resource useful?"
              value={res.why || ""}
              onChange={e => updateMarketItem(mIdx, marketKey, rIdx, "why", e.target.value)} />
          </>
        )}

        {col.key === "micro" && (
          <>
            <div className="market-row3">
              <input placeholder="Type  (e.g. Course, Book)" value={res.type || ""}
                onChange={e => updateMarketItem(mIdx, marketKey, rIdx, "type", e.target.value)} />
              <input placeholder="Cost  (e.g. $15)" value={res.cost || ""}
                onChange={e => updateMarketItem(mIdx, marketKey, rIdx, "cost", e.target.value)} />
              <input placeholder="Duration  (e.g. 12 hrs)" value={res.duration || ""}
                onChange={e => updateMarketItem(mIdx, marketKey, rIdx, "duration", e.target.value)} />
            </div>
            <textarea rows={2} placeholder="Value proposition / what you'll gain"
              value={res.value || ""}
              onChange={e => updateMarketItem(mIdx, marketKey, rIdx, "value", e.target.value)} />
            <input placeholder="Next Step  (e.g. Enroll on Udemy)" value={res.next_step || ""}
              onChange={e => updateMarketItem(mIdx, marketKey, rIdx, "next_step", e.target.value)} />
          </>
        )}

        {col.key === "nano" && (
          <>
            <div className="market-row2">
              <input placeholder="Type  (e.g. Mentor, Counselor)" value={res.type || ""}
                onChange={e => updateMarketItem(mIdx, marketKey, rIdx, "type", e.target.value)} />
              <input placeholder="Price  (e.g. ₹500/session)" value={res.price || ""}
                onChange={e => updateMarketItem(mIdx, marketKey, rIdx, "price", e.target.value)} />
            </div>
            <textarea rows={2} placeholder="Expected outcomes from mentorship"
              value={res.expected_outcomes || ""}
              onChange={e => updateMarketItem(mIdx, marketKey, rIdx, "expected_outcomes", e.target.value)} />
            <input placeholder="Session format / details" value={res.session_details || ""}
              onChange={e => updateMarketItem(mIdx, marketKey, rIdx, "session_details", e.target.value)} />
          </>
        )}
      </div>
    );
  }

  function renderDirectoryMarketCard(col, item, idx) {
    return (
      <div key={`directory-${col.key}-${idx}`} className={`market-card market-card--directory ${col.colorClass}`}>
        <div className="market-card-head">
          <div>
            <div className="market-name">{item.name}</div>
            <div className="market-provider-role">{item.role}</div>
          </div>
          <span className="market-readonly-badge">Directory</span>
        </div>
        <div className="market-tags-row">
          {(item.tags || []).slice(0, 3).map((tag, tagIdx) => (
            <span key={tagIdx} className="market-tag">{tag}</span>
          ))}
        </div>
        <div className="market-directory-meta">
          <span>{item.category}</span>
          <strong>{item.price}</strong>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="page ar-page">

      {confirmModal && (
        <ConfirmModal message={confirmModal.message} onConfirm={confirmModal.onConfirm} onCancel={() => setConfirmModal(null)} />
      )}

      {/* ─── QUEUE VIEW ──────────────────────────────────────────────────── */}
      {!selectedPath ? (
        <div className="ar-queue-container">
          <div className="ar-header">
            <div>
              <div className="pill pill-teal" style={{ marginBottom: 12 }}>Human in the Loop</div>
              <h1 className="display-title" style={{ fontSize: 27 }}>Admin Review Curation</h1>
              <p className="ar-header-sub">Inspect AI-generated career paths, refine milestones, calibrate resources, and publish them to students.</p>
            </div>
          </div>

          {successMsg && (
            <div className="ar-success-alert card"><span className="success-dot" /><span>{successMsg}</span></div>
          )}

          <div className="ar-filters-bar card">
            <div className="ar-search-input-wrapper">
              <IconSearch size={16} />
              <input type="text" placeholder="Search by student, goal, or position..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
            <div className="ar-status-filters">
              <button className={`filter-btn ${filterStatus === "under_admin_review" ? "active" : ""}`} onClick={() => setFilterStatus("under_admin_review")}>
                Pending ({pathsQueue.filter(p => p.status === "under_admin_review").length})
              </button>
              <button className={`filter-btn ${filterStatus === "published" ? "active" : ""}`} onClick={() => setFilterStatus("published")}>
                Published ({pathsQueue.filter(p => p.status === "published").length})
              </button>
              <button className={`filter-btn ${filterStatus === "ai_learnings" ? "active" : ""}`} onClick={() => setFilterStatus("ai_learnings")} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <IconBrain size={14} /> AI Learnings ({feedbackList.length})
              </button>
            </div>
          </div>

          {loadingQueue ? (
            <div className="ar-loading-state card">
              <div className="dot-pulse"><span /><span /><span /></div>
              <p>Loading database records...</p>
            </div>
          ) : error ? (
            <div className="ar-error-card card">
              <IconAlert size={28} /><p>{error}</p>
              <button className="btn-primary" onClick={loadQueue} style={{ marginTop: 12 }}>Retry Connection</button>
            </div>
          ) : filterStatus === "ai_learnings" ? (
            feedbackList.length === 0 ? (
              <div className="ar-empty-state card" style={{ padding: 48 }}>
                <IconNavigation size={36} /><h3>No AI learnings registered yet</h3>
                <p>Provide feedback when curating/publishing pathways to build the AI's learning memory.</p>
              </div>
            ) : (
              <div className="ar-feedback-grid">
                {feedbackList.map((feedback) => (
                  <div key={feedback.id || feedback._id} className="ar-feedback-card card">
                    <div className="ar-feedback-header">
                      <span className={`pill-badge badge-category-${feedback.category || "general"}`}>
                        {feedback.category ? feedback.category.toUpperCase() : "GENERAL"}
                      </span>
                      <button className="btn-delete-feedback" onClick={() => handleDeleteFeedback(feedback.id || feedback._id)}>
                        <TrashIcon size={14} />
                      </button>
                    </div>
                    <div className="ar-feedback-body">
                      <p className="feedback-text">"{feedback.feedback_text}"</p>
                      <div className="feedback-meta">
                        <div className="meta-row"><strong>Target:</strong> <span>{feedback.target_goal}</span></div>
                        {feedback.student_profile && (
                          <div className="meta-row">
                            <strong>Profile:</strong>{" "}
                            <span>
                              {feedback.student_profile.grade ? `${feedback.student_profile.grade}th Grade` : ""}
                              {feedback.student_profile.curriculum ? ` • ${feedback.student_profile.curriculum}` : ""}
                              {feedback.student_profile.stream ? ` • ${feedback.student_profile.stream}` : ""}
                            </span>
                          </div>
                        )}
                        <div className="meta-row font-small">
                          <span>By {feedback.admin_email}</span>
                          <span>{feedback.timestamp ? new Date(feedback.timestamp).toLocaleDateString() : "Just now"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : filteredPaths.length === 0 ? (
            <div className="ar-empty-state card">
              <IconNavigation size={36} /><h3>No career paths found</h3>
              <p>Generate a career roadmap from the dashboard to populate the queue.</p>
            </div>
          ) : (
            <div className="ar-queue-grid">
              {filteredPaths.map(path => {
                const dateStr = path.created_at ? new Date(path.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "Just now";
                return (
                  <div key={path.id} className={`ar-queue-card card status-${path.status}`}>
                    <div className="ar-q-top">
                      <div className="ar-q-student">
                        <IconNavigation size={14} style={{ color: "var(--accent)" }} />
                        <div className="ar-q-student-info">
                          <strong>{path.status === "published" ? "Published Pathway" : "Pathway Curation"}</strong>
                          <span className="ar-q-date">{dateStr}</span>
                        </div>
                      </div>
                      <button className="btn-pdf-pill" onClick={() => handleExportPdf(path)} disabled={pdfLoading}>
                        {pdfLoading ? "..." : <><ExportIcon size={12} /><span>PDF</span></>}
                      </button>
                    </div>
                    <div className="ar-q-route">
                      <div className="ar-q-point"><span className="q-dot green" /><span>{path.current_position}</span></div>
                      <div className="ar-q-spine" />
                      <div className="ar-q-point"><span className="q-dot red" /><strong>{path.target_goal}</strong></div>
                    </div>
                    <div className="ar-q-meta">
                      <div className="meta-item"><span>Grade</span><span>{path.profile?.grade || "N/A"}</span></div>
                      <div className="meta-item"><span>Board</span><span>{path.profile?.curriculum || "N/A"}</span></div>
                      <div className="meta-item">
                        <span>Readiness</span>
                        <strong className="green-text">
                          {path.roadmap_data?.alternatives
                            ? `${path.roadmap_data.alternatives[0]?.readiness_score || 0}%`
                            : `${path.roadmap_data?.readiness_score || 0}%`}
                        </strong>
                      </div>
                      <div className="meta-item">
                        <span>Duration</span>
                        <span>
                          {path.roadmap_data?.alternatives
                            ? path.roadmap_data.alternatives[0]?.total_duration
                            : path.roadmap_data?.total_duration}
                        </span>
                      </div>
                    </div>
                    <button className="ar-q-btn" onClick={() => selectPathForReview(path)}>
                      {path.status === "published" ? "View Published →" : "Audit & Curate →"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      ) : (
        /* ─── EDITOR VIEW ──────────────────────────────────────────────── */
        <div className="ar-editor-container">

          {/* Header */}
          <div className="ar-editor-header">
            <button className="btn-back" onClick={returnToQueue}>
              <IconArrowLeft size={16} /> Back to Queue
            </button>
            <div className="editor-title-row">
              <div>
                <h1>{isReadOnly ? "Viewing Pathway" : "Curating Pathway"}</h1>
                <p>{isReadOnly ? "Published & locked — read-only view." : "Edit milestones, views, and marketplace resources. All changes auto-save to database."}</p>
              </div>
              <div className="editor-title-actions">
                <button
                  className="btn-edit-section"
                  onClick={() => setShowHistory(h => !h)}
                  title={showHistory ? "Hide curation history" : "Show curation history"}
                  style={{ gap: 6, minWidth: 148 }}
                >
                  <ClockIcon size={13} />
                  {showHistory ? "Hide History" : "Curation History"}
                  {selectedPath?.modifications?.length > 0 && (
                    <span style={{
                      background: "#f59e0b", color: "#fff",
                      borderRadius: "999px", fontSize: 10,
                      padding: "1px 6px", fontWeight: 700, marginLeft: 2
                    }}>
                      {selectedPath.modifications.length}
                    </span>
                  )}
                </button>
                <button className="btn-pdf" onClick={() => handleExportPdf()} disabled={pdfLoading}>
                  {pdfLoading ? "Generating..." : <><ExportIcon size={14} /><span>Export PDF</span></>}
                </button>
              </div>
            </div>
          </div>

          {successMsg && (
            <div className="ar-success-alert card" style={{ marginBottom: 16 }}><span className="success-dot" /><span>{successMsg}</span></div>
          )}
          {error && (
            <div className="ar-error-inline"><IconAlert size={14} />{error}</div>
          )}

          {/* Alternatives selector tabs */}
          {editedRoadmap.alternatives && (
            <div className="ar-alt-tabs-container">
              <span className="ar-alt-tabs-label">Strategic Pathway Options</span>
              <div className="ar-alt-tabs">
                {editedRoadmap.alternatives.map((alt, idx) => (
                  <button
                    key={idx}
                    className={`ar-alt-tab-btn ${activeAltIdx === idx ? 'active' : ''}`}
                    onClick={() => {
                      setActiveAltIdx(idx);
                      setEditingDetails(false);
                      setEditingMilestoneIdx(null);
                      setTempMilestone(null);
                    }}
                  >
                    <span className="tab-dot" />
                    {alt.option_name || `Option ${idx + 1}`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Global Metrics ──────────────────────────────────────────── */}
          <div className="ar-editor-stats-card card">
            <div className="stats-card-header">
              <div className="section-label" style={{ marginBottom: 0 }}>Global Metrics</div>
              {!isReadOnly && !editingDetails && (
                <button className="btn-edit-section" onClick={startEditDetails}><EditIcon size={13} /> Edit Details</button>
              )}
            </div>

            {!editingDetails ? (
              <div className="stats-read-grid">
                <div className={`stat-read-item span-2${isFieldEdited("path_title", activeRoadmap.path_title) ? " edited-field-highlight" : ""}`}>
                  <span>Pathway Title {isFieldEdited("path_title", activeRoadmap.path_title) && <span className="badge-edited" style={{ display: "inline-flex", alignItems: "center", gap: 3 }}><EditIcon size={10} /> Edited</span>
                  }</span>
                  <strong>{activeRoadmap.path_title || `Pathway to ${selectedPath.target_goal}`}</strong>
                </div>
                <div className={`stat-read-item span-2${isFieldEdited("path_description", activeRoadmap.path_description) ? " edited-field-highlight" : ""}`}>
                  <span>Description {isFieldEdited("path_description", activeRoadmap.path_description) && <span className="badge-edited" style={{ display: "inline-flex", alignItems: "center", gap: 3 }}><EditIcon size={10} /> Edited</span>
                  }</span>
                  <p className="stat-desc">{activeRoadmap.path_description || "No description."}</p>
                </div>
                <div className={`stat-read-item${isFieldEdited("readiness_score", activeRoadmap.readiness_score) ? " edited-field-highlight" : ""}`}>
                  <span>Readiness Score {isFieldEdited("readiness_score", activeRoadmap.readiness_score) && <span className="badge-edited" style={{ display: "inline-flex", alignItems: "center" }}><EditIcon size={10} /></span>
                  }</span>
                  <strong className="green-text">{activeRoadmap.readiness_score}%</strong>
                </div>
                <div className={`stat-read-item${isFieldEdited("readiness_label", activeRoadmap.readiness_label) ? " edited-field-highlight" : ""}`}>
                  <span>Readiness Label {isFieldEdited("readiness_label", activeRoadmap.readiness_label) && <span className="badge-edited" style={{ display: "inline-flex", alignItems: "center" }}><EditIcon size={10} /></span>
                  }</span>
                  <span>{activeRoadmap.readiness_label}</span>
                </div>
                <div className={`stat-read-item${isFieldEdited("total_duration", activeRoadmap.total_duration) ? " edited-field-highlight" : ""}`}>
                  <span>Total Duration {isFieldEdited("total_duration", activeRoadmap.total_duration) && <span className="badge-edited" style={{ display: "inline-flex", alignItems: "center" }}><EditIcon size={10} /></span>
                  }</span>
                  <span>{activeRoadmap.total_duration}</span>
                </div>
              </div>
            ) : (
              <div className="stats-edit-form">
                <div className="edit-row-2">
                  <div className="stat-edit-field">
                    <label>Pathway Title</label>
                    <input type="text" value={tempDetails.path_title} onChange={e => setTempDetails(p => ({ ...p, path_title: e.target.value }))} placeholder="e.g. Academic Pathway to Oxford" />
                  </div>
                  <div className="stat-edit-field">
                    <label>Pathway Description</label>
                    <textarea rows={2} value={tempDetails.path_description} onChange={e => setTempDetails(p => ({ ...p, path_description: e.target.value }))} />
                  </div>
                </div>
                <div className="edit-row-3">
                  <div className="stat-edit-field">
                    <label>Readiness Score (0–100)</label>
                    <input type="number" min="0" max="100" value={tempDetails.readiness_score} onChange={e => setTempDetails(p => ({ ...p, readiness_score: parseInt(e.target.value) || 0 }))} />
                  </div>
                  <div className="stat-edit-field">
                    <label>Readiness Label</label>
                    <input type="text" value={tempDetails.readiness_label} onChange={e => setTempDetails(p => ({ ...p, readiness_label: e.target.value }))} />
                  </div>
                  <div className="stat-edit-field">
                    <label>Total Duration</label>
                    <input type="text" value={tempDetails.total_duration} onChange={e => setTempDetails(p => ({ ...p, total_duration: e.target.value }))} />
                  </div>
                </div>
                <div className="form-action-row">
                  <button className="btn-cancel-section" onClick={() => setEditingDetails(false)}>Cancel</button>
                  <button className="btn-save-section" onClick={saveDetails} disabled={loadingSubmit}>
                    {loadingSubmit ? "Saving..." : "Save Details"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Two-column layout: Milestones + History Sidebar ──────────── */}
          <div className={showHistory ? "ar-editor-layout" : ""}>

            {/* Main content column */}
            <div>
              {/* ── Milestones ───────────────────────────────────────────── */}
              <div className="ar-milestones-editor-list">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div className="section-label" style={{ margin: 0 }}>Milestones & Resources</div>
                  {!isReadOnly && (
                    <button className="btn-add-step" onClick={addMilestone} disabled={loadingSubmit}>
                      <PlusIcon size={14} /> Add New Step
                    </button>
                  )}
                </div>

                {activeRoadmap.steps?.map((milestone, mIdx) => {
                  const isEditing = editingMilestoneIdx === mIdx;
                  const activeMilestone = isEditing ? tempMilestone : milestone;
                  const stepAdded = isStepAdded(milestone.id);
                  const hasAnyEdit = !stepAdded && [
                    `steps.${milestone.id}.title`,
                    `steps.${milestone.id}.duration`,
                    `steps.${milestone.id}.description`,
                    `steps.${milestone.id}.macro_view`,
                    `steps.${milestone.id}.micro_view`,
                    `steps.${milestone.id}.nano_view`,
                  ].some(fp => {
                    const field = fp.split(".")[2];
                    const value = ["macro_view", "micro_view", "nano_view"].includes(field)
                      ? getViewDescription(milestone, field)
                      : milestone[field];
                    return isFieldEdited(fp, value);
                  });

                  return (
                    <div
                      key={milestone.id}
                      className={`ar-editor-milestone-card card ${isEditing ? "editing" : ""}`}
                      style={stepAdded
                        ? { borderLeftColor: "var(--green)", background: "#f0fdf4" }
                        : hasAnyEdit ? { borderLeftColor: "#f59e0b" } : {}}
                    >
                      {/* Milestone Header */}
                      <div className="m-header">
                        <div className="m-number" style={stepAdded ? { background: "var(--green)" } : hasAnyEdit ? { background: "#f59e0b" } : {}}>{milestone.id}</div>

                        {!isEditing ? (
                          <div className="m-title-view">
                            <div className="m-title-row-view">
                              <h2>{milestone.title || <em className="placeholder-text">Untitled Step</em>}</h2>
                              <span className="m-dur-badge">{milestone.duration}</span>
                              {stepAdded && <span className="badge-added" style={{ display: "inline-flex", alignItems: "center", gap: 3 }}><PlusIcon size={10} /> Added</span>}
                              {!stepAdded && hasAnyEdit && <span className="badge-edited" style={{ display: "inline-flex", alignItems: "center", gap: 3 }}><EditIcon size={10} /> Edited</span>}
                            </div>
                            <p className="m-desc-text">{milestone.description}</p>
                          </div>
                        ) : (
                          <div className="m-title-fields">
                            <div className="m-title-input-row">
                              <input className="m-title-input" placeholder="Step Title" value={activeMilestone.title} onChange={e => handleTempMilestoneChange("title", e.target.value)} />
                              <input className="m-duration-input" placeholder="e.g. Months 1–3" value={activeMilestone.duration} onChange={e => handleTempMilestoneChange("duration", e.target.value)} />
                            </div>
                            <textarea className="m-desc-input" rows={2} placeholder="Step description..." value={activeMilestone.description} onChange={e => handleTempMilestoneChange("description", e.target.value)} />
                          </div>
                        )}

                        {!isReadOnly && (
                          <div className="m-header-actions">
                            {!isEditing ? (
                              <>
                                <button className="btn-edit-section" onClick={() => startEditMilestone(mIdx)}><EditIcon size={13} /> Edit</button>
                                <button className="btn-icon-danger" title="Delete step" onClick={() => confirmDeleteMilestone(mIdx)}><TrashIcon size={14} /></button>
                              </>
                            ) : null}
                          </div>
                        )}
                      </div>

                      {/* 3 View Columns */}
                      <div className="milestone-views-columns">
                        {COL_DEFS.map(col => {
                          const isExp = expandedMarkets[`${milestone.id}_${col.key}`];
                          const generatedItems = activeMilestone.marketplace?.[col.marketKey] || [];
                          const count = generatedItems.length;
                          const activeCategory = getActiveMarketplaceCategory(milestone.id, col.key);
                          const visibleGeneratedItems = filterMarketplaceItemsByCategory(generatedItems, activeCategory);
                          const visibleCount = visibleGeneratedItems.length;
                          return (
                            <div key={col.key} className={`view-column ${col.colorClass}`}>
                              <div className="view-desc-box">
                                <span className="view-lbl">{col.label}</span>
                                <span className="view-sublbl">{col.sublabel}</span>
                                {isEditing ? (
                                  <textarea value={getViewDescription(activeMilestone, col.viewKey)} onChange={e => handleTempMilestoneChange(col.viewKey, e.target.value)} rows={4} placeholder={`${col.label} description...`} />
                                ) : (
                                  <p className="view-read-text">{getViewDescription(activeMilestone, col.viewKey) || "No description."}</p>
                                )}
                              </div>
                              <button
                                className={`btn-toggle-marketplace ${col.colorClass} ${isExp ? "expanded" : ""}`}
                                onClick={() => toggleMarketplace(milestone.id, col.key)}
                              >
                                <span>{isExp ? "Hide" : `Resources (${count})`}</span>
                                <ChevronDown size={12} />
                              </button>
                              {isExp && (
                                <div className={`marketplace-panel marketplace-panel--mobile ${col.colorClass}`}>
                                  <div className="marketplace-panel-head">
                                    <span className={`market-panel-title ${col.colorClass}`}>{col.marketLabel}</span>
                                    {!isReadOnly && (
                                      <div className="marketplace-panel-actions">
                                        <button
                                          className={`btn-regenerate-market ${col.colorClass}`}
                                          onClick={() => regenerateMarketplaceCategory(mIdx, col, activeCategory)}
                                          disabled={loadingSubmit || regeneratingMarketplaceKey === `${milestone.id}_${col.marketKey}_${activeCategory}`}
                                        >
                                          <RotateCwIcon size={12} />
                                          {regeneratingMarketplaceKey === `${milestone.id}_${col.marketKey}_${activeCategory}` ? "Regenerating..." : `Regenerate ${MARKETPLACE_CATEGORY_LABELS[activeCategory]}`}
                                        </button>
                                        <button className={`btn-add-resource ${col.colorClass}`} onClick={() => addMarketItem(mIdx, col.marketKey, activeCategory)}>
                                          <PlusIcon size={12} /> Add {MARKETPLACE_CATEGORY_LABELS[activeCategory].slice(0, -1)}
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                  {renderMarketplaceCategoryTabs(milestone.id, col, generatedItems)}
                                  <div className="market-cards-grid">
                                    {visibleGeneratedItems.map((res) => renderMarketCard(col, res, generatedItems.indexOf(res), mIdx))}
                                    {visibleCount === 0 && (
                                      <div className="no-resources-msg">No resources yet. Click "+ Add Resource" to create one.</div>
                                    )}
                                  </div>
                                  {!isReadOnly && visibleGeneratedItems.length > 0 && (
                                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
                                      <button className="btn-save-section" onClick={() => saveMarketItemDirect(mIdx)} disabled={loadingSubmit}>
                                        {loadingSubmit ? "Saving..." : "Save Marketplace Changes"}
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Desktop marketplace panels */}
                      {COL_DEFS.map(col => {
                        const isExp = expandedMarkets[`${milestone.id}_${col.key}`];
                        if (!isExp) return null;
                        const items = activeMilestone.marketplace?.[col.marketKey] || [];
                        const activeCategory = getActiveMarketplaceCategory(milestone.id, col.key);
                        const visibleItems = filterMarketplaceItemsByCategory(items, activeCategory);
                        const visibleTotalCount = visibleItems.length;
                        return (
                          <div key={col.key} className={`marketplace-panel marketplace-panel--desktop ${col.colorClass}`}>
                            <div className="marketplace-panel-head">
                              <span className={`market-panel-title ${col.colorClass}`}>{col.marketLabel}</span>
                              {!isReadOnly && (
                                <div className="marketplace-panel-actions">
                                  <button
                                    className={`btn-regenerate-market ${col.colorClass}`}
                                    onClick={() => regenerateMarketplaceCategory(mIdx, col, activeCategory)}
                                    disabled={loadingSubmit || regeneratingMarketplaceKey === `${milestone.id}_${col.marketKey}_${activeCategory}`}
                                  >
                                    <RotateCwIcon size={12} />
                                    {regeneratingMarketplaceKey === `${milestone.id}_${col.marketKey}_${activeCategory}` ? "Regenerating..." : `Regenerate ${MARKETPLACE_CATEGORY_LABELS[activeCategory]}`}
                                  </button>
                                  <button className={`btn-add-resource ${col.colorClass}`} onClick={() => addMarketItem(mIdx, col.marketKey, activeCategory)}>
                                    <PlusIcon size={12} /> Add {MARKETPLACE_CATEGORY_LABELS[activeCategory].slice(0, -1)}
                                  </button>
                                </div>
                              )}
                            </div>
                            {renderMarketplaceCategoryTabs(milestone.id, col, items)}
                            <div className="market-cards-grid">
                              {visibleItems.map((res) => renderMarketCard(col, res, items.indexOf(res), mIdx))}
                              {visibleTotalCount === 0 && (
                                <div className="no-resources-msg">No resources yet. Click "+ Add Resource" to create one.</div>
                              )}
                            </div>
                            {!isReadOnly && visibleItems.length > 0 && (
                              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
                                <button className="btn-save-section" onClick={() => saveMarketItemDirect(mIdx)} disabled={loadingSubmit}>
                                  {loadingSubmit ? "Saving..." : "Save Marketplace Changes"}
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {/* Step edit action row */}
                      {isEditing && (
                        <div className="step-edit-actions">
                          <button className="btn-cancel-section" onClick={cancelEditMilestone}>Cancel</button>
                          <button className="btn-save-section" onClick={() => saveMilestone(mIdx)} disabled={loadingSubmit}>
                            {loadingSubmit ? "Saving..." : "Save Step"}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}

                {(!activeRoadmap.steps || activeRoadmap.steps.length === 0) && (
                  <div className="ar-empty-state card" style={{ padding: 32 }}>
                    <p style={{ color: "var(--text3)" }}>No milestones yet. Click "Add New Step" to create the first one.</p>
                  </div>
                )}
              </div>

              {/* ── Action Row ────────────────────────────────────────────── */}
              <div className="editor-action-card card">
                {isReadOnly ? (
                  <div className="editor-submit-box">
                    <h3>Published & Locked</h3>
                    <p>This roadmap has been published to the student portal. Return to the queue below.</p>
                    <div className="editor-submit-btns">
                      <button className="btn-primary" onClick={returnToQueue}>← Return to Queue</button>
                    </div>
                  </div>
                ) : (
                  <div className="editor-submit-box">
                    <h3>Approve Curation</h3>
                    <p>Publishing marks this path as officially published. It unlocks immediately in the student's dashboard.</p>

                    <div className="feedback-learning-box" style={{ marginTop: 16, marginBottom: 20, textAlign: "left" }}>
                      <label style={{ fontWeight: "600", fontSize: 13.5, display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 6, color: "var(--text1)" }}>
                        <IconBulb size={15} style={{ color: "#eab308" }} /> Add to AI Learning Memory (Optional)
                      </label>
                      <p style={{ fontSize: 11, color: "var(--text3)", margin: "0 0 10px 0", lineHeight: 1.4 }}>
                        Specify guidelines, curriculum standards, or resource adjustments. Navi Agent will apply this feedback during future generations for matching student profiles.
                      </p>
                      <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                        <select
                          value={feedbackCategory}
                          onChange={(e) => setFeedbackCategory(e.target.value)}
                          style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--bg2)", color: "var(--text1)", fontSize: 12, outline: "none", cursor: "pointer" }}
                        >
                          <option value="general">General Guideline</option>
                          <option value="academics">Academics & Study Plan</option>
                          <option value="resources">Marketplace Resources</option>
                          <option value="timeline">Timeline & Milestones</option>
                        </select>
                      </div>
                      <textarea
                        placeholder="e.g., For IB students aiming for top-tier CS programs, add a research methodology milestone in the first 6 months and suggest Coursera data structures."
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        rows={3}
                        style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid var(--border)", background: "var(--bg2)", color: "var(--text1)", fontSize: 12.5, resize: "vertical", boxSizing: "border-box", fontFamily: "inherit" }}
                      />
                    </div>

                    <div className="editor-submit-btns">
                      <button className="btn-secondary" onClick={returnToQueue} disabled={loadingSubmit}>Close & Return</button>
                      <button className="btn-primary approve-btn" onClick={() => submitReview(STATUS.published)} disabled={loadingSubmit}>
                        {loadingSubmit ? "Publishing..." : "Approve & Publish Roadmap"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>{/* end main content column */}

            {/* ── Curation History Sidebar ───────────────────────────────── */}
            {showHistory && (
              <CurationHistorySidebar path={selectedPath} />
            )}

          </div>{/* end ar-editor-layout */}

        </div>
      )}
    </div>
  );
}
