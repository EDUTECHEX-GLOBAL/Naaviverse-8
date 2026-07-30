import axios from "axios";
import React from "react";
import { useContext } from "react";
import { useState } from "react";
import { useEffect } from "react";
import { GlobalContex } from "../../../../globalContext";
import Skeleton from "react-loading-skeleton";

// import defaultImg from "../../../../static/images/icons/app_placeholder.png";
import defaultImg from "../../../../static/images/icons/defaultImg.svg";
import copyIcon from "../../../../static/images/icons/copy.svg";
import AppsSubDrawer from "./UsersSubDrawer";
import "./dashboardApps.scss";
import { Typography } from "antd";
import PublicationsSubDrawer from "./UsersSubDrawer";

const Users = () => {
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
    refetchData,
    selectedPublication,
    globalSearch,
    setRefetchData,
  } = useContext(GlobalContex);
  const [allApps, setAllApps] = useState([]);
  const [allApps1, setAllApps1] = useState([]);
  const [loading, setLoading] = useState(false);
  // const [selectedPublication, setSelectedPublication] = useState(null);
  const [allUsers, setAllUsers] = useState([]);

  // useEffect(() => {
  //   setLoading(true);
  //   axios
  //     .get(
  //       `https://comms.globalxchange.io/coin/vault/service/users/holdings/data/get?app_code=web3today`
  //     )
  //     .then(({ data }) => {
  //       setAllApps(data.users);
  //       setLoading(false);
  //     });
  // }, [bankerEmail, refetchData]);

  useEffect(() => {
    setLoading(true);
    axios
      .get(`https://publications.apimachine.com/userpublication?publication_id=${selectedPublication?._id}`)
      .then(({ data }) => {
        console.log("users-data", data.data)
        setAllUsers(data.data);
        setLoading(false);
      });
  }, [bankerEmail, refetchData, selectedPublication]);

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
            {!dataLoading ? (
              data?.length > 0 ? (
                data.filter(
                  (item) =>
                    item?.userDetail[0]?.first_name
                      ?.toLowerCase()
                      .includes(globalSearch.toLowerCase()) ||
                    item?.userDetail[0]?.last_name
                      ?.toLowerCase()
                      .includes(globalSearch.toLowerCase()) ||
                    item?.userDetail[0]?.username
                      ?.toLowerCase()
                      .includes(globalSearch.toLowerCase()) ||
                    item?.userDetail[0]?.country
                      ?.toLowerCase()
                      .includes(globalSearch.toLowerCase()) ||
                    item?.userDetail[0]?.address
                      ?.toLowerCase()
                      .includes(globalSearch.toLowerCase())
                    ||
                    item?.userDetail[0]?.unique_user_id
                      ?.toLowerCase()
                      .includes(globalSearch.toLowerCase())).map((item) => {
                        const isoDate = new Date(item?.userDetail[0]?.createdAt);
                        const options = { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' };
                        const formattedDate = isoDate.toLocaleDateString('en-US', options).replace(/(\d)(st|nd|rd|th)/, '$1$2 ');
                        return contentSection(item,formattedDate, "listDataGrid", desktopDataGrid);
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
            <PublicationsSubDrawer
              selectedPublication={selectedPublication}
              loading={loading}
              setLoading={setLoading}
            />
          </div>
        </div>

        {/* <div className="mobileWrapper">
          {!showSubDraw ? (
            <div style={{ overflowY: "scroll", height: "80vh" }}>
              {headerSection("listGridMobile", mobileDataGrid)}

              {!loading ? (
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
              <AppsSubDrawer allApps={allApps} />
            </div>
          ) : (
            <AppsSubDrawer allApps={allApps} />
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
        <div style={{ textAlign: "left" }}>User Type</div>
        <div style={{ textAlign: "left" }}>Email</div>
        <div style={{ textAlign: "left" }}>Joined</div>
        <div style={{ textAlign: "left" }}>Points</div>
      </div>
    );
  };

  const contentSection = (item,formattedDate, gridClass, gridValues) => {
    return (
      <div
        // onClick={(e) => {
        //   setSelectedPublication(item);
        //   setShowSubDraw(true);
        // }}
        className={gridClass}
        style={{
          gridTemplateColumns: gridValues,
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <img
            src={
              item?.userDetail[0]?.profile_pic
                ? item?.userDetail[0]?.profile_pic
                : defaultImg
            }
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
              <Paragraph copyable={{ text: item?.userDetail[0]?.first_name + " " + item?.userDetail[0]?.last_name }}>
                {item?.userDetail[0]?.first_name + " " + item?.userDetail[0]?.last_name}
              </Paragraph>
            </div>
            <div className="subtitle">
              <Paragraph copyable={{ text: item?.userDetail[0]?.username }}>
                {item?.userDetail[0]?.username}
              </Paragraph>
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
          <div className="title">
            <Paragraph copyable={{ text: item?.userDetail[0]?.user_type }}>
              {item?.userDetail[0]?.user_type}
            </Paragraph>
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
          <div className="title">
            <Paragraph copyable={{ text: item?.userDetail[0]?.email }}>{item?.userDetail[0]?.email}</Paragraph>
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
          <div className="title">
            <Paragraph copyable={formattedDate}>
              {formattedDate}
            </Paragraph>
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
          <div style={{ textAlign: "center" }}>
            <div className="title">
              <Paragraph copyable={{ text: item?.total_points }}>
                {item?.total_points}
              </Paragraph>
            </div>
            {/* <div className="subtitle">
              <Paragraph copyable={{ text: item?.userDetail[0]?.user_type }}>
                {item?.userDetail[0]?.user_type}
              </Paragraph>
            </div> */}
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
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "flex-start",
              }}
            >
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
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "flex-start",
              }}
            >
              <div className="userDetail">
                <Skeleton width={100} />
                <Skeleton width={120} style={{ height: "10px" }} />
              </div>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div className="userDetail">
                <Skeleton width={100} />
                <Skeleton width={120} style={{ height: "10px" }} />
              </div>
            </div>

            <div className="userDetail">
              <Skeleton width={100} />
              <Skeleton width={120} style={{ height: "10px" }} />
            </div>
          </div>
        );
      });
  };

  return (
    <>
      {conditionalResposiveView(
        allUsers,
        loading,
        "1.5fr 1fr 2fr 1fr 1fr", // Desktop view Grid columns
        "250px 250px 200px 100px 200px" // Mobile view Grid columns
      )}
    </>
  );
};

export default Users;
