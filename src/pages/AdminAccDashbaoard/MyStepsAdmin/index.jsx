import React, { useState, useEffect } from "react";
import { useCoinContextData } from "../../../context/CoinContext.js";
import Skeleton from "react-loading-skeleton";
import "./mypaths.scss";
import axios from "axios";

import { Draggable } from "react-beautiful-dnd";
import EditStepForm from "../../accDashbaoard/MyStepsAcc/steps.jsx";

// images
import dummy from "./dummy.svg";
import closepop from "../../../static/images/dashboard/closepop.svg";
import lg1 from "../../../static/images/login/lg1.svg";
import CurrentStep from "../../CurrentStep/index.jsx";
import { useStore } from "../../../components/store/store.ts";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const MyStepsAdmin = ({ search, admin, fetchAllServicesAgain, stepDataPage }) => {
  const navigate = useNavigate()
  const { sideNav, setsideNav } = useStore();
  let userDetails = JSON.parse(localStorage.getItem("adminuser"));
  const { setCurrentStepData, setCurrentStepDataLength,mypathsMenu, setMypathsMenu } = useCoinContextData();
  const [partnerPathData, setPartnerPathData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [partnerStepsData, setPartnerStepsData] = useState([]);
  const [selectedPathId, setSelectedPathId] = useState("");
  const [pathActionEnabled, setPathActionEnabled] = useState(false);
  const [pathActionStep, setPathActionStep] = useState(1);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedStepId, setSelectedStepId] = useState("");
  const [stepActionEnabled, setStepActionEnabled] = useState(false);
  const [stepActionStep, setStepActionStep] = useState(1);
  const [editPaths, setEditPaths] = useState("default");
  const [metaDataStep, setMetaDataStep] = useState("default");
  const [selectedPath, setSelectedPath] = useState([]);
  const [newValue, setNewValue] = useState("");
  const [viewPathEnabled, setViewPathEnabled] = useState(false);
  const [viewPathLoading, setViewPathLoading] = useState(false);
  const [viewPathData, setViewPathData] = useState([]);
  const [selectedServices, setSelectedServices] = useState([])
  const [showSelectedPath, setShowSelectedPath] = useState(null)
  const [addServiceStep, setAddServiceStep] = useState(null)
  const [selectedSubStep, setSelectedSubStep] = useState(null)
  const [allServices, setAllServices] = useState([]);           // ADD
  const [attachedServices, setAttachedServices] = useState([]); // REMOVE
  const [serviceToRemove, setServiceToRemove] = useState(null);
  const [selectedStep, setSelectedStep] = useState(null);
  const [allPaths, setAllPaths] = useState([]);
  const [backupPathData, setBackupPathData] = useState([])
  const [stepId, setStepId] = useState("");
  const [backupPathId, setBackupPathId] = useState("")
  const [serviceCountMap, setServiceCountMap] = useState({});
  //useEffect(() => {
   // setMypathsMenu('Active Steps')
  //}, [])

useEffect(() => {
  if (stepActionEnabled && selectedStepId) {
    const step = partnerStepsData.find(s => s._id === selectedStepId);
    setSelectedStep(step || null);
  }
}, [stepActionEnabled, selectedStepId, partnerStepsData]);

  const getAllPaths = () => { 
    setLoading(true);
    let email = userDetails?.email;
    const endpoint = admin? `${BASE_URL}/api/paths/get?status=active` : `${BASE_URL}/api/paths/get?email=${email}`
    axios
      .get(endpoint)
      .then((response) => {
        let result = response?.data?.data;
        // console.log(result, "partnerPathData result");
        setPartnerPathData(result);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error, "error in partnerPathData");
      });
  };

 useEffect(() => {
  if (!userDetails?.email) return;

  axios.get(`${BASE_URL}/api/paths/get?email=${userDetails.email}`)
    .then(({ data }) => {
      if (data.status) setBackupPathData(data.data);
    });
}, [userDetails?.email]);


  const getNewPath = () => {
    setLoading(true);
    axios
      .get(`${BASE_URL}/api/paths/get?status=waitingforapproval`)
      .then((response) => {
        let result = response?.data?.data;
        // console.log(result, "partnerPathData result");
        setPartnerPathData(result);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error, "error in partnerPathData");
      });
   
  }

  useEffect(() => {
    console.log(selectedPath?.StepDetails, "lwkefhlkwefcwefc")
  }, [selectedPath])


  const fetchServiceCounts = async (steps = []) => {
  if (!Array.isArray(steps) || steps.length === 0) {
    setServiceCountMap({});
    return;
  }

  const counts = {};

  await Promise.all(
    steps.map(async (step) => {
      try {
        const { data } = await axios.get(`/api/steps/getall/${step._id}`);
        counts[step._id] = data?.data?.length || 0;
      } catch {
        counts[step._id] = 0;
      }
    })
  );

  setServiceCountMap(counts);
};

const refreshStepServices = async (stepId) => {
  if (!stepId) return;

  try {
    const { data } = await axios.get(`/api/steps/getall/${stepId}`);

    if (data?.status) {
      setAttachedServices(data.data || []);
    } else {
      setAttachedServices([]);
    }
  } catch (err) {
    console.error("refreshStepServices failed", err);
    setAttachedServices([]);
  }
};
const getPathNameForStep = (stepId) => {
  if (!stepId || !partnerPathData?.length) return null;

  const matchedPath = partnerPathData.find((path) =>
    path?.StepDetails?.some((s) => s?._id === stepId) ||
    path?.the_ids?.some((s) => s?.step_id === stepId)
  );

  return matchedPath?.nameOfPath || null;
};

 const getAllSteps = () => {
  setLoading(true);

  axios
    .get(`/api/steps/get?status=${mypathsMenu === "Active Steps" ? "active" : "inactive"}`)
    .then((response) => {
      const result = response?.data?.data || []; // ⭐ FIX

      console.log(result, "partnerStepsData result");

      setPartnerStepsData(result);

      if (result.length > 0) {
        fetchServiceCounts(result);
      } else {
        setServiceCountMap({});
      }

      setLoading(false);
    })
    .catch((error) => {
      console.log(error, "error in partnerStepsData");
      setPartnerStepsData([]); // ⭐ SAFE FALLBACK
      setLoading(false);
    });
};

  useEffect(() => {
    getAllSteps();
  }, [mypathsMenu]);


useEffect(() => {
  if (stepActionStep !== 5) return;

  axios
    .get(`/api/services/admin?status=active`)
    .then(({ data }) => {
      if (data?.status) {
        setAllServices(data.data || []);
      } else {
        setAllServices([]);
      }
    })
    .catch(() => setAllServices([]));
}, [stepActionStep]);




