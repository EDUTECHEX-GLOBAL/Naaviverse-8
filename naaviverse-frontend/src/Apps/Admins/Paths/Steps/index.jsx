import axios from "axios";
import React from "react";
import { useContext } from "react";
import { useState } from "react";
import { useEffect } from "react";
import { GlobalContex } from "../../../../globalContext";
import Skeleton from "react-loading-skeleton";

import defaultImg from "../../../../static/images/icons/defaultImg.svg";
import "./dashboardApps.scss";

import { Typography } from "antd";
// import AuthorsSubDrawer from "./AuthorsSubDrawer";

const Steps = () => {
    const { Paragraph } = Typography;
    const {
        loginData,
        bankerEmail,
        selectedMcbDashboardApp,
        setSelectedMcbDashboardApp,
        showSubDraw,
        setShowSubDraw,
        refetchAppData,
        setSelectedTab,
        mcbMenu,
        isMobile,
        selectedPublication,
        globalSearch,
        refetchAuthors,
        setRefetchAuthors,
    } = useContext(GlobalContex);
    const [allApps, setAllApps] = useState([]);
    const [allApps1, setAllApps1] = useState([]);
    const [appLoading, setAppLoading] = useState(false);

    const [selectedAuthor, setSlectedAuthor] = useState(null);
    const [loading, setLoading] = useState(false);
    // const [refetchAuthors, setRefetchAuthors] = useState(false);

    useEffect(() => {
        setLoading(true);
        axios
            .get(
                `https://careers.marketsverse.com/steps/get`
            )
            // .get(`https://publications.apimachine.com/publisher/`)
            .then(({ data }) => {
                setAllApps(data.data);
                setLoading(false);
            });
    }, [bankerEmail, refetchAuthors, selectedPublication]);

    const conditionalResposiveView = (
        data,
        dataLoading,
        desktopDataGrid,
        mobileDataGrid
    ) => {
        return (
            <>
                <div className="desktopWrapper">
                    <div style={{ width: "100%" }}>
                        {headerSection("listGrid", desktopDataGrid)}
                    </div>
                    <div
                        style={{
                            // display: "flex",
                            fontWeight: 700,
                            fontSize: "20px",
                            height: window.innerHeight - 175,
                            overflowY: "scroll",
                        }}
                    >
                        {!loading ? (
                            data?.length > 0 ? (
                                data.filter(
                                    (item) =>
                                        item.name
                                            ?.toLowerCase()
                                            .includes(globalSearch.toLowerCase()) ||
                                        item.email
                                            ?.toLowerCase()
                                            .includes(globalSearch.toLowerCase())).map((item) => {
                                                return contentSection(item, "listDataGrid", desktopDataGrid);
                                            })
                            ) : (
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        height: "60vh",
                                    }}
                                >
                                    No Records Found
                                </div>
                            )
                        ) : (
                            loadingSection("listDataGrid", desktopDataGrid)
                        )}
                        {/* <AuthorsSubDrawer
              selectedAuthor={selectedAuthor}
              loading={loading}
              setLoading={setLoading}
              setRefetchAuthors={setRefetchAuthors}
            /> */}
                    </div>
                </div>

                {/* <div className="mobileWrapper">
          {!showSubDraw ? (
            <div style={{ overflowY: "scroll", height: "80vh" }}>
              {headerSection("listGridMobile", mobileDataGrid)}

              {!appLoading ? (
                allApps?.length > 0 ? (
                  allApps.map((item, index) => {
                    return contentSection(
                      item,
                      "listDataGridMobile",
                      mobileDataGrid
                    );
                  })
                ) : (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "60vh",
                    }}
                  >
                    No Records Found
                  </div>
                )
              ) : (
                loadingSection("listDataGrid", mobileDataGrid)
              )}
              <AuthorsSubDrawer
                selectedAuthor={selectedAuthor}
                loading={loading}
                setLoading={setLoading}
                setRefetchAuthors={setRefetchAuthors}
              />
            </div>
          ) : (
            <AuthorsSubDrawer
              selectedAuthor={selectedAuthor}
              loading={loading}
              setLoading={setLoading}
              setRefetchAuthors={setRefetchAuthors}
            />
          )}
        </div> */}
            </>
        );
    };

    // Change these three Sections according to the design

    const headerSection = (gridClass, gridValues) => {
        return (
            <div className={gridClass} style={{ gridTemplateColumns: gridValues }}>
                <div>Name</div>
                <div style={{ textAlign: "left" }}>Country</div>
                <div style={{ textAlign: "left" }}>Type</div>
                <div style={{ textAlign: "left" }}>Cost Structure</div>
                <div style={{ textAlign: "left" }}>Vendors</div>
                <div style={{ textAlign: "left" }}>Mentors</div>
                <div style={{ textAlign: "left" }}>Micro Steps</div>
            </div>
        );
    };

    const contentSection = (item, gridClass, gridValues) => {
        console.log(item, "item")
        return (
            <div style={{ height: "250px", borderBottom: "solid 0.5px #E7E7E7" }}>
                <div
                    onClick={(e) => {
                        setSlectedAuthor(item);
                        setShowSubDraw(true);
                    }}
                    className={gridClass}
                    style={{
                        gridTemplateColumns: gridValues,
                        border: "none"
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <img
                            src={item.icon ? item.icon : defaultImg}
                            alt=""
                            style={{
                                // borderRadius: "50%",
                                width: "30px",
                                height: "30px",
                            }}
                        // className={classNames.icon}
                        />
                        <div style={{ paddingLeft: "15px" }}>
                            <div className="title">
                                {item?.name}
                                {/* <Paragraph copyable={{ text: item.name }}>{item.name}</Paragraph> */}
                            </div>
                            <div className="subtitle">
                                {item?._id}
                                {/* <Paragraph copyable={{ text: item._id }}>
                                {item._id}
                            </Paragraph> */}
                            </div>
                        </div>
                    </div>
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "flex-start",
                        }}
                    >
                        <div style={{ textAlign: "right" }}>
                            <div className="title">
                                {item?.country}
                            </div>
                        </div>
                    </div>
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "flex-start",
                        }}
                    >
                        <div style={{ textAlign: "right" }}>
                            <div className="title">
                                {item?.type}
                            </div>
                        </div>
                    </div>
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "flex-start",
                        }}
                    >
                        <div style={{ textAlign: "right" }}>
                            <div className="title">
                                {item?.cost}
                            </div>
                        </div>
                    </div>
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "flex-start",
                        }}
                    >
                        <div style={{ textAlign: "right" }}>
                            <div className="title">
                                {item?.vendors.length}
                            </div>
                        </div>
                    </div>
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "flex-start",
                        }}
                    >
                        <div style={{ textAlign: "right" }}>
                            <div className="title">
                                {item?.Mentors.length}
                            </div>
                        </div>
                    </div>
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "flex-start",
                        }}
                    >
                        <div style={{ textAlign: "right" }}>
                            <div className="title">
                                {item?.microsteps.length}
                            </div>
                        </div>
                    </div>
                </div>
                <div
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "flex-start",
                        padding: "5px 30px"
                    }}
                >
                    <div style={{ textAlign: "left" }}>
                        <div className="title" style={{ fontSize: "0.9rem", fontWeight: 600, color: "#18191D",marginBottom:"10px" }}>
                            Description
                        </div>
                        <div className="subtitle" style={{ fontSize: "0.65rem", fontWeight: 400, color: "#18191D"}}>
                            {item?.description}
                        </div>
                    </div>
                </div>
                <div
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        padding: "5px 30px",
                        marginTop:"40px"
                    }}
                >
                    <div className="actionBtn" style={{ textAlign: "right" }}>
                        Actions
                    </div>
                </div>
            </div>
        );
    };

    const loadingSection = (gridClass, gridValues) => {
        return Array(10)
            .fill("")
            .map((item, i) => {
                return (
                    <div
                        className={gridClass}
                        style={{
                            width: "100%",
                            gridTemplateColumns: gridValues,
                            // borderBottom: "solid 0.5px #EEEEEE",
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <Skeleton
                                className="dp"
                                circle
                                width={50}
                                height={50}
                                style={{ marginRight: "20px" }}
                            />
                            <div className="userDetail">
                                <Skeleton width={100} />
                                <Skeleton width={120} style={{ height: "10px" }} />
                            </div>
                        </div>
                    </div>
                );
            });
    };

    return (
        <>
            {conditionalResposiveView(
                allApps,
                appLoading,
                "1.2fr 1fr 1fr 1fr 0.4fr 0.4fr 0.4fr", // Desktop view Grid columns
                "250px" // Mobile view Grid columns
            )}
        </>
    );
};

export default Steps;
