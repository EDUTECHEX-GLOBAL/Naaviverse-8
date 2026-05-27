import React, { useEffect, useState } from "react";
import axios from "axios";
import Skeleton from "react-loading-skeleton";
import { useCoinContextData } from "../../context/CoinContext";
import "./listview.scss";

const Listview = () => {
  const { searchTerm } = useCoinContextData();
  const [loading, setLoading] = useState(false);
  const [leadSourceData, setLeadSourceData] = useState([]);
  const [expandedUniversity, setExpandedUniversity] = useState(null);

  useEffect(() => {
    setLoading(true);
    axios
      .get("https://careers.marketsverse.com/universities/get")
      .then((response) => {
        const result = Array.isArray(response?.data?.data)
          ? response.data.data
          : [];
        setLeadSourceData(result);
      })
      .catch((error) => {
        console.error("❌ Error fetching university data:", error);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredLeadSourceData = Array.isArray(leadSourceData)
    ? leadSourceData.filter((entry) =>
        entry?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase())
      )
    : [];

  const handleOpenWebsite = (domains) => {
    if (!Array.isArray(domains) || domains.length === 0) {
      alert("No website link available for this university.");
      return;
    }

    const first = domains[0];
    if (!first) {
      alert("No website link available for this university.");
      return;
    }

    const url = first.startsWith("http") ? first : `https://${first}`;
    window.open(url, "_blank");
  };

  const handleOpenSpecificLink = (link) => {
    if (!link) return;
    const safe = link.startsWith("http") ? link : `https://${link}`;
    window.open(safe, "_blank");
  };

  return (
    <div className="listview-container">
      <div className="listview-header">
        <div style={{ width: "40%" }}>Name</div>
        <div>Country</div>
      </div>

      <div className="listview-content">
        {loading ? (
          Array(10)
            .fill(null)
            .map((_, i) => (
              <div className="each-list-content" key={i}>
                <div style={{ width: "40%" }}>
                  <Skeleton width={100} height={30} />
                </div>
                <div>
                  <Skeleton width={100} height={30} />
                </div>
                <div style={{ width: "40%", textAlign: "center" }}>
                  <Skeleton width={100} height={30} />
                </div>
              </div>
            ))
        ) : filteredLeadSourceData.length > 0 ? (
          filteredLeadSourceData.map((uni, i) => {
            const domains = Array.isArray(uni?.domains)
              ? uni.domains
              : typeof uni?.domains === "string"
              ? [uni.domains]
              : [];

            const hasDomains = domains.length > 0;
            const multiple = domains.length > 1;

            return (
              <div className="each-list-content" key={i}>
                <div style={{ width: "40%" }}>{uni?.name || "N/A"}</div>
                <div>{uni?.country || "N/A"}</div>

                <div className="web-btn-div">
                  {multiple ? (
                    <>
                      <div
                        className="web-btn"
                        onClick={() =>
                          setExpandedUniversity(
                            expandedUniversity === i ? null : i
                          )
                        }
                      >
                        Websites
                      </div>

                      {expandedUniversity === i && (
                        <div className="hidden-links-div">
                          {domains.map((each, index) => (
                            <div
                              className="each-hidden-link"
                              key={index}
                              onClick={() => handleOpenSpecificLink(each)}
                            >
                              <p>{each}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div
                      className="web-btn"
                      onClick={() => handleOpenWebsite(domains)}
                    >
                      Website
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <p style={{ textAlign: "center", padding: "20px" }}>
            No universities found.
          </p>
        )}
      </div>
    </div>
  );
};

export default Listview;