useEffect(() => {
  if (stepActionStep !== 6) return;
  if (!selectedStepId) return;

  axios.get(`/api/steps/getall/${selectedStepId}`)
    .then(({ data }) => {
      if (data?.status) {
        setAttachedServices(data.data || []);
      } else {
        setAttachedServices([]);
      }
    })
    .catch(() => setAttachedServices([]));
}, [stepActionStep, selectedStepId]);



  const filteredPartnerPathData = partnerPathData?.filter((entry) =>
    entry?.nameOfPath?.toLowerCase()?.includes(search?.toLowerCase())
  );

  const filteredPartnerStepsData = partnerStepsData?.filter((entry) =>
    entry?.name?.toLowerCase()?.includes(search?.toLowerCase())
  );

  const myPathsTimeout = () => {
    setTimeout(reload1, 2000);
  };

  function reload1() {
    getAllPaths();
    setPathActionEnabled(false);
    setPathActionStep(1);
    setSelectedPathId("");
    setEditPaths("default");
    setMetaDataStep("default");
    setSelectedPath([]);
    setNewValue("");
  }

  const myStepsTimeout = () => {
    setTimeout(reload2, 2000);
  };

  function reload2() {
    getAllSteps();
    setStepActionEnabled(false);
    setStepActionStep(1);
    setSelectedStepId("");
  }

  const deletePath = () => {
    setActionLoading(true);
    axios
      .delete(`/api/paths/delete/${selectedPathId}`)
      .then((response) => {
        let result = response?.data;
        // console.log(result, "deletePath result");
        if (result?.status) {
          setActionLoading(false);
          setPathActionStep(3);
          myPathsTimeout();
        }
      })
      .catch((error) => {
        console.log(error, "error in deletePath");
      });
  };

  const deleteStep = () => {
    setActionLoading(true);
    axios
      .delete(`/api/steps/delete/${selectedStepId}`)
      .then((response) => {
        let result = response?.data;
        // console.log(result, "deleteStep result");
        if (result?.status) {
          setActionLoading(false);
          setStepActionStep(3);
          myStepsTimeout();
        }
      })
      .catch((error) => {
        console.log(error, "error in deleteStep");
      });
  };



const addServiceToStepInstant = async (serviceId) => {
  if (!selectedStepId) {
    toast.error("No step selected");
    return;
  }

  try {
    await axios.post("/api/steps/attachservice", {
  step_id: selectedStepId,
  service_ids: [serviceId],
});


toast.success("Service added successfully");

// 🔥 HARD REFRESH FROM BACKEND
await refreshStepServices(selectedStepId);
fetchServiceCounts(partnerStepsData);
   
  } catch (error) {
    console.error("ADD SERVICE ERROR", error.response?.data || error);
    toast.error("Failed to add service");
  }
};



  const resetPathAction = () => {
    setPathActionEnabled(false);
    setPathActionStep(1);
    setSelectedPathId("");
    setEditPaths("default");
    setMetaDataStep("default");
    setSelectedPath([]);
    setNewValue("");
    setViewPathData([]);
  };

  const editMetaData = (field) => {
    setActionLoading(true);
    let obj = {
      [field]: newValue,
    };

    // console.log(obj, "obj");
    // console.log(selectedPathId, "selectedPathId");

    axios
      .put(
        `/api/paths/update/${selectedPathId}`,
        obj
      )
      .then((response) => {
        let result = response?.data;
        // console.log(result, "editMetaData result");
        if (result?.status) {
          setMetaDataStep("success");
          setActionLoading(false);
          myPathsTimeout();
        }
      })
      .catch((error) => {
        console.log(error, "ediMetaData error");
      });
  };

  const viewPath = (path) => {
    console.log(path, "lkwehflwehflwf")
    setViewPathLoading(true);
    axios
      .get(`${BASE_URL}/api/paths/get?nameOfPath=${path}`)
      .then((response) => {
        let result = response?.data?.data[0];
        // console.log(result, "viewPathData result");
        setViewPathData(result);
        setViewPathLoading(false);
      })
      .catch((error) => {
        console.log(error, "error in fetching viewPathData");
      });
  };

  const handleApprovePath = () => {
    setActionLoading(true);
    axios.put(`/api/paths/updatepath/${selectedPathId}`, 
    {status:"active"})
    .then(({data}) => {
      if(data.status){
        getNewPath()
        setPathActionEnabled(false);
        setActionLoading(false);
        setPathActionStep(1)
      }
    })
  }
  
  const handleRejectPath = () => {
    setActionLoading(true);
    axios.put(`/api/paths/updatepath/${selectedPathId}`, 
    {status:"inactive"})
    .then(({data}) => {
      if(data.status){
        if(mypathsMenu === "Pending Paths"){
          getNewPath()
        }else{
          getAllPaths()
        }
        setPathActionEnabled(false);
        setActionLoading(false);
        setPathActionStep(1)
      }
    })
  }

const removeServiceFromStep = async (id) => {
  if (!selectedStepId || !id) return;

  setActionLoading(true);

  try {
    await axios.delete(`/api/steps/remove/${selectedStepId}/${id}`);

    toast.success("Service removed");

    // 🔥 ALWAYS REFRESH FROM BACKEND
    await refreshStepServices(selectedStepId);
    fetchServiceCounts(partnerStepsData);
  } catch (err) {
    console.error("REMOVE SERVICE ERROR", err);
    toast.error("Failed to remove service");
  } finally {
    setActionLoading(false);
  }
};


  useEffect(() => {
    setShowSelectedPath(null)
  }, [mypathsMenu])

  const [productDataArray, setProductDataArray] = useState([]);
  const [productKeys, setProductKeys] = useState(null);

  const fetchProductData = async (apiKey) => {
    try {
      const apiUrl = `https://comms.globalxchange.io/gxb/product/get?product_id=${apiKey}`;
      const response = await axios.get(apiUrl);
      const productData = response.data.products[0];
      return productData;

      return null; // Return null for items that already exist in the array
    } catch (error) {
      console.error(`Error fetching productt data for key ${apiKey}:`, error);
      return null;
    }
  };

  useEffect(() => {
    console.log(stepActionStep, 'ejbfkwjebfkwef')
  }, [stepActionStep])

