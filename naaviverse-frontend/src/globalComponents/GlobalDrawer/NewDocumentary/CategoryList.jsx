import axios from "axios";
import React, { Fragment, useEffect, useState } from "react";
import { useContext } from "react";
import Scrollbars from "react-custom-scrollbars";
import Skeleton from "react-loading-skeleton";
import { GlobalContex } from "../../../globalContext";
// import { useAppsList } from "../../../queryHooks";
import defaultImg from "../../../static/images/icons/defaultImg.svg";

const CategoryList = ({ categories, setCategories, onClose }) => {
  // const { data: allapps, isLoading: allappsLoading } = useAppsList();
  const [allCategory, setAllCategory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const { selectedPublication } = useContext(GlobalContex);

  const getAllApps = async () => {
    setLoading(true);
    const { data } = await axios
      .get(
        `https://publications.apimachine.com/category/publication/${selectedPublication?._id}`
        // `https://publications.apimachine.com/article/publication/${selectedPublication?._id}`
      )
      // .get("https://publications.apimachine.com/category")
      .catch((error) => {
        throw new Error(
          error?.response?.data?.message || error.message || "API Error"
        );
      });
    if (!data?.status) {
      throw new Error(data?.message);
    } else {
      setLoading(false);
      setAllCategory(data.data);
    }
  };

  useEffect(() => {
    getAllApps();
  }, []);

  return (
    <Fragment>
      <div className="titleOp">Add Category</div>
      <div className="searchWrap">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          type="text"
          placeholder="Search Category....|"
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
          : allCategory
              .filter((o) =>
                o.title?.toLowerCase().includes(search.toLowerCase())
              )
              .map((item) => (
                <div
                  style={{
                    opacity: categories.find((o) => o.title === item.title)
                      ? 0.5
                      : 1,
                  }}
                  className="user"
                  key={item._id}
                  onClick={() => {
                    if (categories.find((o) => o.title === item.title)) {
                    } else {
                      setCategories([...categories, item]);
                    }
                  }}
                >
                  <img
                    className="dp"
                    src={item?.thumbnail ? item?.thumbnail : defaultImg}
                    alt=""
                  />
                  <div className="userDetail">
                    <div className="name">{item?.title}</div>
                    <div className="email">{item?._id}</div>
                  </div>
                </div>
              ))}
            
        <div className="space"></div>
      </Scrollbars>
      <div className="ftBtns">
        {/* <div className="newField" onClick={() => onClose()}>
          Go Back
        </div> */}
        <div className="savebtn" onClick={() => onClose()}>
          Save
        </div>
      </div>
    </Fragment>
  );
};

export default CategoryList;
