import React, { useState, useEffect } from "react";
import { useCoinContextData } from "../../context/CoinContext";
import Skeleton from "react-loading-skeleton";
import "./mypaths.scss";
import axios from "axios";
import { Draggable } from "react-drag-reorder";
import EditPathForm from "../MyPaths/paths.jsx";


// images
import dummy from "./dummy.svg";
import closepop from "../../static/images/dashboard/closepop.svg";
import lg1 from "../../static/images/login/lg1.svg";
import CurrentStep from "../CurrentStep";
import { useStore } from "../../components/store/store.ts";
import { useNavigate } from "react-router-dom";
const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const MyPaths = ({ search, admin, fetchAllServicesAgain, stpesMenu }) => {
  const navigate = useNavigate();
  const { sideNav, setsideNav } = useStore();
  let userDetails = JSON.parse(localStorage.getItem("partner"));
  const {
    setCurrentStepData,
    setCurrentStepDataLength,
    mypathsMenu,
    setMypathsMenu,
  } = useCoinContextData();
  const [partnerPathData, setPartnerPathData] = useState([]);
  const [loading, setLoading] = useState(false);
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

  const [showSelectedPath, setShowSelectedPath] = useState(null);
  const [addServiceStep, setAddServiceStep] = useState(null);
  const [selectedSubStep, setSelectedSubStep] = useState(null);

  const [backupPathData, setBackupPathData] = useState([]);
  const [stepId, setStepId] = useState("");
  const [backupPathId, setBackupPathId] = useState("");

const getAllPaths = () => {
  setPartnerPathData([]);
  setLoading(true);

const email = userDetails?.email;
let endpoint = "";

// ADMIN
if (
  admin &&
  (mypathsMenu === "Pending Approval" || mypathsMenu === "Pending Paths")
) {
  endpoint = `/api/paths/get?status=waitingforapproval`;
}

// PARTNER Draft
else if (!admin && mypathsMenu === "Draft") {
  endpoint = `/api/paths/get?email=${email}&status=draft`;
}

// PARTNER Pending
else if (!admin && mypathsMenu === "Pending Approval") {
  endpoint = `/api/paths/get?email=${email}&status=waitingforapproval`;
}

// Inactive
else if (mypathsMenu === "Inactive Paths") {
  endpoint = `/api/paths/get?email=${email}&status=inactive`;
}

// Default Active
else {
  endpoint = `/api/paths/get?email=${email}&status=active`;
}

console.log("➡️ FINAL API CALL:", `${BASE_URL}${endpoint}`);

axios
  .get(`${BASE_URL}${endpoint}`)
  .then((response) => {
    setPartnerPathData(response?.data?.data || []);
  })
  .catch((error) => {
    console.log("❌ Error fetching partnerPathData:", error);
  })
  .finally(() => setLoading(false));
};




  // const [remainingStepData, setRemainingStepData] = useState([]);
  // const getAllStepsForPath = () => {
  //   setLoading(true);
  //   let email = userDetails?.email;

  //   axios
  //     .get(
  //       `/api/paths/getremainingsteps?path_id=${selectedPathId}&&email=${email}`
  //     )
  //     .then((response) => {
  //       let result = response?.data?.stepIds;
  //       console.log("selectedPath:", selectedPath);  // Check if selectedPath is being set correctly
  //       console.log("selectedPath._Id:", selectedPathId);  // Ensure _Id exists

  //       console.log(result, "partnerStepsData result");
  //       setRemainingStepData(result);
  //       setLoading(false);
  //     })
  //     .catch((error) => {
  //       console.log(error, "error in partnerStepsData");
  //     });
  // };

  // useEffect(() => {
  //   getAllStepsForPath();
  // }, [selectedPath]);

  const [allServices, setAllServices] = useState([]);

  const getAllServices = () => {
    let email = userDetails?.email;

    // axios.get(`https://comms.globalxchange.io/gxb/product/banker/get?category=education%20consultants`).then(({data}) => {
    //   if(data.status){
    //     setAllServices(data.data)
    //   }
    // })
    axios
      .get(
        `${BASE_URL}/api/attachservice/getnotaddedservices?step_id=${selectedStepId}&productcreatoremail=${email}`
      )
      .then(({ data }) => {
        if (data.status) {
          console.log(data, "lhqflqhflqhflqf");
          setAllServices(data.data);
        }
      });
  };

/* ------------------------------
   1️⃣ Load backup paths ONCE
--------------------------------*/
useEffect(() => {
  const email = userDetails?.email;
  if (!email) return;

  axios.get(`${BASE_URL}/api/paths/get?email=${email}`).then(({ data }) => {
    if (data.status) setBackupPathData(data.data);
  });
}, []);

/* ------------------------------
   2️⃣ Load services when step changes
----------------------------------*/
useEffect(() => {
  if (!selectedStepId) return;
  getAllServices();
}, [selectedStepId]);


  //   setLoading(true);
  //   axios
  //     .get(
  //       `/api/paths/get?status=waitingforapproval`
  //     )
  //     .then((response) => {
  //       let result = response?.data?.data;
  //       // console.log(result, "partnerPathData result");
  //       setPartnerPathData(result);
  //       setLoading(false);
  //     })
  //     .catch((error) => {
  //       console.log(error, "error in partnerPathData");
  //     });
  // };

useEffect(() => {
  if (selectedPath?.StepDetails) {
    console.log(selectedPath.StepDetails, "lwkefhlkwefcwefc");
  }
}, [selectedPath]);


//   3️⃣ Load paths when menu changes 
//    (Fix: prevents duplicate calls)
// ----------------------------------*/
useEffect(() => {
  let cancelled = false;

  const loadPaths = async () => {
    if (cancelled) return;

    // Single source of truth
    await getAllPaths();
  };

  loadPaths();
  return () => (cancelled = true);
}, [mypathsMenu]);




  const myPathsTimeout = () => {
    setTimeout(reload1, 2000);
  };

  function reload1() {
    
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
    setStepActionEnabled(false);
    setStepActionStep(1);
    setSelectedStepId("");
  }

  const deletePath = (status) => {
    setActionLoading(true);
  
    axios
      .delete(`${BASE_URL}/api/paths/delete/${selectedPathId}`, {
        data: { status }, // Include the status in the request body
      })
      .then((response) => {
        let result = response?.data;
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
      .delete(`${BASE_URL}/api/steps/delete/${selectedStepId}`)
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
        `${BASE_URL}/api/paths/update/${selectedPathId}`,
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

const viewPathById = (id) => {
    if (!id) {
        console.error("❌ NO ID SENT TO API");
        return;
    }
    setViewPathLoading(true);

    axios.get(`${BASE_URL}/api/paths/viewpath/${id}`)
        .then((response) => {
            let result = response?.data?.data;
            setViewPathData(result);
        })
        .catch((error) => {
            console.log("Error in fetching view path data:", error);
        })
        .finally(() => setViewPathLoading(false));
};



const handleApprovePath = () => {
  setActionLoading(true);

  axios
    .put(`${BASE_URL}/api/paths/updatepath/${selectedPathId}`, {
      status: "active",
    })
    .then(({ data }) => {
      if (data.status) {
        getAllPaths();
        setPathActionEnabled(false);
        setActionLoading(false);
        setPathActionStep(1);
      }
    })
    .catch(() => setActionLoading(false));
};

const handleRejectPath = () => {
  setActionLoading(true);

  axios
    .put(`${BASE_URL}/api/paths/updatepath/${selectedPathId}`, {
      status: "draft",
    })
    .then(({ data }) => {
      if (data.status) {
        setMypathsMenu("Draft");   // 👈 automatically switch tab
        getAllPaths();
        setPathActionEnabled(false);
        setActionLoading(false);
        setPathActionStep(1);
      }
    })
    .catch(() => setActionLoading(false));
};

  const handleAddService = (newId) => {
    setActionLoading(true);

    axios
      .post(
        `${BASE_URL}/api/steps/addproducts/${selectedStepId}`,
        {
          product_ids: [newId],
        }
      )
      .then(({ data }) => {
        if (data.status) {
         getAllPaths();

          getAllServices();
          setPathActionEnabled(false);
          setStepActionEnabled(false);
          setActionLoading(false);
          setPathActionStep(1);
          setActionLoading(false);
          fetchAllServicesAgain();
        }
      });
  };

/* ------------------------------
   6️⃣ Reset selected path when menu changes
----------------------------------*/
useEffect(() => {
  setShowSelectedPath(null);
}, [mypathsMenu]);

  const [productDataArray, setProductDataArray] = useState([]);
  const [productKeys, setProductKeys] = useState(null);

  const [allServicesToAdd, setAllServicesToAdd] = useState([]);
  useEffect(() => {
    if (selectedStepId) {
      axios.get(
  `${BASE_URL}/api/attachservice/getnotaddedservices?step_id=${selectedStepId}&productcreatoremail=${userDetails?.user?.email}`
)
        .then(({ data }) => {
          if (data.status) {
            setAllServicesToAdd(data?.data[0]);
          }
        });
    }
  }, [selectedStepId]);

  const [allServicesToRemove, setAllServicesToRemove] = useState([]);
  useEffect(() => {
    if (selectedStepId) {
      axios.get(
  `${BASE_URL}/api/attachservice/get?step_id=${selectedStepId}`
)
        .then(({ data }) => {
          if (data.status) {
            setAllServicesToRemove(data?.data[0]);
          }
        });
    }
  }, [selectedStepId]);

 

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
    console.log(stepActionStep, "ejbfkwjebfkwef");
  }, [stepActionStep]);

  
  const fetchData = async () => {
    setProductDataArray([]);
    console.log(productKeys, "ewlkhflkwheflwerf");
    if (productKeys && Array.isArray(productKeys)) {
      // Check if productKeys exists and is an array
      const fetchDataPromises = productKeys.map((id) => fetchProductData(id)); // Map over the IDs directly

      try {
        const results = await Promise.all(fetchDataPromises);
        const updatedProductDataArray = results.filter(Boolean);
        setProductDataArray([...updatedProductDataArray]);
      } catch (error) {
        console.error("Error fetching product data:", error);
      }
    } else {
      console.warn("Product keys is not a valid array:", productKeys);
    }
  };
  useEffect(() => {
    // Fetch updated product data when productKeys change
    fetchData();
  }, [productKeys]);

  const handlePlace = (item, index) => {
    console.log(item, index, "lwkeflkwefwef");
    const updatedPathObject = addIdToObjectAtIndex(
      item?.the_ids,
      stepId,
      backupPathId,
      index
    );
    // console.log(updatedPathObject, "kjwebfkwjebfkwejf")
    axios
      .put(
        `${BASE_URL}/api/paths/update/${selectedPath?._id}`,
        { the_ids: updatedPathObject }
      )
      .then((res) => {
        if (res.data.status) {
          resetPathAction();
          getAllPaths();
        }
      });
  };

  function addIdToObjectAtIndex(idsArray, stepId, backupPathId, index) {
    // Create a shallow copy of the original array and extract only necessary properties
    const newArray = idsArray.map(({ step_id, backup_pathId }) => ({
      step_id,
      backup_pathId,
    }));

    // Create a new object with the provided stepId and backupPathId
    let newIdObject;
    if (backupPathId) {
      newIdObject = {
        step_id: stepId,
        backup_pathId: backupPathId,
      };
    } else {
      newIdObject = {
        step_id: stepId,
      };
    }

    // Insert the new object at the specified index using splice
    newArray.splice(index, 0, newIdObject);

    return newArray;
  }

  const handledeletePathPosition = (fullObject, idToDelete) => {
    const updatedTheIds = [...fullObject.the_ids];

    // Find the index of the object with the specified _id in the copied array
    const indexToDelete = updatedTheIds.findIndex(
      (obj) => obj._id === idToDelete
    );

    // If the object with the specified _id is found, remove it from the copied array
    if (indexToDelete !== -1) {
      updatedTheIds.splice(indexToDelete, 1);
    }

    // Return the updated array with only step_id and backup_pathId keys
    const updatedBody = updatedTheIds.map(({ step_id, backup_pathId }) => ({
      step_id,
      backup_pathId,
    }));
    axios
      .put(
        `${BASE_URL}/api/paths/update/${selectedPath?._id}`,
        { the_ids: updatedBody }
      )
      .then((res) => {
        if (res.data.status) {
          resetPathAction();
          getAllPaths();
        }
      });
  };

  const getChangedPos = (currentPos, newPos) => {
    console.log(currentPos, newPos, "kjwbefkwbfkwbfkwjf");
    updatePositionOfObject(selectedPath, currentPos, newPos);
  };

  function updatePositionOfObject(fullObject, currentIndex, newIndex) {
    const updatedTheIds = [...fullObject.the_ids];
    const [movedObject] = updatedTheIds.splice(currentIndex, 1);
    updatedTheIds.splice(newIndex, 0, movedObject);
    // console.log(fullObject.the_ids, updatedTheIds, "kjwekfjwefkjwegfkwfgwf")
    const updatedTheIdsArray = updatedTheIds.map(
      ({ step_id, backup_pathId }) => ({ step_id, backup_pathId })
    );
    axios
      .put(
        `${BASE_URL}/api/paths/update/${selectedPath?._id}`,
        { the_ids: updatedTheIdsArray }
      )
      .then((res) => {
        if (res.data.status) {
          resetPathAction();
          getAllPaths();
        }
      });
  }
  const [selectedServices, setSelectedServices] = useState([]);
  const handleSelectServicesForStep = (item) => {
    // Check if the item is already selected
    const isSelected = selectedServices.includes(item);

    if (isSelected) {
      // If already selected, remove it
      const updatedServices = selectedServices.filter(
        (service) => service !== item
      );
      setSelectedServices(updatedServices);
    } else {
      // If not selected, add it
      setSelectedServices([...selectedServices, item]);
    }
  };

  const addServicesToStep = () => {
    setActionLoading(true);
    setLoading(true);
    console.log(
      {
        step_id: selectedStepId,
        service_ids: [...selectedServices],
      },
      "lkweflkjwhefkjwef"
    );
    axios
      .post(`${BASE_URL}/api/attachservice/add`, {
        step_id: selectedStepId,
        service_ids: [...selectedServices],
      })
      .then(({ data }) => {
        if (data.status) {
          setStepActionEnabled(false);
        }
        setActionLoading(false);
        setLoading(false);
        setSelectedServices([]);
      });
  };

  const removeServiceFromStep = (id) => {
    axios
      .put(
        `${BASE_URL}/api/attachservice/remove/${allServicesToRemove?._id}`,
        {
          service_id: id,
        }
      )
      .then(({ data }) => {
        if (data.status) {
          setStepActionEnabled(false);
          setActionLoading(false);
          setLoading(false);
        }
      });
  };

  useEffect(() => {
    if (!stepActionEnabled) {
      setSelectedServices([]);
      setStepActionStep(1);
    }
  }, [stepActionEnabled]);

useEffect(() => {
  if (!mypathsMenu) {
      setMypathsMenu("Paths");
  }
}, []);



  const handleEditSubmit = () => {
    setPathActionStep(1); // Reset pathActionStep after edit submission
};

  

  return (
    <div className="mypaths">
      <div className="mypaths-menu">
        <div
          className="each-mypath-menu"
          style={{
            fontWeight: mypathsMenu === "Paths" ? "700" : "",
            background:
              mypathsMenu === "Paths" ? "rgba(241, 241, 241, 0.5)" : "",
          }}
          onClick={() => {
            setMypathsMenu("Paths");
            if (viewPathEnabled) {
              setViewPathEnabled(false);
              setViewPathData([]);
            }
          }}
        >
          {admin ? "Active Paths" : "Paths"}
        </div>
        <div
  className="each-mypath-menu"
  style={{
    fontWeight: mypathsMenu === "Draft" ? "700" : "",
    background:
      mypathsMenu === "Draft"
        ? "rgba(241, 241, 241, 0.5)"
        : "",
  }}
  onClick={() => {
    setMypathsMenu("Draft");
    setViewPathEnabled(false);
    setViewPathData([]);
  }}
>
  Draft
</div>

        <div
          className="each-mypath-menu"
          style={{
            fontWeight: mypathsMenu === "Pending Approval" ? "700" : "",
            background:
              mypathsMenu === "Pending Approval"
                ? "rgba(241, 241, 241, 0.5)"
                : "",
          }}
          onClick={() => {
            setMypathsMenu("Pending Approval");
            if (viewPathEnabled) {
              setViewPathEnabled(false);
              setViewPathData([]);
            }
          }}
        >
          Pending Approval
        </div>
        <div
          className="each-mypath-menu"
          style={{
            fontWeight: mypathsMenu === "Inactive Paths" ? "700" : "",
            background:
              mypathsMenu === "Inactive Paths"
                ? "rgba(241, 241, 241, 0.5)"
                : "",
          }}
          onClick={() => {
            setMypathsMenu("Inactive Paths");
            if (viewPathEnabled) {
              setViewPathEnabled(false);
              setViewPathData([]);
            }
          }}
        >
          Inactive Paths
        </div>
        {admin && (
          <div
            className="each-mypath-menu"
            style={{
              fontWeight: mypathsMenu === "Pending Paths" ? "700" : "",
              background:
                mypathsMenu === "Pending Paths"
                  ? "rgba(241, 241, 241, 0.5)"
                  : "",
            }}
            onClick={() => {
              setMypathsMenu("Pending Paths");
              if (viewPathEnabled) {
                setViewPathEnabled(false);
                setViewPathData([]);
              }
            }}
          >
            Pending Paths
          </div>
        )}
        
      </div>
      <div className="mypaths-content">
        {
          showSelectedPath ? (
            <div>
              <CurrentStep
                productDataArray={productDataArray}
                selectedPathId={selectedPathId}
                showSelectedPath={showSelectedPath}
                selectedPath={selectedPath}
              />
            </div>
          ) : viewPathEnabled ? (
            <div className="viewpath-container">
 <div className="viewpath-top-area">
   <div>Your Selected Path:</div>

   <div className="viewpath-bold-text">
      {viewPathData?.destination_institution}
   </div>

   <div className="viewpath-des">
      {viewPathData?.description}
   </div>

   <div
      className="viewpath-goBack-div"
      onClick={() => setViewPathEnabled(false)}
   >
      Go Back
   </div>
</div>

<div className="viewpath-steps-area">
   {viewPathData?.StepDetails?.map((e, i) => (
      <div
         key={i}
         onClick={() => {
            setShowSelectedPath(e);
            setProductKeys(e?.product_ids);
         }}
         className="viewpath-each-j-step viewpath-relative-div"
      >
         <div className="viewpath-each-j-img">
            <img src={e?.icon} alt="" />
         </div>
         <div className="viewpath-each-j-step-text">{e?.name}</div>
         <div className="viewpath-each-j-step-text1">{e?.description}</div>
         <div className="viewpath-each-j-amount-div">
            <div className="viewpath-each-j-amount">{e?.cost}</div>
         </div>
      </div>
   ))}
</div>

            </div>
          ) : mypathsMenu === "Paths" ||
           mypathsMenu === "Draft" ||
            mypathsMenu === "Pending Approval" ||
            mypathsMenu === "Inactive Paths" ||
            (mypathsMenu === "Pending Paths" && !viewPathEnabled) ? (
            <>
              <div className="mypathsNav">
                <div className="mypaths-name-div">Name</div>
                <div className="mypaths-description-div">Description</div>
                <div className="mypaths-name-div"># of steps</div>
              </div>
              <div className="mypathsScroll-div">
                {loading
                  ? Array(10)
                      .fill("")
                      .map((e, i) => {
                        return (
                          <div className="each-mypaths-data" key={i}>
                            <div className="each-mypaths-name">
                              <Skeleton width={100} height={30} />
                            </div>
                            <div className="each-mypaths-desc">
                              <Skeleton width={"100%"} height={30} />
                            </div>
                            <div className="each-mypaths-name">
                              <Skeleton width={100} height={30} />
                            </div>
                          </div>
                        );
                      })
// ✅ Fix - filter by search before mapping
: partnerPathData
    ?.filter((e) =>
      !search ||
      e?.nameOfPath?.toLowerCase().includes(search.toLowerCase()) ||
      e?.description?.toLowerCase().includes(search.toLowerCase()) ||
      e?.destination_institution?.toLowerCase().includes(search.toLowerCase())
    )
    ?.map((e, i) => {
  return (
    <div
      className="each-mypaths-data"
      key={i}
      onClick={() => {
        setSelectedPathId(e?._id);
        setSelectedPath(e);
        localStorage.setItem("selectedPathId", e?._id);

        // ✅ IF DRAFT → Open Full Path Page
        if (e?.status === "draft") {
     navigate(`/dashboard/accountants/path/${e._id}`);

        } 
        // ✅ ELSE → Show Action Panel
        else {
          setPathActionEnabled(true);
        }
      }}
    >
      <div className="each-mypaths-name">
        {e?.nameOfPath}
      </div>
      <div className="each-mypaths-desc">
        {e?.description}
      </div>
      <div className="each-mypaths-name">
        {e?.the_ids?.length}
      </div>
    </div>
  );
})
}
              </div>
            </>
          ) : (
            ""
          )
          
        }

        {pathActionEnabled && (
          <div className="acc-popular1">
            <div
              className="acc-popular-top1"
              style={{
                display:
                  pathActionStep === 3
                    ? "none"
                    : metaDataStep === "success"
                    ? "none"
                    : "",
              }}
            >
              <div className="acc-popular-head1">
                {pathActionStep > 3
                  ? "Edit Paths"
                  : pathActionStep > 7
                  ? "Add service"
                  : "My Path Actions"}
              </div>
              <div
                className="acc-popular-img-box1"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  resetPathAction();
                }}
              >
                <img className="acc-popular-img1" src={closepop} alt="" />
              </div>
            </div>
            {pathActionStep === 1 && mypathsMenu !== "Pending Paths" && (
              <div className="acc-mt-div">
                <div className="acc-scroll-div">
                  <div
                    className="acc-step-box4"
                    onClick={() => {
                      setPathActionStep(4);
                      
                    }}
                  >
                    Edit path
                  </div>
                  <div
                    className="acc-step-box4"
                    onClick={() => {
                      setPathActionStep(2);
                      
                    }}
                  >
                    Delete path
                  </div>
                  {admin && (
                    <div
                      className="acc-step-box4"
                      onClick={() => {
                        setPathActionStep(6);
                      }}
                    >
                      Reject Path
                    </div>
                  )}
                  
                  <div
                    className="acc-step-box4"
                    onClick={() => {
                     setViewPathEnabled(true);
setPathActionEnabled(false);
viewPathById(selectedPathId)

                    }}
                  >
                    View path
                  </div>
                </div>
              </div>
            )}

            {pathActionStep === 1 && mypathsMenu === "Pending Paths" && (
              <div className="acc-mt-div">
                <div className="acc-scroll-div">
                  <div
                    className="acc-step-box4"
                    onClick={() => {
                      setPathActionStep(5);
                    }}
                  >
                    Approve Path
                  </div>
                  <div
                    className="acc-step-box4"
                    onClick={() => {
                      setPathActionStep(6);
                    }}
                  >
                    Reject Path
                  </div>
                  <div
                    className="acc-step-box4"
                    onClick={() => {
                      setPathActionStep(9);
                    }}
                  >
                    Add Services
                  </div>
                  <div
                    className="acc-step-box4"
                    onClick={() => {
                       // Ensure this is being updated
  
                    setPathActionStep(4);
                    }}
                  >
                    Edit path
                  </div>
                  <div
                    className="acc-step-box4"
                    onClick={() => {
                      setPathActionStep(2);
                    }}
                  >
                    Delete path
                  </div>
                  <div
                    className="acc-step-box4"
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
              <div className="acc-mt-div">
                <div className="acc-scroll-div">
                  <div
                    className="acc-step-box4"
                    onClick={() => {
                      deletePath();
                    }}
                  >
                    Confirm and delete
                  </div>
                </div>
                <div
                  className="goBack3"
                  onClick={() => {
                    setPathActionStep(1);
                  }}
                >
                  Go Back
                </div>
              </div>
            )}

            {actionLoading ? (
              <div className="popularlogo">
                <img className="popularlogoimg" src={lg1} alt="" />
              </div>
            ) : (
              ""
            )}
            
           
           


            {pathActionStep === 3 && (
              <div className="success-box2">Path Successfully Deleted</div>
            )}


{pathActionStep === 4 && (
    <EditPathForm
        selectedPath={selectedPath}
        onSave={(updatedPath) => {
            console.log("Updated Path Data:", updatedPath);
            setTimeout(() => {
                setPathActionStep(null); // Close form after success message
            }, 2000);
        }}
        onCancel={() => setPathActionStep(null)} // Close form on cancel
    />
)}


            
            {pathActionStep === 5 && (
              <div className="acc-mt-div">
                <div className="acc-sub-text">
                  Are you sure you want to approve this path?
                </div>
                <div className="acc-scroll-div">
                  <div
                    className="acc-step-box4"
                    onClick={(e) => handleApprovePath()}
                  >
                    Yes
                  </div>
                  <div
                    className="acc-step-box4"
                    onClick={() => {
                      setPathActionStep(1);
                    }}
                  >
                    Never mind
                  </div>
                </div>
                <div
                  className="goBack3"
                  onClick={() => {
                    setPathActionStep(1);
                  }}
                >
                  Go Back
                </div>
              </div>
            )}
            {pathActionStep === 6 && (
              <div className="acc-mt-div">
                <div className="acc-sub-text">
                  Are you sure you want to reject this path?
                </div>
                <div className="acc-scroll-div">
                  <div
                    className="acc-step-box4"
                    onClick={() => {
                      handleRejectPath();
                    }}
                  >
                    Yes
                  </div>
                  <div
                    className="acc-step-box4"
                    onClick={() => {
                      setPathActionStep(1);
                    }}
                  >
                    Never mind
                  </div>
                </div>
                <div
                  className="goBack3"
                  onClick={() => {
                    setPathActionStep(1);
                  }}
                >
                  Go Back
                </div>
              </div>
            )}
            {pathActionStep === 7 && (
              <div className="success-box2">Path is Approved.</div>
            )}
            {pathActionStep === 8 && (
              <div className="success-box2">Path is Rejected.</div>
            )}

            {/* Add Service Steps */}

            {pathActionStep === 9 && (
              <div className="acc-mt-div">
                <div className="acc-sub-text">
                  Which step do you want to add the service to?
                </div>
                <div className="acc-scroll-div">
                  {selectedPath &&
                    selectedPath?.StepDetails?.map((item) => (
                      <div
                        className="acc-step-box4"
                        style={{
                          flexDirection: "column",
                          alignItems: "flex-start",
                          justifyContent: "center",
                        }}
                        onClick={() => {
                          setAddServiceStep(item);
                          setPathActionStep(10);
                        }}
                      >
                        <div>{item?.name}</div>
                        <div
                          style={{
                            fontSize: "12px",
                            fontWeight: 400,
                            paddingTop: "5px",
                          }}
                        >
                          {item?._id}
                        </div>
                      </div>
                    ))}
                </div>
                <div
                  className="goBack3"
                  onClick={() => {
                    setPathActionStep(1);
                  }}
                >
                  Go Back
                </div>
              </div>
            )}
        {pathActionStep === 10 &&
  <div className="acc-mt-div">
    <div className="acc-sub-text">
      Which service do you want to add?
    </div>

    <div className="acc-scroll-div">
      {allServices?.map(item => (
        <div
          className="acc-step-box4"
          style={{flexDirection:'column', alignItems:'flex-start', justifyContent:'center'}}
          onClick={() => handleAddService(item?.product_id)}
        >
          <div>{item?.product_name}</div>
          <div style={{fontSize:'12px', fontWeight:400, paddingTop:'5px'}}>
            {item?.product_id}
          </div>
        </div>
      ))}
    </div>

    <div className="goBack3" onClick={() => setPathActionStep(1)}>
      Go Back
    </div>
  </div>
}


          </div>
        )}

        {stepActionEnabled && (
          <div className="acc-popular1">
            <div
              className="acc-popular-top"
              style={{ display: stepActionStep === 3 ? "none" : "" }}
            >
              <div className="acc-popular-head">My Step Actions</div>
              <div
                className="acc-popular-img-box"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  setStepActionEnabled(false);
                  setStepActionStep(1);
                  setSelectedStepId("");
                }}
              >
                <img className="acc-popular-img" src={closepop} alt="" />
              </div>
            </div>
            {stepActionStep === 1 && (
              <div style={{ marginTop: "3rem" }}>
                <div
                  className="acc-step-box"
                  onClick={() => {
                    setStepActionStep(4);
                  }}
                >
                  Edit Services
                </div>
                <div
                  className="acc-step-box"
                  // onClick={() => {
                  //   setStepActionStep(4);
                  // }}
                >
                  Edit Step
                </div>
                <div className="acc-step-box">Delete step</div>
              </div>
            )}

            {stepActionStep === 2 && (
              <div style={{ marginTop: "3rem" }}>
                <div
                  className="acc-step-box"
                  onClick={() => {
                    deleteStep();
                  }}
                >
                  Confirm and delete
                </div>
                <div
                  className="goBack2"
                  onClick={() => {
                    setStepActionStep(1);
                  }}
                >
                  Go Back
                </div>
              </div>
            )}

            {stepActionStep === 3 && (
              <div className="success-box1">Step Successfully Deleted</div>
            )}
            {stepActionStep === 4 && (
              // <div className="success-box1">Step Successfully Deleted</div>

              <div className="acc-mt-div">
                <div className="acc-sub-text">What do you want to do?</div>
                <div className="acc-scroll-div">
                  <div
                    className="acc-step-box4"
                    style={{
                      flexDirection: "column",
                      alignItems: "flex-start",
                      justifyContent: "center",
                    }}
                    onClick={(e) => setStepActionStep(5)}
                  >
                    <div>Add a Service</div>
                  </div>
                  <div
                    className="acc-step-box4"
                    style={{
                      flexDirection: "column",
                      alignItems: "flex-start",
                      justifyContent: "center",
                    }}
                    onClick={(e) => setStepActionStep(6)}
                  >
                    <div>Remove a Service</div>
                  </div>
                </div>
                <div
                  className="goBack3"
                  onClick={() => {
                    setStepActionStep(1);
                  }}
                >
                  Go Back
                </div>
              </div>
            )}
            {stepActionStep === 5 && (
              // <div className="success-box1">Step Successfully Deleted</div>

              <div className="acc-mt-div">
                <div className="acc-sub-text">
                  Which service do you want to add?
                </div>
                <div className="acc-scroll-div">
                  {allServicesToAdd &&
                    allServicesToAdd?.serviceDetails?.map((item) => (
                      <div
                        className={
                          selectedServices.includes(item?._id)
                            ? "acc-step-box4-selected"
                            : "acc-step-box4"
                        }
                        style={{
                          flexDirection: "column",
                          alignItems: "flex-start",
                          justifyContent: "center",
                        }}
                        onClick={(e) => handleSelectServicesForStep(item?._id)}
                      >
                        <div>{item?.name}</div>
                        <div
                          style={{
                            fontSize: "12px",
                            fontWeight: 400,
                            paddingTop: "5px",
                          }}
                        >
                          {item?._id}
                        </div>
                      </div>
                    ))}
                </div>
                <div
                  className="save-Btn"
                  style={{ opacity: selectedServices.length > 0 ? 1 : 0.3 }}
                  onClick={() =>
                    selectedServices.length > 0 && addServicesToStep()
                  }
                >
                  Add Selected Services
                </div>
                <div
                  className="goBack3"
                  onClick={() => {
                    setStepActionStep(1);
                  }}
                >
                  Go Back
                </div>
              </div>
            )}

            {stepActionStep === 6 && (
              // <div className="success-box1">Step Successfully Deleted</div>

              <div className="acc-mt-div">
                <div className="acc-sub-text">
                  Which service do you want to remove?
                </div>
                <div className="acc-scroll-div">
                  {allServicesToRemove &&
                    allServicesToRemove?.serviceDetails?.map((item) => (
                      <div
                        className={
                          selectedServices.includes(item?._id)
                            ? "acc-step-box4-selected"
                            : "acc-step-box4"
                        }
                        style={{
                          flexDirection: "column",
                          alignItems: "flex-start",
                          justifyContent: "center",
                        }}
                        onClick={(e) => removeServiceFromStep(item?._id)}
                      >
                        <div>{item?.name}</div>
                        <div
                          style={{
                            fontSize: "12px",
                            fontWeight: 400,
                            paddingTop: "5px",
                          }}
                        >
                          {item?._id}
                        </div>
                      </div>
                    ))}
                </div>

                <div
                  className="goBack3"
                  onClick={() => {
                    setStepActionStep(1);
                  }}
                >
                  Go Back
                </div>
              </div>
            )}

            {actionLoading ? (
              <div className="popularlogo">
                <img className="popularlogoimg" src={lg1} alt="" />
              </div>
            ) : (
              ""
            )}
          </div>
        )}

        {/* {showSelectedPath && <CurrentStep productDataArray={[]}/>} */}
      </div>
    </div>
  );
};

export default MyPaths;
