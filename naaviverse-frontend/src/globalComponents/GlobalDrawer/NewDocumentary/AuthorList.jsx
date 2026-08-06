import axios from "axios";
import React, { Fragment, useEffect, useState } from "react";
import Scrollbars from "react-custom-scrollbars";
import Skeleton from "react-loading-skeleton";
// import { useAppsList } from "../../../queryHooks";
import defaultImg from "../../../static/images/icons/defaultImg.svg";

const AuthorList = ({ setAuthor, onClose }) => {
  // const { data: allapps, isLoading: allappsLoading } = useAppsList();
  const [allAuthor, setAllAuthor] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const getAllApps = async () => {
    setLoading(true);
    const { data } = await axios
      .get("https://publications.apimachine.com/publisher/")
      .catch((error) => {
        throw new Error(
          error?.response?.data?.message || error.message || "API Error"
        );
      });
    if (!data?.status) {
      throw new Error(data?.message);
    } else {
      setLoading(false);
      setAllAuthor(data.data);
    }
  };

  useEffect(() => {
    getAllApps();
  }, []);

  return (
    <Fragment>
      <div className="titleOp">Select Author</div>
      <div className="searchWrap">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          type="text"
          placeholder="Search Author....|"
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
          : allAuthor
              .filter((o) =>
                o.name?.toLowerCase().includes(search.toLowerCase())
              )
              .map((item) => (
                <div
                  className="user"
                  key={item._id}
                  onClick={() => {
                    setAuthor(item);
                    onClose();
                  }}
                >
                  <img
                    className="dp"
                    src={item?.profile_pic ? item?.profile_pic : defaultImg}
                    alt=""
                  />
                  <div className="userDetail">
                    <div className="name">{item?.name}</div>
                    <div className="email">{item?.email}</div>
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

export default AuthorList;
