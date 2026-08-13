import axios from "axios";
import React, { Fragment, useEffect, useState } from "react";
import Scrollbars from "react-custom-scrollbars";
import Skeleton from "react-loading-skeleton";
// import { useAppsList } from "../../../queryHooks";

function AppList({ setApp, onClose }) {
  // const { data: allapps, isLoading: allappsLoading } = useAppsList();
  const [allApps, setAllApps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const getAllApps = async () => {
    setLoading(true);
    const { data } = await axios
      .get("https://comms.globalxchange.io/gxb/apps/get")
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
      <div className="titleOp">Select App</div>
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
                  <Skeleton className="dp" circle />
                  <div className="userDetail">
                    <Skeleton className="name" width={200} />
                    <Skeleton className="email" width={200} />
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
                    setApp(app);
                    onClose();
                  }}
                >
                  <img className="dp" src={app.app_icon} alt="" />
                  <div className="userDetail">
                    <div className="name">{app.app_name}</div>
                    <div className="email">{app.created_by}</div>
                  </div>
                </div>
              ))}
        <div className="space"></div>
      </Scrollbars>
      <div className="ftBtns">
        <div className="newField" onClick={() => onClose()}>
          Go Back
        </div>
        <div className="btnSubmit" onClick={() => onClose()}>
          Submit
        </div>
      </div>
    </Fragment>
  );
}

export default AppList;
