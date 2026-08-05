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
import AppsSubDrawer from "./PublicationsSubDrawer";
import "./dashboardApps.scss";
import { Typography } from "antd";
import PublicationsSubDrawer from "./PublicationsSubDrawer";

const Publications = () => {
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
    setRefetchData,
    allPublications,
    setAllPublications,
    selectedPublication,
    setSelectedPublication,
    globalSearch
  } = useContext(GlobalContex);
  // const [allApps, setAllApps] = useState([]);
  const [allApps1, setAllApps1] = useState([]);
  const [loading, setLoading] = useState(false);
  // const [selectedPublication, setSelectedPublication] = useState(null);
  const [userSelectedPublication, setUserSelectedPublication] = useState(null);

  useEffect(() => {
    if (bankerEmail) {
      setLoading(true);
      axios
        .get(
          `https://publications.apimachine.com/publication/email/${bankerEmail}`
        )
        .then(({ data }) => {
          setAllPublications(data.data);
          setSelectedPublication(data.data[0]);
          setLoading(false);
        });
    }
  }, [bankerEmail, refetchData]);

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
                    item.name
                      ?.toLowerCase()
                      .includes(globalSearch.toLowerCase()) ||
                    item._id
                      ?.toLowerCase()
                      .includes(globalSearch.toLowerCase()) ||
                    item.email
                      ?.toLowerCase()
                      .includes(globalSearch.toLowerCase()) ||
                    item?.FounderDetails[0]?.FounderDetails[0]?.name
                      ?.toLowerCase()
                      .includes(globalSearch.toLowerCase()) ||
                    item?.app_code[0]?.app_name
                      ?.toLowerCase()
                      .includes(globalSearch.toLowerCase()) ||
                    item?.app_code[1]?.app_code
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
            <PublicationsSubDrawer
              userSelectedPublication={userSelectedPublication}
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
                allPublications?.length > 0 ? (
                  allPublications.map((item, index) => {
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
              <PublicationsSubDrawer
                selectedPublication={selectedPublication}
                loading={loading}
                setLoading={setLoading}
              />
            </div>
          ) : (
            <PublicationsSubDrawer
              selectedPublication={selectedPublication}
              loading={loading}
              setLoading={setLoading}
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
        {/* <div style={{ textAlign: "left" }}>Founder</div>
        <div style={{ textAlign: "left" }}>App Code</div>
        <div style={{ textAlign: "left" }}>Users</div> */}
        <div style={{ textAlign: "left" }}>Authors</div>
        <div style={{ textAlign: "left" }}>Subscribers</div>
        <div style={{ textAlign: "left" }}>Advertisers</div>
        <div style={{ textAlign: "left" }}>Visitors</div>
        <div style={{ textAlign: "left" }}>Earnings</div>
        <div style={{ textAlign: "left" }}>Engagement</div>
      </div>
    );
  };

  const contentSection = (item, gridClass, gridValues) => {
    return (
      <div
        onClick={(e) => {
          setUserSelectedPublication(item);
          setShowSubDraw(true);
        }}
        className={gridClass}
        style={{
          gridTemplateColumns: gridValues,
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <img
            src={item.profile_pic ? item.profile_pic : defaultImg}
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
              <Paragraph copyable={{ text: item.name }}>{item.name}</Paragraph>
            </div>
            <div className="subtitle">
              <Paragraph copyable={{ text: item?._id }}>
                {item?._id?.substring(0, 10)}...{" "}
              </Paragraph>
            </div>
          </div>
        </div>

        {/* <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-start",
          }}
        >
          <img
            src={
              item?.FounderDetails
                ? item?.FounderDetails[0]?.FounderDetails[0].profile_pic
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
              <Paragraph
                copyable={{
                  text: item?.FounderDetails
                    ? item?.FounderDetails[0]?.FounderDetails[0].name
                    : "--",
                }}
              >
                {item.FounderDetails
                  ? item?.FounderDetails[0]?.FounderDetails[0].name
                  : "--"}
              </Paragraph>
            </div>
            <div className="subtitle">
              <Paragraph copyable={{ text: item.email }}>
                {item.email}
              </Paragraph>
            </div>
          </div>
        </div> */}
        {/* <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-start",
          }}
        >
          <img
            src={item?.app_code ? item?.app_code[2]?.app_icon : defaultImg}
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
              <Paragraph copyable={{ text: item?.app_code ? item?.app_code[0]?.app_name : "" }}>
                {item?.app_code ? item?.app_code[0]?.app_name : ""}
              </Paragraph>
            </div>
            <div className="subtitle">
              <Paragraph copyable={{ text: item?.app_code ? item?.app_code[1]?.app_code : "" }}>
                {item?.app_code ? item?.app_code[1]?.app_code : ""}
              </Paragraph>
            </div>
          </div>
        </div> */}

       
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-start",
          }}
        >
          <div style={{ paddingLeft: "15px", textAlign: "center" }}>
            <div className="title">
              <Paragraph copyable={{ text: item?.PublisherDetails ? item?.PublisherDetails[0]?.publishers?.length : "" }}>{item?.PublisherDetails ? item?.PublisherDetails[0]?.publishers?.length : ""}</Paragraph>
            </div>
            {/* <div className="subtitle">{item?.date}</div> */}
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
              <Paragraph copyable={{ text: item?.usersCount }}>{item?.usersCount}</Paragraph>
            </div>
          </div>
        </div>
        <div style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "flex-start",
        }}>--</div>
        <div style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "flex-start",
        }}>--</div>
        <div style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "flex-start",
        }}>--</div>
        <div style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "flex-start",
        }}>--</div>

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
                justifyContent: "center",
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
        allPublications,
        loading,
        "1.5fr 1fr 1fr 1fr 1fr 1fr 1fr", // Desktop view Grid columns
        "250px 250px 200px 100px 200px" // Mobile view Grid columns
      )}
    </>
  );
};

export default Publications;
