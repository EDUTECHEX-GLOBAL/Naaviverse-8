import React, { useEffect, useState } from "react";
import "./walletboard.scss";
import { useNavigate, useParams } from "react-router";
import Images from "../../../assets/0-exporter";
import { Context } from "../../../globalComponents/Context/Context";
import DownloadPortal from "./Portals/DownloadPortal/DownloadPortal";
import MainMenu from "./Portals/MainMenu/MainMenu";
import AccountSelection from "../../ScanWallet";
import BondEarningsTable from "../WalletDashboard/BondEarnings/BondEarningsTable"
import LiquidAsset from '../WalletDashboard/LiquidAsset/LiquidAsset';
import MoneyMarketTable from "./MoneyMarket/MoneyMarketTable";
import SplitTable from "./SplitTable/SplitTable";
import { PDFExport, savePDF } from "@progress/kendo-react-pdf";
import { getRegisteredApp, getUserDetails } from "../../../services/getAPIs";



// const WalletDashboard = () => {
//     return (
//         <div className="walletboard">
//             <p>Wallet page</p>
//         </div>
//     )
// }

const WalletDashboard = ({ userData, setUserData, setSelectionStep }) => {
    const downloadRef = React.useRef();
    const history = useNavigate();
    let email = localStorage.getItem("bankerEmailNew");
    let app = localStorage.getItem("app");
    let type = localStorage.getItem("type");
    let subType = localStorage.getItem("subType");
    // const { email, app, type, subType } = useParams();
    const context = React.useContext(Context);
    const {
        tabsConfig,
        selectedTab,
        refreshTable,
        openDownloadTab,
        updateState,
        currencyImageList,
        valueFormatter,
        nameImageList,
        miniTabSelected,
        refresh,
    } = context;
    const [addType, setAddType] = React.useState("");
    const [openMenu, setOpenMenu] = React.useState(false);
    const [splitNum, setSplitNum] = React.useState(0);
    const [registeredApps, setRegisteredApps] = useState(null);
    const [userDetails, setUserDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [appsData , setAppsData] = useState(null)
    const [miniAppsData , setMiniAppsData] = useState(null)

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
    }, []);

    const handlePDFDownload = () => {
        savePDF(downloadRef.current, {
            paperSize: "A1",
            fileName: `${selectedTab.app.app_name}-${type}-${selectedTab.subType} Ledger.pdf`,
        });
    };

    const handleRemoveApp = (obj) => {
        console.log("removeapp" , obj)
        if (tabsConfig.length === 1) {
            localStorage.removeItem("tabsConfig");
            localStorage.removeItem("selectedTab");
            localStorage.removeItem("miniTabSelected");
            localStorage.removeItem("tabApps");
            let tempSub = tabsConfig[0].subTabs;
            tempSub.map((x) => {
                localStorage.removeItem(x?.keyId);
            });
            refresh();
            // history("/apps/wallet-scan/select");
            setUserData("")
            setSelectionStep(0)
            return;
        } else {
            let index = 0;
            let temp = tabsConfig.filter((x, num) => {
                if (x.id === obj.id) {
                    index = num;
                }
                return x.id !== obj.id;
            });
            let nextApp;
            if (index === 0) {
                nextApp = tabsConfig[index + 1];
            } else {
                nextApp = tabsConfig[index - 1];
            }

            updateState("selectedTab", nextApp);
            console.log(nextApp , "nextApp")
            setUserData("walletUserData")
            // history(`/apps/wallet-scan/${email}/${nextApp.id}/${nextApp.subTabs[0].id}`);
            updateState("tabsConfig", [...temp]);
            // console.log(temp, 'temp1');
            localStorage.setItem("tabsConfig", JSON.stringify([...temp]));
            localStorage.setItem("app", nextApp.id);
            localStorage.setItem("type", nextApp.subTabs[0].id);
            localStorage.setItem("subType", nextApp.subTabs[0].type);
            // localStorage.setItem("selectedTab", JSON.stringify(nextApp));
        }
    };
    const handleRemoveType = (obj) => {
        // console.log("removetab" , selectedTab)
        if (selectedTab.subTabs.length === 1) {
            return;
        } else {
            let indexTwo = 0;
            let coin = "";
            let index = tabsConfig.findIndex((x) => {
                return x.id === selectedTab.id;
            });
            let newTab = null;
            let subTabTemp = selectedTab.subTabs.filter((x, num) => {
                if (x.id === obj.id && x.type === obj.type) {
                    indexTwo = num;
                    newTab = selectedTab.subTabs[num - 1];
                }
                return x.id !== obj.id || x.type !== obj.type;
            });
            let keyIdTemp = selectedTab.keyId;
            let temporary = [];
            Object.keys(keyIdTemp).map((x) => {
                if (obj.id === x) {
                    let arr = keyIdTemp[x];
                    if (arr.length === 1) {
                        temporary = [];
                    } else {
                        temporary = arr.filter((y) => {
                            return y !== obj.type;
                        });
                    }
                }
            });
            keyIdTemp[obj.id] = temporary;

            tabsConfig[index] = {
                ...selectedTab,
                subTabs: [...subTabTemp],
                keyId: { ...keyIdTemp },
            };
            updateState("tabsConfig", [...tabsConfig]);
            updateState("selectedTab", {
                ...selectedTab,
                subTabs: [...subTabTemp],
                keyId: { ...keyIdTemp },
            });
            localStorage.setItem("selectedTab", {
                ...selectedTab,
                subTabs: [...subTabTemp],
                keyId: { ...keyIdTemp },
            });
            console.log("selected-tab-remove", selectedTab);
            localStorage.setItem("app", selectedTab.id);
            localStorage.removeItem(miniTabSelected?.keyId);
            updateState("miniTabSelected", { ...newTab });
            console.log("remain", newTab);
            // if (coin !== type) return;
            // history(`/apps/wallet-scan/${email}/${app}/${newTab.id}/${newTab.type}`);
            setUserData("walletUserData")
            // console.log(tabsConfig, 'tabsConfig2')
            localStorage.setItem("tabsConfig", JSON.stringify([...tabsConfig]));
        }
    };
    const removeSubType = (num) => {
        let index = tabsConfig.findIndex((x) => {
            return x.id === selectedTab.id;
        });

        let tempObj = { ...selectedTab };
        tempObj.subTabs[num] = { ...tempObj.subTabs[num], subType: false };
        updateState("selectedTab", { ...tempObj });
        updateState("miniTabSelected", { ...tempObj });
        tabsConfig[index] = { ...tempObj };
        updateState("tabsConfig", [...tabsConfig]);
        // console.log(tabsConfig, 'tabsConfig3')
        localStorage.setItem("tabsConfig", JSON.stringify([...tabsConfig]));
    };
    React.useEffect(() => { }, [miniTabSelected]);
    const handleMenuClick = (obj) => {
        switch (obj.id) {
            case "store":
                break;
            case "refresh":
                updateState("refreshTable", true);
                let a = setTimeout(() => {
                    updateState("refreshTable", null);
                    clearTimeout(a);
                }, 400);
                break;
            case "theatre":
                break;
            case "chats":
                break;
            case "accountant":
                break;
            case "logout":
                localStorage.setItem("theme", "light");
                updateState("currentTheme", "light");
                document.documentElement.setAttribute("data-theme", "light");
                localStorage.clear();
                history("/login");
                break;

            default:
                break;
        }
    };
    const renderAccountSelection = () => {
        switch (addType) {
            case "app":
                return (
                    <AccountSelection
                        type="app"
                        closeIt={() => setAddType("")}
                        app={true}
                    />
                );

                break;
            case "type":
                return (
                    <AccountSelection
                        closeIt={() => setAddType("")}
                        selectedApp={selectedTab.app}
                        // type={true}
                        keyIds={selectedTab.keyId}
                        type="type"
                    />
                );

                break;
            case "split":
                return (
                    <AccountSelection
                        type="split"
                        selectedApp={selectedTab.app}
                        closeIt={() => setAddType("")}
                        splitNum={splitNum}
                    />
                );

            default:
                return "";
        }
    };

    const renderMainTable = () => {
        switch (subType) {
            case "L":
                return (
                    <LiquidAsset
                        downloadRef={downloadRef}
                        split={!miniTabSelected?.subType ? false : true}
                    />
                );
            case "BE":
                return (
                    <BondEarningsTable
                        downloadRef={downloadRef}
                        split={!miniTabSelected?.subType ? false : true}
                        app={app}
                        email={email}
                        coin={type}
                    />
                );
            case "MM":
                return (
                    <MoneyMarketTable
                        downloadRef={downloadRef}
                        split={!miniTabSelected?.subType ? false : true}
                        app={app}
                        email={email}
                        coin={type}
                    />
                );

            default:
                break;
        }
    };
    const handleMiniCard = (obj) => {
        console.log("just now", obj);
        // localStorage.setItem("app", obj.app);
        localStorage.setItem("type", obj.id);
        localStorage.setItem("subType", obj.type);
        updateState("miniTabSelected", obj);
        // history("/TaxChains2")
        setUserData("walletUserData")
        // refresh();
        // history(
        //     `/apps/wallet-scan/${localStorage.getItem("bankerEmailNew")}/${app}/${obj.id}/${obj.type
        //     }`
        // );
    }
    const handleCard = (obj) => {
        console.log(obj, app, "selected-card")
        localStorage.setItem("app", obj.id);
        localStorage.setItem("type", obj.subTabs[0].id);
        localStorage.setItem("subType", obj.subTabs[0].type);
        // if (obj.id === app) return;
        updateState("selectedTab", obj);
        // history("/TaxChains1")
        setUserData("walletUserData")
        // refresh();
        // history(
        //     `/apps/wallet-scan/${localStorage.getItem("bankerEmailNew")}/${obj.id}/${obj.subTabs[0].id}/${obj.subTabs[0].type
        //     }`
        // );
        updateState("miniTabSelected", { ...obj.subTabs[0] });
    };

    React.useEffect(() => {
        if (!tabsConfig.length) {
            // history(`/apps/wallet-scan/select`);
            setUserData("")
        }
    }, []);

    React.useEffect(() => {
        if (!selectedTab) return;
        let tempObj = selectedTab.subTabs.find((x) => {
            return x.id === type && x.type === subType;
        });
        updateState("miniTabSelected", { ...tempObj });
    }, [type]);

    return (
        <div className="dashboard-main">
            {openMenu ? (
                <MainMenu
                    handleClick={handleMenuClick}
                    closeIt={() => setOpenMenu(false)}
                    userDetails={userDetails}
                />
            ) : (
                ""
            )}
            {openDownloadTab ? (
                <DownloadPortal
                    subType={subType}
                    handlePDFDownload={handlePDFDownload}
                    email={email}
                    registeredApps={registeredApps}
                    nameImageList={nameImageList}
                    valueFormatter={valueFormatter}
                    type={type}
                    closeIt={() => updateState("openDownloadTab", false)}
                    selectedTab={selectedTab}
                    userDetails={userDetails}
                />
            ) : (
                ""
            )}
            <div className={addType ? "add-app-modal" : "d-none"}>
                {renderAccountSelection()}
            </div>
            <div className="dashboard-header">
                <div onClick={() => setOpenMenu(true)} className="d-h-title">
                    <img src={Images.walleticon} alt="accounts" />
                </div>
                <div className="d-h-tabs">
                    <div className="d-h-tabs-wrapper">
                        {tabsConfig.map((obj) => (
                            <div
                                onClick={() => handleCard(obj)}
                                className={obj.id === app ? "selected-tab" : ""}
                            >
                                <img
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveApp(obj);
                                    }}
                                    className="cancel"
                                    src={Images.cancel}
                                    alt="cancel"
                                />
                                <h4>
                                    <img className="main-image" src={obj?.app?.app_icon} />{" "}
                                    {obj?.app?.app_name}
                                </h4>
                            </div>
                        ))}
                    </div>
                </div>
                <div onClick={() => setAddType("app")} className="d-h-add">
                    <img src={Images.plus} />
                </div>
            </div>
            <div className="dashboard-sub-header">
                <div className="dashboard-sub-header-wrapper">
                    {!selectedTab
                        ? ""
                        : selectedTab.subTabs.map((obj, num) => {
                            // console.log(selectedTab, "MiniselectedTab")
                            return (
                                <div
                                    onClick={()=>handleMiniCard(obj)}
                                    className={
                                        obj.id === type && obj.type === subType
                                            ? "selected-sub-tab"
                                            : ""
                                    }
                                >
                                    <img
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveType(obj);
                                        }}
                                        className="cancel"
                                        src={Images.cancel}
                                        alt="cancel"
                                    />
                                    <img className="main-image" src={obj.icon} />{" "}
                                    <h6>
                                        {obj.name} {"("}
                                        {obj.type}
                                        {")"}
                                        {obj.subType ? (
                                            <p
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    obj.id === type && obj.type === subType
                                                        ? removeSubType(num)
                                                        : console.log();
                                                }}
                                            >
                                                <img src={obj.subType.coin.icon} />
                                                {obj.subType.coin.name}
                                                <img
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRemoveType(obj);
                                                    }}
                                                    className="cancel"
                                                    src={Images.cancel}
                                                    alt="cancel"
                                                />
                                            </p>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    setAddType("split");
                                                    setSplitNum(num);
                                                }}
                                            >
                                                <img src={Images.plus} />
                                            </button>
                                        )}
                                    </h6>
                                </div>
                            )
                        })}
                </div>
                <div className="dashboard-sub-header-options">
                    <button>
                        <img src={Images.settings} />
                    </button>
                    <button onClick={() => setAddType("type")}>
                        {" "}
                        <img src={Images.plus} />
                    </button>
                </div>
            </div>

            <div className="dashboard-sub-body">
                <div
                    className={`dashboard-main-table ${!miniTabSelected?.subType ? "" : "half-main-table"
                        }`}
                >
                    {renderMainTable()}
                </div>
                <div
                    className={`dashboard-split-table ${!miniTabSelected?.subType ? "" : "full-split-table"
                        }`}
                >
                    {!miniTabSelected?.subType ? (
                        ""
                    ) : (
                        <SplitTable
                            currencyImageList={currencyImageList}
                            config={miniTabSelected?.subType}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}


export default WalletDashboard