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
    searchTerm,           // ✅ GET SEARCH TERM HERE
  } = useCoinContextData();

  // Format data only when paths change
const formattedData = useMemo(() => {
  return (paths || []).map((u) => ({
      _id: u.generatedProgram?._id,    // THIS IS PROGRAM ID ✅
      universityId: u._id,             // keep university separately
      school: u.name,
      program: u.generatedProgram?.program,
      description: u.generatedProgram?.description,
      steps: u.generatedProgram?.steps,
  }));
});






  // ✅ APPLY SEARCH FILTER HERE
  const filteredData = useMemo(() => {
    if (!searchTerm || searchTerm.trim() === "") return formattedData;

    const term = searchTerm.toLowerCase();

    return formattedData.filter((item) =>
      item.school.toLowerCase().includes(term) ||
      item.program.toLowerCase().includes(term) ||
      item.description.toLowerCase().includes(term)
    );
  }, [formattedData, searchTerm]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1); // reset page on search
  }, [paths, searchTerm]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

  const paginatedData = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

const handlePathSelection = (selectedPath) => {
  if (!selectedPath) return;

  setPathItemSelected(true);
  setPathItemStep(1);
  setSelectedPathItem(selectedPath);

  // REAL ID is inside generatedProgram._id
  localStorage.setItem("selectedProgramId", selectedPath.generatedProgram?._id);
  localStorage.setItem("selectedUniversityId", selectedPath._id);

  console.log("Saved:", {
    program: selectedPath.generatedProgram?._id,
    university: selectedPath._id,
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
