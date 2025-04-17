import React, { useState, useEffect, useContext } from "react";
import Skeleton from "react-loading-skeleton";
import axios from "axios";
import { useCoinContextData } from "../../context/CoinContext";
import "./pathview.scss";
import { GlobalContex } from "../../globalContext";

const Pathview = () => {
  const {
    searchTerm,
    pathItemSelected,
    setPathItemSelected,
    pathItemStep,
    setPathItemStep,
    selectedPathItem,
    setSelectedPathItem,
  } = useCoinContextData();
  const {
    refetchPaths,
    gradeToggle,
    schoolToggle,
    setSchoolToggle,
    curriculumToggle,
    setCurriculumToggle,
    streamToggle,
    setStreamToggle,
    performanceToggle,
    setPerformanceToggle,
    financialToggle,
    setFinancialToggle,
    personalityToggle,
    setPersonalityToggle,
  } = useContext(GlobalContex);

  const [loading, setLoading] = useState(false);
  const [pathViewData, setPathViewData] = useState([]);
  const userProfile = JSON.parse(localStorage.getItem("userProfile"));

  useEffect(() => {
    setLoading(true);
    axios
      .get(`/api/userpaths/programs`, {
        params: {
          email: JSON.parse(localStorage.getItem("user"))?.user?.email,
          ...(gradeToggle && { grade: userProfile.grade }),
          ...(curriculumToggle && { curriculum: userProfile.curriculum }),
          ...(streamToggle && { stream: userProfile.stream }),
          ...(performanceToggle && { performance: userProfile.performance }),
          ...(financialToggle && { financialSituation: userProfile.finance}),
          ...(personalityToggle && { personality: userProfile.personality})
        },
      })
      .then((response) => {
        let result = response?.data?.data;
        setPathViewData(result);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error, "error in getting path view result");
        setPathViewData([]);
        setLoading(false);
      });
  }, [refetchPaths]);

  const filteredPathViewData = pathViewData?.filter(
    (entry) =>
      entry?.personality
        ?.toLowerCase()
        ?.includes(searchTerm?.toLowerCase()) ||
      entry?.program?.toLowerCase()?.includes(searchTerm?.toLowerCase())
  );

  const handlePathSelection = (selectedPath) => {
    setPathItemSelected(true);
    localStorage.setItem("selectedPath", JSON.stringify(selectedPath?.nameOfPath));
    setSelectedPathItem(selectedPath);
    localStorage.setItem("selectedPathId", selectedPath?._id); // Save the selected Path ID to localStorage
  };

  return (
    <div className="pathviewPage">
      <div className="pathviewContent">
        {loading ? (
          Array(10)
            .fill("")
            .map((_, i) => (
              <div className="each-pv-card" key={i}>
                <div className="pv-label"><Skeleton width={100} height={16} /></div>
                <div className="pv-value"><Skeleton width={160} height={20} /></div>
  
                <div className="pv-label"><Skeleton width={100} height={16} /></div>
                <div className="pv-value"><Skeleton width={160} height={20} /></div>
  
                <div className="pv-label"><Skeleton width={100} height={16} /></div>
                <div className="pv-value"><Skeleton width={200} height={40} /></div>
              </div>
            ))
        ) : filteredPathViewData?.length > 0 ? (
          filteredPathViewData.map((e, i) => (
            <div
              className="each-pv-card"
              key={i}
              onClick={() => handlePathSelection(e)}
            >
              <div className="pv-label"> School:</div>
              <div className="pv-value">{e?.school}</div>
  
              <div className="pv-label"> Program:</div>
              <div className="pv-value">{e?.program}</div>
  
              <div className="pv-label"> Description:</div>
              <div className="pv-value">{e?.description}</div>
            </div>
          ))
        ) : (
          <div className="no-path-message">No Path Found</div>
        )}
      </div>
    </div>
  );
  
};

export default Pathview;
