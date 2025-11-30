import React, { useEffect, useState } from "react";
import axios from "axios";

export default function UniversitiesAdmin() {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);

  const LIMIT = 50;

  const loadData = async (p = 1) => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:4545/admin/universities?page=${p}&limit=${LIMIT}`);
      if (res.data.success) {
        setData(res.data.data);
        setTotal(res.data.total);
        setPage(res.data.page);
        setPages(res.data.pages);
      }
    } catch (err) {
      console.log("Universities fetch error", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData(1);
  }, []);

  const openSteps = async (id) => {
    try {
      const res = await axios.get(`http://localhost:4545/admin/universities/${id}/steps`);
      if (res.data.success) {
        setModal(res.data);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const filtered = data.filter((u) =>
    u.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="crm-main">
      {/* Search Bar */}
      <div style={{ padding: "12px 35px" }}>
        <input
          placeholder="Search University..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: "10px",
            border: "1px solid #ccc",
            width: "300px",
            borderRadius: "8px",
          }}
        />
      </div>

      {/* Header */}
      <div className="crm-tab" style={{ padding: "10px 35px" }}>
        <div className="crm-each-col" style={{ width: "35%" }}>Name</div>
        <div className="crm-each-col" style={{ width: "20%" }}>Country</div>
        <div className="crm-each-col" style={{ width: "25%" }}>Program</div>
        <div className="crm-each-col" style={{ width: "10%" }}>Steps</div>
        <div className="crm-each-col" style={{ width: "10%" }}>Action</div>
      </div>

      {/* Data */}
      <div className="clients-alldata">
        {loading ? (
          <center style={{ padding: "40px" }}>Loading...</center>
        ) : (
          filtered.map((u) => (
            <div className="each-clientData" key={u._id}>
              <div style={{ width: "35%" }}>{u.name || "-"}</div>
              <div style={{ width: "20%" }}>{u.country || "-"}</div>
              <div style={{ width: "25%" }}>{u.generatedProgram?.program || "-"}</div>
              <div style={{ width: "10%" }}>
                {u.generatedProgram?.steps?.length || 0}
              </div>
              <div style={{ width: "10%" }}>
                <button
                  onClick={() => openSteps(u._id)}
                  style={{
                    padding: "6px 12px",
                    background: "#2a4f9d",
                    color: "#fff",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  View
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      <div style={{ padding: "20px", textAlign: "center" }}>
        <button
          disabled={page === 1}
          onClick={() => loadData(page - 1)}
          style={{ marginRight: "10px" }}
        >
          Prev
        </button>

        Page {page} of {pages}

        <button
          disabled={page === pages}
          onClick={() => loadData(page + 1)}
          style={{ marginLeft: "10px" }}
        >
          Next
        </button>
      </div>

      {/* Steps Modal */}
      {modal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "20px",
          }}
          onClick={() => setModal(null)}
        >
          <div
            style={{
              background: "white",
              padding: "25px",
              width: "700px",
              maxHeight: "80vh",
              overflowY: "auto",
              borderRadius: "12px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>{modal.university}</h2>
            <p style={{ marginBottom: "20px" }}>
              Program: {modal.program || "-"}
            </p>

            {modal.steps?.map((s, i) => (
              <div
                key={i}
                style={{
                  marginBottom: "12px",
                  padding: "15px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                }}
              >
                <h4>{s.name}</h4>
                <p>{s.description}</p>
              </div>
            ))}

            <div style={{ textAlign: "right" }}>
              <button
                onClick={() => setModal(null)}
                style={{
                  marginTop: "10px",
                  padding: "8px 18px",
                  background: "#d9534f",
                  color: "#fff",
                  borderRadius: "6px",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
