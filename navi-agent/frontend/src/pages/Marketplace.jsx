import { useMemo, useState } from "react";
import {
  IconBuilding,
  IconPackage,
  IconSearch,
  IconStar,
  IconUser,
  IconUsers,
} from "./Icons";

const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://127.0.0.1:8001" : "");

const CATEGORIES = [
  { key: "mentors", label: "Mentors", Icon: IconUser, tag: "pill-coral" },
  { key: "vendors", label: "Vendors", Icon: IconPackage, tag: "pill-teal" },
  { key: "institutions", label: "Institutions", Icon: IconBuilding, tag: "pill-blue" },
  { key: "distributors", label: "Distributors", Icon: IconUsers, tag: "pill-lavender" },
];

// view: "macro" = free only, "micro"/"nano" = paid options shown
export const MOCK_DATA = {
  mentors: [],
  vendors: [],
  institutions: [],
  distributors: [],
};

export function getPriceForView(item, view) {
  if (view === "macro") return item.macro_price;
  if (view === "micro") return item.micro_price;
  return item.nano_price;
}

function getCtaLabel(category, view) {
  if (category === "mentors") {
    if (view === "macro") return "Get Free Tips";
    return "Book Session";
  }
  if (category === "institutions") {
    if (view === "macro") return "Explore Free";
    return "Learn More";
  }
  if (view === "macro") return "Access Free";
  return "Visit Platform";
}

function classifyMarketplaceItem(item) {
  const explicitCategory = (item.category || "").toLowerCase();
  if (CATEGORIES.some(category => category.key === explicitCategory)) return explicitCategory;

  const type = (item.type || "").toLowerCase();
  const name = (item.name || "").toLowerCase();
  if (type.includes("mentor") || type.includes("coach") || type.includes("expert") || type.includes("advisor") || type.includes("tutor") || type.includes("specialist") || type.includes("counselor") || type.trim() === "expert review") return "mentors";
  if (type.includes("course") || type.includes("platform") || type.includes("certification") || type.includes("bootcamp") || type.includes("prep") || type.includes("provider")) return "vendors";
  if (type.includes("youtube") || type.includes("docs") || type.includes("community") || type.includes("book") || type.includes("library") || type.includes("articles") || type.includes("github") || type.includes("publication") || type.includes("channel") || type.includes("guide")) return "distributors";
  if (type.includes("university") || type.includes("college") || type.includes("school") || type.includes("institute") || type.includes("academy")) return "institutions";
  if (name.includes("mentor") || name.includes("coach") || name.includes("counselor") || name.includes("advisor")) return "mentors";
  if (name.includes("youtube") || name.includes("docs") || name.includes("community") || name.includes("book") || name.includes("library") || name.includes("articles") || name.includes("github") || name.includes("publication") || name.includes("channel") || name.includes("guide")) return "distributors";
  if (name.includes("university") || name.includes("college") || name.includes("institute")) return "institutions";
  return "vendors";
}

function getSectionForView(view) {
  if (view === "macro") return "macro_free";
  if (view === "micro") return "micro_structured";
  return "nano_expert";
}

function RotateCwIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 4v6h-6" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  );
}

function getViewMarketplaceItems(step, view, category) {
  if (!step) return [];

  // --- NEW SCHEMA: nested view marketplaces ---
  // macro_view.marketplace = { mentors, vendors, institutions, distributors }
  // Also tolerate the earlier list-shaped marketplace while records migrate.
  let viewItems = [];
  const itemsFromViewMarketplace = (marketplace) => {
    if (Array.isArray(marketplace)) return marketplace;
    if (marketplace && typeof marketplace === "object") {
      return category && Array.isArray(marketplace[category])
        ? marketplace[category]
        : Object.values(marketplace).flatMap(items => Array.isArray(items) ? items : []);
    }
    return [];
  };

  if (view === "macro" && step.macro_view?.marketplace) {
    viewItems = itemsFromViewMarketplace(step.macro_view.marketplace);
  } else if (view === "micro" && step.micro_view?.marketplace) {
    viewItems = itemsFromViewMarketplace(step.micro_view.marketplace);
  } else if (view === "nano" && step.nano_view?.marketplace) {
    viewItems = itemsFromViewMarketplace(step.nano_view.marketplace);
  }

  if (viewItems.length > 0) {
    // Filter by category if set
    if (category) {
      return viewItems.filter(item => classifyMarketplaceItem(item) === category);
    }
    return viewItems;
  }

  // --- LEGACY FALLBACK: flat step.marketplace by section ---
  if (step.marketplace) {
    const section = getSectionForView(view);
    const providerItems = Array.isArray(step.marketplace[category])
      ? step.marketplace[category].filter(item => !item.section || item.section === section || item.view === view)
      : [];
    if (providerItems.length > 0) return providerItems;
    const legacyItems = Array.isArray(step.marketplace[section]) ? step.marketplace[section] : [];
    return legacyItems.filter(item => classifyMarketplaceItem(item) === category);
  }

  return [];
}


export default function Marketplace({ step, view, userInput, profile, onStepPatched }) {
  const [activeCategory, setActiveCategory] = useState("mentors");
  const [activeView, setActiveView] = useState(view || "macro");
  const [search, setSearch] = useState("");
  const [regeneratingItemKey, setRegeneratingItemKey] = useState("");
  const [regenError, setRegenError] = useState("");
  const [regenSuccess, setRegenSuccess] = useState("");

  const availableCats = CATEGORIES;

  // Coerce category state to first available if activeCategory is not in the list
  const currentCategory = useMemo(() => {
    if (availableCats.some(c => c.key === activeCategory)) {
      return activeCategory;
    }
    return availableCats[0]?.key || "vendors";
  }, [availableCats, activeCategory]);

  const handleViewChange = (newView) => {
    setActiveView(newView);
    setSearch("");
    setRegenError("");
    setRegenSuccess("");
  };

  const items = useMemo(() => {
    const matchedDynamic = [];

    const rawItems = getViewMarketplaceItems(step, activeView, currentCategory);

    rawItems.forEach((item, sourceIndex) => {
      const price = item.discount || item.cost || item.price || (activeView === "macro" ? "Free" : "Varies");
      matchedDynamic.push({
        sourceIndex,
        name: item.name,
        role: item.structure || item.type || (currentCategory === "mentors" ? "Expert Guide" : "Learning Resource"),
        why: item.why || item.value || item.expected_outcomes || "",
        next_step: item.next_step || item.session_details || "",
        tags: item.tags || [],
        price: price,
        rating: item.rating || "4.8",
        sessions: item.sessions || (currentCategory === "mentors" ? 42 : null),
        avatar: item.name.split(" ").map(w => w[0]).join("").substring(0, 2).toUpperCase(),
        isRecommended: true,
      });
    });

    const combined = matchedDynamic;

    // Apply search filter
    return combined.filter(item => {
      if (!search.trim()) return true;
      const hay = `${item.name} ${item.role} ${item.tags.join(" ")} ${item.why} ${item.next_step}`.toLowerCase();
      return hay.includes(search.toLowerCase());
    });
  }, [step, currentCategory, activeView, search]);


  const activeCat = CATEGORIES.find(c => c.key === currentCategory);

  const handleRegenerateMarketplaceItem = async (item) => {
    if (!step || regeneratingItemKey) return;
    const itemKey = `${activeView}_${currentCategory}_${item.sourceIndex}`;
    setRegeneratingItemKey(itemKey);
    setRegenError("");
    setRegenSuccess("");

    try {
      const categoryLabel = activeCat?.label || currentCategory;
      const res = await fetch(`${API}/api/path/patch-step`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step_id: step.id,
          field: "marketplace",
          instruction: `Generate one next-best replacement for "${item.name}" in the ${categoryLabel} marketplace cards for this ${activeView} step view. Replace only this card with a fresh alternative that is more relevant and useful.`,
          current_step: step,
          current_position: userInput?.current || "",
          target_goal: userInput?.goal || "",
          profile: profile || {},
          marketplace_section: getSectionForView(activeView),
          marketplace_category: currentCategory,
          marketplace_item_index: item.sourceIndex,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.detail || "Marketplace regeneration failed");
      }

      const patchResult = await res.json();
      if (patchResult.updated_step && onStepPatched) {
        onStepPatched(step.id, "__step__", patchResult.updated_step);
      }
      setSearch("");
      setRegenSuccess(`${item.name} was replaced with a next-best ${categoryLabel} option.`);
    } catch (err) {
      setRegenError(err.message || "Marketplace regeneration failed. Please try again.");
    } finally {
      setRegeneratingItemKey("");
    }
  };

  const { recommendedItems, standardItems } = useMemo(() => {
    const recommended = [];
    const standard = [];

    items.forEach(item => {
      if (item.isRecommended) {
        recommended.push(item);
      } else {
        standard.push(item);
      }
    });

    return { recommendedItems: recommended, standardItems: standard };
  }, [items]);

  return (
    <div className="page">

      {/* Header */}
      <div className="mp-header">
        <h2 className="display-title" style={{ fontSize: 32 }}>Marketplace</h2>
        {step && (
          <p style={{ fontSize: 14, color: "var(--text2)", marginTop: 8, lineHeight: 1.6 }}>
            Resources for <strong>{step.title}</strong>
          </p>
        )}
      </div>

      {/* View tabs: macro / micro / nano */}
      <div className="mp-view-tabs">
        {[
          { key: "macro", label: "Free resources", desc: "No cost options" },
          { key: "micro", label: "Structured", desc: "Paid courses & tools" },
          { key: "nano", label: "Expert 1:1", desc: "Mentors & coaching" },
        ]
          .filter(v => !view || v.key === view)
          .map(v => (
            <button
              key={v.key}
              className={`mp-view-btn ${activeView === v.key ? "mp-view-btn--active" : ""}`}
              onClick={() => handleViewChange(v.key)}
            >
              <span className="mp-view-label">{v.label}</span>
              <span className="mp-view-desc">{v.desc}</span>
            </button>
          ))}
      </div>

      {/* Category tabs */}
      <div className="mp-cats">
        {availableCats.map(cat => (
          <button
            key={cat.key}
            className={`mp-cat-btn ${currentCategory === cat.key ? "mp-cat-btn--active" : ""}`}
            onClick={() => { setActiveCategory(cat.key); setSearch(""); setRegenError(""); setRegenSuccess(""); }}
          >
            <span className="mp-cat-icon"><cat.Icon size={16} /></span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="mp-search-row">
        <div className="mp-search-wrap">
          <IconSearch size={15} color="var(--text3)" />
          <input
            className="mp-search-input"
            placeholder={`Search ${activeCat?.label.toLowerCase()}...`}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {(regenError || regenSuccess) && (
        <div className={`mp-regen-status ${regenError ? "error" : "success"}`}>
          {regenError || regenSuccess}
        </div>
      )}

      {/* Count */}
      <div className="section-label" style={{ marginBottom: 16 }}>
        {items.length} {activeCat?.label.toLowerCase()} · {activeView === "macro" ? "free options" : activeView === "micro" ? "structured options" : "expert options"}
      </div>

      {/* Recommended Section */}
      {recommendedItems.length > 0 && (
        <div className="mp-section" style={{ marginBottom: 28 }}>
          <div className="mp-section-title">✨ Recommended for this Step</div>
          <div className="mp-recommended-grid">
            {recommendedItems.map((item, i) => {
              const price = item.price;
              const isFree = price?.toLowerCase().includes("free") || price?.toLowerCase().includes("free");
              return (
                <div key={i} className="mp-card card card-clickable mp-card--recommended">
                  <div className="mp-recommended-badge">✨ AI Recommended</div>

                  <div className="mp-card-top">
                    <div className="mp-avatar">{item.avatar}</div>
                    <div className="mp-card-info">
                      <div className="mp-card-name">{item.name}</div>
                      <div className="mp-card-role">{item.role}</div>
                    </div>
                  </div>

                  <div className="mp-card-tags">
                    {item.tags.map((t, j) => (
                      <span key={j} className={`pill ${["pill-teal", "pill-blue", "pill-lavender"][j % 3]}`}>{t}</span>
                    ))}
                  </div>

                  <div className="mp-card-details">
                    {item.why && (
                      <div className="mp-detail-row">
                        <span className="mp-detail-lbl">Why it fits</span>
                        <span className="mp-detail-val">{item.why}</span>
                      </div>
                    )}
                    {item.next_step && (
                      <div className="mp-detail-row">
                        <span className="mp-detail-lbl">Next Action</span>
                        <span className="mp-detail-val">{item.next_step}</span>
                      </div>
                    )}
                  </div>

                  <div className="mp-card-bottom">
                    <div className="mp-card-rating">
                      <IconStar size={13} fill="var(--amber)" color="var(--amber)" />
                      <span>{item.rating}</span>
                      {item.sessions && <span className="mp-sessions">· {item.sessions} sessions</span>}
                    </div>
                    <div className="mp-card-price-line">
                      <span className="mp-price-lbl">Investment</span>
                      <span className={`mp-card-price ${isFree ? "mp-price-free" : ""}`}>{price}</span>
                    </div>
                  </div>

                  <button className="btn-primary mp-connect-btn">
                    {getCtaLabel(currentCategory, activeView)}
                  </button>
                  <button
                    className="mp-card-regenerate-btn"
                    onClick={() => handleRegenerateMarketplaceItem(item)}
                    disabled={!!regeneratingItemKey || !step}
                    type="button"
                  >
                    <RotateCwIcon size={14} />
                    {regeneratingItemKey === `${activeView}_${currentCategory}_${item.sourceIndex}` ? "Generating..." : "Generate Next Best"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Directory Section */}
      {standardItems.length > 0 && (
        <div className="mp-section">
          {recommendedItems.length > 0 && (
            <div className="mp-section-title" style={{ marginTop: 24 }}>All Providers</div>
          )}
          <div className="mp-grid">
            {standardItems.map((item, i) => {
              const price = item.price;
              const isFree = price?.toLowerCase().includes("free") || price?.toLowerCase().includes("free");
              return (
                <div key={i} className="mp-card card card-clickable">
                  <div className="mp-card-top">
                    <div className="mp-avatar">{item.avatar}</div>
                    <div className="mp-card-info">
                      <div className="mp-card-name">{item.name}</div>
                      <div className="mp-card-role">{item.role}</div>
                    </div>
                  </div>

                  <div className="mp-card-tags">
                    {item.tags.map((t, j) => (
                      <span key={j} className={`pill ${["pill-teal", "pill-blue", "pill-lavender"][j % 3]}`}>{t}</span>
                    ))}
                  </div>

                  <div className="mp-card-bottom">
                    <div className="mp-card-rating">
                      <IconStar size={13} fill="var(--amber)" color="var(--amber)" />
                      <span>{item.rating}</span>
                      {item.sessions && <span className="mp-sessions">· {item.sessions} sessions</span>}
                    </div>
                    <div className="mp-card-price-line">
                      <span className="mp-price-lbl">Investment</span>
                      <span className={`mp-card-price ${isFree ? "mp-price-free" : ""}`}>{price}</span>
                    </div>
                  </div>

                  <button className="btn-primary mp-connect-btn">
                    {getCtaLabel(currentCategory, activeView)}
                  </button>
                  <button
                    className="mp-card-regenerate-btn"
                    onClick={() => handleRegenerateMarketplaceItem(item)}
                    disabled={!!regeneratingItemKey || !step}
                    type="button"
                  >
                    <RotateCwIcon size={14} />
                    {regeneratingItemKey === `${activeView}_${currentCategory}_${item.sourceIndex}` ? "Generating..." : "Generate Next Best"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {items.length === 0 && (
        <div className="mp-empty card">
          <div className="mp-empty-icon"><IconSearch size={32} /></div>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>No results found</div>
          <div style={{ fontSize: 13, color: "var(--text2)" }}>Try a different search or category</div>
        </div>
      )}

      <style>{`
        .mp-header { margin-bottom: 24px; }

        .mp-view-tabs {
          display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 18px;
          align-items: stretch;
        }
        .mp-view-btn {
          display: flex; flex-direction: column; gap: 2px;
          padding: 10px 18px; border-radius: var(--radius);
          border: 1.5px solid var(--border); background: var(--bg2);
          cursor: pointer; font-family: var(--font-body);
          text-align: left; transition: all 0.2s; flex: 1; min-width: 120px;
          margin: 0; box-sizing: border-box; outline: none;
          align-self: stretch;
        }
        .mp-view-btn:hover { border-color: var(--accent); }
        .mp-view-btn--active { border-color: var(--accent); background: var(--accent-soft); }
        .mp-view-label { font-size: 13px; font-weight: 600; color: var(--text); margin: 0; }
        .mp-view-btn--active .mp-view-label { color: var(--accent2); }
        .mp-view-desc { font-size: 11px; color: var(--text3); margin: 0; }

        .mp-cats {
          display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 20px;
        }
        .mp-cat-btn {
          display: flex; align-items: center; gap: 7px;
          padding: 10px 20px; border-radius: 30px;
          border: 1.5px solid var(--border); background: var(--bg2);
          font-family: var(--font-body); font-size: 14px; font-weight: 500;
          color: var(--text2); cursor: pointer; transition: all 0.2s;
        }
        .mp-cat-icon { display: flex; align-items: center; }
        .mp-cat-btn:hover { border-color: var(--accent); color: var(--accent); }
        .mp-cat-btn--active { border-color: var(--accent); background: var(--accent-soft); color: var(--accent2); }

        .mp-search-row {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 12px;
        }
        .mp-search-wrap {
          display: flex; align-items: center; gap: 10px;
          max-width: 400px; padding: 10px 14px;
          border: 1.5px solid var(--border); border-radius: var(--radius-sm);
          background: var(--bg2); transition: border-color 0.2s;
          flex: 1 1 280px;
        }
        .mp-search-wrap:focus-within { border-color: var(--accent); }
        .mp-search-input {
          border: none; outline: none; background: transparent;
          font-family: var(--font-body); font-size: 14px;
          color: var(--text); width: 100%;
        }
        .mp-search-input::placeholder { color: var(--text3); }

        .mp-card-regenerate-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          width: 100%;
          min-height: 40px;
          padding: 9px 14px;
          border-radius: var(--radius-sm);
          border: 1.5px solid var(--accent);
          background: #fff;
          color: var(--accent2);
          font-family: var(--font-body);
          font-size: 12.5px;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.16s, box-shadow 0.16s, opacity 0.16s;
          white-space: nowrap;
        }
        .mp-card-regenerate-btn svg { transition: transform 0.28s ease; }
        .mp-card-regenerate-btn:hover:not(:disabled) {
          background: var(--accent-soft);
          transform: translateY(-1px);
          box-shadow: 0 6px 14px rgba(44, 168, 82, 0.14);
        }
        .mp-card-regenerate-btn:hover:not(:disabled) svg { transform: rotate(60deg); }
        .mp-card-regenerate-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }
        .mp-regen-status {
          margin: 0 0 16px;
          padding: 9px 12px;
          border-radius: var(--radius-sm);
          font-size: 12.5px;
          font-weight: 600;
        }
        .mp-regen-status.success {
          color: var(--accent2);
          background: var(--green-soft);
          border: 1px solid rgba(44, 168, 82, 0.22);
        }
        .mp-regen-status.error {
          color: var(--red);
          background: var(--red-soft);
          border: 1px solid rgba(232, 49, 42, 0.22);
        }

        .mp-section-title {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--text3);
          letter-spacing: 0.08em;
          margin-bottom: 14px;
          margin-top: 10px;
        }

        .mp-recommended-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 18px;
          margin-bottom: 24px;
        }

        .mp-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 18px;
        }
        .mp-card { display: flex; flex-direction: column; gap: 14px; padding: 22px; }
        .mp-card--recommended {
          background: linear-gradient(135deg, #ffffff, #f2faf3);
          border: 1.5px solid var(--green);
          position: relative;
          box-shadow: 0 4px 12px rgba(44, 168, 82, 0.08);
        }
        .mp-card--recommended:hover {
          box-shadow: 0 6px 16px rgba(44, 168, 82, 0.15);
        }
        .mp-recommended-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          font-size: 9px;
          font-weight: 700;
          color: var(--green);
          background: #e6f6ec;
          padding: 3px 8px;
          border-radius: 20px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .mp-card-details {
          font-size: 12px;
          line-height: 1.5;
          color: var(--text2);
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-top: 2px;
        }
        .mp-detail-row {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .mp-detail-lbl {
          font-size: 9px;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--text3);
          letter-spacing: 0.04em;
        }
        .mp-detail-val {
          font-size: 12px;
          color: var(--text);
        }
        .mp-card-top { display: flex; align-items: center; gap: 14px; }
        .mp-avatar {
          width: 46px; height: 46px; border-radius: 12px;
          background: linear-gradient(135deg, var(--accent-soft), var(--blue-soft));
          color: var(--accent2); font-weight: 700; font-size: 14px;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .mp-card-name { font-size: 15px; font-weight: 600; color: var(--text); }
        .mp-card-role { font-size: 12px; color: var(--text2); margin-top: 2px; line-height: 1.4; }
        .mp-card-tags { display: flex; flex-wrap: wrap; gap: 6px; min-height: 44px; align-content: flex-start; }
        .mp-card-bottom {
          display: flex; flex-direction: column; gap: 6px;
          padding-top: 10px; border-top: 1px solid var(--border);
          margin-top: auto;
        }
        .mp-card-rating { display: flex; align-items: center; gap: 5px; font-size: 12px; color: var(--text2); }
        .mp-sessions { color: var(--text3); }
        .mp-card-price-line { display: flex; align-items: center; justify-content: space-between; font-size: 13px; }
        .mp-price-lbl { color: var(--text3); font-size: 12px; font-weight: 500; }
        .mp-card-price { font-size: 13px; font-weight: 600; color: var(--accent2); }
        .mp-price-free { color: var(--accent); background: var(--green-soft); padding: 2px 8px; border-radius: 6px; }
        .mp-connect-btn { width: 100%; justify-content: center; padding: 11px; font-size: 14px; margin-top: 4px; }

        .mp-card-actions {
          display: flex;
          gap: 6px;
          margin-top: 10px;
          width: 100%;
        }
        .btn-action {
          flex: 1;
          padding: 8px 10px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          font-family: var(--font-body);
          border: 1.5px solid var(--border);
          background: var(--bg3);
          color: var(--text2);
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .btn-action.enroll {
          background: var(--accent);
          color: white;
          border-color: var(--accent);
        }
        .btn-action.enroll:hover {
          background: var(--accent-hover);
        }
        .btn-action.save {
          background: var(--bg2);
          color: var(--text1);
        }
        .btn-action.save:hover {
          border-color: var(--accent);
        }
        .btn-action.not-relevant {
          background: transparent;
          color: var(--red);
          border-color: rgba(239, 68, 68, 0.2);
        }
        .btn-action.not-relevant:hover {
          background: rgba(239, 68, 68, 0.1);
          border-color: var(--red);
        }
        .btn-action.active {
          opacity: 0.6;
          pointer-events: none;
        }
        .mp-action-toast {
          margin-top: 8px;
          font-size: 11px;
          color: var(--accent);
          text-align: center;
          padding: 4px;
          background: var(--accent-soft);
          border-radius: 4px;
          width: 100%;
          box-sizing: border-box;
          animation: fadeIn 0.2s ease-in-out;
        }
        .mp-action-toast.error {
          color: var(--red);
          background: rgba(239, 68, 68, 0.1);
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .mp-empty { text-align: center; padding: 48px; }
        .mp-empty-icon { display: flex; justify-content: center; color: var(--text3); margin-bottom: 12px; }

        @media (max-width: 760px) {
          .mp-view-tabs,
          .mp-card-bottom,
          .mp-card-top,
          .mp-card-price-line,
          .mp-card-rating {
            flex-direction: column;
            align-items: stretch;
          }

          .btn-primary.mp-connect-btn,
          .mp-search-wrap,
          .mp-card-regenerate-btn {
            width: 100%;
          }

          .mp-header { margin-bottom: 16px; }
          .mp-header .display-title { font-size: 25px; }

          .mp-view-tabs,
          .mp-cats {
            flex-direction: row;
            flex-wrap: nowrap;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
            padding-bottom: 3px;
          }
          .mp-view-tabs::-webkit-scrollbar,
          .mp-cats::-webkit-scrollbar { display: none; }

          .mp-view-btn {
            flex: 0 0 150px;
            min-width: 150px;
            padding: 9px 12px;
          }

          .mp-cat-btn {
            flex: 0 0 auto;
            width: auto;
            padding: 9px 14px;
            white-space: nowrap;
          }

          .mp-grid,
          .mp-recommended-grid {
            grid-template-columns: 1fr;
          }

          .mp-card {
            padding: 18px;
          }

          .mp-card-tag,
          .mp-card-tags {
            gap: 8px;
          }

          .mp-card-top {
            align-items: flex-start;
          }

          .mp-search-wrap {
            max-width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
