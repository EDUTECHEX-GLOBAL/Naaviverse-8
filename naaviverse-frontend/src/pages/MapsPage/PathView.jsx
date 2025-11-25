import React from "react";
import Skeleton from "react-loading-skeleton";
import "./pathview.scss";
import { useCoinContextData } from "../../context/CoinContext";

const Pathview = ({ paths = [], loading = false, onSelectPath }) => {
  const { setShowPathDetails } = useCoinContextData();

  // 🔥 Save selected university globally (Right panel needs this)
  const handleSelect = (uni) => {
    localStorage.setItem("selectedUniversityId", uni._id);
    localStorage.setItem("selectedSchoolName", uni.name);

    onSelectPath(uni);
  };

  return (
    <div className="pathviewPage1">
      <div className="pathviewContent1">

        {loading ? (
          Array(8)
            .fill(0)
            .map((_, i) => (
              <div className="each-pv-data1" key={i}>
                <Skeleton width={200} height={60} />
              </div>
            ))
        ) : paths?.length > 0 ? (
          paths.map((uni, index) => (
            <div
              key={index}
              className="each-pv-data1"
              onClick={() => handleSelect(uni)}
            >
              {/* SCHOOL + PROGRAM */}
              <div className="each-pv-name1-div">
                <div className="each-pv-name1">{uni?.name}</div>
                <div className="each-pv-name1">
                  {uni?.generatedProgram?.program ?? "No Program"}
                </div>
              </div>

              {/* DESCRIPTION */}
              <div className="each-pv-desc1">
                {uni?.generatedProgram?.description ?? "No description"}
              </div>

              {/* SEE STEPS BUTTON */}
              <div
                className="see-steps-btn visible"
                onClick={(e) => {
                  e.stopPropagation();

                  localStorage.setItem("selectedUniversityId", uni._id);
                  localStorage.setItem("selectedSchoolName", uni.name);

                  onSelectPath(uni);
                  setShowPathDetails(true);
                }}
              >
                See Steps
              </div>
            </div>
          ))
        ) : (
          <div>No Path Found</div>
        )}

      </div>
    </div>
  );
};

export default Pathview;
