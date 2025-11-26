import React, { useState, useEffect, useMemo } from "react";
import Skeleton from "react-loading-skeleton";
import { useCoinContextData } from "../../context/CoinContext";
import "./pathview.scss";

const ITEMS_PER_PAGE = 100;

const Pathview = ({ paths, loading }) => {
  const {
    setPathItemSelected,
    setPathItemStep,
    setSelectedPathItem,
    searchTerm,
  } = useCoinContextData();

  // ------------------------------------------------------------
  // ✅ FORMAT DATA CORRECTLY — USE UNIVERSITY _id AS MAIN ID
  // ------------------------------------------------------------
  const formattedData = useMemo(() => {
    return (paths || []).map((u) => ({
      _id: u._id, // <-- REAL path ID (university ID)
      school: u.name,
      program: u.generatedProgram?.program || "N/A",
      description: u.generatedProgram?.description || "N/A",
      steps: u.generatedProgram?.steps || [],
    }));
  }, [paths]);

  // ------------------------------------------------------------
  // ✅ SEARCH FILTER
  // ------------------------------------------------------------
const filteredData = useMemo(() => {
  if (!searchTerm?.trim()) return formattedData;

  const term = String(searchTerm || "").toLowerCase();

  return formattedData.filter((item) => {
    const school = String(item.school || "").toLowerCase();
    const program = String(item.program || "").toLowerCase();
    const description = String(item.description || "").toLowerCase();

    return (
      school.includes(term) ||
      program.includes(term) ||
      description.includes(term)
    );
  });
}, [formattedData, searchTerm]);


  // Pagination logic
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [paths, searchTerm]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

  const paginatedData = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // ------------------------------------------------------------
  // ✅ FIXED PATH SELECTION — PROGRAM ID IS NOT USED ANYMORE
  // ------------------------------------------------------------
  const handlePathSelection = (selectedPath) => {
    if (!selectedPath) return;

    console.log("Selected Path Object:", selectedPath);

    setPathItemSelected(true);
    setPathItemStep(1);
    setSelectedPathItem(selectedPath);

    // Save only ONE id — the real path ID (university id)
    localStorage.setItem("selectedPathId", selectedPath._id);

    console.log("Saved:", {
      pathId: selectedPath._id,
    });
  };

  return (
    <div className="pathviewPage">
      {/* HEADER */}
      <div className="pathviewNav">
        <div className="name-div">School</div>
        <div className="name-div">Program</div>
        <div className="description-div">Description</div>
      </div>

      {/* CONTENT */}
      <div className="pathviewContent">
        {loading ? (
          Array(10)
            .fill("")
            .map((_, i) => (
              <div className="each-pv-data" key={i}>
                <div className="each-pv-name">
                  <Skeleton width={100} height={30} />
                </div>
                <div className="each-pv-name">
                  <Skeleton width={100} height={30} />
                </div>
                <div className="each-pv-desc">
                  <Skeleton width={300} height={30} />
                </div>
              </div>
            ))
        ) : paginatedData.length > 0 ? (
          paginatedData.map((e) => (
            <div
              className="each-pv-data"
              key={e._id}
              onClick={() => handlePathSelection(e)}
            >
              <div className="each-pv-name">{e.school}</div>
              <div className="each-pv-name">{e.program}</div>
              <div className="each-pv-desc">{e.description}</div>
            </div>
          ))
        ) : (
          <div className="no-data">No Paths Found</div>
        )}
      </div>

      {/* PAGINATION */}
      <div className="pagination-controls">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => p - 1)}
        >
          Previous
        </button>

        <span>
          Page {currentPage} / {totalPages}
        </span>

        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((p) => p + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pathview;
