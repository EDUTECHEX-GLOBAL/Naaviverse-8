import React, { useState, useEffect } from "react";
import { useCoinContextData } from "../../../context/CoinContext";
import Skeleton from "react-loading-skeleton";
import "./mypaths.scss";
import axios from "axios";
import { Draggable } from "react-drag-reorder";
import EditStepForm from "./steps.jsx";
import dummy from "./dummy.svg";
import closepop from "../../../static/images/dashboard/closepop.svg";
import lg1 from "../../../static/images/login/lg1.svg";
import CurrentStep from "../../CurrentStep";
import { useStore } from "../../../components/store/store.ts";
import { useNavigate, useLocation } from "react-router-dom";
import MenuNav from "../../../components/MenuNav/index.jsx";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

// ─── Helper: parse duration object → human-readable string ───────────────────
const parseDuration = (raw) => {
    try {
        const dur = typeof raw === "string" ? JSON.parse(raw) : raw;
        const parts = [
            parseInt(dur?.years) > 0 ? `${dur.years}y` : "",
            parseInt(dur?.months) > 0 ? `${dur.months}m` : "",
            parseInt(dur?.days) > 0 ? `${dur.days}d` : "",
        ].filter(Boolean);
        return parts.length ? parts.join(" ") : null;
    } catch {
        return null;
    }
};

// ─── Layer Card Component ─────────────────────────────────────────────────────
const LayerCard = ({ type, name, description, length, access }) => {
    const config = {
        macro: {
            label: "MACRO",
            borderColor: "#0d6b6e",
            labelColor: "#0d6b6e",
            bgColor: "#e6f3f4",
            icon: "◈",
        },
        micro: {
            label: "MICRO",
            borderColor: "#3b82f6",
            labelColor: "#3b82f6",
            bgColor: "#eff6ff",
            icon: "◆",
        },
        nano: {
            label: "NANO",
            borderColor: "#a855f7",
            labelColor: "#a855f7",
            bgColor: "#faf5ff",
            icon: "◇",
        },
    };
    const c = config[type];

    if (!name) return null;

    return (
        <div
            style={{
                background: "#fafdff",
                borderRadius: "16px",
                padding: "1rem",
                border: `1px solid #e2eaf2`,
                borderTop: `4px solid ${c.borderColor}`,
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
            }}
        >
            {/* Layer label */}
            <div
                style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    background: c.bgColor,
                    color: c.labelColor,
                    borderRadius: "30px",
                    padding: "0.2rem 0.75rem",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    width: "fit-content",
                }}
            >
                <span>{c.icon}</span>
                {c.label}
            </div>

            {/* Name */}
            <div style={{ fontWeight: 700, color: "#0a1c2a", fontSize: "0.95rem", lineHeight: 1.3 }}>
                {name}
            </div>

            {/* Description */}
            {description && (
                <div style={{ color: "#4b5e6b", fontSize: "0.82rem", lineHeight: 1.5 }}>
                    {description}
                </div>
            )}

            {/* Meta chips */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginTop: "0.25rem" }}>
                {length && (
                    <span
                        style={{
                            background: "#ecf3f9",
                            color: "#4b5e6b",
                            borderRadius: "30px",
                            padding: "0.2rem 0.65rem",
                            fontSize: "0.78rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.2rem",
                        }}
                    >
                        ⏱ {length}
                    </span>
                )}
                {access && (
                    <span
                        style={{
                            background: access?.toLowerCase() === "free" ? "#d1fae5" : "#fef3c7",
                            color: access?.toLowerCase() === "free" ? "#047857" : "#92400e",
                            borderRadius: "30px",
                            padding: "0.2rem 0.65rem",
                            fontSize: "0.78rem",
                            fontWeight: 600,
                        }}
                    >
                        {access}
                    </span>
                )}
            </div>
        </div>
    );
};