const fetchData = React.useCallback(async () => {
  setProductDataArray([]);
  if (productKeys && Array.isArray(productKeys)) {
    const results = await Promise.all(
      productKeys.map(id => fetchProductData(id))
    );
    setProductDataArray(results.filter(Boolean));
  }
}, [productKeys]);

  
 useEffect(() => {
  fetchData();
}, [fetchData]);


  const handlePlace = (item, index) => {
    console.log(item, index, "lwkeflkwefwef")
    const updatedPathObject = addIdToObjectAtIndex(item?.the_ids, stepId, backupPathId, index);
    // console.log(updatedPathObject, "kjwebfkwjebfkwejf")
    axios.put(`/api/paths/update/${selectedPath?._id}`, {the_ids: updatedPathObject})
    .then(res => {
      if(res.data.status){
        resetPathAction();
        getAllPaths()
      }
    })
  }

  function addIdToObjectAtIndex(idsArray, stepId, backupPathId, index) {
    // Create a shallow copy of the original array and extract only necessary properties
    const newArray = idsArray.map(({ step_id, backup_pathId }) => ({ step_id, backup_pathId }));

    // Create a new object with the provided stepId and backupPathId
    const newIdObject = {
        step_id: stepId,
        backup_pathId: backupPathId
    };

    // Insert the new object at the specified index using splice
    newArray.splice(index, 0, newIdObject);

    return newArray;
  }

  const handledeletePathPosition = (fullObject, idToDelete) => {
    const updatedTheIds = [...fullObject.the_ids];

    // Find the index of the object with the specified _id in the copied array
    const indexToDelete = updatedTheIds.findIndex(obj => obj._id === idToDelete);

    // If the object with the specified _id is found, remove it from the copied array
    if (indexToDelete !== -1) {
        updatedTheIds.splice(indexToDelete, 1);
    }

    // Return the updated array with only step_id and backup_pathId keys
    const updatedBody =  updatedTheIds.map(({ step_id, backup_pathId }) => ({ step_id, backup_pathId }));
    axios.put(`/api/paths/update/${selectedPath?._id}`, {the_ids: updatedBody})
    .then(res => {
      if(res.data.status){
        resetPathAction();
        getAllPaths()
      }
    })
  }

  const getChangedPos = (currentPos, newPos) => {
    console.log(currentPos, newPos, "kjwbefkwbfkwbfkwjf");
    updatePositionOfObject(selectedPath, currentPos, newPos)
  }

  function updatePositionOfObject(fullObject, currentIndex, newIndex) {
    const updatedTheIds = [...fullObject.the_ids];
    const [movedObject] = updatedTheIds.splice(currentIndex, 1);
    updatedTheIds.splice(newIndex, 0, movedObject);
    // console.log(fullObject.the_ids, updatedTheIds, "kjwekfjwefkjwegfkwfgwf")
    const updatedTheIdsArray = updatedTheIds.map(({ step_id, backup_pathId }) => ({ step_id, backup_pathId }));
    axios.put(`/api/paths/update/${selectedPath?._id}`, {the_ids: updatedTheIdsArray})
    .then(res => {
      if(res.data.status){
        resetPathAction();
        getAllPaths()
      }
    })
  }

//  const handleAddServiceToStep = async (service) => {
//   if (!selectedStepId) {
//     toast.error("No step selected");
//     return;
//   }

//   try {
//     await axios.post("/api/steps/services/add", {
//       step_id: selectedStepId,
//       service_ids: [service._id],
//     });

//     toast.success(`"${service.name}" added to step`);

//     // refresh attached services
//     setStepActionStep(6); // switch to remove view
//   } catch (err) {
//     console.error(err);
//     toast.error("Failed to add service");
//   }
// };
const pathNameMap = React.useMemo(() => {
  const map = {};
  allPaths.forEach((p) => {
    map[String(p._id)] = p.nameOfPath;
  });
  return map;
}, [allPaths]);
useEffect(() => {
  axios.get("${BASE_URL}/api/paths/get?status=active").then(({ data }) => {
    if (data?.status) {
      setAllPaths(data.data);
    }
  });
}, []);

