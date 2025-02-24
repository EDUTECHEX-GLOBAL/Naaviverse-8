import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Skeleton from "react-loading-skeleton";

import { useCoinContextData } from "../../context/CoinContext";
import Navbar from "../Navbar/index.jsx";
import Dashsidebar from "../dashsidebar/dashsidebar.jsx";
import MenuNav from "../MenuNav/index.jsx";
import AccDashsidebar from "../accDashsidebar/accDashsidebar.jsx";
import AdminAccDashsidebar from "../AdminAccDashsidebar/index.jsx";

import "./journey.scss";

const PathPage = () => {
  const navigate = useNavigate();
  const loc = useLocation();
  const {} = useCoinContextData();

  const [loading, setLoading] = useState(false);
  const [stepData, setStepData] = useState(null);
  const [showDrop, setShowDrop] = useState(false);
  const [stepDetails, setStepDetails] = useState([]); 

  useEffect(() => {
    setLoading(true);
    const pathId = loc?.pathname?.split("/").pop(); // Extract path ID
    console.log("Extracted Path ID:", pathId);

    if (pathId) {
      axios
        .get(`/api/paths/viewpath/${pathId}`)
        .then(async ({ data }) => {
          if (data.status) {
            console.log("API Response:", data?.data);
            setStepData(data?.data);

            // Extract step_ids
            const stepIds = data?.data?.the_ids?.map(item => item.step_id) || [];
            if (stepIds.length > 0) {
              const stepPromises = stepIds.map(stepId =>
                axios.get(`/api/steps/${stepId}`).then(res => res.data)
              );

              // Fetch all step details
              const stepResults = await Promise.all(stepPromises);
              setStepDetails(stepResults);
              console.log("Step Details State:", stepDetails);

            }
          } else {
            console.error("Invalid API response:", data);
          }
        })
        .catch(error => {
          console.error("Error fetching data:", error);
        })
        .finally(() => setLoading(false));
    }
  }, []);


  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <>
      <div className="dashboard-main">
        <div className="dashboard-body">
          <div>
            {localStorage.getItem("userType") === "partner" ? (
              <AccDashsidebar />
            ) : localStorage.getItem("userType") === "user" ? (
              <Dashsidebar />
            ) : (
              <AdminAccDashsidebar />
            )}
          </div>

          <div className="dashboard-screens">
            <MenuNav
              showDrop={showDrop}
              setShowDrop={setShowDrop}
              searchPlaceholder="Search..."
            />

            <div style={{ height: "100%" }}>
              <div className="journeypage">
                {/* Path Title */}
                <div className="journey-top-area">
                  <div>Your Selected Path:</div>
                  {loading ? (
                    <Skeleton width={150} height={30} />
                  ) : (
                    <div className="bold-text">{stepData?.university || "N/A"}</div>
                  )}

                  <div
                    className="goBack-div"
                    onClick={() => {
                      navigate(-1);
                    }}
                  >
                    Go Back
                  </div>
                </div>

                {/* Journey Steps */}
                <div className="journey-steps-area">
                  {loading ? (
                    Array(3)
                      .fill("")
                      .map((_, i) => (
                        <div className="each-j-step" key={i}>
                          <div className="each-j-step-text">
                            <Skeleton width={200} height={20} />
                          </div>
                        </div>
                      ))
                  ) : stepDetails.length > 0 ? (
                    stepDetails.map((step, index) => (
                      <div key={index} className="each-j-step">
                        <div
                          className="each-j-step-text"
                          style={{ fontWeight: "600", fontFamily: "Montserrat, sans-serif" }} // Semi-bold font
                        >
                          {step.data?.name}
                        </div>
                        <div
                          className="each-j-step-text"
                          style={{ fontSize: "0.9em", color: "#7d8085", lineHeight: "1.5", fontFamily: "Montserrat, sans-serif" }} // Adjusted styling
                        >
                          {step.data?.description}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>No steps available</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PathPage;
