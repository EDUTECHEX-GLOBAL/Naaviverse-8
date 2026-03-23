import React, { useState, useEffect, useMemo } from "react";
import Skeleton from "react-loading-skeleton";
import { useCoinContextData } from "../../context/CoinContext";
import "./pathview.scss";

const ITEMS_PER_PAGE = 20;

const Pathview = ({ paths, loading }) => {
  const {
    setPathItemSelected,
    setPathItemStep,
    setSelectedPathItem,
    searchTerm,
  } = useCoinContextData();

  // Format data based on NEW PATH MODEL
  const formattedData = useMemo(() => {
    return (paths || []).map((p) => ({
      _id: p._id,
      pathName: p.nameOfPath || "Untitled Path",
      program: p.program || "-",
      description: p.description || "-",
      raw: p,
    }));
  }, [paths]);

  // Search
  const filteredData = useMemo(() => {
    if (!searchTerm?.trim()) return formattedData;

    const term = searchTerm.toLowerCase();

    return formattedData.filter((item) =>
      item.pathName.toLowerCase().includes(term) ||
      item.program.toLowerCase().includes(term) ||
      item.description.toLowerCase().includes(term)
    );
  }, [formattedData, searchTerm]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [paths, searchTerm]);

  const paginatedData = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Select path
  const handlePathSelection = (row) => {
    setSelectedPathItem(row.raw);
    setPathItemSelected(true);
    setPathItemStep(1);
  };

  return (
    <div className="pathviewPage">

      {/* TABLE HEADER */}
      <div className="pathviewNav">
        <div className="name-div">Path Name</div>
        <div className="name-div">Program</div>
        <div className="description-div">Description</div>
      </div>

      {/* TABLE BODY */}
      <div className="pathviewContent">
        {loading ? (
          Array(5).fill("").map((_, i) => (
            <div className="each-pv-data" key={i}>
              <div className="each-pv-name"><Skeleton width={160}/></div>
              <div className="each-pv-name"><Skeleton width={160}/></div>
              <div className="each-pv-desc"><Skeleton width={300}/></div>
            </div>
          ))
        ) : paginatedData.length > 0 ? (
          paginatedData.map((row) => (
            <div
              className="each-pv-data"
              key={row._id}
              onClick={() => handlePathSelection(row)}
            >
              <div className="each-pv-name">{row.pathName}</div>
              <div className="each-pv-name">{row.program}</div>
              <div className="each-pv-desc">{row.description}</div>
            </div>
          ))
        ) : (
          <div className="no-data">No Paths Found</div>
        )}
      </div>

      {/* PAGINATION
      <div className="pagination-controls">
        <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
          Previous
        </button>

        <span>Page {currentPage} / {totalPages}</span>

        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
          Next
        </button>
      </div> */}
    </div>
  );
};

export default Pathview;