useEffect(() => {
  if (pathActionEnabled || stepActionEnabled) {
    document.body.classList.add('admin-popup-open');
  } else {
    document.body.classList.remove('admin-popup-open');
  }
  

  
  return () => {
    document.body.classList.remove('admin-popup-open');
  };
}, [pathActionEnabled, stepActionEnabled]);

  return (
    <div className="admin-mypaths">
      <div className="admin-mypaths-menu">
       
        <div
          className="admin-each-mypath-menu"
          style={{
            fontWeight: mypathsMenu === "Active Steps" ? "700" : "",
            background:
              mypathsMenu === "Active Steps" ? "rgba(241, 241, 241, 0.5)" : "",
          }}
          onClick={() => {
            setMypathsMenu("Active Steps");
            if(viewPathEnabled) {
              setViewPathEnabled(false);
              setViewPathData([]);
            }
          }}
        >
          Active Steps
        </div>
        <div
          className="admin-each-mypath-menu"
          style={{
            fontWeight: mypathsMenu === "Inactive Steps" ? "700" : "",
            background:
              mypathsMenu === "Inactive Steps" ? "rgba(241, 241, 241, 0.5)" : "",
          }}
          onClick={() => {
            setMypathsMenu("Inactive Steps");
            if(viewPathEnabled) {
              setViewPathEnabled(false);
              setViewPathData([]);
            }
          }}
        >
          Inactive Steps
        </div>
      </div>
      <div className="admin-mypaths-content">
        {showSelectedPath ? <div>
          <CurrentStep productDataArray={productDataArray} selectedPathId={selectedPathId} showSelectedPath={showSelectedPath} selectedPath={selectedPath}/>
        </div>: viewPathEnabled ? (
          <div className="admin-viewpath-container">
            <div className="admin-viewpath-top-area">
              <div>Your Selected Path:</div>
              {viewPathLoading ? (
                <Skeleton width={150} height={30} />
              ) : (
                <div className="admin-viewpath-bold-text">
                  {viewPathData?.length > 0
                    ? viewPathData?.destination_institution
                    : ""}
                </div>
              )}
              {viewPathLoading ? (
                <Skeleton width={500} height={20} />
              ) : (
                <div className="admin-viewpath-des">
                  {viewPathData?.length > 0 ? viewPathData?.description : ""}
                </div>
              )}
              <div
                className="admin-viewpath-goBack-div"
                onClick={() => {
                  setViewPathEnabled(false);
                }}
              >
                Go Back
              </div>
            </div>
            <div className="admin-viewpath-steps-area">
              {viewPathLoading
                ? Array(6)
                    .fill("")
                    .map((e, i) => {
                      return (
                        <div
                          className="admin-viewpath-each-j-step admin-viewpath-relative-div"
                          key={i}
                        >
                          <div className="admin-viewpath-each-j-img">
                            <Skeleton width={75} height={75} />
                          </div>
                          <div className="admin-viewpath-each-j-step-text">
                            <Skeleton width={200} height={30} />
                          </div>
                          <div className="admin-viewpath-each-j-step-text1">
                            <Skeleton width={250} height={25} />
                          </div>
                          <div className="admin-viewpath-each-j-amount-div">
                            <div className="admin-viewpath-each-j-amount">
                              <Skeleton width={100} height={30} />
                            </div>
                          </div>
                        </div>
                      );
                    })
                : viewPathData?.length > 0
                ? viewPathData?.StepDetails?.map((e, i) => {
                    return (
                      <div onClick={() => {
                        setShowSelectedPath(e)
                        setProductKeys(e?.product_ids)
                      }}
                        className="admin-viewpath-each-j-step admin-viewpath-relative-div"
                        key={i}
                      >
                        <div className="admin-viewpath-each-j-img">
                          <img src={e?.icon} alt="" />
                        </div>
                        <div className="admin-viewpath-each-j-step-text">
                          {e?.name}
                        </div>
                        <div className="admin-viewpath-each-j-step-text1">
                          {e?.description}
                        </div>
                        <div className="admin-viewpath-each-j-amount-div">
                          <div className="admin-viewpath-each-j-amount">
                            {e?.cost}
                          </div>
                        </div>
                      </div>
                    );
                  })
                : ""}
            </div>
          </div>
        ) : (
  mypathsMenu === "Paths" ||
  (mypathsMenu === "Pending Paths" && !viewPathEnabled)
)
 ? (
          <>
            <div className="admin-mypathsNav">
              <div className="admin-mypaths-name-div">Name</div>
              <div className="admin-mypaths-description-div">Description</div>
            </div>
            <div className="admin-mypathsScroll-div">
              {loading
                ? Array(10)
                    .fill("")
                    .map((e, i) => {
                      return (
                        <div
  className="admin-each-mypaths-data1"
  style={{ position: "relative" }}
>
                          <div className="admin-each-mypaths-name">
                            <Skeleton width={100} height={30} />
                          </div>
                          <div className="admin-each-mypaths-desc">
                            <Skeleton width={"100%"} height={30} />
                          </div>
                        </div>
                      );
                    })
                : filteredPartnerPathData?.map((e, i) => {
                    return (
                      <div
                        className="admin-each-mypaths-data"
                        key={i}
                        onClick={() => {
                          setPathActionEnabled(true);
                          setSelectedPathId(e?._id);
                          setSelectedPath(e);
                          // console.log(e, "selected path details");
                          viewPath(e?.nameOfPath);
                        }}
                      >
                        <div className="admin-each-mypaths-name">{e?.nameOfPath}</div>
                        <div className="admin-each-mypaths-desc">
                          {e?.description}
                        </div>
                      </div>
                    );
                  })}
            </div>
          </>
        ) : (
          <>
            <div className="admin-mypathsNav">
              <div className="admin-mypathsName">Name</div>
              <div className="admin-mypathsCountry">Length</div>
              <div className="admin-mypathsCountry">Cost Structure</div>
              <div className="admin-mypathsMicrosteps">Services</div>
            </div>
            <div className="admin-mypathsScroll-div">
              {loading
                ? Array(10)
                    .fill("")
                    ?.map((e, i) => {
                      return (
                        <div
  className="admin-each-mypaths-data1"
  style={{ position: "relative" }} key={i}>
                          <div className="admin-each-mypaths-detail">
                            <div className="admin-each-mypathsName">
                              <Skeleton width={100} height={30} />
                            </div>
                            <div className="admin-each-mypathsCountry">
                              <Skeleton width={100} height={30} />
                            </div>
                            <div className="admin-each-mypathsCountry">
                              <Skeleton width={100} height={30} />
                            </div>
                            <div className="admin-each-mypathsMicrosteps">
                              <Skeleton width={100} height={30} />
                            </div>
                          </div>
                          <div className="admin-each-mypaths-desc">
                            <div className="admin-each-mypaths-desc-txt">
                              <Skeleton width={100} height={30} />
                            </div>
                            <div className="admin-each-mypaths-desc-txt1">
                              <Skeleton width={"100%"} height={30} />
                            </div>
                          </div>
                        </div>
                      );
                    })
                :filteredPartnerStepsData?.map((e) => {
  return (
    <div
      className="admin-each-mypaths-data1"
      key={e._id}   // ✅ FIXED
      onClick={() => {
        setSelectedStepId(e._id);
        setSelectedStep(e);
        setStepActionEnabled(true);
      }}
    >
      <div className="admin-each-mypaths-detail">
        <div className="admin-each-mypathsName">
          <div>{e?.name}</div>
          {/* <div style={{ fontSize: "0.8rem", fontWeight: "300" }}>
            {e?._id}
          </div> */}
        </div>

        <div className="admin-each-mypathsCountry">
          {e?.length || 0} Days
        </div>

        <div className="admin-each-mypathsCountry">
          {e?.cost}
        </div>

        <div className="admin-each-mypathsMicrosteps">
          {serviceCountMap[e._id] ?? 0}
        </div>
      </div>

      <div
  className="admin-each-mypaths-desc"
  style={{ paddingBottom: "36px" }}   // 👈 space for caption
>
  <div className="admin-each-mypaths-desc-txt">Description</div>
  <div className="admin-each-mypaths-desc-txt1">
    {e?.description}
  </div>
</div>
{/* CREATED BY + PATH INFO */}
<div
  style={{
    position: "absolute",
    left: "14px",
    bottom: "10px",
    width: "calc(100% - 28px)",
    fontSize: "11px",
    color: "#4b5563",
    lineHeight: "1.4",
    pointerEvents: "none",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  }}
>
  {/* CREATED BY SECTION */}
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "6px",
      marginBottom: "6px",
      flexWrap: "wrap",
    }}
  >
    <span style={{ color: "#6b7280", fontSize: "10.5px", fontWeight: 500 }}>
      CREATED BY
    </span>
    <span style={{ color: "#111827", fontWeight: 500 }}>
      {e?.email || "N/A"}
    </span>
    <span style={{ color: "#d1d5db" }}>•</span>
    <span style={{ color: "#6b7280" }}>
      {e?.createdAt
        ? new Date(e.createdAt).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })
        : "No date"}
    </span>
  </div>

  {/* BELONGS TO PATH */}
  {e?.path_id && pathNameMap[String(e.path_id)] && (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "4px 10px",
        borderRadius: "12px",
        background: "linear-gradient(135deg, #e0f2fe 0%, #dbeafe 100%)",
        border: "1px solid #bfdbfe",
        color: "#1e40af",
        fontSize: "10.5px",
        fontWeight: 600,
        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
      }}
    >
      <svg
        width="10"
        height="10"
        viewBox="0 0 16 16"
        fill="none"
        style={{ marginRight: "2px" }}
      >
        <path
          d="M8 1L10.5 5.5L15.5 6.5L12 10L13 15L8 12.5L3 15L4 10L0.5 6.5L5.5 5.5L8 1Z"
          fill="#3b82f6"
          fillOpacity="0.7"
        />
      </svg>
      <span>Belongs to:</span>
      <span style={{ color: "#1e3a8a", fontWeight: 700 }}>
        {pathNameMap[String(e.path_id)]}
      </span>
    </div>
  )}
</div>



    </div>
  );
})

                  }
            </div>
          </>
        )}

       {pathActionEnabled && (
  <>
    {/* ADD BACKDROP */}
    <div className="admin-popup-backdrop" onClick={() => resetPathAction()}></div>
    
    <div className="admin-acc-popular1">
      <div
        className="admin-acc-popular-top1"
        style={{
          display:
            pathActionStep === 3
              ? "none"
              : metaDataStep === "success"
              ? "none"
              : "",
        }}
      >
        <div className="admin-acc-popular-head1">
          {pathActionStep > 3 ? "Edit Paths" : pathActionStep >7 ? "Add service": "My Path Actions"}
        </div>
        <div
          className="admin-acc-popular-img-box1"
          style={{ cursor: "pointer" }}
          onClick={() => {
            resetPathAction();
          }}
        >
          <img className="admin-acc-popular-img1" src={closepop} alt="" />
        </div>
      </div>
      {pathActionStep === 1 && mypathsMenu !== "Pending Paths" && (
        <div className="admin-acc-mt-div">
          <div className="admin-acc-scroll-div">
            <div
              className="admin-acc-step-box4"
              onClick={() => {
                setPathActionStep(4);
              }}
            >
              Edit path
            </div>
            <div
              className="admin-acc-step-box4"
              onClick={() => {
                setPathActionStep(2);
              }}
            >
              Delete path
            </div>
            {admin && 
            <div
              className="admin-acc-step-box4"
              onClick={() => {
                setPathActionStep(6);
              }}
            >
              Reject Path
            </div>}
            <div
              className="admin-acc-step-box4"
              onClick={() => {
                setViewPathEnabled(true);
                setPathActionEnabled(false);
                navigate(`/dashboard/path/${selectedPathId}`)
              }}
            >
              View path
            </div>
          </div>
        </div>
      )}

      {pathActionStep === 1 && mypathsMenu === "Pending Paths" && (
        <div className="admin-acc-mt-div">
          <div className="admin-acc-scroll-div">
            <div
              className="admin-acc-step-box4"
              onClick={() => {
                setPathActionStep(5);
              }}
            >
              Approve Path
            </div>
            <div
              className="admin-acc-step-box4"
              onClick={() => {
                setPathActionStep(6);
              }}
            >
              Reject Path
            </div>
            <div
              className="admin-acc-step-box4"
              onClick={() => {
                setPathActionStep(9);
              }}
            >
              Add Services
            </div>
            <div
              className="admin-acc-step-box4"
              onClick={() => {
                setPathActionStep(4);
              }}
            >
              Edit path
            </div>
            <div
              className="admin-acc-step-box4"
              onClick={() => {
                setPathActionStep(2);
              }}
            >
              Delete path
            </div>
            <div
              className="admin-acc-step-box4"
              onClick={() => {
                setViewPathEnabled(true);
                setPathActionEnabled(false);
              }}
            >
              View path
            </div>
          </div>
        </div>
      )}

      {pathActionStep === 2 && (
        <div className="admin-acc-mt-div">
          <div className="admin-acc-scroll-div">
            <div
              className="admin-acc-step-box4"
              onClick={() => {
                deletePath();
              }}
            >
              Confirm and delete
            </div>
          </div>
          <div
            className="admin-goBack3"
            onClick={() => {
              setPathActionStep(1);
            }}
          >
            Go Back
          </div>
        </div>
      )}

      {actionLoading ? (
        <div className="admin-popularlogo">
          <img className="admin-popularlogoimg" src={lg1} alt="" />
        </div>
      ) : (
        ""
      )}

      {pathActionStep === 3 && (
        <div className="admin-success-box2">Path Successfully Deleted</div>
      )}

      {pathActionStep === 4 &&
        (editPaths === "default" ? (
          <div className="admin-acc-mt-div">
            <div className="admin-acc-sub-text">
              What type of data do you want to edit?
            </div>
            <div className="admin-acc-scroll-div">
              <div
                className="admin-acc-step-box"
                onClick={() => {
                  setStepActionStep(7);
                }}
              >
                Edit Step
              </div>
            </div>
            <div
              className="admin-goBack3"
              onClick={() => {
                setPathActionStep(1);
              }}
            >
              Go Back
            </div>
          </div>
        ) : editPaths === "Edit meta data" ? (
          metaDataStep === "default" ? (
            <div className="admin-acc-mt-div">
              <div className="admin-acc-sub-text">
                Which meta data do you want to edit?
              </div>
              <div className="admin-acc-scroll-div">
                <div
                  className="admin-acc-step-box4"
                  onClick={() => {
                    setMetaDataStep("nameOfPath");
                  }}
                >
                  Name
                </div>
                <div
                  className="admin-acc-step-box4"
                  onClick={() => {
                    setMetaDataStep("length");
                  }}
                >
                  Length
                </div>
                <div
                  className="admin-acc-step-box4"
                  onClick={() => {
                    setMetaDataStep("description");
                  }}
                >
                  Description
                </div>
                <div
                  className="admin-acc-step-box4"
                  onClick={() => {
                    setMetaDataStep("path_type");
                  }}
                >
                  Path type
                </div>
                <div
                  className="admin-acc-step-box4"
                  onClick={() => {
                    setMetaDataStep("destination_institution");
                  }}
                >
                  Destination institution
                </div>
                <div
                  className="admin-acc-step-box4"
                  onClick={() => {
                    setMetaDataStep("program");
                  }}
                >
                  Program
                </div>
                <div
                  className="admin-acc-step-box4"
                  onClick={() => {
                    setMetaDataStep("city");
                  }}
                >
                  City
                </div>
                <div
                  className="admin-acc-step-box4"
                  onClick={() => {
                    setMetaDataStep("country");
                  }}
                >
                  Country
                </div>
              </div>
              <div
                className="admin-goBack3"
                onClick={() => {
                  setEditPaths("default");
                }}
              >
                Go Back
              </div>
            </div>
          ) : metaDataStep === "success" ? (
            <div className="admin-success-box2">
              You have successfully updated the{" "}
              {metaDataStep === "nameOfPath"
                ? "name"
                : metaDataStep === "path_type"
                ? "path type"
                : metaDataStep === "destination_institution"
                ? "destination institution"
                : metaDataStep}{" "}
              for this page. You will automatically be redirected to the
              updated path page.
            </div>
          ) : (
            <>
              <div className="admin-acc-mt-div">
                <div className="admin-acc-scroll-div">
                  <div className="admin-acc-sub-textt">
                    Current{" "}
                    {metaDataStep === "nameOfPath"
                      ? "name"
                      : metaDataStep === "path_type"
                      ? "path type"
                      : metaDataStep === "destination_institution"
                      ? "destination institution"
                      : metaDataStep}
                  </div>
                  <div className="admin-acc-step-box5">
                    {selectedPath?.[metaDataStep] || ""}
                  </div>
                  <div className="admin-acc-sub-textt">
                    New{" "}
                    {metaDataStep === "nameOfPath"
                      ? "name"
                      : metaDataStep === "path_type"
                      ? "path type"
                      : metaDataStep === "destination_institution"
                      ? "destination institution"
                      : metaDataStep}
                  </div>
                  <div className="admin-acc-step-box6">
                    <input
                      type="text"
                      placeholder={`Enter ${
                        metaDataStep === "nameOfPath"
                          ? "name"
                          : metaDataStep === "path_type"
                          ? "path type"
                          : metaDataStep === "destination_institution"
                          ? "destination institution"
                          : metaDataStep
                      }`}
                      onChange={(e) => {
                        setNewValue(e.target.value);
                      }}
                      value={newValue}
                    />
                  </div>
                </div>
                <div
                  style={{
                    opacity: newValue?.length > 1 ? "1" : "0.5",
                    cursor:
                      newValue?.length > 1 ? "pointer" : "not-allowed",
                  }}
                  className="admin-save-Btn"
                  onClick={() => {
                    if (newValue?.length > 1) {
                      editMetaData(metaDataStep);
                    }
                  }}
                >
                  Save Changes
                </div>
                <div
                  className="admin-goBack3"
                  onClick={() => {
                    setMetaDataStep("default");
                  }}
                >
                  Go Back
                </div>
              </div>
              {actionLoading ? (
                <div className="admin-popularlogo">
                  <img className="admin-popularlogoimg" src={lg1} alt="" />
                </div>
              ) : (
                ""
              )}
            </>
          )
        ) : editPaths === "Edit steps" ? (
          <div className="admin-acc-mt-div">
            <div className="admin-acc-sub-text">
              How do you want to edit the steps in this path?
            </div>
            <div className="admin-acc-scroll-div">
              <div className="admin-acc-step-box4" onClick={e => {
                 setEditPaths("add_step");
              }}>Add new step</div>
              <div className="admin-acc-step-box4" onClick={e => {
                 setEditPaths("remove_step");
              }}>Remove existing step</div>
               <div className="admin-acc-step-box" onClick={e => {
                 setEditPaths("reorder_step");
              }}>Reorder existing steps</div>
            </div>
            <div
              className="admin-goBack3"
              onClick={() => {
                setEditPaths("default");
              }}
            >
              Go Back
            </div>
          </div>
        ): editPaths === "add_step" ? (
          <div className="admin-acc-mt-div">
            <div className="admin-acc-sub-text">
            Which step do you want to add?
            </div>
            <div className="admin-acc-scroll-div" >
              {partnerStepsData?.map(item => (
              <div className="admin-acc-step-box6" onClick={e => {
                setEditPaths("add_sub_step");
                setStepId(item?._id)
              }}>
                <div style={{fontWeight: 600, fontSize:"14px"}}>{item?.name}</div><br/>
                <div style={{fontWeight: 300, fontSize:"12px", lineHeight:"25px", paddingBottom:"10px", borderBottom:'1px solid #e7e7e7'}}>{item?.description?.substring(0, 150) + "..."}</div>
              </div>
              ))}
              
            </div>
            <div
              className="admin-goBack3"
              onClick={() => {
                setEditPaths("default");
              }}
            >
              Go Back
            </div>
          </div>
        ) : editPaths === "add_sub_step" ? (
          <div className="admin-acc-mt-div">
            <div className="admin-acc-sub-text">
            Select backup path for this step
            </div>
            <div className="admin-acc-scroll-div" >
              {backupPathData?.map(item => (
              <div className="admin-substepstyle" onClick={e => {
                setEditPaths("show_all_paths");
                setBackupPathId(item?._id)
              }}>
                <div style={{fontWeight: 600, fontSize:"14px", display:'flex', justifyContent:'space-between'}}>
                  <div>{item?.program}</div> 
                  <div>{item?.destination_institution}</div>
                </div>
                <div style={{fontWeight: 300, fontSize:"12px", lineHeight:"25px",}}>{item?.description?.substring(0, 150) + "..."}</div><br/>
                <div style={{paddingBottom:"10px", fontWeight: 300, fontSize:"12px", lineHeight:"25px"}}>Path id: {item?._id}</div>
              </div>
              ))}
              
            </div>
            <div
              className="admin-goBack3"
              onClick={() => {
                setEditPaths("default");
              }}
            >
              Go Back
            </div>
          </div>
        ): editPaths === "show_all_paths" ? (
          <div className="admin-acc-mt-div">
            <div className="admin-acc-sub-text">
            Select the positioning of the new step
            </div>
            <div className="admin-acc-scroll-div" style={{}}>
              {selectedPath?.the_ids?.map((item, index) => (
                <>
                  <div className="admin-subpathstyle">
                    <div style={{fontWeight: 600, fontSize:"14px"}}>
                      <div>{selectedPath?.nameOfPath}</div>                        
                    </div>
                    <div style={{fontWeight: 300, fontSize:"12px", lineHeight:"25px",}}>{selectedPath?.description?.substring(0, 150) + "..."}</div><br/>
                    <div style={{fontWeight: 600, fontSize:"14px", display:'flex', justifyContent:'space-between', paddingBottom:"10px"}}>Backup Path</div>
                    <div style={{borderRadius:"15px", border:"1px solid #e7e7e7", padding:'10px'}}>
                      {item?._id}
                    </div>
                  </div>
                  <center>
                  <div className="admin-placehere" onClick={e => handlePlace(selectedPath, index+1)}>Place Here</div>
                  </center>
                </>
              ))}
              
            </div>
            <div
              className="admin-goBack3"
              onClick={() => {
                setEditPaths("default");
              }}
            >
              Go Back
            </div>
          </div>
        ) :editPaths === "remove_step" ? (
          <div className="admin-acc-mt-div">
            <div className="admin-acc-sub-text">
            Select the positioning of the new step
            </div>
            <div className="admin-acc-scroll-div" style={{}}>
              {selectedPath?.the_ids?.map((item, index) => (
                <>
                  <div className="admin-subpathstyle" style={{position:"relative"}}>
                    <div className="admin-deletePathStyle" onClick={e => handledeletePathPosition(selectedPath, item?._id)}>
                      <img src={require("./delete.svg").default} alt="" />
                    </div>
                    <div style={{fontWeight: 600, fontSize:"14px"}}>
                      <div>{selectedPath?.nameOfPath}</div>                        
                    </div>
                    <div style={{fontWeight: 300, fontSize:"12px", lineHeight:"25px",}}>{selectedPath?.description?.substring(0, 150) + "..."}</div><br/>
                    <div style={{fontWeight: 600, fontSize:"14px", display:'flex', justifyContent:'space-between', paddingBottom:"10px"}}>Backup Path</div>
                    <div style={{borderRadius:"15px", border:"1px solid #e7e7e7", padding:'10px'}}>
                      {item?._id}
                    </div>
                  </div>
                  
                </>
              ))}
              
            </div>
            <div
              className="admin-goBack3"
              onClick={() => {
                setEditPaths("default");
              }}
            >
              Go Back
            </div>
          </div>
        ):editPaths === "reorder_step" ? (
          <div className="admin-acc-mt-div">
            <div className="admin-acc-sub-text">
            Select the positioning of the new step
            </div>
            <div className="admin-acc-scroll-div" style={{}}>
              <Draggable onPosChange={getChangedPos}>
                {selectedPath?.the_ids?.map((item, index) => (
                  <>
                    <div className="admin-subpathstyle" style={{position:"relative"}}>
                     
                      <div style={{fontWeight: 600, fontSize:"14px"}}>
                        <div>{selectedPath?.nameOfPath}</div>                        
                      </div>
                      <div style={{fontWeight: 300, fontSize:"12px", lineHeight:"25px",}}>{selectedPath?.description?.substring(0, 150) + "..."}</div><br/>
                      <div style={{fontWeight: 600, fontSize:"14px", display:'flex', justifyContent:'space-between', paddingBottom:"10px"}}>Backup Path</div>
                      <div style={{borderRadius:"15px", border:"1px solid #e7e7e7", padding:'10px'}}>
                        {item?._id}
                      </div>
                    </div>
                    
                  </>
                ))}
              </Draggable>
            </div>
            <div
              className="admin-goBack3"
              onClick={() => {
                setEditPaths("default");
              }}
            >
              Go Back
            </div>
          </div>
        )  : editPaths === "Edit who qualifies" ? (
          <div className="admin-acc-mt-div">
            <div className="admin-acc-sub-text">
              Which of the current coordinates do you want to edit?
            </div>
            <div className="admin-acc-scroll-div">
              <div className="admin-acc-step-box4">Grade</div>
              <div className="admin-acc-step-box4">Grade point avg</div>
              <div className="admin-acc-step-box4">Curriculum</div>
              <div className="admin-acc-step-box4">Stream</div>
              <div className="admin-acc-step-box4">Financial situation</div>
              <div className="admin-acc-step-box4">Personality</div>
            </div>
            <div
              className="admin-goBack3"
              onClick={() => {
                setEditPaths("default");
              }}
            >
              Go Back
            </div>
          </div>
        ) : (
          ""
        ))}
        {pathActionStep === 5 &&     
          <div className="admin-acc-mt-div">
            <div className="admin-acc-sub-text">
            Are you sure you want to approve this path?
            </div>
            <div className="admin-acc-scroll-div">
              <div
                className="admin-acc-step-box4"
                onClick={e => handleApprovePath()}
              >
               Yes
              </div>
              <div
                className="admin-acc-step-box4"
                onClick={() => {
                  setPathActionStep(1);
                }}
              >
               Never mind
              </div>
             
            </div>
            <div
              className="admin-goBack3"
              onClick={() => {
                setPathActionStep(1);
              }}
            >
              Go Back
            </div>
          </div>
        }
        {pathActionStep === 6 &&
          <div className="admin-acc-mt-div">
            <div className="admin-acc-sub-text">
            Are you sure you want to reject this path?
            </div>
            <div className="admin-acc-scroll-div">
              <div
                className="admin-acc-step-box4"
                onClick={() => {
                  handleRejectPath()
                }}
              >
                Yes
              </div>
              <div
                className="admin-acc-step-box4"
                onClick={() => {
                  setPathActionStep(1);
                }}
              >
                Never mind
              </div>
              
            </div>
            <div
              className="admin-goBack3"
              onClick={() => {
                setPathActionStep(1);
              }}
            >
              Go Back
            </div>
          </div>
        }
        {pathActionStep === 7 && (
          <div className="admin-success-box2">Path is Approved.</div>
        )}
        {pathActionStep === 8 && (
          <div className="admin-success-box2">Path is Rejected.</div>
        )}

        {pathActionStep === 9 &&
          <div className="admin-acc-mt-div">
            <div className="admin-acc-sub-text">
            Which step do you want to add the service to?
            </div>
            <div className="admin-acc-scroll-div">
              {selectedPath && selectedPath?.StepDetails?.map(item => (
                <div
                  className="admin-acc-step-box4"
                  style={{flexDirection:'column', alignItems:'flex-start', justifyContent:'center'}}
                  onClick={() => {
                    setAddServiceStep(item)
                  setPathActionStep(10)
                }}
                >
                  <div>{item?.name}</div> 
                  <div style={{fontSize:'12px', fontWeight: 400, paddingTop:'5px'}}>{item?._id}</div>
                </div>
              ))}
            </div>
            <div
              className="admin-goBack3"
              onClick={() => {
                setPathActionStep(1);
              }}
            >
              Go Back
            </div>
          </div>
        }
    </div>
  </>
)}

