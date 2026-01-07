import React, { useState, useEffect } from "react";
import { useCoinContextData } from "../../context/CoinContext.js";
import Skeleton from "react-loading-skeleton";
import "./mypaths.scss";
import axios from "axios";
import { Draggable } from "react-drag-reorder";

// images
import dummy from "./dummy.svg";
import closepop from "../../static/images/dashboard/closepop.svg";
import lg1 from "../../static/images/login/lg1.svg";
import CurrentStep from "../CurrentStep/index.jsx";
import { useStore } from "../../components/store/store.ts";
import { useNavigate } from "react-router-dom";

const MyPathsAdmin = ({ search, admin, fetchAllServicesAgain, stepDataPage }) => {
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
  const [selectedPath, setSelectedPath] = useState({});
  const [newValue, setNewValue] = useState("");
  const [viewPathEnabled, setViewPathEnabled] = useState(false);
  const [viewPathLoading, setViewPathLoading] = useState(false);
  const [viewPathData, setViewPathData] = useState([]);

  const [showSelectedPath, setShowSelectedPath] = useState(null)
  const [addServiceStep, setAddServiceStep] = useState(null)
  const [selectedSubStep, setSelectedSubStep] = useState(null)

  const [backupPathData, setBackupPathData] = useState([])
  const [stepId, setStepId] = useState("");
  const [backupPathId, setBackupPathId] = useState("")
const [reorderedSteps, setReorderedSteps] = useState([]);
const [isDragging, setIsDragging] = useState(false);

  const getAllPaths = () => { 
    setLoading(true);
    let email = userDetails?.email;
    const endpoint = admin? `/api/paths/get?status=active` : `/api/paths/get?email=${email}`
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

  const getInactivePath = () => { 
    setLoading(true);
    let email = userDetails?.email;
    const endpoint = admin? `/api/paths/get?status=inactive` : `/api/paths/get?email=${email}`
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


  const [allServices, setAllServices] = useState([])

  // const getAllServices = () => {
  //   let email = userDetails?.email;

  //   axios.get(`/api/services/get?productcreatoremail=${email}`)
  //     .then(({ data }) => {
  //       if (data.status) {
  //         setAllServices(data.data);
  //       }
  //     })
  //     .catch(err => console.error("Error fetching local services:", err));
  // };


 useEffect(() => {
    axios.get(`/api/paths/get?status=active`).then(({data}) => {
      if(data.status){
        setBackupPathData(data?.data)
      }
    })
}, [])


// useEffect(() => {
//   getAllServices();
// }, []);


  const getNewPath = () => {
    setLoading(true);
    axios
      .get(`/api/paths/get?status=waitingforapproval`)
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

  useEffect(() => {
    if(mypathsMenu === "Pending Paths"){
      getNewPath()
    }else if(mypathsMenu === "Inactive Paths"){
      getInactivePath()
    }else{
      getAllPaths()
    }
  }, [mypathsMenu])

  const getAllSteps = () => {
    setLoading(true);
    let email = userDetails?.email;
   axios
  .get(`/api/steps/get?status=active`)
  .then((response) => {
    let result = response?.data?.data;
    console.log(result, "partnerStepsData result");  // debugging
    setPartnerStepsData(result);
  })

      .catch((error) => {
        console.log(error, "error in partnerStepsData");
      });
  };

  useEffect(() => {
    getAllSteps();
  }, []);

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
    .patch(`/api/paths/edit`, {
      pathId: selectedPathId,
      status: "inactive"
    })
    .then((response) => {
      if (response?.data?.status) {
        setActionLoading(false);
        setPathActionStep(3);

        // refresh correct list
        if (mypathsMenu === "Paths") {
          getAllPaths();
        } else {
          getInactivePath();
        }
      }
    })
    .catch((error) => {
      console.log("deletePath error:", error);
      setActionLoading(false);
    });
};


 const reactivatePath = () => {
    setActionLoading(true);

    axios
        .patch(`/api/paths/edit`, {
            pathId: selectedPathId,
            status: "active"
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
            console.log("reactivatePath error:", error);
            setActionLoading(false);
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

  axios.patch(`/api/paths/edit`, {
      pathId: selectedPathId,
      [field]: newValue,
  })
  .then((response) => {
      let result = response?.data;
      if (result?.status) {
        setMetaDataStep("success");
        setActionLoading(false);
        myPathsTimeout();
      }
  })
  .catch((error) => {
      console.log("editMetaData error", error);
      setActionLoading(false);
  });
};

const viewPath = () => {
  if (!selectedPathId) {
    console.log("Selected Path ID is missing");
    return;
  }

  setViewPathLoading(true);

  axios
    .get(`/api/paths/viewpath/${selectedPathId}`)
    .then((response) => {
      let result = response?.data?.data;
      setViewPathData(result);

      // ⭐ THIS LINE IS THE FIX ⭐
      setSelectedPath(result);

      setViewPathLoading(false);
    })
    .catch((error) => {
      console.log(error, "error in fetching viewPathData");
      setViewPathLoading(false);
    });
};


const handleApprovePath = () => {
  setActionLoading(true);

  axios
    .put(`/api/paths/updatepath/${selectedPathId}`, { status: "active" })
    .then(({ data }) => {
      if (data.status) {
        getAllPaths();
        setPathActionEnabled(false);
        setActionLoading(false);
        setPathActionStep(1);
      }
    })
    .catch((error) => {
      console.error(error, "Error approving path");
      setActionLoading(false);
    });
};



  
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

  const handleAddService = (newId) => {
    setActionLoading(true)
      
      axios.post(`/api/steps/addproducts/${selectedStepId}`, {
        "product_ids": [newId]
       }).then(({data})=> {
        if(data.status){
          if(mypathsMenu === "Pending Paths"){
            getNewPath()
          }else{
            getAllPaths()
          }
          // getAllServices()
          setPathActionEnabled(false);
          setStepActionEnabled(false)
          setActionLoading(false);
          setPathActionStep(1)
          setActionLoading(false)
          fetchAllServicesAgain()
        }
      })

  }

  useEffect(() => {
    setShowSelectedPath(null)
  }, [mypathsMenu])


  const [productDataArray, setProductDataArray] = useState([]);
  const [productKeys, setProductKeys] = useState(null);

const [allServicesToAdd, setAllServicesToAdd] = useState([]);

useEffect(() => {
  axios
    .get(`/api/services/getservices?status=active`)
    .then(({ data }) => {
      if (data.status) {
        setAllServicesToAdd(data.data);
      }
    })
    .catch((err) => {
      console.error("Error fetching services:", err);
    });
}, []);


  const [allServicesToRemove, setAllServicesToRemove] = useState([])
  useEffect(() => {
    if(selectedStepId){
      axios.get(`/api/attachservice/get?step_id=${selectedStepId}`).then(({data}) => {
        if(data.status){
          setAllServicesToRemove(data?.data[0])
        }
      })
    }
  }, [selectedStepId])

//addedddddddddddddd

const openAddStep = async (pathId) => {
  try {
    setSelectedPathId(pathId);

    const response = await axios.get(`/api/paths/viewpath/${pathId}`);
    if (response.data?.data) {
      setSelectedPath(response.data.data);   // ⭐ correct
    }

    setEditPaths("add_step");   // ⭐ open the Add Step UI
  } catch (err) {
    console.log("Error loading path data for Add Step:", err);
  }
};


  // useEffect(() => {
  //   if (userDetails) {
  //     axios
  //       .get(
  //         `https://careers.marketsverse.com/userpaths/getCurrentStep?email=${userDetails?.user?.email}`
  //       )
  //       .then(({ data }) => {
  //         if (data.status) {
  //           // console.log(data.data[0].StepDetails[0].other_data, "ProductKeys");
  //           setProductKeys(data.data[0].StepDetails[0].other_data);
  //         }
  //       });
  //   }
  // }, []);

const fetchProductData = async (apiKey) => {
  try {
    const response = await axios.get(`/api/services/getbyid/${apiKey}`);
    const productData = response.data.data;   // adjust based on backend return
    return productData;
  } catch (error) {
    console.error(`Error fetching local product for key ${apiKey}:`, error);
    return null;
  }
};



  useEffect(() => {
    console.log(stepActionStep, 'ejbfkwjebfkwef')
  }, [stepActionStep])

  

  // const fetchData = async () => {
  //   setProductDataArray([]);
  //   console.log(productKeys, "ewlkhflkwheflwerf")
  //   if (productKeys) {
  //     const apiKeys = Object.values(productKeys);
  //     const fetchDataPromises = apiKeys.map((item) => fetchProductData(item));

  //     try {
  //       const results = await Promise.all(fetchDataPromises);
  //       const updatedProductDataArray = results.filter(Boolean);
  //       setProductDataArray([...updatedProductDataArray]);
  //     } catch (error) {
  //       console.error("Error fetching product data:", error);
  //     }
  //   }
  // };
  const fetchData = async () => {
    setProductDataArray([]);
    console.log(productKeys, "ewlkhflkwheflwerf");
    if (productKeys && Array.isArray(productKeys)) { // Check if productKeys exists and is an array
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
  if (!productKeys || !Array.isArray(productKeys) || productKeys.length === 0) {
    setProductDataArray([]); 
    return;  // STOP — do NOT call fetchData
  }

  fetchData();
}, [productKeys]);

  const handlePlace = (item, index) => {
    console.log(item, index, "lwkeflkwefwef")
    const updatedPathObject = addIdToObjectAtIndex(item?.the_ids, stepId, backupPathId, index);
    // console.log(updatedPathObject, "kjwebfkwjebfkwejf")
    axios.patch(`/api/paths/edit`, {
    pathId: selectedPath?._id,
    the_ids: updatedPathObject
})
.then(res => {
    if(res.data.status){
        resetPathAction();
        getAllPaths();
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
    const indexToDelete = updatedTheIds.findIndex(
  obj => obj.step_id === idToDelete
);

    // If the object with the specified _id is found, remove it from the copied array
    if (indexToDelete !== -1) {
        updatedTheIds.splice(indexToDelete, 1);
    }

    // Return the updated array with only step_id and backup_pathId keys
    const updatedBody =  updatedTheIds.map(({ step_id, backup_pathId }) => ({ step_id, backup_pathId }));
    axios.patch(`/api/paths/edit`, {
    pathId: selectedPath?._id,
    the_ids: updatedBody
})
.then(res => {
    if(res.data.status){
        resetPathAction();
        getAllPaths();
    }
})

  }

const getChangedPos = (currentPos, newPos) => {
  if (!Array.isArray(selectedPath?.StepDetails)) return;
  if (currentPos === newPos) return;

  const reordered = [...selectedPath.StepDetails];
  const [moved] = reordered.splice(currentPos, 1);
  reordered.splice(newPos, 0, moved);

  // convert reordered StepDetails → the_ids payload
  const updatedBody = reordered.map(step => ({
    step_id: step._id,
    backup_pathId: step.backup_pathId || null
  }));

  axios.patch(`/api/paths/edit`, {
    pathId: selectedPath._id,
    the_ids: updatedBody
  }).then(res => {
    if (res.data.status) {
      // reload fresh data
      axios.get(`/api/paths/viewpath/${selectedPath._id}`).then(({data}) => {
        if (data?.data) {
          setSelectedPath(data.data);
        }
      });
    }
  });
};



//function updatePositionOfObject(fullObject, currentIndex, newIndex) {
  //const updatedTheIds = [...fullObject.the_ids];

  //const [movedItem] = updatedTheIds.splice(currentIndex, 1);
  //updatedTheIds.splice(newIndex, 0, movedItem);

  //const updatedBody = updatedTheIds.map(({ step_id, backup_pathId }) => ({
    //step_id,
    //backup_pathId,
  //}));

  //axios.patch(`/api/paths/edit`, {
    //pathId: fullObject._id,
    //the_ids: updatedBody,
  //}).then(res => {
    //if (res.data.status) {
      //resetPathAction();
      //getAllPaths();
    //}
  //});
//}



const [selectedServices, setSelectedServices] = useState([])
const handleSelectServicesForStep = (item) => {
    // Check if the item is already selected
    const isSelected = selectedServices.includes(item);

    if (isSelected) {
      // If already selected, remove it
      const updatedServices = selectedServices.filter(service => service !== item);
      setSelectedServices(updatedServices);
    } else {
      // If not selected, add it
      setSelectedServices([...selectedServices, item]);
    }
}

const addServicesToStep = () => {
  setActionLoading(true)
  setLoading(true)

  axios.post(`/api/steps/attachservice`, {
    step_id: selectedStepId,
    service_ids: [...selectedServices]
  })
  .then(({ data }) => {
    if (data.status) {
      setStepActionEnabled(false)
      setActionLoading(false)
      setLoading(false)
      setSelectedServices([])

      // refresh services and paths
      // getAllServices()
      fetchAllServicesAgain()
      getAllPaths()
    }
  })
  .catch(err => {
    console.error("Attach service failed", err)
    setActionLoading(false)
    setLoading(false)
  })
}


const removeServiceFromStep = (id) => {
  setActionLoading(true)
  setLoading(true)

  axios.delete(`/api/steps/service/${selectedStepId}/${id}`)
    .then(({ data }) => {
      if (data.status) {
        setStepActionEnabled(false)
        setActionLoading(false)
        setLoading(false)

        // refresh UI
        // getAllServices()
        fetchAllServicesAgain()
        getAllPaths()
      }
    })
    .catch(err => {
      console.error("Remove service failed", err)
      setActionLoading(false)
      setLoading(false)
    })
}


useEffect(() => {
  if(!stepActionEnabled){
    setSelectedServices([])
    setStepActionStep(1)
  }
}, [stepActionEnabled])

useEffect(() => {
  setMypathsMenu("Paths");
}, [])

  return (
    <div className="admin-mypaths">
      <div className="admin-mypaths-menu">
        <div
          className="admin-each-mypath-menu"
          style={{
            fontWeight: mypathsMenu === "Paths" ? "700" : "",
            background:
              mypathsMenu === "Paths" ? "rgba(241, 241, 241, 0.5)" : "",
          }}
          onClick={() => {
            setMypathsMenu("Paths");
            if(viewPathEnabled) {
              setViewPathEnabled(false);
              setViewPathData([]);
            }
          }}
        >
         {admin ? "Active Paths" : "Paths"}
        </div>
        {admin && 
        <div
          className="admin-each-mypath-menu"
          style={{
            fontWeight: mypathsMenu === "Pending Paths" ? "700" : "",
            background:
              mypathsMenu === "Pending Paths" ? "rgba(241, 241, 241, 0.5)" : "",
          }}
          onClick={() => {
            setMypathsMenu("Pending Paths");
            if(viewPathEnabled) {
              setViewPathEnabled(false);
              setViewPathData([]);
            }
          }}
        >
          Pending Paths
        </div>}
        {/* <div
          className="admin-each-mypath-menu"
          style={{
            fontWeight: mypathsMenu === "Steps" ? "700" : "",
            background:
              mypathsMenu === "Steps" ? "rgba(241, 241, 241, 0.5)" : "",
          }}
          onClick={() => {
            setMypathsMenu("Steps");
            if(viewPathEnabled) {
              setViewPathEnabled(false);
              setViewPathData([]);
            }
          }}
        >
          Steps
        </div> */}
        <div
          className="admin-each-mypath-menu"
          style={{
            fontWeight: mypathsMenu === "Inactive Paths" ? "700" : "",
            background:
              mypathsMenu === "Inactive Paths" ? "rgba(241, 241, 241, 0.5)" : "",
          }}
          onClick={() => {
            setMypathsMenu("Inactive Paths");
            if(viewPathEnabled) {
              setViewPathEnabled(false);
              setViewPathData([]);
            }
          }}
        >
          Inactive Paths
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
                { viewPathData && Object.keys(viewPathData).length > 0
                    ? viewPathData?.destination_institution
                    : ""}
                </div>
              )}
              {viewPathLoading ? (
                <Skeleton width={500} height={20} />
              ) : (
                <div className="admin-viewpath-des">
                  {viewPathData && Object.keys(viewPathData).length > 0 ? viewPathData?.description : ""}
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
          <div className="admin-viewpath-each-j-step admin-viewpath-relative-div" key={i}>
            ...
          </div>
        );
      })
  : viewPathData && Object.keys(viewPathData).length > 0
  ? viewPathData?.StepDetails?.map((e, i) => {
      return (
        <div
          onClick={() => {
            setShowSelectedPath(e);
            setProductKeys(e?.product_ids);
          }}
          className="admin-viewpath-each-j-step admin-viewpath-relative-div"
          key={i}
        >
          <div className="admin-viewpath-each-j-img">
            <img src={e?.icon} alt="" />
          </div>
          <div className="admin-viewpath-each-j-step-text">{e?.name}</div>
          <div className="admin-viewpath-each-j-step-text1">{e?.description}</div>
          <div className="admin-viewpath-each-j-amount-div">
            <div className="admin-viewpath-each-j-amount">{e?.cost}</div>
          </div>
        </div>
      );
    })
  : ""}

            </div>
          </div>
        ) : mypathsMenu === "Paths" || mypathsMenu === "Pending Paths" || mypathsMenu === "Inactive Paths" && !viewPathEnabled ? (
          <>
            <div className="admin-mypathsNav">
              <div className="admin-mypaths-name-div">Name</div>
              <div className="admin-mypaths-description-div">Description</div>
              <div className="admin-mypaths-name-div"># of steps</div>
            </div>
            <div className="admin-mypathsScroll-div">
              {loading
                ? Array(10)
                    .fill("")
                    .map((e, i) => {
                      return (
                        <div className="admin-each-mypaths-data" key={i}>
                          <div className="admin-each-mypaths-name">
                            <Skeleton width={100} height={30} />
                          </div>
                          <div className="admin-each-mypaths-desc">
                            <Skeleton width={"100%"} height={30} />
                          </div>
                          <div className="admin-each-mypaths-name">
                            <Skeleton width={100} height={30} />
                          </div>
                        </div>
                      );
                    })
                : filteredPartnerPathData?.map((e, i) => {
                    return (
                      <div
                        className="admin-each-mypaths-data"
                        key={i}
                       onClick={async () => {
  setPathActionEnabled(true);
  setSelectedPathId(e?._id);

  // 🔥 1) Load FULL path details BEFORE opening edit steps
  const res = await axios.get(`/api/paths/viewpath/${e?._id}`);
  if (res.data?.data) {
    setSelectedPath(res.data.data);
  }

  // Remove this — it causes race condition:
  // viewPath(e?._id);
}}

                      >
                        <div className="admin-each-mypaths-name">{e?.nameOfPath}</div>
                        <div className="admin-each-mypaths-desc">
                          {e?.description}
                        </div>
                        <div className="admin-each-mypaths-name">{e?.StepDetails?.length ?? e?.the_ids?.length ?? 0}</div>
                      </div>
                    );
                  })}
            </div>
          </>
        ) 
        : (
          // <>
          //   <div className="admin-mypathsNav">
          //     <div className="admin-mypathsName">Name</div>
          //     <div className="admin-mypathsCountry">Length</div>
          //     <div className="admin-mypathsCountry">Cost Structure</div>
          //     <div className="admin-mypathsMicrosteps">Services</div>
          //   </div>
          //   <div className="admin-mypathsScroll-div">
          //     {loading
          //       ? Array(10)
          //           .fill("")
          //           ?.map((e, i) => {
          //             return (
          //               <div className="admin-each-mypaths-data1" key={i}>
          //                 <div className="admin-each-mypaths-detail">
          //                   <div className="admin-each-mypathsName">
          //                     <Skeleton width={100} height={30} />
          //                   </div>
          //                   <div className="admin-each-mypathsCountry">
          //                     <Skeleton width={100} height={30} />
          //                   </div>
          //                   <div className="admin-each-mypathsCountry">
          //                     <Skeleton width={100} height={30} />
          //                   </div>
          //                   <div className="admin-each-mypathsMicrosteps">
          //                     <Skeleton width={100} height={30} />
          //                   </div>
          //                 </div>
          //                 <div className="admin-each-mypaths-desc">
          //                   <div className="admin-each-mypaths-desc-txt">
          //                     <Skeleton width={100} height={30} />
          //                   </div>
          //                   <div className="admin-each-mypaths-desc-txt1">
          //                     <Skeleton width={"100%"} height={30} />
          //                   </div>
          //                 </div>
          //               </div>
          //             );
          //           })
          //       : filteredPartnerStepsData?.map((e, i) => {
          //           return (
          //             <div
          //               className="admin-each-mypaths-data1"
          //               key={i}
          //               onClick={() => {
          //                 setSelectedStepId(e?._id);
          //                 setStepActionEnabled(true);
          //               }}
          //             >
          //               <div className="admin-each-mypaths-detail">
          //                 <div className="admin-each-mypathsName">
          //                   <div>
          //                     <div>{e?.name}</div>
          //                     <div
          //                       style={{
          //                         fontSize: "0.8rem",
          //                         fontWeight: "300",
          //                       }}
          //                     >
          //                       {e?._id}
          //                     </div>
          //                   </div>
          //                 </div>
          //                 <div className="admin-each-mypathsCountry">
          //                   {e?.length ? e?.length : 0} Days
          //                 </div>
          //                 <div className="admin-each-mypathsCountry">{e?.cost}</div>
          //                 <div className="admin-each-mypathsMicrosteps">
          //                   {e?.other_data
          //                     ? Object.keys(e.other_data).length
          //                     : 0}
          //                 </div>
          //               </div>
          //               <div className="admin-each-mypaths-desc">
          //                 <div className="admin-each-mypaths-desc-txt">
          //                   Description
          //                 </div>
          //                 <div className="admin-each-mypaths-desc-txt1">
          //                   {e?.description}
          //                 </div>
          //               </div>
          //             </div>
          //           );
          //         })}
          //   </div>
          // </>
          <></>
        )
        }

        {pathActionEnabled && (
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
                  {mypathsMenu === "Inactive Paths" ? "Reactivate path":"Delete path"}  
                  </div>
                 
                  {/* <div
                    className="admin-acc-step-box4"
                    onClick={() => {
                      setPathActionStep(6);
                    }}
                  >
                    Reject Path
                  </div> */}
                  {/* <div
                    className="admin-acc-step-box4"
                    onClick={() => {
                      setPathActionStep(9);
                    }}
                  >
                    Add Services
                  </div> */}
         <div
  className="admin-acc-step-box4"
  onClick={() => {
    localStorage.setItem("selectedPathId", selectedPathId);
    navigate(`/dashboard/path/${selectedPathId}`);
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
                  {/* <div
                    className="admin-acc-step-box4"
                    onClick={() => {
                      setPathActionStep(2);
                    }}
                  >
                    Delete path
                  </div> */}
                         <div
  className="admin-acc-step-box4"
  onClick={() => {
    // Store ID safely
    localStorage.setItem("selectedPathId", selectedPathId);

    navigate(`/dashboard/path/${selectedPathId}`);
  }}
>
  View path
</div>

                </div>
              </div>
            )}

          
            {pathActionStep === 2 && (
              <div className="admin-acc-mt-div">
                <div className="admin-acc-sub-text">
                Are you sure you want to {mypathsMenu === "Inactive Paths" ? "reactivate":"delete"}  this path?
                  </div>
                <div className="admin-acc-scroll-div">
                  <div
                    className="admin-acc-step-box4"
                    onClick={() => {
                      if(mypathsMenu === "Inactive Paths"){
                        reactivatePath();
                      }else{
                        deletePath();
                      }
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
                    Never Mind
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
              <div className="admin-success-box2">Path Successfully {mypathsMenu === "Inactive Paths" ? "reactivated" :"deleted"} </div>
            )}

            {pathActionStep === 4 &&
              (editPaths === "default" ? (
                <div className="admin-acc-mt-div">
                  <div className="admin-acc-sub-text">
                    What type of data do you want to edit?
                  </div>
                  <div className="admin-acc-scroll-div">
                    {/* <div
                      className="admin-acc-step-box4"
                      onClick={() => {
                        setEditPaths("Edit meta data");
                      }}
                    >
                      Edit meta data
                    </div> */}
                    <div
                      className="admin-acc-step-box4"
                      onClick={() => {
                        setEditPaths("Edit steps");
                      }}
                    >
                      Edit steps
                    </div>
                    {/* <div
                      className="admin-acc-step-box4"
                      onClick={() => {
                        setEditPaths("Edit who qualifies");
                      }}
                    >
                      Edit who qualifies
                    </div> */}
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
      <div
        className="admin-acc-step-box4"
        onClick={() => setEditPaths("add_step")}
      >
        Add new step
      </div>

      <div
        className="admin-acc-step-box4"
        onClick={() => setEditPaths("remove_step")}
      >
        Remove existing step
      </div>

      <div
        className="admin-acc-step-box4"
        onClick={() => setEditPaths("reorder_step")}
      >
        Reorder existing steps
      </div>
    </div>

    <div
      className="admin-goBack3"
      onClick={() => setEditPaths("default")}
    >
      Go Back
    </div>
  </div>

) : editPaths === "reorder_step" ? (
  <div className="admin-acc-mt-div">
    <div className="admin-acc-sub-text">
      Reorder existing steps
    </div>

    <div className="admin-acc-scroll-div">
      {Array.isArray(selectedPath?.StepDetails) &&
      selectedPath.StepDetails.length > 0 ? (
        <Draggable
          onPosChange={(currentPos, newPos) => {
            if (currentPos !== newPos) {
              getChangedPos(currentPos, newPos);
            }
          }}
        >
          {selectedPath.StepDetails.map((item) => (
            <div
              key={item._id}
              className="admin-subpathstyle"
            >
              <div style={{ fontWeight: 600, fontSize: "14px" }}>
                {item.name}
              </div>

              <div style={{ fontSize: "12px", lineHeight: "20px" }}>
                {item.description?.substring(0, 150)}…
              </div>

              <div style={{ fontSize: "12px", opacity: 0.7 }}>
                Step ID: {item._id}
              </div>
            </div>
          ))}
        </Draggable>
      ) : (
        <div style={{ fontSize: "13px", opacity: 0.6 }}>
          No steps available to reorder
        </div>
      )}
    </div>

    <div
      className="admin-goBack3"
      onClick={() => setEditPaths("default")}
    >
      Go Back
    </div>
  </div>

) : editPaths === "add_step" ? (



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
  <div>{item?.nameOfPath}</div>
  <div>{item?.program || item?.university}</div>
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
                    {selectedPath?.StepDetails?.map((item, index) => (
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
                
            ) : editPaths === "remove_step" ? (
  <div className="admin-acc-mt-div">
    <div className="admin-acc-sub-text">
      Select which step you want to remove
    </div>

    <div className="admin-acc-scroll-div">
      {Array.isArray(selectedPath?.StepDetails) &&
        selectedPath.StepDetails.map((item) => (
          <div
            key={item._id}
            className="admin-subpathstyle"
            style={{ position: "relative" }}
          >
            {/* Delete icon */}
            <div
              className="admin-deletePathStyle"
              onClick={() =>
                handledeletePathPosition(selectedPath, item._id)
              }
            >
              <img src={require("./delete.svg").default} alt="delete" />
            </div>

            {/* STEP NAME */}
            <div style={{ fontWeight: 600, fontSize: "14px" }}>
              {item?.name}
            </div>

            {/* STEP DESCRIPTION */}
            <div
              style={{
                fontWeight: 300,
                fontSize: "12px",
                lineHeight: "22px",
                marginTop: "6px",
              }}
            >
              {item?.description
                ? item.description.substring(0, 150) + "..."
                : "No description"}
            </div>

            {/* STEP ID */}
            <div
              style={{
                marginTop: "10px",
                fontSize: "12px",
                opacity: 0.7,
              }}
            >
              Step ID: {item?._id}
            </div>

            {/* BACKUP PATH */}
            {item?.backup_pathId && (
              <div
                style={{
                  marginTop: "8px",
                  padding: "8px",
                  border: "1px solid #e7e7e7",
                  borderRadius: "10px",
                  fontSize: "12px",
                }}
              >
                Backup Path ID: {item.backup_pathId}
              </div>
            )}
          </div>
        ))}
    </div>

    <div
      className="admin-goBack3"
      onClick={() => setEditPaths("default")}
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

              {/* Add Service Steps */}

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
  {pathActionStep === 10 &&
  <div className="admin-acc-mt-div">
    <div className="admin-acc-sub-text">
      Which service do you want to add?
    </div>

    <div className="admin-acc-scroll-div">
      {allServices?.map(item => (
        <div
          className="admin-acc-step-box4"
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

    <div className="admin-goBack3" onClick={() => setPathActionStep(1)}>
      Go Back
    </div>
  </div>
}

          </div>
        )}

        {stepActionEnabled && (
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
                }}
              >
                <img className="admin-acc-popular-img" src={closepop} alt="" />
              </div>
            </div>
            {stepActionStep === 1 && (
              <div style={{ marginTop: "3rem" }}>
                <div className="admin-acc-step-box"  onClick={() => {
                    setStepActionStep(4);
                  }}>Edit Services</div>
                  <div className="admin-acc-step-box"  
                  // onClick={() => {
                  //   setStepActionStep(4);
                  // }}
                  >Edit Step</div>
                <div
                  className="admin-acc-step-box" onClick={() => { deleteStep(); }}
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
              // <div className="admin-success-box1">Step Successfully Deleted</div>
           

              <div className="admin-acc-mt-div">
                <div className="admin-acc-sub-text">
                What do you want to do?
                </div>
                <div className="admin-acc-scroll-div">
                    <div
                      className="admin-acc-step-box4"
                      style={{flexDirection:'column', alignItems:'flex-start', justifyContent:'center'}}
                      onClick={(e) => setStepActionStep(5)}
                    >
                      <div>Add a Service</div> 
                    </div>
                    <div
                      className="admin-acc-step-box4"
                      style={{flexDirection:'column', alignItems:'flex-start', justifyContent:'center'}}
                      onClick={(e) => setStepActionStep(6)}
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
              // <div className="admin-success-box1">Step Successfully Deleted</div>
           

              <div className="admin-acc-mt-div">
                <div className="admin-acc-sub-text">
                Which service do you want to add?
                </div>
                <div className="admin-acc-scroll-div">
                  {allServicesToAdd && allServicesToAdd?.map(item => (
                    <div
                      className={selectedServices.includes(item?._id) ? 'admin-acc-step-box4-selected': "admin-acc-step-box4"}
                      style={{flexDirection:'column', alignItems:'flex-start', justifyContent:'center'}}
                      onClick={(e) => handleSelectServicesForStep(item?._id)}
                    >
                      <div>{item?.name}</div> 
                      <div style={{fontSize:'12px', fontWeight: 400, paddingTop:'5px'}}>{item?._id}</div>
                    </div>
                  ))}
              
        
                  
                </div>
                <div className="admin-save-Btn" 
                style={{opacity: selectedServices.length>0 ? 1 : 0.3}}
                  onClick={() => selectedServices.length>0 && addServicesToStep()}
                  >
                 Add Selected Services
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
              // <div className="admin-success-box1">Step Successfully Deleted</div>
           

              <div className="admin-acc-mt-div">
                <div className="admin-acc-sub-text">
                Which service do you want to remove? 
                </div>
                <div className="admin-acc-scroll-div">
                  {allServicesToRemove && allServicesToRemove?.serviceDetails?.map(item => (
                    <div
                      className={selectedServices.includes(item?._id) ? 'admin-acc-step-box4-selected': "admin-acc-step-box4"}
                      style={{flexDirection:'column', alignItems:'flex-start', justifyContent:'center'}}
                      onClick={(e) => removeServiceFromStep(item?._id)}
                    >
                      <div>{item?.name}</div> 
                      <div style={{fontSize:'12px', fontWeight: 400, paddingTop:'5px'}}>{item?._id}</div>
                    </div>
                  ))}
              
        
                  
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

            {actionLoading ? (
              <div className="admin-popularlogo">
                <img className="admin-popularlogoimg" src={lg1} alt="" />
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

export default MyPathsAdmin;