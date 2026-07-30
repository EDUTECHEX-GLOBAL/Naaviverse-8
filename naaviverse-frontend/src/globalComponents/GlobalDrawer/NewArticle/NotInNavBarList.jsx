import axios from "axios";
import React, { Fragment, useEffect, useState } from "react";
import { useContext } from "react";
import Scrollbars from "react-custom-scrollbars";
import Skeleton from "react-loading-skeleton";
import { GlobalContex } from "../../../globalContext";
// import { useAppsList } from "../../../queryHooks";
import defaultImg from "../../../static/images/icons/defaultImg.svg";

const NotInNavBarList = ({ navBars, setNavBars,navBarArr, onClose }) => {
  // const { data: allapps, isLoading: allappsLoading } = useAppsList();
  const [allNavs, setAllNavs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const { selectedPublication } = useContext(GlobalContex);

  const getAllApps = async () => {
    setLoading(true);
    const { data } = await axios
      .get(
        `https://publications.apimachine.com/navbar/publication/${selectedPublication?._id}`
      )
      // .get("https://publications.apimachine.com/navbar")
      .catch((error) => {
        throw new Error(
          error?.response?.data?.message || error.message || "API Error"
        );
      });
    if (!data?.status) {
      throw new Error(data?.message);
    } else {
      setLoading(false);
      setAllNavs(data.data);
      setAllNavs(data.data.filter((obj) => !navBarArr.some((item) => obj._id === item._id)))
    }
  };

  useEffect(() => {
    getAllApps();
  }, []);

  return (
    <Fragment>
      <div className="titleOp">Add Navbar</div>
      <div className="searchWrap">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          type="text"
          placeholder="Search Navbar....|"
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
          : allNavs
              .filter((o) =>
                o.navTitle?.toLowerCase().includes(search.toLowerCase())
              )
              .map((item) => (
                <div
                  style={{
                    opacity: navBars.find((o) => o.navTitle === item.navTitle)
                      ? 0.5
                      : 1,
                  }}
                  className="user"
                  key={item._id}
                  onClick={() => {
                    if (navBars.find((o) => o.navTitle === item.navTitle)) {
                      onClose();
                    } else {
                      setNavBars([...navBars, item]);
                      onClose();
                    }
                  }}
                >
                  <img
                    className="dp"
                    src={item?.icon ? item?.icon : defaultImg}
                    alt=""
                  />
                  <div className="userDetail">
                    <div className="name">{item?.navTitle}</div>
                    <div className="email">{item?._id}</div>
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

export default NotInNavBarList;