{stepActionEnabled && (
  <>
    {/* ADD BACKDROP */}
    <div className="admin-popup-backdrop" onClick={() => {
      setStepActionEnabled(false);
      setStepActionStep(1);
      setSelectedStepId("");
      setSelectedStep(null);
    }}></div>
    
    <div className="admin-acc-popular1">
      <div
        className="admin-acc-popular-top"
        style={{ display: stepActionStep === 3 ? "none" : "" }}
      >
        <div className="admin-acc-popular-head">My Step Actions</div>
        <div
          className="admin-acc-popular-img-box"
          style={{ cursor: "pointer" }}
          onClick={() => {
            setStepActionEnabled(false);
            setStepActionStep(1);
            setSelectedStepId("");
            setSelectedStep(null);
          }}
        >
          <img className="admin-acc-popular-img" src={closepop} alt="" />
        </div>
      </div>

      {stepActionStep === 1 && (
        <div style={{ marginTop: "3rem" }}>
          <div
            className="admin-acc-step-box"
            onClick={() => {
              setStepActionStep(4);
            }}
          >
            Edit Services
          </div>
          <div
            className="admin-acc-step-box"
            onClick={() => {
              setStepActionStep(7);
            }}
          >
            Edit Step
          </div>
          <div
            className="admin-acc-step-box"
            onClick={() => {
              deleteStep();
            }}
          >
            Delete step
          </div>
        </div>
      )}

      {stepActionStep === 2 && (
        <div style={{ marginTop: "3rem" }}>
          <div
            className="admin-acc-step-box"
            onClick={() => {
              deleteStep();
            }}
          >
            Confirm and delete
          </div>
          <div
            className="admin-goBack2"
            onClick={() => {
              setStepActionStep(1);
            }}
          >
            Go Back
          </div>
        </div>
      )}

      {stepActionStep === 3 && (
        <div className="admin-success-box1">Step Successfully Deleted</div>
      )}

      {stepActionStep === 4 && (
        <div className="admin-acc-mt-div">
          <div className="admin-acc-sub-text">What do you want to do?</div>
          <div className="admin-acc-scroll-div">
            <div
              className="admin-acc-step-box4"
              style={{
                flexDirection: "column",
                alignItems: "flex-start",
                justifyContent: "center",
              }}
              onClick={() => setStepActionStep(5)}
            >
              <div>Add a Service</div>
            </div>
            <div
              className="admin-acc-step-box4"
              style={{
                flexDirection: "column",
                alignItems: "flex-start",
                justifyContent: "center",
              }}
              onClick={() => setStepActionStep(6)}
            >
              <div>Remove a Service</div>
            </div>
          </div>
          <div
            className="admin-goBack3"
            onClick={() => {
              setStepActionStep(1);
            }}
          >
            Go Back
          </div>
        </div>
      )}
      
      {stepActionStep === 5 && (
        <div className="admin-acc-mt-div">
          <div className="admin-acc-sub-text">
            Which service do you want to add?
          </div>

          <div className="admin-acc-scroll-div">
            {allServices.length > 0 ? (
              allServices.map(item => {
                const isAlreadyAdded = attachedServices?.some(
                  s => s._id === item._id
                );

                return (
                  <div
                    key={item._id}
                    className="admin-acc-step-box4"
                    onClick={() => {
                      if (!isAlreadyAdded) addServiceToStepInstant(item._id);
                    }}
                    style={{
                      flexDirection: "column",
                      alignItems: "flex-start",
                      justifyContent: "center",
                      cursor: isAlreadyAdded ? "not-allowed" : "pointer",
                      opacity: isAlreadyAdded ? 0.5 : 1,
                    }}
                  >
                    <div style={{ fontWeight: 500 }}>
                      {item.name}
                    </div>

                    {isAlreadyAdded && (
                      <div style={{ fontSize: 12, color: "#28a745", marginTop: 4 }}>
                        ✔ Already added
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div style={{ opacity: 0.6 }}>No services found</div>
            )}
          </div>

          <div
            className="admin-goBack3"
            onClick={() => {
              setStepActionStep(1);
            }}
          >
            Go Back
          </div>
        </div>
      )}

      {stepActionStep === 6 && (
        <div className="admin-acc-mt-div">
          <div className="admin-acc-sub-text">
            Which service do you want to remove?
          </div>
          <div className="admin-acc-scroll-div">
            {attachedServices.length > 0 ? (
              attachedServices.map(item => (
                <div
                  key={item._id}
                  className="admin-acc-step-box4"
                  style={{
                    flexDirection: "column",
                    alignItems: "flex-start",
                    justifyContent: "center",
                  }}
                  onClick={() => removeServiceFromStep(item._id)}
                >
                  <div style={{ fontWeight: 500 }}>
                    {item.name}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ opacity: 0.6 }}>
                No services attached to this step
              </div>
            )}
          </div>
          <div
            className="admin-goBack3"
            onClick={() => {
              setStepActionStep(1);
            }}
          >
            Go Back
          </div>
        </div>
      )}

      {stepActionStep === 7 && selectedStep && (
        <EditStepForm
          selectedStep={selectedStep}
          onSave={(updatedStep) => {
            setPartnerStepsData((prev) =>
              prev.map((step) =>
                step._id === updatedStep._id
                  ? { ...step, ...updatedStep }
                  : step
              )
            );
            setSelectedStep(updatedStep);
            setStepActionEnabled(false);
            setStepActionStep(1);
          }}
          onCancel={() => {
            setStepActionEnabled(false);
            setStepActionStep(1);
            setSelectedStep(null);
          }}
        />
      )}

      {stepActionStep === 8 && (
        <div className="admin-acc-mt-div">
          <div className="admin-acc-sub-text">
            Add New Step Functionality Coming Soon!
          </div>
          <div
            className="admin-goBack3"
            onClick={() => {
              setStepActionStep(7);
            }}
          >
            Go Back
          </div>
        </div>
      )}

      {stepActionStep === 9 && (
        <div className="admin-acc-mt-div">
          <div className="admin-acc-sub-text">
            Remove Existing Step Functionality Coming Soon!
          </div>
          <div
            className="admin-goBack3"
            onClick={() => {
              setStepActionStep(7);
            }}
          >
            Go Back
          </div>
        </div>
      )}

      {stepActionStep === 10 && (
        <div className="admin-acc-mt-div">
          <div className="admin-acc-sub-text">
            Reorder Existing Steps Functionality Coming Soon!
          </div>
          <div
            className="admin-goBack3"
            onClick={() => {
              setStepActionStep(7);
            }}
          >
            Go Back
          </div>
        </div>
      )}

      {actionLoading ? (
        <div className="admin-popularlogo">
          <img className="admin-popularlogoimg" src={lg1} alt="" />
        </div>
      ) : (
        ""
      )}
    </div>
  </>
)}
       
                           {/* {showSelectedPath && <CurrentStep productDataArray={[]}/>} */}
       
       
       
                       </div>
                   </div>
               
           );
       };
       

export default MyStepsAdmin;