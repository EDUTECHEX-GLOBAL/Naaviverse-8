import React, { useEffect, useState, useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AppAssets from "./AppAssets/AppAssets";
import RegisteredApps from "./RegisteredApps/RegisteredApps";
import TypeOfAsset from "./TypeOfAsset/TypeOfAsset";
import TypeOfStreams from "./TypeOfStreams/TypeOfStreams";
import { Context } from "../../globalComponents/Context/Context";
import "./scanwallet.scss";
import CardSkeleton from "./CardSkeleton/CardSkeleton";
import axios from "axios";
import { authenticate } from "../../services/postAPIs";
import { getRegisteredApp, getUserDetails } from "../../services/getAPIs";
import { toast, ToastContainer } from "react-toastify";
import WalletDashboard from "./WalletDashboard";
export default function AccountSelection({
    type,
    keyIds = [],
    selectedApp = null,
    closeIt,
    splitNum,
    app,
}) {
    const navigate = useNavigate();
    const context = useContext(Context);

    const {
        tabsConfig,
        selectedTab,
        tabApps,
        updateState,
        currentTheme,
        miniTabSelected,
    } = context;
    const [selectionStep, setSelectionStep] = useState(
        type === "type" ? 1 : 0
    );
    const [registeredApps, setRegisteredApps] = useState(null);
    const [userDetails, setUserDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userData11, setUserData] = useState("");
    const [splitInfo, setSplitInfo] = React.useState({
        app: null,
        coin: null,
        type: null,
    });
    const [details, setDetails] = React.useState({
        app: selectedApp,
        stream: null,
        streamType: null,
    });
    const [appsData, setAppsData] = useState([]);

    // const checkAuth = async () => {
    //     let res = await authenticate();
    //     if (res.data.status) {
    //         setLoading(false);
    //     } else {
    //         navigate("/login");
    //         localStorage.clear();
    //         window.location.reload();
    //         toast("JWT expired, please login again")
    //         setLoading(false);
    //     }
    // };

    // useEffect(() => {
    //     checkAuth();
    // }, []);



    const getRegisteredApps = async () => {
        let res = await getRegisteredApp();
        if (res.data.status) {
            console.log(res.data.userApps, "appsdata")
            updateState("registeredApps", res.data.userApps);
            setRegisteredApps(res.data.userApps);
            setLoading(false);
        } else {
            setLoading(false);
        }
    };

    const setUpUserDetails = async () => {
        let res = await getUserDetails();
        if (res.data.status) {
            setUserDetails(res.data.user);
        } else {
            setUserDetails(null)
        }
    };



    useEffect(() => {
        getRegisteredApps();
        setUpUserDetails();
    }, [userData11]);

    // console.log(registeredApps, "registeredApps")
    // console.log(userDetails, "userDetails")



    useEffect(() => {
        // window.location.reload();
        let current = localStorage.getItem("theme");
        updateState("currentTheme", current);
        if (current === "dark") {
            document.documentElement.setAttribute("data-theme", "dark");
        } else {
            document.documentElement.setAttribute("data-theme", "light");
        }
    }, []);




    const handleSplit = (obj) => {
        console.log("split", obj, splitInfo);
        let index = tabsConfig?.findIndex((x) => {
            return x.id === selectedApp.app_code;
        });
        let temp = tabsConfig?.find((x) => {
            return x.id === selectedApp.app_code;
        });
        if (!temp) {
            closeIt();
        }
        let tempOj = {
            ...temp.subTabs[splitNum],
            subType: { ...splitInfo, type: obj.id },
        };
        temp.subTabs[splitNum] = { ...tempOj };

        tabsConfig[index] = { ...temp };
        updateState("miniTabSelected", {
            ...miniTabSelected,
            subType: { ...splitInfo, type: obj.id },
        });
        updateState("selectedTab", { ...temp });
        updateState("tabsConfig", [...tabsConfig]);
        closeIt();
    };

    const handleFinalClickAsset = (obj) => {
        let temp = tabsConfig?.findIndex((x) => {
            return x.app.app_code === selectedApp.app_code;
        });
        let tempObj = tabsConfig[temp];
        if (temp < 0) {
            closeIt();
        } else {
            let tempKeyId;
            if (Object.keys(tempObj.keyId).includes(details.streamType.id)) {
                tempKeyId = {
                    ...tempObj.keyId,
                    [details.streamType.id]: [
                        ...tempObj.keyId[details.streamType.id],
                        obj.id,
                    ],
                };
            }
            // tempObj.id +  details.streamType.keyId + obj.id
            console.log("coming 2", details, tempObj, obj);

            tabsConfig[temp] = {
                ...tempObj,
                subTabs: [
                    ...tempObj.subTabs,
                    {
                        ...details.streamType,
                        keyId: tempObj.id + details.streamType.keyId + obj.id,
                        subType: false,
                        type: obj.id,
                    },
                ],
                keyId: { ...tempKeyId },
            };
            updateState("selectedTab", {
                ...tempObj,
                subTabs: [
                    ...tempObj.subTabs,
                    {
                        ...details.streamType,
                        keyId: tempObj.id + details.streamType.keyId + obj.id,
                        subType: false,
                        type: obj.id,
                    },
                ],
                keyId: { ...tempKeyId },
            });
            updateState("miniTabSelected", {
                ...details.streamType,
                keyId: tempObj.id + details.streamType.keyId + obj.id,
                subType: false,
                type: obj.id,
            });
            updateState("tabsConfig", [...tabsConfig]);
            localStorage.setItem("app", details.app.app_code);
            localStorage.setItem("type", details.streamType.id);
            localStorage.setItem("subType", obj.id);
            // navigate(
            //     `/apps/wallet-scan/${userDetails.email}/${details.app.app_code}/${details.streamType.id}/${obj.id}`
            // );
            setUserData("walletUserData")
            closeIt();
        }
    };
    const handleFinalClick = (obj) => {
        console.log("coming", details, obj);
        let temp = {
            id: details.app.app_code,
            app: details.app,
            subTabs: [
                {
                    ...details.streamType,
                    keyId: details.app.app_code + details.streamType.keyId + obj.id,
                    subType: false,
                    type: obj.id,
                },
            ],
            keyId: { [details.streamType.id]: [obj.id] },
        };

        updateState("tabsConfig", [...tabsConfig, { ...temp }]);
        updateState("selectedTab", temp);
        updateState("miniTabSelected", {
            ...details.streamType,
            keyId: details.app.app_code + details.streamType.keyId + obj.id,
            subType: false,
            type: obj.id,
        });
        updateState("tabApps", [...tabApps, details.app.app_code]);
        if (type === "app") {
            closeIt();
        }
        localStorage.setItem("app", details.app.app_code);
        localStorage.setItem("type", details.streamType.id);
        localStorage.setItem("subType", obj.id);
        // navigate(
        //     `/apps/wallet-scan/${userDetails.email}/${details.app.app_code}/${details.streamType.id}/${obj.id}`
        // );
        setUserData("walletUserData")
    };

    const renderSteps = () => {
        console.log(details, "details")
        console.log(selectionStep, "selectionStep")
        switch (selectionStep) {
            case 0:
                return (

                    <RegisteredApps
                        split={type === "split"}
                        tabApps={tabApps}
                        userDetails={userDetails}
                        registeredApps={registeredApps}
                        handleClick={(obj) => {
                            type === "split"
                                ? setSplitInfo({ ...splitInfo, app: obj })
                                : setDetails({ ...details, app: obj });
                            setSelectionStep(1);
                        }}
                    />
                );
            case 1:
                return (
                    <TypeOfStreams
                        userDetails={userDetails}
                        handleClick={(obj) => {
                            setDetails({ ...details, stream: obj.id });
                            setSelectionStep(2);
                        }}
                    />
                );
            case 2:
                return (
                    <AppAssets
                        keyIds={keyIds}
                        selectedApp={type === "split" ? splitInfo.app : details.app}
                        handleClick={(obj) => {
                            type === "split"
                                ? setSplitInfo({ ...splitInfo, coin: obj })
                                : setDetails({ ...details, streamType: obj });
                            setSelectionStep(3);

                            // type ? handleFinalClickAsset(obj) : handleFinalClick(obj);
                        }}
                    />
                );
            case 3:
                return (
                    <TypeOfAsset
                        handleClick={(obj) =>
                            type === "type"
                                ? handleFinalClickAsset(obj)
                                : type === "split"
                                    ? handleSplit(obj)
                                    : handleFinalClick(obj)
                        }
                        details={details}
                        coins={!selectedTab ? {} : app ? {} : selectedTab.keyId}
                    />
                );

            default:
                break;
        }
    };
    const handleTheme = (first) => {
        let current = localStorage.getItem("theme");
        console.log("THEME", current);

        if (first) {
            if (current === "dark") {
                localStorage.setItem("theme", "dark");
                updateState("currentTheme", "dark");
                document.documentElement.setAttribute("data-theme", "dark");
            } else {
                localStorage.setItem("theme", "light");
                updateState("currentTheme", "light");
                document.documentElement.setAttribute("data-theme", "light");
            }
            return
        }
        if (current === "dark" || !current) {
            localStorage.setItem("theme", "light");
            updateState("currentTheme", "light");
            document.documentElement.setAttribute("data-theme", "light");
        } else {
            localStorage.setItem("theme", "dark");
            updateState("currentTheme", "dark");
            document.documentElement.setAttribute("data-theme", "dark");
        }
    };
    React.useEffect(() => {
        if (app || type) return;
        handleTheme(true);
    }, []);

    const userWallet = useMemo(() => {
        switch (userData11) {
            case "walletUserData":
                return <WalletDashboard setUserData={setUserData} setSelectionStep = {setSelectionStep}/>
            default:
                return <div
                    onClick={() => (type ? closeIt(false) : console.log())}
                    style={type ? { backgroundColor: "transparent" } : {}}
                    className="account-selection"
                >
                    <button
                        onClick={() => setSelectionStep(selectionStep - 1)}
                        disabled={!selectionStep}
                        className={type ? "d-none" : "selection-back"}
                    >
                        Back
                    </button>
                    {/* <button
                        onClick={() => handleTheme()}
                        className={type ? "d-none" : "dual-theme-holder"}
                    >
                        {currentTheme?.toUpperCase()}
                    </button> */}
                    <div onClick={(e) => e.stopPropagation()} className="selection-area">
                        {!registeredApps || !userDetails ? <CardSkeleton /> : renderSteps()}
                    </div>
                    <ToastContainer />
                </div>
        }
    }, [userData11, selectionStep, registeredApps, userDetails, currentTheme, type, app, selectedTab])

    return (
        <div style={{height: '100%'}}>
            {userWallet}
        </div>
    )
}
