import React, { useState, useEffect, useMemo } from "react";
import Skeleton from "react-loading-skeleton";
import { useCoinContextData } from "../../context/CoinContext";
import "./pathview.scss";
import pathIcon from '../../assets/images/assets/naavi-icon2.webp';
const ITEMS_PER_PAGE = 6;

const Pathview = ({ paths, loading, onAdjustCoordinates, onViewPath }) => {
  const {
    setPathItemSelected,
    setPathItemStep,
    setSelectedPathItem,
    searchTerm,
  } = useCoinContextData();

  const formattedData = useMemo(() => {
    return (paths || []).map((p) => ({
      _id:         p._id,
      pathName:    p.nameOfPath    || "Untitled Path",
      program:     p.program       || "-",
      description: p.description   || "-",
      raw:         p,
    }));
  }, [paths]);

  const filteredData = useMemo(() => {
    if (!searchTerm?.trim()) return formattedData;
    const term = searchTerm.toLowerCase();
    return formattedData.filter((item) =>
      item.pathName.toLowerCase().includes(term) ||
      item.program.toLowerCase().includes(term)  ||
      item.description.toLowerCase().includes(term)
    );
  }, [formattedData, searchTerm]);

  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [paths, searchTerm]);

  const paginatedData = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // "View Path →" click — open modal popup via parent
  const handleViewPath = (e, row) => {
    e.stopPropagation();
    if (onViewPath) {
      onViewPath(row.raw);
    }
  };

  const renderSkeletons = () =>
    Array(4).fill("").map((_, i) => (
      <div className="path-card path-card--skeleton" key={i}>
        <Skeleton width={120} height={14} style={{ marginBottom: 8 }} />
        <Skeleton width={80} height={12} style={{ marginBottom: 10 }} />
        <Skeleton count={2} height={11} />
      </div>
    ));

  const getProgramTag = (program) => {
    if (!program || program === "-") return null;
    return <span className="path-card__tag">{program}</span>;
  };

  return (
    <div className="pathview-root">

      {/* TOP BAR */}
      <div className="pathview-topbar">
        <div className="pathview-topbar__left">
          <h2 className="pathview-topbar__title">Explore Paths</h2>
          {!loading && (
            <span className="pathview-topbar__count">
              {filteredData.length} path{filteredData.length !== 1 ? "s" : ""} available
            </span>
          )}
        </div>
        <button
          className="pathview-topbar__coords-btn"
          onClick={onAdjustCoordinates}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="6" x2="20" y2="6"/>
            <line x1="4" y1="12" x2="20" y2="12"/>
            <line x1="4" y1="18" x2="20" y2="18"/>
            <circle cx="8" cy="6" r="2" fill="currentColor" stroke="none"/>
            <circle cx="16" cy="12" r="2" fill="currentColor" stroke="none"/>
            <circle cx="10" cy="18" r="2" fill="currentColor" stroke="none"/>
          </svg>
          Adjust Coordinates
        </button>
      </div>

      {/* CARDS GRID */}
      <div className="pathview-grid">
        {loading ? (
          renderSkeletons()
        ) : paginatedData.length > 0 ? (
          paginatedData.map((row, index) => (
            <div
              className="path-card"
              key={row._id}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
      <div className="path-card__inner">
  <div className="path-card__header">
    <div className="path-card__icon">
      <img src={pathIcon} alt="path" style={{ width: "18px", height: "18px", objectFit: "contain" }} />
    </div>
    {getProgramTag(row.program)}
  </div>

  <h3 className="path-card__title">{row.pathName}</h3>

                {row.description !== "-" && (
                  <p className="path-card__desc">{row.description}</p>
                )}

                <div className="path-card__footer">
                  <span
                    className="path-card__cta"
                    onClick={(e) => handleViewPath(e, row)}
                  >
                    View Path →
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="pathview-empty">
            <div className="pathview-empty__icon">🔍</div>
            <p>No paths found matching your criteria.</p>
            <small>Try adjusting your coordinates or search term.</small>
          </div>
        )}
      </div>

      {/* PAGINATION */}
      {!loading && totalPages > 1 && (
        <div className="pathview-pagination">
          <button
            className="pag-btn pag-btn--nav"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            ← Prev
          </button>

          <div className="pag-pages">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`pag-btn pag-btn--page ${currentPage === page ? "active" : ""}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            className="pag-btn pag-btn--nav"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default Pathview;