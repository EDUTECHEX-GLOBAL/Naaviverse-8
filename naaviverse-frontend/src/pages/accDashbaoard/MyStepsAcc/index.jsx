import React, { useState, useEffect } from "react";
import { useCoinContextData } from "../../../context/CoinContext";
import Skeleton from "react-loading-skeleton";
import "./mypaths.scss";
import axios from "axios";
import { Draggable } from "react-drag-reorder";
import EditStepForm from "./steps.jsx";

// images
import dummy from "./dummy.svg";
import closepop from "../../../static/images/dashboard/closepop.svg";
import lg1 from "../../../static/images/login/lg1.svg";
import CurrentStep from "../../CurrentStep";
import { useStore } from "../../../components/store/store.ts";
import { useNavigate } from "react-router-dom";
import MenuNav from "../../../components/MenuNav/index.jsx";


const MyStepsAcc = ({ search, setSearch, admin, fetchAllServicesAgain, stpesMenu, showDrop, setShowDrop }) => {
    const navigate = useNavigate()
    const { sideNav, setsideNav, accsideNav,
        setaccsideNav, } = useStore();
    let userDetails = JSON.parse(localStorage.getItem("partner"));
    const { setCurrentStepData, setCurrentStepDataLength, mypathsMenu, setMypathsMenu } = useCoinContextData();
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
    const [viewPathData, setViewPathData] = useState(null);
    const [allServicesToRemove, setAllServicesToRemove] = useState([]);

    const [showSelectedPath, setShowSelectedPath] = useState(null)
    const [addServiceStep, setAddServiceStep] = useState(null)
    const [selectedSubStep, setSelectedSubStep] = useState(null)

    const [backupPathData, setBackupPathData] = useState([])
    const [stepId, setStepId] = useState("");
    const [backupPathId, setBackupPathId] = useState("")


    const getAllPaths = () => {
        setLoading(true);
        let email = userDetails?.email;
        const endpoint = admin ?
            `/api/paths/get?status=active` :
            `/api/paths/get?email=${email}`;

        axios.get(endpoint)
            .then((response) => {
                let result = response?.data?.data;
                if (result) {
                    setPartnerPathData(result);
                } else {
                    console.error('No data found in response:', response);
                }
            })
            .catch((error) => {
                console.error(error, "error in partnerPathData");
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const [remainingStepData, setRemainingStepData] = useState([])
const getAllStepsForPath = () => {
    // 💥 FIX 1 — DO NOT CALL API IF NO PATH SELECTED
    if (!selectedPathId) {
        console.log("No selectedPathId — skipping getremainingsteps API");
        return;
    }

    setLoading(true);
    let email = userDetails?.email;

    // 💥 FIX 2 — REMOVE DOUBLE && → only use &
    axios.get(`/api/paths/getremainingsteps?path_id=${selectedPathId}&email=${email}`)
        .then((response) => {
            console.log('Response from getAllStepsForPath:', response);
            let result = response?.data?.stepIds;

            if (Array.isArray(result)) {
                console.log(result, "partnerStepsData result");
                setRemainingStepData(result);
            } else {
                console.error('Unexpected data format:', response);
            }
        })
        .catch((error) => {
            console.error(error, "error in partnerStepsData");
        })
        .finally(() => {
            setLoading(false);
        });

    console.log('Selected Path:', selectedPath);
    console.log('Selected Path ID:', selectedPath?._id);
    console.log('Email:', email);
};


useEffect(() => {
    if (selectedPathId) {
        getAllStepsForPath();
    }
}, [selectedPathId]);



    const [allServices, setAllServices] = useState([])

    // const getAllServices = () => {
    //     let email = userDetails?.email;

    //     // axios.get(`https://comms.globalxchange.io/gxb/product/banker/get?category=education%20consultants`).then(({data}) => {
    //     //   if(data.status){
    //     //     setAllServices(data.data)
    //     //   }
    //     // })
    //     axios.get(`https://careers.marketsversFe.com/attachservice/getnotaddedservices?step_id=${selectedStepId}&productcreatoremail=${email}`).then(({ data }) => {
    //         if (data.status) {
    //             console.log(data, "lhqflqhflqhflqf")
    //             setAllServices(data.data)
    //         }
    //     })
    // }

    useEffect(() => {
        let email = userDetails?.email;
        axios.get(`/api/paths/get?email=${email}`).then(({ data }) => {
            if (data.status) {
                setBackupPathData(data?.data)
            }
        })
    }, [])

    // useEffect(() => {
    //     if (selectedStepId) {
    //         getAllServices()
    //     }
    // }, [selectedStepId])

    const getNewPath = () => {
        setLoading(true);
        axios
            .get(`/api/paths/get?status=waitingforapproval`)
            .then((response) => {
                let result = response?.data?.data;
                console.log(result, "partnerPathData result");
                setPartnerPathData(result);
                setLoading(false);
            })
            .catch((error) => {
                console.log(error, "error in partnerPathData");
            });

    }

    useEffect(() => {
        console.log(accsideNav, "lwjebfjklwebfkwf")
        if (accsideNav === "Steps") {
            setMypathsMenu('Active Steps')
            getAllSteps('active')
        } else {
            setMypathsMenu('Paths')
        }
    }, [accsideNav])

    const getAllSteps = (status) => {
        setLoading(true);
        let email = userDetails?.email;
        axios
            .get(`/api/steps/get?email=${email}&status=${status}`)
            .then((response) => {
                let result = response?.data?.data;
                console.log(result, "partnerStepsData result");
                setPartnerStepsData(result);
                setLoading(false);
            })
            .catch((error) => {
                console.log(error, "error in partnerStepsData");
            });
    };

    useEffect(() => {
        if (mypathsMenu === "Active Steps") {
            getAllSteps('active');
            setMypathsMenu('Active Steps')
        } else {
            getAllSteps('inactive');
        }
    }, [mypathsMenu]);

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
            .delete(`/api/steps/delete/${selectedStepId}`, {
                // Send status in the request body
            })
            .then((response) => {
                const result = response?.data;
                if (result?.status) {
                    setActionLoading(false);
                    setStepActionStep(3);
                    myStepsTimeout();
                }
            })
            .catch((error) => {
                console.error(error.response?.data || error.message, "error in deleteStep");
                setActionLoading(false); // Ensure loading state is reset on error
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

 const viewPathById = (id) => {
    setViewPathLoading(true);

    axios
      .get(`/api/paths/viewpath/${id}`)
      .then((response) => {
          let result = response?.data?.data;   // BACKEND RETURNS data not data[0]
          setViewPathData(result);
          setViewPathLoading(false);
      })
      .catch((error) => {
          console.log("Error in fetching view path data:", error);
          setViewPathLoading(false);
      });
};



const handleApprovePath = () => {
  setActionLoading(true);

  axios
    .put(`http://localhost:4545/api/paths/updatepath/${selectedPathId}`, {
      status: "active",
    })
    .then(({ data }) => {
      if (data.status) {
        getAllPaths();
        setPathActionEnabled(false);
      }
    })
    .finally(() => setActionLoading(false));
};

const handleRejectPath = () => {
  setActionLoading(true);

  axios
    .put(`http://localhost:4545/api/paths/updatepath/${selectedPathId}`, {
      status: "inactive",
    })
    .then(({ data }) => {
      if (data.status) {
        getAllPaths();
        setPathActionEnabled(false);
      }
    })
    .finally(() => setActionLoading(false));
};


    const handleAddService = (newId) => {
        setActionLoading(true)

        axios.post(`/api/steps/addproducts/${selectedStepId}`, {
            "product_ids": [newId]
        }).then(({ data }) => {
            if (data.status) {
                if (mypathsMenu === "Pending Paths") {
                    getNewPath()
                } else {
                    getAllPaths()
                }
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
const [productKeys, setProductKeys] = useState([]);


    const [allServicesToAdd, setAllServicesToAdd] = useState([]);



useEffect(() => {
    if (selectedStepId) {
        let userDetails = JSON.parse(localStorage.getItem("partner")); // Get logged-in user details

        axios.get(`/api/services/get?productcreatoremail=${userDetails.email}`)
            .then(({ data }) => {
                if (data.status) {
                    setAllServicesToAdd(data.data);  // Store fetched services
                } else {
                    console.log("No services found:", data.message);
                }
            })
            .catch((error) => {
                console.error("Error fetching services:", error);
            });
    }
}, [selectedStepId]);




const fetchServicesForRemoval = async () => {
    try {
        if (!selectedStepId) {
            console.error("No step ID provided.");
            return;
        }
        
        const trimmedStepId = selectedStepId.trim();
        console.log("Fetching services for step:", trimmedStepId);
        
        const url = `/api/steps/getall/${trimmedStepId}`
        console.log("URL:", url);
        
        const response = await axios.get(url);
        
        console.log("Full Response from server:", response);
        
        if (response.status === 200 && response.data.status) {
            // Directly set the services array as returned by the backend
            setAllServicesToRemove(response.data.data);
        } else {
            console.log("No services found or error:", response.data.message);
        }
    } catch (error) {
        if (error.response) {
            console.error('Error Response:', error.response.data);
            console.error('Status:', error.response.status);
            console.error('Headers:', error.response.headers);
        } else if (error.request) {
            console.error('No response received');
        } else {
            console.error('Error:', error.message);
        }
        console.error('Config:', error.config);
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
        // Fetch updated product data when productKeys change
        fetchData();
    }, [productKeys]);

    const handlePlace = (item, index) => {
        console.log(item, index, "lwkeflkwefwef")
        const updatedPathObject = addIdToObjectAtIndex(item?.the_ids, stepId, backupPathId, index);
        // console.log(updatedPathObject, "kjwebfkwjebfkwejf")
        axios.put(`/api/paths/update/${selectedPath?._id}`, { the_ids: updatedPathObject })
            .then(res => {
                if (res.data.status) {
                    resetPathAction();
                    getAllPaths()
                }
            })
    }

    function addIdToObjectAtIndex(idsArray, stepId, backupPathId, index) {
        // Create a shallow copy of the original array and extract only necessary properties
        const newArray = idsArray.map(({ step_id, backup_pathId }) => ({ step_id, backup_pathId }));

        // Create a new object with the provided stepId and backupPathId
        let newIdObject;
        if (backupPathId) {
            newIdObject = {
                step_id: stepId,
                backup_pathId: backupPathId
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
        const indexToDelete = updatedTheIds.findIndex(obj => obj._id === idToDelete);

        // If the object with the specified _id is found, remove it from the copied array
        if (indexToDelete !== -1) {
            updatedTheIds.splice(indexToDelete, 1);
        }

        // Return the updated array with only step_id and backup_pathId keys
        const updatedBody = updatedTheIds.map(({ step_id, backup_pathId }) => ({ step_id, backup_pathId }));
        axios.put(`/api/paths/update/${selectedPath?._id}`, { the_ids: updatedBody })
            .then(res => {
                if (res.data.status) {
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
        axios.put(`/api/paths/update/${selectedPath?._id}`, { the_ids: updatedTheIdsArray })
            .then(res => {
                if (res.data.status) {
                    resetPathAction();
                    getAllPaths()
                }
            })
    }
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
        console.log({
            step_id: selectedStepId,
            service_ids: [
                ...selectedServices
            ]
        }, "lkweflkjwhefkjwef")
        axios.post(`/api/steps/attachservice`, {
            step_id: selectedStepId,
            service_ids: [
                ...selectedServices
            ]
        }).then(({ data }) => {
            if (data.status) {
                setStepActionEnabled(false)
            }
            setActionLoading(false)
            setLoading(false)
            setSelectedServices([])
        })
    }

    const removeServiceFromStep = async (serviceId) => {
        try {
            if (!selectedStepId || !serviceId) {
                console.error("Step ID or Service ID is missing.");
                return;
            }
    
            setActionLoading(true);
            setLoading(true);
    
            // Construct the correct URL with both parameters
            const url = `/api/steps/remove/${selectedStepId}/${serviceId}`;
            
            console.log("Removing service from step:", url);
    
            const response = await axios.delete(url);
    
            if (response.status === 200 && response.data.status) {
                console.log("Service removed successfully:", response.data);
                setStepActionEnabled(false);
    
                // Refresh the services list after removal
                fetchServicesForRemoval();
            } else {
                console.error(" Failed to remove service:", response.data.message);
            }
        } catch (error) {
            console.error(" Error removing service from step:", error);
        } finally {
            setActionLoading(false);
            setLoading(false);
        }
    };
    

    useEffect(() => {
        if (!stepActionEnabled) {
            setSelectedServices([])
            setStepActionStep(1)
        }
    }, [stepActionEnabled])

    return (
        <>
            <MenuNav
                showDrop={showDrop}
                setShowDrop={setShowDrop}
                searchTerm={search}
                setSearchterm={setSearch}
                searchPlaceholder="Search Services..."
            />
            <div className="mypaths">
                <div className="mypaths-menu">
                    <div
                        className="each-mypath-menu"
                        style={{
                            fontWeight: mypathsMenu === "Active Steps" ? "700" : "",
                            background:
                                mypathsMenu === "Active Steps" ? "rgba(241, 241, 241, 0.5)" : "",
                        }}
                        onClick={() => {
                            setMypathsMenu("Active Steps");
                            if (viewPathEnabled) {
                                setViewPathEnabled(false);
                                setViewPathData([]);
                            }
                        }}
                    >
                        Active Steps
                    </div>
                    <div
                        className="each-mypath-menu"
                        style={{
                            fontWeight: mypathsMenu === "Inactive Steps" ? "700" : "",
                            background:
                                mypathsMenu === "Inactive Steps" ? "rgba(241, 241, 241, 0.5)" : "",
                        }}
                        onClick={() => {
                            setMypathsMenu("Inactive Steps");
                            if (viewPathEnabled) {
                                setViewPathEnabled(false);
                                setViewPathData([]);
                            }
                        }}
                    >
                        Inactive Steps
                    </div>
                </div>

                <div className="mypaths-content">
                    {showSelectedPath ? <div>
                        <CurrentStep productDataArray={productDataArray} selectedPathId={selectedPathId} showSelectedPath={showSelectedPath} selectedPath={selectedPath} />
                    </div> : viewPathEnabled ? (
                        <div className="viewpath-container">
                            <div className="viewpath-top-area">
                                <div>Your Selected Path:</div>
                                {viewPathLoading ? (
                                    <Skeleton width={150} height={30} />
                                ) : (
                                    <div className="viewpath-bold-text">
                                        {viewPathData
                                            ? viewPathData?.destination_institution
                                            : ""}
                                    </div>
                                )}
                                {viewPathLoading ? (
                                    <Skeleton width={500} height={20} />
                                ) : (
                                    <div className="viewpath-des">
                                        {viewPathData ? viewPathData?.description : ""}
                                    </div>
                                )}
                                <div
                                    className="viewpath-goBack-div"
                                    onClick={() => {
                                        setViewPathEnabled(false);
                                    }}
                                >
                                    Go Back
                                </div>
                            </div>
                            <div className="viewpath-steps-area">
                                {viewPathLoading
                                    ? Array(6)
                                        .fill("")
                                        .map((e, i) => {
                                            return (
                                                <div
                                                    className="viewpath-each-j-step viewpath-relative-div"
                                                    key={i}
                                                >
                                                    <div className="viewpath-each-j-img">
                                                        <Skeleton width={75} height={75} />
                                                    </div>
                                                    <div className="viewpath-each-j-step-text">
                                                        <Skeleton width={200} height={30} />
                                                    </div>
                                                    <div className="viewpath-each-j-step-text1">
                                                        <Skeleton width={250} height={25} />
                                                    </div>
                                                    <div className="viewpath-each-j-amount-div">
                                                        <div className="viewpath-each-j-amount">
                                                            <Skeleton width={100} height={30} />
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    : viewPathData
                                        ? viewPathData?.StepDetails?.map((e, i) => {
                                            return (
                                                <div onClick={() => {
                                                    setShowSelectedPath(e)
                                                    setProductKeys(e?.product_ids)
                                                }}
                                                    className="viewpath-each-j-step viewpath-relative-div"
                                                    key={i}
                                                >
                                                    <div className="viewpath-each-j-img">
                                                        <img src={e?.icon} alt="" />
                                                    </div>
                                                    <div className="viewpath-each-j-step-text">
                                                        {e?.name}
                                                    </div>
                                                    <div className="viewpath-each-j-step-text1">
                                                        {e?.description}
                                                    </div>
                                                    <div className="viewpath-each-j-amount-div">
                                                        <div className="viewpath-each-j-amount">
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
                        <>
                            <div className="mypathsNav">
                                <div className="mypathsName">Name</div>
                                <div className="mypathsCountry">Length</div>
                                <div className="mypathsCountry">Cost Structure</div>
                                <div className="mypathsMicrosteps">Services</div>
                            </div>
                            <div className="mypathsScroll-div">
                                {loading
                                    ? Array(10)
                                        .fill("")
                                        ?.map((e, i) => {
                                            return (
                                                <div className="each-mypaths-data1" key={i}>
                                                    <div className="each-mypaths-detail">
                                                        <div className="each-mypathsName">
                                                            <Skeleton width={100} height={30} />
                                                        </div>
                                                        <div className="each-mypathsCountry">
                                                            <Skeleton width={100} height={30} />
                                                        </div>
                                                        <div className="each-mypathsCountry">
                                                            <Skeleton width={100} height={30} />
                                                        </div>
                                                        <div className="each-mypathsMicrosteps">
                                                            <Skeleton width={100} height={30} />
                                                        </div>
                                                    </div>
                                                    <div className="each-mypaths-desc">
                                                        <div className="each-mypaths-desc-txt">
                                                            <Skeleton width={100} height={30} />
                                                        </div>
                                                        <div className="each-mypaths-desc-txt1">
                                                            <Skeleton width={"100%"} height={30} />
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    : filteredPartnerStepsData?.map((e, i) => {
                                        return (
                                            <div
                                                className="each-mypaths-data1"
                                                key={i}
                                                onClick={() => {
                                                    setSelectedStepId(e?._id);
                                                    setStepActionEnabled(true);
                                                }}
                                            >
                                                <div className="each-mypaths-detail">
                                                    <div className="each-mypathsName">
                                                        <div>
                                                            <div>{e?.name}</div>
                                                            <div
                                                                style={{
                                                                    fontSize: "0.8rem",
                                                                    fontWeight: "300",
                                                                }}
                                                            >
                                                                {e?._id}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="each-mypathsCountry">
                                                        {e?.length ? e?.length : 0} Days
                                                    </div>
                                                    <div className="each-mypathsCountry">{e?.cost}</div>
                                                    <div className="each-mypathsMicrosteps">
                              {e?.services ? e.services.length : 0}
                          </div>
                                                </div>
                                                <div className="each-mypaths-desc">
                                                    <div className="each-mypaths-desc-txt">
                                                        Description
                                                    </div>
                                                    <div className="each-mypaths-desc-txt1">
                                                        {e?.description}
                                                    </div>
                                                </div>


                                                
                
                                            </div>
                                        );
                                    })}
                            </div>
                        </>
                    )}

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
                                    {pathActionStep > 3 ? "Edit Paths" : pathActionStep > 7 ? "Add service" : "My Path Actions"}
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
                                        {admin &&
                                            <div
                                                className="acc-step-box4"
                                                onClick={() => {
                                                    setPathActionStep(6);
                                                }}
                                            >
                                                Reject Path
                                            </div>}
                                        {/* <div
                        className="acc-step-box4"
                        onClick={() => {
                        setPathActionStep(9);
                        }}
                    >
                        Add Services
                    </div> */}
                                        <div
                                            className="acc-step-box4"
                                            onClick={() => {
                                                setViewPathEnabled(true);
setPathActionEnabled(false);
 viewPathById(selectedPath?._id)

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

                            {pathActionStep === 4 &&
                                (editPaths === "default" ? (
                                    <div className="acc-mt-div">
                                        <div className="acc-sub-text">
                                            What type of data do you want to edit?
                                        </div>
                                        <div className="acc-scroll-div">
                                            {/* <div
                        className="acc-step-box4"
                        onClick={() => {
                            setEditPaths("Edit meta data");
                        }}
                        >
                        Edit meta data
                        </div> */}
                                            <div
                                                className="acc-step-box4"
                                                onClick={() => {
                                                    setEditPaths("Edit steps");
                                                }}
                                            >
                                                Edit steps
                                            </div>
                                            {/* <div
                        className="acc-step-box4"
                        onClick={() => {
                            setEditPaths("Edit who qualifies");
                        }}
                        >
                        Edit who qualifies
                        </div> */}
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
                                ) : editPaths === "Edit meta data" ? (
                                    metaDataStep === "default" ? (
                                        <div className="acc-mt-div">
                                            <div className="acc-sub-text">
                                                Which meta data do you want to edit?
                                            </div>
                                            <div className="acc-scroll-div">
                                                <div
                                                    className="acc-step-box4"
                                                    onClick={() => {
                                                        setMetaDataStep("nameOfPath");
                                                    }}
                                                >
                                                    Name
                                                </div>
                                                <div
                                                    className="acc-step-box4"
                                                    onClick={() => {
                                                        setMetaDataStep("length");
                                                    }}
                                                >
                                                    Length
                                                </div>
                                                <div
                                                    className="acc-step-box4"
                                                    onClick={() => {
                                                        setMetaDataStep("description");
                                                    }}
                                                >
                                                    Description
                                                </div>
                                                <div
                                                    className="acc-step-box4"
                                                    onClick={() => {
                                                        setMetaDataStep("path_type");
                                                    }}
                                                >
                                                    Path type
                                                </div>
                                                <div
                                                    className="acc-step-box4"
                                                    onClick={() => {
                                                        setMetaDataStep("destination_institution");
                                                    }}
                                                >
                                                    Destination institution
                                                </div>
                                                <div
                                                    className="acc-step-box4"
                                                    onClick={() => {
                                                        setMetaDataStep("program");
                                                    }}
                                                >
                                                    Program
                                                </div>
                                                <div
                                                    className="acc-step-box4"
                                                    onClick={() => {
                                                        setMetaDataStep("city");
                                                    }}
                                                >
                                                    City
                                                </div>
                                                <div
                                                    className="acc-step-box4"
                                                    onClick={() => {
                                                        setMetaDataStep("country");
                                                    }}
                                                >
                                                    Country
                                                </div>
                                            </div>
                                            <div
                                                className="goBack3"
                                                onClick={() => {
                                                    setEditPaths("default");
                                                }}
                                            >
                                                Go Back
                                            </div>
                                        </div>
                                    ) : metaDataStep === "success" ? (
                                        <div className="success-box2">
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
                                            <div className="acc-mt-div">
                                                <div className="acc-scroll-div">
                                                    <div className="acc-sub-textt">
                                                        Current{" "}
                                                        {metaDataStep === "nameOfPath"
                                                            ? "name"
                                                            : metaDataStep === "path_type"
                                                                ? "path type"
                                                                : metaDataStep === "destination_institution"
                                                                    ? "destination institution"
                                                                    : metaDataStep}
                                                    </div>
                                                    <div className="acc-step-box5">
                                                        {selectedPath?.[metaDataStep] || ""}
                                                    </div>
                                                    <div className="acc-sub-textt">
                                                        New{" "}
                                                        {metaDataStep === "nameOfPath"
                                                            ? "name"
                                                            : metaDataStep === "path_type"
                                                                ? "path type"
                                                                : metaDataStep === "destination_institution"
                                                                    ? "destination institution"
                                                                    : metaDataStep}
                                                    </div>
                                                    <div className="acc-step-box6">
                                                        <input
                                                            type="text"
                                                            placeholder={`Enter ${metaDataStep === "nameOfPath"
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
                                                    className="save-Btn"
                                                    onClick={() => {
                                                        if (newValue?.length > 1) {
                                                            editMetaData(metaDataStep);
                                                        }
                                                    }}
                                                >
                                                    Save Changes
                                                </div>
                                                <div
                                                    className="goBack3"
                                                    onClick={() => {
                                                        setMetaDataStep("default");
                                                    }}
                                                >
                                                    Go Back
                                                </div>
                                            </div>
                                            {actionLoading ? (
                                                <div className="popularlogo">
                                                    <img className="popularlogoimg" src={lg1} alt="" />
                                                </div>
                                            ) : (
                                                ""
                                            )}
                                        </>
                                    )
                                ) : editPaths === "Edit steps" ? (
                                    <div className="acc-mt-div">
                                        <div className="acc-sub-text">
                                            How do you want to edit the steps in this path?
                                        </div>
                                        <div className="acc-scroll-div">
                                            <div className="acc-step-box4" onClick={e => {
                                                setEditPaths("add_step");
                                            }}>Add new step</div>
                                            <div className="acc-step-box4" onClick={e => {
                                                setEditPaths("remove_step");
                                            }}>Remove existing step</div>
                                            {/* <div className="acc-step-box4">
                        Edit backup path for existing step
                        </div>
                        */}
                                            <div className="acc-step-box" onClick={e => {
                                                setEditPaths("reorder_step");
                                            }}>Reorder existing steps</div>
                                        </div>
                                        <div
                                            className="goBack3"
                                            onClick={() => {
                                                setEditPaths("default");
                                            }}
                                        >
                                            Go Back
                                        </div>
                                    </div>
                                ) : editPaths === "add_step" ? (
                                    <div className="acc-mt-div">
                                        <div className="acc-sub-text">
                                            Which step do you want to add?
                                        </div>
                                        <div className="acc-scroll-div" >
                                            {remainingStepData?.map(item => (
                                                <div className="acc-step-box6" onClick={e => {
                                                    setEditPaths("add_sub_step");
                                                    setStepId(item?._id)
                                                }}>
                                                    <div style={{ fontWeight: 600, fontSize: "14px" }}>{item?.name}</div><br />
                                                    <div style={{ fontWeight: 300, fontSize: "12px", lineHeight: "25px", paddingBottom: "10px", borderBottom: '1px solid #e7e7e7' }}>{item?.description?.substring(0, 150) + "..."}</div>
                                                </div>
                                            ))}

                                        </div>
                                        <div
                                            className="goBack3"
                                            onClick={() => {
                                                setEditPaths("default");
                                            }}
                                        >
                                            Go Back
                                        </div>
                                    </div>
                                ) : editPaths === "add_sub_step" ? (
                                    <div className="acc-mt-div">
                                        <div className="acc-sub-text">
                                            Select backup path for this step
                                        </div>
                                        <div className="acc-scroll-div" style={{ height: "55vh !important" }} >
                                            {backupPathData?.map(item => (
                                                item?._id !== selectedPath?._id &&
                                                <div className="substepstyle" onClick={e => {
                                                    setEditPaths("show_all_paths");
                                                    setBackupPathId(item?._id)
                                                }}>
                                                    <div style={{ fontWeight: 600, fontSize: "14px", display: 'flex', justifyContent: 'space-between' }}>
                                                        <div>{item?.program}</div>
                                                        <div>{item?.destination_institution}</div>
                                                    </div>
                                                    <div style={{ fontWeight: 300, fontSize: "12px", lineHeight: "25px", }}>{item?.description?.substring(0, 150) + "..."}</div><br />
                                                    <div style={{ paddingBottom: "10px", fontWeight: 300, fontSize: "12px", lineHeight: "25px" }}>Path id: {item?._id}</div>
                                                </div>
                                            ))}

                                        </div>
                                        <div >
                                            <div
                                                className="goBack5"
                                                onClick={() => {
                                                    setEditPaths("show_all_paths");
                                                    setBackupPathId(null)
                                                }}
                                            >
                                                Continue Without Backup Path
                                            </div>

                                            <div
                                                className="goBack3"
                                                onClick={() => {
                                                    setEditPaths("default");
                                                }}
                                            >
                                                Go Back
                                            </div>
                                        </div>
                                    </div>
                                ) : editPaths === "show_all_paths" ? (
                                    <div className="acc-mt-div">
                                        <div className="acc-sub-text">
                                            Select the positioning of the new step
                                        </div>
                                        <div className="acc-scroll-div" style={{}}>
                                            {selectedPath?.the_ids?.length > 0 ? selectedPath?.the_ids?.map((item, index) => (
                                                <>
                                                    <div className="subpathstyle">
                                                        <div style={{ fontWeight: 600, fontSize: "14px" }}>
                                                            <div>{selectedPath?.nameOfPath}</div>
                                                        </div>
                                                        <div style={{ fontWeight: 300, fontSize: "12px", lineHeight: "25px", }}>{selectedPath?.description?.substring(0, 150) + "..."}</div><br />
                                                        <div style={{ fontWeight: 600, fontSize: "14px", display: 'flex', justifyContent: 'space-between', paddingBottom: "10px" }}>Backup Path</div>
                                                        <div style={{ borderRadius: "15px", border: "1px solid #e7e7e7", padding: '10px' }}>
                                                            {item?._id}
                                                        </div>
                                                    </div>
                                                    <center>
                                                        <div className="placehere" onClick={e => handlePlace(selectedPath, index + 1)}>Place Here</div>
                                                    </center>
                                                </>
                                            )) : <div className="placehere" onClick={e => handlePlace(selectedPath, 0)}>Place Here</div>}

                                        </div>
                                        <div
                                            className="goBack3"
                                            onClick={() => {
                                                setEditPaths("default");
                                            }}
                                        >
                                            Go Back
                                        </div>
                                    </div>
                                ) : editPaths === "remove_step" ? (
                                    <div className="acc-mt-div">
                                        <div className="acc-sub-text">
                                            Select the positioning of the new step
                                        </div>
                                        <div className="acc-scroll-div" style={{}}>
                                            {selectedPath?.the_ids?.map((item, index) => (
                                                <>
                                                    <div className="subpathstyle" style={{ position: "relative" }}>
                                                        <div className="deletePathStyle" onClick={e => handledeletePathPosition(selectedPath, item?._id)}>
                                                            <img src={require("./delete.svg").default} alt="" />
                                                        </div>
                                                        <div style={{ fontWeight: 600, fontSize: "14px" }}>
                                                            <div>{selectedPath?.nameOfPath}</div>
                                                        </div>
                                                        <div style={{ fontWeight: 300, fontSize: "12px", lineHeight: "25px", }}>{selectedPath?.description?.substring(0, 150) + "..."}</div><br />
                                                        <div style={{ fontWeight: 600, fontSize: "14px", display: 'flex', justifyContent: 'space-between', paddingBottom: "10px" }}>Backup Path</div>
                                                        <div style={{ borderRadius: "15px", border: "1px solid #e7e7e7", padding: '10px' }}>
                                                            {item?._id}
                                                        </div>
                                                    </div>

                                                </>
                                            ))}

                                        </div>
                                        <div
                                            className="goBack3"
                                            onClick={() => {
                                                setEditPaths("default");
                                            }}
                                        >
                                            Go Back
                                        </div>
                                    </div>
                                ) : editPaths === "reorder_step" ? (
                                    <div className="acc-mt-div">
                                        <div className="acc-sub-text">
                                            Select the positioning of the new step
                                        </div>
                                        <div className="acc-scroll-div" style={{}}>
                                            <Draggable onPosChange={getChangedPos}>
                                                {selectedPath?.the_ids?.map((item, index) => (
                                                    <>
                                                        <div className="subpathstyle" style={{ position: "relative" }}>

                                                            <div style={{ fontWeight: 600, fontSize: "14px" }}>
                                                                <div>{selectedPath?.nameOfPath}</div>
                                                            </div>
                                                            <div style={{ fontWeight: 300, fontSize: "12px", lineHeight: "25px", }}>{selectedPath?.description?.substring(0, 150) + "..."}</div><br />
                                                            <div style={{ fontWeight: 600, fontSize: "14px", display: 'flex', justifyContent: 'space-between', paddingBottom: "10px" }}>Backup Path</div>
                                                            <div style={{ borderRadius: "15px", border: "1px solid #e7e7e7", padding: '10px' }}>
                                                                {item?._id}
                                                            </div>
                                                        </div>

                                                    </>
                                                ))}
                                            </Draggable>
                                        </div>
                                        <div
                                            className="goBack3"
                                            onClick={() => {
                                                setEditPaths("default");
                                            }}
                                        >
                                            Go Back
                                        </div>
                                    </div>
                                ) : editPaths === "Edit who qualifies" ? (
                                    <div className="acc-mt-div">
                                        <div className="acc-sub-text">
                                            Which of the current coordinates do you want to edit?
                                        </div>
                                        <div className="acc-scroll-div">
                                            <div className="acc-step-box4">Grade</div>
                                            <div className="acc-step-box4">Grade point avg</div>
                                            <div className="acc-step-box4">Curriculum</div>
                                            <div className="acc-step-box4">Stream</div>
                                            <div className="acc-step-box4">Financial situation</div>
                                            <div className="acc-step-box4">Personality</div>
                                        </div>
                                        <div
                                            className="goBack3"
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
                                <div className="acc-mt-div">
                                    <div className="acc-sub-text">
                                        Are you sure you want to approve this path?
                                    </div>
                                    <div className="acc-scroll-div">
                                        <div
                                            className="acc-step-box4"
                                            onClick={e => handleApprovePath()}
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
                            }
                            {pathActionStep === 6 &&
                                <div className="acc-mt-div">
                                    <div className="acc-sub-text">
                                        Are you sure you want to reject this path?
                                    </div>
                                    <div className="acc-scroll-div">
                                        <div
                                            className="acc-step-box4"
                                            onClick={() => {
                                                handleRejectPath()
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
                            }
                            {pathActionStep === 7 && (
                                <div className="success-box2">Path is Approved.</div>
                            )}
                            {pathActionStep === 8 && (
                                <div className="success-box2">Path is Rejected.</div>
                            )}

                            {/* Add Service Steps */}

                            {pathActionStep === 9 &&
                                <div className="acc-mt-div">
                                    <div className="acc-sub-text">
                                        Which step do you want to add the service to?
                                    </div>
                                    <div className="acc-scroll-div">
                                        {selectedPath && selectedPath?.StepDetails?.map(item => (
                                            <div
                                                className="acc-step-box4"
                                                style={{ flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center' }}
                                                onClick={() => {
                                                    setAddServiceStep(item)
                                                    setPathActionStep(10)
                                                }}
                                            >
                                                <div>{item?.name}</div>
                                                <div style={{ fontSize: '12px', fontWeight: 400, paddingTop: '5px' }}>{item?._id}</div>
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
                            }
                            {pathActionStep === 10 &&
                                <div className="acc-mt-div">
                                    <div className="acc-sub-text">
                                        Which service do you want to add?
                                    </div>
                                    <div className="acc-scroll-div">
                                        {allServicesToAdd && allServicesToAdd.map(item => (
                                            <div
                                                key={item._id}
                                                className="acc-step-box4"
                                                style={{ flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center' }}
                                                onClick={(e) => handleAddService(item?._id)}
                                            >
                                                <div>{item?.name}</div>
                                                <div style={{ fontSize: '12px', fontWeight: 400, paddingTop: '5px' }}>{item?.product_id}</div>
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
                                    <div className="acc-step-box" onClick={() => {
                                        setStepActionStep(4);
                                    }}>Edit Services</div>
                                    <div className="acc-step-box"
                                     onClick={() => {
                                     setStepActionStep(7);
                                     }}
                                    
                                    >Edit Step</div>
                                    <div className="acc-step-box" onClick={() => { deleteStep(); }}>
                                        Delete step
                                    </div>

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
                                    <div className="acc-sub-text">
                                        What do you want to do?
                                    </div>
                                    <div className="acc-scroll-div">
                                        <div
                                            className="acc-step-box4"
                                            style={{ flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center' }}
                                            onClick={(e) => setStepActionStep(5)}
                                        >
                                            <div>Add a Service</div>
                                        </div>
                                        <div
                                            className="acc-step-box4"
                                            style={{ flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center' }}
                                            onClick={(e) => {
                                                fetchServicesForRemoval();
                                                setStepActionStep(6);
                                              }}
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
                                        {allServicesToAdd && allServicesToAdd.map(item => (
                                            <div
                                                className={selectedServices.includes(item?._id) ? 'acc-step-box4-selected' : "acc-step-box4"}
                                                style={{ flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center' }}
                                                onClick={(e) => handleSelectServicesForStep(item?._id)}
                                            >
                                                <div>{item?.name}</div>
                                                <div style={{ fontSize: '12px', fontWeight: 400, paddingTop: '5px' }}>{item?._id}</div>
                                            </div>
                                        ))}



                                    </div>
                                    <div className="save-Btn"
                                        style={{ opacity: selectedServices.length > 0 ? 1 : 0.3 }}
                                        onClick={() => selectedServices.length > 0 && addServicesToStep()}
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
                                // gfdg


                                <div className="acc-mt-div">
                                    <div className="acc-sub-text">
                                        Which service do you want to remove?
                                    </div>
                                    <div className="acc-scroll-div">
                                        {allServicesToRemove && allServicesToRemove.map(item => (
                                            <div
                                                className={selectedServices.includes(item?._id) ? 'acc-step-box4-selected' : "acc-step-box4"}
                                                style={{ flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center' }}
                                                onClick={(e) => removeServiceFromStep(item?._id)}
                                            >
                                                <div>{item?.name}</div>
                                                <div style={{ fontSize: '12px', fontWeight: 400, paddingTop: '5px' }}>{item?._id}</div>
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

{stepActionStep === 7 && (
    <div>
        <EditStepForm
            selectedStep={selectedStepId}
            onSave={(updatedStep) => {
                console.log("Updated Step Data:", updatedStep);
                setTimeout(() => {
                    setStepActionStep(null); // Close form after success message
                }, 2000);
            }}
            onCancel={() => setStepActionStep(null)} // Close form on cancel
        />
        
    </div>
)}


                            {stepActionStep === 8 && (
                                <div className="acc-mt-div">
                                    <div className="acc-sub-text">Add New Step Functionality Coming Soon!</div>
                                    <div
                                        className="goBack3"
                                        onClick={() => {
                                            setStepActionStep(7); // Go back to Edit Step options
                                        }}
                                    >
                                        Go Back
                                    </div>
                                </div>
                            )}

                            {stepActionStep === 9 && (
                                <div className="acc-mt-div">
                                    <div className="acc-sub-text">Remove Existing Step Functionality Coming Soon!</div>
                                    <div
                                        className="goBack3"
                                        onClick={() => {
                                            setStepActionStep(7); // Go back to Edit Step options
                                        }}
                                    >
                                        Go Back
                                    </div>
                                </div>
                            )}

                            {stepActionStep === 10 && (
                                <div className="acc-mt-div">
                                    <div className="acc-sub-text">Reorder Existing Steps Functionality Coming Soon!</div>
                                    <div
                                        className="goBack3"
                                        onClick={() => {
                                            setStepActionStep(7); // Go back to Edit Step options
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
        </>
    );
};

export default MyStepsAcc;
