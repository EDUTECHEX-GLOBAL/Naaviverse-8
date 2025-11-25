import React from "react";
import Skeleton from "react-loading-skeleton";
import "./pathview.scss";
import { useCoinContextData } from "../../context/CoinContext";
import { useNavigate } from "react-router-dom";

const Pathview = ({
  paths = [],              // recommended universities
  loading = false,         // loading state
  onSelectPath = () => {}, // <-- IMPORTANT FIX
}) => {

  const { schoolSearch, programSearch } = useCoinContextData();
  const navigate = useNavigate();

  return (
    <div className="pathviewPage1">
      <div className="pathviewContent1">

        {loading ? (
          Array(8)
            .fill(0)
            .map((_, i) => (
              <div className="each-pv-data1" key={i}>
                <div className="each-pv-name1-div">
                  <div className="each-pv-name1">
                    <Skeleton width={150} height={25} />
                  </div>
                  <div className="each-pv-name1">
                    <Skeleton width={150} height={25} />
                  </div>
                </div>
                <div className="each-pv-desc1">
                  <Skeleton width={250} height={20} />
                </div>
              </div>
            ))
        ) : paths?.length > 0 ? (
          paths.map((uni, i) => (
            <div
              key={i}
              className="each-pv-data1"
              onClick={() => {
                // SELECT PATH FIX
                onSelectPath(uni);
              }}
            >
              <div className="each-pv-name1-div">
                <div className="each-pv-name1">{uni?.name}</div>
                <div className="each-pv-name1">
                  {uni?.generatedProgram?.program ?? "No Program"}
                </div>
              </div>

              <div className="each-pv-desc1">
                {uni?.generatedProgram?.description ?? "No description available"}
              </div>

              <div
                className="see-steps-btn visible"
                onClick={(e) => {
                  e.stopPropagation();

                  // STORE FOR JourneyPage
                  localStorage.setItem("selectedUniversityId", uni?._id);

                  // OPEN THE STEPS PAGE
                  navigate("/dashboard/pathview");
                }}
              >
                See Steps
              </div>
            </div>
          ))
        ) : (
          <div
            style={{
              width: "100%",
              height: "20vh",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            No Path Found
          </div>
        )}

      </div>
    </div>
  );
};

export default Pathview;
