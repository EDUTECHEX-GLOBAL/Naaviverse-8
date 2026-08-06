import axios from "axios";
import React, { Fragment, useEffect, useState } from "react";
import { useContext } from "react";
import Scrollbars from "react-custom-scrollbars";
import Skeleton from "react-loading-skeleton";
import { GlobalContex } from "../../../globalContext";
// import { useAppsList } from "../../../queryHooks";

const SelectApp = ({ setSelectedApp, setStep }) => {
  // const { data: allapps, isLoading: allappsLoading } = useAppsList();
  const { bankerEmail } = useContext(GlobalContex);
  const [allApps, setAllApps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const getAllApps = async () => {
    setLoading(true);

    const { data } = await axios
      .get(
        `https://comms.globalxchange.io/gxb/apps/get?created_by=${bankerEmail}`
      )
      .catch((error) => {
        throw new Error(
          error?.response?.data?.message || error.message || "API Error"
        );
      });
    if (!data?.status) {
      throw new Error(data?.message);
    } else {
      setLoading(false);
      setAllApps(data.apps);
    }
  };

  useEffect(() => {
    getAllApps();
  }, []);

  return (
    <Fragment>
      <div className="titleOp" style={{ marginTop: "0px" }}>
        Select App
      </div>
      <div className="searchWrap">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          type="text"
          placeholder="Search Apps....|"
        />
      </div>
      <Scrollbars className="searchList">
        {loading
          ? Array(6)
              .fill("")
              .map((_, i) => (
                <div className="user" key={i}>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <Skeleton className="dp" circle width={50} height={50} />
                    <div className="userDetail">
                      <Skeleton width={100} />
                      <Skeleton width={120} style={{ height: "10px" }} />
                    </div>
                  </div>
                </div>
              ))
          : allApps
              .filter(
                (allapps) =>
                  allapps.app_name
                    ?.toLowerCase()
                    .includes(search.toLowerCase()) ||
                  allapps.created_by
                    ?.toLowerCase()
                    .includes(search.toLowerCase())
              )
              .map((app) => (
                <div
                  className="user"
                  key={app._id}
                  onClick={() => {
                    setSelectedApp(app);
                    setStep("All Revenue Vaults");
                  }}
                >
                  <img className="dp" src={app.app_icon} alt="" />
                  <div className="userDetail">
                    <div className="name">{app.app_name}</div>
                    <div className="email">{app.app_code}</div>
                  </div>
                </div>
              ))}
        <div className="space"></div>
      </Scrollbars>
      {/* <div className="ftBtns">
        <div className="newField" onClick={() => onClose()}>
          Go Back
        </div>
        <div className="btnSubmit" onClick={() => onClose()}>
          Submit
        </div>
      </div> */}
    </Fragment>
  );
};

export default SelectApp;
