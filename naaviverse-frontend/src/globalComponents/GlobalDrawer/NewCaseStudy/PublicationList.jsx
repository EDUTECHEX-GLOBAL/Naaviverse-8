import axios from "axios";
import React, { Fragment, useEffect, useState } from "react";
import { useContext } from "react";
import Scrollbars from "react-custom-scrollbars";
import Skeleton from "react-loading-skeleton";
import { GlobalContex } from "../../../globalContext";
// import { useAppsList } from "../../../queryHooks";
import defaultImg from "../../../static/images/icons/defaultImg.svg";

const PublicationList = ({ setPublication, onClose }) => {
  const { bankerEmail, selectedApp } = useContext(GlobalContex);
  // const { data: allapps, isLoading: allappsLoading } = useAppsList();
  const [allPublications, setAllPublications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const getAllApps = async () => {
    if(bankerEmail){
    setLoading(true);
    if (selectedApp?.appName === "Authors") {
      axios
        .get(
          `https://publications.apimachine.com/application/publisher/detail/${bankerEmail}`
        )
        .then(({ data }) => {
         
          setAllPublications(data?.data[0]?.PublicationDetails);
          setLoading(false);
        });
    } else {
      const { data } = await axios
        .get(
          `https://publications.apimachine.com/publication/email/${bankerEmail}`
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
        setAllPublications(data.data);
      }
    }
  }
  };

  useEffect(() => {
    getAllApps();
  }, []);

  return (
    <Fragment>
      <div className="titleOp">Select Publication</div>
      <div className="searchWrap">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          type="text"
          placeholder="Search Publication....|"
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
          : selectedApp?.appName === "Authors"
          ? allPublications
              .filter((o) =>
                o.PublicationDetail[0]?.name
                  ?.toLowerCase()
                  .includes(search.toLowerCase())
              )
              .map((item) => (
                <div
                  className="user"
                  key={item._id}
                  onClick={() => {
                    setPublication(item);
                    onClose();
                  }}
                >
                  <img
                    className="dp"
                    src={
                      item?.PublicationDetail[0]?.profile_pic
                        ? item?.PublicationDetail[0]?.profile_pic
                        : defaultImg
                    }
                    alt=""
                  />
                  <div className="userDetail">
                    <div className="name">
                      {item?.PublicationDetail[0]?.name}
                    </div>
                    <div className="email">
                      {item?.PublicationDetail[0]?.fxa_app_id}
                    </div>
                  </div>
                </div>
              ))
          : allPublications
              .filter((o) =>
                o.name?.toLowerCase().includes(search.toLowerCase())
              )
              .map((item) => (
                <div
                  className="user"
                  key={item._id}
                  onClick={() => {
                    setPublication(item);
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
                    <div className="email">{item?.fxa_app_id}</div>
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

export default PublicationList;
