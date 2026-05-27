import Axios from "axios";
import React, { Fragment, useEffect, useState } from "react";
import Scrollbars from "react-custom-scrollbars";
import Skeleton from "react-loading-skeleton";

const CategoriesList = ({ setCategories, categories, onClose }) => {
  const [allCategories, setAllCategories] = useState([]);
  const [assetLoading, setAssetLoading] = useState(true);
  useEffect(() => {
    Axios.get("https://comms.globalxchange.io/gxb/apps/category/get")
      .then((res) => {
        if (res.data.status) {
          setAllCategories(res.data.categories);
        }
      })
      .finally(() => setAssetLoading(false));
  }, []);
  const [search, setSearch] = useState("");
  return (
    <Fragment>
      <div className="titleOp">Select Category</div>
      <div className="searchWrap">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          type="text"
          placeholder="Search Category....|"
        />
      </div>
      <Scrollbars className="searchList">
        {assetLoading
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
          : allCategories
              .filter((item) =>
                item.name?.toLowerCase().includes(search.toLowerCase())
              )
              .map((item) => (
                <div
                  className="user"
                  key={item._id}
                  onClick={() => {
                    setCategories([...categories, item]);
                    onClose();
                  }}
                >
                  <img className="dp" src={item.icon} alt="" />
                  <div className="userDetail">
                    <div className="name">{item.name}</div>
                    <div className="email" style={{ fontSize: "12px" }}>
                      {item.category_id}
                    </div>
                  </div>
                </div>
              ))}
        <div className="space"></div>
      </Scrollbars>
    </Fragment>
  );
};

export default CategoriesList;