// ─── Step Card Skeleton ───────────────────────────────────────────────────────
const StepCardSkeleton = () => (
    <div
        style={{
            background: "white",
            borderRadius: "20px",
            border: "1px solid #e2eaf2",
            padding: "1.5rem",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}
    >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
            <Skeleton width={260} height={28} />
            <Skeleton width={100} height={24} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
            <Skeleton height={130} borderRadius={16} />
            <Skeleton height={130} borderRadius={16} />
            <Skeleton height={130} borderRadius={16} />
        </div>
    </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const MyStepsAcc = ({
    search,
    setSearch,
    admin,
    fetchAllServicesAgain,
    stpesMenu,
    showDrop,
    setShowDrop,
}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const urlParams = new URLSearchParams(location.search);
    const filterPathId = urlParams.get("pathId");
    const filterPathName = urlParams.get("pathName");
    const { sideNav, setsideNav, accsideNav, setaccsideNav } = useStore();

    let userDetails = JSON.parse(localStorage.getItem("partner"));
    const {
        setCurrentStepData,
        setCurrentStepDataLength,
        mypathsMenu,
        setMypathsMenu,
    } = useCoinContextData();

    // ── State ─────────────────────────────────────────────────────────────────
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
    const [showSelectedPath, setShowSelectedPath] = useState(null);
    const [addServiceStep, setAddServiceStep] = useState(null);
    const [selectedSubStep, setSelectedSubStep] = useState(null);
    const [backupPathData, setBackupPathData] = useState([]);
    const [stepId, setStepId] = useState("");
    const [backupPathId, setBackupPathId] = useState("");
    const [selectedStep, setSelectedStep] = useState(null);
    const [remainingStepData, setRemainingStepData] = useState([]);
    const [allServices, setAllServices] = useState([]);
    const [productDataArray, setProductDataArray] = useState([]);
    const [productKeys, setProductKeys] = useState([]);
    const [allServicesToAdd, setAllServicesToAdd] = useState([]);
    const [selectedServices, setSelectedServices] = useState([]);

    // Sync mypathsMenu from URL on mount
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tab = params.get("tab");
        if (tab === "inactive") {
            setMypathsMenu("Inactive Steps");
        } else {
            setMypathsMenu("Active Steps");
        }
    }, [location.search]);
    // ── API functions ─────────────────────────────────────────────────────────
    const getAllPaths = () => {
        setLoading(true);
        let email = userDetails?.email;
        const endpoint = admin
            ? `${BASE_URL}/api/paths/get?status=active`
            : `${BASE_URL}/api/paths/get?email=${email}`;
        axios
            .get(endpoint)
            .then((response) => {
                let result = response?.data?.data;
                if (result) setPartnerPathData(result);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    const getAllStepsForPath = () => {
        if (!selectedPathId) return;
        setLoading(true);
        let email = userDetails?.email;
        axios
            .get(`${BASE_URL}/api/paths/getremainingsteps?path_id=${selectedPathId}&email=${email}`)
            .then((response) => {
                let result = response?.data?.stepIds;
                if (Array.isArray(result)) setRemainingStepData(result);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        if (selectedPathId) getAllStepsForPath();
    }, [selectedPathId]);

    // ─── FIX 1 & 2: Fetch steps differently depending on whether we are
    //     viewing steps for a specific path (filterPathId) or the general list.
    //     When filterPathId is present, call /api/steps/get?path_id=... directly
    //     (same endpoint that DraftPathView uses — works for ALL path statuses).
    //     When not, fall back to the original status-based partner endpoint.
    // ─────────────────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!userDetails?.email) return;

        // ✅ FIX 1: Coming from "View Steps" on any path (active, draft, etc.)
        // Fetch steps directly by path_id — no status filter applied.
        if (filterPathId) {
            setLoading(true);
            axios
                .get(`${BASE_URL}/api/steps/get`, {
                    params: { path_id: filterPathId },
                })
                .then(({ data }) => {
                    if (data.status || data.data) {
                        setPartnerStepsData(data.data || []);
                    }
                })
                .catch(console.error)
                .finally(() => setLoading(false));
            return; // skip the status-based fetch below
        }

        // Normal flow (My Steps tab — no path filter in URL)
        const status = mypathsMenu === "Inactive Steps" ? "inactive" : "active";
        axios
            .get(`${BASE_URL}/api/steps/partner?email=${userDetails.email}&status=${status}`)
            .then(({ data }) => {
                if (data.status) setPartnerStepsData(data.data);
            })
            .catch(console.error);

    }, [mypathsMenu, filterPathId]); // ✅ FIX 2: added filterPathId to deps

    const getNewPath = () => {
        setLoading(true);
        axios
            .get(`${BASE_URL}/api/paths/get?status=waitingforapproval`)
            .then((response) => {
                let result = response?.data?.data;
                setPartnerPathData(result);
                setLoading(false);
            })
            .catch(console.error);
    };

    const myPathsTimeout = () => setTimeout(reload1, 2000);
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

    const myStepsTimeout = () => setTimeout(reload2, 2000);
    function reload2() {
        setStepActionEnabled(false);
        setStepActionStep(1);
        setSelectedStepId("");
    }

    const deletePath = () => {
        setActionLoading(true);
        axios
            .delete(`${BASE_URL}/api/paths/delete/${selectedPathId}`)
            .then((response) => {
                if (response?.data?.status) {
                    setActionLoading(false);
                    setPathActionStep(3);
                    myPathsTimeout();
                }
            })
            .catch(console.error);
    };

    const deleteStep = () => {
        setActionLoading(true);
        axios
            .delete(`${BASE_URL}/api/steps/delete/${selectedStepId}`, {
                headers: { email: userDetails?.email },
            })
            .then((response) => {
                if (response?.data?.status) {
                    setActionLoading(false);
                    setStepActionStep(3);
                    myStepsTimeout();
                }
            })
            .catch((error) => {
                console.error(error.response?.data || error.message);
                setActionLoading(false);
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
        axios
            .put(`${BASE_URL}/api/paths/update/${selectedPathId}`, { [field]: newValue })
            .then((response) => {
                if (response?.data?.status) {
                    setMetaDataStep("success");
                    setActionLoading(false);
                    myPathsTimeout();
                }
            })
            .catch(console.error);
    };

    const viewPathById = (id) => {
        setViewPathLoading(true);
        axios
            .get(`${BASE_URL}/api/paths/viewpath/${id}`)
            .then((response) => {
                setViewPathData(response?.data?.data);
                setViewPathLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching view path data:", error);
                setViewPathLoading(false);
            });
    };

    const handleApprovePath = () => {
        setActionLoading(true);
        axios
            .put(`${BASE_URL}/api/paths/updatepath/${selectedPathId}`, { status: "active" })
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
            .put(`${BASE_URL}/api/paths/updatepath/${selectedPathId}`, { status: "inactive" })
            .then(({ data }) => {
                if (data.status) {
                    getAllPaths();
                    setPathActionEnabled(false);
                }
            })
            .finally(() => setActionLoading(false));
    };

    const handleAddService = (newId) => {
        setActionLoading(true);
        axios
            .post(`${BASE_URL}/api/steps/addproducts/${selectedStepId}`, { product_ids: [newId] })
            .then(({ data }) => {
                if (data.status) {
                    mypathsMenu === "Pending Paths" ? getNewPath() : getAllPaths();
                    setPathActionEnabled(false);
                    setStepActionEnabled(false);
                    setActionLoading(false);
                    setPathActionStep(1);
                    fetchAllServicesAgain();
                }
            });
    };

    useEffect(() => {
        setShowSelectedPath(null);
    }, [mypathsMenu]);

    useEffect(() => {
        if (!selectedStepId || !userDetails?.email) return;
        axios
            .get(`${BASE_URL}/api/services/getservices?productcreatoremail=${userDetails.email}`)
            .then(({ data }) => {
                if (data.status) setAllServicesToAdd(data.data);
            })
            .catch(console.error);
    }, [selectedStepId]);

    const fetchServicesForRemoval = async () => {
        if (!selectedStepId) return;
        try {
            const response = await axios.get(`${BASE_URL}/api/steps/getall/${selectedStepId.trim()}`);
            if (response.status === 200 && response.data.status) {
                setAllServicesToRemove(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching services for removal:", error);
        }
    };

    const fetchProductData = async (apiKey) => {
        try {
            const response = await axios.get(
                `https://comms.globalxchange.io/gxb/product/get?product_id=${apiKey}`
            );
            return response.data.products[0];
        } catch (error) {
            console.error(`Error fetching product data for key ${apiKey}:`, error);
            return null;
        }
    };

    const fetchData = async () => {
        setProductDataArray([]);
        if (productKeys && Array.isArray(productKeys)) {
            try {
                const results = await Promise.all(productKeys.map((id) => fetchProductData(id)));
                setProductDataArray(results.filter(Boolean));
            } catch (error) {
                console.error("Error fetching product data:", error);
            }
        }
    };

    useEffect(() => {
        fetchData();
    }, [productKeys]);

    const handlePlace = (item, index) => {
        const updatedPathObject = addIdToObjectAtIndex(item?.the_ids, stepId, backupPathId, index);
        axios
            .put(`${BASE_URL}/api/paths/update/${selectedPath?._id}`, { the_ids: updatedPathObject })
            .then((res) => {
                if (res.data.status) {
                    resetPathAction();
                    getAllPaths();
                }
            });
    };

    function addIdToObjectAtIndex(idsArray, stepId, backupPathId, index) {
        const newArray = idsArray.map(({ step_id, backup_pathId }) => ({ step_id, backup_pathId }));
        const newIdObject = backupPathId ? { step_id: stepId, backup_pathId: backupPathId } : { step_id: stepId };
        newArray.splice(index, 0, newIdObject);
        return newArray;
    }

    const handledeletePathPosition = (fullObject, idToDelete) => {
        const updatedTheIds = [...fullObject.the_ids];
        const indexToDelete = updatedTheIds.findIndex((obj) => obj._id === idToDelete);
        if (indexToDelete !== -1) updatedTheIds.splice(indexToDelete, 1);
        const updatedBody = updatedTheIds.map(({ step_id, backup_pathId }) => ({ step_id, backup_pathId }));
        axios
            .put(`${BASE_URL}/api/paths/update/${selectedPath?._id}`, { the_ids: updatedBody })
            .then((res) => {
                if (res.data.status) {
                    resetPathAction();
                    getAllPaths();
                }
            });
    };

    const getChangedPos = (currentPos, newPos) => {
        updatePositionOfObject(selectedPath, currentPos, newPos);
    };

    function updatePositionOfObject(fullObject, currentIndex, newIndex) {
        const updatedTheIds = [...fullObject.the_ids];
        const [movedObject] = updatedTheIds.splice(currentIndex, 1);
        updatedTheIds.splice(newIndex, 0, movedObject);
        const updatedTheIdsArray = updatedTheIds.map(({ step_id, backup_pathId }) => ({
            step_id,
            backup_pathId,
        }));
        axios
            .put(`${BASE_URL}/api/paths/update/${selectedPath?._id}`, { the_ids: updatedTheIdsArray })
            .then((res) => {
                if (res.data.status) {
                    resetPathAction();
                    getAllPaths();
                }
            });
    }

    const handleSelectServicesForStep = (item) => {
        const isSelected = selectedServices.includes(item);
        setSelectedServices(
            isSelected ? selectedServices.filter((s) => s !== item) : [...selectedServices, item]
        );
    };

    const addServicesToStep = () => {
        setActionLoading(true);
        setLoading(true);
        axios
            .post(`${BASE_URL}/api/steps/attachservice`, {
                step_id: selectedStepId,
                service_ids: [...selectedServices],
            })
            .then(({ data }) => {
                if (data.status) setStepActionEnabled(false);
                setActionLoading(false);
                setLoading(false);
                setSelectedServices([]);
            });
    };

    const removeServiceFromStep = async (serviceId) => {
        if (!selectedStepId || !serviceId) return;
        try {
            setActionLoading(true);
            setLoading(true);
            const response = await axios.delete(
                `${BASE_URL}/api/steps/remove/${selectedStepId}/${serviceId}`
            );
            if (response.status === 200 && response.data.status) {
                setStepActionEnabled(false);
                fetchServicesForRemoval();
            }
        } catch (error) {
            console.error("Error removing service from step:", error);
        } finally {
            setActionLoading(false);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!stepActionEnabled) {
            setSelectedServices([]);
            setStepActionStep(1);
        }
    }, [stepActionEnabled]);

    useEffect(() => {
        if (userDetails?.email || admin) getAllPaths();
    }, []);

    const stepToPathMap = React.useMemo(() => {
        const map = {};
        partnerPathData.forEach((path) => {
            path?.the_ids?.forEach((obj) => {
                if (obj?.step_id) map[obj.step_id.toString()] = path?.nameOfPath || "Unnamed Path";
            });
        });
        return map;
    }, [partnerPathData]);

    // ─── FIX 3: filteredSteps — when filterPathId is present, data is already
    //     scoped to that path from the API, so skip the stepToPathMap check.
    //     Previously this check always returned false for draft path steps
    //     because stepToPathMap was built only from active paths.
    // ─────────────────────────────────────────────────────────────────────────
    const filteredSteps = partnerStepsData?.filter((step) => {
        const title = step?.macro_name || step?.name || "";
        const desc = step?.macro_description || step?.description || "";
        const q = search?.toLowerCase() || "";
        if (!title.trim()) return false;

        // ✅ FIX 3: When coming from "View Steps", steps are already filtered
        // by path_id at the API level — just apply the search query filter.
        if (filterPathId) {
            return title.toLowerCase().includes(q) || desc.toLowerCase().includes(q);
        }

        // Normal My Steps view — apply path name filter via stepToPathMap
        const linkedToPath = stepToPathMap[step._id?.toString()] === decodeURIComponent(filterPathName || "");
        if (filterPathName && !linkedToPath) return false;

        return title.toLowerCase().includes(q) || desc.toLowerCase().includes(q);
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════════════════════════════
    return (
        <div className="mypaths">

            {/* ── Main Content ───────────────────────────────────────────── */}
            <div className="mypaths-content">

                {/* ── Tab Menu ────────────────────────────────────────────── */}
                <div className="mypaths-menu" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingRight: "24px" }}>
                    <div style={{ display: "flex", gap: "8px" }}>
                        {["Active Steps", "Inactive Steps"].map((tab) => (
                            <div
                                key={tab}
                                className="each-mypath-menu"
                                style={{
                                    fontWeight: mypathsMenu === tab ? "700" : "",
                                    background: mypathsMenu === tab ? "rgba(241,241,241,0.5)" : "",
                                }}
                                onClick={() => {
                                    setMypathsMenu(tab);
                                    navigate(
                                        `/dashboard/accountants/steps?tab=${tab === "Inactive Steps" ? "inactive" : "active"}`
                                    );
                                    if (viewPathEnabled) {
                                        setViewPathEnabled(false);
                                        setViewPathData([]);
                                    }
                                }}
                            >
                                {tab}
                            </div>
                        ))}
                    </div>

                    {/* Search Bar */}
                    <div className="mp-search-wrapper">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" />
                            <path d="M21 21L16.65 16.65" strokeLinecap="round" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search steps..."
                            value={search || ""}
                            onChange={(e) => setSearch(e.target.value)}
                            className="mp-search-input"
                        />
                    </div>
                </div>

                {showSelectedPath ? (
                    <div>
                        <CurrentStep
                            productDataArray={productDataArray}
                            selectedPathId={selectedPathId}
                            showSelectedPath={showSelectedPath}
                            selectedPath={selectedPath}
                        />
                    </div>
                ) : viewPathEnabled ? (
                    /* ── View Path ─────────────────────────────────────────── */
                    <div className="viewpath-container">
                        <div className="viewpath-top-area">
                            <div>Your Selected Path:</div>
                            {viewPathLoading ? (
                                <Skeleton width={150} height={30} />
                            ) : (
                                <div className="viewpath-bold-text">
                                    {viewPathData ? viewPathData?.destination_institution : ""}
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
                                onClick={() => setViewPathEnabled(false)}
                            >
                                Go Back
                            </div>
                        </div>
                        <div className="viewpath-steps-area">
                            {viewPathLoading
                                ? Array(6)
                                    .fill("")
                                    .map((e, i) => (
                                        <div className="viewpath-each-j-step viewpath-relative-div" key={i}>
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
                                    ))
                                : viewPathData?.StepDetails?.map((e, i) => (
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
                ) : (
                    /* ── Card List ─────────────────────────────────────────── */
                    <div
                        style={{
                            padding: "1.5rem",
                            display: "flex",
                            flexDirection: "column",
                            gap: "1.25rem",
                            paddingBottom: "2rem",
                        }}
                    >
                        {/* Back to Paths banner — only shown when coming from View Steps */}
                        {filterPathId && (
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.75rem",
                                background: "#e6f3f4",
                                borderRadius: "12px",
                                padding: "0.75rem 1.25rem",
                            }}>
                                <span
                                    onClick={() => navigate("/dashboard/accountants/paths")}
                                    style={{ cursor: "pointer", color: "#0d6b6e", fontWeight: 600, fontSize: "0.9rem" }}
                                >
                                    ← Back to Paths
                                </span>
                                <span style={{ color: "#4b5e6b", fontSize: "0.9rem" }}>
                                    Showing Steps For: <strong>{decodeURIComponent(filterPathName || "")}</strong>
                                </span>
                            </div>
                        )}

                        {loading ? (
                            Array(3)
                                .fill("")
                                .map((_, i) => <StepCardSkeleton key={i} />)
                        ) : filteredSteps?.length === 0 ? (
                            <div
                                style={{
                                    textAlign: "center",
                                    padding: "4rem 2rem",
                                    color: "#8fa3b4",
                                }}
                            >
                                <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>📌</div>
                                <div style={{ fontSize: "1.1rem", fontWeight: 600 }}>No Steps Found</div>
                                <div style={{ fontSize: "0.9rem", marginTop: "0.4rem" }}>
                                    Try Adjusting Your Search Or Add A New Step.
                                </div>
                            </div>
                        ) : (
                            filteredSteps?.map((step) => {
                                const pathName =
                                    stepToPathMap[step._id?.toString()] ||
                                    stepToPathMap[step._id] ||
                                    null;

                                const macroDuration =
                                    parseDuration(step.macro_length) || `${step.length || 0} Days`;
                                const microDuration = parseDuration(step.micro_length);
                                const nanoDuration = parseDuration(step.nano_length);

                                const isActive = mypathsMenu !== "Inactive Steps";

                                return (
                                    <div
                                        key={step._id}
                                        onClick={() => {
                                            setSelectedStep(step);
                                            setSelectedStepId(step._id);
                                            setStepActionEnabled(true);
                                        }}
                                        style={{
                                            background: "white",
                                            borderRadius: "20px",
                                            border: "1px solid #e2eaf2",
                                            padding: "1.4rem 1.5rem",
                                            boxShadow: "0 2px 10px rgba(0,20,40,0.04)",
                                            cursor: "pointer",
                                            transition: "box-shadow 0.2s, transform 0.15s",
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.boxShadow = "0 8px 28px rgba(0,40,60,0.09)";
                                            e.currentTarget.style.transform = "translateY(-1px)";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,20,40,0.04)";
                                            e.currentTarget.style.transform = "translateY(0)";
                                        }}
                                    >
                                        {/* ── Card Header ──────────────────────────── */}
                                        <div
                                            style={{
                                                display: "flex",
                                                flexWrap: "wrap",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                                gap: "0.75rem",
                                                paddingBottom: "1rem",
                                                marginBottom: "1rem",
                                                borderBottom: "1px solid #ecf3f9",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    flexWrap: "wrap",
                                                    gap: "0.6rem",
                                                }}
                                            >
                                                <h3
                                                    style={{
                                                        fontSize: "1.15rem",
                                                        fontWeight: 700,
                                                        color: "#0a1c2a",
                                                        margin: 0,
                                                    }}
                                                >
                                                    {step.macro_name || step.name || "Untitled Step"}
                                                </h3>

                                                {/* Path badge */}
                                                {pathName && (
                                                    <span
                                                        style={{
                                                            background: "#e6f3f4",
                                                            color: "#0d6b6e",
                                                            borderRadius: "30px",
                                                            padding: "0.25rem 0.8rem",
                                                            fontSize: "0.78rem",
                                                            fontWeight: 600,
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: "0.25rem",
                                                        }}
                                                    >
                                                        🔗 {pathName}
                                                    </span>
                                                )}

                                                {/* Status badge */}
                                                <span
                                                    style={{
                                                        background: isActive ? "#d1fae5" : "#fee2e2",
                                                        color: isActive ? "#047857" : "#b91c1c",
                                                        borderRadius: "30px",
                                                        padding: "0.22rem 0.8rem",
                                                        fontSize: "0.72rem",
                                                        fontWeight: 700,
                                                        letterSpacing: "0.05em",
                                                        textTransform: "uppercase",
                                                    }}
                                                >
                                                    {isActive ? "Active" : "Inactive"}
                                                </span>
                                            </div>
                                        </div>

                                        {/* ── Three-Layer Grid ─────────────────────── */}
                                        <div
                                            style={{
                                                display: "grid",
                                                gridTemplateColumns: "repeat(3, 1fr)",
                                                gap: "1rem",
                                            }}
                                        >
                                            <LayerCard
                                                type="macro"
                                                name={step.macro_name || step.name}
                                                description={step.macro_description || step.description}
                                                length={macroDuration}
                                                access={step.macro_access || step.cost || "Free"}
                                            />
                                            <LayerCard
                                                type="micro"
                                                name={step.micro_name}
                                                description={step.micro_description}
                                                length={microDuration}
                                                access={step.micro_access}
                                            />
                                            <LayerCard
                                                type="nano"
                                                name={step.nano_name}
                                                description={step.nano_description}
                                                length={nanoDuration}
                                                access={step.nano_access}
                                            />
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}

                {/* ═══════════════════════════════════════════════════════════
                        PATH ACTION PANEL
                    ══════════════════════════════════════════════════════════════ */}
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
                                onClick={resetPathAction}
                            >
                                <img className="acc-popular-img1" src={closepop} alt="" />
                            </div>
                        </div>

                        {pathActionStep === 1 && mypathsMenu !== "Pending Paths" && (
                            <div className="acc-mt-div">
                                <div className="acc-scroll-div">
                                    <div className="acc-step-box4" onClick={() => setPathActionStep(4)}>Edit path</div>
                                    <div className="acc-step-box4" onClick={() => setPathActionStep(2)}>Delete path</div>
                                    {admin && (
                                        <div className="acc-step-box4" onClick={() => setPathActionStep(6)}>Reject Path</div>
                                    )}
                                    <div
                                        className="acc-step-box4"
                                        onClick={() => {
                                            setViewPathEnabled(true);
                                            setPathActionEnabled(false);
                                            viewPathById(selectedPath?._id);
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
                                    <div className="acc-step-box4" onClick={() => setPathActionStep(5)}>Approve Path</div>
                                    <div className="acc-step-box4" onClick={() => setPathActionStep(6)}>Reject Path</div>
                                    <div className="acc-step-box4" onClick={() => setPathActionStep(9)}>Add Services</div>
                                    <div className="acc-step-box4" onClick={() => setPathActionStep(4)}>Edit path</div>
                                    <div className="acc-step-box4" onClick={() => setPathActionStep(2)}>Delete path</div>
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
                                    <div className="acc-step-box4" onClick={deletePath}>Confirm and delete</div>
                                </div>
                                <div className="goBack3" onClick={() => setPathActionStep(1)}>Go Back</div>
                            </div>
                        )}

                        {actionLoading && (
                            <div className="popularlogo">
                                <img className="popularlogoimg" src={lg1} alt="" />
                            </div>
                        )}

                        {pathActionStep === 3 && <div className="success-box2">Path Successfully Deleted</div>}

                        {pathActionStep === 4 &&
                            (editPaths === "default" ? (
                                <div className="acc-mt-div">
                                    <div className="acc-scroll-div">
                                        <div className="acc-step-box4" onClick={() => setEditPaths("Edit steps")}>Edit steps</div>
                                    </div>
                                    <div className="goBack3" onClick={() => setPathActionStep(1)}>Go Back</div>
                                </div>
                            ) : editPaths === "Edit meta data" ? (
                                metaDataStep === "default" ? (
                                    <div className="acc-mt-div">
                                        <div className="acc-scroll-div">
                                            {["nameOfPath", "length", "description", "path_type", "destination_institution", "program", "city", "country"].map((field) => (
                                                <div key={field} className="acc-step-box4" onClick={() => setMetaDataStep(field)}>
                                                    {field === "nameOfPath" ? "Name" : field === "destination_institution" ? "Destination institution" : field === "path_type" ? "Path type" : field.charAt(0).toUpperCase() + field.slice(1)}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="goBack3" onClick={() => setEditPaths("default")}>Go Back</div>
                                    </div>
                                ) : metaDataStep === "success" ? (
                                    <div className="success-box2">Successfully updated. Redirecting...</div>
                                ) : (
                                    <div className="acc-mt-div">
                                        <div className="acc-scroll-div">
                                            <div className="acc-sub-textt">Current {metaDataStep}</div>
                                            <div className="acc-step-box5">{selectedPath?.[metaDataStep] || ""}</div>
                                            <div className="acc-sub-textt">New {metaDataStep}</div>
                                            <div className="acc-step-box6">
                                                <input
                                                    type="text"
                                                    placeholder={`Enter ${metaDataStep}`}
                                                    onChange={(e) => setNewValue(e.target.value)}
                                                    value={newValue}
                                                />
                                            </div>
                                        </div>
                                        <div
                                            className="save-Btn"
                                            style={{ opacity: newValue?.length > 1 ? 1 : 0.5, cursor: newValue?.length > 1 ? "pointer" : "not-allowed" }}
                                            onClick={() => { if (newValue?.length > 1) editMetaData(metaDataStep); }}
                                        >
                                            Save Changes
                                        </div>
                                        <div className="goBack3" onClick={() => setMetaDataStep("default")}>Go Back</div>
                                    </div>
                                )
                            ) : editPaths === "Edit steps" ? (
                                <div className="acc-mt-div">
                                    <div className="acc-scroll-div">
                                        <div className="acc-step-box4" onClick={() => setEditPaths("add_step")}>Add new step</div>
                                        <div className="acc-step-box4" onClick={() => setEditPaths("remove_step")}>Remove existing step</div>
                                        <div className="acc-step-box" onClick={() => setEditPaths("reorder_step")}>Reorder existing steps</div>
                                    </div>
                                    <div className="goBack3" onClick={() => setEditPaths("default")}>Go Back</div>
                                </div>
                            ) : editPaths === "add_step" ? (
                                <div className="acc-mt-div">
                                    <div className="acc-sub-text">Which step do you want to add?</div>
                                    <div className="acc-scroll-div">
                                        {remainingStepData?.map((item) => (
                                            <div key={item._id} className="acc-step-box6" onClick={() => { setEditPaths("add_sub_step"); setStepId(item?._id); }}>
                                                <div style={{ fontWeight: 600, fontSize: "14px" }}>{item?.name}</div>
                                                <div style={{ fontWeight: 300, fontSize: "12px", lineHeight: "25px", paddingBottom: "10px", borderBottom: "1px solid #e7e7e7" }}>{item?.description?.substring(0, 150)}...</div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="goBack3" onClick={() => setEditPaths("default")}>Go Back</div>
                                </div>
                            ) : editPaths === "add_sub_step" ? (
                                <div className="acc-mt-div">
                                    <div className="acc-sub-text">Select backup path for this step</div>
                                    <div className="acc-scroll-div">
                                        {backupPathData?.map((item) =>
                                            item?._id !== selectedPath?._id && (
                                                <div key={item._id} className="substepstyle" onClick={() => { setEditPaths("show_all_paths"); setBackupPathId(item?._id); }}>
                                                    <div style={{ fontWeight: 600, fontSize: "14px", display: "flex", justifyContent: "space-between" }}>
                                                        <div>{item?.program}</div><div>{item?.destination_institution}</div>
                                                    </div>
                                                    <div style={{ fontWeight: 300, fontSize: "12px" }}>{item?.description?.substring(0, 150)}...</div>
                                                </div>
                                            )
                                        )}
                                    </div>
                                    <div className="goBack5" onClick={() => { setEditPaths("show_all_paths"); setBackupPathId(null); }}>Continue Without Backup Path</div>
                                    <div className="goBack3" onClick={() => setEditPaths("default")}>Go Back</div>
                                </div>
                            ) : editPaths === "show_all_paths" ? (
                                <div className="acc-mt-div">
                                    <div className="acc-sub-text">Select the positioning of the new step</div>
                                    <div className="acc-scroll-div">
                                        {selectedPath?.the_ids?.length > 0
                                            ? selectedPath?.the_ids?.map((item, index) => (
                                                <React.Fragment key={index}>
                                                    <div className="subpathstyle">
                                                        <div style={{ fontWeight: 600, fontSize: "14px" }}>{selectedPath?.nameOfPath}</div>
                                                        <div style={{ fontWeight: 300, fontSize: "12px" }}>{selectedPath?.description?.substring(0, 150)}...</div>
                                                        <div style={{ borderRadius: "15px", border: "1px solid #e7e7e7", padding: "10px", marginTop: "8px" }}>{item?._id}</div>
                                                    </div>
                                                    <center><div className="placehere" onClick={() => handlePlace(selectedPath, index + 1)}>Place Here</div></center>
                                                </React.Fragment>
                                            ))
                                            : <div className="placehere" onClick={() => handlePlace(selectedPath, 0)}>Place Here</div>
                                        }
                                    </div>
                                    <div className="goBack3" onClick={() => setEditPaths("default")}>Go Back</div>
                                </div>
                            ) : editPaths === "remove_step" ? (
                                <div className="acc-mt-div">
                                    <div className="acc-scroll-div">
                                        {selectedPath?.the_ids?.map((item, index) => (
                                            <div key={index} className="subpathstyle" style={{ position: "relative" }}>
                                                <div className="deletePathStyle" onClick={() => handledeletePathPosition(selectedPath, item?._id)}>
                                                    <img src={require("./delete.svg").default} alt="" />
                                                </div>
                                                <div style={{ fontWeight: 600, fontSize: "14px" }}>{selectedPath?.nameOfPath}</div>
                                                <div style={{ fontWeight: 300, fontSize: "12px" }}>{selectedPath?.description?.substring(0, 150)}...</div>
                                                <div style={{ borderRadius: "15px", border: "1px solid #e7e7e7", padding: "10px", marginTop: "8px" }}>{item?._id}</div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="goBack3" onClick={() => setEditPaths("default")}>Go Back</div>
                                </div>
                            ) : editPaths === "reorder_step" ? (
                                <div className="acc-mt-div">
                                    <div className="acc-scroll-div">
                                        <Draggable onPosChange={getChangedPos}>
                                            {selectedPath?.the_ids?.map((item, index) => (
                                                <div key={index} className="subpathstyle" style={{ position: "relative" }}>
                                                    <div style={{ fontWeight: 600, fontSize: "14px" }}>{selectedPath?.nameOfPath}</div>
                                                    <div style={{ fontWeight: 300, fontSize: "12px" }}>{selectedPath?.description?.substring(0, 150)}...</div>
                                                    <div style={{ borderRadius: "15px", border: "1px solid #e7e7e7", padding: "10px", marginTop: "8px" }}>{item?._id}</div>
                                                </div>
                                            ))}
                                        </Draggable>
                                    </div>
                                    <div className="goBack3" onClick={() => setEditPaths("default")}>Go Back</div>
                                </div>
                            ) : null)}

                        {pathActionStep === 5 && (
                            <div className="acc-mt-div">
                                <div className="acc-sub-text">Are you sure you want to approve this path?</div>
                                <div className="acc-scroll-div">
                                    <div className="acc-step-box4" onClick={handleApprovePath}>Yes</div>
                                    <div className="acc-step-box4" onClick={() => setPathActionStep(1)}>Never mind</div>
                                </div>
                                <div className="goBack3" onClick={() => setPathActionStep(1)}>Go Back</div>
                            </div>
                        )}
                        {pathActionStep === 6 && (
                            <div className="acc-mt-div">
                                <div className="acc-sub-text">Are you sure you want to reject this path?</div>
                                <div className="acc-scroll-div">
                                    <div className="acc-step-box4" onClick={handleRejectPath}>Yes</div>
                                    <div className="acc-step-box4" onClick={() => setPathActionStep(1)}>Never mind</div>
                                </div>
                                <div className="goBack3" onClick={() => setPathActionStep(1)}>Go Back</div>
                            </div>
                        )}
                        {pathActionStep === 7 && <div className="success-box2">Path is Approved.</div>}
                        {pathActionStep === 8 && <div className="success-box2">Path is Rejected.</div>}
                        {pathActionStep === 9 && (
                            <div className="acc-mt-div">
                                <div className="acc-sub-text">Which step do you want to add the service to?</div>
                                <div className="acc-scroll-div">
                                    {selectedPath?.StepDetails?.map((item) => (
                                        <div key={item._id} className="acc-step-box4" style={{ flexDirection: "column", alignItems: "flex-start" }} onClick={() => { setAddServiceStep(item); setPathActionStep(10); }}>
                                            <div>{item?.name}</div>
                                            <div style={{ fontSize: "12px", fontWeight: 400, paddingTop: "5px" }}>{item?._id}</div>
                                        </div>
                                    ))}
                                </div>
                                <div className="goBack3" onClick={() => setPathActionStep(1)}>Go Back</div>
                            </div>
                        )}
                        {pathActionStep === 10 && (
                            <div className="acc-mt-div">
                                <div className="acc-sub-text">Which service do you want to add?</div>
                                <div className="acc-scroll-div">
                                    {allServicesToAdd?.map((item) => (
                                        <div key={item._id} className="acc-step-box4" style={{ flexDirection: "column", alignItems: "flex-start" }} onClick={() => handleAddService(item?._id)}>
                                            <div>{item?.name}</div>
                                            <div style={{ fontSize: "12px", fontWeight: 400, paddingTop: "5px" }}>{item?.product_id}</div>
                                        </div>
                                    ))}
                                </div>
                                <div className="goBack3" onClick={() => setPathActionStep(1)}>Go Back</div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyStepsAcc;